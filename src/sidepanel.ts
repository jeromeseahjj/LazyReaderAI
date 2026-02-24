type PagePayload = { title: string; url: string; text: string };

const root = document.getElementById("app")!;

function summarizeExtractive(text: string, maxSentences = 5): string {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (!cleaned) return "";

  // Split into sentence
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40);

  if (sentences.length === 0) return cleaned.slice(0, 500);

  // Tokenize & build word frequency map
  const stop = new Set([
    "the","a","an","and","or","but","if","then","else","to","of","in","on","for","with","as","at","by",
    "is","are","was","were","be","been","being","it","this","that","these","those","from","into","than",
    "you","your","we","our","they","their","i","me","my","he","she","his","her","them","there","here"
  ]);

  // Old school NLP
  const wordFreq = new Map<string, number>();
  for (const s of sentences) {
    for (const w of s.toLowerCase().match(/[a-z0-9']/g) ?? []) {
      // Ignore redundant words
      if (w.length <= 2) continue;
      if (stop.has(w)) continue;
      // Capture statistic and keywords
      wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
    }
  }

  // Score sentences by sum of keyword frequencies, normalized by length
  const scored = sentences.map((s, idx) => {
    const words = s.toLowerCase().match(/[a-z0-9']+/g) ?? [];
    let score = 0;
    
    // This gives statistic a boost/higher score
    const hasNumber = /\d/.test(s);
    if (hasNumber) score += 5;
    for (const w of words) score += wordFreq.get(w) ?? 0;
    const norm = Math.max(8, words.length);
    // To prevent biasness from long sentences
    return { idx, s, score: score / norm };
  });

  // b - a, is positive, means b is bigger, b should come before a
  // if negative, means a should come before b
  const picked = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(maxSentences, scored.length))
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.s)
  
  return picked.join("\n\n");
}

function render(state: {
  loading: boolean;
  page?: PagePayload;
  error?: string;
  summary?: string;
  recommendations?: string[];
}) {
  root.innerHTML = `
    <div style="font-family: system-ui; padding: 12px; display:flex; flex-direction:column; gap:12px;">
      <div>
        <div style="font-size:14px; opacity:.7;">Reading</div>
        <div style="font-size:16px; font-weight:600;">${state.page?.title ?? ""}</div>
        <div style="font-size:12px; opacity:.7; word-break:break-all;">${state.page?.url ?? ""}</div>
      </div>

      <div style="display:flex; gap:8px;">
        <button id="btnRefresh">Refresh</button>
        <button id="btnSummarize">Summarize (placeholder)</button>
      </div>

      <div>
        <div style="font-size:14px; opacity:.7;">Page text (preview)</div>
        <div style="white-space:pre-wrap; max-height:220px; overflow:auto; border:1px solid #ddd; padding:8px; border-radius:8px;">
          ${state.loading ? "Loading…" : (state.page?.text?.slice(0, 2000) ?? "")}
        </div>
      </div>

      <div>
        <div style="font-size:14px; opacity:.7;">Summary</div>
        <div style="white-space:pre-wrap; border:1px solid #ddd; padding:8px; border-radius:8px; min-height:80px;">
          ${state.summary ?? "Not generated yet."}
        </div>
      </div>

      <div>
        <div style="font-size:14px; opacity:.7;">Recommendations</div>
        <ul>
          ${(state.recommendations ?? ["(coming soon)"]).map(x => `<li>${x}</li>`).join("")}
        </ul>
      </div>

      ${state.error ? `<div style="color:#b00020;">${state.error}</div>` : ""}
    </div>
  `;

  document.getElementById("btnRefresh")?.addEventListener("click", () => load());
  document.getElementById("btnSummarize")?.addEventListener("click", () => {
    const text = state.page?.text ?? "";
    const summary = summarizeExtractive(text, 5);
    render({ ...state, summary: summary || "Could not summarize this page (not enough readable text)" });
  });
}

async function load() {
  render({ loading: true });

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");

    // Inject content script on demand
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["dist/content.js"]
    });

    const page = await chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_TEXT" }) as PagePayload;

    render({
      loading: false,
      page,
      recommendations: []
    });
  } catch (e: any) {
    render({ loading: false, error: e?.message ?? String(e) });
  }
}

load();