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
    defaeStream(model, 'defaeReceive')
}

socketHandler.khorojReceive = function (model) {
    defaeStream(model, 'khorojReceive');
    if (model.type == 'end') {
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
        vm.$refs.childitemclick.isAddTarget = true;
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

    elModal(html);
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
    elModal(html, backgroundColor);
}
function elModal(model, backgroundColor) {
    const divEl = document.createElement('div');
    divEl.className = `modalBady`;
    if (backgroundColor) divEl.style.backgroundColor = backgroundColor;
    divEl.innerHTML = model;
    document.body.appendChild(divEl);
    setTimeout(() => {
        divEl.remove();
    }, 7000);
}