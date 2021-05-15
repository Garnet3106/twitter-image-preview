chrome.tabs.query({
    lastFocusedWindow: true
}, (tabs) => {
    executeScripts(tabs[0].url);
});

chrome.tabs.onUpdated.addListener((tabID, info, tab) => {
    if(info.status === 'complete')
        executeScripts(tab.url);
});


function executeScripts(url) {
    if(url.startsWith('https://twitter.com')) {
        chrome.tabs.executeScript(null, {
            file: './data/tweets.js'
        }, () => {});
    }
}
