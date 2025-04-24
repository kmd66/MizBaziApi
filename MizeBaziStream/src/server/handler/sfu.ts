import * as mediasoup from 'mediasoup';
import { Worker, Router, RtpCodecCapability, Transport, Producer, Consumer } from 'mediasoup/node/lib/types';

import { SteamType } from '../model/gameInterfaces';
import config from './config';

//const audioConstraints = {
//    channelCount: 1,
//    sampleRate: 48000,
//    sampleSize: 16,
//    echoCancellation: true,
//    noiseSuppression: true,
//    autoGainControl: true,
//};
//const videoConstraints = {
//    width: { ideal: 426 },
//    height: { ideal: 240 },
//    frameRate: { ideal: 15, max: 20 },
//};
//const stream = await navigator.mediaDevices.getUserMedia({
//    video: videoConstraints,
//    audio: audioConstraints, // (همون تنظیماتی که برای صدا گفتیم)
//});

class SFU {
    private static worker: Worker;
    private static retryCount = 0;
    private static MAX_RETRIES = 5;

    private router: Router | null = null;
    private steamType: SteamType;

    private producerTransport: Transport | null = null;
    private consumerTransport: Transport | null = null;
    private producer: Producer | null = null;
    private consumer: Consumer | null = null;

    public constructor(steamType: SteamType) {
        this.steamType = steamType;
    }

    public static async createWorker(): Promise<void> {
        if (SFU.retryCount >= SFU.MAX_RETRIES) {
            console.error('Max retries reached. Exiting...');
            process.exit(1);
        }


        try {
            SFU.worker = await mediasoup.createWorker({
                logLevel: 'warn',
                rtcMinPort: 40000,
                rtcMaxPort: 49999
            });
            SFU.retryCount = 0; // Reset counter on success

            SFU.worker.on('died', () => {
                SFU.retryCount++;
                console.error(`Worker died! Retry ${SFU.retryCount}/${SFU.MAX_RETRIES}`);
                setTimeout(() => SFU.createWorker(), 3000);
            });
        } catch (error) {
            SFU.retryCount++;
            setTimeout(() => SFU.createWorker(), 3000);
        }
    }

    public async addRouter(): Promise<void> {
        const mediaCodecs: RtpCodecCapability[] = config.mediaCodecs;
        this.router = await SFU.worker.createRouter({ mediaCodecs });
    }

    public async close(): Promise<void> {
        if (this.router) {
            await this.router.close();
            this.router = null;
        }
    }
    public async stopProducer(): Promise<void> {
        if (this.producer) {
            await this.producer.close();
            this.producer = null;
        }
    }

    // ایجاد WebRTC Transport برای تولیدکننده یا مصرف‌کننده
    public async createWebRtcTransport(sender: boolean, callback: Function): Promise<void> {
        try {
            let transport = await this.router!.createWebRtcTransport(config.webRtcTransport_options);

            transport.on('dtlsstatechange', (dtlsState) => {
                if (dtlsState === 'closed') {
                    transport.close();
                }
            });

            if (sender) {
                this.producerTransport = transport;
            } else {
                this.consumerTransport = transport;
            }

            callback({
                params: {
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                },
            });
        } catch (error) {
            console.log(error);
            callback({
                params: {
                    error: error,
                },
            });
        }
    }

    // تولید استریم (Producer)
    public async transportProduce(model:any, callback: Function): Promise<void> {
        try {
            const transport = model.sender ? this.producerTransport : this.consumerTransport;
            if (!transport) return;

            const producer = await transport.produce({
                kind: model.kind,
                rtpParameters: model.rtpParameters,
            });

            this.producer = producer;

            callback({
                params: {
                    id: producer.id,
                    kind: producer.kind,
                    rtpParameters: producer.rtpParameters,
                },
            });
        } catch (error) {
            console.log(error);
            callback({
                params: {
                    error: error,
                },
            });
        }
    }

    // مصرف استریم (Consumer)
    public async consume(rtpCapabilities: any, callback: Function): Promise<void> {
        try {
            if (this.router!.canConsume({ producerId: this.producer!.id, rtpCapabilities })) {
                this.consumer = await this.consumerTransport!.consume({
                    producerId: this.producer!.id,
                    rtpCapabilities,
                    paused: true,
                });

                this.consumer.on('transportclose', () => {
                    console.log('transport close from consumer');
                });

                this.consumer.on('producerclose', () => {
                    console.log('producer of consumer closed');
                });

                const params = {
                    id: this.consumer.id,
                    producerId: this.producer?.id,
                    kind: this.consumer.kind,
                    rtpParameters: this.consumer.rtpParameters,
                };

                callback({ params });
            }
        } catch (error) {
            console.log(error);
            callback({
                params: {
                    error: error,
                },
            });
        }
    }
}

export default SFU;

