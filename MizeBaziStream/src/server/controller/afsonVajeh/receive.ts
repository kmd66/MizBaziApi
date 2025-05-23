﻿import { afsonDb } from './afsonDb';
import Stream from './stream';
import { AfsonControll } from './extensions';

export default class Receive extends Stream {
    constructor(roomId: string) {
        super(roomId);
    }

    public infoMainReceive(wait: number | null = null) {
        const model = {
            door: this.door,
            wait: wait ? wait : this.mainWait,
        };
        AfsonControll.sendToMultipleSockets(this.roomId, 'infoMainReceive', model);
    }

    protected getDefensePositionReceive() {
        const model = {
            activeUser: this.activeUser,
            wait: this.mainWait
        };
        AfsonControll.sendToMultipleSockets(this.roomId, 'getDefensePositionReceive', model);
    }
    protected startStreamReceive() {
        this.isStream = true;
        const model = {
            activeUser: this.activeUser,
            wait: this.wait
        };
        AfsonControll.sendToMultipleSockets(this.roomId, 'startStreamReceive', model);
    }
    protected endStreamReceive() {
        this.isStream = false;
        const model = {};
        AfsonControll.sendToMultipleSockets(this.roomId, 'endStreamReceive', model);
    }

    protected gameResponseReceive(wait: number) {
        const users: any = [];

        const room = afsonDb().get(this.roomId);
        room?.users.map(({ id, type }) => {
            users.push({ id: id, type: type })
        });
        const model = {
            wait: wait,
            winner: this.winner,
            users: users
        };
        AfsonControll.sendToMultipleSockets(this.roomId, 'gameResponseReceive', model);
    }

}