import { env, pipeline } from "@huggingface/transformers";

let summarizerPromise: Promise<any> | null = null;

function configureTransformers() {
    if (!env.backends?.onnx?.wasm) {
        throw new Error("ONNX WASM backend is not available.");
    }

    // Get the local copy that is bundled into the /dist instead of CDN
    env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL("ort/");
}

export async function getSummarizer() {
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

export async function summarizeWithModel(text: string): Promise<string> {
    const summarizer = await getSummarizer();
    const input = text.replace(/\s+/g, " ").trim().slice(0, 4000);

    if (!input) return "";

    const result = await summarizer(input, {
        max_new_tokens: 120,
        min_length: 40,
        do_sample: false,
    });

    const first = Array.isArray(result) ? result[0] : result;
    return first?.summary_text ?? "";
}
