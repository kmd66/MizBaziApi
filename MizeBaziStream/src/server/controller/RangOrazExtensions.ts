import { RoomRangOraz } from '../model/interfaces';
import { RangOrazDoor } from '../model/gameInterfaces';
import { rangOrazDb } from './rangOrazDb';
import { userInDb } from './userInDb';
import SocketManager from '../handler/socket';
import { User } from '../model/interfaces';

enum NobatType {
    undefined = 0,

    nobat = 1, //'نوبت صحبت کردن',

    raieGiri = 5, //'رایگیری',

    bazporsi = 10, //'بازپرسی',
}
export class RangOrazControll {

    public static getRangOrazHandler(roomId: string): RangOrazHandler | undefined {
        return RangOrazTimer.instance.controllers.get(roomId);
    }

    public static SafeUsers(userType: number, isShowOstad: boolean, model?: any[]): any {
        if (!model)
            return model;
        return model.map(({ id, index, info, type, key }) => ({
            id, index, info,
            ...(type === 1 && { type: type }) ||
            (userType == 1 && type === 2 && { type: type }) ||
            (userType == type && { type: type }) ||
            (isShowOstad && type === 2 && { type: type })
        }));
    }

    public static roomReceive(roomId: string, connectionId?: string) {
        const model = RangOrazControll.SafeRoom(roomId);
        if (connectionId) {
            SocketManager.sendToSocket('hubRangOraz', 'roomReceive', connectionId, model);
            return true;
        }
        RangOrazControll.sendToMultipleSockets(roomId, 'roomReceive', model);
    }

    public static roomAllMainWaitReceive(roomId: string) {
        const handler = RangOrazControll.getRangOrazHandler(roomId);
        const model = {
            isShowOstad: handler!.isShowOstad,
            door: handler!.door,
            progressTime: handler!.mainWait,
            activeUser: -1,
            isChalesh: 0,
            isSticker: 0
        };
        RangOrazControll.sendToMultipleSockets(roomId, 'roomReceive', model);
    }

    public static SafeRoom(roomId: string): any {
        const handler = RangOrazControll.getRangOrazHandler(roomId);
        if (!handler)
            return {};

        return {
            isShowOstad: handler.isShowOstad,
            door: handler.door,
            progressTime: handler.wait,
            activeUser: handler.activeUser,
            isChalesh: handler.isChalesh,
            isSticker: handler.isSticker
        };
    }

    public static userStatus(model?: any[]): any {
        if (!model)
            return model;
        return model.map(({ id, userInGameStatus }) => ({
            id, userInGameStatus,
        }));
    }

    public static statusReceive(roomId: string): boolean {
        const _userInDb = userInDb();
        const users = _userInDb.getAll(roomId);
        if (users) {
            RangOrazControll.sendToMultipleSockets(roomId, 'userStatusReceive', RangOrazControll.userStatus(users));
            return true;
        }
        return false;
    }

    public static sendToMultipleSockets(roomId: string, name: string, model: any) {
        const userConnectionId: User[] | undefined = userInDb().getUselFaal(roomId);
        const connectionIds = userConnectionId?.map(user => user.connectionId) || [];
        SocketManager.sendToMultipleSockets('hubRangOraz', name, connectionIds, model)
    }

    public static getDefensePositionReceive(handler: RangOrazHandler) {
        const model = {
            activeUser: handler.activeUser,
            wate: handler.mainWait,
            nobatType: handler!.nobatType,
        };
        RangOrazControll.sendToMultipleSockets(handler.roomId, 'getDefensePositionReceive', model);
    }
    public static startStream(handler: RangOrazHandler) {
        const model = {
            activeUser: handler.activeUser,
            wate: handler.wait,
            nobatType: handler!.nobatType,
        };
        RangOrazControll.sendToMultipleSockets(handler.roomId, 'startStream', model);
    }
}

export class RangOrazHandler {
    public roomId: string;

    public wait: number = 10;
    public mainWait: number = 3;
    public door?: RangOrazDoor = RangOrazDoor.d0;
    public activeUser: number = -1;
    public isShowOstad: boolean = false;
    public isChalesh: boolean = false;
    public isSticker: boolean = false;

    public finish: boolean = false;

    private raieGiriCount: Map<number, any> = new Map(); //[userId]

    private timeoutId?: NodeJS.Timeout;

    private chalenger: number = -1;
    private bazporsi: number[] = [];

    public nobatType: NobatType = NobatType.undefined;
    private nobatIndex: number = -1;

    public raieNahaii: boolean = false; //'رایگیری نهایی'

    constructor(roomId: string) {
        this.roomId = roomId;
    }
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public setRaieGiriCount(userId: number) {
    }

    public setChalenger(userId: number) {
    }

    public setBazporsi(userId: number) {
    }

    public cancel() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
        this.next();
    }

    public async main() {
        if(this.door == undefined) {
            this.setFinish();
        }
        if (this.finish)
            return;

        this.setWait();
        
        if (this.activeUser > -1) {
            await this.delay(100);
            RangOrazControll.getDefensePositionReceive(this);
            await this.delay(this.mainWait * 1000);
            RangOrazControll.startStream(this);
        }
        else {
            RangOrazControll.roomAllMainWaitReceive(this.roomId);
            await this.delay(this.mainWait * 1000);
            RangOrazControll.roomReceive(this.roomId);
        }
        //RangOrazControll.roomReceive(this.roomId);
        this.timer();
    }

    private timer() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
        this.timeoutId = setTimeout(() => {
            this.next();
        }, this.wait * 1000);
    }

    private nextReset() {
        this.activeUser = -1;
        this.nobatIndex = -1;
        this.nobatType = NobatType.undefined;
        this.getNextStep();
        this.main();
    }

    private next() {
        if ([RangOrazDoor.d0, RangOrazDoor.d2, RangOrazDoor.d3, RangOrazDoor.d4].indexOf(this.door!) != -1) {
            this.nextReset();
            return;
        }

        if (this.nobatType == NobatType.undefined) {
            this.nobatType = NobatType.nobat;
        }
        else if (this.nobatType == NobatType.bazporsi) {
            this.nobatType = NobatType.undefined;
            this.nextReset();
            return;
        }

        this.setNobatIndex();
    }

    private setNobatIndex() {
        const room = rangOrazDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            this.main();
            return;
        }

        this.nobatIndex = this.nobatIndex + 1;
        if (this.nobatIndex >= room.users.length) {


            if (this.door == RangOrazDoor.d1) {
                this.nobatType = NobatType.undefined;
                this.nextReset();
                return;
            }

            if (this.nobatType == NobatType.nobat)
                this.nobatType = NobatType.raieGiri;
            else if (this.nobatType == NobatType.raieGiri)
                this.nobatType = NobatType.bazporsi;

            this.activeUser = -1;
            this.nobatIndex = -1;
            this.main();
            return;
        }

        if (room.users[this.nobatIndex]?.userInGameStatus != 1) {
            if (room.users[this.nobatIndex]?.userInGameStatus != 10
                || this.nobatType != NobatType.raieGiri) {
                this.setNobatIndex();
                return;
            }
        }

        this.activeUser = room.users[this.nobatIndex].index;
        this.main();
    }

    private getNextStep() {
        const keys = Object.keys(RangOrazDoor).filter(key => isNaN(Number(key)));
        const currentIndex = keys.findIndex(key => RangOrazDoor[key as keyof typeof RangOrazDoor] === this.door);
        if (currentIndex === -1 || currentIndex === keys.length - 1) {
            this.door = undefined;
        }
        const nextKey = keys[currentIndex + 1];
        this.door = RangOrazDoor[nextKey as keyof typeof RangOrazDoor];
    }

    private setWait() {
        this.wait = 2;
        return;
        if (this.nobatType == NobatType.raieGiri) {
            this.wait = 5;
            return;
        }
        if (this.nobatType == NobatType.bazporsi) {
            this.wait = 5;
            return;
        }

        switch (this.door) {
            case RangOrazDoor.d0:
                this.wait = 5;
                return;
            case RangOrazDoor.d1:
            case RangOrazDoor.d2:
                this.wait = 5;
                return;
            case RangOrazDoor.d3:
            case RangOrazDoor.d4:
                this.wait = 10;
                return;
            default:
                this.wait = 7;
                return 7;
        }
    }

    public setFinish() {
        this.finish = true;
        //clearTimeout(this.timeoutId);
        //rangOrazDb().delete(this.roomId);
        //RangOrazTimer.instance.stop(this.roomId);
    }
}

class RangOrazTimer {
    public static instance: RangOrazTimer;
    public timers: Map<string, NodeJS.Timeout> = new Map();
    public controllers: Map<string, RangOrazHandler> = new Map();
    private disconnectTime: number = 14000;
    private disconnectAge: number = 20;

    public static Start(roomId: string) {
        if (!RangOrazTimer.instance) {
            RangOrazTimer.instance = new RangOrazTimer();
        }
        const room = rangOrazDb().get(roomId);
        if (!room) {
            RangOrazTimer.instance.stop(roomId);
            return;
        }
        RangOrazTimer.instance.timerForDisconnect(roomId);
        RangOrazTimer.instance.gameHandler(roomId);
    }

    public static StartAll(roomIds: string[]) {
        for (const id of roomIds) {
            RangOrazTimer.Start(id);
        }
    }

    public stop(roomId: string) {
        this.stopTimer(`${roomId}timerForDisconnect`);
        this.stopController(`${roomId}`);
    }

    private stopTimer(name: string) {
        const timer = this.timers.get(name);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(name);
        }
    }

    private stopController(name: string) {
        const controller = this.controllers.get(name);
        if (controller) {
            controller.finish = true;
            this.controllers.delete(name);
        }
    }

    private timerForDisconnect(roomId: string) {
        const name = `${roomId}timerForDisconnect`;
        this.stopTimer(name);

        const intervalId = setInterval(() => {
            this.disconnectHandler(roomId);
        }, this.disconnectTime);

        this.timers.set(name, intervalId);
    }

    private disconnectHandler(roomId: string) {
        const room = rangOrazDb().get(roomId);
        if (!room) {
            this.stop(roomId);
            return;
        }
        
        const users = room?.users.filter(user => user.userInGameStatus == 10) || [];
        users.map((x) => {
            x.oflineSecond++;
            if (x.oflineSecond >= this.disconnectAge) {
                x.userInGameStatus = 11;
            }
            userInDb().update(roomId, x);

            if (x.userInGameStatus == 11) {
                RangOrazControll.statusReceive(roomId);
            }
        });
    }

    private gameHandler(roomId: string) {
        this.stopController(roomId);
        const controller = new RangOrazHandler(roomId);
        this.controllers.set(roomId, controller);
        controller.main();
    }

}

export const rangOrazStart = RangOrazTimer.Start;
export const rangOrazStartAll = RangOrazTimer.StartAll;