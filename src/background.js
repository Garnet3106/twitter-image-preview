'use strict';

let twitterUri = 'https://twitter.com';
let driftJsUri = 'lib/js/Drift.js';
let fileSaverJsUri = 'lib/js/FileSaver.js';
let tweetsJsUri = 'src/tweets.js';
let storePageUri = 'https://chrome.google.com/webstore/detail/twitter-image-preview-bet/knpbokpcebojngoedkolnmnjghakiadp';

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

    chrome.browserAction.onClicked.addListener(openStorePage);
}

function executeScripts(url) {
    if(url.startsWith(twitterUri)) {
        chrome.tabs.executeScript(null, {
            file: driftJsUri,
        }, () => {});

        chrome.tabs.executeScript(null, {
            file: fileSaverJsUri,
        }, () => {});

        chrome.tabs.executeScript(null, {
            file: tweetsJsUri,
        }, () => {});
    }
}

function openStorePage() {
    chrome.tabs.create({
        url: storePageUri,
    });
}
