publicUserRow = 5;
let mainTemplate;
let isAddChalesh = true;

if (typeof publicToken === 'undefined') {
    publicDeviceId = '';
    publicToken = '';
    publicApiBaseUrl = '';
    publicHubBaseUrl = '';
}

function setMainTemplate() {
    mainTemplate = document.querySelector(`.mainTemplate`);
}
function addStickerVideo(text, i) {
    return new Promise(async (resolve) => {
        try {
            const selector = `.itemMain${i} .itemImg`;
            const itemMain = document.querySelector(selector);

            const video = checkEmoji(text, i);
            video.muted = true;
            await video.play();
            video.addEventListener('ended', () => {
                video.remove();
                resolve(true);
            }, { once: true });
            itemMain.appendChild(video);

        } catch (error) {
            console.log(error)
            resolve(true);
        }
    });
}

function checkEmoji(text, i) {
    const video = document.createElement('video');
    video.src = `data:video/mp4;base64,${sDATA[text]}`;
    video.className = 'stickerVideo';
    if (i < publicUserRow + 1) {
        if (text == 'l1' || text == 'l2')
            video.style.transform = 'rotateY(180deg)';
    }
    else {
        if (text != 'l1' && text != 'l2')
            video.style.transform = 'rotateY(180deg)';
    }
    return video;
}

function chaleshReceive(i) {
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
    if (i < publicUserRow + 1) {
        divEl.style.left = `${rectEl.left - 20}px`;
    }
    else {
        divEl.style.left = `${rectEl.right - 12}px`;
        divEl.style.transform = 'rotateY(180deg)';
    }

    const iEl = document.createElement('i');
    iEl.className = 'icon-chalesh';
    divEl.addEventListener('click', () => chaleshForItemClick(i));
    divEl.appendChild(iEl);
    mainTemplate.appendChild(divEl);
}
function chaleshForItemClick(i) {
    if (!main.stream || !globalModel.user?.id) return;
    if (main.stream.activeUser != globalModel.user.index) return;

    const u = globalModel.users.find(x => x.row == i);
    if (!u) return;

    globalModel.connection.emit('setChalesh', {
        userId: u.id,
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });

}
function removeChalesh() {
    const el = document.getElementsByClassName(`chaleshForItem`);
    Array.from(el).map(x => x.remove());
}
function scrollEl(el, b) {
    setTimeout(() => {
        const element = typeof el === 'string' ? document.querySelector(el) : el;

        if (!element) return;

        const outerHeight = element.offsetHeight +
            parseInt(getComputedStyle(element).marginTop) +
            parseInt(getComputedStyle(element).marginBottom);

        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const h2_3 = outerHeight - (outerHeight / 5);
        const outerscrollTop = outerHeight + scrollTop;
        const t = scrollHeight - outerscrollTop;

        if (b || t < h2_3) {
            element.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            });
        }
    }, 500);
}

async function appHttp(url = '', data = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Auth': publicToken,
                'D-Id': publicDeviceId,
            },
            body: JSON.stringify(data)
        });

        if (response.status === 200) {
            const responseData = await response.json();

            if (responseData.success) {
                return responseData.data;
            } else {

                const error = new Error(responseData.message);
                error.code = responseData.code;
                throw error;
            }

        }
        else {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Request failed');
            error.code = response.status;
            throw error;

        }


    } catch (e) {
        if (!e.code) {
            e.code = -100;
        }
        if (e.code == 401)
            error401(e)
        else
            pushErrorMessage({ comment: `code:${e.code}<br> ${e.message}` })
        throw e;
    }
}

function pushErrorMessage({ comment, time = 2 }) {
    pushMessage({ comment: comment, type: 'error', time: time });
}
function pushSuccessMessage({ comment, time = 2 }) {
    pushMessage({ comment: comment, type: 'success', time: time });
}
function pushMessage({ comment, type = 'error', time = 2 }) {
    const errorBox = document.getElementById('errorBox');
    const element = document.createElement('div');
    element.innerHTML = comment;
    element.classList.add('pushMessage');
    if (type == 'error')
        element.classList.add('pushErrorMessage');
    if (type == 'success')
        element.classList.add('pushSuccessMessage');
    errorBox.appendChild(element);

    setTimeout(() => {
        errorBox.removeChild(element);
    }, time * 1000);
}
function error401(e) {
    console.log('کد خطا 401:', error.code);
    console.log('پیام:', error.message);
}