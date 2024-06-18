document.getElementById('saveButton').addEventListener('click', function() {
    let workspaceName = document.getElementById('workspaceName').value || "Untitled";
    chrome.runtime.sendMessage({action: "saveWorkspace", workspaceName: workspaceName}, function(response) {
      if (response.status === "success") {
        // chrome.runtime.sendMessage({action: "workspaceSaved"});
        window.close();
      }
    });
  });

  document.getElementById('viewWorkspacesButton').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let currentTab = tabs[0];
        if (currentTab.url === "chrome://newtab/" || currentTab.url === "about:blank") {
            chrome.tabs.update(currentTab.id, {url: chrome.runtime.getURL("index.html")});
        } else {
            chrome.tabs.create({url: chrome.runtime.getURL("index.html")});
        }
    });
});