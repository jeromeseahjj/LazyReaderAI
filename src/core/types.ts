import type { createStore } from "./store";

// Common
export type RuntimeStatus = {
    webgpuAvailable: boolean;
    transformersReady: boolean;
    backend: "webgpu" | "wasm";
    notes: string[];
    modelReady?: boolean;
    modelName?: string;
};

export type AppState = {
    pageLoading: boolean;
    summaryLoading: boolean;
    error?: string;
    page?: PagePayload;
    runtime?: RuntimeStatus;
    summary?: string;
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
    webgpuEl: HTMLElement;
    transformersEl: HTMLElement;
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
    }
    | {
        type: "ERROR";
        requestId: string;
        error: string;
    };

// Controller
type SummaryController = {
    generateFrom: (text: string) => Promise<string>;
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