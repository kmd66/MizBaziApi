imgsForSpy.reset = function () {
}
imgsForSpy.init = function () {
    const el = document.querySelector(`.awe57adaf div`);
    el.style.width = `100%`;
    const animation = el.animate([
        { width: `100%` },
        { width: `0%` }
    ], {
        duration: globalModel.room.progressTime * 1000,
        easing: 'linear',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        el.style.width = `0px`;
    };
}

imgsForSpy.Component = function (app) {
    app.component('imgs-for-spy-component', {
        template: '#imgsForSpy-template',
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
                imgsForSpy.init()
            },
        }
    });
}