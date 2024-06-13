chrome.runtime.onInstalled.addListener(function() {
    // Placeholder for initial setup if needed
  });
  
  // Function to save the current window as a workspace
  function saveWorkspace(workspaceName) {
    chrome.windows.getCurrent({populate: true}, function(window) {
      let tabs = window.tabs.map(tab => tab.url);
      let workspace = {
        name: workspaceName,
        tabs: tabs
      };
      chrome.storage.local.get({workspaces: []}, function(result) {
        let workspaces = result.workspaces;
        workspaces.push(workspace);
        chrome.storage.local.set({workspaces: workspaces}, function() {
          console.log("Workspace saved.");
        });
      });
    });
  }
  
  // Listener for browser action button click
  chrome.browserAction.onClicked.addListener(function() {
    chrome.windows.create({url: chrome.runtime.getURL("popup.html")});
  });
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "saveWorkspace") {
      saveWorkspace(request.workspaceName);
      sendResponse({status: "success"});
    }
  });
  