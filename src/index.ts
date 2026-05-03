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

// Wire buttons once (no re-render = no re-binding needed)
shell.btnRefresh.addEventListener("click", () => {
    void controller.refresh();
});

shell.btnSummarize.addEventListener("click", () => {
    void controller.summarizeCurrentPage();
});

const renderError = (message?: string) => {
    shell.errorEl.textContent = message ?? "";
    shell.errorEl.hidden = !message;
};

renderError(store.get().error);

store.subscribe((state) => {
    renderError(state.error);
});

void controller.refresh();