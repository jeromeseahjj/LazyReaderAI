import type { RecommendationInput, Store, WorkerResponse } from "../../core/types";
import recommendationPrompt from "./recommendation.prompt.md?raw";
import { extractTopKeywords } from "./keywords";
import { createLoadingState } from "../../ui/loading";
import { getModelWorker } from "../model/modelWorker";


function runIdle(): Promise<void> {
    return new Promise((resolve) => {
        // Resolves when browser is idle
        const ric = (window as any).requestIdleCallback as
            | undefined
            | ((cb: () => void) => void);
        if (ric) ric(() => resolve());
        else setTimeout(() => resolve(), 0); // Fallback in the event ric is undefined.
    });
}

export function mountRecommendations(slot: HTMLElement, store: Store) {
    const statusEl = document.createElement("div");
    statusEl.className = "lr-recommendations-status";

    const list = document.createElement("div");
    list.className = "lr-recommendations-list";

    slot.replaceChildren(statusEl, list);

    const unsub = store.subscribe((state) => {
        if (state.pageLoading) {
            slot.setAttribute("aria-busy", "true");
            list.replaceChildren(createLoadingState("Loading page..."));
            return;
        }

        if (state.summaryLoading) {
            slot.setAttribute("aria-busy", "true");
            list.replaceChildren(createLoadingState("Waiting for summary..."));
            return;
        }

        if (state.recommendationsLoading) {
            slot.setAttribute("aria-busy", "true");
            list.replaceChildren(createLoadingState("Generating recommendations..."));
            return;
        }

        slot.setAttribute("aria-busy", "false");

        const items = state.recommendations ?? [];
        list.replaceChildren();

        if (items.length === 0) {
            const emptyEl = document.createElement("div");
            emptyEl.className = "lr-recommendations-empty";
            emptyEl.textContent = "Recommendations will appear after the summary.";
            list.appendChild(emptyEl);
            return;
        }

        for (const item of items) {
            const row = document.createElement("div");
            row.className = "lr-recommendation-item";

            const icon = document.createElement("span");
            icon.className = "lr-recommendation-icon";
            icon.textContent = getRecommendationIcon(item);

            const text = document.createElement("span");
            text.className = "lr-recommendation-text";
            text.textContent = item;

            row.append(icon, text);
            list.appendChild(row);
        }
    });

async function generateFrom(input: RecommendationInput) {
    await runIdle();

    const worker = getModelWorker();
    const requestId = crypto.randomUUID();

    return new Promise<string[]>((resolve, reject) => {
        const onMessage = (event: MessageEvent<WorkerResponse>) => {
            const msg = event.data;

            if (msg.type === "READY") return;
            if (!("requestId" in msg) || msg.requestId !== requestId) return;

            worker.removeEventListener("message", onMessage);

            if (msg.type === "RECOMMENDATION_RESULT") {
                resolve(msg.recommendations);
                return;
            }

            if (msg.type === "ERROR") {
                reject(new Error(msg.error));
            }
        };

        worker.addEventListener("message", onMessage);

        worker.postMessage({
            type: "RECOMMEND",
            requestId,
            summary: input.summary,
            prompt: recommendationPrompt,
        });
    });
}

    return { unsub, generateFrom };
}

function getRecommendationIcon(item: string): string {
    if (item.startsWith("Try searching:")) return "⌕";
    if (item.startsWith("Compare:")) return "⇄";
    return "•";
}
