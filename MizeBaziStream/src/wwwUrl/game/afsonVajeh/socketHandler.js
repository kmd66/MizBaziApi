import io from 'socket.io-client'
//import './stream';

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
    

}
function socketCallBack() {
    vm.appModel.loding = false;
    vm.changeState('main');
}
