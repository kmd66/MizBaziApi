import { RangOrazDoor } from '../model/gameInterfaces';
import { rangOrazDb } from './rangOrazDb';
import { userInDb } from './userInDb';
import SocketManager from '../handler/socket';
import { User } from '../model/interfaces';
import { count } from 'console';

enum NobatType {
    undefined = 0,

    nobat = 1, //'نوبت صحبت کردن',

    bazporsi = 10, //'بازپرسی',
    defae = 11, //'دفاع',
    raieGiri = 12, //'رایگیری',

    hadseNaghsh = 15, //'حدس نقش',
}
enum receiveType {
    undefined = 0,
    start = 1,
    end = 2,
    wait = 10,
    response = 20,
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

    public static startStreamReceive(handler: RangOrazHandler) {
        const model = {
            activeUser: handler.activeUser,
            wate: handler.wait,
            nobatType: handler!.nobatType,
        };
        RangOrazControll.sendToMultipleSockets(handler.roomId, 'startStreamReceive', model);
    }
}

class RangOrazProperty {
    constructor(roomId: string) {
        this.roomId = roomId;
    }

    public roomId!: string;

    public wait: number = 10;
    public mainWait: number = 3;
    public door?: RangOrazDoor = RangOrazDoor.d0;
    public activeUser: number = -1;
    public isShowOstad: boolean = false;
    public isChalesh: boolean = false;
    public isSticker: boolean = false;

    public finish: boolean = false;

    protected raieGiriCount: Map<number, number> = new Map(); //[userId]

    protected timeoutId?: NodeJS.Timeout;

    protected chalenger: number = -1;

    protected bazporsiUsers: number[] = [];
    protected bazporsiWait: any = {
        start: 5,
        end: 0,
        raigiriStart: 15,
        raigiriEnd: 0,
        raigiriResponse: 15,
    }

    public nobatType: NobatType = NobatType.undefined;
    protected nobatIndex: number = -1;

    public raieNahaii: boolean = false; //'رایگیری نهایی'

    public loserUser: number = 0;
    public hadseNaghshUser: number = 0;

    protected delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    protected getNextStep() {
        const keys = Object.keys(RangOrazDoor).filter(key => isNaN(Number(key)));
        const currentIndex = keys.findIndex(key => RangOrazDoor[key as keyof typeof RangOrazDoor] === this.door);
        if (currentIndex === -1 || currentIndex === keys.length - 1) {
            this.door = undefined;
        }
        const nextKey = keys[currentIndex + 1];
        this.door = RangOrazDoor[nextKey as keyof typeof RangOrazDoor];
    }

    protected setWait() {
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
        this.raieGiriCount.clear();
        //clearTimeout(this.timeoutId);
        //rangOrazDb().delete(this.roomId);
        //RangOrazTimer.instance.stop(this.roomId);
    }
}

class BaseRangOrazHandler extends RangOrazProperty{
    constructor(roomId: string) {
        super(roomId);
    }

    public setRaieGiriCount(model: any) {
        // اصلاح
        //if (this.nobatType != NobatType.bazporsi) return;

        const room = rangOrazDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey);
        if (!user1 || this.bazporsiUsers.includes(user1.id)) return;
        const user2 = room?.users.find((x: User) => x.id == model.userId && [11, 2].indexOf(x.userInGameStatus) == -1);
        if (!user2 || !this.bazporsiUsers.includes(user2.id)) return;
        if (this.raieGiriCount.has(user1.id)) {
            this.raieGiriCount.delete(user1.id);
        }
        this.raieGiriCount.set(user1.id, user2.id);
        SocketManager.sendToSocket('hubRangOraz', 'setRaieGiriCountReceive', user1.connectionId,
            {
                userId: user2.id,
                b: this.raieGiriCount.has(user1.id) ? true : false
            });
    }
    public setChalenger(userId: number) {
    }

    public setBazporsi(model: any) {
        // اصلاح
        //if (this.nobatType != NobatType.bazporsi) return;
        const room = rangOrazDb().get(this.roomId);
        const bazporsUser = room?.users.find((x: User) => x.type == 1 && x.key == model.userKey);
        if (!bazporsUser) return;
        const user = room?.users.find((x: User) => x.id == model.userId && [11, 2].indexOf(x.userInGameStatus) == -1);
        if (!user) return;

        if (this.bazporsiUsers.includes(model.userId)) {
            this.bazporsiUsers = this.bazporsiUsers.filter(userId => userId !== model.userId);
        } else {
            this.bazporsiUsers.push(model.userId);
        }

        if (this.bazporsiUsers.length > 2)
            this.bazporsiUsers = this.bazporsiUsers.slice(1);
        SocketManager.sendToSocket('hubRangOraz', 'setBazporsiReceive', bazporsUser.connectionId, this.bazporsiUsers);
    }

    public setShowOstad(model:any) {
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.type == 2 && x.key == model.userKey);
        if (!user) return;
        this.isShowOstad = true;
        this.showOstadReceive();
    }
    public setHadseNaghshUser(userId: number) {
        this.isShowOstad = true;
        this.hadseNaghshUserReceive();
    }

    //---------------Receive

    protected showOstadReceive() {
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.type == 2);
        if (!user) return;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'showOstadReceive', user.id);
    }

    protected bazporsiReceive(type: receiveType) {
        RangOrazControll.sendToMultipleSockets(this.roomId, 'bazporsiReceive', type);
    }

    protected defaeReceive(type: receiveType, userIndex: number) {
        const model = {
            type: type,
            userIndex: userIndex,
            users: this.bazporsiUsers,
            wait:3
        };
        if (type == receiveType.start)
            model.wait = this.bazporsiWait.start;

        RangOrazControll.sendToMultipleSockets(this.roomId, 'defaeReceive', model);
    }
    protected raigiriReceive(type: receiveType, wait: number) {
        const model={
            type: type,
            wait: wait,
            raieGiriCount: Array.from(this.raieGiriCount.entries()),
        }
        RangOrazControll.sendToMultipleSockets(this.roomId, 'raigiriReceive', model);
    }
    protected hadseNaghshReceive(type: receiveType) {
        //const model = {
        //};
        //RangOrazControll.sendToMultipleSockets(this.roomId, 'hadseNaghshReceive', model);
    }
    protected gameResponseReceive(type: receiveType) {
        //const model = {
        //};
        //RangOrazControll.sendToMultipleSockets(this.roomId, 'gameResponseReceive', model);
    }
    protected hadseNaghshUserReceive() {
        //const model = {
        //};
        //RangOrazControll.sendToMultipleSockets(this.roomId, 'hadseNaghshUserReceive', model);
    }

}
export class RangOrazHandler extends BaseRangOrazHandler {
    constructor(roomId: string) {
        super(roomId); 
    }

    public cancel() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
        this.next();
    }

    private nextReset() {
        this.activeUser = -1;
        this.nobatIndex = -1;
        this.nobatType = NobatType.undefined;
        this.getNextStep();
        this.main();
    }

    //-----------main

    public async main() {
        if (this.door == undefined) {
            this.setFinish();
        }

        if (this.finish)
            return;

        if (this.nobatType == NobatType.bazporsi) {
            this.bazporsiMain();
            return
        }

        this.setWait();

        if (this.activeUser > -1) {
            await this.delay(100);
            RangOrazControll.getDefensePositionReceive(this);
            await this.delay(this.mainWait * 1000);
            RangOrazControll.startStreamReceive(this);
        }
        else {
            RangOrazControll.roomAllMainWaitReceive(this.roomId);
            await this.delay(this.mainWait * 1000);
            RangOrazControll.roomReceive(this.roomId);
        }
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

    private next() {
        if ([RangOrazDoor.d0, RangOrazDoor.d2, RangOrazDoor.d3, RangOrazDoor.d4].indexOf(this.door!) != -1) {
            this.nextReset();
            return;
        }
        if (this.nobatType == NobatType.undefined) {
            this.nobatType = NobatType.nobat;
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
                this.nextReset();
                return;
            }

            if (this.nobatType == NobatType.nobat)
                this.nobatType = NobatType.bazporsi;

            this.activeUser = -1;
            this.nobatIndex = -1;
            this.main();
            return;
        }

        if (room.users[this.nobatIndex]?.userInGameStatus != 1) {
            this.setNobatIndex();
            return;
        }

        this.activeUser = room.users[this.nobatIndex].index;
        this.main();
    }

    //------------bazporsiMain

    private async bazporsiMain() {
        if (this.finish)
            return;

        this.bazporsiUsers = [];
        this.bazporsiReceive(receiveType.start);
        await this.delay(15000);
        this.bazporsiReceive(receiveType.end);
        await this.delay(100);

        if (this.bazporsiUsers.length == 2) {
            this.defae();
        }
        else {
            if (this.door == RangOrazDoor.d9) {
                this.barandeyeTasadofi();
            }
            else
            this.nextReset();
        }
    }

    private async defae() {
        if (this.finish)
            return;

        
        await this.delay(1000);
        this.defaeReceive(receiveType.wait, -1);
        await this.delay(3000);

        //نفر 1
        this.defaeReceive(receiveType.start, 0);
        await this.delay(this.bazporsiWait.start *1000);
        this.defaeReceive(receiveType.end, 0);

        await this.delay(3000);

        //نفر 2
        this.defaeReceive(receiveType.start, 1);
        await this.delay(this.bazporsiWait.start * 1000);
        this.defaeReceive(receiveType.end, 1);

        this.raigiri();
    }

    private async raigiri() {
        if (this.finish)
            return;

        this.raieGiriCount.clear();
        this.loserUser = 0;

        await this.delay(500);
        this.raigiriReceive(receiveType.wait,0);
        await this.delay(500);

        this.raigiriReceive(receiveType.start, this.bazporsiWait.raigiriStart);
        await this.delay(this.bazporsiWait.raigiriStart *1000);
        this.raigiriReceive(receiveType.end,0);

        this.natigeRaigiri();
    }

    private async natigeRaigiri() {
        const room = rangOrazDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            this.main();
            return;
        }
        const unvotedUsers = room.users.filter((user: User) => !this.raieGiriCount.has(user.id) && user.userInGameStatus == 1);

        if (unvotedUsers.length > 0) {
            unvotedUsers.map((x) => {
                const randomBazpors = this.bazporsiUsers[Math.floor(Math.random() * this.bazporsiUsers.length)];
                if (!this.bazporsiUsers.includes(x.id)) {
                    this.raieGiriCount.set(x.id, randomBazpors);
                }
            })
        }
        const values = Array.from(this.raieGiriCount.values());
        const count0 = values.filter(v => v === this.bazporsiUsers[0]).length;
        const count1 = values.filter(v => v === this.bazporsiUsers[1]).length;

        this.raigiriReceive(receiveType.response, this.bazporsiWait.raigiriResponse);
        await this.delay(this.bazporsiWait.raigiriResponse * 1000);

        let loser = 0;

        if (count0 == count1) {
            if (this.door == RangOrazDoor.d9) {
                loser = Math.floor(Math.random() * 2);
            }
            else {
                this.nextReset();
                return;
            }
        } else {
            if (count1 > count0)
                loser = 1;
        }
        
        this.checkLoser(loser);
    }

    private async checkLoser(loser: number) {
        const room = rangOrazDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            this.main();
            return;
        }

        const user = room.users.find((user: User) => user.id == this.bazporsiUsers[loser]);
        if (!user) {
            this.setFinish();
            this.main();
            return;
        }

        if (this.door != RangOrazDoor.d9 && user.type == 2 && !this.isShowOstad) {
            this.isShowOstad = true;
            this.showOstadReceive();
            await this.delay(1000);
            this.nextReset();
            return;
        }

        this.loserUser = user.id;
        this.hadseNaghsh();
    }

    public async hadseNaghsh() {
        if (!this.isShowOstad) {
            this.hadseNaghshReceive(receiveType.start)
            await this.delay(10000);
        }

        this.hadseNaghshReceive(receiveType.end)
        await this.delay(3000);

        this.gameResponseReceive(receiveType.response)
        await this.delay(120000);
        this.setFinish();
    }

    //------------

    public barandeyeTasadofi() {
        const room = rangOrazDb().get(this.roomId);
        const unvotedUsers = room?.users.filter((user: User) => user.userInGameStatus == 1 || user.userInGameStatus == 10);
        if (unvotedUsers) {
            this.setFinish();
            this.main();
            return;
        }
        this.loserUser = unvotedUsers![Math.floor(Math.random() * unvotedUsers!.length)].id;
        this.hadseNaghsh();
    }

} 
class RangOrazTimer {
    public static instance: RangOrazTimer;
    public timers: Map<string, NodeJS.Timeout> = new Map();
    public controllers: Map<string, RangOrazHandler> = new Map();
    private disconnectTime: number = 14000;
    private disconnectAge: number = 20;
    private isDisconnectByRoomId: string = 'false';

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
            controller.loserUser = userjasos.id;
            controller.hadseNaghsh();
            return;
        }
        const users = room?.users.filter(x => x.userInGameStatus == 10 || x.userInGameStatus == 1) || [];
        if (users.length <= 2)
            controller.barandeyeTasadofi();
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