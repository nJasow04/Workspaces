function loadWorkspaces() {
    chrome.storage.local.get({workspaces: []}, function(result) {
      let workspaces = result.workspaces;
      let workspaceContainer = document.getElementById('workspaces');
      workspaceContainer.innerHTML = '';
      
      workspaces.forEach((workspace, index) => {
        let workspaceDiv = document.createElement('div');
        workspaceDiv.className = 'workspace';
        
        let label = document.createElement('label');
        label.textContent = workspace.name;
        label.contentEditable = true;
        label.onblur = function() {
          workspace.name = label.textContent.trim() || 'Untitled';
          saveWorkspaces(workspaces);
        };
        workspaceDiv.appendChild(label);
        
        let deleteButton = document.createElement('span');
        deleteButton.textContent = 'x';
        deleteButton.className = 'delete';
        deleteButton.onclick = function() {
          if (confirm('Are you sure you want to delete this workspace?')) {
            workspaces.splice(index, 1);
            saveWorkspaces(workspaces);
            loadWorkspaces();
          }
        };
        workspaceDiv.appendChild(deleteButton);
        
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
  
  document.addEventListener('DOMContentLoaded', loadWorkspaces);
  