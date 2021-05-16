initExtension();


function initExtension() {
    chrome.tabs.query({
        lastFocusedWindow: true
    }, (tabs) => {
        executeScripts(tabs[0].url);
    });

    chrome.tabs.onUpdated.addListener((tabID, info, tab) => {
        if(info.status === 'complete')
            executeScripts(tab.url);
    });

    chrome.runtime.onInstalled.addListener(openInstallationPage);
    chrome.browserAction.onClicked.addListener(openInstallationPage);
}


function executeScripts(url) {
    if(url.startsWith('https://twitter.com')) {
        chrome.tabs.executeScript(null, {
            file: './data/tweets.js'
        }, () => {});
    }
}


function openInstallationPage() {
    chrome.tabs.create({
        url: chrome.runtime.getURL('data/installed/index.html')
    });
}
