var latestMousePosX = 0;
var latestMousePosY = 0;


addCSSElem();
initClickEvent();


function addCSSElem() {
    let cssElemID = 'tipStyle';

    if(document.getElementById(cssElemID) !== null)
        return;

    let link = document.createElement('link');

    link.href = chrome.runtime.getURL('data/tweets.css');
    link.id = cssElemID;
    link.rel = 'stylesheet';

    document.head.append(link);
}


function initClickEvent() {
    document.body.onkeydown = onKeyDown;
    document.body.onkeyup = onKeyUp;

    document.body.onmousemove = onMouseMove;
}


function onKeyDown(event) {
    if(event.key === 'Escape') {
        let prevWrapper = document.getElementById('tipPrevWrapper');

        if(prevWrapper !== null) {
            removeImagePreview(prevWrapper);
            event.preventDefault();
        }

        return;
    }

    if(event.key !== 'Shift')
        return;

    let elem = document.elementFromPoint(latestMousePosX, latestMousePosY);

    if(elem === null)
        return;

    if(elem.tagName === 'IMG' && elem.id !== 'tipPrevImg')
        previewImage(elem.src)
}


function onKeyUp(event) {
    if(event.key !== 'Shift')
        return;

    let prevWrapper = document.getElementById('tipPrevWrapper');

    if(prevWrapper !== null)
        removeImagePreview(prevWrapper);
}


function onMouseMove(event) {
    latestMousePosX = event.clientX;
    latestMousePosY = event.clientY;
}


function previewImage(imgSrc) {
    let wrapper = document.createElement('div');

    wrapper.className = 'tip-preview-wrapper';
    wrapper.id = 'tipPrevWrapper';

    let img = document.createElement('img');

    img.className = 'tip-preview-img';
    img.id = 'tipPrevImg';
    img.src = imgSrc;

    if(img.naturalHeight < img.naturalWidth) {
        img.style.width = '80vw';
    } else {
        img.style.height = '80vh';
    }

    let footer = getPrevFooterElem(imgSrc);

    wrapper.append(footer);
    wrapper.append(img);

    document.body.insertBefore(wrapper, document.body.firstChild);

    setTimeout(() => {
        wrapper.style.opacity = '1';
    }, 10);
}


function getPrevFooterElem(imgSrc) {
    // フッタ作成

    let footer = document.createElement('div');

    footer.className = 'tip-preview-footer';

    // リスト作成

    let menu = document.createElement('div');

    menu.className = 'tip-preview-footer-menu';

    // リストアイテム作成 - 閉じる

    let closeItem = document.createElement('a');

    closeItem.className = 'tip-preview-footer-menu-item';
    closeItem.innerText = chrome.i18n.getMessage('prevMenuClose');

    closeItem.addEventListener('click', () => {
        let wrapper = document.getElementById('tipPrevWrapper');
        removeImagePreview(wrapper);
    });

    menu.append(closeItem);

    // リストアイテム作成 - 新しく開く

    let openItem = document.createElement('a');

    openItem.className = 'tip-preview-footer-menu-item';
    openItem.href = imgSrc;
    openItem.innerText = chrome.i18n.getMessage('prevMenuNewlyOpen');
    openItem.rel = 'noopener noreferrer';
    openItem.target = '_blank';

    menu.append(openItem);
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


function removeImagePreview(prevWrapper) {
    prevWrapper.style.opacity = '0';

    setTimeout(() => {
        prevWrapper.remove();
    }, 100);
}
