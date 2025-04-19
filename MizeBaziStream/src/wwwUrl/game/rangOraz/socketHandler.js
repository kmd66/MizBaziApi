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
    globalModel.reset()
    console.log(`-----bazporsiReceive- ${model}`)
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

    globalModel.connection.on('imgReceive', ({ img }) => {
        const imgE = document.getElementById('img');
        const decompressed = new TextDecoder().decode(pako.inflate(img));
        imgE.src = decompressed;
    })
}
function socketCallBack() {
    vm.appModel.loding = false;
    vm.changeState('main'); // help imgsForSpy 'main''paint';
}
