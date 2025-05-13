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
    if (globalModel.isChaos)
        chaos.setUsers();
}

main.nightAlert = function () {
    if (globalModel.room.door == 1 || globalModel.room.doorType != 3 || globalModel.user.userInGameStatus != 1) return;
    if ([7, 8].indexOf(globalModel.user.type) > -1) return;
    if ([6, 9].indexOf(globalModel.user.type) > -1 && !globalModel.groupItem.shot) return;

    const divEl = document.createElement('div');
    divEl.className = `modalBady`;
    divEl.style.textAlign = "center";

    if (globalModel.user.type == 4)
        divEl.innerHTML = `<div>از یک نفر دربرابر شلیک مافیا محافظت کنید</div>`;
    else if (globalModel.user.type == 5)
        divEl.innerHTML = `<div>استعلام یک نفر را بگیرید</div>`;
    else if (globalModel.user.type == 10) {
        const users = globalModel.users.filter(x => [1, 10].indexOf(x.userInGameStatus) > -1);
        divEl.innerHTML = users.length >= 7 ? `<div>از قابلیت نقش 2 نفر حفاظت کنید</div>` : `<div>از قابلیت نقش 1 نفر حفاظت کنید</div>`;

    }
    else
        divEl.innerHTML = `<div>میتوانید یک نفر را برای شلیک انتخاب کنید</div>`;

    if (globalModel.user.type == 22)
        divEl.innerHTML += `<div>قابلیت نقش یک نفر را ازبین ببرید</div>`;
    if (globalModel.user.type == 23)
        divEl.innerHTML += `<div>نتیجه استعلام یک نفر را تغییر دهید</div>`;

    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, 4000);


    //ahangar = 4, //'اهنگر',icon-bolt-shield
    //    karagah = 5, //'کاراگاه',icon-search-normal-2
    //    shekarchi = 6, //'شکارچی', icon-target
    //    mobarez = 9, //'مبارز',icon-target
    //    negahban = 10, //'نگهبان'icon-bolt-shield

    //    raees = 21, //'رییس مافیا', icon-target
    //    kharabkar = 22, //'خرابکار',icon-sabotage icon-target
    //    taghier = 23, //'تغییردهنده', icon-smileys icon-target
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
    socketHandler.closelObj();
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

main.addMessageReceive = function (model) {
    vm.$refs.childmain.chatList.push(model);
}

main.setNightEventReceive = function (model) {
    vm.$refs.childmain.chatList.push(model);
}
main.setNegahbanReceive = function (model) {
    vm.$refs.childmain.chatList.push(model);
}