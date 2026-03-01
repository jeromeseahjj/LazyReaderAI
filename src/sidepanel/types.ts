export type PagePayload = { title: string; url: string; text: string };

export type AppState = {
    loading: boolean;
    page?: PagePayload;
    error?: string;
    summary?: string;
    recommendations?: string;
}