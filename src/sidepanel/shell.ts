// Assembler, to assemble the different components
export type ShellRefs = {
    titleEl: HTMLElement;
    urlEl: HTMLElement;
    btnRefresh: HTMLButtonElement;
    btnSummarize: HTMLButtonElement;
    runtimeEl: HTMLElement;
    backendEl: HTMLElement;
    webgpuEl: HTMLElement;
    transformersEl: HTMLElement;
    notesEl: HTMLElement;
    previewEl: HTMLElement;
    summaryEl: HTMLElement;
    recommendationsEl: HTMLElement;
    errorEl: HTMLElement;
};

function applyStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
    Object.assign(el.style, styles);
    return el;
}

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

export function mountShell(root: HTMLElement): ShellRefs {
    root.innerHTML = "";

    const app = document.createElement("div");
    app.style.fontFamily = "system-ui";
    app.style.padding = "12px";
    app.style.display = "flex";
    app.style.flexDirection = "column";
    app.style.gap = "12px";

    // Header
    const header = document.createElement("div");

    const reading = document.createElement("div");
    reading.textContent = "Reading";
    reading.style.fontSize = "14px";
    reading.style.opacity = ".7";

    // Future proofing for themes next time
    // applyStyle(reading, {
    //     fontSize: "14px",
    //     opacity: ".7"
    // })

    const titleEl = document.createElement("div");
    titleEl.style.fontSize = "16px";
    titleEl.style.fontWeight = "600";

    const urlEl = document.createElement("div");
    urlEl.style.fontSize = "12px";
    urlEl.style.opacity = ".7";
    urlEl.style.wordBreak = "break-all";

    header.append(reading, titleEl, urlEl);

    // Actions
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";

    const btnRefresh = document.createElement("button");
    btnRefresh.textContent = "Refresh";

    const btnSummarize = document.createElement("button");
    btnSummarize.textContent = "Summarize";

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
    runtimeEl.style.whiteSpace = "pre-wrap";
    runtimeEl.style.border = "1px solid #ddd";
    runtimeEl.style.padding = "8px";
    runtimeEl.style.borderRadius = "8px";
    runtimeEl.textContent = "Checking runtime...";

    const backendEl = document.createElement("div");
    const webgpuEl = document.createElement("div");
    const transformersEl = document.createElement("div");
    const notesEl = document.createElement("div");

    runtimeEl.append(
        backendEl,
        webgpuEl,
        transformersEl,
        notesEl,
    );

    const errorEl = document.createElement("div");
    errorEl.style.color = "#b00020";

    app.append(
        header,
        actions,
        section("Runtime", runtimeEl),
        section("Page text (preview)", previewEl),
        section("Summary", summaryEl),
        section("Recommendations", recommendationsEl),
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
        webgpuEl,
        transformersEl,
        notesEl,
        previewEl,
        summaryEl,
        recommendationsEl,
        errorEl,
    };
}
