import { mafiaDb } from './mafiaDb';
import { userInDb } from '../userInDb';
import SocketManager from '../../handler/socket';
import mafiaHandler from './handler';
import { GameControll } from '../globalMethod';

export class MafiaControll {

    public static getHandler(roomId: string): mafiaHandler | undefined {
        if (!MafiaTimer.instance) {
            MafiaTimer.instance = new MafiaTimer();
        }
        return MafiaTimer.instance.controllers.get(roomId);
    }

    public static SafeUsers(userType: number, model?: any[]): any {
        if (!model)
            return model;
        return model.map(({ id, index, info, type }) => ({
            id, index, info,
            ...(userType == type && { type: type }),
            ...(userType > 20 && type > 20 && { type: type })
        }));
    }

    public static statusReceive(roomId: string): boolean {
        return GameControll.statusReceive('hubMafia', roomId);
    }

    public static sendToMultipleSockets(roomId: string, name: string, model: any) {
        return GameControll.sendToMultipleSockets('hubMafia', roomId, name, model);
    }

    public static sendToConnectionListId(ConnectionListId: any[], name: string, model: any) {
        if (ConnectionListId && ConnectionListId.length > 0)
            SocketManager.sendToMultipleSockets('hubMafia', name, ConnectionListId!, model)
    }

    public static sendToSocket(name: string, connectionId: string, model: any) {
            SocketManager.sendToSocket('hubMafia', name, connectionId, model)
    }
}

class MafiaTimer {
    public static instance: MafiaTimer;
    public timers: Map<string, NodeJS.Timeout> = new Map();
    public controllers: Map<string, mafiaHandler> = new Map();
    private isDisconnectByRoomId: string = 'false';

    public static getInstance() {
        if (!MafiaTimer.instance) {
            MafiaTimer.instance = new MafiaTimer();
        }
        return MafiaTimer.instance;
    }

    public static Start(roomId: string) {
        if (!MafiaTimer.instance) {
            MafiaTimer.instance = new MafiaTimer();
        }
        const room = mafiaDb().get(roomId);
        if (!room) {
            MafiaTimer.instance.stop(roomId);
            return;
        }
        MafiaTimer.instance.timerForDisconnect(roomId);
        MafiaTimer.instance.gameHandler(roomId);
    }

    public static StartAll(roomIds: string[]) {
        for (const id of roomIds) {
            MafiaTimer.Start(id);
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
        const room = mafiaDb().get(roomId);
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
                MafiaControll.statusReceive(roomId);
            }
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
        controller.isAddDisconnec = true;
        this.isDisconnectByRoomId = 'false';
    }

    private gameHandler(roomId: string) {
        this.stopController(roomId);
        const controller = new mafiaHandler(roomId);
        this.controllers.set(roomId, controller);
        controller.main();
    }
}


export const mafiaInstance = MafiaTimer.getInstance;
export const mafiaStart = MafiaTimer.Start;
export const mafiaStartAll = MafiaTimer.StartAll;