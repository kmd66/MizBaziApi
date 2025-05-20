
socketHandler.init = function () {
    globalModel.connection.on('mainReceive', mainReceive);
}
function mainReceive(model) {
    vm.$refs.childmain.soundDivI = false;
    if (model.type == 'wait') {
        main.reset();
        globalModel.activeUser = {
            index: model.activeUser,
            row: model.activeUser + 1
        };
        main.getDefensePosition();
    }

    if (model.type == 'start') {
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
