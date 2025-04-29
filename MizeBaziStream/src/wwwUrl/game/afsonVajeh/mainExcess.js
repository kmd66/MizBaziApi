main.stream = null;
const iconClass = {
    sticker: 'icon-smileys',
    chalesh: 'icon-chalesh',
    like: 'icon-like',
    dislike: 'icon-dislike'
}
const iconClassDisabled = {
    sticker: 'icon-smileys iconDisabled',
    chalesh: 'icon-chalesh iconDisabled',
    like: 'icon-like iconDisabled',
    dislike: 'icon-dislike iconDisabled'
}

const naghsh = {
    title: 'راهنما',
    icon: 'icon-information4',
    color: '#7499ac'
}

main.init = function () {
    vm.$refs.childmain.naghsh = naghsh;
    vm.$refs.childmain.iconClass = iconClassDisabled;

    globalModel.connection.on('getDefensePositionReceive', getDefensePositionReceive);
    globalModel.connection.on('startStreamReceive', startStreamReceive);
    globalModel.connection.on('endStreamReceive', endStreamReceive);

    globalModel.connection.on('addChaleshReceive', addChaleshReceive);
    globalModel.connection.on('setChaleshReceive', setChaleshReceive);
}
main.setUsers = function () {
    globalModel.user = globalModel.users.find(x => x.id == socketHandler.userId);
    vm.$refs.childmain.user = globalModel.user;
    vm.$refs.childmain.users = globalModel.users;
    vm.$refs.childmain.naghsh = help.usersReceive(globalModel.user.type);
}
function getDefensePositionReceive(model) {
    main.reset();
    globalModel.activeUser = {
        index: model.activeUser,
        row: model.activeUser + 1
    };
    globalModel.room.wait = model.wait;
    main.getDefensePosition();
    main.topTimeProgress(-100);
}

function startStreamReceive(model) {
    main.reset(true);
    globalModel.room.wait = model.wait;
    main.topTimeProgress(-100);
    vm.$refs.childmain.soundDivI = true;
    main.stream = model;
    if (model.activeUser == globalModel.user.index) {
        vm.$refs.childmain.iconClass = iconClassDisabled;
        vm.$refs.childitemclick.isAddTarget = true;
        vm.$refs.childmain.cancelBtn = true;
    }
    else {
        vm.$refs.childmain.iconClass = iconClass;
        if (globalModel.room.door == 1)
            vm.$refs.childmain.iconClass.chalesh = 'icon-chalesh iconDisabled';
        else
            vm.$refs.childmain.iconClass.chalesh = 'icon-chalesh';
        vm.$refs.childitemclick.isAddTarget = false;
    }

    const user = vm.$refs.childmain.users.find(u => u.index == model.activeUser);
}
function endStreamReceive(model) {
    main.reset();
    vm.$refs.childmain.soundDivI = false;
    //socketHandler.closelObj();
    vm.$refs.childmain.iconClass = iconClassDisabled;
    vm.$refs.childitemclick.isAddTarget = false;
    vm.$refs.childmain.cancelBtn = false;
    removeChalesh()
    const el = document.getElementsByClassName(`chaleshForItem2`);
    Array.from(el).map(x => x.remove());
    main.stream = null;
}

function addChaleshReceive(model) {
    const u = globalModel.users.find(x => x.id == model);
    chaleshReceive(u.row)
}

function setChaleshReceive(model) {
    const u = globalModel.users.find(x => x.id == model);
    const el = document.querySelector(`.chaleshForItem.el${u.row}`);
    if (!el)
        return;
    el.classList.remove("chaleshForItem");
    el.classList.add("chaleshForItem2");
    removeChalesh();
}