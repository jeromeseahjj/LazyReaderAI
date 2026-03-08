import { env, pipeline } from "@huggingface/transformers";

let summarizerPromise: Promise<any> | null = null;

function configureTransformers() {
    const wasmBackend = env.backends?.onnx?.wasm;
    if (!wasmBackend) {
        throw new Error("ONNX WASM backend is not available");
    }

    wasmBackend.wasmPaths = "/ort/";
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

function chunkText(text: string, maxChars = 2000): string[] {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return [];

    const sentences = cleaned
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
        const next = current ? `${current} ${sentence}` : sentence;

        // Split sentences into chunks of maxChars or 2000 basically
        if (next.length <= maxChars) {
            current = next;
            continue;
        }

        if (current) chunks.push(current);
        current = sentence;
    }
    // For last 'current' in the loop
    if (current) chunks.push(current);

    return chunks;
}

export async function summarizeLongText(text: string): Promise<string> {
    const chunks = chunkText(text, 2000);
    if (chunks.length === 0) return "";
    const partials: string[] = [];

    for (const chunk of chunks.slice(0, 6)) {
        // Summarize every chunk of 2000 chars
        const part = await summarizeWithModel(chunk);
        if (part.trim()) partials.push(part.trim());
    }

    if (partials.length === 0) return "";

    if (partials.length === 1) return partials[0] ?? "";
    
    return await summarizeWithModel(partials.join(" "));
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
