import type { AppState } from "../types";
import type { createStore } from "../store";
import { summarizeExtractive } from "../nlp";
import { escapeHtml } from "../../common/utils";

type Store = ReturnType<typeof createStore<AppState>>;

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
        slot.textContent = "Generating summary...";
        // Load 1 frame first, to let user see the "Generating summary...".
        // This promise will resolve and move on with code execution on the next frame.
        // And it doesn't matter how fast the 2nd frame comes, because the loading message rendered.
        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        const summary = summarizeExtractive(text, 5) || "Could not summarize this page (not enough readable text).";
        store.set({ summary });
        return summary;
    }
    
    return { unsub, generateFrom };
}