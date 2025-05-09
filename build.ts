import { build } from "esbuild";

build({
  entryPoints: ["src/frontend/index.tsx"],
  bundle: true,
  outdir: "public",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  jsx: "automatic",
  minify: true,
}).catch(() => process.exit(1));
