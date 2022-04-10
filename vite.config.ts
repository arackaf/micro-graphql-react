import { defineConfig } from "vite";

const noMinify = process.env.NO_MINIFY;

export default defineConfig({
  build: {
    emptyOutDir: false,
    minify: noMinify ? false : "esbuild",
    target: "esnext",
    outDir: "./dist",
    lib: {
      entry: "./src/index.js",
      formats: ["cjs"],
      fileName: () => (noMinify ? "index.js" : "index.min.js")
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {}
    }
  }
});
