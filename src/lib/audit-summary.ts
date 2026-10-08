/**
 * Turning `npm audit --json` into something a person can act on.
 *
 * Why this exists: CI's `lint` job used to fail on any high production advisory,
 * and `test` needs `lint`, so a newly published advisory in a transitive
 * dependency turned master red for every open PR with no code change at all —
 * observed three times in four days (`source-map-js` + `fast-uri` in #87, `sharp`
 * via librsvg in #89). Blocking the queue does not make a maintainer ship a fix,
 * so the blocking gate now covers only *critical* advisories and the wider signal
 * is carried by a scheduled workflow that files one issue.
 *
 * Kept pure and tested so the scheduled report cannot quietly start lying about
 * what `npm audit` found.
 */

export interface AuditAdvisory {
  name: string;
  severity: string;
  /** The vulnerable version range reported by npm. */
  range: string;
  /** False when no patched version exists yet — the case that used to block. */
  fixAvailable: boolean | string;
  /** Direct dependency, or only reachable through another package. */
  direct: boolean;
}

export interface AuditCounts {
  info: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

export interface AuditReport {
  metadata?: { vulnerabilities?: Partial<AuditCounts> };
  vulnerabilities?: Record<
    string,
    {
      severity?: string;
      range?: string;
      fixAvailable?: boolean | string;
      isDirect?: boolean;
    }
  >;
}

export interface AuditSummary {
  counts: AuditCounts;
  /** Only the severities worth a human's attention. */
  advisories: AuditAdvisory[];
  /** High + critical. */
  actionable: number;
  markdown: string;
}

/** The advisories that are worth an issue: high and above. */
const REPORTED_SEVERITIES = ["high", "critical"];

/**
 * Reads `npm audit --json` output.
 *
 * The encoding is not a detail: CI runs the command in bash, which writes UTF-8,
 * while PowerShell's `>` writes UTF-16 — and this repo is developed on Windows, so
 * a maintainer running the documented command locally would otherwise get
 * "Unexpected token" from `JSON.parse`. Both are accepted, with or without a BOM.
 */
export function parseAuditReport(input: Buffer | string): AuditReport {
  if (typeof input === "string") {
    return JSON.parse(input.replace(/^\uFEFF/, "")) as AuditReport;
  }

  const hasUtf16Bom = input.length >= 2 && input[0] === 0xff && input[1] === 0xfe;
  // A NUL byte cannot appear in valid JSON text, so its presence marks UTF-16 even
  // without a BOM. PowerShell 5.1 writes a BOM; other Windows paths may not.
  const looksUtf16 = !hasUtf16Bom && input.subarray(0, 64).includes(0);
  const text = (hasUtf16Bom || looksUtf16 ? input.toString("utf16le") : input.toString("utf8")).replace(
    /^\uFEFF/,
    ""
  );

  return JSON.parse(text) as AuditReport;
}

export function summariseAudit(
  report: AuditReport,
  options: { rawText?: string; date?: string } = {}
): AuditSummary {
  const reported = report.metadata?.vulnerabilities ?? {};
  const counts: AuditCounts = {
    info: reported.info ?? 0,
    low: reported.low ?? 0,
    moderate: reported.moderate ?? 0,
    high: reported.high ?? 0,
    critical: reported.critical ?? 0,
  };

  const advisories: AuditAdvisory[] = Object.entries(report.vulnerabilities ?? {})
    .filter(([, advisory]) => REPORTED_SEVERITIES.includes(advisory.severity ?? ""))
    .map(([name, advisory]) => ({
      name,
      severity: advisory.severity ?? "unknown",
      range: advisory.range ?? "unknown",
      fixAvailable: advisory.fixAvailable ?? false,
      direct: advisory.isDirect ?? false,
    }))
    // Critical first, then alphabetical, so the top of the list is the top of the
    // priority order.
    .sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const actionable = counts.high + counts.critical;
  const date = options.date ?? new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    `\`npm audit --omit=dev\` on ${date}: **${counts.critical} critical, ${counts.high} high** in production dependencies.`,
    "",
  ];

  if (advisories.length > 0) {
    lines.push(
      "| package | severity | vulnerable range | direct | patch available |",
      "|---|---|---|---|---|",
      ...advisories.map(
        (advisory) =>
          `| \`${advisory.name}\` | ${advisory.severity} | \`${advisory.range}\` | ${
            advisory.direct ? "yes" : "no"
          } | ${describeFix(advisory.fixAvailable)} |`
      ),
      "",
      "Where no patch exists yet, pin the range in `package.json` `overrides` and reference this issue — that is what #87 and #89 did.",
      ""
    );
  }

  if (options.rawText?.trim()) {
    lines.push(
      "<details><summary>Raw <code>npm audit</code> output</summary>",
      "",
      "```",
      options.rawText.trim(),
      "```",
      "",
      "</details>"
    );
  }

  return { counts, advisories, actionable, markdown: lines.join("\n") };
}

function describeFix(fixAvailable: boolean | string): string {
  if (!fixAvailable) return "**no**";
  if (typeof fixAvailable === "string") return `yes (${fixAvailable})`;
  return "yes";
}

/** The value to append to `$GITHUB_ENV` for the workflow's `if` conditions. */
export function toEnvFile(summary: AuditSummary): string {
  return [
    `AUDIT_CRITICAL=${summary.counts.critical}`,
    `AUDIT_HIGH=${summary.counts.high}`,
    `AUDIT_ACTIONABLE=${summary.actionable}`,
    "",
  ].join("\n");
}
