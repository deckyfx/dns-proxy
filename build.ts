import { build } from "esbuild";

// Step 3: Build React app
build({
  entryPoints: ["src/frontend/index.tsx"],
  bundle: true,
  outdir: "public",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  jsx: "automatic",
  minify: true,
  inject: ["src/frontend/env-shim.ts"],  // ✅ inject shim
}).catch(() => process.exit(1));