import Stream from './stream';
import { KhandeControll } from './extensions';

export default class Receive extends Stream {
    constructor(roomId: string) {
        super(roomId);
    }

    public infoMainReceive(wait: number | null = null) {
        const model = {
            door: this.door,
            state: this.state,
            wait: wait ? wait : this.mainWait,
        };
        KhandeControll.sendToMultipleSockets(this.roomId, 'infoMainReceive', model);
    }

    protected sendMainReceive(eventName: string, type: string, wait: number) {
        const model = {
            activeUser: this.activeUser1,
            activeUser2: this.activeUser2,
            type: type,
            wait: wait,
            door: this.door
        };
        KhandeControll.sendToMultipleSockets(this.roomId, eventName, model);
    }

}