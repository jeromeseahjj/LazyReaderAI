import type { RuntimeStatus } from "../../core/types";

export async function probeRuntime(): Promise<RuntimeStatus> {
    const notes: string[] = [];
    console.log("[transformer.probeRuntime] Navigator ", navigator);

    const webgpuAvailable =
        typeof navigator !== "undefined" && "gpu" in navigator;

    if (webgpuAvailable) {
        notes.push("WebGPU detected in this side panel.");
    } else {
        notes.push("WebGPU not detected. WASM fallback will be needed.");
    }

    try {
        await import("@huggingface/transformers");
        notes.push("Transformer.js import succeeded");

        return {
            webgpuAvailable,
            transformersReady: true,
            preferredBackend: webgpuAvailable ? "webgpu" : "wasm",
            notes,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notes.push(`Transformer.js import failed: ${message}`);

        return {
            webgpuAvailable,
            transformersReady: false,
            preferredBackend: "wasm",
            notes,
        };
    }
}