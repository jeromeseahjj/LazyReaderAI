import type { createStore } from "../store";
import type { AppState, RuntimeStatus } from "../types";

type Store = ReturnType<typeof createStore<AppState>>;

export function mountRuntime(
    slot: HTMLElement,
    store: Store,
    refs: {
        backendEl: HTMLElement;
        webgpuEl: HTMLElement;
        transformersEl: HTMLElement;
        notesEl: HTMLElement;
    },
) {
    return store.subscribe((state) => {
        const runtime = state.runtime;

        if (!runtime) {
            refs.backendEl.textContent = "";
            refs.webgpuEl.textContent = "";
            refs.transformersEl.textContent = "";
            refs.notesEl.textContent = "Checking runtime...";
            return;
        }

        refs.backendEl.textContent = `Preferred backend: ${runtime.backend}`;
        refs.webgpuEl.textContent = `WebGPU: ${
            runtime.webgpuAvailable ? "available" : "not available"
        }`;
        refs.transformersEl.textContent = `Transformers.js: ${
            runtime.transformersReady ? "ready" : "not ready"
        }`;
        
        // Without this, the whole list keeps getting bigger without getting cleared.
        refs.notesEl.replaceChildren();

        for (const note of runtime.notes) {
            const li = document.createElement("li");
            li.textContent = note;
            refs.notesEl.appendChild(li);
        }
    });
}