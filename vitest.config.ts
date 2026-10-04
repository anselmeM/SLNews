import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The suite runs as two vitest projects, split by environment.
//
// Running every file under jsdom was the dominant cost: jsdom setup accounted
// for the majority of the suite's runtime (environment + setup) even though only
// the component tests actually need a DOM. Logic-only files are far cheaper
// under the `node` environment, and jsdom worker startup was also the flakiest
// part of the run.
//
// These four `*.test.ts` files are the only non-component tests that touch DOM
// globals (document / window / localStorage / navigator / matchMedia). Every
// other `.test.ts` runs in the `unit` project, and every `.test.tsx` is a
// component test and stays in `dom`.
const DOM_TESTS = [
  "src/lib/__tests__/meta-pixel.test.ts",
  "src/lib/__tests__/pwa-install.test.ts",
  "src/lib/__tests__/theme.test.ts",
  "src/store/__tests__/useAppStore.test.ts",
];

// Project configs are isolated: the React plugin and the `@` alias are NOT
// inherited from the root config, so each project must declare its own.
const shared = {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};

export default defineConfig({
  test: {
    globals: true,
    exclude: ["e2e/**", "node_modules/**"],
    pool: "threads",
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      // A ratchet, set ~1 point below the measured baseline so the existing CI
      // coverage step can actually fail — previously it always exited 0, so
      // coverage could regress silently.
      //
      // Measured on master (2026-10-03):
      //   statements 73.48 | branches 61.19 | functions 73.14 | lines 75.3
      //
      // Raised as coverage improved — 64/53/63/66 (baseline), 66/54/68/68
      // (useAppStore), 71/58/70/73 (audio player), now this. Ratchet up whenever
      // coverage improves, or the gain regresses unnoticed.
      //
      // The ~1 point of headroom is deliberate: deleting tests, breaking
      // coverage collection, or dropping a large covered module fails the gate,
      // while ordinary incremental work does not. Tighten toward the measured
      // values if you'd rather every untested addition fail CI.
      thresholds: {
        statements: 72,
        branches: 60,
        functions: 72,
        lines: 74,
      },
    },
    projects: [
      {
        ...shared,
        test: {
          name: "dom",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.tsx", ...DOM_TESTS],
        },
      },
      {
        ...shared,
        test: {
          name: "unit",
          environment: "node",
          globals: true,
          // Deliberately no `setupFiles`: nothing here needs the DOM shims or
          // module mocks that `vitest.setup.ts` installs, and loading them would
          // drag the jsdom-sized startup cost back in.
          include: ["src/**/*.test.ts"],
          exclude: ["e2e/**", "node_modules/**", ...DOM_TESTS],
        },
      },
    ],
  },
});
