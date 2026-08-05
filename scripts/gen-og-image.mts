import path from "node:path";
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0b3d5c"/>
  <rect x="0" y="0" width="1200" height="8" fill="#1a6d8f"/>
  <text x="600" y="300" fill="#ffffff" font-family="Arial, sans-serif" font-size="96" font-weight="bold" text-anchor="middle">SLNews</text>
  <text x="600" y="380" fill="#b3d4e3" font-family="Arial, sans-serif" font-size="40" text-anchor="middle">Sierra Leone News</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(path.resolve("public/og-image.png"));
console.log("wrote public/og-image.png");