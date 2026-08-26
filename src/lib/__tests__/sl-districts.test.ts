import { describe, it, expect } from "vitest";
import {
  SL_PROVINCES,
  SL_DISTRICTS,
  getDistrictByName,
  getProvinceById,
  getProvinceForDistrict,
} from "../sl-districts";

describe("Sierra Leone Districts Metadata", () => {
  it("defines exactly 5 provinces and 16 districts", () => {
    expect(SL_PROVINCES).toHaveLength(5);
    expect(SL_DISTRICTS).toHaveLength(16);
  });

  it("assigns valid staples and coordinates to every district", () => {
    for (const d of SL_DISTRICTS) {
      expect(d.id).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.headquarters).toBeTruthy();
      expect(d.staples.length).toBeGreaterThan(0);
      expect(d.coordinates.x).toBeGreaterThan(0);
      expect(d.coordinates.y).toBeGreaterThan(0);
    }
  });

  it("resolves district lookup case-insensitively", () => {
    const bo = getDistrictByName("bo");
    expect(bo).toBeDefined();
    expect(bo?.name).toBe("Bo");
    expect(bo?.province).toBe("Southern Province");

    const freetown = getDistrictByName("Freetown");
    expect(freetown).toBeDefined();
    expect(freetown?.name).toBe("Western Area Urban");
  });

  it("resolves province for district correctly", () => {
    const eastern = getProvinceForDistrict("Kenema");
    expect(eastern).toBeDefined();
    expect(eastern?.name).toBe("Eastern Province");
    expect(eastern?.id).toBe("eastern");
  });

  it("retrieves province by ID", () => {
    const western = getProvinceById("western");
    expect(western).toBeDefined();
    expect(western?.name).toBe("Western Area");
  });
});
