import io from 'socket.io-client';
import './socketExcessHandle';
import './stream';

socketHandler.initSoket = function () {
    let params = new URLSearchParams(document.location.search);
    socketHandler.roomId = params.get("roomId");
    socketHandler.userKey = params.get("userKey");
    socketHandler.userId = params.get("userId");

    globalModel.connection = io(`${publicHubBaseUrl}/hubNabardKhande`, {
        auth: {
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey
        }
    });


    globalModel.connection.on('connectionReceive', ({ socketId }) => {
        socketHandler.socketId = socketId;
        socketCallBack();
    });
    globalModel.connection.on('disconnectReceive', ({ model }) => {
        console.log(`------disconnectReceive :${model}`);
    });
    globalModel.connection.on('disconnect', () => {
        console.log(`---a---disconnect :`);
    });

    globalModel.connection.on('infoRoomReceive', globalModel.infoRoomReceive);
    globalModel.connection.on('userStatusReceive', globalModel.userStatusReceive);
    globalModel.connection.on('infoMainReceive', globalModel.infoMainReceive);
    globalModel.connection.on('addStickerReceive', sticker.addStickerReceive);
}
function socketCallBack() {
    publicUserRow = 3;
    vm.appModel.loding = false;
    vm.changeState('main');
    main.init();
    socketHandler.init();
    socketHandler.streamInit();
    //itemclick.listen();
}
