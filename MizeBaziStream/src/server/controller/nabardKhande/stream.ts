import { SteamType, userInGameStatusType } from '../../model/gameInterfaces';
import { khandeDb } from './khandeDb';
import SFU2 from '../../handler/sfu2';
import { User } from '../../model/interfaces';
import SocketManager from '../../handler/socket';
import { Property } from './property';
import { KhandeControll, khandeInstance } from './extensions';

export default class Stream extends Property {
    constructor(roomId: string) {
        super(roomId);
        this.sfu.addRouter();
    }

    public sfu = new SFU2(SteamType.audio);

    protected getUser(model: any): User | undefined {
        const room = khandeDb().get(model.roomId);
        return room?.users.find((x: User) => x.key === model.userKey);
    }

    public async closeConsumer(roomId: any, userKey: any) {
        if (!this.sfu.router) return;
        const user = this.getUser({ roomId: roomId, userKey: userKey });
        if (!user) return;

        await this.sfu.closeConsumer(user.id);
    }

    public async closeProducer(roomId: any, userKey: any) {
        if (!this.sfu.router) return;
        const user = this.getUser({ roomId: roomId, userKey: userKey });
        if (!user) return;
        if (this.sfu.producer.has(user.id)) {
            this.sfu.closeProducer(user.id)
        }
    }

    public async getRtpCapabilities(model: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;

        const rtpCapabilities = this.sfu.router?.rtpCapabilities;
        SocketManager.sendToSocket('hubNabardKhande', 'getRtpCapabilitiesReceive', user.connectionId, {
            rtpCapabilities: rtpCapabilities,
            producerUserId: model.producerUserId,
            local: model.local
        });
    }

    public async createWebRtcTransport(model: any, callback: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;

        const callbackModel = await this.sfu.createWebRtcTransport(user.id, model.sender);
        callbackModel.producerUserId = model.producerUserId;
        callback(callbackModel)
    }

    public async transportConnect(model: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;

        const producerTransport = this.sfu.producerTransport.get(user.id);
        if (producerTransport && !producerTransport.appData.connected) {
            await producerTransport?.connect({ dtlsParameters: model.dtlsParameters })
            producerTransport.appData.connected = true;
        }
    }

    public async transportProduce(model: any, callback: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;
        const createProducerModel = {
            kind: model.kind,
            rtpParameters: model.rtpParameters
        }
        const b = await this.sfu.createProducer(user.id, createProducerModel);
        if (b) {
            const producer = this.sfu.producer.get(user.id);
            this.startConsumerStream(user.id);
            callback({ id: producer?.id })
        }
    }

    public async transportRecvConnect(model: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;
        const transport = this.sfu.consumerTransport.get(user.id);
        if (transport && !transport.appData.connected) {
            await transport.connect({ dtlsParameters: model.dtlsParameters });
            transport.appData.connected = true;
        }
    }

    public async consume(model: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;

        const params = await this.sfu.createConsumer(user.id, model.producerUserId, model.rtpCapabilities);
        if (!params) return;
        params.producerUserId = model.producerUserId;
        SocketManager.sendToSocket('hubNabardKhande', 'consumeReceive', user.connectionId, { params });
    }

    public async consumerResume(model: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;

        try {
            if (!this.sfu.consumer.get(user.id)?.closed) {
                await this.sfu.consumer.get(user.id)?.resume()
            }
        } catch (err) {
            console.error('Failed to resume consumer', err);
        }
    }

    public startProduceStream() {
        this.startStream(this.activeUser1);
    }

    public startPartnerStream() {
        this.startStream(this.activeUser2);
    }

    private startStream(activeUser: number) {
        if (!this.sfu.router) return;
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.index == activeUser);
        if (!user) return;

        SocketManager.sendToSocket('hubNabardKhande', 'startProduceStream', user.connectionId, true);
    }


    public startConsumerStream(userId: number) {
        if (!this.sfu.router) return;
        const room = khandeDb().get(this.roomId);
        if (!room || !room?.users) return;

        const users = room.users.filter((user: User) =>
            user.id != userId
            && user.userInGameStatus != userInGameStatusType.ofline
            && user.userInGameStatus != userInGameStatusType.ekhraj
        );

        const connectionIds = users?.map(user => user.connectionId);
        
        KhandeControll.sendToConnectionListId(connectionIds, 'startConsumerStream', userId);
    }

    public allCancelStream() {
        if (!this.sfu.router) return;
        KhandeControll.sendToMultipleSockets(this.roomId, 'canselStream', true);
    }

    public setFinish() {
        this.finish = true;
        this.sfu.clear();
        this.score.clear();
        this.smile.clear();
        this.faceOff.clear();
        clearTimeout(this.timeoutId);
        khandeDb().delete(this.roomId);
        khandeInstance().stop(this.roomId);
    }
}