import type { AppControllerDeps } from "./core/types";

export function createAppController({
    store,
    summary,
    fetchPage,
    probeRuntime,
    getRecommendations,
}: AppControllerDeps) {
    let runId = 0;
    let summaryRequestId = 0;

    async function runSummary(text: string) {
        const mySummaryRequest = ++summaryRequestId;

        store.set({
            summaryLoading: true,
        });

        try {
            const result = await summary.generateFrom(text);

            if (mySummaryRequest !== summaryRequestId) {
                return;
            }

            store.set((prev) => ({
                summary: result.summary,
                summaryMeta: result.meta,
                summaryLoading: false,
                runtime: prev.runtime && result.runtime
                    ? { 
                        ...prev.runtime, 
                        ...result.runtime,
                        notes: [
                            ...(prev.runtime.notes ?? []),
                            ...(result.runtime.notes ?? [])
                        ]}
                    : prev.runtime,
            }));
        } catch (error) {
            if (mySummaryRequest !== summaryRequestId) {
                return;
            }

            store.set({
                summaryLoading: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    function clearTransientState() {
        store.set({
            pageLoading: true,
            summaryLoading: false,
            summary: undefined,
            summaryMeta: undefined,
            recommendations: [],
            error: undefined
        });
    }

    async function refresh() {
        const myRun = ++runId;
        summaryRequestId++;
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

            await runSummary(page.text);

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

        await runSummary(text);
    }

    return {
        refresh,
        summarizeCurrentPage,
    };
}
