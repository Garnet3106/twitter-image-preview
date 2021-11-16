'use strict';

let twitterUri = 'https://twitter.com';
let fileSaverJsUri = 'lib/js/FileSaver.js';
let tweetsJsUri = 'src/tweets.js';
let installationPageUri = 'src/installed/index.html';

initExtension();

function initExtension() {
    chrome.tabs.query({
        lastFocusedWindow: true
    }, (tabs) => {
        executeScripts(tabs[0].url);
    });

    chrome.tabs.onUpdated.addListener((_tabID, info, tab) => {
        if(info.status === 'complete') {
            executeScripts(tab.url);
        }
    });

    chrome.runtime.onInstalled.addListener(openInstallationPage);
    chrome.browserAction.onClicked.addListener(openInstallationPage);
}

function executeScripts(url) {
    if(url.startsWith(twitterUri)) {
        chrome.tabs.executeScript(null, {
            file: fileSaverJsUri,
        }, () => {});

        chrome.tabs.executeScript(null, {
            file: tweetsJsUri,
        }, () => {});
    }
}

function openInstallationPage() {
    chrome.tabs.create({
        url: chrome.runtime.getURL(installationPageUri),
    });
}
