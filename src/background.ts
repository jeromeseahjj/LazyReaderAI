
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
        path: "dist/index.html",
        enabled: true
    });

    // Open the side panel
    await chrome.sidePanel.open({ tabId: tab.id })
})