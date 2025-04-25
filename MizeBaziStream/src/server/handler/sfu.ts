import * as mediasoup from 'mediasoup';
import { Worker, Router, WebRtcTransport, Producer, Consumer, RtpCapabilities, RtpParameters, RtpCodecCapability, MediaKind } from 'mediasoup/node/lib/types';
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
    public consumerTransport: Map<string, WebRtcTransport> = new Map();
    public consumer: Map<string, Consumer> = new Map();

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

    async close(): Promise<void> {
        await this.stopProducer();
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

    async closeConsumer(userId: string): Promise<void> {
        if (this.consumer.has(userId)) {
            await this.consumer.get(userId)!.close();
            this.consumer.delete(userId);
        }
        if (this.consumerTransport.has(userId)) {
            await this.consumerTransport.get(userId)!.close();
            this.consumerTransport.delete(userId);
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

    async createWebRtcTransport(userId: string, sender: boolean): Promise<any> {
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
            console.error(error);
            return {
                params: {
                    error,
                },
            };
        }
    }

    async createProducer(kind: 'audio' | 'video', rtpParameters: RtpParameters): Promise<any> {
        try {
            this.producer = await this.producerTransport!.produce({
                kind,
                rtpParameters,
            });

            this.producer.on('transportclose', () => {
                console.log('transport for this producer closed');
                this.producer!.close();
            });

        } catch (error) {
            console.error(error);
            return { error };
        }
    }

    async createConsumer(userId: string, rtpCapabilities: RtpCapabilities): Promise<any> {
        try {
            if (this.router!.canConsume({
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
                    console.log('transport close from consumer');
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
            return { error };
        }
    }
}

export default SFU;

