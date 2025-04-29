
itemclick.reset = function () {
    removeItemIcon();
}

function removeItemIcon() {
    const elements = document.querySelectorAll('.bazporsiForItem');
    elements.forEach(element => {
        element.remove();
    });
}

let rowNum = -1;
function itemMainClick(i) {
    vm.$refs.childitemclick.afson = null;
    rowNum = i;
    vm.$refs.childitemclick.isMy = false;
    if (i == globalModel.user.row)
        vm.$refs.childitemclick.isMy = true;

    if (globalModel.gameName == 'rangOraz') {
        let b = rangOrazClick(i);
        if (b)
            return;
    }
    if (globalModel.gameName == 'afsonVajeh') {
        afsonVajehClick(i);
    }

    if (globalModel.gameName == 'rangOraz')
        vm.$refs.childitemclick.rangOrazClick(i);
    if (globalModel.gameName == 'afsonVajeh')
        vm.$refs.childitemclick.modal = true;
}

function rangOrazClick(i) {
    if (globalModel.hadseNaghsh && !vm.$refs.childitemclick.isMy) {
        const user = vm.$refs.childmain.users.find(x => x.row == i);
        globalModel.connection.emit('setHadseNaghsh', {
            userId: user.id,
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey,
        });
        return true;
    }

    vm.$refs.childitemclick.isShowOstad = false;
    if (globalModel.user.type == 2 && !globalModel.room.isShowOstad)
        vm.$refs.childitemclick.isShowOstad = true;

    if (globalModel.bazpors?.select) {
        const user = vm.$refs.childmain.users.find(x => x.row == i);
        globalModel.connection.emit('setBazporsi', {
            userId: user.id,
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey,
        });
        return true;
    }

    return false;
}

function afsonVajehClick(i) {
    vm.$refs.childitemclick.afson = globalModel.groupItem;
}

function addTargetReceive(model) {

    const user = vm.$refs.childmain.users.find(x => x.id == model.id);
    if (!user)
        return;

    const chaleshForItemEl = document.querySelector(`.targetForItem.el${user.row}`);
    if (chaleshForItemEl)
        return;

    const selector = `.itemMain${user.row}`;
    const itemMain = document.querySelector(selector);
    const rectEl = itemMain.getBoundingClientRect();
    const divEl = document.createElement('div');

    let c = `targetForItem el${user.row}`;

    if (user.row < publicUserRow + 1) {
        c += ' target1';
        divEl.style.left = `${rectEl.left - 25}px`;
    }
    else {
        c += ' target2';
        divEl.style.left = `${rectEl.right}px`;
    }

    divEl.style.top = `${rectEl.top + 10}px`;
    c += model.type == 0 ? ' targetColor1' : ' targetColor2';
    divEl.className = c;
    mainTemplate.appendChild(divEl);
    setTimeout(() => {
        divEl.remove()
    }, 1400);
}
itemclick.listen = function () {
    if (globalModel.gameName != 'nabardKhande') {
        globalModel.connection.on('addTargetReceive', addTargetReceive);
    }
    if (globalModel.gameName == 'rangOraz') {
        globalModel.connection.on('setBazporsiReceive', (model) => {
            removeItemIcon();
            if (model?.length > 0) {
                const users = vm.$refs.childmain.users.filter(x => model.includes(x.id)) || [];
                users.map((x) => {
                    const el = document.querySelector(`.itemMain${x.row} .itemImg`);
                    if (!el)
                        return;
                    const divEl = document.createElement('div');
                    divEl.className = `bazporsiForItem imgStatus icon-badge-police`;
                    el.appendChild(divEl);
                });
            }
        });
    }
}
function addTarget(type) {
    if (!vm.$refs.childitemclick.isAddTarget)
        return;

    const user = vm.$refs.childmain.users.find(x => x.row == rowNum);
    if (!user)
        return;

    globalModel.connection.emit('addTarget', {
        userId: user.id,
        type: type,
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });

}

itemclick.Component = function (app) {
    app.config.globalProperties.itemMainClick = itemMainClick;

    app.component('itemclick-component', {
        template: '#itemclick-template',
        data() {
            return {
                itemIndex:-1,
                modal:false,
                userInfo: null,

                isAddTarget: false,
                isMy: false,
                isShowOstad: false,

                afson:null
            }
        },
        props: {
        },
        methods: {
            rangOrazClick(i) {
                this.itemIndex = i;
                if (this.isAddTarget || (this.isShowOstad && this.isMy)) {
                    this.modal = true;
                }
                else {
                    this.info();
                }
            },
            target(type) {
                addTarget(type)
            },
            info() {
                this.userInfo = vm.$refs.childmain.users.find(x => x.row == rowNum);
            },
            showOstad() {
                if (globalModel.gameName == 'rangOraz' && this.showOstad) {
                    globalModel.connection.emit('setShowOstad', {
                        roomId: socketHandler.roomId,
                        userKey: socketHandler.userKey,
                    });
                }
            }
        }
    });
}