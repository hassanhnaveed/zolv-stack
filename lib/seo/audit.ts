/**
 * Audit report generation for the `lib/seo/*` module (SEO Architecture
 * v1.0, Task 3). Server/Node-only — this module reads env config and
 * writes files under `reports/`; never import it from a client component.
 *
 * `buildAuditReport()` and `renderAuditMarkdown()` are pure (no I/O), so
 * they're cheap to unit test. Only `writeAuditReport()` / `runSeoAudit()`
 * touch the filesystem — that split keeps most of the audit logic testable
 * without a real disk.
 *
 * The report is generated even when validation fails (spec: "report
 * generated even when validation fails"); `scripts/seo-check.ts` is
 * responsible for turning `hasFailures` into a nonzero process exit code.
 */

import fs from "node:fs";
import path from "node:path";

import { getErrorMessage } from "../utils";

import { getSeoConfig, isProductionSeoEnvironment } from "./config";
import { resolveIndexFlags } from "./indexability";
import { getRedirects, type RedirectRule } from "./redirects";
import { listRoutes } from "./routes";
import type { PageType, ProductId, SeoRoute } from "./types";
import { getSiteOrigin, absoluteUrl } from "./url";
import {
  isPlaceholderVerificationToken,
  partitionValidationIssues,
  validateSeo,
  type ValidationIssue,
  type VerificationConfig,
} from "./validate";

/** Per-route entry in the audit report. */
export interface SeoAuditRouteEntry {
  id: string;
  path: string;
  pageType: PageType;
  product?: ProductId;
  /** Declared intent stored on the route (`routes.ts`). */
  declaredIndex: boolean;
  declaredSitemap: boolean;
  /** Fail-closed effective state (`indexability.ts`). */
  effectiveIndex: boolean;
  effectiveSitemap: boolean;
  /** Absolute canonical URL, or `null` when the site origin could not be
   * resolved (see `summary.environment.originError`). */
  canonical: string | null;
  /** Present only when `effectiveIndex` is `false`; explains why. */
  exclusionReason?: string;
}

/** Verification token health per search engine. */
export type VerificationHealth = "configured" | "missing" | "placeholder";

export interface SeoAuditVerificationSummary {
  google: VerificationHealth;
  bing: VerificationHealth;
}

export interface SeoAuditEnvironmentSummary {
  nodeEnv: string;
  /** Whether the process is a recognized production SEO environment
   * (`config.ts#isProductionSeoEnvironment`). */
  isRecognizedProduction: boolean;
  /** Raw `SEO_INDEXING_ENABLED` opt-in flag. */
  indexingEnabledFlag: boolean;
  /** Site-wide fail-closed gate (`indexability.ts#isSeoIndexingEnabled`). */
  effectiveIndexingActive: boolean;
  /** Resolved site origin, or `null` when unresolved. */
  origin: string | null;
  /** Present only when `origin` is `null`. */
  originError?: string;
}

export interface SeoAuditSummary {
  totalRoutes: number;
  /** Effectively indexable routes right now (fail-closed aware). */
  indexedRoutes: number;
  /** Effectively in the sitemap right now. */
  sitemapRoutes: number;
  excludedRoutes: number;
  /** Distinct resolvable canonical URLs across all routes. */
  canonicalCount: number;
  errorCount: number;
  warningCount: number;
  verification: SeoAuditVerificationSummary;
  environment: SeoAuditEnvironmentSummary;
}

/** Full audit report: JSON-serializable and rendered to Markdown via
 * {@link renderAuditMarkdown}. */
export interface SeoAuditReport {
  summary: SeoAuditSummary;
  /** Sorted by `id` — deterministic, diff-friendly ordering. */
  routes: SeoAuditRouteEntry[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

/** Options accepted by {@link buildAuditReport}. Every field defaults to
 * the real, live `lib/seo/*` data. Indexing / `NODE_ENV` are always read
 * from the live process env (same source as {@link resolveIndexFlags}) so
 * summary and per-route effective flags cannot disagree. Only verification
 * tokens may be overridden for fixtures. */
export interface BuildAuditReportOptions {
  routes?: readonly SeoRoute[];
  redirects?: readonly RedirectRule[];
  config?: VerificationConfig;
}

interface OriginResolution {
  origin: string | null;
  originError?: string;
}

function resolveOrigin(): OriginResolution {
  try {
    return { origin: getSiteOrigin().origin };
  } catch (error) {
    return { origin: null, originError: getErrorMessage(error) };
  }
}

interface ExclusionContext {
  isRecognizedProduction: boolean;
  indexingEnabledFlag: boolean;
}

function describeExclusionReason(
  route: SeoRoute,
  effectiveIndex: boolean,
  context: ExclusionContext,
): string | undefined {
  if (effectiveIndex) return undefined;
  if (!route.index) return "not opted in (route.index=false)";
  if (!context.isRecognizedProduction) {
    return "fail-closed: not a recognized production environment";
  }
  if (!context.indexingEnabledFlag) {
    return "fail-closed: SEO_INDEXING_ENABLED is not true";
  }
  return "excluded (fail-closed indexing gate inactive)";
}

function buildRouteEntry(
  route: SeoRoute,
  origin: string | null,
  context: ExclusionContext,
): SeoAuditRouteEntry {
  const flags = resolveIndexFlags(route);
  const canonical = origin ? absoluteUrl(route.path) : null;

  return {
    id: route.id,
    path: route.path,
    pageType: route.pageType,
    product: route.product,
    declaredIndex: route.index,
    declaredSitemap: route.sitemap,
    effectiveIndex: flags.index,
    effectiveSitemap: flags.sitemap,
    canonical,
    exclusionReason: describeExclusionReason(route, flags.index, context),
  };
}

function describeVerificationHealth(token: string | undefined): VerificationHealth {
  if (!token) return "missing";
  return isPlaceholderVerificationToken(token) ? "placeholder" : "configured";
}

function compareRouteEntries(a: SeoAuditRouteEntry, b: SeoAuditRouteEntry): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Builds the full {@link SeoAuditReport} from live (or fixture) SEO data.
 * Pure — performs no filesystem I/O. Never throws: an unresolved site
 * origin degrades to `canonical: null` entries plus a
 * `seo/origin-unresolved` error, rather than crashing the audit.
 */
export function buildAuditReport(
  options: BuildAuditReportOptions = {},
): SeoAuditReport {
  const routes = options.routes ?? listRoutes();
  const redirects = options.redirects ?? getRedirects();
  const liveConfig = getSeoConfig();
  // Verification tokens may be overridden for fixtures; indexing / NODE_ENV
  // always come from live process env so summary.environment and per-route
  // resolveIndexFlags() stay consistent.
  const verification: VerificationConfig = {
    googleSiteVerification:
      options.config?.googleSiteVerification ?? liveConfig.googleSiteVerification,
    bingSiteVerification:
      options.config?.bingSiteVerification ?? liveConfig.bingSiteVerification,
  };
  const nodeEnv = liveConfig.nodeEnv;
  const indexingEnabled = liveConfig.indexingEnabled;

  const issues = validateSeo({ routes, redirects, config: verification });
  const { errors, warnings } = partitionValidationIssues(issues);

  const { origin, originError } = resolveOrigin();
  const isRecognizedProduction = isProductionSeoEnvironment();
  const exclusionContext: ExclusionContext = {
    isRecognizedProduction,
    indexingEnabledFlag: indexingEnabled,
  };

  const routeEntries = routes
    .map((route) => buildRouteEntry(route, origin, exclusionContext))
    .sort(compareRouteEntries);

  const indexedRoutes = routeEntries.filter((entry) => entry.effectiveIndex).length;
  const sitemapRoutes = routeEntries.filter((entry) => entry.effectiveSitemap).length;
  const canonicalCount = new Set(
    routeEntries.map((entry) => entry.canonical).filter((value): value is string => Boolean(value)),
  ).size;

  const summary: SeoAuditSummary = {
    totalRoutes: routes.length,
    indexedRoutes,
    sitemapRoutes,
    excludedRoutes: routes.length - indexedRoutes,
    canonicalCount,
    errorCount: errors.length,
    warningCount: warnings.length,
    verification: {
      google: describeVerificationHealth(verification.googleSiteVerification),
      bing: describeVerificationHealth(verification.bingSiteVerification),
    },
    environment: {
      nodeEnv,
      isRecognizedProduction,
      indexingEnabledFlag: indexingEnabled,
      effectiveIndexingActive: isRecognizedProduction && indexingEnabled,
      origin,
      originError,
    },
  };

  return { summary, routes: routeEntries, errors, warnings };
}

function formatBoolean(value: boolean): string {
  return value ? "yes" : "no";
}

function renderRouteTableRow(entry: SeoAuditRouteEntry): string {
  const canonical = entry.canonical ?? "_unresolved_";
  const reason = entry.exclusionReason ?? "";
  return `| \`${entry.id}\` | \`${entry.path}\` | ${entry.pageType} | ${formatBoolean(entry.effectiveIndex)} | ${formatBoolean(entry.effectiveSitemap)} | ${canonical} | ${reason} |`;
}

function renderIssueList(issues: readonly ValidationIssue[]): string {
  if (issues.length === 0) return "_None._";
  return issues
    .map((issue) => `- \`${issue.code}\`${issue.routeId ? ` (\`${issue.routeId}\`)` : ""}: ${issue.message}`)
    .join("\n");
}

/**
 * Renders a {@link SeoAuditReport} as human-readable Markdown. Pure
 * string formatting over already-sorted report data — output is
 * deterministic for a given report (no timestamps).
 */
export function renderAuditMarkdown(report: SeoAuditReport): string {
  const { summary } = report;

  const lines: string[] = [
    "# SEO Audit Report",
    "",
    "## Summary",
    "",
    `- Total routes: ${summary.totalRoutes}`,
    `- Indexed (effective): ${summary.indexedRoutes}`,
    `- In sitemap (effective): ${summary.sitemapRoutes}`,
    `- Excluded: ${summary.excludedRoutes}`,
    `- Distinct resolvable canonicals: ${summary.canonicalCount}`,
    `- Errors: ${summary.errorCount}`,
    `- Warnings: ${summary.warningCount}`,
    "",
    "## Environment",
    "",
    `- \`NODE_ENV\`: ${summary.environment.nodeEnv}`,
    `- Recognized production SEO environment: ${formatBoolean(summary.environment.isRecognizedProduction)}`,
    `- \`SEO_INDEXING_ENABLED\`: ${formatBoolean(summary.environment.indexingEnabledFlag)}`,
    `- Effective indexing active: ${formatBoolean(summary.environment.effectiveIndexingActive)}`,
    `- Origin: ${summary.environment.origin ?? "_unresolved_"}`,
    ...(summary.environment.originError
      ? [`- Origin error: ${summary.environment.originError}`]
      : []),
    "",
    "## Verification health",
    "",
    `- Google Search Console: ${summary.verification.google}`,
    `- Bing Webmaster Tools: ${summary.verification.bing}`,
    "",
    "## Routes",
    "",
    "| Route | Path | Page type | Indexed | In sitemap | Canonical | Exclusion reason |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...report.routes.map(renderRouteTableRow),
    "",
    "## Errors",
    "",
    renderIssueList(report.errors),
    "",
    "## Warnings",
    "",
    renderIssueList(report.warnings),
    "",
  ];

  return `${lines.join("\n")}\n`;
}

/** Report file paths, relative to the process cwd unless overridden by
 * {@link WriteAuditReportOptions.cwd}. */
export const DEFAULT_AUDIT_JSON_PATH = "reports/seo-audit.json";
export const DEFAULT_AUDIT_MARKDOWN_PATH = "reports/seo-audit.md";

export interface WriteAuditReportOptions {
  jsonPath?: string;
  markdownPath?: string;
  /** Base directory report paths are resolved against. Defaults to
   * `process.cwd()`; tests override with a temp directory. */
  cwd?: string;
}

export interface WrittenAuditReportPaths {
  jsonPath: string;
  markdownPath: string;
}

/**
 * Writes `report` as both JSON and Markdown to disk, creating parent
 * directories as needed. Returns the resolved absolute paths written.
 */
export function writeAuditReport(
  report: SeoAuditReport,
  options: WriteAuditReportOptions = {},
): WrittenAuditReportPaths {
  const cwd = options.cwd ?? process.cwd();
  const jsonPath = path.resolve(cwd, options.jsonPath ?? DEFAULT_AUDIT_JSON_PATH);
  const markdownPath = path.resolve(
    cwd,
    options.markdownPath ?? DEFAULT_AUDIT_MARKDOWN_PATH,
  );

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(markdownPath), { recursive: true });

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownPath, renderAuditMarkdown(report), "utf8");

  return { jsonPath, markdownPath };
}

export interface RunSeoAuditOptions
  extends BuildAuditReportOptions,
    WriteAuditReportOptions {}

export interface RunSeoAuditResult extends WrittenAuditReportPaths {
  report: SeoAuditReport;
  /** `true` when `report.errors` is non-empty; callers (the CLI) should
   * exit nonzero in that case. Warnings never cause a nonzero exit. */
  hasFailures: boolean;
}

/**
 * Builds the audit report and writes both output files in one call. The
 * report is always written, even when `hasFailures` is `true` — the CLI
 * is responsible for turning that into a nonzero process exit code.
 */
export function runSeoAudit(options: RunSeoAuditOptions = {}): RunSeoAuditResult {
  const report = buildAuditReport(options);
  const { jsonPath, markdownPath } = writeAuditReport(report, options);

  return {
    report,
    hasFailures: report.errors.length > 0,
    jsonPath,
    markdownPath,
  };
}
