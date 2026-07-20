import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "SLNews";
  const category = searchParams.get("category") || "";
  const source = searchParams.get("source") || "";

  const lines = splitTitle(title, 35);
  const titleHtml = lines
    .map((l, i) => `<text x="40" y="${50 + i * 52}" fill="white" font-family="system-ui,-apple-system,sans-serif" font-size="36" font-weight="800">${esc(l)}</text>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#006e1c"/>
  <rect x="0" y="520" width="1200" height="110" fill="#004d13"/>
  <text x="40" y="575" fill="#ffffff99" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="600">${esc(category)}${source ? ` · ${esc(source)}` : ""}</text>
  <text x="1140" y="575" fill="#ffffff66" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="700" text-anchor="end">slnews.vercel.app</text>
  ${titleHtml}
  <circle cx="80" cy="575" r="24" fill="white"/>
  <text x="80" y="583" fill="#006e1c" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="900" text-anchor="middle">SL</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function splitTitle(text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + w).length > max && current) { lines.push(current.trim()); current = w; }
    else { current += " " + w; }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.slice(0, 3);
}
