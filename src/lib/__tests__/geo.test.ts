import { describe, it, expect } from "vitest";
import {
  districtProvince,
  normalizeProvince,
  provinceMatchTerms,
  SL_PROVINCES,
  type SlProvince,
} from "../geo";

describe("SL_PROVINCES", () => {
  it("lists each province exactly once", () => {
    expect(SL_PROVINCES).toHaveLength(5);
    expect(new Set(SL_PROVINCES).size).toBe(5);
  });

  it("accepts its own canonical spellings unchanged", () => {
    for (const province of SL_PROVINCES) {
      expect(normalizeProvince(province)).toBe(province);
    }
  });
});

describe("normalizeProvince", () => {
  it("maps the spellings the dashboard used to write", () => {
    // The old editor wrote these; rows in that vocabulary still exist.
    expect(normalizeProvince("Southern")).toBe("Southern Province");
    expect(normalizeProvince("Northern")).toBe("Northern Province");
    expect(normalizeProvince("Eastern")).toBe("Eastern Province");
    expect(normalizeProvince("North-West")).toBe("North West Province");
    expect(normalizeProvince("North West")).toBe("North West Province");
    expect(normalizeProvince("Northwest")).toBe("North West Province");
  });

  it("ignores case and surrounding whitespace", () => {
    expect(normalizeProvince("  southern province  ")).toBe("Southern Province");
    expect(normalizeProvince("WESTERN AREA")).toBe("Western Area");
  });

  it("returns null for anything that is not a province", () => {
    expect(normalizeProvince(null)).toBeNull();
    expect(normalizeProvince(undefined)).toBeNull();
    expect(normalizeProvince("")).toBeNull();
    expect(normalizeProvince("   ")).toBeNull();
    expect(normalizeProvince("Bo")).toBeNull();
    expect(normalizeProvince("Nationwide")).toBeNull();
  });
});

describe("districtProvince", () => {
  it("maps districts to their province", () => {
    expect(districtProvince("Bo")).toBe("Southern Province");
    expect(districtProvince("Kenema")).toBe("Eastern Province");
    expect(districtProvince("Port Loko")).toBe("North West Province");
    expect(districtProvince("Freetown")).toBe("Western Area");
  });

  it("returns null for a province name or an unknown value", () => {
    expect(districtProvince("Southern Province")).toBeNull();
    expect(districtProvince("Atlantis")).toBeNull();
  });
});

describe("provinceMatchTerms", () => {
  it("offers the canonical spelling first, then the legacy ones", () => {
    expect(provinceMatchTerms("Southern Province")).toEqual({
      provinces: ["Southern Province", "Southern"],
      districts: ["Bo", "Bonthe", "Moyamba", "Pujehun"],
    });
  });

  it("resolves a legacy spelling to the same terms", () => {
    expect(provinceMatchTerms("Southern")).toEqual(provinceMatchTerms("Southern Province"));
  });

  it("accepts a district as the filter value", () => {
    expect(provinceMatchTerms("Bo")).toEqual(provinceMatchTerms("Southern Province"));
  });

  it("never repeats a spelling", () => {
    for (const province of SL_PROVINCES) {
      const terms = provinceMatchTerms(province);
      expect(terms).not.toBeNull();
      expect(new Set(terms?.provinces).size).toBe(terms?.provinces.length);
    }
  });

  it("gives every province at least one district and no overlap between provinces", () => {
    const seen = new Map<string, SlProvince>();
    for (const province of SL_PROVINCES) {
      const terms = provinceMatchTerms(province);
      expect(terms?.districts.length).toBeGreaterThan(0);
      for (const district of terms?.districts ?? []) {
        expect(seen.has(district)).toBe(false);
        seen.set(district, province);
      }
    }
    // Sierra Leone's 16 districts, plus Freetown, which is not a district but is
    // what people write as a location.
    expect(seen.size).toBe(17);
  });

  it("returns null for a value that is not a province or district", () => {
    expect(provinceMatchTerms("")).toBeNull();
    expect(provinceMatchTerms(null)).toBeNull();
    expect(provinceMatchTerms("Nationwide")).toBeNull();
  });
});
