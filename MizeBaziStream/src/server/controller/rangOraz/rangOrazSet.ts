import { rangOrazDb } from './rangOrazDb';
import SocketManager from '../../handler/socket';
import { User } from '../../model/interfaces';
import { RangOrazDoor } from './rangOrazProperty';
import BaseRangOrazReceive from './rangOrazReceive';
import { RangOrazControll } from './rangOrazExtensions';

export default class BaseRangOrazSet extends BaseRangOrazReceive {
    constructor(roomId: string) {
        super(roomId);
    }

    public setRaieGiriCount(model: any) {
        // اصلاح
        //if (this.nobatType != NobatType.bazporsi) return;

        const room = rangOrazDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey);
        if (!user1 || this.bazporsiUsers.includes(user1.id)) return;
        const user2 = room?.users.find((x: User) => x.id == model.userId && [11, 2].indexOf(x.userInGameStatus) == -1);
        if (!user2 || !this.bazporsiUsers.includes(user2.id)) return;
        if (this.raieGiriCount.has(user1.id)) {
            this.raieGiriCount.delete(user1.id);
        }
        this.raieGiriCount.set(user1.id, user2.id);
        SocketManager.sendToSocket('hubRangOraz', 'setRaieGiriCountReceive', user1.connectionId,
            {
                userId: user2.id,
                b: this.raieGiriCount.has(user1.id) ? true : false
            });
    }

    public setBazporsi(model: any) {
        // اصلاح
        //if (this.nobatType != NobatType.bazporsi) return;
        const room = rangOrazDb().get(this.roomId);
        const bazporsUser = room?.users.find((x: User) => x.type == 1 && x.key == model.userKey);
        if (!bazporsUser) return;
        const user = room?.users.find((x: User) => x.id == model.userId && [11, 2].indexOf(x.userInGameStatus) == -1);
        if (!user) return;

        if (this.bazporsiUsers.includes(model.userId)) {
            this.bazporsiUsers = this.bazporsiUsers.filter(userId => userId !== model.userId);
        } else {
            this.bazporsiUsers.push(model.userId);
        }

        if (this.bazporsiUsers.length > 2)
            this.bazporsiUsers = this.bazporsiUsers.slice(1);
        SocketManager.sendToSocket('hubRangOraz', 'setBazporsiReceive', bazporsUser.connectionId, this.bazporsiUsers);
    }

    public setShowOstad(model: any) {
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.type == 2 && x.key == model.userKey);
        if (!user) return;
        this.isShowOstad = true;
        this.showOstadReceive();
    }

    public setHadseNaghsh(model: any) {
        if (!this.loserUser?.id) return;
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.id == this.loserUser?.id);
        if (!user) return;

        const userHadseNaghsh = room?.users.find((x: User) => x.id == model.userId);
        if (!userHadseNaghsh) return;
        this.hadseNaghsh = {
            id: userHadseNaghsh.id,
            type: userHadseNaghsh.type
        }
        SocketManager.sendToSocket('hubRangOraz', 'getHadseNaghsh', user.connectionId, model.userId)
    }

    public addChalesh(model: any) {
        if (this.chalengerTime || !this.isStream || this.chalenger > 0 || this.door == RangOrazDoor.d1) return;

        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser);
        if (!user) return;
        const index = this.chalengerList.findIndex(x => x == user.id);
        if (index > -1) return;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'addChaleshReceive', user.id);

    }
    public addSticker(model: any) {
        if (!this.isStream) return;

        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser);
        if (!user) return;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'addStickerReceive', {
            id: user.id,
            t: model.t
        });
    }
    public addTarget(model: any) {
        if (!this.isStream) return;
        const room = rangOrazDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId && x.index != this.activeUser);
        if (!user1 || !user2) return;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'addTargetReceive', {
            id: user2.id,
            type:model.type
        });
    }
    public setChalesh(model: any) {
        if (!this.isStream || this.chalenger > 0 || this.door == RangOrazDoor.d1) return;

        const room = rangOrazDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId);

        if (!user1 || !user2) return;
        this.chalengerList.push(model.userId);
        this.chalenger = model.userId;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'setChaleshReceive', model.userId);
    }

    public setMozoeNaghashi(model: any) {
        if (this.mozoeNaghashi != '') return;

        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.type == 2);
        if (!user) return;

        const mozoe = this.mozoeNaghashiList.find(x => x == model.mozoe);
        if (!mozoe) return;
        this.mozoeNaghashi = mozoe;

        SocketManager.sendToSocket('hubRangOraz', 'setMozoeNaghashiReceive', user.connectionId, true);
    }
    
    public sendImg(model: any) {
        if (this.door != RangOrazDoor.d3 && this.door != RangOrazDoor.d4) return;
        const room = rangOrazDb().get(model.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.type != 1);
        if (!user) return;
        if (this.naghashi.has(user.id)) {
            this.naghashi.delete(user.id);
        }
        this.naghashi.set(user.id, model.data);

        const user2 = room?.users.find((x: User) => x.type == 11 && x.userInGameStatus == 1);
        if (!user2) return;
        SocketManager.sendToSocket('hubRangOraz', 'getImgForSpy', user2.connectionId, {
            userName: user.info.UserName,
            data: model.data
        });
    }
}
