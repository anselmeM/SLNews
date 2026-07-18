import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "import/order": ["warn", { alphabetize: { order: "asc", caseInsensitive: true } }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "prisma/**",
    "check-users.ts",
  ]),
]);

export default eslintConfig;
