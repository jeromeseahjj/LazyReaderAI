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

        function setValue(
            el: HTMLElement,
            value: string,
            tone: "good" | "warning" | "info" | "muted" = "muted",
        ) {
            el.textContent = value;
            el.dataset.tone = tone;
        }

        function setNotes(notes: string[]) {
            refs.notesEl.replaceChildren();

            for (const note of notes) {
                const li = document.createElement("li");
                li.textContent = note;
                refs.notesEl.appendChild(li);
            }
        }

        if (!runtime) {
            slot.setAttribute("aria-busy", "true");

            setValue(refs.backendEl, "checking", "muted");
            setValue(refs.activeBackendEl, "checking", "muted");
            setValue(refs.webgpuEl, "checking", "muted");
            setValue(refs.transformersEl, "checking", "muted");
            setValue(refs.fallbackEl, "checking", "muted");

            setNotes(["Checking runtime..."]);
            return;
        }

        slot.setAttribute("aria-busy", "false");

        setValue(
            refs.backendEl,
            runtime.preferredBackend.toUpperCase(),
            "info",
        );

        setValue(
            refs.activeBackendEl,
            runtime.activeBackend
                ? runtime.activeBackend.toUpperCase()
                : "not loaded yet",
            runtime.activeBackend ? "good" : "muted",
        );

        setValue(
            refs.webgpuEl,
            runtime.webgpuAvailable ? "available" : "not available",
            runtime.webgpuAvailable ? "good" : "warning",
        );

        setValue(
            refs.transformersEl,
            runtime.modelReady
                ? runtime.modelName ?? "model ready"
                : runtime.transformersReady
                    ? "import ready"
                    : "not ready",
            runtime.transformersReady ? "good" : "warning",
        );

        setValue(
            refs.fallbackEl,
            runtime.fallbackUsed ? "yes" : "no",
            runtime.fallbackUsed ? "warning" : "good",
        );

        setNotes(
            runtime.notes.length > 0
                ? runtime.notes
                : ["Runtime check complete."],
        );
    });
}