
defae.removeItemIcon = function (model) {
    const elements = document.querySelectorAll('.raieForItem');
    elements.forEach(element => {
        element.remove();
    });
}
defae.setRaieGiriCountReceive = function (model) {
    defae.removeItemIcon();
    if (model.b) {
        const user = vm.$refs.childmain.users.find(x => x.id == model.userId);
        const el = document.querySelector(`.itemDefae${user.row} .itemImg`);
        if (!el)
            return;
        const divEl = document.createElement('div');
        divEl.className = `raieForItem imgStatus icon-tarazo`;
        el.appendChild(divEl);
    }
}
let animation;
defae.progressTime = function (wait) {
    main.topTimeProgressAnimation?.cancel();
    const el = document.querySelector(`.aw287sdaf div`);
    el.style.width = `100%`;
    animation = el.animate([
        { width: `100%` },
        { width: `0%` }
    ], {
        duration: wait * 1000,
        easing: 'linear',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        el.style.width = `0px`;
    };
}
function removeItemIcon() {
    const elements = document.querySelectorAll('.raieForItem');
    elements.forEach(element => {
        element.remove();
    });
}

defae.Component = function (app) {
    defae.raieGiriCount = new Map();
    app.component('defae-component', {
        template: '#defae-template',
        data() {
            return {
                door: '-',
                raigiri: false,
                raigiriResponse: false,
                progressbarWidth: '0px',
                users: [],
                loseUser: null,
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
            click(id) {
                if (this.raigiri) {
                    globalModel.connection.emit('setRaieGiriCount', {
                        userId: id,
                        roomId: socketHandler.roomId,
                        userKey: socketHandler.userKey,
                    });
                }
            },
            raigiriResponseUser(id) {
                if (!defae.raieGiriCount.has(id)) return [];
                let list = [];
                defae.raieGiriCount.get(id).map(x => {
                    const user = vm.$refs.childmain.users.find(u => u.id == x);
                    list.push(user)
                });
                return list;
            },
            lose() {
                if (!defae.raieGiriCount.has(id)) return [];
                let list = [];
                defae.raieGiriCount.get(id).map(x => {
                    const user = vm.$refs.childmain.users.find(u => u.id == x);
                    list.push(user)
                });
                return list;
            },
            
        }
    });
}