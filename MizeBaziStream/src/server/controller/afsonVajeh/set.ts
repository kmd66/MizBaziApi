import { afsonDb } from './afsonDb';
import SocketManager from '../../handler/socket';
import { User } from '../../model/interfaces';
import Receive from './receive';
import { AfsonControll } from './extensions';

export default class Set extends Receive {
    constructor(roomId: string) {
        super(roomId);
    }

    public addSticker(model: any) {
        if (!this.isStream) return;

        const room = afsonDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser);
        if (!user) return;
        AfsonControll.sendToMultipleSockets(this.roomId, 'addStickerReceive', {
            id: user.id,
            t: model.t
        });
    }

}
