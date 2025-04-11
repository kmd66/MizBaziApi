
let mainTemplate;
let isAddChalesh = true;
let isAddTarget = true;

function setMainTemplate() {
    mainTemplate = document.querySelector(`.mainTemplate`);
}
function addStickerVideo(text, i) {
    return new Promise(async (resolve) => {
        try {
            const selector = `.itemMain${i} .itemImg`;
            const itemMain = document.querySelector(selector);

            const video = checkEmoji(text, i);
            itemMain.appendChild(video);
            await video.play();

            video.addEventListener('ended', () => {
                setTimeout(() => {
                    video.remove();
                    resolve(true);
                }, 500);
            }, { once: true });

        } catch (error) {
            resolve(true);
        }
    });
}

function checkEmoji(text, i) {

    const video = document.createElement('video');
    video.src = `/sticker/${text}.webm`;
    video.className = 'stickerVideo';
    if (i < 6) {
        if (text == 'l1' || text == 'l2')
            video.style.transform = 'rotateY(180deg)';
    }
    else {
        if (text != 'l1' && text != 'l2')
            video.style.transform = 'rotateY(180deg)';
    }
    return video;
}

function addChalesh(i) {
    if (!isAddChalesh)
        return;

    const chaleshForItem2El = document.querySelector(`.chaleshForItem2`);
    if (chaleshForItem2El)
        return;

    const chaleshForItemEl = document.querySelector(`.chaleshForItem.el${i}`);
    if (chaleshForItemEl)
        return;

    const selector = `.itemMain${i}`;
    const itemMain = document.querySelector(selector);
    const rectEl = itemMain.getBoundingClientRect();

    const divEl = document.createElement('div');
    divEl.className = `chaleshForItem el${i}`;
    divEl.style.left = `${rectEl.left - 20}px`;
    divEl.style.top = `${rectEl.top}px`;

    const iEl = document.createElement('i');
    iEl.className = 'icon-chalesh';
    divEl.appendChild(iEl);
    mainTemplate.appendChild(divEl);

    setTimeout(() => {
        divEl.addEventListener('click', () => reserveChalesh(i));
    }, 1000);

}
function reserveChalesh(i) {
    const el = document.querySelector(`.chaleshForItem.el${i}`);
    if (!el)
        return;
    el.classList.remove("chaleshForItem");
    el.classList.add("chaleshForItem2");
    removeChalesh();
}
function removeChalesh() {

    const el = document.getElementsByClassName(`chaleshForItem`);
    Array.from(el).map(x => x.remove());
}
function addTarget(i, type) {
    if (!isAddTarget)
        return;
       
    const chaleshForItemEl = document.querySelector(`.targetForItem.el${i}`);
    if (chaleshForItemEl)
        return;

    const selector = `.itemMain${i}`;
    const itemMain = document.querySelector(selector);
    const rectEl = itemMain.getBoundingClientRect();
    const divEl = document.createElement('div');

    let c = `targetForItem el${i}`;

    c += i > 6 ? ' target2' : ' target1';
    c += type == 0 ? ' targetColor1' : ' targetColor2';

    divEl.className = c;
    divEl.style.left = `${rectEl.left -25}px`;
    divEl.style.top = `${rectEl.top +10}px`;
    mainTemplate.appendChild(divEl);
    setTimeout(() => {
        divEl.remove()
    }, 
    1400);
}