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

function ensureShellStyles() {
    if (document.getElementById("lr-shell-styles")) return;

    const style = document.createElement("style");
    style.id = "lr-shell-styles";
    style.textContent = `
        .lr-actions {
            display: flex;
            gap: 10px;
        }

        .lr-button {
            appearance: none;
            border: 1px solid var(--lr-control-border, rgba(255,255,255,0.18));
            border-radius: 999px;
            padding: 10px 14px;
            min-height: 40px;
            flex: 1;
            font: inherit;
            font-size: 13px;
            font-weight: 750;
            letter-spacing: -0.01em;
            cursor: pointer;
            transition:
                transform 160ms ease,
                background 160ms ease,
                border-color 160ms ease,
                box-shadow 160ms ease,
                opacity 160ms ease;
            user-select: none;
        }

        .lr-button:hover:not(:disabled) {
            transform: translateY(-1px);
        }

        .lr-button:active:not(:disabled) {
            transform: translateY(0);
        }

        .lr-button:focus-visible {
            outline: 3px solid rgba(216, 180, 254, 0.45);
            outline-offset: 2px;
        }

        .lr-button:disabled {
            cursor: not-allowed;
            opacity: 0.48;
            transform: none;
            box-shadow: none;
        }

        .lr-button--secondary {
            color: var(--lr-control-text, #f8fafc);
            background: var(--lr-control-bg, rgba(255,255,255,0.12));
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);
        }

        .lr-button--secondary:hover:not(:disabled) {
            background: var(--lr-control-bg-hover, rgba(255,255,255,0.18));
        }

        .lr-button--primary {
            color: var(--lr-primary-text, #180225);
            background: var(--lr-primary-bg, linear-gradient(135deg, #c084fc 0%, #818cf8 100%));
            border-color: rgba(255,255,255,0.25);
            box-shadow:
                0 14px 28px rgba(168, 85, 247, 0.28),
                inset 0 1px 0 rgba(255,255,255,0.45);
        }

        .lr-button--primary:hover:not(:disabled) {
            background: var(--lr-primary-bg-hover, linear-gradient(135deg, #d8b4fe 0%, #a5b4fc 100%));
            box-shadow:
                0 18px 34px rgba(168, 85, 247, 0.34),
                inset 0 1px 0 rgba(255,255,255,0.50);
        }

        .lr-runtime-card {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 12px;
            border: 1px solid var(--lr-card-border, rgba(255,255,255,0.18));
            border-radius: 18px;
            background: var(--lr-card-bg, rgba(255,255,255,0.10));
            backdrop-filter: blur(18px);
            box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
        }

        .lr-runtime-grid {
            display: grid;
            gap: 8px;
        }

        .lr-runtime-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 10px;
            border-radius: 14px;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.10);
        }

        .lr-runtime-label {
            color: var(--lr-muted, rgba(226,232,240,0.72));
            font-size: 12px;
            font-weight: 600;
        }

        .lr-runtime-value {
            color: var(--lr-text, #f8fafc);
            font-size: 12px;
            font-weight: 750;
            text-align: right;
        }

        .lr-runtime-value[data-tone="good"] {
            color: var(--lr-success, #86efac);
        }

        .lr-runtime-value[data-tone="warning"] {
            color: var(--lr-warning, #fde68a);
        }

        .lr-runtime-value[data-tone="info"] {
            color: var(--lr-info, #bfdbfe);
        }

        .lr-runtime-value[data-tone="muted"] {
            color: var(--lr-muted, rgba(226,232,240,0.72));
        }

        .lr-runtime-notes {
            margin: 0;
            padding-left: 18px;
            color: var(--lr-muted, rgba(226,232,240,0.72));
            font-size: 12px;
            line-height: 1.45;
        }

        .lr-disclosure-section {
            border: 1px solid var(--lr-card-border, rgba(255,255,255,0.18));
            border-radius: 18px;
            background: rgba(255,255,255,0.06);
            overflow: hidden;
        }

        .lr-disclosure-summary {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 11px 12px;
            cursor: pointer;
            color: var(--lr-muted, rgba(226,232,240,0.72));
            font-size: 13px;
            font-weight: 750;
            user-select: none;
        }

        .lr-disclosure-summary:hover {
            background: rgba(255,255,255,0.06);
            color: var(--lr-text, #f8fafc);
        }

        .lr-disclosure-summary:focus-visible {
            outline: 3px solid rgba(216, 180, 254, 0.45);
            outline-offset: -3px;
        }

        .lr-disclosure-hint {
            color: var(--lr-muted, rgba(226,232,240,0.72));
            font-size: 11px;
            font-weight: 650;
            opacity: 0.8;
        }

        .lr-disclosure-content {
            padding: 0 12px 12px;
        }

        .lr-disclosure-section[open] .lr-disclosure-hint {
            display: none;
        }
    `;

    document.head.appendChild(style);
}

export function mountShell(root: HTMLElement): ShellRefs {
    root.innerHTML = "";

    applyTheme("default");
    ensureShellStyles();

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
    summaryEl.style.whiteSpace = "pre-wrap";
    summaryEl.style.border = "1px solid #ddd";
    summaryEl.style.padding = "8px";
    summaryEl.style.borderRadius = "8px";
    summaryEl.style.minHeight = "80px";
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
