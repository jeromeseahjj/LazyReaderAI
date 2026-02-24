function getReadableText(): { title: string; url: string; text: string } {
    const title = document.title || "";
    const url = location.href;

    // simple extraction
    const raw = document.body?.innerText || "";
    // g (global) flag, replaces all occurence instead of first match.
    // \n{3,} replace 3 or more newline characters in a row.
    const text = raw.replace(/\n{3,}/g, "\n\n").trim();

    return { title, url, text }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "GET_PAGE_TEXT") {
        sendResponse(getReadableText());
    }
})