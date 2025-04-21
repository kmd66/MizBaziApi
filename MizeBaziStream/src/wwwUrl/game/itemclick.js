
itemclick.reset = function () {
    vm.$refs.childitemclick.isAddTarget = false;
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
    rowNum = i;
    vm.$refs.childitemclick.isMy = false;
    if (i == globalModel.user.row)
        vm.$refs.childitemclick.isMy = true;

    if (globalModel.gameName == 'rangOraz') {
        let b = rangOrazClick(i);
        if (b) 
            return;
    }

    vm.$refs.childitemclick.click(i);
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
itemclick.listen = function () {

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
function addTarget(i, type) {
    if (!vm.$refs.childitemclick.isAddTarget)
        return;

    const chaleshForItemEl = document.querySelector(`.targetForItem.el${i}`);
    if (chaleshForItemEl)
        return;

    const selector = `.itemMain${i}`;
    const itemMain = document.querySelector(selector);
    const rectEl = itemMain.getBoundingClientRect();
    const divEl = document.createElement('div');

    let c = `targetForItem el${i}`;

    c += i > 6 ? ' target2' : ' target1';
    c += type == 0 ? ' targetColor1' : ' targetColor2';

    divEl.className = c;
    divEl.style.left = `${rectEl.left - 25}px`;
    divEl.style.top = `${rectEl.top + 10}px`;
    mainTemplate.appendChild(divEl);
    setTimeout(() => {
        divEl.remove()
    },1400);
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
                isShowOstad: false
            }
        },
        props: {
        },
        methods: {
            click(i) {
                this.itemIndex = i;
                if (this.isAddTarget || (this.isShowOstad && this.isMy)) {
                    this.modal = true;
                }
                else {
                    this.info();
                }
            },
            target(type) {
                addTarget(this.itemIndex, type)
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