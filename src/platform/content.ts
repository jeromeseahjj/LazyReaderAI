import { Readability } from "@mozilla/readability";

function getReadableText(): { title: string; url: string; text: string } {
    const title = document.title || "";
    const url = location.href;

    // Clone DOM from existing page so it doesn't modify the real DOM.
    const docClone = document.cloneNode(true) as Document;
    const reader = new Readability(docClone);
    const article = reader.parse();
    // g (global) flag, replaces all occurence instead of first match.
    // \n{3,} replace 3 or more newline characters in a row.
    const text = (article?.textContent ?? document.body?.innerText ?? "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    
    return { title, url, text }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "GET_PAGE_TEXT") {
        sendResponse(getReadableText());
    }
})