const { execFileSync } = require("node:child_process");
const { cpSync } = require("node:fs");
const path = require("node:path");

if (process.platform === "win32") {
  execFileSync(process.env.ComSpec, ["/d", "/s", "/c", "npm run build"], {
    stdio: "inherit",
  });
} else {
  execFileSync("npm", ["run", "build"], { stdio: "inherit" });
}
cpSync("public", ".next/standalone/public", { recursive: true });
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });

require(path.resolve(".next/standalone/server.js"));
