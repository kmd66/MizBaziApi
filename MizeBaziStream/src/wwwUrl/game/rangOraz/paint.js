const paintState = {
    sendImgTimer: null,
    canvasListeners: {
        mousedown: null,
        mouseup: null,
        mousemove: null,
        touchstart: null,
        touchend: null,
        touchmove: null,
        preventTouchStart: null,
        preventTouchMove: null
    }
};
let animation, canvas;
paint.reset = function () {
    if (paintState.sendImgTimer) {
        clearInterval(paintState.sendImgTimer);
        paintState.sendImgTimer = null;
    }
    if (animation)
        animation.cancel();
}
paint.init = function () {
    vm.changeState('paint');
    if (canvas) {
        paint.reset();
        setPainSize();
        start();
        progressTime();
    }
}
function setPainSize() {
    paint.painSize = true;
    const elContainerGame = document.querySelector('.containerGame');
    const elPaint = document.querySelector('.paint');
    let widthPaint = elContainerGame.offsetWidth - 28;
    if (widthPaint > 400)
        widthPaint = 400;
    let heightPaint = (widthPaint * 3) / 2;
    elPaint.style.width = `${widthPaint}px`;
    elPaint.style.height = `${heightPaint}px`;
    elPaint.width = widthPaint;
    elPaint.height = heightPaint;
}

function progressTime() {

    const el = document.querySelector(`.awa32sdaf div`);
    el.style.height = `100%`;
    const animation = el.animate([
        { height: `100%` },
        { height: `0%` }
    ], {
        duration: globalModel.room.progressTime * 1000,
        easing: 'linear',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        el.style.height = `0px`;
    };
}

function start() {
    if (!globalModel.user?.type) return;

    canvas = document.querySelector('.paint');
    if (canvas) {
        removeAllCanvasListeners(canvas);
    }

    if ([2, 21, 22].indexOf(globalModel.user.type) > -1) {
        paintState.sendImgTimer = setInterval(() => {
            const dataURL = canvas.toDataURL("image/jpeg", 0.005);
            const compressed = pako.deflate(dataURL);
            globalModel.connection.emit('sendImg', { data: compressed });
        }, 1000);
    }

    const ctx = canvas.getContext('2d');
    let drawing = false;
    var penColor = '#000';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const getTouchPos = (canvas, touchEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        drawing = true;
        draw(e);
    };

    const endDrawing = () => {
        drawing = false;
        ctx.beginPath();
    };

    const draw = (e) => {
        if (!drawing) return;

        let pos;
        if (e.touches) {
            pos = getTouchPos(canvas, e);
        } else {
            pos = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop };
        }

        ctx.lineWidth = vm.$refs.childpaint.erasing ? vm.$refs.childpaint.erasingWidth : vm.$refs.childpaint.penWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = vm.$refs.childpaint.erasing ? 'white' : penColor;

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const preventDefault = (e) => e.preventDefault();

    // 6. اضافه کردن event listeners جدید و ذخیره رفرنس‌ها
    paintState.canvasListeners.mousedown = startDrawing;
    paintState.canvasListeners.mouseup = endDrawing;
    paintState.canvasListeners.mousemove = draw;
    paintState.canvasListeners.touchstart = startDrawing;
    paintState.canvasListeners.touchend = endDrawing;
    paintState.canvasListeners.touchmove = draw;
    paintState.canvasListeners.preventTouchStart = preventDefault;
    paintState.canvasListeners.preventTouchMove = preventDefault;

    canvas.addEventListener('mousedown', paintState.canvasListeners.mousedown);
    canvas.addEventListener('mouseup', paintState.canvasListeners.mouseup);
    canvas.addEventListener('mousemove', paintState.canvasListeners.mousemove);
    canvas.addEventListener('touchstart', paintState.canvasListeners.touchstart);
    canvas.addEventListener('touchend', paintState.canvasListeners.touchend);
    canvas.addEventListener('touchmove', paintState.canvasListeners.touchmove);
    canvas.addEventListener('touchstart', paintState.canvasListeners.preventTouchStart, { passive: false });
    canvas.addEventListener('touchmove', paintState.canvasListeners.preventTouchMove, { passive: false });
}

function removeAllCanvasListeners(canvas) {
    if (!canvas) return;

    canvas.removeEventListener('mousedown', paintState.canvasListeners.mousedown);
    canvas.removeEventListener('mouseup', paintState.canvasListeners.mouseup);
    canvas.removeEventListener('mousemove', paintState.canvasListeners.mousemove);
    canvas.removeEventListener('touchstart', paintState.canvasListeners.touchstart);
    canvas.removeEventListener('touchend', paintState.canvasListeners.touchend);
    canvas.removeEventListener('touchmove', paintState.canvasListeners.touchmove);
    canvas.removeEventListener('touchstart', paintState.canvasListeners.preventTouchStart);
    canvas.removeEventListener('touchmove', paintState.canvasListeners.preventTouchMove);
    paintState.canvasListeners = {
        mousedown: null,
        mouseup: null,
        mousemove: null,
        touchstart: null,
        touchend: null,
        touchmove: null,
        preventTouchStart: null,
        preventTouchMove: null
    };
}

paint.Component = function (app) {
    app.component('paint-component', {
        template: '#paint-template',
        data() {
            return {
                erasing: false,
                penWidth: 5,
                erasingWidth: 30
            }
        },
        props: {
            appModel: {
                type: Object,
                required: true,
                default: () => ({})
            },
        },
        methods: {
            init() {
                if (!main.painSize) {
                    setPainSize();
                    start();
                }
            },
        }
    });
}