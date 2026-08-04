import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  // GitHub's node24 action runner does `node dist/main.js` directly with no
  // install step — dist/ is committed as-is, so every dependency
  // (@actions/core, booklet-api-client, zod) must be inlined here rather
  // than resolved from node_modules at runtime.
  format: ["cjs"],
  target: "node24",
  platform: "node",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false,
  minify: false,
  sourcemap: false,
  dts: false,
  noExternal: ["@actions/core", "booklet-api-client", "zod"],
});
