import type { Store } from "../../core/types";

export function mountRuntime(
    slot: HTMLElement,
    store: Store,
    refs: {
        backendEl: HTMLElement;
        activeBackendEl: HTMLElement;
        webgpuEl: HTMLElement;
        transformersEl: HTMLElement;
        fallbackEl: HTMLElement;
        notesEl: HTMLElement;
    },
) {
    return store.subscribe((state) => {
        const runtime = state.runtime;

        if (!runtime) {
            refs.backendEl.textContent = "";
            refs.webgpuEl.textContent = "";
            refs.transformersEl.textContent = "";
            refs.fallbackEl.textContent = "";
            refs.notesEl.textContent = "Checking runtime...";
            return;
        }

        refs.backendEl.textContent = `Preferred backend: ${runtime.preferredBackend}`;
        refs.activeBackendEl.textContent = `Active backend: ${runtime.activeBackend ?? "not loaded yet"}`;
        refs.webgpuEl.textContent = `WebGPU: ${runtime.webgpuAvailable ? "available" : "not available"
            }`;

        refs.transformersEl.textContent = runtime.modelReady
            ? `Model: ${runtime.modelName ?? "unknown"}`
            : "Model: not loaded";
        
        refs.fallbackEl.textContent = `Model fallback: ${runtime.fallbackUsed ? "yes" : "no"}`;
        // Without this, the whole list keeps getting bigger without getting cleared.
        refs.notesEl.replaceChildren();
            
        for (const note of runtime.notes) {
            const li = document.createElement("li");
            li.textContent = note;
            refs.notesEl.appendChild(li);
        }
    });
}