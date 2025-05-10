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
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser && x.userInGameStatus == 1);
        if (!user) return;
        MafiaControll.sendToMultipleSockets(this.roomId, 'addStickerReceive', {
            id: user.id,
            t: model.t
        });
    }

    public addChalesh(model: any) {
        if (this.chalengerTime || !this.isStream || this.chalenger > 0 || this.door < 2) return;

        const room = mafiaDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser && x.userInGameStatus == 1);
        if (!user) return;
        const index = this.chalengerList.findIndex(x => x == user.id);
        if (index > -1) return;
        MafiaControll.sendToMultipleSockets(this.roomId, 'addChaleshReceive', user.id);

    }
    public setChalesh(model: any) {
        if (!this.isStream || this.chalenger > 0 || this.door < 2) return;

        const room = mafiaDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId && x.userInGameStatus == 1);

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

    public setKalantarShot(model: any) {
        if (this.doorType != 1 || this.door < 3) return;
        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const index = this.groups.findIndex(x => x.key == model.userKey && x.shot == true);
        if (index == -1) return;

        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.type == 7 && x.userInGameStatus == 1);
        const user2 = room?.users.find((x: User) => x.id == model.userId);
        if (!user1 || !user2) return;

        if (user2.userInGameStatus != 1 && user2.userInGameStatus != 10) return;

        this.groups[index].shot = false;
        user2.userInGameStatus = 2;


        mafiaDb().update(this.roomId, room);
        this.isUserAction = true;

        MafiaControll.sendToMultipleSockets(this.roomId, 'setKalantarShotReceive', {
            user1: user1.id,
            user2: user2.id,
            user2Type: user2.type
        });
    }
    public setHadseNaghsh(model: any) {
        if (this.doorType != 1 || this.door < 3) return;
        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const index = this.groups.findIndex(x => x.key == model.userKey && x.hadseNaghsh == true);
        if (index == -1) return;

        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.type > 20 && x.userInGameStatus == 1);
        const user2 = room?.users.find((x: User) => x.id == model.userId && [1, 10].indexOf(x.userInGameStatus) > -1);
        if (!user1 || !user2) return;

        const groupItem = this.groupItem(user2.key!);
        if (!groupItem) return;

        let t = false;
        this.groups[index].hadseNaghsh = false;

        if ([7, 9].indexOf(user2.type) > -1) {
            if (user2.type == model.type && groupItem.shot) {
                t = true;
                user2.userInGameStatus = 2;
            } else {
                user1.userInGameStatus = 2;
            }
        } else if (user2.type == model.type) {
            t = true;
            user2.userInGameStatus = 2;
        } else {
            user1.userInGameStatus = 2;
        }

        mafiaDb().update(this.roomId, room);
        this.isUserAction = true;

        MafiaControll.sendToMultipleSockets(this.roomId, 'setHadseNaghshReceive', {
            user1: user1.id,
            user2: user2.id,
            type: t
        });
    }

    public addMessage(model: any) {
        if (this.doorType != 3) return;

        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const user = room.users.find((x: User) => x.key == model.userKey && x.userInGameStatus == 1 && x.type > 20);
        if (!user) return;

        const users = room.users.filter((x: User) => x.userInGameStatus == 1 && x.type > 20);

        const connectionIds = users.map(x => x.connectionId);

        MafiaControll.sendToConnectionListId(connectionIds, 'addMessageReceive', { message: model.message, title: user.info.UserName });
    }

}
