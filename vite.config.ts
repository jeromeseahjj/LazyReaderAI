import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __filename = fileURLToPath(import.meta.url); // absolute path to vite.config.ts
const __dirname = dirname(__filename); // folder containing vite.config.ts

export default defineConfig({
  base: "./",
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." }
      ]
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "index.html"), // always correct because of the 2 steps above
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts")
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
});