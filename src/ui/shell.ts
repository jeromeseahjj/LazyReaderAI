import type { ShellRefs } from "../core/types";
import { applyTheme } from "./theme";

function section(title: string, body: HTMLElement) {
    const wrap = document.createElement("section");
    const h = document.createElement("div");
    h.textContent = title;
    h.style.fontSize = "14px";
    h.style.opacity = ".7";
    h.style.marginBottom = "6px";
    wrap.appendChild(h);
    wrap.appendChild(body);
    return wrap;
}

function collapsibleSection(title: string, body: HTMLElement) {
    const details = document.createElement("details");
    details.className = "lr-disclosure-section";

    const summary = document.createElement("summary");
    summary.className = "lr-disclosure-summary";

    const label = document.createElement("span");
    label.textContent = title;

    const hint = document.createElement("span");
    hint.className = "lr-disclosure-hint";
    hint.textContent = "Optional";

    summary.append(label, hint);

    const content = document.createElement("div");
    content.className = "lr-disclosure-content";
    content.appendChild(body);

    details.append(summary, content);

    return details;
}

// function ensureShellStyles() {
//     if (document.getElementById("lr-shell-styles")) return;

//     const style = document.createElement("style");
//     style.id = "lr-shell-styles";
//     style.textContent = `

//     `;

//     document.head.appendChild(style);
// }

export function mountShell(root: HTMLElement): ShellRefs {
    root.innerHTML = "";

    applyTheme("default");
    // ensureShellStyles();

    document.documentElement.style.minHeight = "100%";
    document.documentElement.style.background = "var(--lr-bg, #12001f)";

    document.body.style.margin = "0";
    document.body.style.minHeight = "100dvh";
    document.body.style.background = "var(--lr-bg, var(--lr-bg-fallback, #12001f))";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.color = "var(--lr-text, #f8fafc)";
    document.body.style.transition = "background 220ms ease, color 220ms ease";

    root.style.minHeight = "100dvh";
    root.style.background = "transparent";

    const app = document.createElement("div");
    app.style.fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    app.style.minHeight = "100vh";
    app.style.boxSizing = "border-box";
    app.style.padding = "16px";
    app.style.display = "flex";
    app.style.flexDirection = "column";
    app.style.gap = "14px";
    app.style.background = "transparent";
    app.style.color = "var(--lr-text, #f8fafc)";

    // Header
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.flexDirection = "column";
    header.style.gap = "8px";
    header.style.padding = "14px";
    header.style.border = "1px solid var(--lr-card-border, rgba(255,255,255,0.18))";
    header.style.borderRadius = "20px";
    header.style.background = "var(--lr-card-bg, rgba(255,255,255,0.10))";
    header.style.backdropFilter = "blur(18px)";
    header.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.22)";


    const reading = document.createElement("div");
    reading.textContent = "Reading now";
    reading.style.alignSelf = "flex-start";
    reading.style.fontSize = "11px";
    reading.style.fontWeight = "700";
    reading.style.letterSpacing = "0.08em";
    reading.style.textTransform = "uppercase";
    reading.style.color = "var(--lr-accent, #c084fc)";
    reading.style.background = "var(--lr-badge-bg, rgba(255, 255, 255, 0.10))";
    reading.style.border = "1px solid var(--lr-card-border, rgba(255,255,255,0.18))";
    reading.style.borderRadius = "999px";
    reading.style.padding = "5px 9px";

    // Future proofing for themes next time
    // applyStyle(reading, {
    //     fontSize: "14px",
    //     opacity: ".7"
    // })

    const titleEl = document.createElement("div");
    titleEl.style.fontSize = "20px";
    titleEl.style.lineHeight = "1.2";
    titleEl.style.fontWeight = "750";
    titleEl.style.letterSpacing = "-0.03em";
    titleEl.style.color = "var(--lr-text, #f8fafc)";
    titleEl.style.textShadow = "0 1px 18px rgba(255, 255, 255, 0.12)";
    titleEl.style.display = "-webkit-box";
    titleEl.style.setProperty("-webkit-line-clamp", "3");
    titleEl.style.setProperty("-webkit-box-orient", "vertical");
    titleEl.style.overflow = "hidden";

    const urlEl = document.createElement("div");
    urlEl.style.alignSelf = "flex-start";
    urlEl.style.fontSize = "12px";
    urlEl.style.fontWeight = "500";
    urlEl.style.color = "var(--lr-muted, rgba(226, 232, 240, 0.72))";
    urlEl.style.background = "rgba(255, 255, 255, 0.08)";
    urlEl.style.border = "1px solid rgba(255, 255, 255, 0.12)";
    urlEl.style.borderRadius = "999px";
    urlEl.style.padding = "6px 10px";
    urlEl.style.maxWidth = "100%";
    urlEl.style.overflow = "hidden";
    urlEl.style.textOverflow = "ellipsis";
    urlEl.style.whiteSpace = "nowrap";

    header.append(reading, titleEl, urlEl);

    // Actions
    const actions = document.createElement("div");
    actions.className = "lr-actions";

    const btnRefresh = document.createElement("button");
    btnRefresh.type = "button";
    btnRefresh.className = "lr-button lr-button--secondary";
    btnRefresh.textContent = "Refresh";
    btnRefresh.title = "Reload page text and runtime status";

    const btnSummarize = document.createElement("button");
    btnSummarize.type = "button";
    btnSummarize.className = "lr-button lr-button--primary";
    btnSummarize.textContent = "Summarize";
    btnSummarize.title = "Generate a summary from this page";

    actions.append(btnRefresh, btnSummarize);

    // Slots
    const previewEl = document.createElement("div");
    previewEl.style.whiteSpace = "pre-wrap";
    previewEl.style.maxHeight = "220px";
    previewEl.style.overflow = "auto";
    previewEl.style.border = "1px solid #ddd";
    previewEl.style.padding = "8px";
    previewEl.style.borderRadius = "8px";
    previewEl.textContent = "Loading...";

    const summaryEl = document.createElement("div");
    summaryEl.className = "lr-summary-card";
    summaryEl.setAttribute("aria-live", "polite");
    summaryEl.setAttribute("aria-busy", "false");
    summaryEl.textContent = "Not generated yet.";

    const recommendationsEl = document.createElement("div");
    recommendationsEl.style.border = "1px solid #ddd";
    recommendationsEl.style.padding = "8px";
    recommendationsEl.style.borderRadius = "8px";
    recommendationsEl.textContent = "Recommendations will appear here.";

    const runtimeEl = document.createElement("div");
    runtimeEl.className = "lr-runtime-card";
    runtimeEl.setAttribute("aria-live", "polite");
    runtimeEl.setAttribute("aria-busy", "true");

    function runtimeRow(labelText: string) {
        const row = document.createElement("div");
        row.className = "lr-runtime-row";

        const label = document.createElement("span");
        label.className = "lr-runtime-label";
        label.textContent = labelText;

        const value = document.createElement("span");
        value.className = "lr-runtime-value";
        value.textContent = "Checking...";

        row.append(label, value);

        return { row, value };
    }

    const backendRow = runtimeRow("Preferred");
    const activeBackendRow = runtimeRow("Active");
    const webgpuRow = runtimeRow("WebGPU");
    const transformersRow = runtimeRow("Transformers");
    const fallbackRow = runtimeRow("Fallback");

    const runtimeGrid = document.createElement("div");
    runtimeGrid.className = "lr-runtime-grid";
    runtimeGrid.append(
        backendRow.row,
        activeBackendRow.row,
        webgpuRow.row,
        transformersRow.row,
        fallbackRow.row,
    );

    const notesEl = document.createElement("ul");
    notesEl.className = "lr-runtime-notes";

    runtimeEl.append(runtimeGrid, notesEl);

    const backendEl = backendRow.value;
    const activeBackendEl = activeBackendRow.value;
    const webgpuEl = webgpuRow.value;
    const transformersEl = transformersRow.value;
    const fallbackEl = fallbackRow.value;

    const errorEl = document.createElement("div");
    errorEl.style.color = "var(--lr-danger, #fecaca)";

    app.append(
        header,
        actions,
        section("Summary", summaryEl),
        section("Recommendations", recommendationsEl),
        section("Page text (preview)", previewEl),
        collapsibleSection("Diagnostics", runtimeEl),
        errorEl,
    );
    root.appendChild(app);

    return {
        titleEl,
        urlEl,
        btnRefresh,
        btnSummarize,
        runtimeEl,
        backendEl,
        activeBackendEl,
        webgpuEl,
        transformersEl,
        fallbackEl,
        notesEl,
        previewEl,
        summaryEl,
        recommendationsEl,
        errorEl,
    };
}
