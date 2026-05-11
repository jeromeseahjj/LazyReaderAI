// Offload to a background worker as the whole UI is freezing when the job is running
import type { WorkerRequest, WorkerResponse } from "../../core/types";
import {
    getModelRuntime,
    summarizeLongText,
    recommendFromSummaryWithModel,
} from "./summarizer";

self.postMessage({ type: "READY" } satisfies WorkerResponse);

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const msg = event.data;
    console.log("[summary.worker] got request", msg.requestId);

    try {
        if (msg.type === "SUMMARIZE") {
            const summary = await summarizeLongText(msg.text);
            const runtime = getModelRuntime();

            self.postMessage({
                type: "RESULT",
                requestId: msg.requestId,
                summary,
                runtime,
            } satisfies WorkerResponse);

            return;
        }

        if (msg.type === "RECOMMEND") {
            const recommendations = await recommendFromSummaryWithModel(
                msg.summary,
                msg.prompt,
            );

            self.postMessage({
                type: "RECOMMENDATION_RESULT",
                requestId: msg.requestId,
                recommendations,
            } satisfies WorkerResponse);

            return;
        }
    } catch (error) {
        self.postMessage({
            type: "ERROR",
            requestId: msg.requestId,
            error: error instanceof Error ? error.message : String(error),
        } satisfies WorkerResponse);
    }
};