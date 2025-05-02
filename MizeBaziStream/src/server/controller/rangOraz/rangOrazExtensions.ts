import { rangOrazDb } from './rangOrazDb';
import { userInDb } from '../userInDb';
import SocketManager from '../../handler/socket';
import { User } from '../../model/interfaces';
import RangOrazHandler from './rangOrazHandler';
import { GameControll } from '../globalMethod';

export class RangOrazControll {

    public static getHandler(roomId: string): RangOrazHandler | undefined {
        if (!RangOrazTimer.instance) {
            RangOrazTimer.instance = new RangOrazTimer();
        }
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

    public static statusReceive(roomId: string): boolean {
        return GameControll.statusReceive('hubRangOraz', roomId);
    }

    public static sendToMultipleSockets(roomId: string, name: string, model: any) {
        return GameControll.sendToMultipleSockets('hubRangOraz', roomId, name, model);
    }

    public static sendToConnectionListId(ConnectionListId: any[],  name: string, model: any) {
        if (ConnectionListId && ConnectionListId.length > 0)
            SocketManager.sendToMultipleSockets('hubRangOraz', name, ConnectionListId!, model)
    }
}

class RangOrazTimer {
    public static instance: RangOrazTimer;
    public timers: Map<string, NodeJS.Timeout> = new Map();
    public controllers: Map<string, RangOrazHandler> = new Map();
    private isDisconnectByRoomId: string = 'false';

    public static getInstance() {
        if (!RangOrazTimer.instance) {
            RangOrazTimer.instance = new RangOrazTimer();
        }
        return RangOrazTimer.instance;
    }

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
        }, GameControll.disconnectTime);

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
            if (x.oflineSecond >= GameControll.disconnectAge) {
                x.userInGameStatus = 11;
                this.isDisconnectByRoomId = roomId;
            }
            userInDb().update(roomId, x);

            if (x.userInGameStatus == 11) {
                RangOrazControll.statusReceive(roomId);
            }
        });

        this.disconnectCheckGame();
    }
    private disconnectCheckGame() {
        if (this.isDisconnectByRoomId == 'false')
            return;

        const room = rangOrazDb().get(this.isDisconnectByRoomId);
        const controller = this.controllers.get(this.isDisconnectByRoomId);
        this.isDisconnectByRoomId = 'false';
        if (!room || !controller) {
            this.stop(this.isDisconnectByRoomId);
            return;
        }

        const userjasos = room.users.find((x: User) => x.userInGameStatus == 11 && (x.type == 11 || x.type == 2));
        if (userjasos) {
            controller.loserUser = {
                id: userjasos.id,
                type: userjasos.type
            };
            controller.hadseNaghshHandler();
            return;
        }
        const bazpors = room.users.find((x: User) => x.userInGameStatus == 11 && x.type == 1);
        if (bazpors) {
            controller.barandeyeTasadofi();
            return;
        }
    }

    private gameHandler(roomId: string) {
        this.stopController(roomId);
        const controller = new RangOrazHandler(roomId);
        this.controllers.set(roomId, controller);
        controller.main();
    }

}

export const rangInstance = RangOrazTimer.getInstance;
export const rangOrazStart = RangOrazTimer.Start;
export const rangOrazStartAll = RangOrazTimer.StartAll;