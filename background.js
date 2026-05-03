chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabPerformanceData') {
    getTabPerformanceData(request.tabId).then(data => {
      sendResponse({ success: true, data: data });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (request.action === 'clearTabPerformanceData') {
    clearTabPerformanceData(request.tabId).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (request.action === 'injectContentScript') {
    injectContentScript(request.tabId).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

async function getTabPerformanceData(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: 'getPerformanceData' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response ? response.data : null);
    });
  });
}

async function clearTabPerformanceData(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: 'clearPerformanceData' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    return true;
  } catch (error) {
    throw error;
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    injectContentScript(tabId).catch(error => {
      console.log('Failed to inject content script:', error);
    });
  }
});
