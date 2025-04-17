import { RoomRangOraz } from '../model/interfaces';
import { RangOrazDoor } from '../model/gameInterfaces';
import { rangOrazDb } from './rangOrazDb';
import { userInDb } from './userInDb';
import SocketManager from '../handler/socket';
import { User } from '../model/interfaces';

export class RangOrazControll {

    public static getRangOrazHandler(roomId: string): RangOrazHandler | undefined {
        var t = RangOrazTimer.instance.controllers.get(roomId);
        return RangOrazTimer.instance.controllers.get(roomId);
    }

    public static progressTime(model: Date): number {
        const now = new Date();
        const wait = new Date(Date.now() + 14000);
        //const wait = new Date(model.wait);
        const diff = (wait.getTime() - now.getTime())/1000;
        return diff;
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

    public static SafeRoom(roomId: string): any {
        const handler = RangOrazControll.getRangOrazHandler(roomId);
        if (!handler)
            return {};

        return {
            isShowOstad: handler.isShowOstad,
            door: handler.door,
            progressTime: handler.wait,
            activeUser: handler.activeUser
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
            const userConnectionId: User[] | undefined = userInDb().getUselFaal(roomId);
            const connectionIds = userConnectionId?.map(user => user.connectionId) || [];
            SocketManager.sendToMultipleSockets(
                'hubRangOraz', 'userStatusReceive',
                connectionIds, RangOrazControll.userStatus(users)
            );
            return true;
        }
        return false;
    }
}

class RangOrazHandler {
    public roomId: string;
    public wait: number = 10;
    public door: RangOrazDoor = RangOrazDoor.d0;
    public activeUser: number = 0;
    public isShowOstad: boolean = false;
    public finish: boolean = false;

    constructor(roomId: string) {
        this.roomId = roomId;
    }

    public Start(room: RoomRangOraz) {
        const nextSteps = this.getNextStep();
        if (!nextSteps) {
            this.finish = true;
            return;
        }

    }

    public getNextStep(): boolean {
        const keys = Object.keys(RangOrazDoor).filter(key => isNaN(Number(key)));
        const currentIndex = keys.findIndex(key => RangOrazDoor[key as keyof typeof RangOrazDoor] === this.door);
        if (currentIndex === -1 || currentIndex === keys.length - 1) {
            return false;
        }
        const nextKey = keys[currentIndex + 1];
        this.door = RangOrazDoor[nextKey as keyof typeof RangOrazDoor];
        return true;
    }

    public setWait(): number {
        switch (this.door) {
            case RangOrazDoor.d0:
                this.wait = 10;
                return 10;
            case RangOrazDoor.d1:
            case RangOrazDoor.d2:
                this.wait = 20;
                return 20;
            case RangOrazDoor.d3:
            case RangOrazDoor.d4:
                this.wait = 120;
                return 120;
            default:
                this.wait = 30;
                return 30;
        }
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
        RangOrazTimer.instance.timerForDisconnect(roomId);
        RangOrazTimer.instance.timerForGame(roomId);
    }

    public static StartAll(roomIds: string[]) {
        for (const id of roomIds) {
            RangOrazTimer.Start(id);
        }
    }

    private stop(name: string) {
        const timer = this.timers.get(name);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(name);
        }
        const controller = this.controllers.get(name);
        if (controller) {
            this.controllers.delete(name);
        }
    }

    private timerForDisconnect(roomId: string) {
        const name = `${roomId}timerForDisconnect`;
        this.stop(name);

        const intervalId = setInterval(() => {
            this.disconnectHandler(roomId);
        }, this.disconnectTime);

        this.timers.set(name, intervalId);
    }

    private disconnectHandler(roomId: string) {
        const room = rangOrazDb().get(roomId);
        if (!room) {
            this.stop(`${roomId}timerForDisconnect`);
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

    private timerForGame(roomId: string) {
        this.stop(roomId);
        const c = new RangOrazHandler(roomId);
        this.controllers.set(roomId, c);
        this.gameHandler(roomId);
    }

    private gameHandler(roomId: string) {
        const controller = this.controllers.get(roomId);
        const room = rangOrazDb().get(roomId);
        if (!controller || !room) {
            this.stop(roomId);
            return;
        }
    }

    private finishGame(roomId: string) {
        const room = rangOrazDb().get(roomId);
        const controller = this.controllers.get(roomId);
        this.stop(`${roomId}timerForGame`);
        this.stop(roomId);

    }

}
export const rangOrazStart = RangOrazTimer.Start;
export const rangOrazStartAll = RangOrazTimer.StartAll;