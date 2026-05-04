import { createAppController } from "./controller";
import { createStore } from "./core/store";
import type { AppState, PagePayload, RecommendationsController } from "./core/types";
import { mountPreview } from "./features/preview/preview";
import { probeRuntime } from "./features/runtime/probeRuntime";
import { mountRuntime } from "./features/runtime/runtime";
import { mountSummary } from "./features/summary/summary";
import { mountShell } from "./ui/shell";

let recommendationsControllerPromise:
    | Promise<RecommendationsController>
    | undefined;

let refreshTimer: number | undefined;

const root = document.getElementById("app")!;

const store = createStore<AppState>({
    pageLoading: true,
    summaryLoading: false,
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
    activeBackendEl: shell.activeBackendEl,
    transformersEl: shell.transformersEl,
    fallbackEl: shell.fallbackEl,
    notesEl: shell.notesEl,
});

const controller = createAppController({
    store,
    summary,
    fetchPage,
    probeRuntime,
    getRecommendations: async () => {
        if (!recommendationsControllerPromise) {
            recommendationsControllerPromise =
                import("./features/recommendations/recommendations").then(
                    ({ mountRecommendations }) =>
                        mountRecommendations(shell.recommendationsEl, store),
                );
        }

        return recommendationsControllerPromise;
    },
});

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

// Debounce refresh for onActivated and onUpdated
function scheduleRefresh() {
    if (refreshTimer !== undefined) {
        clearTimeout(refreshTimer);
    }

    refreshTimer = window.setTimeout(() => {
        refreshTimer = undefined;
        void controller.refresh();
    }, 250);
}

// Wire buttons once (no re-render = no re-binding needed)
shell.btnRefresh.addEventListener("click", () => {
    void controller.refresh();
});

shell.btnSummarize.addEventListener("click", () => {
    void controller.summarizeCurrentPage();
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type !== "ACTIVE_PAGE_CHANGED") return;
    scheduleRefresh();
})

const renderError = (message?: string) => {
    shell.errorEl.textContent = message ?? "";
    shell.errorEl.hidden = !message;
};

renderError(store.get().error);

store.subscribe((state) => {
    renderError(state.error);

    const busy = state.pageLoading || state.summaryLoading;
    const hasPageText = Boolean(state.page?.text?.trim());

    shell.btnRefresh.disabled = busy;
    shell.btnSummarize.disabled = busy || !hasPageText;
});

void controller.refresh();