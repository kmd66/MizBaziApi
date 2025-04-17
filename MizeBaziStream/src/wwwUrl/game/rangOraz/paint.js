paint.reset = function () {
}
paint.setPainSize = function () {
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

    const el = document.querySelector(`.awa32sdaf div`);
    el.style.height = `100%`;
    const  animation = el.animate([
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
paint.init = function () {
    paint.sendImgTimer = setInterval(() => {
        const dataURL = canvas.toDataURL("image/jpeg", 0.005);
        const compressed = pako.deflate(dataURL);
        globalModel.connection.emit('sendImg', { data: compressed })
    }, 1000);

    const canvas = document.querySelector('.paint');
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


    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', endDrawing);
    canvas.addEventListener('touchmove', draw);

    // جلوگیری از اسکرول کردن صفحه هنگام استفاده از بوم
    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

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
                    paint.setPainSize();
                    paint.init()
                }
            },
        }
    });
}