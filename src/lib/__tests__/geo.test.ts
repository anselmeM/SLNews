import { describe, it, expect } from "vitest";
import {
  districtProvince,
  normalizeDistrict,
  normalizeProvince,
  provinceMatchTerms,
  SL_DISTRICTS,
  SL_DISTRICTS_BY_PROVINCE,
  SL_PROVINCES,
  splitLocation,
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

  it("accepts a district alias as the filter value", () => {
    // The reel form used to offer and store "Makeni (Bombali)".
    expect(provinceMatchTerms("Makeni (Bombali)")).toEqual(
      provinceMatchTerms("Northern Province")
    );
  });

  it("never repeats a spelling", () => {
    for (const province of SL_PROVINCES) {
      const terms = provinceMatchTerms(province);
      expect(terms).not.toBeNull();
      expect(new Set(terms?.provinces).size).toBe(terms?.provinces.length);
      expect(new Set(terms?.districts).size).toBe(terms?.districts.length);
    }
  });

  it("covers every district exactly once across the provinces", () => {
    const seen = new Map<string, SlProvince>();
    for (const province of SL_PROVINCES) {
      const terms = provinceMatchTerms(province);
      expect(terms?.districts.length).toBeGreaterThan(0);
      for (const district of SL_DISTRICTS_BY_PROVINCE[province]) {
        expect(terms?.districts).toContain(district);
        expect(seen.has(district)).toBe(false);
        seen.set(district, province);
      }
    }

    expect(SL_DISTRICTS).toHaveLength(16);
    expect(new Set(SL_DISTRICTS).size).toBe(16);
    expect(seen.size).toBe(16);
  });

  it("also matches the district spellings that have been stored", () => {
    expect(provinceMatchTerms("Western Area")?.districts).toEqual(
      expect.arrayContaining([
        "Western Area Urban",
        "Western Area Rural",
        "Freetown",
        "Freetown (Western Urban)",
        "Western Rural",
      ])
    );
    expect(provinceMatchTerms("Northern Province")?.districts).toEqual(
      expect.arrayContaining(["Bombali", "Makeni", "Makeni (Bombali)"])
    );
  });

  it("returns null for a value that is not a province or district", () => {
    expect(provinceMatchTerms("")).toBeNull();
    expect(provinceMatchTerms(null)).toBeNull();
    expect(provinceMatchTerms("Nationwide")).toBeNull();
    expect(provinceMatchTerms("National")).toBeNull();
  });
});

describe("normalizeDistrict", () => {
  it("keeps canonical district names and resolves the old spellings", () => {
    expect(normalizeDistrict("Bo")).toBe("Bo");
    expect(normalizeDistrict("Makeni (Bombali)")).toBe("Bombali");
    expect(normalizeDistrict("Freetown (Western Urban)")).toBe("Western Area Urban");
    expect(normalizeDistrict("Western Rural")).toBe("Western Area Rural");
  });

  it("returns null for provinces, unknown values and blanks", () => {
    expect(normalizeDistrict("Southern Province")).toBeNull();
    expect(normalizeDistrict("National")).toBeNull();
    expect(normalizeDistrict("")).toBeNull();
    expect(normalizeDistrict(null)).toBeNull();
  });
});

describe("splitLocation", () => {
  it("splits a district into its province and the district column", () => {
    expect(splitLocation("Makeni (Bombali)")).toEqual({
      province: "Northern Province",
      district: "Bombali",
    });
  });

  it("keeps a province out of the district column", () => {
    expect(splitLocation("Southern Province")).toEqual({
      province: "Southern Province",
      district: null,
    });
  });

  it("never puts an unrecognised value in the province column", () => {
    expect(splitLocation("National")).toEqual({ province: null, district: "National" });
    expect(splitLocation("  Some venue  ")).toEqual({
      province: null,
      district: "Some venue",
    });
  });

  it("stores nothing for an empty value", () => {
    expect(splitLocation("")).toEqual({ province: null, district: null });
    expect(splitLocation(null)).toEqual({ province: null, district: null });
    expect(splitLocation("   ")).toEqual({ province: null, district: null });
  });
});
