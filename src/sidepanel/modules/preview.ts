import type { AppState } from "../types";
import type { createStore } from "../store";

type Store = ReturnType<typeof createStore<AppState>>;

export function mountPreview(slot: HTMLElement, store: Store, refs: { titleEl: HTMLElement; urlEl: HTMLElement }) {
    return store.subscribe((state) => {
        refs.titleEl.textContent = state.page?.title ?? "";
        refs.urlEl.textContent = state.page?.url ?? "";

        if (state.loading) {
            slot.textContent = "Loading...";
            return;
        }

        slot.textContent = (state.page?.text ?? "").slice(0, 2000);
    })

}