chrome.runtime.onInstalled.addListener(() => {
    // Placeholder for initial setup if needed
  });
  
  function saveWorkspace(workspaceName) {
    chrome.windows.getCurrent({populate: true}, (window) => {
      let tabs = window.tabs.map(tab => tab.url);
      let workspace = {
        name: workspaceName,
        tabs: tabs
      };
      chrome.storage.local.get({workspaces: []}, (result) => {
        let workspaces = result.workspaces;
        workspaces.push(workspace);
        chrome.storage.local.set({workspaces: workspaces}, () => {
          console.log("Workspace saved.");
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
  