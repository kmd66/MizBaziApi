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
        if (this.doorType != 1 || this.door < 2) return;

        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const index = this.groups.findIndex(x => x.key == model.userKey && x.hadseNaghsh == true);
        if (index == -1) return;

        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.type > 20 && x.userInGameStatus == 1);
        const user2 = room?.users.find((x: User) => x.id == model.userId && [1, 10].indexOf(x.userInGameStatus) > -1);
        if (!user1 || !user2) return;
        this.setHadseNaghsh2(user1.id, user2.id, index, model.type);
    }
    public setHadseNaghshKhoroj(model: any) {
        if (this.khorojId == 0) return;
        const room = mafiaDb().get(this.roomId);
        if (!room) return;

        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.type > 20 && x.userInGameStatus == 1 && x.id == this.khorojId);
        const user2 = room?.users.find((x: User) => x.id == model.userId && [1, 10].indexOf(x.userInGameStatus) > -1);
        if (!user1 || !user2) return;
        this.khorojId = 0;
        this.setHadseNaghsh2(user1.id, user2.id, -1, model.type);
    }

    public addMessage(model: any) {
        if (this.doorType != 3) return;

        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const user = room.users.find((x: User) => x.key == model.userKey && x.userInGameStatus == 1 && x.type > 20);
        if (!user) return;

        this.sentToMafia({ message: model.message, title: user.info.UserName }, 'addMessageReceive');
    }

    public setNightEvent(model: any) {
        var result = this.permissionNightEvent(model);
        if (result) {
            const addModel: any = {
                eventType: model.eventType,
                type: result.user.type,
                userId: result.user.id,
                targetId: model.targetId,
                targetType: result.target.type
            };
            const nightEvents = this.addNightEvent(addModel);
            const returnModel = { type: addModel.type, nightEvents: nightEvents }
            if (result.user.type > 20)
                this.sentToMafia(returnModel, 'setNightEventReceive');
            else
                MafiaControll.sendToSocket('setNightEventReceive', result.user.connectionId!, returnModel);
        }
    }

    public setNegahban(model: any) {
        var result = this.permissionNightEvent(model);
        if (!result.user || result.user.type != 10) return;
        const room = mafiaDb().get(this.roomId);
        if (!room) return null;
        const users = room.users.filter((x: User) => [1, 10].indexOf(x.userInGameStatus) > -1);

        const addModel: any = {
            eventType: model.eventType,
            type: result.user.type,
            userId: result.user.id,
            targetId: model.targetId,
            targetType: result.target.type
        };
        const events = this.nightEvents.filter(x => x.userId == result.user!.id);
        if (events.length == 0) {
            this.nightEvents.push(addModel);
        } else if (users.length >= 7) {
            const event = this.nightEvents.find(x => x.userId == result.user!.id && x.targetId == model.targetId);
            if (event) {
                this.nightEvents = this.nightEvents.filter(x => !(x.userId == result.user!.id && x.targetId == model.targetId));
            } else {
                if (events.length == 1) {
                    this.nightEvents.push(addModel);
                } else {
                    const toRemove = events[0];
                    this.nightEvents = this.nightEvents.filter(x => !(x.userId == toRemove.userId && x.targetId == toRemove.targetId));
                    this.nightEvents.push(addModel);
                }
            }
        }
        else {
            this.addNightEvent(addModel);
        }

        const events2 = this.nightEvents.filter(x => x.userId == result.user!.id);
        const returnModel = events2.map(x => ({ eventType: x.eventType, targetId: x.targetId, userId: x.userId }));
        MafiaControll.sendToSocket('setNegahbanReceive', result.user.connectionId!, returnModel);
    }

    public setEstelam(model: any) {
        if (!this.isEstelam) return;
        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const user = room?.users.find((x: User) => x.key == model.userKey && x.userInGameStatus == 1);
        if (!user) return;
        const index = this.estelamList.findIndex(x => x == user.id);
        if (index == -1) {
            this.estelamList.push(user.id);
            MafiaControll.sendToMultipleSockets(this.roomId, 'setEstelamReceive', {userId: user.id});
        }
    }

    public setRayeChaos(model: any) {
        if (!this.isChaos) return;
        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.userInGameStatus == 1);
        const user2 = room?.users.find((x: User) => x.id == model.userId && [1, 10].indexOf(x.userInGameStatus) > -1);
        if (!user1 || !user2) return;
        if (user1.id == user2.id) return;

        if (this.rayeChaos.has(user1.id)) {
            this.rayeChaos.delete(user1.id);
        }
        this.rayeChaos.set(user1.id, user2.id);
        MafiaControll.sendToSocket('setRayeChaosReceive', user1.connectionId!, { userId: user2.id });
    }


    private setHadseNaghsh2(userId1: number, userId2: number, index: number, type: number) {
        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const user1 = room?.users.find((x: User) => x.id == userId1);
        const user2 = room?.users.find((x: User) => x.id == userId2);

        const groupItem = this.groupItem(user2!.key!);
        if (!groupItem) return;

        let t = false;
        if (index > -1)
            this.groups[index].hadseNaghsh = false;

        if ([7, 9].indexOf(user2!.type) > -1) {
            if (user2!.type == type && groupItem.shot) {
                t = true;
                user2!.userInGameStatus = 2;
            } else {
                user1!.userInGameStatus = 2;
            }
        } else if (user2!.type == type) {
            t = true;
            user2!.userInGameStatus = 2;
        } else {
            user1!.userInGameStatus = 2;
        }

        mafiaDb().update(this.roomId, room);
        this.isUserAction = true;

        MafiaControll.sendToMultipleSockets(this.roomId, 'setHadseNaghshReceive', {
            user1: user1!.id,
            user2: user2!.id,
            type: t
        });
    }

    private permissionNightEvent(model: any): any {
        if (this.doorType != 3 || this.door == 1) return null;
        if (!model.targetId) return null;
        const room = mafiaDb().get(this.roomId);
        if (!room) return null;
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.userInGameStatus == 1);
        const user2 = room?.users.find((x: User) => x.id == model.targetId && [1, 10].indexOf(x.userInGameStatus) > -1);
        if (!user1 || !user2) return null;


        if (user1.type < 22 && model.eventType != 0) return null;
        if (user1.type > 21 && [0, 1].indexOf(model.eventType) == -1) return null;

        const index = this.groups.findIndex(x => x.key == model.userKey);
        if (index == -1) return null;

        if ([4, 5, 6, 9, 10, 21, 22, 23].indexOf(user1.type) == -1) return null;
        if ([6, 9].indexOf(user1.type) > -1) {
            if (!this.groups[index].shot) return null;
        }
        return { user: user1, target: user2 }
    }

    private addNightEvent(model: any): any {
        const index = this.nightEvents.findIndex(x =>
            x.eventType == model.eventType &&
            x.userId == model.userId
        );
        if (index > -1) {
            let targetId = this.nightEvents[index].targetId;
            this.nightEvents = this.nightEvents.filter(item =>
                !(
                    item.eventType === model.eventType &&
                    item.userId === model.userId
                )
            );
            if (targetId != model.targetId)
                this.nightEvents.push(model);
        } else {
            this.nightEvents.push(model);
        }
        const events = this.nightEvents.filter(x => x.userId == model.userId);

        const returnModel = events.map(x => ({ eventType: x.eventType, targetId: x.targetId, userId: x.userId, type: x.type }));
        return returnModel;
    }

    private sentToMafia(model: any, eventName: string) {
        const room = mafiaDb().get(this.roomId);
        if (!room) return;
        const users = room.users.filter((x: User) => x.userInGameStatus == 1 && x.type > 20);
        const connectionIds = users.map(x => x.connectionId);
        MafiaControll.sendToConnectionListId(connectionIds, eventName, model);
    }
}
