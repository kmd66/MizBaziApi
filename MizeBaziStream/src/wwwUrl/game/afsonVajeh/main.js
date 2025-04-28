import './mainExcess'
main.reset = function (itemMainFix) {
    if (!itemMainFix) {
        const mainRightElements = document.querySelectorAll('.mainTemplate [class^="itemMain"]');
        Array.from(mainRightElements).forEach(el => {
            el.getAnimations().forEach(anim => anim.cancel());
            el.style.position = 'unset';
        });
    }
}
itemI = 0;
main.getDefensePosition = function (duration) {
    itemI++;
    if (itemI > 8)
        itemI = 1;
    globalModel.activeUser = { row: itemI }

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

    animation.onfinish = () => {
    };
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

                msg: {}
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
            addChalesh() {
                main.getDefensePosition();
            }
        }
    });
}