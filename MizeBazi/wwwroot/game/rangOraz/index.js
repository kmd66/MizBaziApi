﻿import * as mediasoupClient from 'mediasoup-client'
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

    const animation = el.animate([
        { top: `${rectEl.top}px`, left: `${rectEl.left}px` },
        { top: `${rect.top}px`, left: `${rect.left + 10}px` }
    ], {
        duration: 400,
        easing: 'ease-in-out',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        startStrim(i)
    };

    tI++;
}

function resetDefensePosition() {
    const mainRightElements = document.querySelectorAll('.mainRight [class^="itemMain"]');
    Array.from(mainRightElements).forEach(el => {
        el.getAnimations().forEach(anim => anim.cancel());
        el.style.position = 'unset';
    });

    const soundDivSpan = document.querySelector('.soundDiv span');
    const soundDivI = document.querySelector('.soundDiv i');
    soundDivSpan.style.display = 'none';
    soundDivI.style.display = 'none';
    startStrimInt = -1;
    if (startStrimTime)
        clearTimeout(startStrimTime);
    startStrimTime = null;
}

var startStrimInt = -1;
let startStrimTime = null;
function startStrim(i) {
    const soundDivSpan = document.querySelector('.soundDiv span');
    if (startStrimInt == 0) {
        const soundDivI = document.querySelector('.soundDiv i');
        soundDivSpan.style.display = 'none';
        soundDivI.style.display = 'inline-block';
        startStrimInt = -1;
        startStrimTime = null;
        return;
    }

    if (startStrimInt == -1) {
        startStrimInt = 3;
        soundDivSpan.style.display = 'unset';
    }

    soundDivSpan.innerHTML = startStrimInt;
    startStrimTime = setTimeout(() => {
        startStrimInt--;
        startStrim(i);
    }, 1000);
}
