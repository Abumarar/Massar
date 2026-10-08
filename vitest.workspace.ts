import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "api-server",
      root: "./artifacts/api-server",
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  },
  {
    extends: "./artifacts/massar-operations/vite.config.ts",
    test: {
      name: "massar-operations",
      root: "./artifacts/massar-operations",
      environment: "jsdom",
      include: ["src/**/*.test.{ts,tsx}"],
    },
  },
]);
