import type { Store } from "../../core/types";

export function mountPreview(slot: HTMLElement, store: Store, refs: { titleEl: HTMLElement; urlEl: HTMLElement }) {
    return store.subscribe((state) => {
        refs.titleEl.textContent = state.page?.title ?? ""
        refs.urlEl.textContent = state.page?.url ?? ""

        if (state.pageLoading) {
            slot.textContent = "Loading...";
            return;
        }

        const page = state.page;

        if (!page) {
            slot.textContent = "No page loaded yet.";
            return;
        }


        const preview = page.text.slice(0, 2000);
        let qualityTextContent, warning;
        console.log("[preview.mountPreview] Page quality before switch case", page.quality);

        switch (page.quality) {
            case "empty":
                qualityTextContent = "No readable page text was found.";
                return;
            case "weak":
                warning = "[Warning] Only a small amount of readable text was found. Summary quality may be limited.\n\n";
            default:
                const cutoff = page.text.length > 2000
                    ? "\n\n[Preview truncated to first 2,000 characters...]"
                    : "";

                slot.textContent = [
                    `${warning ?? ""}${page.wordCount} words extracted\n`,
                    `${preview}${cutoff}`
                ].join("\n");
        }
        
    })

}