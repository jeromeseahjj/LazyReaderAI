// Offload to a background worker as the whole UI is freezing when the job is running
import { env, pipeline } from "@huggingface/transformers";
import type { WorkerRequest, WorkerResponse } from "./types";
import { summarizeLongText } from "./summarizer";

let summarizerPromise: Promise<any> | null = null;

function configureTransformers() {
    const wasmBackend = env.backends?.onnx?.wasm;
    if (!wasmBackend) {
        throw new Error("ONNX WASM backend is not available");
    }

    wasmBackend.wasmPaths = "/ort/";
}

async function getSummarizer() {
    configureTransformers();

    if (!summarizerPromise) {
        summarizerPromise = pipeline(
            "summarization",
            "Xenova/distilbart-cnn-6-6",
            { device: "wasm" },
        );
    }

    return summarizerPromise;
}

self.postMessage({ type: "READY" } satisfies WorkerResponse);

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const msg = event.data;
    console.log("[summary.worker] got request", msg.requestId);
    if (msg.type !== "SUMMARIZE") return;

    try {
        const summary = await summarizeLongText(msg.text);
        self.postMessage({
            type: "RESULT",
            requestId: msg.requestId,
            summary,
        } satisfies WorkerResponse);
    } catch (error) {
        self.postMessage({
            type: "ERROR",
            requestId: msg.requestId,
            error: error instanceof Error ? error.message : String(error),
        } satisfies WorkerResponse);
    }
};