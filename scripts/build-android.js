#!/usr/bin/env node

/**
 * Android TWA Build Helper for SLNews
 *
 * Checks prerequisites (JDK 17, Android SDK, Keystore),
 * displays Digital Asset Links SHA-256 fingerprint, and
 * outputs the commands to build the release Android App Bundle (.aab).
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const androidDir = path.join(rootDir, "android");
const keystorePath = path.join(androidDir, "android.keystore");
const assetLinksPath = path.join(rootDir, "public", ".well-known", "assetlinks.json");

console.log("=========================================");
console.log("  SLNews: Android TWA Packaging Helper   ");
console.log("=========================================\n");

// 1. Check JDK
const defaultJdk = "C:\\Program Files\\Java\\jdk-17";
const javaHome = process.env.JAVA_HOME || (fs.existsSync(defaultJdk) ? defaultJdk : null);

if (javaHome && fs.existsSync(javaHome)) {
  console.log(`[OK] Java JDK detected: ${javaHome}`);
} else {
  console.warn(`[WARN] Java JDK 17 not found at JAVA_HOME or ${defaultJdk}`);
}

// 2. Check Android SDK
const defaultSdk = path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk");
const androidHome = process.env.ANDROID_HOME || (fs.existsSync(defaultSdk) ? defaultSdk : null);

if (androidHome && fs.existsSync(androidHome)) {
  console.log(`[OK] Android SDK detected: ${androidHome}`);
} else {
  console.warn(`[WARN] Android SDK not found at ANDROID_HOME or ${defaultSdk}`);
}

// 3. Keystore Check
if (fs.existsSync(keystorePath)) {
  console.log(`[OK] Keystore found: ${keystorePath}`);
  try {
    console.log("\nExtracting SHA-256 Certificate Fingerprint...");
    const output = execSync(
      `keytool -list -v -keystore "${keystorePath}" -alias android -storepass android123`,
      { encoding: "utf8" }
    );
    const match = output.match(/SHA256:\s*([A-F0-9:]+)/i);
    if (match && match[1]) {
      const sha256 = match[1].trim();
      console.log(`[SHA-256]: ${sha256}`);
      console.log(`Update ${assetLinksPath} with this fingerprint.`);
    }
  } catch {
    console.log("(Use keytool to view your keystore SHA-256 fingerprint)");
  }
} else {
  console.log(`\n[INFO] No release keystore found at ${keystorePath}`);
  console.log("To generate a new signing keystore, run:");
  console.log(`  keytool -genkey -v -keystore "${keystorePath}" -alias android -keyalg RSA -keysize 2048 -validity 10000 -storepass slnews2026 -keypass slnews2026\n`);
}

// 4. Build Instructions
console.log("\n=========================================");
console.log("  To Build Android App Bundle (.aab):    ");
console.log("=========================================");
console.log("Run inside the /android directory:");
console.log("  cd android");
console.log("  npx @bubblewrap/cli build");
console.log("\nThis will generate 'app-release-bundle.aab' ready for Google Play upload.\n");
