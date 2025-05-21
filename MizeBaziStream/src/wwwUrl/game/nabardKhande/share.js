globalModel = {};
function reset() {
    main.reset();
}
function initShare() {
    globalModel = {
        gameName: 'nabardKhande',
    };
    vm = {};

    globalModel.connection;
    globalModel.reset = reset;
    globalModel.room = {};
    globalModel.users = [];
    globalModel.user = {};

    sticker = {};
    //itemclick = {};
    socketHandler = {};
    main = {};
    help = {};
    soalpich = {};
    labkhoni = {};
    gameresponse = {};

}

initShare();

globalModel.infoRoomReceive = function (model) {
    if (model.room.state) {
        vm.changeState(model.room.state);
    }
    model.users.map((x) => {
        x.row = x.index + 1;
        x.colorNaghsh = help.find(x.type).color
    });

    globalModel.users = model.users;
    globalModel.room = model.room;
    main.topTimeProgress(-100);
    globalModel.userStatusReceive(model.status);

    setDoor(model.room)

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
globalModel.infoMainReceive = function (room) {
    reset();
    globalModel.room = room;
    main.topTimeProgress(-100);
    setDoor(room)
}
function setDoor(room) {
    vm.$refs.childmain.door = room.door;
}

