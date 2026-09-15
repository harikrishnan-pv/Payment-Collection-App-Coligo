import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    hookTimeout: 30_000,
    testTimeout: 15_000,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
