import { mafiaDb } from './mafiaDb';
import { User } from '../../model/interfaces';
import Receive from './receive';
import { MafiaControll } from './extensions';

export default class Set extends Receive {
    constructor(roomId: string) {
        super(roomId);
    }

    public addSticker(model: any) {
        if (!this.isStream) return;

        const room = mafiaDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser);
        if (!user) return;
        MafiaControll.sendToMultipleSockets(this.roomId, 'addStickerReceive', {
            id: user.id,
            t: model.t
        });
    }

    public addChalesh(model: any) {
        if (this.chalengerTime || !this.isStream || this.chalenger > 0 || this.door < 2) return;

        const room = mafiaDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser);
        if (!user) return;
        const index = this.chalengerList.findIndex(x => x == user.id);
        if (index > -1) return;
        MafiaControll.sendToMultipleSockets(this.roomId, 'addChaleshReceive', user.id);

    }
    public setChalesh(model: any) {
        if (!this.isStream || this.chalenger > 0 || this.door < 2) return;

        const room = mafiaDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId);

        if (!user1 || !user2) return;
        this.chalengerList.push(model.userId);
        this.chalenger = model.userId;
        MafiaControll.sendToMultipleSockets(this.roomId, 'setChaleshReceive', model.userId);
    }
    public addTarget(model: any) {
        if (!this.isStream) return;
        const room = mafiaDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId && x.index != this.activeUser);
        if (!user1 || !user2) return;
        MafiaControll.sendToMultipleSockets(this.roomId, 'addTargetReceive', {
            id: user2.id,
            type: model.type
        });
    }

}
