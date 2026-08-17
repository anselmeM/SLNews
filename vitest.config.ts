import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    exclude: ["e2e/**", "node_modules/**"],
    pool: "threads",
    fileParallelism: false,
    maxWorkers: 1,
    isolate: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
