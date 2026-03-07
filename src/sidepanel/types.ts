export type PagePayload = { title: string; url: string; text: string };

export type AppState = {
    loading: boolean;
    page?: PagePayload;
    error?: string;
    summary?: string;
    runtime?: RuntimeStatus;
    recommendations?: string[];
}

export type RuntimeStatus = {
    webgpuAvailable: boolean;
    transformersReady: boolean;
    backend: "webgpu" | "wasm";
    notes: string[];
};