type PagePayload = { title: string; url: string; text: string };

const root = document.getElementById("app")!;

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
    render({ ...state, summary: "Placeholder: next step will generate a real local summary." });
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