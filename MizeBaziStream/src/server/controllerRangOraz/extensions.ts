import { RoomRangOraz } from '../model/interfaces';
import { rangOrazDb, userInDb } from './rangOrazDb';
import SocketManager from '../handler/socket';
import { User } from '../model/interfaces';

export class RangOrazControll {

    public static progressTime(model: RoomRangOraz): number {
        const now = new Date();
        const wait = new Date(Date.now() + 14000);
        //const wait = new Date(model.wait);
        const diff = (wait.getTime() - now.getTime())/1000;
        return diff;
    }

    public static SafeUsers(userKey: string, isShowOstad: boolean, model?: any[]): any {
        if (!model)
            return model;

        return model.map(({ id, index, info, type, key }) => ({
            id, index, info,
            ...(type === 1 && { type: 1 }) || (userKey == key && { type: type }) || (isShowOstad && type === 2 && { type: 2 })
        }));

    }
    public static SafeRoom(model: RoomRangOraz): any {
        if (!model)
            return model;
        return {
            type: model.type,
            createdAt: model.createdAt,
            isShowOstad: model.isShowOstad,
            door: model.door,
            progressTime: RangOrazControll.progressTime(model),
            user: model.user
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
        var _userInDb = userInDb();
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

export class RangOrazTimer {
    private static instance: RangOrazTimer;
    private disconnectTime: number = 14000;
    private disconnectAge: number = 20;
    private timers: Map<string, NodeJS.Timeout> = new Map();

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
    }

    private timerForDisconnect(roomId: string) {
        const name = `${roomId}timerForDisconnect`;
        this.stop(name);

        const intervalId = setInterval(() => {
            this.disconnectHandler(roomId);
        }, this.disconnectTime);

        this.timers.set(name, intervalId);
    }

    private timerForGame(roomId: string) {
        const name = `${roomId}timerForGame`;
        this.stop(name);

        const intervalId = setInterval(() => {
            this.gameHandler(roomId);
        }, 10000);

        this.timers.set(name, intervalId);
    }

    private disconnectHandler(roomId: string) {
        const room = rangOrazDb().get(roomId);
        if (!room) this.stop(`${roomId}timerForDisconnect`);
        const users = room?.users.filter(user => user.userInGameStatus == 10) || [];
        users.map((x) => {
            x.oflineSecond++;
            if (x.oflineSecond >= this.disconnectAge) {
                x.userInGameStatus = 11;
            }
            userInDb().update(roomId, x);

            if (x.userInGameStatus == 11) {
                RangOrazControll.statusReceive(roomId);
                this.finishGame(roomId)
            }
        });
    }

    private gameHandler(roomId: string) {
        var room = rangOrazDb().get(roomId);
        if (!room) this.stop(`${roomId}timerForGame`);

    }

    private finishGame(roomId: string) {
        var room = rangOrazDb().get(roomId);
        if (!room) this.stop(`${roomId}timerForGame`);

    }

}
export const rangOrazStart = RangOrazTimer.Start;
export const rangOrazStartAll = RangOrazTimer.StartAll;