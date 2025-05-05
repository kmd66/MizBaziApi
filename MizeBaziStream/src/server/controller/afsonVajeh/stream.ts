import { SteamType, userInGameStatusType } from '../../model/gameInterfaces';
import { afsonDb } from './afsonDb';
import SFU from '../../handler/sfu';
import { User } from '../../model/interfaces';
import SocketManager from '../../handler/socket';
import { Property } from './property';
import { AfsonControll, afsonInstance } from './extensions';

export default class Stream extends Property {
    constructor(roomId: string) {
        super(roomId);
        this.sfu.addRouter();
    }

    public sfu = new SFU(SteamType.audio);

    protected getUser(model: any): User | undefined {
        const room = afsonDb().get(model.roomId);
        return room?.users.find((x: User) => x.key === model.userKey);
    }

    public async closeConsumer(roomId: any, userKey: any) {
        const user = this.getUser({ roomId: roomId, userKey: userKey });
        if (!user) return;

        await this.sfu.closeConsumer(user.id);
    }

    public async getRtpCapabilities(model: any) {
        const user = this.getUser(model);
        if (!user) return;

        const rtpCapabilities = this.sfu.router?.rtpCapabilities;
        SocketManager.sendToSocket('hubAfsonVajeh', 'getRtpCapabilitiesReceive', user.connectionId, { rtpCapabilities });
    }

    public async createWebRtcTransport(model: any, callback: any) {
        const user = this.getUser(model);
        if (!user) return;

        const callbackModel = await this.sfu.createWebRtcTransport(user.id, model.sender)
        callback(callbackModel)
    }

    public async transportConnect(model: any) {
        const user = this.getUser(model);
        if (!user) return;

        if (this.sfu.producerTransport && !this.sfu.producerTransport.appData.connected) {
            await this.sfu.producerTransport?.connect({ dtlsParameters: model.dtlsParameters })
            this.sfu.producerTransport.appData.connected = true;
        }
    }

    public async transportProduce(model: any, callback: any) {
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
        const user = this.getUser(model);
        if (!user) return;
        const transport = this.sfu.consumerTransport.get(user.id);
        if (transport && !transport.appData.connected) {
            await transport.connect({ dtlsParameters: model.dtlsParameters });
            transport.appData.connected = true;
        }
    }

    public async consume(model: any) {
        const user = this.getUser(model);
        if (!user) return;

        const params = await this.sfu.createConsumer(user.id, model.rtpCapabilities)
        SocketManager.sendToSocket('hubAfsonVajeh', 'consumeReceive', user.connectionId, { params });
    }

    public async consumerResume(model: any) {
        const user = this.getUser(model);
        if (!user) return;

        await this.sfu.consumer.get(user.id)?.resume()
    }


    protected async startProduceStream() {
        const room = afsonDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.index == this.activeUser);
        if (!user) return;

        SocketManager.sendToSocket('hubAfsonVajeh', 'startProduceStream', user.connectionId, true);
    }

    protected async startProduceStreamById(id: number) {
        const room = afsonDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.id == id);
        if (!user) return;

        SocketManager.sendToSocket('hubAfsonVajeh', 'startProduceStream', user.connectionId, true);
    }

    protected async startConsumerStream(userId: number) {
        const room = afsonDb().get(this.roomId);
        if (!room || !room?.users) return;

        const users = room.users.filter((user: User) =>
            user.id != userId
            && user.userInGameStatus != userInGameStatusType.ofline
            && user.userInGameStatus != userInGameStatusType.ekhraj
        );

        const connectionIds = users?.map(user => user.connectionId);

        AfsonControll.sendToConnectionListId(connectionIds, 'startConsumerStream', true);
    }

    protected async allCancelStream() {
        AfsonControll.sendToMultipleSockets(this.roomId, 'canselStream', true);
    }

    public setFinish() {
        this.finish = true;
        this.sfu.clear();
        clearTimeout(this.timeoutId);
        afsonDb().delete(this.roomId);
        afsonInstance().stop(this.roomId);
    }
}