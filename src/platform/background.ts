async function notifySidePanelPageChanged(tabId?: number, url?: string) {
    try {
        // Notice here we are using chrome.runtime.sendMessage
        // And not chrome.tab.sendMessage
        await chrome.runtime.sendMessage({
            type: "ACTIVE_PAGE_CHANGED",
            tabId,
            url
        });
    } catch {}
};

// Updates extension based on user's active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await notifySidePanelPageChanged(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Prevents refresh during partial loading states
    if (changeInfo.status !== "complete") return;
    // Prevents refreshes from background tabs that are loading.
    if (!tab.active) return;

    await notifySidePanelPageChanged(tabId, tab.url);
});


chrome.runtime.onInstalled.addListener(() => {
    // Enable side panel on all sides
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener(async (tab) => {
    // If not the current tab, don't load
    if (!tab.id) return;

    // Ensure the side panel is enabled on the current tab.
    await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: "index.html",
        enabled: true
    });

    // Open the side panel
    await chrome.sidePanel.open({ tabId: tab.id })
})
