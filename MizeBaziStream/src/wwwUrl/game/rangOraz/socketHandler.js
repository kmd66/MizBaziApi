import io from 'socket.io-client'

function userStatusReceive(model) {
    vm.$refs.childmain.usersStatus = model;
}
function getDefensePositionReceive(model) {
    main.reset();
    globalModel.activeUser = {
        index: model.activeUser,
        row: model.activeUser + 1
    };
    globalModel.room.progressTime = model.wate;
    main.getDefensePosition();
    main.topTimeProgress(-100);
}
function startStreamReceive(model) {
    main.reset(true);
    globalModel.activeUser = {
        index: model.activeUser,
        row: model.activeUser + 1
    };
    globalModel.room.progressTime = model.wate;
    main.topTimeProgress(-100);
}

function bazporsiReceive(model) {
    globalModel.reset();
    if (model == 1) {
        vm.$refs.childmain.msg.show = true;
        globalModel.room.progressTime = 14;
        if (globalModel.user.type == 1) {
            globalModel.bazpors = { select: true };
            vm.$refs.childmain.msg.bazpors = true;
        }
        else
            vm.$refs.childmain.msg.bazporsWait = true;
        vm.$refs.childmain.door = 'بازپرسی';
        main.topTimeProgress(-100);
    }
}

socketHandler.initSoket = function () {
    let params = new URLSearchParams(document.location.search);
    socketHandler.roomId = params.get("roomId");
    socketHandler.userKey = params.get("userKey");
    socketHandler.userId = params.get("userId");

    globalModel.connection = io(`${publicHubBaseUrl}/hubRangOraz`, {
        auth: {
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey
        }
    });


    globalModel.connection.on('connectionReceive', ({ socketId }) => {
        socketHandler.socketId = socketId;
        socketCallBack();
    });
    globalModel.connection.on('disconnect', () => {
        console.log(`---a---disconnect :`);
    });

    globalModel.connection.on('usersReceive', globalModel.usersReceive);
    globalModel.connection.on('userStatusReceive', userStatusReceive);

    globalModel.connection.on('roomReceive', globalModel.roomReceive);

    globalModel.connection.on('getDefensePositionReceive', getDefensePositionReceive);
    globalModel.connection.on('startStreamReceive', startStreamReceive);

    globalModel.connection.on('bazporsiReceive', bazporsiReceive);

}
function socketCallBack() {
    vm.appModel.loding = false;
    vm.changeState('main'); // help imgsForSpy 'main''paint';

    itemclick.listen();
}
