import type { Store, SummaryResult, WorkerResponse } from "../../core/types";
import { summarizeExtractive } from "./summarizer";
import { createLoadingState } from "../../ui/loading";

let summaryWorker: Worker | null = null;

function getSummaryWorker() {
    if (!summaryWorker) {
        summaryWorker = new Worker(
            new URL("./summary.worker.ts", import.meta.url),
            { type: "module" },
        );
    }
    return summaryWorker;
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function runWorkerSummary(text: string): Promise<SummaryResult> {
    const worker = getSummaryWorker();
    const requestId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
        const onMessage = (event: MessageEvent<WorkerResponse>) => {
            const msg = event.data;
            if (msg.type === "READY") return;
            if (!("requestId" in msg) || msg.requestId !== requestId) return;

            worker.removeEventListener("message", onMessage);
            if (msg.type === "RESULT") {
                resolve({
                    summary: msg.summary,
                    runtime: msg.runtime,
                    meta: {
                        source: "model",
                        backend: msg.runtime.activeBackend,
                        modelName: msg.runtime.modelName,
                        fallbackUsed: msg.runtime.fallbackUsed,
                        generatedAt: Date.now(),
                        inputWordCount: countWords(text)
                    }
                });
            } else {
                reject(new Error(msg.error));
            }
        };

        worker.addEventListener("message", onMessage);
        worker.postMessage({
            type: "SUMMARIZE",
            requestId,
            text,
        });
    });
}

export function mountSummary(slot: HTMLElement, store: Store) {
    const bodyEl = document.createElement("div");
    bodyEl.className = "lr-summary-body";

    const metaEl = document.createElement("div");
    metaEl.className = "lr-summary-meta";

    slot.replaceChildren(bodyEl, metaEl);

    function addChip(label: string, tone: "good" | "warning" | "info" | "muted" = "muted") {
        const chip = document.createElement("span");
        chip.className = "lr-summary-chip";
        chip.dataset.tone = tone;
        chip.textContent = label;
        metaEl.appendChild(chip);
    }

    const unsub = store.subscribe((state) => {
        slot.setAttribute("aria-busy", state.summaryLoading ? "true" : "false");

        bodyEl.dataset.state = "";
        metaEl.replaceChildren();
        metaEl.hidden = true;

        if (state.summaryLoading) {
            bodyEl.dataset.state = "loading";
            bodyEl.replaceChildren(createLoadingState("Generating summary..."));
            return;
        }

        if (!state.summary) {
            bodyEl.dataset.state = "empty";
            bodyEl.replaceChildren("Not generated yet.");
            return;
        }

        bodyEl.replaceChildren(state.summary.trim());

        const meta = state.summaryMeta;
        if (!meta) return;

        metaEl.hidden = false;

        const generatedAt = new Date(meta.generatedAt).toLocaleTimeString();

        if (meta.source === "model") {
            addChip(`Model · ${meta.backend ?? "unknown"}`, "info");
        } else {
            addChip("Extractive fallback", "warning");
        }

        addChip(
            meta.fallbackUsed ? "Fallback used" : "No fallback",
            meta.fallbackUsed ? "warning" : "good",
        );

        addChip(`${meta.inputWordCount} words`, "muted");
        addChip(`Updated ${generatedAt}`, "muted");
    });

    async function generateFrom(text: string): Promise<SummaryResult> {
        try {
            console.log("[summary.generateFrom] Entry, generating using worker");

            await new Promise<void>((r) => requestAnimationFrame(() => r()));

            const summary = await runWorkerSummary(text);
            return summary;
        } catch (error) {
            console.log("[summary.generateFrom] Error, fallback to basic nlp", error);

            return {
                summary: summarizeExtractive(text, 5) || "...",
                runtime: undefined,
                meta: {
                    source: "extractive-fallback",
                    backend: undefined,
                    modelName: undefined,
                    fallbackUsed: true,
                    generatedAt: Date.now(),
                    inputWordCount: countWords(text),
                },
            };
        }
    }

    return {
        unsub,
        generateFrom,
        destroy() {
            unsub();
        },
    };
}
