import io from 'socket.io-client';
import './socketExcessHandle';
import '../stream';

socketHandler.initSoket = function () {
    let params = new URLSearchParams(document.location.search);
    socketHandler.roomId = params.get("roomId");
    socketHandler.userKey = params.get("userKey");
    socketHandler.userId = params.get("userId");

    globalModel.connection = io(`${publicHubBaseUrl}/hubAfsonVajeh`, {
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

    globalModel.connection.on('infoRoomReceive', globalModel.infoRoomReceive);
    globalModel.connection.on('userStatusReceive', globalModel.userStatusReceive);
    globalModel.connection.on('infoMainReceive', globalModel.infoMainReceive);
    globalModel.connection.on('addStickerReceive', sticker.addStickerReceive);

    globalModel.connection.on('addTalkReceive1', socketHandler.addTalkReceive1);
    globalModel.connection.on('addTalkReceive2', socketHandler.addTalkReceive2);
    globalModel.connection.on('addGunReceive', socketHandler.addGunReceive);

    globalModel.connection.on('gameResponseReceive', gameresponse.gameResponseReceive);
    globalModel.connection.on('endGameReceive', gameresponse.endGameReceive);
    globalModel.connection.on('getMessage', gameresponse.getMessage);

}
function socketCallBack() {
    publicUserRow = 4;
    vm.appModel.loding = false;
    vm.changeState('main');
    main.init();
    itemclick.listen();
    socketHandler.streamInit();
}
