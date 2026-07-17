/**
 * Public barrel for `lib/seo/*`. Server-only — never import this module
 * (or any `lib/seo/*` module) from a client component.
 *
 * Explicit named exports only. Do **not** reintroduce `export *` as the
 * framework grows — keep this list as the curated public API surface so
 * internal helpers stay unexported.
 *
 * Task 1 surface: types, config, brands, and URL helpers. Task 2 adds the
 * route registry, redirect manifest, and indexability helpers. Task 3
 * adds the aggregate validator and audit report builder. Task 4 adds the
 * metadata + Open Graph/Twitter builders (`buildRootMetadata`,
 * `buildMetadataForRoute`, `resolveOgImages`, and the normalized social
 * metadata helpers). Later tasks extend this list deliberately when new
 * public APIs land.
 *
 * Internal validators (`assertValidRoutes`, `assertValidRedirects`, and
 * the individual per-concern validators in `validate.ts`) are
 * intentionally omitted — import them from their modules only when needed
 * (e.g. unit tests). Only the aggregate `validateSeo` and the audit report
 * builders are part of the public surface.
 */

// Types
export type {
  BrandId,
  ChangeFrequency,
  FaqEntry,
  IndexFlags,
  Locale,
  LocaleTag,
  PageType,
  ProductId,
  SeoRoute,
  SiteOrigin,
  SocialImage,
} from "./types";

// Config
export type { SeoConfig } from "./config";
export { getSeoConfig, isProductionSeoEnvironment } from "./config";

// Brands
export type { Brand } from "./brands";
export {
  BRANDS,
  FILEORA_BRAND,
  PRODUCT_BRANDS,
  ZOLVSTACK_BRAND,
  brandHomeTitle,
  brandStaticTitle,
  getBrand,
  getProductBrand,
  productHubTitle,
  productToolTitle,
} from "./brands";

// URL helpers
export { absoluteUrl, getSiteOrigin } from "./url";

// Route registry
export type { RouteId } from "./routes";
export {
  PATHS,
  RESERVED_PATHS,
  ROUTE_IDS,
  ROUTES,
  getRoute,
  isReservedPath,
  listRoutes,
} from "./routes";

// Redirect manifest
export type { RedirectRule } from "./redirects";
export { getNextRedirects, getRedirects } from "./redirects";

// Indexability helpers
export {
  getRobotsDirective,
  isRouteIndexable,
  isRouteInSitemap,
  isSeoIndexingEnabled,
  listIndexableRoutes,
  listSitemapRoutes,
  resolveIndexFlags,
} from "./indexability";

// Validation
export type { ValidateSeoOptions, ValidationIssue, ValidationSeverity } from "./validate";
export { partitionValidationIssues, validateSeo } from "./validate";

// Audit report
export type {
  BuildAuditReportOptions,
  RunSeoAuditOptions,
  RunSeoAuditResult,
  SeoAuditEnvironmentSummary,
  SeoAuditReport,
  SeoAuditRouteEntry,
  SeoAuditSummary,
  SeoAuditVerificationSummary,
  VerificationHealth,
  WriteAuditReportOptions,
  WrittenAuditReportPaths,
} from "./audit";
export {
  DEFAULT_AUDIT_JSON_PATH,
  DEFAULT_AUDIT_MARKDOWN_PATH,
  buildAuditReport,
  renderAuditMarkdown,
  runSeoAudit,
  writeAuditReport,
} from "./audit";

// Alternates (canonical + language self-references)
export type { RouteAlternates } from "./alternates";
export { buildAlternates } from "./alternates";

// Open Graph / Twitter normalized social metadata
export type { SocialMetadata, BuildSocialMetadataInput } from "./open-graph";
export { buildSocialMetadata, toOpenGraph, toTwitter } from "./open-graph";

// Static OG/Twitter social-card resolvers
export { OG_ASSET_VERSION, resolveOgImages } from "./og";

// Metadata builder
export { buildMetadataForRoute, buildRootMetadata } from "./metadata";
