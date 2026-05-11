export function createLoadingState(message: string) {
    const wrap = document.createElement("div");
    wrap.className = "lr-loading";
    wrap.setAttribute("role", "status");
    wrap.setAttribute("aria-live", "polite");

    const spinner = document.createElement("div");
    spinner.className = "lr-spinner";
    spinner.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    text.className = "lr-loading-text";
    text.textContent = message;

    wrap.append(spinner, text);
    return wrap;
}