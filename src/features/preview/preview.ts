import type { Store } from "../../core/types";

const PREVIEW_CHAR_LIMIT = 2000;

function formatUrlLabel(url: string): string {
    if (!url) return "";

    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

export function mountPreview(
    slot: HTMLElement,
    store: Store,
    refs: { titleEl: HTMLElement; urlEl: HTMLElement },
) {
    const metaEl = document.createElement("div");
    metaEl.className = "lr-preview-meta";

    const warningEl = document.createElement("div");
    warningEl.className = "lr-preview-warning";
    warningEl.hidden = true;

    const bodyEl = document.createElement("div");
    bodyEl.className = "lr-preview-body";

    slot.replaceChildren(metaEl, warningEl, bodyEl);

    function setMeta(label: string, tone: "muted" | "warning" | "info" = "muted") {
        metaEl.replaceChildren();

        const chip = document.createElement("span");
        chip.className = "lr-preview-chip";
        chip.dataset.tone = tone;
        chip.textContent = label;

        metaEl.appendChild(chip);
    }

    return store.subscribe((state) => {
        const title = state.page?.title ?? "";
        const url = state.page?.url ?? "";

        refs.titleEl.textContent = title || "No page title";
        refs.urlEl.textContent = formatUrlLabel(url);
        refs.urlEl.title = url;

        slot.setAttribute("aria-busy", state.pageLoading ? "true" : "false");

        warningEl.hidden = true;
        warningEl.textContent = "";
        bodyEl.dataset.state = "";

        if (state.pageLoading) {
            setMeta("Loading page text...", "muted");
            bodyEl.dataset.state = "loading";
            bodyEl.textContent = "Extracting readable text from the current page...";
            return;
        }

        const page = state.page;

        if (!page) {
            setMeta("No page loaded", "muted");
            bodyEl.dataset.state = "empty";
            bodyEl.textContent = "Open a supported webpage, then refresh LazyReader.";
            return;
        }

        if (page.quality === "empty") {
            setMeta("No readable text", "warning");
            bodyEl.dataset.state = "empty";
            bodyEl.textContent = "No readable page text was found.";
            return;
        }

        const preview = page.text.slice(0, PREVIEW_CHAR_LIMIT);
        const isTruncated = page.text.length > PREVIEW_CHAR_LIMIT;

        if (page.quality === "weak") {
            warningEl.hidden = false;
            warningEl.textContent =
                "Only a small amount of readable text was found. Summary quality may be limited.";
        }

        const qualityLabel =
            page.quality === "long"
                ? "Long page"
                : page.quality === "weak"
                    ? "Weak extraction"
                    : "Readable page";

        setMeta(`${page.wordCount} words extracted · ${qualityLabel}`, page.quality === "weak" ? "warning" : "info");

        bodyEl.textContent = isTruncated
            ? `${preview}\n\n[Preview truncated to first ${PREVIEW_CHAR_LIMIT.toLocaleString()} characters...]`
            : preview;
    });
}