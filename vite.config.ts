import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "./dist",
    lib: {
      entry: "./src/index.js",
      formats: ["cjs"],
      fileName: () => "index.js"
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {}
    }
  }
});
