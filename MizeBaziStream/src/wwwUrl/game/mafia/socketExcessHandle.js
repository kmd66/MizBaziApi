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
}

socketHandler.defaeReceive = function (model) {
}

socketHandler.khorojReceive = function (model) {
}
