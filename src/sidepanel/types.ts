export type PagePayload = { title: string; url: string; text: string };

export type AppState = {
    pageLoading: boolean;
    summaryLoading: boolean;
    error?: string;
    page?: PagePayload;
    runtime?: RuntimeStatus;
    summary?: string;
    recommendations: string[];
};

export type RuntimeStatus = {
    webgpuAvailable: boolean;
    transformersReady: boolean;
    backend: "webgpu" | "wasm";
    notes: string[];
    modelReady?: boolean;
    modelName?: string;
};