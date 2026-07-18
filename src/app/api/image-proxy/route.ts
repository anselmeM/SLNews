import { NextResponse } from "next/server";

const FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">' +
  '<rect width="800" height="450" fill="#0b3d5c"/>' +
  '<text x="50%" y="50%" fill="#ffffff" font-family="sans-serif" font-size="32" text-anchor="middle" dominant-baseline="middle">SLNews</text>' +
  "</svg>";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse(FALLBACK_SVG, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
    });
  }

  const fallback = () =>
    new NextResponse(FALLBACK_SVG, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
    });

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "SLNews/1.0" },
    });

    if (!response.ok) {
      return fallback();
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return fallback();
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return fallback();
  }
}
