import { Readability } from "@mozilla/readability";
import type { PagePayload, PageQuality } from "../core/types";

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function getPageQuality(wordCount: number): PageQuality {
    if (wordCount === 0) return "empty";
    if (wordCount < 80) return "weak";
    if (wordCount > 2500) return "long";
    return "ok";
}

function getReadableText(): PagePayload {
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

    const wordCount = countWords(text);
    return { 
        title, 
        url, 
        text,
        wordCount,
        quality: getPageQuality(wordCount) 
    }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "GET_PAGE_TEXT") {
        sendResponse(getReadableText());
    }
})