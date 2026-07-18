const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
let exitCode = 0;
const messages = [];

console.log("🔍 Production build check\n");

// 1. Required env vars
console.log("--- Environment Variables ---");
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`  ✓ ${envVar} is set`);
  } else {
    console.log(`  ✗ ${envVar} is NOT set`);
    messages.push(`Missing required env var: ${envVar}`);
    exitCode = 1;
  }
}

// 2. Prisma schema
console.log("\n--- Prisma Schema ---");
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
if (fs.existsSync(schemaPath)) {
  console.log("  ✓ prisma/schema.prisma exists");
} else {
  console.log("  ✗ prisma/schema.prisma NOT found");
  exitCode = 1;
}

// 3. Prisma client generated
console.log("\n--- Prisma Client ---");
const clientDir = path.join(__dirname, "..", "node_modules", ".prisma", "client");
if (fs.existsSync(clientDir)) {
  console.log("  ✓ Prisma client is generated");
} else {
  console.log("  ✗ Prisma client NOT generated (run 'npx prisma generate')");
  messages.push("Prisma client not generated");
  exitCode = 1;
}

// 4. Build
console.log("\n--- Build ---");
try {
  execSync("npx next build", { cwd: path.join(__dirname, ".."), stdio: "inherit", timeout: 300_000 });
  console.log("  ✓ Build succeeded");
} catch {
  console.log("  ✗ Build failed");
  messages.push("Next.js build failed");
  exitCode = 1;
}

// 5. Required public files
console.log("\n--- Public Assets ---");
const requiredAssets = ["manifest.json", "sw.js"];
for (const asset of requiredAssets) {
  const assetPath = path.join(__dirname, "..", "public", asset);
  if (fs.existsSync(assetPath)) {
    console.log(`  ✓ public/${asset} exists`);
  } else {
    console.log(`  - public/${asset} missing (generated at build time)`);
  }
}

console.log("\n--- Summary ---");
if (exitCode === 0) {
  console.log("✓ All checks passed. Ready for production.");
} else {
  console.log("✗ Some checks failed:");
  messages.forEach((m) => console.log(`  - ${m}`));
}

process.exit(exitCode);
