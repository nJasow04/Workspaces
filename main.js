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
        
        let label = document.createElement('div');
        label.className = 'label';
        label.textContent = workspace.name;
        // label.innerHTML = `<h3>${workspace.name}</h3>`;
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
            let deletedWorkspace = workspaces.splice(index, 1)[0];
            saveWorkspaces(workspaces);
            saveRecentlyDeleted(deletedWorkspace);
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

        
        // let showTabsButton = document.createElement('span');
        // showTabsButton.textContent = '>';
        // showTabsButton.className = 'show-tabs';
        // showTabsButton.onclick = function() {
        //   let tabsList = document.createElement('ul');
        //   workspace.tabs.forEach(tab => {
        //     let tabItem = document.createElement('li');
        //     tabItem.textContent = tab;
        //     tabsList.appendChild(tabItem);
        //   });
        //   if (showTabsButton.textContent === '>') {
        //     workspaceDiv.appendChild(tabsList);
        //     showTabsButton.textContent = 'v';
        //   } else {
        //     workspaceDiv.removeChild(workspaceDiv.lastChild);
        //     showTabsButton.textContent = '>';
        //   }
        // };
        // workspaceDiv.appendChild(showTabsButton);
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
  
function saveWorkspaces(workspaces) {
    chrome.storage.local.set({workspaces: workspaces});
}

document.addEventListener('DOMContentLoaded', loadWorkspaces);




chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.workspaces) {
        loadWorkspaces();
    }
});


function saveRecentlyDeleted(deletedWorkspace) {
    chrome.storage.local.get({recentlyDeleted: []}, function(result) {
        let recentlyDeleted = result.recentlyDeleted;
        recentlyDeleted.unshift(deletedWorkspace); // Add to the beginning of the array
        if (recentlyDeleted.length > 4) {
            recentlyDeleted.pop(); // Remove the oldest item if there are more than 3
        }
        chrome.storage.local.set({recentlyDeleted: recentlyDeleted});
    });
}



function fetchFaviconAndTitle(tabUrl, callback) {
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
        callback(favicon, title);
    }).catch(() => {
        callback('Media/default-favicon.png', getDomainName(tabUrl));
    });
}

function getDomainName(url) {
    let domain = (new URL(url)).hostname;
    domain = domain.replace('www.', ''); // Remove 'www.' if present
    let domainName = domain.split('.')[0]; // Get the part between 'www.' and '.com' or similar
    return domainName.charAt(0).toUpperCase() + domainName.slice(1); // Capitalize the first letter
}






// document.getElementById("workspaces").onmousemove = e => {
//     for(const project of document.getElementsByClassName("workspace")){
//         // project.onmousemove = e => handleOnMouseMove(e);
//         const rect = project.getBoundingClientRect(),
//             x = e.clientX - rect.left,
//             y = e.clientY - rect.top;
//         project.style.setProperty("--mouse-x", `${x}px`);
//         project.style.setProperty("--mouse-y", `${y}px`);
//     }
// }