import { NextResponse } from "next/server";
import sharp from "sharp";

const FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">' +
  '<rect width="800" height="450" fill="#0b3d5c"/>' +
  '<text x="50%" y="50%" fill="#ffffff" font-family="sans-serif" font-size="32" text-anchor="middle" dominant-baseline="middle">SLNews</text>' +
  "</svg>";

const ALLOWED_WIDTHS = new Set([320, 480, 640, 800, 960, 1200, 1600, 2000]);
const ALLOWED_FORMATS = new Set(["webp", "jpeg", "avif"]);

const fallback = () =>
  new NextResponse(FALLBACK_SVG, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) return fallback();

  const width = Number(searchParams.get("w") || 800);
  const format = searchParams.get("f") || "webp";
  if (!ALLOWED_WIDTHS.has(width) || !ALLOWED_FORMATS.has(format)) return fallback();

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "SLNews/1.0" },
    });

    if (!response.ok) return fallback();

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) return fallback();

    const buffer = Buffer.from(await response.arrayBuffer());
    let output: Buffer;
    try {
      output = await sharp(buffer)
        .resize({ width, withoutEnlargement: true })
        .toFormat(format === "jpeg" ? "jpeg" : format === "avif" ? "avif" : "webp", { quality: format === "avif" ? 55 : 80 })
        .toBuffer();
    } catch {
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": `image/${format}`,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return fallback();
  }
}
