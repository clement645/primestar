import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    // Several tests hit a real Postgres database (by design — see
    // referral.test.ts). A remote database (e.g. Neon) adds real network
    // latency per round trip, so the default 5s is too tight — this
    // applies to setup/teardown hooks too, not just the tests themselves.
    testTimeout: 15000,
    hookTimeout: 15000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
