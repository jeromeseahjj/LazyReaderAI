import type { Store } from "../../core/types";

function formatUrlLabel(url: string): string {
    if (!url) return "";

    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

export function mountPreview(slot: HTMLElement, store: Store, refs: { titleEl: HTMLElement; urlEl: HTMLElement }) {
    return store.subscribe((state) => {
        const title = state.page?.title ?? "";
        const url = state.page?.url ?? "";

        refs.titleEl.textContent = title || "No page title";
        refs.urlEl.textContent = formatUrlLabel(url);
        refs.urlEl.title = url;

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
        let warning: string | undefined;
        console.log("[preview.mountPreview] Page quality before switch case", page.quality);

        switch (page.quality) {
            case "empty":
                slot.textContent = "No readable page text was found.";
                return;

            case "weak":
                warning = "[Warning] Only a small amount of readable text was found. Summary quality may be limited.\n\n";
                break;

            case "ok":
            case "long":
                break;
        }

        const cutoff = page.text.length > 2000
            ? "\n\n[Preview truncated to first 2,000 characters...]"
            : "";

        slot.textContent = [
            `${warning ?? ""}${page.wordCount} words extracted\n`,
            `${preview}${cutoff}`,
        ].join("\n");

    })

}