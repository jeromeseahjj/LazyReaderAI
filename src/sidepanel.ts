// types
import type { AppState, PagePayload, RecommendationsController } from "./sidepanel/types";

// infra / state
import { createStore } from "./sidepanel/store";
import { createAppController } from "./sidepanel/controller";

// ui modules
import { mountShell } from "./sidepanel/shell";
import { mountPreview } from "./sidepanel/modules/preview";
import { mountSummary } from "./sidepanel/modules/summary";
import { mountRuntime } from "./sidepanel/modules/runtime";

// app controller
// feature deps
import { probeRuntime } from "./sidepanel/transformer";

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
                import("./sidepanel/modules/recommendations").then(
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
