
socketHandler.init = function () {
    globalModel.connection.on('mainReceive', mainReceive);
    globalModel.connection.on('soalPichReceive', soalPichReceive);
}
function mainReceive(model) {
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
    if (model.type == 'wait') {
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
    }

    if (model.type == 'wait' || model.type == 'start') {
        globalModel.room.wait = model.wait;
        main.topTimeProgress(-100);
    }

    if (model.type == 'end') {
        socketHandler.closeObj();
    }
}
