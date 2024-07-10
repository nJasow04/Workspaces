chrome.runtime.onInstalled.addListener(() => {
  // Placeholder for initial setup if needed
});

function saveWorkspace(workspaceName) {
  // Query all tabs in the current window
  chrome.tabs.query({currentWindow: true}, (tabs) => {

    if (chrome.runtime.lastError) {
      console.error("Error querying tabs: ", chrome.runtime.lastError);
      return;
    }

    console.log("Tabs in current window: ", tabs);

    let tabUrls = tabs.map(tab => tab.url);
    let workspace = {
      name: workspaceName,
      tabs: tabUrls
    };
    chrome.storage.local.get({workspaces: []}, (result) => {
      let workspaces = result.workspaces;
      workspaces.push(workspace);
      chrome.storage.local.set({workspaces: workspaces}, () => {
        console.log("Workspace saved!");
      });
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveWorkspace") {
    saveWorkspace(request.workspaceName);
    sendResponse({status: "success"});
  }
});
