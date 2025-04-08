
main.setPainSize = function () {
    paint.painSize = true;
    const elPaint = document.querySelector('.mainTemplate .paintImg');
    const widthPaint = elPaint.offsetWidth;
    const heightPaint = (widthPaint * 3) / 2;
    elPaint.style.height = `${heightPaint}px`;
}

var tI = 1;
main.getDefensePosition = function (i) {
    if (tI > 5)
        tI = 1;
    main.resetDefensePosition();
    const position = document.querySelector(".mainTemplate .defensePosition");
    const rect = position.getBoundingClientRect();
    const el = document.querySelector(`.mainTemplate .itemMain${tI}`);
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
        main.startStrim(i)
    };

    tI++;
}

main.resetDefensePosition = function () {
    const mainRightElements = document.querySelectorAll('.mainRight [class^="itemMain"]');
    Array.from(mainRightElements).forEach(el => {
        el.getAnimations().forEach(anim => anim.cancel());
        el.style.position = 'unset';
    });

    vm.$refs.childmain.soundDivI = false;
    vm.$refs.childmain.soundDivSpan = false;
    main.startStrimInt = -1;
    main.resetTimer();
}

main.resetTimer = function () {
    if (main.startStrimTimer)
        clearTimeout(main.startStrimTimer);
    main.startStrimTimer = null;

    if (main.topTimeProgressTimer)
        clearTimeout(main.topTimeProgressTimer);
    main.topTimeProgressTimer = null;
    main.topTimeProgressAnimation?.cancel();
    main.topTimeProgressAnimation = null;
    vm.$refs.childmain.mainTopTime = '- ----';
    vm.$refs.childmain.progressbarWidth = "0px";
}

main.startStrim = function (i) {
    if (main.startStrimInt == 0) {
        vm.$refs.childmain.soundDivI = true;
        vm.$refs.childmain.soundDivSpan = false;
        main.startStrimInt = -1;
        main.startStrimTimer = null;
        main.topTimeProgress(10, 10);
        return;
    }

    if (main.startStrimInt == -1) {
        main.startStrimInt = 3;
        vm.$refs.childmain.soundDivSpan = true;
    }

    vm.$refs.childmain.soundDivTime =  main.startStrimInt;
    main.startStrimTimer = setTimeout(() => {
        main.startStrimInt--;
        main.startStrim(i);
    }, 1000);
}

main.topTimeProgress = function (total, i) {
    if (total == i) {
        const progressbar = document.querySelector('.progressbar div');
        //const percentage = (100 * i) / total;
        progressbar.style.width = `100%`;
        main.topTimeProgressAnimation = progressbar.animate([
            { width: `100%` },
            { width: `0%` }
        ], {
            duration: total * 1000,
            easing: 'linear',
            fill: 'forwards'
        });
    }

    if (i == 0) {
        main.resetDefensePosition();
        return;
    }
    const newTime = i - 1;
    vm.$refs.childmain.mainTopTime = `${i} ثانیه`;
    main.topTimeProgressTimer = setTimeout(() => {
        main.startStrimInt--;
        main.topTimeProgress(total, newTime);
    }, 1000);
}

main.Component = function (app) {
    app.component('main-component', {
        template: '#main-template',
        data() {
            return {
                mainTopTime: '- ----',
                iconNaghsh:'icon-spy',
                door: '-',
                progressbarWidth: '0px',
                soundDivI: false,
                soundDivSpan: false,
                soundDivTime: false
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
                    this.$nextTick(() => {
                        main.setPainSize();
                    });
                }
            },
        }
    });
}