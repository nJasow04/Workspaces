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
        if(workspace.name === 'Untitled') {
            label.style.opacity = 0.5;
        }else{
            label.style.opacity = 1;
        }
        label.textContent = workspace.name;
        // label.contentEditable = true;

        label.onblur = function() {
            let trimmedText = label.textContent.trim();
            if (trimmedText.length === 0) {
                label.textContent = 'Untitled';
                workspace.name = 'Untitled';
                label.style.opacity = 0.5;
            } else {
                workspace.name = trimmedText;
            }
            saveWorkspaces(workspaces);
        };
        workspaceDiv.appendChild(label);
  
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


        let tabWrapper = document.createElement('div');
        tabWrapper.className = "tab-wrapper";
        workspaceContentDiv.appendChild(tabWrapper);

        workspace.tabs.forEach(tabUrl => {
            let tabItemDiv = document.createElement('div');
            tabItemDiv.className = 'tab-item';

            // Fetch the favicon and title using Chrome API
            fetchFaviconAndTitle(tabUrl, function(faviconUrl, title) {
                let faviconImg = document.createElement('img');
                faviconImg.src = faviconUrl;
                faviconImg.className = 'favicon';

                let titleSpan = document.createElement('span');
                titleSpan.textContent = title;
                titleSpan.className = 'tab-title';

                tabItemDiv.appendChild(faviconImg);
                tabItemDiv.appendChild(titleSpan);
            });

            tabWrapper.appendChild(tabItemDiv);
        });
  
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

  

function fetchFaviconAndTitle(tabUrl, callback) {
  chrome.storage.local.get([tabUrl], function(result) {
      if (result[tabUrl]) {
          // Data is already stored
          callback(result[tabUrl].favicon, result[tabUrl].title);
      } else {
          // Data not stored, fetch it
          fetch(tabUrl).then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.text();
          }).then(htmlString => {
              let parser = new DOMParser();
              let doc = parser.parseFromString(htmlString, "text/html");
              let head = doc.head;
              let favicon = 'Media/default-favicon.png'; // Default favicon

              // Try to find the favicon with preferred attributes
              let iconLink = head.querySelector("link[rel='icon']") || 
                             head.querySelector("link[rel='shortcut icon']") || 
                             head.querySelector("link[rel='apple-touch-icon']") ||
                             head.querySelector("link[rel~='icon']");

              if (iconLink) {
                  favicon = iconLink.href;
              }
              let title = head.querySelector("title") ? head.querySelector("title").innerText : getDomainName(tabUrl);

              // Store the favicon and title
              let dataToStore = {};
              dataToStore[tabUrl] = { favicon: favicon, title: title };
              chrome.storage.local.set(dataToStore, function() {
                  callback(favicon, title);
              });
          }).catch(() => {
              let fallbackData = {
                  favicon: 'Media/default-favicon.png',
                  title: getDomainName(tabUrl)
              };
              let dataToStore = {};
              dataToStore[tabUrl] = fallbackData;
              chrome.storage.local.set(dataToStore, function() {
                  callback(fallbackData.favicon, fallbackData.title);
              });
          });
      }
  });
}
