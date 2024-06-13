document.getElementById('saveButton').addEventListener('click', function() {
    let workspaceName = document.getElementById('workspaceName').value || "Untitled";
    chrome.runtime.sendMessage({action: "saveWorkspace", workspaceName: workspaceName}, function(response) {
      if (response.status === "success") {
        window.close();
      }
    });
  });

  document.getElementById('viewWorkspacesButton').addEventListener('click', function() {
    chrome.tabs.create({url: chrome.runtime.getURL("index.html")});
  });