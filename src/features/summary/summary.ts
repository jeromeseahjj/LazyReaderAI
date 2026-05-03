import type { Store, SummaryResult, WorkerResponse } from "../../core/types";
import { summarizeExtractive } from "./summarizer";

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
    // render-only subscription (shows whatever store has)
    const unsub = store.subscribe((state) => {
        if (state.summaryLoading) {
            slot.textContent = "Generating summary...";
            return;
        }
        slot.textContent = state.summary ?? "Not generated yet.";
    });

    async function generateFrom(text: string) {
        // Let the browser paint "Generating…" before heavy work
        // slot.textContent = "Generating summary...";
        try {
            console.log("[summary.generateFrom] Entry, generating using worker");
            // Load 1 frame first, to let user see the "Generating summary...".
            // This promise will resolve and move on with code execution on the next frame.
            // And it doesn't matter how fast the 2nd frame comes, because the loading message rendered.
            await new Promise<void>((r) => requestAnimationFrame(() => r()));
            const summary = await runWorkerSummary(text)
            return summary;
        } catch (error) {
            console.log("[summary.generateFrom] Error, fallback to basic nlp", error);
            return {
                summary: summarizeExtractive(text, 5) || "...",
                runtime: undefined,
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
