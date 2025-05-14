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
    removeNightIconGroup();
    globalModel.isNightEvent = false;
    if (globalModel.isChaos || globalModel.room.door == 1 || globalModel.room.doorType != 3 || globalModel.user.userInGameStatus != 1) return;
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
        addNightIconGroup();
        globalModel.isNightEvent = true;
        divEl.remove();
    }, 4000);
}

main.addMessageReceive = function (model) {
    vm.$refs.childmain.chatList.unshift(model);
}

main.addNightEvent = function (rowNum) {
    if (globalModel.user.userInGameStatus != 1 || [7, 8].indexOf(globalModel.user.type) > -1) return;
    if ([9, 6].indexOf(globalModel.user.type) > -1 && !globalModel.groupItem.shot) return;
    const u = globalModel.users.find(x => x.row == rowNum);
    if (!u || [1, 10].indexOf(u.userInGameStatus) == -1)  return;

    if ([22, 23].indexOf(globalModel.user.type) > -1) {
        const divEl = document.createElement('div');
        divEl.className = `modalBady 56a4sfde`;
        let i2 = `icon-sabotage`;
        if (globalModel.user.type == 23)
            i2 = `icon-smileys`;
        divEl.innerHTML = `<div class="modalTarget d-flex" style="margin-top: 0px;"><i class="icon icon-target" onclick="main.addNightEvent2(0, ${rowNum})"></i><i class="icon ${i2}" onclick="main.addNightEvent2(1, ${rowNum})"></i></div>`;
        document.body.appendChild(divEl);
    } else {
        main.addNightEvent2(0, rowNum);
    }
}
main.addNightEvent2 = function (type, rowNum) {
    const el2 = document.getElementsByClassName(`56a4sfde`) || [];
    Array.from(el2).map(x => x.remove());
    const u = globalModel.users.find(x => x.row == rowNum);
    if (!u) return;
    let eventName = 'setNightEvent';
    if (globalModel.user.type == 10)
        eventName = 'setNegahban';
    globalModel.connection.emit(eventName, {
        targetId: u.id,
        eventType: type,
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });
}
main.setNightEventReceive = function (model) {
    remove(model.type);
    model.nightEvents.map(x => {
        const u = globalModel.users.find(u => u.id == x.targetId);
        if (!u) return;
        const nightIconGroup = document.querySelector(`.nightIconGroup.el${u.row}`);
        if (!nightIconGroup) return;
        nightIconGroup.innerHTML += `<i class="nightIcon ${getIcon(x.type, x.eventType)}"></i>`;
    })
    function getIcon(type, eventType) {
        const typeIcon = `nightIconEventType${eventType} nightIconUserType${type}`;
        if (type > 21 && eventType == 1) {
            if (type == 22)
                return `${typeIcon} icon-sabotage`;
            else return `${typeIcon} icon-smileys`
        }
        else if (type == 4)
            return `${typeIcon} icon-bolt-shield`;
        else if (type == 5)
            return `${typeIcon} icon-search-normal-2`;
        else return `${typeIcon} icon-target`;
    }
    function remove(type) {
        const typeIcon = `.nightIcon.nightIconUserType${type}`;
        const el = document.querySelectorAll(typeIcon) || [];
        Array.from(el).map(x => x.remove());
    }
}
main.setNegahbanReceive = function (model) {
    const el = document.querySelectorAll(`.nightIcon.icon-bolt-shield`) || [];
    Array.from(el).map(x => x.remove());
    model.map(x => {
        const u = globalModel.users.find(u => u.id == x.targetId);
        if (!u) return;
        const nightIconGroup = document.querySelector(`.nightIconGroup.el${u.row}`);
        if (!nightIconGroup) return;
        nightIconGroup.innerHTML = '<i class="nightIcon icon-bolt-shield"></i>'
    })
}


main.mobarezMsgReceive = function (model) {
    elModal('شما مورد حمله قرار گرفته و از خود دفاع کردید');
    globalModel.groupItem.shot = false;
}

main.KaragahMsgReceive = function (model) {
    const u = globalModel.users.find(x => x.id == model.targetId);
    if (!u) return;
    let icon = 'icon-dislike';
    let msg = '<span style="color: green;">منفی</span>';
    if (model.isMafia) {
        icon = 'icon-like';
        msg = '<span style="color: red;">مثبت</span>';
    }
    const html = `<div class="itemImg"><img src="${u.info.Img}90.jpg" /></div> <div><i class="KaragahMsg ${icon}"></i></div><div>پاسخ استعلام ${u.info.UserName} ${msg} است</div>`;
    elModal(html);
}

main.kharabkarMsgReceive = function (model) {
    elModal('مافیا اجازه‌ی استفاده از نقش شما را سلب کرده بود.');
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
    const el = document.getElementsByClassName(`chaleshForItem2`) || [];
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

function addNightIconGroup() {
    globalModel.users.map(x => {
        const nightIconGroup = document.querySelector(`.nightIconGroup.el${x.row}`);
        if (nightIconGroup) return;
        const itemImg = document.querySelector(`.itemMain${x.row}`);
        if (itemImg) {
            const rectEl = itemImg.getBoundingClientRect();
            const el = document.createElement('div');
            el.className = `nightIconGroup el${x.row}`;
            el.style.top = `${rectEl.top}px`;
            if (x.row > 5) el.style.left = '5px'; else el.style.right = '5px';
            document.body.appendChild(el);
        }
    });
}
function removeNightIconGroup() {
    const el = document.getElementsByClassName(`nightIconGroup`) || [];
    Array.from(el).map(x => x.remove());
    const el2 = document.getElementsByClassName(`56a4sfde`) || [];
    Array.from(el2).map(x => x.remove());
}

function elModal(model) {
    const divEl = document.createElement('div');
    divEl.className = `KaragahMsgBody`;
    divEl.innerHTML = model;
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, 5000);
}