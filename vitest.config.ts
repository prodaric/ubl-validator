import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 120_000,
    hookTimeout: 300_000,
    pool: "threads",
    fileParallelism: false,
    maxWorkers: 1,
    sequence: {
      concurrent: false,
    },
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/cli/**",
        "src/angular/**",
        "src/browser.ts",
        "src/crypto.ts",
        "src/profile/index.ts",
        "src/crypto/index.ts",
        "src/profile/schematron/runner.ts",
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        statements: 85,
        branches: 80,
      },
    },
  },
});
