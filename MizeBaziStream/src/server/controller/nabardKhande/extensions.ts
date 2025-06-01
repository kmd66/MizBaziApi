import { khandeDb } from './khandeDb';
import { userInDb } from '../userInDb';
import SocketManager from '../../handler/socket';
import khandeHandler from './handler';
import { GameControll } from '../globalMethod';

export class KhandeControll {

    public static getHandler(roomId: string): khandeHandler | undefined {
        if (!KhandeTimer.instance) {
            KhandeTimer.instance = new KhandeTimer();
        }
        return KhandeTimer.instance.controllers.get(roomId);
    }

    public static SafeUsers(userType: number, model?: any[]): any {
        if (!model)
            return model;
        return model.map(({ id, index, info, type }) => ({
            id, index, info, type
        }));
    }

    public static statusReceive(roomId: string): boolean {
        return GameControll.statusReceive('hubNabardKhande', roomId);
    }

    public static sendToMultipleSockets(roomId: string, name: string, model: any) {
        return GameControll.sendToMultipleSockets('hubNabardKhande', roomId, name, model);
    }

    public static sendToConnectionListId(ConnectionListId: any[], name: string, model: any) {
        if (ConnectionListId && ConnectionListId.length > 0)
            SocketManager.sendToMultipleSockets('hubNabardKhande', name, ConnectionListId!, model)
    }

    public static sendToSocket(name: string, connectionId: string, model: any) {
        SocketManager.sendToSocket('hubNabardKhande', name, connectionId, model)
    }
}

class KhandeTimer {
    public static instance: KhandeTimer;
    public timers: Map<string, NodeJS.Timeout> = new Map();
    public controllers: Map<string, khandeHandler> = new Map();
    private isDisconnectByRoomId: string = 'false';

    public static getInstance() {
        if (!KhandeTimer.instance) {
            KhandeTimer.instance = new KhandeTimer();
        }
        return KhandeTimer.instance;
    }

    public static Start(roomId: string) {
        if (!KhandeTimer.instance) {
            KhandeTimer.instance = new KhandeTimer();
        }
        const room = khandeDb().get(roomId);
        if (!room) {
            KhandeTimer.instance.stop(roomId);
            return;
        }
        KhandeTimer.instance.timerForDisconnect(roomId);
        KhandeTimer.instance.gameHandler(roomId);
    }

    public static StartAll(roomIds: string[]) {
        for (const id of roomIds) {
            KhandeTimer.Start(id);
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
        const room = khandeDb().get(roomId);
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
        });

        this.disconnectCheckGame();
    }
    private disconnectCheckGame() {
        if (this.isDisconnectByRoomId == 'false')
            return;

        const controller = this.controllers.get(this.isDisconnectByRoomId);
        if (!controller) {
            this.stop(this.isDisconnectByRoomId);
            return;
        }
        controller.setPartnerLose();
        controller.isAddDisconnec = true;
        KhandeControll.statusReceive(this.isDisconnectByRoomId);
        this.isDisconnectByRoomId = 'false';
    }

    private gameHandler(roomId: string) {
        this.stopController(roomId);
        const controller = new khandeHandler(roomId);
        this.controllers.set(roomId, controller);
        controller.main();
    }
}


export const khandeInstance = KhandeTimer.getInstance;
export const khandeStart = KhandeTimer.Start;
export const khandeStartAll = KhandeTimer.StartAll;