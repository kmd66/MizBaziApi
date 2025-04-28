
globalModel = {};
function reset() {
}
function initShare() {

    globalModel = {
        gameName: 'afsonVajeh'
    };
    vm = {};
    globalModel.connection;
    globalModel.reset = reset;
    globalModel.room = {};
    globalModel.users = [];
    globalModel.user = {};

    sticker = {};
    itemclick = {};
    socketHandler = {};
    main = {};
    help = {};


}

initShare();

globalModel.infoRoomReceive = function (model) {
    if (model.room.state) {
        vm.changeState(model.room.state);
    }

    model.users.map((x) => x.row = x.index + 1);
    globalModel.users = model.users;
    globalModel.userStatusReceive(model.status)

}
globalModel.userStatusReceive = function (model) {
    if (!model || !model.length) return;

    model.map((x) => {
        const i = globalModel.users.findIndex(u => u.id == x.id);
        if (i > -1) {
            globalModel.users[i].userInGameStatus = x.userInGameStatus;
        }
    })
    main.setUsers();

}