
itemclick.reset = function () {
    vm.$refs.childitemclick.isAddTarget = false;
    removeBazporsiForItem();
}
function removeBazporsiForItem() {
    const elements = document.querySelectorAll('.bazporsiForItem');
    elements.forEach(element => {
        element.remove();
    });
}

function itemMainClick(i) {
    if (globalModel.bazpors?.select) {
        const user = vm.$refs.childmain.users.find(x => x.row == i);
        globalModel.connection.emit('setBazporsi', {
            userId: user.id,
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey,
        });
        return;
    }

    vm.$refs.childitemclick.click(i);
}
itemclick.listen = function () {
    globalModel.connection.on('setBazporsiReceive', (model) => {
        removeBazporsiForItem();
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
                isAddTarget: false,
            }
        },
        props: {
        },
        methods: {
            click(i) {
                this.itemIndex = i;
                this.modal = true;
            },
            target(type) {
                addTarget(this.itemIndex, type)
            }
        }
    });
}