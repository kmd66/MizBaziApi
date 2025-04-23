imgsForSpy.reset = function () {
}

imgsForSpy.getImgForSpy = function (model) {
    const decompressed = new TextDecoder().decode(pako.inflate(model.data));
    vm.$refs.childimgsForSpy.imgs.set(model.userName, decompressed);
}
imgsForSpy.init = function () {
    vm.changeState('imgsForSpy');
    const el = document.querySelector(`.awe57adaf div`);
    if (!el)
        return;

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
                imgs: new Map()
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
            },
        }
    });
}