import Stream from './stream';
import { KhandeControll } from './extensions';
import { khandeDb } from './khandeDb';
import { DoorType } from './property';

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

    protected sendSoal() {
        const item = this.groups.find(x => x.index == this.activeUser2);
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find(x => x.index == this.activeUser2);
        if (!item || !user) return;

        let model = '';

        switch (this.door) {
            case DoorType.d2: model =  item.soalPich1; break;
            case DoorType.d4: model =  item.soalPich2; break;
            case DoorType.d6: model = item.shaer; break;
            case DoorType.d8: model = item.soalPich3; break;
            case DoorType.d10: model = item.masal; break;
        }
        this.soal = this.soalReplace(model);
        this.soal2 = model;
        this.isSoal = false;

        KhandeControll.sendToSocket('sendSoalReceive', user.connectionId!, model);
    }

}