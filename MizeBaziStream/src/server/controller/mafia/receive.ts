import { mafiaDb } from './mafiaDb';
import Stream from './stream';
import { MafiaControll } from './extensions';

export default class Receive extends Stream {
    constructor(roomId: string) {
        super(roomId);
    }

    public infoMainReceive(wait: number | null = null) {
        const model = {
            door: this.door,
            doorType: this.doorType,
            wait: wait ? wait : this.mainWait,
        };
        if (this.doorType == 3)
            model.wait = this.door == 1 ? 20 : this.nightWait;
        MafiaControll.sendToMultipleSockets(this.roomId, 'infoMainReceive', model);
    }

    public getDefensePositionReceive() {
        const model = {
            activeUser: this.activeUser,
            wait: this.mainWait
        };
        MafiaControll.sendToMultipleSockets(this.roomId, 'getDefensePositionReceive', model);
    }
    public startStreamReceive() {
        this.isStream = true;
        const model = {
            activeUser: this.activeUser,
            wait: this.wait
        };
        MafiaControll.sendToMultipleSockets(this.roomId, 'startStreamReceive', model);
    }
    public endStreamReceive() {
        this.isStream = false;
        const model = {};
        MafiaControll.sendToMultipleSockets(this.roomId, 'endStreamReceive', model);
    }

    public gameResponseReceive(wait: number) {
        const users: any = [];

        const room = mafiaDb().get(this.roomId);
        room?.users.map(({ id, type }) => {
            users.push({ id: id, type: type })
        });
        const model = {
            wait: wait,
            winner: this.winner,
            users: users
        };
        MafiaControll.sendToMultipleSockets(this.roomId, 'gameResponseReceive', model);
    }

}