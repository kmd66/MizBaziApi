import * as mediasoupClient from 'mediasoup-client'
import io from 'socket.io-client'

function init() {
    const elPaint = document.querySelector('.paint');
    const width = elPaint.offsetWidth;
    const height = (width * 3) / 2;
    elPaint.style.height = `${height}px`;
}
init();


const socket = io("/mediasoup", {
    auth: {
        token: "1wwwwwww23"
    }
});

socket.on('connection-success', ({ socketId }) => {
    console.log(socketId)
})

var tI = 1;
function getDefensePosition(i) {
    if (tI > 5)
        tI = 1;
    resetDefensePosition();
    const position = document.getElementById("defensePosition");
    const rect = position.getBoundingClientRect();
    const el = document.querySelector(`.itemMain${tI}`);
    const rectEl = el.getBoundingClientRect();

    el.style.position = 'fixed';
    el.style.top = `${rectEl.top}px`;
    el.style.left = `${rectEl.left}px`;

    setTimeout(() => {
        el.style.transition = 'top 500ms ease,left 500ms ease';
        el.style.top = `${rect.top}px`;
        el.style.left = `${rect.left + 10}px`;
        setTimeout(() => {
            el.style.transition = '';
        }, 510);
    }, 10);

    tI++;
}
function resetDefensePosition() {
    const mainRightElements = document.querySelectorAll('.mainRight [class^="itemMain"]');
    Array.from(mainRightElements).forEach(el => {
        el.style.positi = 'unset';
        el.style.top = 'unset';
        el.style.left = 'unset';
    });
}
