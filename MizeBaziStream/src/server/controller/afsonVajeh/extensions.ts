﻿import { afsonDb } from './afsonDb';
import { userInDb } from '../userInDb';
import SocketManager from '../../handler/socket';
import AfsonHandler from './handler';
import { GameControll } from '../globalMethod';
export class AfsonControll {

    public static getHandler(roomId: string): AfsonHandler | undefined {
        if (!AfsonTimer.instance) {
            AfsonTimer.instance = new AfsonTimer();
        }
        return AfsonTimer.instance.controllers.get(roomId);
    }

    public static SafeUsers(userType: number, model?: any[]): any {
        if (!model)
            return model;
        return model.map(({ id, index, info, type}) => ({
            id, index, info,
            ...(userType == type && { type: type })
        }));
    }

    public static statusReceive(roomId: string): boolean {
        return GameControll.statusReceive('hubAfsonVajeh', roomId);
    }

    public static sendToMultipleSockets(roomId: string, name: string, model: any) {
        return GameControll.sendToMultipleSockets('hubAfsonVajeh', roomId, name, model);
    }

    public static sendToConnectionListId(ConnectionListId: any[], name: string, model: any) {
        if (ConnectionListId && ConnectionListId.length > 0)
            SocketManager.sendToMultipleSockets('hubAfsonVajeh', name, ConnectionListId!, model)
    }

}

class AfsonTimer {
    public static instance: AfsonTimer;
    public timers: Map<string, NodeJS.Timeout> = new Map();
    public controllers: Map<string, AfsonHandler> = new Map();
    private isDisconnectByRoomId: string = 'false';

    public static getInstance() {
        if (!AfsonTimer.instance) {
            AfsonTimer.instance = new AfsonTimer();
        }
        return AfsonTimer.instance;
    }

    public static Start(roomId: string) {
        if (!AfsonTimer.instance) {
            AfsonTimer.instance = new AfsonTimer();
        }
        const room = afsonDb().get(roomId);
        if (!room) {
            AfsonTimer.instance.stop(roomId);
            return;
        }
        AfsonTimer.instance.timerForDisconnect(roomId);
        AfsonTimer.instance.gameHandler(roomId);
    }

    public static StartAll(roomIds: string[]) {
        for (const id of roomIds) {
            AfsonTimer.Start(id);
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
        const room = afsonDb().get(roomId);
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
                AfsonControll.statusReceive(roomId);
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
        const controller = new AfsonHandler(roomId);
        this.controllers.set(roomId, controller);
        controller.main();
    }

}

export const afsonInstance = AfsonTimer.getInstance;
export const afsonStart = AfsonTimer.Start;
export const afsonStartAll = AfsonTimer.StartAll;