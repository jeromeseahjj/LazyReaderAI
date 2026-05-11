let modelWorker: Worker | null = null;

export function getModelWorker() {
    if (!modelWorker) {
        modelWorker = new Worker(
            new URL("../summary/summary.worker.ts", import.meta.url),
            { type: "module" },
        );
    }

    return modelWorker;
}