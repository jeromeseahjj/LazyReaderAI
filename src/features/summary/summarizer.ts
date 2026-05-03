import { env, pipeline } from "@huggingface/transformers";
import type { Backend, SummaryRuntime } from "../../core/types";

let summarizerPromise: Promise<any> | null = null;
let activeBackend: Backend | null = null;

export function summarizeExtractive(text: string, maxSentences = 5): string {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return "";

    // Split into sentence
    const sentences = cleaned
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 40);

    if (sentences.length === 0) return cleaned.slice(0, 500);

    // Tokenize & build word frequency map
    const stop = new Set([
        "the","a","an","and","or","but","if","then","else","to","of","in","on","for","with","as","at","by",
        "is","are","was","were","be","been","being","it","this","that","these","those","from","into","than",
        "you","your","we","our","they","their","i","me","my","he","she","his","her","them","there","here",
        "about","also","more","most","some","such","may","might","can","could","would","should",
    ]);

    // Old school NLP
    const wordFreq = new Map<string, number>();
    for (const s of sentences) {
        // IMPORTANT: match full words, not single chars
        for (const w of s.toLowerCase().match(/[a-z0-9']+/g) ?? []) {
            // Ignore redundant words
            if (w.length <= 2) continue;
            if (stop.has(w)) continue;
            // Capture statistic and keywords
            wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
        }
    }

    // Score sentences by sum of keyword frequencies, normalized by length
    const scored = sentences.map((s, idx) => {
        const words = s.toLowerCase().match(/[a-z0-9']+/g) ?? [];
        // This gives statistic a boost/higher score
        let score = /\d/.test(s) ? 5 : 0;
        for (const w of words) score += wordFreq.get(w) ?? 0;
        const norm = Math.max(8, words.length);
        // To prevent biasness from long sentences
        return { idx, s, score: score / norm };
    });

    // b - a, is positive, means b is bigger, b should come before a
    // if negative, means a should come before b
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(maxSentences, scored.length))
        .sort((a, b) => a.idx - b.idx)
        .map((x) => x.s)
        .join("\n\n");
}

export function getModelRuntime(): SummaryRuntime {
    const preferredBackend = getPreferredBackend();
    return {
        preferredBackend,
        activeBackend: activeBackend ?? undefined,
        modelReady: activeBackend != null,
        modelName: "Xenova/distilbart-cnn-6-6",
        fallbackUsed: preferredBackend === "webgpu" && activeBackend === "wasm",
        notes: [],
    };
}

function configureTransformers() {
    const wasmBackend = env.backends?.onnx?.wasm;
    if (!wasmBackend) {
        throw new Error("ONNX WASM backend is not available");
    }

    wasmBackend.wasmPaths = "/ort/";
}

function getPreferredBackend(): Backend {
    return typeof navigator !== "undefined" && "gpu" in navigator
        ? "webgpu"
        : "wasm";
}

async function createSummarizer(device: Backend) {
    return pipeline(
        "summarization",
        "Xenova/distilbart-cnn-6-6",
        { device, ...((device === "webgpu") ? { dtype: "fp32" } : {}) },
    );
}

export async function getSummarizer() {
    configureTransformers();

    if (!summarizerPromise) {
        summarizerPromise = (async () => {
            const preferred = getPreferredBackend();

            try {
                console.log("[summarizer.getSummarizer] preferred", preferred);
                const summarizer = await createSummarizer(preferred);
                activeBackend = preferred;
                return summarizer;
            } catch (error) {
                if (preferred === "webgpu") {
                    const summarizer = await createSummarizer("wasm");
                    activeBackend = "wasm";
                    return summarizer;
                }

                throw error;
            }
        })().catch((error) => {
            summarizerPromise = null;
            activeBackend = null;
            throw error;
        });
    }

    return summarizerPromise;
}

export function getActiveBackend() {
    return activeBackend;
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
