import type { AppState, PagePayload } from "./sidepanel/types";
import { createStore } from "./sidepanel/store";
import { mountShell } from "./sidepanel/shell";
import { mountPreview } from "./sidepanel/modules/preview";
import { mountSummary } from "./sidepanel/modules/summary";
import { probeRuntime } from "./sidepanel/transformer";
import { mountRuntime } from "./sidepanel/modules/runtime";
import { summarizeWithModel } from "./summarizer";
import { summarizeExtractive } from "./sidepanel/nlp";

const root = document.getElementById("app")!;

const store = createStore<AppState>({
    pageLoading: true,
    summaryLoading: true,
    recommendations: [],
});

const shell = mountShell(root);
mountPreview(shell.previewEl, store, {
    titleEl: shell.titleEl,
    urlEl: shell.urlEl,
});
const summary = mountSummary(shell.summaryEl, store);
mountRuntime(shell.runtimeEl, store, {
    backendEl: shell.backendEl,
    webgpuEl: shell.webgpuEl,
    transformersEl: shell.transformersEl,
    notesEl: shell.notesEl,
});

// Recommendations module is lazy
let recommendationsMod: null | {
    generateFrom: (text: string) => Promise<string[]>;
} = null;

let runId = 0;

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function fetchPage(): Promise<PagePayload> {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    if (!tab?.id) throw new Error("No active tab");

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
    });

    return (await chrome.tabs.sendMessage(tab.id, {
        type: "GET_PAGE_TEXT",
    })) as PagePayload;
}

async function load() {
    const myRun = ++runId;

    store.set({
        pageLoading: true,
        summaryLoading: true,
        recommendations: [],
    });
    shell.errorEl.textContent = "";

    try {
        const [page, runtime] = await Promise.all([
            fetchPage(),
            probeRuntime(),
        ]);

        if (myRun !== runId) return; // ignore stale results

        store.set({ 
            pageLoading: false,
            summaryLoading: false,
            page, 
            runtime 
        });

        // Summary first (fast path)
        await summary.generateFrom(page.text);
        if (myRun !== runId) return;

        // Recommendations later (lazy import + idle compute)
        queueMicrotask(async () => {
            if (myRun !== runId) return;

            const { mountRecommendations } =
                await import("./sidepanel/modules/recommendations");
            if (myRun !== runId) return;

            if (!recommendationsMod) {
                recommendationsMod = mountRecommendations(
                    shell.recommendationsEl,
                    store,
                );
            }
            await recommendationsMod.generateFrom(page.text);
        });
    } catch (e: any) {
        store.set({ 
            pageLoading: false,
            summaryLoading: false, 
            error: e?.message ?? String(e) });
        shell.errorEl.textContent = e?.message ?? String(e);
    }
}

// Wire buttons once (no re-render = no re-binding needed)
shell.btnRefresh.addEventListener("click", load);

shell.btnSummarize.addEventListener("click", async () => {
    const text = store.get().page?.text ?? "";
    if (!text.trim()) return;
    store.set({
        summaryLoading: true
    });
    try {
        const summary = await summarizeWithModel(text);
        store.set({
            summaryLoading: false,
            summary: summary || summarizeExtractive(text, 5)
        })
    } catch (error) {
        store.set({
            summaryLoading: false,
            summary: summarizeExtractive(text, 5),
            error: error instanceof Error ? error.message : String(error),
        })
    }
});

load();
