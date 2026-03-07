import type { RuntimeStatus } from "./types";

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

    let result;
    try {
        await import("@huggingface/transformers");
        notes.push("Transformer.js import succeed");
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notes.push(`Transformer.js import failed: ${message}`);
        result = {
            webgpuAvailable,
            transformersReady: false,
            backend: "wasm",
            notes,
        } as const;
    }
    result = {
        webgpuAvailable,
        transformersReady: true,
        backend: webgpuAvailable ? "webgpu" : "wasm",
        notes,
    } as const;
    console.log("[transformer.probeRuntime] Result ", result);
    return result
}
