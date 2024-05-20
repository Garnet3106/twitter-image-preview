'use strict';

var storePageUri = 'https://chrome.google.com/webstore/detail/twitter-image-preview-bet/knpbokpcebojngoedkolnmnjghakiadp';

// note: 更新時に上書きするため var キーワードを使う
var disablePreview = false;

var isImagePreviewed = false;
var latestPreviewedImgUri = null;

var latestMousePosX = 0;
var latestMousePosY = 0;

init();

function init() {
    initCssStyle();
    initEvents();
}

function initCssStyle() {
    let cssElemID = 'tipStyle';

    if(document.getElementById(cssElemID) !== null) {
        return;
    }

    let mainLink = document.createElement('link');
    mainLink.href = chrome.runtime.getURL('src/tweets.css');
    mainLink.id = cssElemID;
    mainLink.rel = 'stylesheet';
    document.head.append(mainLink);

    let driftLink = document.createElement('link');
    driftLink.href = chrome.runtime.getURL('lib/js/drift-basic.min.css');
    driftLink.rel = 'stylesheet';
    document.head.append(driftLink);
}

function initEvents() {
    window.onerror = onError;
    document.body.onkeydown = onKeyDown;
    document.body.onkeyup = onKeyUp;
    document.body.onmousemove = onMouseMove;
}

// note: chrome.i18n.getMessage() でのエラーはキャッチしない
function onError(msg) {
    // note: 各ツイートページで毎回発生するため無視; 原因未詳だが重大ではない
    if(msg === 'ResizeObserver loop limit exceeded') {
        return;
    }

    console.error('Unknown error: please notify me about this error on Twitter (@Garnet3106) if it still occurs.\n\nAn error message is the following:');
    console.error(msg);

    disablePreview = true;
}

function onKeyDown(event) {
    if (event.repeat) {
        return;
    }

    updateImgZoomStatus(event.ctrlKey);

    if(event.key === 'Escape') {
        let prevWrapper = document.getElementById('tipPrevWrapper');

        if(prevWrapper !== null) {
            removeImagePreview(prevWrapper);
            event.preventDefault();
        }

        return;
    }

    if(event.key === 'Shift') {
        let elem = document.elementFromPoint(latestMousePosX, latestMousePosY);

        if(elem === null) {
            return;
        }

        if(elem.tagName === 'IMG' && elem.id !== 'tipPrevImg') {
            let imgUri = new URL(elem.src);
            let imgUriParams = new URLSearchParams(imgUri.search);
            imgUriParams.delete('name');
            let imgUriParamsStr = imgUriParams.toString();
            let highQualityImgUri = elem.src.split('?')[0] + (imgUriParamsStr == '' ? '' : '?' + imgUriParamsStr);

            fetch(highQualityImgUri)
                .then((res) => {
                    let imgUriStr = res.status === 404 ? elem.src : highQualityImgUri;
                    previewImage(imgUriStr);
                    updateImgZoomStatus(event.ctrlKey);
                });
        }

        return;
    }

    function closePrevWrapper() {
        let prevWrapper = document.getElementById('tipPrevWrapper');

        if(prevWrapper !== null) {
            removeImagePreview(prevWrapper);
        }
    }

    if(isImagePreviewed && latestPreviewedImgUri !== null) {
        // note: 閉じるショートカット
        if(event.key === 'c' || event.key === 'C') {
            closePrevWrapper();
        }

        // note: ダウンロードショートカット
        if(event.key === 'd' || event.key === 'D') {
            downloadImage(latestPreviewedImgUri, undefined, 'jpg');
            closePrevWrapper();
        }

        // note: ヘルプショートカット
        if(event.key === 'h' || event.key === 'H') {
            window.open(storePageUri, '_blank');
            closePrevWrapper();
        }

        // note: 新規タブショートカット
        if(event.key === 'n' || event.key === 'N') {
            window.open(latestPreviewedImgUri, '_blank');
            closePrevWrapper();
        }

        event.preventDefault();
    }
}

function onKeyUp(event) {
    updateImgZoomStatus(event.ctrlKey);

    if(event.key !== 'Shift') {
        return;
    }

    let prevWrapper = document.getElementById('tipPrevWrapper');

    if(prevWrapper !== null) {
        removeImagePreview(prevWrapper);
    }
}

function onMouseMove(event) {
    latestMousePosX = event.clientX;
    latestMousePosY = event.clientY;
}

function previewImage(imgUri) {
    if(disablePreview) {
        return;
    }

    isImagePreviewed = true;
    latestPreviewedImgUri = imgUri;

    let wrapper = document.createElement('div');
    wrapper.className = 'tip-preview-wrapper';
    wrapper.id = 'tipPrevWrapper';

    let img = document.createElement('img');
    img.className = 'tip-preview-img';
    img.dataset.zoom = imgUri;
    img.id = 'tipPrevImg';

    // 画像読み込み後に画像サイズを調整する
    let imgObj = new Image();

    imgObj.onload = () => {
        img.src = imgUri;
        setPreviewImgSize(img);
	}

    imgObj.src = imgUri;

    let zoomedImg = document.createElement('div');
    zoomedImg.className = 'tip-preview-img-zoomed';
    zoomedImg.id = 'tipPrevImgZoomed';

    // ズーム処理を追加 (Drift.JS)
    new Drift(img, {
        hoverDelay: 100,
        paneContainer: zoomedImg,
        zoomFactor: 2.5,
    });

    let footer = getPrevFooterElem(imgUri, wrapper);

    if(footer === null) {
        return;
    }

    wrapper.append(footer);
    wrapper.append(img);
    wrapper.append(zoomedImg);

    document.body.insertBefore(wrapper, document.body.firstChild);

    setTimeout(() => {
        wrapper.style.opacity = '1';
    }, 10);
}

function setPreviewImgSize(img) {
    if(Math.abs(document.body.clientHeight / img.naturalHeight) < Math.abs(document.body.clientWidth / img.naturalWidth)) {
        img.style.height = '80vh';
    } else {
        img.style.width = '80vw';
    }
}

// ret: 生成されたフッタ要素; 生成に失敗した場合は null
function getPrevFooterElem(imgUri, wrapper) {
    // フッタ作成

    let footer = document.createElement('div');
    footer.className = 'tip-preview-footer';
    footer.id = 'tipPrevFooter';

    // メニューリスト作成

    let menu = document.createElement('div');
    menu.className = 'tip-preview-footer-menu';

    // リストアイテム - 閉じる

    let closeItemText;
    let openItemText;
    let downloadItemText;
    let helpItemText;

    try {
        closeItemText = chrome.i18n.getMessage('prevMenuClose');
        openItemText = chrome.i18n.getMessage('prevMenuNewTab');
        downloadItemText = chrome.i18n.getMessage('prevMenuDownload');
        helpItemText = chrome.i18n.getMessage('prevMenuHelp');
    } catch(e) {
        disablePreview = true;
        console.error('Failed to load locale data. Please reload the page in order to validate the extension.');
        return null;
    }

    let closeItem = document.createElement('a');
    closeItem.className = 'tip-preview-footer-menu-item';
    closeItem.innerText = closeItemText;

    closeItem.addEventListener('click', () => {
        let wrapper = document.getElementById('tipPrevWrapper');
        removeImagePreview(wrapper);
    });

    menu.append(closeItem);

    // リストアイテム - 新規タブ

    let openItem = document.createElement('a');
    openItem.className = 'tip-preview-footer-menu-item';
    openItem.href = imgUri;
    openItem.innerText = openItemText;
    openItem.rel = 'noopener noreferrer';
    openItem.target = '_blank';

    menu.append(openItem);

    openItem.addEventListener('click', () => {
        removeImagePreview(wrapper);
    });

    // リストアイテム - ダウンロード

    let downloadItem = document.createElement('a');
    downloadItem.className = 'tip-preview-footer-menu-item';
    downloadItem.innerText = downloadItemText;

    downloadItem.addEventListener('click', () => {
        downloadImage(imgUri, undefined, 'jpg');
        removeImagePreview(wrapper);
    });

    menu.append(downloadItem);

    // リストアイテム - ヘルプ

    let helpItem = document.createElement('a');
    helpItem.className = 'tip-preview-footer-menu-item';
    helpItem.href = storePageUri;
    helpItem.innerText = helpItemText;
    helpItem.rel = 'noopener noreferrer';
    helpItem.target = '_blank';

    helpItem.addEventListener('click', () => {
        removeImagePreview(wrapper);
    });

    menu.append(helpItem);

    // メニューリスト追加
    footer.append(menu);

    // ディスクリプション作成

    let desc = document.createElement('div');
    desc.className = 'tip-preview-footer-description';

    let descText = document.createElement('div');
    descText.className = 'tip-preview-footer-description-text';
    descText.innerText = chrome.i18n.getMessage('prevDescExtName');

    desc.append(descText);

    let descLink = document.createElement('a');
    descLink.className = 'tip-preview-footer-description-link';
    descLink.href = 'https://twitter.com/Garnet3106';
    descLink.innerText = chrome.i18n.getMessage('prevDescUserID');
    descLink.rel = 'noopener noreferrer';
    descLink.target = '_blank';

    desc.append(descLink);
    footer.append(desc);

    return footer;
}

// note: ズーム画像を表示するかを Ctrl キーの押下状態で設定する
function updateImgZoomStatus(isCtrlKeyDown) {
    let img = document.getElementById('tipPrevImg');
    let zoomedImg = document.getElementById('tipPrevImgZoomed');
    let footer = document.getElementById('tipPrevFooter');
    let prevWrapper = document.getElementById('tipPrevWrapper');

    if(isCtrlKeyDown) {
        if(zoomedImg !== null) {
            setTimeout(() => {
                prevWrapper.style.cursor = 'zoom-in';
                img.style.cursor = 'none';
                zoomedImg.style.opacity = '1';
            }, 100);
        }

        if(footer !== null) {
            footer.style.opacity = '0';

            setTimeout(() => {
                footer.style.display = 'none';
            }, 100);
        }
    } else {
        if(zoomedImg !== null) {
            prevWrapper.style.cursor = 'auto';
            img.style.cursor = 'auto';
            zoomedImg.style.opacity = '0';
        }

        if(footer !== null) {
            footer.style.display = 'block';
            footer.style.opacity = '1';
        }
    }
}

function removeImagePreview(prevWrapper) {
    isImagePreviewed = false;
    prevWrapper.style.opacity = '0';

    setTimeout(() => {
        prevWrapper.remove();
    }, 100);
}

function downloadImage(imgUri, fileName = undefined, fileExt) {
    if(fileName === undefined) {
        let mediaUriPrefix = 'https://pbs.twimg.com/media/';
        fileName = imgUri.startsWith(mediaUriPrefix) ?
            imgUri.substring(mediaUriPrefix.length).split('?')[0] : fileName = 'image';
    }

    download(imgUri, `${fileName}.${fileExt}`);
}
