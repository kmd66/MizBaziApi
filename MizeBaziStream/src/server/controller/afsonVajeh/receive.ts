import { afsonDb } from './afsonDb';
import SocketManager from '../../handler/socket';
import { User } from '../../model/interfaces';
import { receiveType } from '../../model/gameInterfaces';
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
        this.isUserAction = false;
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

}