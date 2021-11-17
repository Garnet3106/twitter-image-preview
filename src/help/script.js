'use strict';

window.addEventListener('load', onPageLoad);

function onPageLoad() {
    fillLocaleData();
}

function fillLocaleData() {
    let prefixLen = 'text_'.length;
    let targetIDs = [
        'content-title',
        'content-paragraph',
        'content-paragraph-span',
        'content-paragraph-inlinecode',
        'content-paragraph-link'
    ];

    for(let i = 0; i < targetIDs.length; i += 1) {
        let targets = document.getElementsByClassName(targetIDs[i]);

        for(let j = 0; j < targets.length; j += 1) {
            if(targets[j].hasAttribute('id')) {
                targets[j].innerText = getLocaleDataValue(targets[j].id.substring(prefixLen));
            }
        }
    }
}

function getLocaleDataValue(propID) {
    console.log('pageCont_' + propID)
    console.log(chrome.i18n.getMessage('pageCont_' + propID))
    return chrome.i18n.getMessage('pageCont_' + propID);
}
