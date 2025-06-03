import Receive from './receive';
import { khandeDb } from './khandeDb';
import { User } from '../../model/interfaces';
import { KhandeControll } from './extensions';

export default class Set extends Receive {
    constructor(roomId: string) {
        super(roomId);
    }

    public addSticker(model: any) {
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser1 && x.userInGameStatus == 1);
        if (!user) return;
        KhandeControll.sendToMultipleSockets(this.roomId, 'addStickerReceive', {
            id: user.id,
            t: model.t
        });
    }

    public addSticker2(model: any) {
        if (!model.t ) return;
        if (model.t != 'l1' && model.t != 'l2') return;
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser2 && x.userInGameStatus == 1);
        if (!user) return;
        KhandeControll.sendToMultipleSockets(this.roomId, 'addSticker2Receive', {
            id: user.id,
            t: model.t
        });
    }

    public addMessage(model: any) {
        if (this.soal == '' || this.isSoal) return;
        if (!model.msg) return;
        if (this.state == 'soalPich' && model.msg.length > 30) return;
        if (this.state == 'labKhoni' && model.msg.length > 60) return;
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser2 && x.userInGameStatus == 1);
        if (!user) return;
        const soal = this.soalReplace(model.msg);
        if (soal == this.soal) {
            const item = this.groupItem(user.key!);
            if (!item) return;
            this.isSoal = true;
            if (!this.score.has(item.type)) {
                this.score.set(item.type, []);
            }
            this.score.get(item.type)!.push(1);
        }

        KhandeControll.sendToMultipleSockets(this.roomId, 'addMessageReceive', {
            isSoal: this.isSoal,
            userName: user.info.UserName,
            msg: model.msg
        });
    }

    public setSmile(model: any) {
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.userInGameStatus == 1);
        const item = this.groupItem(model.userKey!);
        if (!item || !user) return;

        if (model.smile > this.smileReng) {
            user.userInGameStatus = 2;
            const pKey = this.getPartnerKey(user.key!);
            const pUser = room!.users.find(x => x.key == pKey);
            if (pUser && [2, 11].indexOf(pUser.userInGameStatus) == -1) pUser!.userInGameStatus = 2;
            khandeDb().update(this.roomId, room!);
            this.isUserAction = true;
            KhandeControll.sendToMultipleSockets(this.roomId, 'setSmileReceive', { userId: user.id, pId: pUser?.id });
        }

        if (this.smile.has(item.type)) {
            this.smile.delete(item.type);
        }
        this.smile.set(item.type, model.smile);
    }
    public setFaceOff(model: any) {
        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.userInGameStatus == 1);
        const item = this.groupItem(model.userKey!);
        if (!item || !user) return;

        let reng = 1;
        if (this.faceOff.has(item.type)) {
            reng = this.faceOff.get(item.type)!;
            this.faceOff.delete(item.type);
        }
        this.faceOff.set(item.type, reng);
    }
}
