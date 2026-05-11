import type { RecommendationInput, Store, WorkerResponse } from "../../core/types";
import recommendationPrompt from "./recommendation.prompt.md?raw";
import { extractTopKeywords, extractTopPhrases } from "./keywords";
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

function buildFallbackRecommendations(input: RecommendationInput): string[] {
    const sourceText = [
        input.title,
        input.title,
        input.summary,
        input.pageText.slice(0, 4000),
    ].join(" ");

    const phrases = extractTopPhrases(sourceText, 12);
    const keywords = extractTopKeywords(sourceText, 12);

    const candidates = [...phrases, ...keywords]
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item.length >= 4)
        .filter((item) => item.length <= 60);

    const unique = [...new Set(candidates)];

    const topicA = unique[0] ?? "key ideas";
    const topicB = unique[1] ?? "background context";
    const topicC = unique[2] ?? "related concepts";
    const topicD = unique[3] ?? "further reading";

    return [
        `Related topic: ${topicA}`,
        `Related topic: ${topicB}`,
        `Try searching: "${topicA}"`,
        `Compare: "${topicA} vs ${topicC}"`,
        `Related topic: ${topicD}`,
    ];
}

function normalizeModelRecommendations(items: unknown): string[] {
    if (!Array.isArray(items)) return [];

    return items
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)

        // Reject useless outputs like "5", "1.", "-", etc.
        .filter((item) => !/^\d+\.?$/.test(item))

        // Reject very short answers like "AI", "news", "who"
        .filter((item) => item.length >= 8)

        // Require at least some real letters
        .filter((item) => /[a-zA-Z]{4,}/.test(item))

        // Optional but recommended: require your expected formats
        .filter((item) =>
            item.startsWith("Related topic:") ||
            item.startsWith("Try searching:") ||
            item.startsWith("Compare:")
        )

        .slice(0, 5);
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

    // Not using for now. Maybe v2 with API support from external service providers.
    async function generateFromModel(input: RecommendationInput) {
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
                    console.log("[recommendations.generateFrom] RECOMMENDATION_RESULT:", msg.recommendations);

                    const modelItems = normalizeModelRecommendations(msg.recommendations);
                    const fallback = buildFallbackRecommendations(input);

                    resolve(modelItems.length >= 3 ? modelItems : fallback);
                    return;
                }

                if (msg.type === "ERROR") {
                    resolve(buildFallbackRecommendations(input));
                    return;
                }
            };

            worker.addEventListener("message", onMessage);

            worker.postMessage({
                type: "RECOMMEND",
                requestId,
                summary: [
                    `Title: ${input.title}`,
                    "",
                    "Summary:",
                    input.summary,
                    "",
                    "Page keywords/context:",
                    input.pageText.slice(0, 1200),
                ].join("\n"),
                prompt: recommendationPrompt,
            });
        });
    }

    async function generateFrom(input: RecommendationInput) {
        await runIdle();

        return buildFallbackRecommendations(input);
    }

    return { unsub, generateFrom };
}

function getRecommendationIcon(item: string): string {
    if (item.startsWith("Try searching:")) return "⌕";
    if (item.startsWith("Compare:")) return "⇄";
    return "•";
}
