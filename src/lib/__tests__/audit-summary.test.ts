import { describe, expect, it } from "vitest";
import { parseAuditReport, summariseAudit, toEnvFile, type AuditReport } from "@/lib/audit-summary";

function report(overrides: Partial<AuditReport> = {}): AuditReport {
  return {
    metadata: { vulnerabilities: { info: 0, low: 0, moderate: 1, high: 2, critical: 0 } },
    vulnerabilities: {
      "source-map-js": {
        severity: "high",
        range: "<1.2.2",
        fixAvailable: true,
        isDirect: false,
      },
      sharp: { severity: "high", range: "<0.35.5", fixAvailable: true, isDirect: true },
      "fast-uri": { severity: "moderate", range: "<3.1.8", fixAvailable: true, isDirect: false },
    },
    ...overrides,
  };
}

describe("summariseAudit", () => {
  it("counts what npm reported and treats high + critical as actionable", () => {
    const summary = summariseAudit(report(), { date: "2026-10-07" });

    expect(summary.counts).toEqual({ info: 0, low: 0, moderate: 1, high: 2, critical: 0 });
    expect(summary.actionable).toBe(2);
  });

  it("lists only high and critical, worst first", () => {
    const summary = summariseAudit(
      report({
        metadata: { vulnerabilities: { high: 1, critical: 1, moderate: 5 } },
        vulnerabilities: {
          moderate: { severity: "moderate", range: "<1", fixAvailable: true },
          "some-high": { severity: "high", range: "<2", fixAvailable: true },
          "some-critical": { severity: "critical", range: "<3", fixAvailable: true },
        },
      })
    );

    expect(summary.advisories.map((advisory) => advisory.name)).toEqual([
      "some-critical",
      "some-high",
    ]);
  });

  it("marks an advisory with no patch available", () => {
    // This is the case that used to block every PR: nothing to upgrade to.
    const summary = summariseAudit(
      report({
        metadata: { vulnerabilities: { high: 1 } },
        vulnerabilities: {
          librsvg: { severity: "high", range: "<2.63.3", fixAvailable: false, isDirect: false },
        },
      }),
      { date: "2026-10-07" }
    );

    expect(summary.markdown).toContain("| `librsvg` | high | `<2.63.3` | no | **no** |");
  });

  it("says which advisories are direct dependencies", () => {
    const summary = summariseAudit(report(), { date: "2026-10-07" });

    expect(summary.markdown).toContain("| `sharp` | high | `<0.35.5` | yes | yes |");
    expect(summary.markdown).toContain("| `source-map-js` | high | `<1.2.2` | no | yes |");
  });

  it("names the overrides escape hatch when something has no patch", () => {
    const summary = summariseAudit(report(), { date: "2026-10-07" });

    expect(summary.markdown).toContain("`overrides`");
  });

  it("attaches the raw output behind a details block", () => {
    const summary = summariseAudit(report(), { date: "2026-10-07", rawText: "found 3 vulnerabilities" });

    expect(summary.markdown).toContain("<details>");
    expect(summary.markdown).toContain("found 3 vulnerabilities");
  });

  it("produces a clean report with no table when there is nothing to report", () => {
    const summary = summariseAudit(
      { metadata: { vulnerabilities: { info: 0, low: 0, moderate: 2, high: 0, critical: 0 } } },
      { date: "2026-10-07" }
    );

    expect(summary.actionable).toBe(0);
    expect(summary.advisories).toEqual([]);
    expect(summary.markdown).toContain("**0 critical, 0 high**");
    expect(summary.markdown).not.toContain("| package |");
  });

  it("survives a report with no metadata at all", () => {
    // `npm audit --json` omits `metadata` for some failures; the workflow must
    // not crash and pretend there is nothing there.
    const summary = summariseAudit({});

    expect(summary.counts).toEqual({ info: 0, low: 0, moderate: 0, high: 0, critical: 0 });
    expect(toEnvFile(summary)).toContain("AUDIT_ACTIONABLE=0");
  });
});

describe("parseAuditReport", () => {
  const payload = { metadata: { vulnerabilities: { high: 1 } } };

  it("reads the UTF-8 that CI's shell writes", () => {
    expect(parseAuditReport(Buffer.from(JSON.stringify(payload), "utf8"))).toEqual(payload);
  });

  it("reads UTF-8 with a BOM", () => {
    expect(parseAuditReport(Buffer.from(`\uFEFF${JSON.stringify(payload)}`, "utf8"))).toEqual(payload);
  });

  it("reads UTF-16 without a BOM", () => {
    expect(parseAuditReport(Buffer.from(JSON.stringify(payload), "utf16le"))).toEqual(payload);
  });

  it("reads the UTF-16 with a BOM that PowerShell 5.1 writes", () => {
    // This repo is developed on Windows, where `npm audit --json > audit.json`
    // produces UTF-16 and JSON.parse sees "Unexpected token".
    const withBom = Buffer.concat([
      Buffer.from([0xff, 0xfe]),
      Buffer.from(JSON.stringify(payload), "utf16le"),
    ]);

    expect(parseAuditReport(withBom)).toEqual(payload);
  });

  it("accepts a string too", () => {
    expect(parseAuditReport(JSON.stringify(payload))).toEqual(payload);
  });
});

describe("toEnvFile", () => {
  it("exports the numbers the workflow branches on", () => {
    const env = toEnvFile(summariseAudit(report()));

    expect(env).toContain("AUDIT_CRITICAL=0");
    expect(env).toContain("AUDIT_HIGH=2");
    expect(env).toContain("AUDIT_ACTIONABLE=2");
  });
});
