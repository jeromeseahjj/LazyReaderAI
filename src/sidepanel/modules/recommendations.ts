import type { AppState } from "../types";
import type { createStore } from "../store";
import { extractTopKeywords } from "../nlp";
import { escapeHtml } from "../../common/utils";

type Store = ReturnType<typeof createStore<AppState>>;

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
    statusEl.style.marginBottom = "8px";

    const list = document.createElement("ul");
    list.style.margin = "0";
    list.style.paddingLeft = "18px";

    slot.replaceChildren(statusEl, list);

    const unsub = store.subscribe((state) => {
        const items = state.recommendations ?? [];
        list.innerHTML = "";
        if (items.length === 0) {
            const li = document.createElement("li");
            li.textContent = state.pageLoading
                ? "Loading…"
                : "No recommendations yet.";
            list.appendChild(li);
            return;
        }
        for (const x of items) {
            const li = document.createElement("li");
            li.textContent = x;
            list.appendChild(li);
        }
    });

    async function generateFrom(text: string) {
        statusEl.textContent = "Generating recommendations...";

        try {
            await runIdle();

            const keywords = extractTopKeywords(text, 8);
            const recommendations = [
                ...keywords.slice(0, 5).map((k) => `Related topic: ${k}`),
                ...(keywords.length >= 2
                    ? [`Try searching: "${keywords[0]} ${keywords[1]}"`]
                    : []),
                ...(keywords.length >= 3
                    ? [`Compare: "${keywords[0]} vs ${keywords[2]}"`]
                    : []),
            ];

            return recommendations;
        } finally {
            statusEl.textContent = "";
        }
    }

    return { unsub, generateFrom };
}
