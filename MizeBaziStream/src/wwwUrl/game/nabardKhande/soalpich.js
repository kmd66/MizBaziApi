main.reset = function (itemMainFix) {
    if (soalpich.topTimeProgressTimer)
        clearTimeout(main.topTimeProgressTimer);
    soalpich.topTimeProgressTimer = null;
    soalpich.topTimeProgressAnimation?.cancel();
    soalpich.topTimeProgressAnimation = null;
    vm.$refs.childsoalpich.topTime = '- ----';
    vm.$refs.childsoalpich.progressbarWidth = "0px";
}
soalpich.topTimeProgress = function (i) {
    if (i == -100) {
        i = globalModel.room.wait;
        const progressbar = document.querySelector('.aw278edaf div');
        progressbar.style.width = `100%`;
        soalpich.topTimeProgressAnimation = progressbar.animate([
            { width: `100%` },
            { width: `0%` }
        ], {
            duration: globalModel.room.wait * 1000,
            easing: 'linear',
            fill: 'forwards'
        });
    }

    if (i == 0) {
        soalpich.reset();
        return;
    }
    const newTime = i - 1;
    vm.$refs.childsoalpich.topTime = `${i} ثانیه`;
    soalpich.topTimeProgressTimer = setTimeout(() => {
        soalpich.topTimeProgress(newTime);
    }, 1000);
}

soalpich.Component = function (app) {
    app.component('soalpich-component', {
        template: '#soalpich-template',
        data() {
            return {
                topTime: '- ----',
                naghsh: {},
                door: '-',
                progressbarWidth: '0px',
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