function loadWorkspaces() {
    chrome.storage.local.get({workspaces: []}, function(result) {
      let workspaces = result.workspaces;
      let workspaceContainer = document.getElementById('workspaces');
      workspaceContainer.innerHTML = '';
      
      workspaces.forEach((workspace, index) => {
        let workspaceDiv = document.createElement('div');
        workspaceDiv.className = 'workspace';

        let workspaceBorderDiv = document.createElement('div');
        workspaceBorderDiv.className = 'workspace-border';
        workspaceDiv.appendChild(workspaceBorderDiv);

        let workspaceContentDiv = document.createElement('div');
        workspaceContentDiv.className = 'workspace-content';
        workspaceDiv.appendChild(workspaceContentDiv);
        
        let label = document.createElement('label');
        label.textContent = workspace.name;
        label.contentEditable = true;
        label.onblur = function() {
          workspace.name = label.textContent.trim() || 'Untitled';
          saveWorkspaces(workspaces);
        };
        workspaceDiv.appendChild(label);
        
        let deleteButton = document.createElement('button');
        deleteButton.className = "delete";
        deleteButton.innerHTML = '<i class="gg-close-o"></i>';
        deleteButton.onclick = function() {
          if (confirm('Are you sure you want to delete this workspace?')) {
            workspaces.splice(index, 1);
            saveWorkspaces(workspaces);
            loadWorkspaces();
          }
        };
        workspaceDiv.appendChild(deleteButton);

        let startButton = document.createElement('button');
        startButton.className = "start";
        // startButton.innerHTML = '<i class="gg-close-o"></i>';
        startButton.innerHTML = '<i class="gg-play-button-o"></i>';
        startButton.onclick = function() {
            let urls = [chrome.runtime.getURL("index.html"), ...workspace.tabs];

            // Open all links in a new window
            chrome.windows.create({url: urls}, function(newWindow) {
                // Close the current tab
                chrome.tabs.getCurrent(function(tab) {
                  chrome.tabs.remove(tab.id);
                });
              });
        };
        workspaceDiv.appendChild(startButton);

        
        let showTabsButton = document.createElement('span');
        showTabsButton.textContent = '>';
        showTabsButton.className = 'show-tabs';
        showTabsButton.onclick = function() {
          let tabsList = document.createElement('ul');
          workspace.tabs.forEach(tab => {
            let tabItem = document.createElement('li');
            tabItem.textContent = tab;
            tabsList.appendChild(tabItem);
          });
          if (showTabsButton.textContent === '>') {
            workspaceDiv.appendChild(tabsList);
            showTabsButton.textContent = 'v';
          } else {
            workspaceDiv.removeChild(workspaceDiv.lastChild);
            showTabsButton.textContent = '>';
          }
        };
        workspaceDiv.appendChild(showTabsButton);
        
        workspaceContainer.appendChild(workspaceDiv);
      });
    });
  }
  
function saveWorkspaces(workspaces) {
    chrome.storage.local.set({workspaces: workspaces});
}

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "workspaceSaved") {
//       loadWorkspaces();
//     }
//   });
document.addEventListener('DOMContentLoaded', loadWorkspaces);

document.getElementById("workspaces").onmousemove = e => {
    for(const project of document.getElementsByClassName("workspace")){
        // project.onmousemove = e => handleOnMouseMove(e);
        const rect = project.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;
        project.style.setProperty("--mouse-x", `${x}px`);
        project.style.setProperty("--mouse-y", `${y}px`);
    }
}
  
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.workspaces) {
      loadWorkspaces();
    }
  });