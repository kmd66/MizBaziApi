paint.setPainSize = function () {
    paint.painSize = true;
    const elContainerGame = document.querySelector('.containerGame');
    const elPaint = document.querySelector('.paint');
    let widthPaint = elContainerGame.offsetWidth - 28;
    if (widthPaint > 350)
        widthPaint = 350;
    let heightPaint = (widthPaint * 3) / 2;
    elPaint.style.width = `${widthPaint}px`;
    elPaint.style.height = `${heightPaint}px`;
    elPaint.width = widthPaint;
    elPaint.height = heightPaint;
}
paint.init = function () {
    paint.sendImgTimer = setInterval(() => {
        const dataURL = canvas.toDataURL("image/jpeg", 0.005);
        console.log(dataURL);
        const compressed = pako.deflate(dataURL);
        globalModel.connection.emit('sendImg', { data: compressed })
    }, 1000);

    const canvas = document.querySelector('.paint');
    const ctx = canvas.getContext('2d');

    let drawing = false;
    let erasing = false;
    var penColor = '#000';
    var lineWidth = 5;

    document.getElementById('range').addEventListener("input", (event) => { lineWidth = event.target.value; });
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

        ctx.lineWidth = erasing ? 20 : lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = erasing ? 'white' : penColor;

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

    // فعال کردن حالت پاک کن
    const eraserBtn = document.getElementById('eraserBtn');
    eraserBtn.addEventListener('click', () => {
        erasing = !erasing;
        eraserBtn.textContent = erasing ? 'حالت نقاشی' : 'پاک کن';
    });
}

paint.Component = function (app) {
    app.component('paint-component', {
        template: '#paint-template',
        data() {
            return {
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
                debugger
                if (!main.painSize) {
                    paint.setPainSize();
                    paint.init()
                }
            },
        }
    });
}