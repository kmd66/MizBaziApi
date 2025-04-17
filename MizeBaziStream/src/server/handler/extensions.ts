
import { RoomRangOraz } from '../model/interfaces';

export class RangOrazControll {

    public static progressTime(model: RoomRangOraz): number {
        const now = new Date();
        const wait = new Date(Date.now() + 14000);
        //const wait = new Date(model.wait);
        console.log(`-now ${now} -----model.wait ${model.wait} -----wait ${wait}`)
        console.log(`-now ${now.getTime()} -----wait ${wait.getTime() }`)
        const diff = (wait.getTime() - now.getTime())/1000;
        console.log(`-diff ${diff} `)
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
}

export class RangOrazTimer {

    roomTimers?: NodeJS.Timeout;

    disconnectTimer() {
        if (this.roomTimers) {
            clearInterval(this.roomTimers);
        }
        this.roomTimers = setInterval(() => {
        }, 10000);

    }

    clearRoomTimer() {
        if (this.roomTimers) {
            clearInterval(this.roomTimers);
        }
    }
}