import * as mediasoupClient from "mediasoup-client";
let remoteVideo, localVideo;
socketHandler.streamInit = function () {
    setVideoObj();
    globalModel.connection.on('consumeReceive', async ({ params }) => {
        if (params.error) {
            return
        }
        consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters
        })
        const { track } = consumer

        remoteVideo.srcObject = new MediaStream([track])
        remoteVideo.muted = true;

        remoteVideo.onloadedmetadata = () => {
            remoteVideo.play().catch(e => {
                console.warn('Play error:', e);
            });
        };

        globalModel.connection.emit('consumerResume', {
                roomId: socketHandler.roomId,
                userKey: socketHandler.userKey,
            });
    });

    globalModel.connection.on('getRtpCapabilitiesReceive', async (data) => {
        rtpCapabilities = data.rtpCapabilities;
        await createDevice(localObj);
    });

    globalModel.connection.on('startProduceStream', async (data) => {
        socketHandler.closelObj();
        getLocalStream();
    });

    globalModel.connection.on('startConsumerStream', async (data) => {
        socketHandler.closelObj();
        getRtpCapabilities(false);
    });
    globalModel.connection.on('canselStream', async (data) => {
        socketHandler.closelObj();
    });

}

function setVideoObj() {
    localVideo = document.querySelector(`#localVideo`);
    remoteVideo = document.querySelector(`#remoteVideo`);
}
socketHandler.closelObj = function () {
    remoteVideo.srcObject = null;
    localVideo.srcObject = null;
    if (consumer) {
        consumer.close();
        consumer = null;
    }
    if (consumerTransport) {
        consumerTransport.close();
        consumerTransport = null;
    }
    if (producer) {
        producer.close();
        producer = null;
    }
    if (producerTransport) {
        producerTransport.close();
        producerTransport = null;
    }
}


let device
let rtpCapabilities
let producerTransport
let consumerTransport
let producer
let consumer
let localObj


let params = {
    encodings: [
        { maxBitrate: 900000 }
    ],
    codecOptions: {
        videoGoogleStartBitrate: 1000
    }
}

function streamSuccess(stream) {
    localVideo.srcObject = stream
    var track = stream.getVideoTracks()[0]
    getRtpCapabilities(true);
    params.track = track;
}

function getLocalStream() {
    const audioConstraints = {
        channelCount: 1,
        sampleRate: 48000,
        sampleSize: 16,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
    };
    const videoConstraints = {
        width: { ideal: 426 },
        height: { ideal: 240 },
        frameRate: { ideal: 15, max: 20 },
    };
    navigator.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
    }, streamSuccess, error => {
    })
}

async function getRtpCapabilities(local) {
    localObj = local;
    globalModel.connection.emit('getRtpCapabilities', {
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
    });
}

async function createDevice (local) {
    try {
        device = new mediasoupClient.Device()
        await device.load({
            routerRtpCapabilities: rtpCapabilities
        })
        if (local)
            createSendTransport();
        else
            createRecvTransport();

    } catch (error) {
        console.log(error)
        if (error.name === 'UnsupportedError')
            console.warn('browser not supported')
    }
}

function createSendTransport() {
    const model = {
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
        sender: true
    }
    globalModel.connection.emit('createWebRtcTransport', model, ({ params }) => {
        if (params.error) {
            console.log(params.error)
            return
        }
        producerTransport = device.createSendTransport(params)
        producerTransport.on('connect', async ({ dtlsParameters }, errback) => {
            try {
                await globalModel.connection.emit('transportConnect', {
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                    dtlsParameters: dtlsParameters,
                })
                callback()

            } catch (error) {
                errback(error)
            }
        })
        producerTransport.on('produce', async (parameters, callback, errback) => {
            try {
                await globalModel.connection.emit('transportProduce', {
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                }, ({ id }) => {
                    callback({ id })
                })
            } catch (error) {
                errback(error)
            }
        })
        connectSendTransport();
    })
}

async function connectSendTransport () {
    producer = await producerTransport.produce(params)
}
async function createRecvTransport() {
    const model = {
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
        sender: false
    }
    await globalModel.connection.emit('createWebRtcTransport', model, ({ params }) => {
        if (params.error) {
            console.log(params.error)
            return
        }
        consumerTransport = device.createRecvTransport(params);
        globalModel.connection.emit('consume', {
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey,
            rtpCapabilities: device.rtpCapabilities
        });
        consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await globalModel.connection.emit('transportRecvConnect', {
                    roomId: socketHandler.roomId,
                    userKey: socketHandler.userKey,
                    dtlsParameters: dtlsParameters,
                })

                callback()
            } catch (error) {
                errback(error)
            }
        })
    })
}
