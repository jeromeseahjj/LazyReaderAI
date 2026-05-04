import type { createStore } from "./store";

// Common

export type AppState = {
    pageLoading: boolean;
    summaryLoading: boolean;
    error?: string | undefined;
    page?: PagePayload | undefined;
    runtime?: RuntimeStatus | undefined;
    summary?: string | undefined;
    summaryMeta?: SummaryMeta | undefined;
    recommendations: string[];
};

export type PagePayload = { title: string; url: string; text: string };
export type Store = ReturnType<typeof createStore<AppState>>;

// UI
export type ShellRefs = {
    titleEl: HTMLElement;
    urlEl: HTMLElement;
    btnRefresh: HTMLButtonElement;
    btnSummarize: HTMLButtonElement;
    runtimeEl: HTMLElement;
    backendEl: HTMLElement;
    activeBackendEl: HTMLElement;
    webgpuEl: HTMLElement;
    transformersEl: HTMLElement;
    fallbackEl: HTMLElement;
    notesEl: HTMLElement;
    previewEl: HTMLElement;
    summaryEl: HTMLElement;
    recommendationsEl: HTMLElement;
    errorEl: HTMLElement;
};

// Summary Worker
export type SummarizeRequest = {
    type: "SUMMARIZE";
    requestId: string;
    text: string;
};

export type WorkerRequest = SummarizeRequest;

export type WorkerResponse =
    | {
        type: "READY";
    }
    | {
        type: "RESULT";
        requestId: string;
        summary: string;
        runtime: SummaryRuntime;
    }
    | {
        type: "ERROR";
        requestId: string;
        error: string;
    };



// Controller
export type SummaryResult = {
    summary: string;
    runtime?: SummaryRuntime | undefined;
    meta: SummaryMeta;
};

export type SummaryController = {
    generateFrom: (text: string) => Promise<SummaryResult>;
};

export type RecommendationsController = {
    generateFrom: (text: string) => Promise<string[]>;
};

export type AppControllerDeps = {
    store: Store;
    summary: SummaryController;
    fetchPage: () => Promise<PagePayload>;
    probeRuntime: () => Promise<RuntimeStatus>;
    getRecommendations: () => Promise<RecommendationsController>;
};

// Transformer related
export type Backend = "webgpu" | "wasm";

export type RuntimeStatus = {
    webgpuAvailable: boolean;
    transformersReady: boolean;
    preferredBackend: Backend;
    activeBackend?: Backend | undefined;
    modelReady?: boolean | undefined;
    modelName?: string | undefined;
    fallbackUsed?: boolean | undefined;
    notes: string[];
};

export type SummaryRuntime = {
    preferredBackend: Backend;
    activeBackend?: Backend | undefined;
    modelReady: boolean;
    modelName: string;
    fallbackUsed: boolean;
    notes: string[];
};

// Summary
export type SummarySource = "model" | "extractive-fallback";

export type SummaryMeta = {
    source: SummarySource;
    backend?: Backend | undefined;
    modelName?: string | undefined;
    fallbackUsed: boolean;
    generatedAt: number;
    inputWordCount: number;
};