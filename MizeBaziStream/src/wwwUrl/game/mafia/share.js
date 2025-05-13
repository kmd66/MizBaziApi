globalModel = {};
function reset() {
    main.reset();
}
function initShare() {
    globalModel = {
        gameName: 'mafia'
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
    chaos = {};
    gameresponse = {};

    globalModel.khorojHadseNaghsh = false;
    globalModel.isChaos = false;

}

initShare();

globalModel.infoRoomReceive = function (model) {
    socketHandler.closelObj();
    if (model.room.state) {
        vm.changeState(model.room.state);
    }

    model.users.map((x) => {
        if (x.type && x.type > 20) {
            x.nightIcon = 'imgStatus ' + help.find(x.type).icon;
        } else {
            x.nightIcon = 'imgStatus icon-mask';
        }

        x.row = x.index + 1;
    });

    globalModel.users = model.users;
    globalModel.room = model.room;
    globalModel.groupItem = model.groupItem;
    main.topTimeProgress(-100);
    globalModel.userStatusReceive(model.status);

    setDoor(model.room)
    setNightMode(model.room.doorType);

    if (model.isChaos) chaos.chaosReceive({ type: 'chaos', wait: 10 });

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
    setNightMode(room.doorType);
}
function setDoor(room) {
    if (room.door == 1)
        vm.$refs.childmain.door = 'معارفه';
    else if (room.doorType == 2)
        vm.$refs.childmain.door = 'رای‌گیری';
    else
        vm.$refs.childmain.door = room.doorType == 3 ? `شب ${room.door}` : `روز ${room.door}`;
}
function setNightMode(doorType) {
    main.nightAlert();
    if (doorType == 3 && globalModel.user.type > 20 && globalModel.user.userInGameStatus == 1) {
        vm.$refs.childmain.isChat = true;
    }

    if (doorType == 3 && globalModel.user.type > 20 && globalModel.user.userInGameStatus == 1) {
        vm.$refs.childmain.isChat = true;
    }
    else {
        if (vm.$refs.childmain.isChat) {
            vm.$refs.childmain.chatList = [];
            vm.$refs.childmain.isChat = false;
        }
    }

    if (doorType == 3) {
        if (!vm.appModel.nightMode)
            vm.appModel.nightMode = true;
    }
    else {
        if (vm.appModel.nightMode)
            vm.appModel.nightMode = false;
    }

    main.nightAlert(doorType);
}
