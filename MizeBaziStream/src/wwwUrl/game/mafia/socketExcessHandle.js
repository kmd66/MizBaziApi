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
        globalModel.users.map((x) => {
            if (x.index == model.activeUser)
                x.userInGameStatus = 2;
        });
        vm.$refs.childmain.users = globalModel.users;
        if (globalModel.user.index == model.activeUser) {
            globalModel.user.userInGameStatus = 2;
            vm.$refs.childmain.user = globalModel.user;
        }
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