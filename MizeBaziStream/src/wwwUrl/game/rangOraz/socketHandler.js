import io from 'socket.io-client'

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

    globalModel.connection.on('usersReceive', (users) => {
        globalModel.usersReceive(users);
    });

    globalModel.connection.on('userStatusReceive', (users) => {
        vm.$refs.childmain.usersStatus = users;
    });

    globalModel.connection.on('roomReceive', (room) => {
        globalModel.roomReceive(room)
    });

    globalModel.connection.on('disconnect', () => {
        console.log(`---a---disconnect :`);
    });

    globalModel.connection.on('getDefensePositionReceive', (model) => {
        main.reset();
        globalModel.activeUser = {
            index: model.activeUser,
            row: model.activeUser + 1
        };
        globalModel.room.progressTime = model.wate;
        main.getDefensePosition();
        main.topTimeProgress(-100);
    });

    globalModel.connection.on('startStream', (model) => {
        main.reset(true);
        globalModel.activeUser = {
            index: model.activeUser,
            row: model.activeUser + 1
        };
        globalModel.room.progressTime = model.wate;
        main.topTimeProgress(-100);
    });

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
