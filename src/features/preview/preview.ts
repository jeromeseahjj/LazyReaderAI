import type { Store } from "../../core/types";

export function mountPreview(slot: HTMLElement, store: Store, refs: { titleEl: HTMLElement; urlEl: HTMLElement }) {
    return store.subscribe((state) => {
        refs.titleEl.textContent = state.page?.title ?? ""
        refs.urlEl.textContent = state.page?.url ?? ""

        if (state.pageLoading) {
            slot.textContent = "Loading...";
            return;
        }

        slot.textContent = (state.page?.text ?? "").slice(0, 2000);
    })

}