import * as mediasoup from 'mediasoup';
import { Worker, Router, WebRtcTransport, Producer, Consumer, RtpCapabilities, RtpCodecCapability, MediaKind } from 'mediasoup/node/lib/types';
import { SteamType } from '../model/gameInterfaces';
import config from './config';

class SFU2 {
    private static worker: Worker;
    private static retryCount = 0;
    private static readonly MAX_RETRIES = 5;

    public steamType: SteamType;
    public router: Router | null = null;
    public producerTransport: Map<number, WebRtcTransport> = new Map();
    public producer: Map<number, Producer> = new Map();
    public consumerTransport: Map<number, WebRtcTransport> = new Map();
    public consumer: Map<number, Consumer> = new Map();

    constructor(steamType: SteamType) {
        this.steamType = steamType;
    }

    static async createWorker(): Promise<void> {
        if (SFU2.retryCount >= SFU2.MAX_RETRIES) {
            console.error('Max retries reached. Exiting...');
            process.exit(1);
        }

        try {
            SFU2.worker = await mediasoup.createWorker({
                logLevel: 'warn',
                rtcMinPort: 40000,
                rtcMaxPort: 49999,
            });

            SFU2.retryCount = 0;

            SFU2.worker.on('died', () => {
                SFU2.retryCount++;
                setTimeout(() => SFU2.createWorker(), 2000);
            });
        } catch (error) {
            SFU2.retryCount++;
            setTimeout(() => SFU2.createWorker(), 2000);
        }
    }

    async clear(): Promise<void> {
        await this.stopProducer();
        await this.closeAllConsumer();


        this.router = null;
    }

    public async stopProducer(): Promise<void> {
        for (const [userId, producer] of this.producer.entries()) {
            try {
                await producer.close();
            } catch (err) {
            }
        }
        this.producer.clear();
        for (const [userId, producer] of this.producerTransport.entries()) {
            try {
                await producer.close();
            } catch (err) {
            }
        }
        this.producerTransport.clear();
    }

    async closeProducer(userId: number): Promise<void> {
        if (this.producer.has(userId)) {
            await this.producer.get(userId)!.close();
            this.producer.delete(userId);
        }
        if (this.producerTransport.has(userId)) {
            await this.producerTransport.get(userId)!.close();
            this.producerTransport.delete(userId);
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

    public async closeAllConsumer(): Promise<void> {
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
    }

    async addRouter(): Promise<void> {
        await this.clear();
        const mediaCodecs = config.mediaCodecs;

        this.router = await SFU2.worker.createRouter({ mediaCodecs });
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
                if (this.producerTransport.has(userId)) {
                    await this.closeProducer(userId);
                }
                this.producerTransport.set(userId, transport);
            } else {
                if (this.consumerTransport.has(userId)) {
                    await this.closeConsumer(userId);
                }
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

    async createProducer(userId: number, model: any): Promise<boolean> {
        try {
            const producerTransport = this.producerTransport.get(userId);
            if (!producerTransport)
                return false;

            const producer = await producerTransport!.produce({
                kind: model.kind,
                rtpParameters: model.rtpParameters,
            });

            producer.on('transportclose', () => {
                this.stopProducer();
                this.closeAllConsumer();
                //model.allCancelStream();
            });

            this.producer.set(userId, producer);

            return true;

        } catch (error) {
            console.log('createProducer' + error);
            return false;
        }
    }

    async createConsumer(userId: number, producerUserId: number, rtpCapabilities: RtpCapabilities): Promise<any> {
        try {
            const producer = this.producer.get(producerUserId);
            if (producer && this.router!.canConsume({
                producerId: producer.id,
                rtpCapabilities,
            })) {
                const transport = this.consumerTransport.get(userId);
                if (!transport) throw new Error('Consumer transport not found');

                const consumer = await transport.consume({
                    producerId: producer.id,
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
                    producerId: producer.id,
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

export default SFU2;

