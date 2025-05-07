import * as mediasoup from 'mediasoup';
import { Worker, Router, WebRtcTransport, Producer, Consumer, RtpCapabilities, RtpCodecCapability, MediaKind } from 'mediasoup/node/lib/types';
import { SteamType } from '../model/gameInterfaces';
import config from './config';

class SFU {
    private static worker: Worker;
    private static retryCount = 0;
    private static readonly MAX_RETRIES = 5;

    public steamType: SteamType;
    public router: Router | null = null;
    public producerTransport: WebRtcTransport | null = null;
    public producer: Producer | null = null;
    public consumerTransport: Map<number, WebRtcTransport> = new Map();
    public consumer: Map<number, Consumer> = new Map();

    constructor(steamType: SteamType) {
        this.steamType = steamType;
    }

    static async createWorker(): Promise<void> {
        if (SFU.retryCount >= SFU.MAX_RETRIES) {
            console.error('Max retries reached. Exiting...');
            process.exit(1);
        }

        try {
            SFU.worker = await mediasoup.createWorker({
                logLevel: 'warn',
                rtcMinPort: 40000,
                rtcMaxPort: 49999,
            });

            SFU.retryCount = 0;

            SFU.worker.on('died', () => {
                SFU.retryCount++;
                setTimeout(() => SFU.createWorker(), 2000);
            });
        } catch (error) {
            SFU.retryCount++;
            setTimeout(() => SFU.createWorker(), 2000);
        }
    }

    async clear(): Promise<void> {
        try {
            if (this.producer) {
                await this.producer.close();
                this.producer = null;
            }
            if (this.producerTransport) {
                await this.producerTransport.close();
                this.producerTransport = null;
            }
        } catch (err) {
        }
        await this.stopProducer();

        for (const [userId, consumer] of this.consumer.entries()) {
            try {
                await consumer.close();
            } catch (err) {
            }
        }
        this.consumer.clear();
        for (const [userId, transport] of this.consumerTransport.entries()) {
            try {
                await transport.close();
            } catch (err) {
            }
        }
        this.consumerTransport.clear();

        this.router = null;
    }

    async stopProducer(): Promise<void> {
        if (this.producer) {
            await this.producer.close();
            this.producer = null;
        }
        if (this.producerTransport) {
            await this.producerTransport.close();
            this.producerTransport = null;
        }
    }

    async closeConsumer(userId: number): Promise<void> {
        if (this.consumer.has(userId)) {
            await this.consumer.get(userId)!.close();
            this.consumer.delete(userId);
        }
        if (this.consumerTransport.has(userId)) {
            await this.consumerTransport.get(userId)!.close();
            this.consumerTransport.delete(userId);
        }
    }

    async closeAllConsumer(): Promise<void> {
        for (const [userId, consumer] of this.consumer.entries()) {
            try {
                await consumer.close();
            } catch (err) {
            }
        }
    }

    async addRouter(): Promise<void> {

        const mediaCodecs: RtpCodecCapability[] = [
            {
                kind: 'audio' as MediaKind,
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2,
            },
            {
                kind: 'video' as MediaKind,
                mimeType: 'video/VP8',
                clockRate: 90000,
                parameters: {
                    'x-google-start-bitrate': 1000,
                },
            },
        ];

        this.router = await SFU.worker.createRouter({ mediaCodecs });
    }

    async createWebRtcTransport(userId: number, sender: boolean): Promise<any> {
        try {
            const transport = await this.router!.createWebRtcTransport(config.webRtcTransport_options);

            transport.on('dtlsstatechange', (dtlsState) => {
                if (dtlsState === 'closed') {
                    transport.close();
                }
            });

            if (sender) {
                await this.stopProducer();
                this.producerTransport = transport;
            } else {
                this.consumerTransport.set(userId, transport);
            }

            return {
                params: {
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                },
            };
        } catch (error) {
            console.log('createWebRtcTransport' + error);
            return {
                params: {
                    error,
                },
            };
        }
    }

    async createProducer(model: any): Promise<boolean> {
        try {
            this.producer = await this.producerTransport!.produce({
                kind: model.kind,
                rtpParameters: model.rtpParameters,
            });

            this.producer.on('transportclose', () => {
                this.stopProducer();
                this.closeAllConsumer();
                //model.allCancelStream();
            });
            return true;

        } catch (error) {
            console.log('createProducer' + error);
            return false;
        }
    }

    async createConsumer(userId: number, rtpCapabilities: RtpCapabilities): Promise<any> {
        try {
            if (this.producer && this.router!.canConsume({
                producerId: this.producer!.id,
                rtpCapabilities,
            })) {
                const transport = this.consumerTransport.get(userId);
                if (!transport) throw new Error('Consumer transport not found');

                const consumer = await transport.consume({
                    producerId: this.producer!.id,
                    rtpCapabilities,
                    paused: true,
                });

                consumer.on('transportclose', () => {
                    //console.log('transport close from consumer');
                });

                consumer.on('producerclose', () => {
                    consumer.close();
                });

                this.consumer.set(userId, consumer);

                return {
                    id: consumer.id,
                    producerId: this.producer!.id,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                };
            }
        } catch (error) {
            console.log('createConsumer' + error);
            return { error };
        }
    }
}

export default SFU;

