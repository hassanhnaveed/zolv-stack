/**
 * `npm run seo:check` — runs the full SEO validation suite, writes
 * `reports/seo-audit.json` + `reports/seo-audit.md`, and exits nonzero
 * when any validation error is found (warnings never fail the build).
 *
 * The audit report is written even on failure so CI artifacts always
 * reflect the latest state (spec: "report generated even when validation
 * fails").
 *
 * Run via `tsx` (devDependency) rather than `npx tsx` so this never
 * attempts an ad hoc download in CI or a clean install.
 */

import { runSeoAudit } from "../lib/seo/audit";

function main(): void {
  const { report, hasFailures, jsonPath, markdownPath } = runSeoAudit();
  const { summary } = report;

  console.log(
    `SEO audit: ${summary.totalRoutes} routes, ${summary.indexedRoutes} indexed, ` +
      `${summary.sitemapRoutes} in sitemap, ${summary.excludedRoutes} excluded.`,
  );
  console.log(
    `Origin: ${summary.environment.origin ?? "unresolved"} ` +
      `(NODE_ENV=${summary.environment.nodeEnv}, ` +
      `recognizedProduction=${summary.environment.isRecognizedProduction}, ` +
      `effectiveIndexingActive=${summary.environment.effectiveIndexingActive})`,
  );
  console.log(
    `Verification — google: ${summary.verification.google}, bing: ${summary.verification.bing}`,
  );
  console.log(`Issues: ${summary.errorCount} error(s), ${summary.warningCount} warning(s).`);
  console.log(`Report written to:\n  ${jsonPath}\n  ${markdownPath}`);

  if (report.warnings.length > 0) {
    console.warn("\nWarnings:");
    for (const warning of report.warnings) {
      console.warn(`  [${warning.code}] ${warning.message}`);
    }
  }

  if (hasFailures) {
    console.error("\nErrors:");
    for (const error of report.errors) {
      console.error(`  [${error.code}] ${error.message}`);
    }
    console.error("\nseo:check failed — see errors above.");
    process.exitCode = 1;
    return;
  }

  console.log("\nseo:check passed.");
}

main();
