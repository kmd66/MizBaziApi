import io from 'socket.io-client'

socketHandler.initSoket = function () {
    globalModel.connection = io("/mediasoup", {
        auth: {
            token: "1wwwwwww23"
        }
    });

    globalModel.connection.on('connectionReceive', ({ socketId }) => {
        console.log(`---ss----socketId :${socketId}`);
        socketCallBack();
    });

    globalModel.connection.on('imgReceive', ({ img }) => {
        console.log(img)
        const imgE = document.getElementById('img');
        const decompressed = new TextDecoder().decode(pako.inflate(img));
        imgE.src = decompressed;
    })
}
function socketCallBack() {
    vm.appModel.loding = false;
    vm.changeState('main'); // help imgsForSpy 'main''paint';
}
