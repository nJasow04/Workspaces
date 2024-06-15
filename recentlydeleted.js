function loadRecentlyDeleted() {
    chrome.storage.local.get({recentlyDeleted: []}, function(result) {
      let recentlyDeleted = result.recentlyDeleted;
      let workspaceContainer = document.getElementById('workspaces');
      workspaceContainer.innerHTML = '';
  
      recentlyDeleted.forEach((workspace, index) => {
        let workspaceDiv = document.createElement('div');
        workspaceDiv.className = 'workspace';
  
        let workspaceBorderDiv = document.createElement('div');
        workspaceBorderDiv.className = 'workspace-border';
        workspaceDiv.appendChild(workspaceBorderDiv);
  
        let workspaceContentDiv = document.createElement('div');
        workspaceContentDiv.className = 'workspace-content';
        workspaceDiv.appendChild(workspaceContentDiv);
  
        let label = document.createElement('div');
        label.className = 'label';
        label.innerHTML = `<h3>${workspace.name}</h3>`;
        workspaceContentDiv.appendChild(label);
  
        let restoreButton = document.createElement('button');
        restoreButton.className = "redo";
        restoreButton.innerHTML = '<i class="gg-redo"></i>';
        restoreButton.onclick = function() {
          restoreWorkspace(workspace, index);
        };
        workspaceDiv.appendChild(restoreButton);
  
        let deleteButton = document.createElement('button');
        deleteButton.className = "delete";
        deleteButton.innerHTML = '<i class="gg-close-o"></i>';
        deleteButton.onclick = function() {
          if (confirm('Are you sure you want to permanently delete this workspace?')) {
            deleteWorkspacePermanently(index);
          }
        };
        workspaceDiv.appendChild(deleteButton);
  
        workspaceContainer.appendChild(workspaceDiv);
      });
    });
  }
  
  function restoreWorkspace(workspace, index) {
    chrome.storage.local.get({workspaces: []}, function(result) {
      let workspaces = result.workspaces;
      workspaces.push(workspace);
      chrome.storage.local.set({workspaces: workspaces}, function() {
        removeWorkspaceFromRecentlyDeleted(index);
      });
    });
  }
  
  function deleteWorkspacePermanently(index) {
    chrome.storage.local.get({recentlyDeleted: []}, function(result) {
      let recentlyDeleted = result.recentlyDeleted;
      recentlyDeleted.splice(index, 1);
      chrome.storage.local.set({recentlyDeleted: recentlyDeleted}, function() {
        loadRecentlyDeleted();
      });
    });
  }
  
  function removeWorkspaceFromRecentlyDeleted(index) {
    chrome.storage.local.get({recentlyDeleted: []}, function(result) {
      let recentlyDeleted = result.recentlyDeleted;
      recentlyDeleted.splice(index, 1);
      chrome.storage.local.set({recentlyDeleted: recentlyDeleted}, function() {
        loadRecentlyDeleted();
      });
    });
  }
  
  document.addEventListener('DOMContentLoaded', loadRecentlyDeleted);