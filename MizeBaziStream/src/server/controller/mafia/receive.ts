﻿import { mafiaDb } from './mafiaDb';
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
        MafiaControll.sendToMultipleSockets(this.roomId, 'infoMainReceive', model);
    }

    protected getDefensePositionReceive() {
        const model = {
            activeUser: this.activeUser,
            wait: this.mainWait
        };
        MafiaControll.sendToMultipleSockets(this.roomId, 'getDefensePositionReceive', model);
    }
    protected startStreamReceive() {
        this.isStream = true;
        const model = {
            activeUser: this.activeUser,
            wait: this.wait
        };
        MafiaControll.sendToMultipleSockets(this.roomId, 'startStreamReceive', model);
    }
    protected endStreamReceive() {
        this.isStream = false;
        const model = {};
        MafiaControll.sendToMultipleSockets(this.roomId, 'endStreamReceive', model);
    }

    protected gameResponseReceive(wait: number) {
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