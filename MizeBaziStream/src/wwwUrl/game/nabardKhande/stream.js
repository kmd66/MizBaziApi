import * as mediasoupClient from "mediasoup-client";
let remoteVideo, localVideo, labKhoniVideo;
socketHandler.streamInit = function () {
    setVideoObj();
    globalModel.connection.on('consumeReceive', async ({ params }) => {
        if (params.error) {
            return
        }
        const cT = consumerTransport.get(params.producerUserId);

        const cR = await cT.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters
        });
        consumer.set(params.producerUserId, cR);
        const { track } = cR;
        setRemoteVideo(track);

        globalModel.connection.emit('consumerResume', {
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey,
        });
    });

    globalModel.connection.on('getRtpCapabilitiesReceive', async (data) => {
        rtpCapabilities = data.rtpCapabilities;
        await createDevice(data);
    });

    globalModel.connection.on('startProduceStream', async (data) => {
        getLocalStream();
    });

    globalModel.connection.on('startConsumerStream', async (data) => {
        getRtpCapabilities(false, data);
    });
    globalModel.connection.on('canselStream', async (data) => {
        socketHandler.closeObj();
    });
}
function setRemoteVideo(track) {
    if (vm.appModel.state == 'labKhoni') {
        if (!remoteVideo.srcObject) {
            remoteVideo.srcObject = new MediaStream([track]);
            remoteVideo.muted = true;
            remoteVideo.onloadedmetadata = () => {
                remoteVideo.play().catch(e => {
                    console.warn('Play error:', e);
                });
            };
        }
        else {
            labKhoniVideo.srcObject = new MediaStream([track]);
            labKhoniVideo.muted = true;
            labKhoniVideo.onloadedmetadata = () => {
                labKhoniVideo.play().catch(e => {
                    console.warn('Play error:', e);
                });
            };
        }
    }
    else {
        remoteVideo.srcObject = new MediaStream([track]);
        remoteVideo.muted = true;
        remoteVideo.onloadedmetadata = () => {
            remoteVideo.play().catch(e => {
                console.warn('Play error:', e);
            });
        };
    }
}
function setVideoObj() {
    localVideo = document.querySelector(`#localVideo`);
    remoteVideo = document.querySelector(`#remoteVideo`);
    labKhoniVideo = document.querySelector(`#labKhoniVideo`);
}
socketHandler.closeObj = function () {
    remoteVideo.srcObject = null;
    localVideo.srcObject = null;
    labKhoniVideo.srcObject = null;
    clearConsumer();
    if (producer) {
        producer.close();
        producer = null;
    }
    if (producerTransport) {
        producerTransport.close();
        producerTransport = null;
    }
}

function closeConsumer(userId) {
    if (consumer.has(userId)) {
        consumer.get(userId).close();
        consumer.delete(userId);
    }
    if (consumerTransport.has(userId)) {
        consumerTransport.get(userId).close();
        consumerTransport.delete(userId);
    }
}

function clearConsumer() {
    for (const [userId, c] of consumer.entries()) {
        try {
            c.close();
        } catch (err) { }
    }
    consumer.clear();

    for (const [userId, t] of consumerTransport.entries()) {
        try {
            t.close();
        } catch (err) { }
    }
    consumerTransport.clear();
}

let device
let rtpCapabilities
let producerTransport
let producer

let consumerTransport  = new Map();
let consumer = new Map();

let localObj

let params = {
    // mediasoup params
    encodings: [
        {
            rid: 'r0',
            maxBitrate: 100000,
            scalabilityMode: 'S1T3',
        },
        {
            rid: 'r1',
            maxBitrate: 300000,
            scalabilityMode: 'S1T3',
        },
        {
            rid: 'r2',
            maxBitrate: 900000,
            scalabilityMode: 'S1T3',
        },
    ],
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
    codecOptions: {
        videoGoogleStartBitrate: 1000
    }
}

function streamSuccess(stream) {
    if (vm.appModel.state == 'labKhoni')
        labKhoniVideo.srcObject = stream;
    else
        localVideo.srcObject = stream;

    var track = stream.getVideoTracks()[0]
    getRtpCapabilities(true, 0);
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

async function getRtpCapabilities(local, producerUserId) {
    globalModel.connection.emit('getRtpCapabilities', {
        roomId: socketHandler.roomId,
        userKey: socketHandler.userKey,
        producerUserId: producerUserId,
        local: local
    });
}

async function createDevice(model) {
    try {
        device = new mediasoupClient.Device()
        await device.load({
            routerRtpCapabilities: rtpCapabilities
        })
        if (model.local)
            createSendTransport();
        else
            createRecvTransport(model.producerUserId);

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
async function createRecvTransport(producerUserId) {
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
        const cT = device.createRecvTransport(params);
        globalModel.connection.emit('consume', {
            roomId: socketHandler.roomId,
            userKey: socketHandler.userKey,
            rtpCapabilities: device.rtpCapabilities,
            producerUserId: producerUserId
        });
        cT.on('connect', async ({ dtlsParameters }, callback, errback) => {
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
        consumerTransport.set(producerUserId, cT);
    })
}
