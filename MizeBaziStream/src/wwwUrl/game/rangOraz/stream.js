import * as mediasoupClient from "mediasoup-client";
socketHandler.streamInit = function () {
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
        globalModel.connection.emit('consumerResume')
    });

    globalModel.connection.on('getRtpCapabilitiesReceive', async (data) => {
        rtpCapabilities = data.rtpCapabilities;
        await createDevice(localObj);
    });

    globalModel.connection.on('getLocalStream', async (data) => {
        socketHandler.closeObj();
        getLocalStream();
    });

    globalModel.connection.on('getRemotStream', async (data) => {
        socketHandler.closeObj();
        getRtpCapabilities(false);
    });

}

socketHandler.closeObj = function () {
    remoteVideo.srcObject = null;
    localVideo.srcObject = null;
    if (producer) {
        producer.close();
        producer = null;
    }
    if (producerTransport) {
        producerTransport.close();
        producerTransport = null;
    }
    if (consumer) {
        consumer.close();
        consumer = null;
    }
    if (consumerTransport) {
        consumerTransport.close();
        consumerTransport = null;
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
    globalModel.connection.emit('getRtpCapabilities')
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

function createSendTransport () {
    globalModel.connection.emit('createWebRtcTransport', { sender: true }, ({ params }) => {
        if (params.error) {
            console.log(params.error)
            return
        }
        producerTransport = device.createSendTransport(params)
        producerTransport.on('connect', async ({ dtlsParameters }, errback) => {
            try {
                await globalModel.connection.emit('transport-connect', {
                    dtlsParameters,
                })
                callback()

            } catch (error) {
                errback(error)
            }
        })
        producerTransport.on('produce', async (parameters, callback, errback) => {
            try {
                await globalModel.connection.emit('transport-produce', {
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
async function createRecvTransport (){
    await globalModel.connection.emit('createWebRtcTransport', { sender: false }, ({ params }) => {
        if (params.error) {
            console.log(params.error)
            return
        }
        consumerTransport = device.createRecvTransport(params);
        globalModel.connection.emit('consume', { rtpCapabilities: device.rtpCapabilities });
        consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await globalModel.connection.emit('transport-recv-connect', {
                    dtlsParameters,
                })

                callback()
            } catch (error) {
                errback(error)
            }
        })
    })
}
