import './mainExcess'
main.reset = function (itemMainFix) {
    if (!itemMainFix) {
        const mainRightElements = document.querySelectorAll('.mainTemplate [class^="itemMain"]');
        Array.from(mainRightElements).forEach(el => {
            el.getAnimations().forEach(anim => anim.cancel());
            el.style.position = 'unset';
        });
    }

    vm.$refs.childmain.soundDivI = false;
    vm.$refs.childmain.soundDivSpan = false;
    vm.$refs.childmain.msg = {};

    resetTimer();
}
function resetTimer() {
    if (main.topTimeProgressTimer)
        clearTimeout(main.topTimeProgressTimer);
    main.topTimeProgressTimer = null;
    main.topTimeProgressAnimation?.cancel();
    main.topTimeProgressAnimation = null;
    vm.$refs.childmain.mainTopTime = '- ----';
    vm.$refs.childmain.progressbarWidth = "0px";
}
isSetSoundDiv = false;
function setSoundDiv() {
    if (isSetSoundDiv) return;
    const el = document.querySelector(`.soundDiv`);
    el.style.width = '80px';
    el.style.top = `${(screen.height / 4) - 25}px`;
    el.style.left = `${(screen.width / 2) - 40}px`;
}
main.getDefensePosition = function (duration) {

    main.reset();
    const el = document.querySelector(`.mainTemplate .itemMain${globalModel.activeUser.row}`);
    const rectEl = el.getBoundingClientRect();

    el.style.position = 'fixed';
    el.style.width = '80px';
    const top = (screen.height / 4);
    const left = (screen.width / 2) - (rectEl.width / 2);
    const animation = el.animate([
        { top: `${rectEl.top}px`, left: `${rectEl.left}px` },
        { top: `${top}px`, left: `${left}px` }
    ], {
        duration: duration ? duration : 400,
        easing: 'ease-in-out',
        fill: 'forwards'
    });
    setSoundDiv();
    animation.onfinish = () => {
    };
}
main.topTimeProgress = function (i) {
    if (i == -100) {
        i = globalModel.room.wait;
        const progressbar = document.querySelector('.aw213sdaf div');
        //const percentage = (100 * i) / total;
        progressbar.style.width = `100%`;
        main.topTimeProgressAnimation = progressbar.animate([
            { width: `100%` },
            { width: `0%` }
        ], {
            duration: globalModel.room.wait * 1000,
            easing: 'linear',
            fill: 'forwards'
        });
    }

    if (i == 0) {
        main.reset(true);
        return;
    }
    const newTime = i - 1;
    vm.$refs.childmain.mainTopTime = `${i} ثانیه`;
    main.topTimeProgressTimer = setTimeout(() => {
        main.startStrimInt--;
        main.topTimeProgress(newTime);
    }, 1000);
}
main.Component = function (app) {
    app.component('main-component', {
        template: '#main-template',
        data() {
            return {
                iconClass: {},
                mainTopTime: '- ----',
                naghsh: {},
                door: '-',
                progressbarWidth: '0px',
                soundDivI: false,
                cancelBtn: false,

                user: {},
                users: [],

                msg: {},
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
            setCancel() {
                globalModel.connection.emit('setCancel', {
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                });
            }
        }
    });

    app.component('mainitem-component', {
        template: '#mainitem-template',
        data() {
            return {
            }
        },
        props: {
            left: Boolean,
            naghsh: Object,
            users: {
                type: Array,
            },
            appModel: {
                type: Object,
                required: true,
                default: () => ({})
            },
        },
        methods: {
            itemStatus(item) {
                if (item) {
                    switch (item.userInGameStatus) {
                        case 1:
                            return 'a6s5d4q';
                        case 10:
                            return 'imgStatus icon-ofline';
                        case 2:
                        case 11:
                            return 'imgStatus icon-death';
                    }
                }
                return 'imgStatus icon-ofline';
            },
        }
    });
} 