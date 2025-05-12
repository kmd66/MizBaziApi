import io from 'socket.io-client';
import './socketExcessHandle';
import '../stream';

socketHandler.initSoket = function () {
    let params = new URLSearchParams(document.location.search);
    socketHandler.roomId = params.get("roomId");
    socketHandler.userKey = params.get("userKey");
    socketHandler.userId = params.get("userId");

    globalModel.connection = io(`${publicHubBaseUrl}/hubMafia`, {
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

    globalModel.connection.on('rayegiriReceive', socketHandler.rayegiriReceive);
    globalModel.connection.on('rayeKhorojReceive', socketHandler.rayeKhorojReceive);
    globalModel.connection.on('setRayeReceive', socketHandler.setRayeReceive);
    globalModel.connection.on('defaeListReceive', socketHandler.defaeListReceive);
    globalModel.connection.on('defaeReceive', socketHandler.defaeReceive);
    globalModel.connection.on('khorojReceive', socketHandler.khorojReceive);

    globalModel.connection.on('estelamReceive', socketHandler.estelamReceive);
    globalModel.connection.on('setEstelamReceive', socketHandler.setEstelamReceive);

    globalModel.connection.on('setKalantarShotReceive', socketHandler.setKalantarShotReceive);
    globalModel.connection.on('setHadseNaghshReceive', socketHandler.setHadseNaghshReceive);

    globalModel.connection.on('addMessageReceive', main.addMessageReceive);

    //globalModel.connection.on('gameResponseReceive', gameresponse.gameResponseReceive);
    //globalModel.connection.on('endGameReceive', gameresponse.endGameReceive);
    //globalModel.connection.on('getMessage', gameresponse.getMessage);


}
function socketCallBack() {
    publicUserRow = 5;
    vm.appModel.loding = false;
    vm.changeState('main');
    main.init();
    itemclick.listen();
    socketHandler.streamInit();
}
