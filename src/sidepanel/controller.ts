import type { createStore } from "./store";
import type { AppState, PagePayload, RuntimeStatus } from "./types";

type Store = ReturnType<typeof createStore<AppState>>;

type SummaryController = {
    generateFrom: (text: string) => Promise<string>;
};

type RecommendationsController = {
    generateFrom: (text: string) => Promise<string[]>;
};

export type AppControllerDeps = {
    store: Store;
    summary: SummaryController;
    fetchPage: () => Promise<PagePayload>;
    probeRuntime: () => Promise<RuntimeStatus>;
    getRecommendations: () => Promise<RecommendationsController>;
};

export function createAppController({
    store,
    summary,
    fetchPage,
    probeRuntime,
    getRecommendations,
}: AppControllerDeps) {
    let runId = 0;

    function clearTransientState() {
        store.set({
            pageLoading: true,
            summaryLoading: false,
            recommendations: [],
        });
    }

    async function refresh() {
        const myRun = ++runId;
        clearTransientState();

        try {
            const [page, runtime] = await Promise.all([
                fetchPage(),
                probeRuntime(),
            ]);

            if (myRun !== runId) return;

            store.set({
                pageLoading: false,
                summaryLoading: false,
                page,
                runtime,
            });

            await summary.generateFrom(page.text);

            if (myRun !== runId) return;

            setTimeout(async () => {
                if (myRun !== runId) return;

                try {
                    const recommendations = await getRecommendations();

                    if (myRun !== runId) return;

                    const items = await recommendations.generateFrom(page.text);

                    if (myRun !== runId) return;

                    store.set({ recommendations: items });
                } catch (error) {
                    if (myRun !== runId) return;

                    store.set({
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                }
            }, 0);
        } catch (error) {
            if (myRun !== runId) return;

            store.set({
                pageLoading: false,
                summaryLoading: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    async function summarizeCurrentPage() {
        const state = store.get();
        const text = state.page?.text?.trim() ?? "";

        if (!text || state.pageLoading) {
            return;
        }

        try {
            await summary.generateFrom(text);
        } catch (error) {
            store.set({
                summaryLoading: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    return {
        refresh,
        summarizeCurrentPage,
    };
}
