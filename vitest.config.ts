import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  // `.claude/**` holds `claude --worktree` checkouts, each with its own copy of the tests and its own node_modules.
  test: { environment: "node", exclude: ["**/node_modules/**", ".next/**", ".claude/**"] },
});
