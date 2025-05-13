
chaos.setRayeChaosReceive = function (model) {
    const elements = document.querySelectorAll('.raiechaosItem');
    elements.forEach(element => {
        element.remove();
    });
    const user = globalModel.users.find(x => x.id == model.userId);
    const el = document.querySelector(`.chaosItem${user.row} .itemImg`);
    if (!el)
        return;
    const divEl = document.createElement('div');
    divEl.className = `raiechaosItem imgStatus icon-tarazo`;
    el.appendChild(divEl);
}

chaos.chaosReceive = function (model) {
    if (model.type != 'start')
        reset();
    if (model.type == 'chaos') {
        vm.appModel.nightMode = false;
        vm.$refs.childchaos.users = globalModel.users.filter(x => x.userInGameStatus == 1 || x.userInGameStatus == 10);
        globalModel.isChaos = true;
        vm.changeState('chaos');
        vm.$refs.childchaos.msg1 = 'آخرین گفتگو';
        vm.$refs.childchaos.msg2 = 'درصورت عدم انتخاب پس از آخرین گفتگو برنده بصورت تصادفی انتخاب میشود';
    }
    if (model.type == 'wait') wait(model);
    if (model.type == 'start') start(model);
    if (model.type == 'end') end(model);
    if (model.type == 'resultChaosWait') resultChaosWait(model);
    if (model.type == 'resultChaos') resultChaos(model);
    if (model.type != 'end')
        progressTime(model.wait)
}

function wait(model) {
    chaos.activeUser = {
        index: model.activeUser,
        row: model.activeUser + 1,
    };
    getDefensePosition();
}

function start(model) {
    vm.$refs.childchaos.soundDivI = true;
}

function end(model) {
    vm.$refs.childchaos.soundDivI = false;
    socketHandler.closelObj();
    chaos.activeUser = {};
}

function resultChaosWait(model) {
    vm.$refs.childchaos.exit = true;
    vm.$refs.childchaos.msg1 = 'انتخاب';
    vm.$refs.childchaos.msg2 = 'یک نفر را برای خروج انتخاب کنید';
}
function resultChaos(model) {
    const user = globalModel.users.find(x => x.id == model.id);
    if (!user) return;
    let time = model.wait * 1000;
    const divEl = document.createElement('div');
    divEl.className = `modalBady`;
    divEl.style.textAlign = "center";
    divEl.innerHTML = `<div><div class="itemImg"><img src="${user.info.Img}90.jpg"></div><div class="userName">${user.info.UserName }</div></div><div>از بازی خارج شد</div>`
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, time);
}

function getDefensePosition() {
    const el = document.querySelector(`.mainTemplate .chaosItem${chaos.activeUser.row}`);
    const rectEl = el.getBoundingClientRect();

    el.style.position = 'fixed';
    el.style.width = '60px';
    const top = (screen.height / 4);
    const left = (screen.width / 2) - (rectEl.width / 2);
    el.animate([
        { top: `${rectEl.top}px`, left: `${rectEl.left}px` },
        { top: `${top}px`, left: `${left}px` }
    ], {
        duration:  400,
        easing: 'ease-in-out',
        fill: 'forwards'
    });
    setSoundDiv();
}
function reset() {
    const mainRightElements = document.querySelectorAll('.mainTemplate [class^="chaosItem"]');
    Array.from(mainRightElements).forEach(el => {
        el.getAnimations().forEach(anim => anim.cancel());
        el.style.position = 'unset';
    });
    vm.$refs.childchaos.soundDivI = false;
    vm.$refs.childchaos.exit = false;
}
chaos.setUsers = function () {
    vm.$refs.childchaos.users = globalModel.users.filter(x => x.userInGameStatus == 1 || x.userInGameStatus == 10);
}

let animation = null;
function progressTime(time) {
    const el = document.querySelector(`.ap218daf div`);
    if (!el)
        return;

    if (animation)
        animation?.cancel();
    el.style.width = `100%`;
    animation = el.animate([
        { width: `100%` },
        { width: `0%` }
    ], {
        duration: time * 1000,
        easing: 'linear',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        el.style.width = `0px`;
    };
}

isSetSoundDiv = false;
function setSoundDiv() {
    if (isSetSoundDiv) return;
    const el = document.querySelector(`.soundDiv2`);
    el.style.width = '80px';
    el.style.top = `${(screen.height / 4) - 25}px`;
    el.style.left = `${(screen.width / 2) - 40}px`;
}
chaos.Component = function (app) {
    chaos.activeUser = {};
    app.component('chaos-component', {
        template: '#chaos-template',
        data() {
            return {
                progressbarWidth: '0px',
                soundDivI: false,
                exit: false,
                users: [],
                msg1: '',
                msg2: '',
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
            itemClick(id) {
                if (!this.exit) return;
                globalModel.connection.emit('setRayeChaos', {
                    userId: id,
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                });
            },
        }
    });
} 