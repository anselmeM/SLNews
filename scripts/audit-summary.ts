// Writes the scheduled audit report. Kept thin: the logic lives in
// `src/lib/audit-summary.ts`, where it is tested.
//
// Usage (from the dependency-audit workflow):
//   npm audit --omit=dev --audit-level=high --json > audit.json || true
//   npm audit --omit=dev --audit-level=high > audit.txt || true
//   npx tsx scripts/audit-summary.ts
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { parseAuditReport, summariseAudit, toEnvFile } from "../src/lib/audit-summary";

const jsonPath = process.env.AUDIT_JSON ?? "audit.json";
const textPath = process.env.AUDIT_TEXT ?? "audit.txt";

if (!existsSync(jsonPath)) {
  console.error(`${jsonPath} not found: run \`npm audit --omit=dev --json\` first.`);
  process.exit(1);
}

let report;
try {
  report = parseAuditReport(readFileSync(jsonPath));
} catch (error) {
  console.error(`could not parse ${jsonPath}:`, error);
  process.exit(1);
}

const rawText = existsSync(textPath) ? readFileSync(textPath, "utf8") : undefined;
const summary = summariseAudit(report, { rawText });

writeFileSync("audit-report.md", summary.markdown);
if (process.env.GITHUB_ENV) appendFileSync(process.env.GITHUB_ENV, toEnvFile(summary));

console.log(
  `advisories: ${summary.counts.critical} critical, ${summary.counts.high} high ` +
    `(moderate ${summary.counts.moderate}, low ${summary.counts.low})`
);
for (const advisory of summary.advisories) {
  console.log(
    `  ${advisory.severity.padEnd(8)} ${advisory.name} ${advisory.range} ` +
      `(direct: ${advisory.direct ? "yes" : "no"}, patch: ${JSON.stringify(advisory.fixAvailable)})`
  );
}
