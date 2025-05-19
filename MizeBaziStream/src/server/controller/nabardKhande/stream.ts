import { SteamType, userInGameStatusType } from '../../model/gameInterfaces';
import { khandeDb } from './khandeDb';
import SFU from '../../handler/sfu';
import { User } from '../../model/interfaces';
import SocketManager from '../../handler/socket';
import { Property } from './property';
import { KhandeControll, khandeInstance } from './extensions';

export default class Stream extends Property {
    constructor(roomId: string) {
        super(roomId);
        this.sfu.addRouter();
    }

    public sfu = new SFU(SteamType.audio);

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
        if (user.id == this.sfu.producerUserId) {
            this.sfu.stopProducer()
        }
    }

    public async getRtpCapabilities(model: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;

        const rtpCapabilities = this.sfu.router?.rtpCapabilities;
        SocketManager.sendToSocket('hubNabardKhande', 'getRtpCapabilitiesReceive', user.connectionId, { rtpCapabilities });
    }

    public async createWebRtcTransport(model: any, callback: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;

        const callbackModel = await this.sfu.createWebRtcTransport(user.id, model.sender)
        callback(callbackModel)
    }

    public async transportConnect(model: any) {
        if (!this.sfu.router) return;
        const user = this.getUser(model);
        if (!user) return;

        if (this.sfu.producerTransport && !this.sfu.producerTransport.appData.connected) {
            await this.sfu.producerTransport?.connect({ dtlsParameters: model.dtlsParameters })
            this.sfu.producerTransport.appData.connected = true;
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
        const b = await this.sfu.createProducer(createProducerModel);
        if (b) {
            this.startConsumerStream(user.id);
            callback({ id: this.sfu.producer?.id })
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

        const params = await this.sfu.createConsumer(user.id, model.rtpCapabilities)
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
        if (!this.sfu.router) return;
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.index == this.activeUser1);
        if (!user) return;

        SocketManager.sendToSocket('hubNabardKhande', 'startProduceStream', user.connectionId, true);
    }

    public startProduceStream2(connectionId: string) {
        if (!this.sfu.router) return;
        SocketManager.sendToSocket('hubNabardKhande', 'startProduceStream', connectionId, true);
    }

    public startProduceStreamById(id: number) {
        if (!this.sfu.router) return;
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.id == id);
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

        KhandeControll.sendToConnectionListId(connectionIds, 'startConsumerStream', true);
    }

    public allCancelStream() {
        if (!this.sfu.router) return;
        KhandeControll.sendToMultipleSockets(this.roomId, 'canselStream', true);
    }

    public setFinish() {
        this.finish = true;
        this.sfu.clear();
        clearTimeout(this.timeoutId);
        khandeDb().delete(this.roomId);
        khandeInstance().stop(this.roomId);
    }
}