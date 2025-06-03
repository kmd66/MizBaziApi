
socketHandler.init = function () {
    globalModel.connection.on('mainReceive', mainReceive);
    globalModel.connection.on('soalPichReceive', soalPichReceive);
    globalModel.connection.on('labKhoniReceive', labKhoniReceive);
    globalModel.connection.on('sendSoalReceive', sendSoalReceive);
    globalModel.connection.on('addSticker2Receive', addSticker2Receive);
    globalModel.connection.on('addMessageReceive', addMessageReceive);
    globalModel.connection.on('setSmileReceive', setSmileReceive);
}
socketHandler.setSmile = function (smileReng) {
    globalModel.connection.emit('setSmile', {
        smile: smileReng,
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });
}
socketHandler.setFaceOff = function () {
    globalModel.connection.emit('setFaceOff', {
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });
}
function mainReceive(model) {
    main.stream = false;
    vm.$refs.childmain.soundDivI = false;
    vm.$refs.childmain.cancelBtn = false;
    vm.$refs.childmain.iconClass = main.icon5641Disabled;
    if (model.type == 'wait') {
        main.reset();
        globalModel.activeUser = {
            index: model.activeUser,
            row: model.activeUser + 1
        };
        main.getDefensePosition();
    }

    if (model.type == 'start') {
        main.stream = true;
        if (model.activeUser == globalModel.user.index) {
            vm.$refs.childmain.cancelBtn = true;
        } else {
            vm.$refs.childmain.iconClass = main.icon5641;
        }
        vm.$refs.childmain.soundDivI = true;
    }

    if (model.type == 'wait' || model.type == 'start') {
        globalModel.room.wait = model.wait;
        main.topTimeProgress(-100);
    }

    if (model.type == 'end') {
        socketHandler.closeObj();
        main.reset();
    }
}
function soalPichReceive(model) {
    vm.$refs.childsoalpich.soundDivI = false;
    if (model.type == 'wait') {
        soalpich.reset(true);
        globalModel.activeUser = {
            index: model.activeUser,
            row: model.activeUser + 1
        };
        globalModel.activeUser2 = {
            index: model.activeUser2,
            row: model.activeUser2 + 1
        };

    }

    if (model.type == 'start') {
        vm.$refs.childsoalpich.soundDivI = true;
        vm.$refs.childsoalpich.textBtn = true;
        if (globalModel.activeUser.index == globalModel.user.index) {
            vm.$refs.childsoalpich.cancelBtn = true;
        }
        if (globalModel.activeUser2.index == globalModel.user.index) {
            vm.$refs.childsoalpich.likeBtn = true;
            vm.$refs.childsoalpich.textBtn = false;
        }
    }

    if (model.type == 'wait' || model.type == 'start') {
        removeListMsg();
        globalModel.room.wait = model.wait;
        soalpich.topTimeProgress(-100);
        globalModel.users.map((x) => {
            if (globalModel.activeUser.index == x.index)
                vm.$refs.childsoalpich.user1 = x;
            if (globalModel.activeUser2.index == x.index)
                vm.$refs.childsoalpich.user2 = x;
        });
    }

    if (model.type == 'end') {
        vm.$refs.childsoalpich.soal = '';
        socketHandler.closeObj();
        soalpich.reset(true);
    }
}
function labKhoniReceive(model) {
    vm.$refs.childlabkhoni.soundDivI = false;
    if (model.type == 'wait') {
        labkhoni.reset(true);
        globalModel.activeUser = {
            index: model.activeUser,
            row: model.activeUser + 1
        };
        globalModel.activeUser2 = {
            index: model.activeUser2,
            row: model.activeUser2 + 1
        };

    }

    if (model.type == 'start') {
        vm.$refs.childlabkhoni.soundDivI = true;
        vm.$refs.childlabkhoni.textBtn = true;
        if (globalModel.activeUser.index == globalModel.user.index) {
            vm.$refs.childlabkhoni.cancelBtn = true;
        }
        if (globalModel.activeUser2.index == globalModel.user.index) {
            vm.$refs.childlabkhoni.textBtn = false;
        }
    }

    if (model.type == 'wait' || model.type == 'start') {
        removeListMsg();
        globalModel.room.wait = model.wait;
        labkhoni.topTimeProgress(-100);
        globalModel.users.map((x) => {
            if (globalModel.activeUser.index == x.index)
                vm.$refs.childlabkhoni.user = x;
        });
    }

    if (model.type == 'end') {
        vm.$refs.childlabkhoni.soal = '';
        socketHandler.closeObj();
        labkhoni.reset(true);
    }
}
function sendSoalReceive(model) {
    if (vm.appModel.state == 'labKhoni')
        vm.$refs.childlabkhoni.soal = model;
    else
        vm.$refs.childsoalpich.soal = model;
}

async function addSticker2Receive(model) {
    try {
        const itemMain = document.querySelector('.showSticker');

        const video = document.createElement('video');
        video.src = `data:video/mp4;base64,${sDATA[model.t]}`;
        video.className = 'stickerVideo';

        video.muted = true;
        await video.play();
        video.addEventListener('ended', () => {
            video.remove();
        }, { once: true });
        itemMain.appendChild(video);

    } catch (error) {
    }
}

function addMessageReceive(model) {
    let query = '.soalpich .listMsg';
    if (vm.appModel.state == 'labKhoni')
        query = '.labKhoni .listMsg';
    const listMsg = document.querySelector(query);
    if (!listMsg) return;

    const divEl = document.createElement('div');
    divEl.className = `msg`;
    divEl.innerHTML = `<span style="color: var(--LinkColor);">${model.userName} : </span> <span>${model.msg}</span>`;
    if (model.isSoal) {
        divEl.className = `msgFix`;
        vm.$refs.childlabkhoni.textBtn = false;
        vm.$refs.childsoalpich.textBtn = false;
        if (vm.appModel.state == 'labKhoni')
            vm.$refs.childlabkhoni.soal = model.msg;
        else
            vm.$refs.childsoalpich.soal = model.msg;
    }


    if (!model.isSoal) {
        setTimeout(() => {
            divEl.remove();
        }, 2000)
    }
    listMsg.appendChild(divEl);
}
function removeListMsg() {
    let query = '.soalpich .listMsg';
    if (vm.appModel.state == 'labKhoni')
        query = '.labKhoni .listMsg';
    const listMsg = document.querySelector(query);
    listMsg.innerHTML = '';
}
function setSmileReceive(model) {
    const i = globalModel.users.findIndex(u => u.id == model.userId);
    const pI = globalModel.users.findIndex(u => u.id == model.pId);
    if (i == -1 || pI == -1) return;

    globalModel.users[i].userInGameStatus = 2;
    globalModel.users[pI].userInGameStatus = 2;
    main.setUsers();


    const helpItem = help.find(globalModel.users[i].type);
    const divEl = document.createElement('div');
    divEl.className = `modalBady`;
    divEl.style.textAlign = 'center';
    divEl.innerHTML = `<div>بازیکن ${globalModel.users[i].info.UserName} از <span style="color:${helpItem.color};">${helpItem.title}</span> خندید :)</div><div>${helpItem.title} حذف شد !</div>`;
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, 5000);
}