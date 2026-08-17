import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/share-card/route";

describe("Social Share Card API", () => {
  it("generates an SVG with correct content-type and headers", async () => {
    const req = new Request("http://localhost:3000/api/share-card?title=Bank+of+Sierra+Leone+Monetary+Policy&category=Economy&source=Awoko");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");

    const svg = await res.text();
    expect(svg).toContain("<svg");
    expect(svg).toContain("Bank of Sierra Leone");
    expect(svg).toContain("ECONOMY");
    expect(svg).toContain("Awoko");
    expect(svg).toContain("SLNews");
  });

  it("handles fallback defaults when parameters are omitted", async () => {
    const req = new Request("http://localhost:3000/api/share-card");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const svg = await res.text();
    expect(svg).toContain("SLNews");
    expect(svg).toContain("SIERRA LEONE");
  });
});
