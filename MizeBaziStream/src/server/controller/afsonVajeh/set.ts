import { afsonDb } from './afsonDb';
import SocketManager from '../../handler/socket';
import { User } from '../../model/interfaces';
import Receive from './receive';
import { AfsonControll } from './extensions';
import { userInDb } from '../userInDb';
import {GameControll} from '../globalMethod';

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

    public addChalesh(model: any) {
        if (this.chalengerTime || !this.isStream || this.chalenger > 0 || this.door < 2) return;

        const room = afsonDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser);
        if (!user) return;
        const index = this.chalengerList.findIndex(x => x == user.id);
        if (index > -1) return;
        AfsonControll.sendToMultipleSockets(this.roomId, 'addChaleshReceive', user.id);

    }
    public setChalesh(model: any) {
        if (!this.isStream || this.chalenger > 0 || this.door < 2) return;

        const room = afsonDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId);

        if (!user1 || !user2) return;
        this.chalengerList.push(model.userId);
        this.chalenger = model.userId;
        AfsonControll.sendToMultipleSockets(this.roomId, 'setChaleshReceive', model.userId);
    }
    public addTarget(model: any) {
        if (!this.isStream) return;
        const room = afsonDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId && x.index != this.activeUser);
        if (!user1 || !user2) return;
        AfsonControll.sendToMultipleSockets(this.roomId, 'addTargetReceive', {
            id: user2.id,
            type: model.type
        });
    }


    public async addTalk(model: any) {
        if (!this.isStream || this.isUserAction) return;
        const groupItem = this.groups.find(x => x.key == model.userKey);
        if (!groupItem || !groupItem.talk) return;
        const room = afsonDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId && x.index != this.activeUser);
        if (!user1 || !user2) return;

        AfsonControll.sendToMultipleSockets(this.roomId, 'addTalkReceive1', { msg: `ملاقات بین بازیکن ${user1.info.UserName} و ${user2.info.UserName} رخداد` });

        groupItem.talk = false;
        this.isUserAction = true;
        const groupItem2 = this.groups.find(x => x.key == user2.key);

        let msg = ['', ''];

        if (groupItem.type == 'blue')
            msg = this.talkBlue(groupItem, groupItem2, user1, user2);
        else if (groupItem.type == 'red')
            msg = this.talkRed(groupItem, groupItem2, user1, user2);
        else
            msg = this.talkNeutral(groupItem, groupItem2, user1, user2);


        if (msg[0] != '') {
            await this.delay(100);
            SocketManager.sendToSocket('hubAfsonVajeh', 'addTalkReceive2', user1.connectionId, { msg: msg[0], groupItem: groupItem });
        }

        if (msg[1] != '') {
            await this.delay(100);
            SocketManager.sendToSocket('hubAfsonVajeh', 'addTalkReceive2', user2.connectionId, { msg: msg[1], groupItem: groupItem2 });
        }
    }
    private talkBlue(groupItem: any, groupItem2: any, user1: User, user2: User): string[] {
        let msg = ['', ''];

        if (groupItem2.type == 'blue') {
            msg[0] = 'عضو گروه آبی است';
        }
        else if (groupItem2.type == 'red' && user2.type != 11) {
            msg[0] = 'عضو گروه قرمز است';

        }
        else {
            msg[0] = 'عضو بی‌طرف است. ';
            if (user1.type == 1) {
                msg[0] += 'توسط شما مصلح و به تیم آبی پیوسط';

                if (user2.type == 11) {
                    msg[1] = `بازیکن ${user1.info.UserName} سر گروه آبی است . پیامی مبنی بر این که شما عضو تیم آبی شدید برای او ارسال شده است`;
                }
                else {
                    groupItem2.type = 'blue';
                    groupItem2.gun = true;
                    groupItem2.talk = false;
                    groupItem2.secret = groupItem.secret;
                    msg[1] = `بازیکن ${user1.info.UserName} سر گروه آبی است . شما عضو تیم آبی شدید. رمز گروه آبی ${groupItem2.secret}`;
                }

            }
        }

        return msg;
    }
    private talkRed(groupItem: any, groupItem2: any, user1: User, user2: User): string[] {
        let msg = ['', ''];

        if (groupItem2.type == 'red') {
            msg[0] = 'عضو گروه قرمز است';
        }
        else if (groupItem2.type == 'blue' && user2.type != 1) {
            msg[0] = 'عضو گروه آبی است';

        }
        else {
            msg[0] = 'عضو بی‌طرف است. ';
            if (user1.type == 11) {
                msg[0] += 'توسط شما مصلح و به تیم قرمز پیوسط';

                if (user2.type == 1) {
                    msg[1] = `بازیکن ${user1.info.UserName} سر گروه قرمز است . پیامی مبنی بر این که شما عضو تیم قرمز شدید برای او ارسال شده است`;
                }
                else {
                    groupItem2.type = 'red';
                    groupItem2.gun = true;
                    groupItem2.talk = false;
                    groupItem2.secret = groupItem.secret;
                    msg[1] = `بازیکن ${user1.info.UserName} سر گروه قرمز است . شما عضو تیم قرمز شدید. رمز گروه قرمز ${groupItem2.secret}`;
                }

            }
        }

        return msg;
    }
    private talkNeutral(groupItem: any, groupItem2: any, user1: User, user2: User): string[] {
        let msg = ['', ''];

        if (groupItem2.type == 'blue' && user2.type == 1) {
            groupItem.type = 'blue';
            groupItem.gun = true;
            groupItem.secret = groupItem2.secret;
            msg[0] = `بازیکن ${user2.info.UserName} سر گروه آبی است . شما عضو تیم آبی شدید. رمز گروه آبی ${groupItem.secret}`;
            msg[1] = `بازیکن ${user2.info.UserName} عضو بی‌طرف بود و به گروه آبی پیوست`;
        }
        else if (groupItem2.type == 'red' && user2.type == 11) {
            groupItem.type = 'red';
            groupItem.gun = true;
            groupItem.secret = groupItem2.secret;
            msg[0] = `بازیکن ${user2.info.UserName} سر گروه قرمز است . شما عضو تیم قرمز شدید. رمز گروه قرمز ${groupItem.secret}`;
            msg[1] = `بازیکن ${user2.info.UserName} عضو بی‌طرف بود و به گروه قرمز پیوست`;

        }
        else {
            msg[0] = 'ملاقات بی‌نتیجه بود';
        }

        return msg;
    }

        public async addGun(model: any) {
            if (!this.isStream || this.isUserAction) return;
            const groupItem = this.groups.find(x => x.key == model.userKey);
            if (!groupItem || !groupItem.gun) return;
            const room = afsonDb().get(this.roomId);
            const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
            const user2 = room?.users.find((x: User) => x.id == model.userId && x.index != this.activeUser);
            if (!user1 || !user2) return;

            groupItem.gun = false;
            this.isUserAction = true;
            const groupItem2 = this.groups.find(x => x.key == user2.key);

            AfsonControll.sendToMultipleSockets(this.roomId, 'addGunReceive', { msg: `بازیکن ${user1.info.UserName} به ${user2.info.UserName} شلیک کرد`, id: user1.id });
            let killUserId = 0;

            if (groupItem.type == 'blue')

                killUserId = this.gunBlue(groupItem2, user1, user2);
            else if (groupItem.type == 'red')
                killUserId = this.gunRed(groupItem2, user1, user2);

            const user = room?.users.find((x: User) => x.id == killUserId);

            if (!user)
                return true;
            user!.userInGameStatus = 2;
            var _userInDb = userInDb();
            _userInDb.update(this.roomId, user!);
            await this.delay(100);
            GameControll.statusReceive('hubAfsonVajeh', this.roomId);
        }
        private gunBlue(groupItem2: any, user1: User, user2: User): number {
            if (user1.type == 1 || groupItem2.type == 'red')
                return user2.id;
            return user1.id;
        }
        private gunRed(groupItem2: any, user1: User, user2: User): number {
            if (user1.type == 11 || groupItem2.type == 'blue')
                return user2.id;
            return user1.id;
        }
}
