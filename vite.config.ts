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
                { src: "manifest.json", dest: "." },
                { src: "node_modules/onnxruntime-web/dist/*", dest: "ort" },
            ],
        }),
    ],
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"), // always correct because of the 2 steps above
                background: resolve(__dirname, "src/platform/background.ts"),
                content: resolve(__dirname, "src/platform/content.ts"),
            },
            output: {
                entryFileNames: "[name].js",
            },
        },
    },
});
