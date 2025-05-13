socketHandler.setRayeReceive = function (model) {
    const user = globalModel.users.find(x => x.id == model.id);
    if (!user) return;

    const el = document.querySelector(`.itemMain${user.row} .itemImg`);
    if (!el) return;

    const divEl = document.createElement('div');
    divEl.className = `raygiriIcon imgStatus icon-hand`;
    el.appendChild(divEl);
}
socketHandler.rayegiriReceive = function (model) {
    rayegiri(model, 'rayeDefae')
}
socketHandler.rayeKhorojReceive = function (model) {
    rayegiri(model, 'rayeKhoroj')
    if (vm.$refs.childmain.door != 'رای‌خروج')
        vm.$refs.childmain.door = 'رای‌خروج';
}
function rayegiri(model, type) {
    if (model.type == 'end') {
        main.reset();
        const elements = document.querySelectorAll('.raygiriIcon');
        elements.forEach(element => {
            element.remove();
        });
        globalModel.activeUser = {};
        vm.$refs.childmain.raye = false;
        return;
    }

    globalModel.activeUser = {
        index: model.activeUser,
        row: model.activeUser + 1,
        type: type
    };

    if (model.type == 'wait') {
        main.getDefensePosition();
    }

    if (model.type == 'start') {
        globalModel.room.wait = model.wait;
        main.topTimeProgress(-100);
    }

    if (model.type == 'start' && globalModel.user.userInGameStatus == 1 && model.activeUser != globalModel.user.index) {
        vm.$refs.childmain.raye = true;
    } else
        vm.$refs.childmain.raye = false;

}

socketHandler.defaeListReceive = function (model) {
    //console.log(`defaeListReceive ${model}`)
}

socketHandler.defaeReceive = function (model) {
    defaeStream(model, 'defaeReceive');
    if (vm.$refs.childmain.door != 'دفاع')
        vm.$refs.childmain.door = 'دفاع';
}

socketHandler.khorojReceive = function (model) {
    defaeStream(model, 'khorojReceive');
    if (model.type == 'start') {
        if (vm.$refs.childmain.door != 'وصیت')
            vm.$refs.childmain.door = 'وصیت';
        if (globalModel.user.index == model.activeUser)
            globalModel.khorojHadseNaghsh = true;
    }
    if (model.type == 'end') {
        vm.$refs.childmain.door = '----';
        globalModel.khorojHadseNaghsh = false;
        setUserInGameStatus(model.activeUser, 2);
    }
}

function setUserInGameStatus(activeUser, userInGameStatus) {
    globalModel.users.map((x) => {
        if (x.index == activeUser)
            x.userInGameStatus = userInGameStatus;
    });
    vm.$refs.childmain.users = globalModel.users;
    if (globalModel.user.index == activeUser) {
        globalModel.user.userInGameStatus = userInGameStatus;
        vm.$refs.childmain.user = globalModel.user;
    }
}
function defaeStream(model, type) {
    if (model.type == 'end') {
        main.reset();
        vm.$refs.childmain.soundDivI = false;
        vm.$refs.childitemclick.isAddTarget = false;
        socketHandler.closelObj();
        globalModel.activeUser = {};
        main.stream = null;
        return;
    }

    globalModel.activeUser = {
        index: model.activeUser,
        row: model.activeUser + 1,
        type: type
    };

    if (model.type == 'wait') {
        main.getDefensePosition();
    }

    if (model.type == 'start') {
        vm.$refs.childitemclick.isAddTarget = true;
        vm.$refs.childmain.soundDivI = true;
        globalModel.room.wait = model.wait;
        main.topTimeProgress(-100);
    }
}

socketHandler.setKalantarShotReceive = function (model) {
    const kalantar = globalModel.users.find(x => x.id == model.user1);
    const user = globalModel.users.find(x => x.id == model.user2);

    const naghsh = model.user2Type < 20 ? '<span style="color:var(--NaghshSefidColor)"> شهروند </span>': '<span style="color:var(--NaghshSiahColor)"> مافیا </span>';
    const html = `<div style="margin: 10px 0;"> ${kalantar.info.UserName} با نقش <span style="color:var(--NaghshSefidColor)"> کلانتر </span> به ${user.info.UserName} در گروه ${naghsh} شلیک و از بازی خارج کرد</div>`;
    
    setUserInGameStatus(user.index, 2);

    if (globalModel.user.index == kalantar.index) {
        globalModel.groupItem.shot = false;
    }

    elModal({ model: html });
}
socketHandler.setHadseNaghshReceive = function (model) {
    const user1 = globalModel.users.find(x => x.id == model.user1);
    const user2 = globalModel.users.find(x => x.id == model.user2);

    const html = model.type ? '<div style="margin: 10px 0;">گروه مافیا یک نفر را بوسیله حدس نقش از بازی خارج کرد</div>' : '<div style="margin: 10px 0;">تلاش مافیا برای حدس نقش ناموفق بود</div>';
    const backgroundColor = model.type ? '#5a0202' : '#025a16';
    const index = model.type ? user2.index : user1.index;

    if (globalModel.user.index == user1.index) {
        globalModel.groupItem.hadseNaghsh = false;
    }

    setUserInGameStatus(index, 2);
    elModal({ model: html, backgroundColor: backgroundColor });
}
function elModal({ model = '', backgroundColor = null, time = 7000, className = '' } = {}) {
    const divEl = document.createElement('div');
    divEl.className = `modalBady ${className}` ;
    if (backgroundColor) divEl.style.backgroundColor = backgroundColor;
    divEl.innerHTML = model;
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, time);
}
socketHandler.estelamReceive = function (model) {
    if (model.type == 'start' && globalModel.user.userInGameStatus == 1) {
        const html = `<div style="margin: 10px 0;text-align: center;">ایا استعلام میخواهید؟</div><div style="margin: 10px 0;" class="d-flex"><button class="btn btn-green" onclick="socketHandler.estelamAdd()">بله</button><button class="btn btn-red" onclick="socketHandler.estelamRemove()">خیر</button></div>`;
        elModal({ model: html, className: 'estelamAdd', time: model.wait * 1000 });
        setTimeout(() => {
            const elements = document.querySelectorAll('.raygiriIcon');
            elements.forEach(element => {
                element.remove();
            });
        }, model.wait * 1000);

    }
    if (model.type == 'result') {
        const elements = document.querySelectorAll('.raygiriIcon');
        elements.forEach(element => {
            element.remove();
        });
        const html = `<div style="margin: 10px 0;text-align: center;">از بازی شما </div><div style="margin: 10px 0;text-align: center;">
        <span style="color:var(--NaghshSefidColor)">${model.shahr} </span> شهروند
        <span style="color:var(--NaghshSiahColor)">${model.mafia} </span> مافیا
        </div><div style="margin: 10px 0;text-align: center;">بیرون هستند</div>`;
        elModal({ model: html, className: 'estelamResult', time: model.wait * 1000 });

    }
    globalModel.room.wait = model.wait;
    main.topTimeProgress(-100);
}
socketHandler.setEstelamReceive = function (model) {
    socketHandler.setRayeReceive({ id: model.userId });
}

socketHandler.estelamRemove = function () {
    const elements = document.querySelectorAll('.estelamAdd');
    elements.forEach(element => {
        element.remove();
    });
}

socketHandler.estelamAdd = function () {
    socketHandler.estelamRemove();
    globalModel.connection.emit('setEstelam', {
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });
}
