import { RangOrazDoor, SteamType } from '../model/gameInterfaces';
import { rangOrazDb } from './rangOrazDb';
import { userInDb } from './userInDb';
import SocketManager from '../handler/socket';
import SFU from '../handler/sfu';
import { User } from '../model/interfaces';

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
enum winnerType {
    undefined = 0,
    sefid = 1,
    siah = 2,
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
        if (connectionIds.length > 0)
        SocketManager.sendToMultipleSockets('hubRangOraz', name, connectionIds, model)
    }
}

class RangOrazProperty {
    constructor(roomId: string) {
        this.roomId = roomId;
        this.mozoeNaghashiList = [
            'موضوع 1',
            'موضوع 2',
            'موضوع 3',
            'موضوع 4',
            'موضوع 5',
            'موضوع 6',
            'موضوع 7',
            'موضوع 8',
            'موضوع 9',
            'موضوع 10',
        ];
    }

    public sfu = new SFU(SteamType.audio);

    public roomId!: string;

    public wait: number = 12;
    public mainWait: number = 3;
    public door?: RangOrazDoor = RangOrazDoor.d0;
    public activeUser: number = -1;
    public isShowOstad: boolean = false;
    public isChalesh: boolean = false;
    public isSticker: boolean = false;
    public state: string = 'main';

    public finish: boolean = false;

    protected mozoeNaghashiList: string[] = [];
    public naghashi: Map<number, any> = new Map();
    public mozoeNaghashi: string = '';

    protected raieGiriCount: Map<number, number> = new Map(); //[userId]

    protected timeoutId?: NodeJS.Timeout;

    protected chalenger: number = -1;
    protected chalengerTime: boolean = false;
    protected chalengerList: number[] = [];

    public bazporsiUsers: number[] = [];
    protected bazporsiWait: any = {
        bazporsiReceive:4, //10
        start: 2, //20
        end: 0,
        raigiriStart: 3, //12
        raigiriEnd: 0,
        raigiriResponse: 2, //10
    }

    public nobatType: NobatType = NobatType.undefined;
    protected nobatIndex: number = -1;

    protected winner: winnerType = winnerType.undefined;

    public loserUser: any = {};

    public hadseNaghsh: any = {};

    protected isStream: boolean = false;
    protected get streamDoor(): boolean {
        if (!this.door)
            return false;
        if ([RangOrazDoor.d1, RangOrazDoor.d5, RangOrazDoor.d6, RangOrazDoor.d7, RangOrazDoor.d8, RangOrazDoor.d9].indexOf(this.door!) != -1)
            return true;
        return false;
    }

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

    protected setState() {

        if (this.door! == RangOrazDoor.d2) {
            this.state = 'main';
        } else if ([RangOrazDoor.d3, RangOrazDoor.d4].indexOf(this.door!) != -1) {
            this.state = 'paint';
        } else {
            this.state = 'main';
        }

        //if (this.door == RangOrazDoor.d2) {this.wait = 200; return; }
        this.wait = 2;return;
        switch (this.door) {
            case RangOrazDoor.d0:
                this.wait = 2;//12
                return;
            case RangOrazDoor.d1:
            case RangOrazDoor.d2:
                this.wait = 10; //20
                return;
            case RangOrazDoor.d3:
            case RangOrazDoor.d4:
                this.wait = 95; //95
                return;
            default:
                this.wait = this.chalengerTime? 20:30;
                return ;
        }
    }

    public setFinish() {
        this.finish = true;
        this.naghashi.clear();
        this.raieGiriCount.clear();
        //clearTimeout(this.timeoutId);
        //rangOrazDb().delete(this.roomId);
        //RangOrazTimer.instance.stop(this.roomId);
    }
}

class BaseRangOrazReceive extends RangOrazProperty {
    constructor(roomId: string) {
        super(roomId);
    }

    public infoMainWaitReceive() {
        const model = {
            door: 'بارگزاری',
            progressTime: this.mainWait,
            activeUser: -1,
        };
        RangOrazControll.sendToMultipleSockets(this.roomId, 'infoMainReceive', model);
    }

    public infoMainReceive() {
        const model = {
            door: this.door,
            progressTime: this.wait,
            activeUser: this.activeUser,
        };
        RangOrazControll.sendToMultipleSockets(this.roomId, 'infoMainReceive', model);
    }

    protected showOstadReceive() {
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.type == 2);
        if (!user) return;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'showOstadReceive', user.id);
    }

    protected bazporsiReceive(type: receiveType) {
        let model = {
            type: type,
            wait: type == receiveType.start ? this.bazporsiWait.bazporsiReceive : 0
        }
        RangOrazControll.sendToMultipleSockets(this.roomId, 'bazporsiReceive', model);
    }

    protected defaeReceive(type: receiveType, userIndex: number) {
        const model = {
            type: type,
            userIndex: userIndex,
            users: this.bazporsiUsers,
            wait: 2
        };
        if (type == receiveType.start)
            model.wait = this.bazporsiWait.start;

        RangOrazControll.sendToMultipleSockets(this.roomId, 'defaeReceive', model);
    }
    protected raigiriReceive(type: receiveType, wait: number) {
        const model = {
            type: type,
            wait: wait,
            raieGiriCount: Array.from(this.raieGiriCount.entries()),
        }
        RangOrazControll.sendToMultipleSockets(this.roomId, 'raigiriReceive', model);
    }
    protected hadseNaghshReceive(type: receiveType) {
        const model = {
            loserUser: this.loserUser,
            type: type,
            wait: type == receiveType.start ? 14 : 10,
            hadseNaghsh: type == receiveType.end ? this.hadseNaghsh : {}
        };
        RangOrazControll.sendToMultipleSockets(this.roomId, 'hadseNaghshReceive', model);
    }
    protected gameResponseReceive(wait: number) {
        const users: any = [];

        const room = rangOrazDb().get(this.roomId);
        room?.users.map(({ id, type }) => {
            users.push({ id: id, type: type })
        });
        const model = {
            wait: wait,
            winner: this.winner,
            users: users
        };
        RangOrazControll.sendToMultipleSockets(this.roomId, 'gameResponseReceive', model);
    }

    protected getDefensePositionReceive() {
        const model = {
            activeUser: this.activeUser,
            wate: this.mainWait,
            nobatType: this.nobatType,
        };
        RangOrazControll.sendToMultipleSockets(this.roomId, 'getDefensePositionReceive', model);
    }
    protected startStreamReceive() {
        this.isStream = true;
        const model = {
            activeUser: this.activeUser,
            wate: this.wait,
            nobatType: this!.nobatType,
        };
        RangOrazControll.sendToMultipleSockets(this.roomId, 'startStreamReceive', model);
    }
    protected endStreamReceive() {
        this.isStream = false;
        this.activeUser = -1;
        const model = {};
        RangOrazControll.sendToMultipleSockets(this.roomId, 'endStreamReceive', model);
    }

    protected mozoeNaghashListRieceive() {
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.type == 2 && x.userInGameStatus == 1);
        if (!user) return;
        SocketManager.sendToSocket('hubRangOraz', 'mozoeNaghashListRieceive', user.connectionId, this.mozoeNaghashiList);
    }

    protected mozoeNaghashRieceive() {
        if (this.mozoeNaghashi == '') this.mozoeNaghashi = this.mozoeNaghashiList[0];
        RangOrazControll.sendToMultipleSockets(this.roomId, 'mozoeNaghashRieceive', this.mozoeNaghashi);
    }

    protected imgsRieceive() {
        RangOrazControll.sendToMultipleSockets(this.roomId, 'imgsRieceive', Array.from(this.naghashi.entries()));
    }

}

class BaseRangOrazSet extends BaseRangOrazReceive {
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

    public setShowOstad(model: any) {
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.type == 2 && x.key == model.userKey);
        if (!user) return;
        this.isShowOstad = true;
        this.showOstadReceive();
    }

    public setHadseNaghsh(model: any) {
        if (!this.loserUser?.id) return;
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.id == this.loserUser?.id);
        if (!user) return;

        const userHadseNaghsh = room?.users.find((x: User) => x.id == model.userId);
        if (!userHadseNaghsh) return;
        this.hadseNaghsh = {
            id: userHadseNaghsh.id,
            type: userHadseNaghsh.type
        }
        SocketManager.sendToSocket('hubRangOraz', 'getHadseNaghsh', user.connectionId, model.userId)
    }

    public addChalesh(model: any) {
        if (this.chalengerTime || !this.isStream || this.chalenger > 0 || this.door == RangOrazDoor.d1) return;

        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser);
        if (!user) return;
        const index = this.chalengerList.findIndex(x => x == user.id);
        if (index > -1) return;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'addChaleshReceive', user.id);

    }
    public addSticker(model: any) {
        if (!this.isStream) return;

        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeUser);
        if (!user) return;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'addStickerReceive', {
            id: user.id,
            t: model.t
        });
    }
    public addTarget(model: any) {
        if (!this.isStream) return;
        const room = rangOrazDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId && x.index != this.activeUser);
        if (!user1 || !user2) return;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'addTargetReceive', {
            id: user2.id,
            type:model.type
        });
    }
    public setChalesh(model: any) {
        if (!this.isStream || this.chalenger > 0 || this.door == RangOrazDoor.d1) return;

        const room = rangOrazDb().get(this.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        const user2 = room?.users.find((x: User) => x.id == model.userId);

        if (!user1 || !user2) return;
        this.chalengerList.push(model.userId);
        this.chalenger = model.userId;
        RangOrazControll.sendToMultipleSockets(this.roomId, 'setChaleshReceive', model.userId);
    }

    public setMozoeNaghashi(model: any) {
        if (this.mozoeNaghashi != '') return;

        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.type == 2);
        if (!user) return;

        const mozoe = this.mozoeNaghashiList.find(x => x == model.mozoe);
        if (!mozoe) return;
        this.mozoeNaghashi = mozoe;

        SocketManager.sendToSocket('hubRangOraz', 'setMozoeNaghashiReceive', user.connectionId, true);
    }
    
    public sendImg(model: any) {
        if (this.door != RangOrazDoor.d3 && this.door != RangOrazDoor.d4) return;
        const room = rangOrazDb().get(model.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.type != 1);
        if (!user) return;
        if (this.naghashi.has(user.id)) {
            this.naghashi.delete(user.id);
        }
        this.naghashi.set(user.id, model.data);

        const user2 = room?.users.find((x: User) => x.type == 11 && x.userInGameStatus == 1);
        if (!user2) return;
        SocketManager.sendToSocket('hubRangOraz', 'getImgForSpy', user2.connectionId, {
            userName: user.info.UserName,
            data: model.data
        });
    }
}

export class RangOrazHandler extends BaseRangOrazSet {
    constructor(roomId: string) {
        super(roomId); 
    }

    public cancel(model: any) {
        if (this.activeUser == -1)
            return;
        const room = rangOrazDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        if (!user)
            return;

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
        this.chalenger = 0;
        this.chalengerList = [];
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

        this.setState();

        if (this.door == RangOrazDoor.d2) {
            this.mozoeNaghashListRieceive();
            await this.delay(200);
        }

        if (this.door == RangOrazDoor.d3) {
            this.mozoeNaghashRieceive();
            await this.delay(200);
        }

        if (this.door == RangOrazDoor.d5) {
            this.imgsRieceive();
            await this.delay(500);
        }

        if (this.activeUser > -1) {
            await this.delay(100);
            this.getDefensePositionReceive();
            await this.delay(this.mainWait * 1000);
            this.startStreamReceive();
        }
        else {
            this.infoMainWaitReceive();
            await this.delay(this.mainWait * 1000);
            this.infoMainReceive();
        }

        this.timer();
    }

    private timer() {

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }

        if (this.streamDoor && this.activeUser == -1) {
            this.timeoutId = setTimeout(() => {
                this.next();
            }, 1400);
            return;
        }

        this.timeoutId = setTimeout(() => {
            this.next();
        }, this.wait * 1000);
    }

    private async next() {
        if (this.activeUser > -1) {
            this.endStreamReceive();
            await this.delay(200);
        }

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

        this.chalengerTime = false;
        if (this.chalenger > 0) {
            const chalengerUser = room.users.find((x: User) => x.id == this.chalenger && x.userInGameStatus == 1);
            if (chalengerUser) {
                this.chalengerTime = true;
                this.chalenger = 0;
                this.activeUser = chalengerUser.index;
                this.main();
                return;
            }
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
        this.state = 'main';

        if (this.finish)
            return;

        this.bazporsiUsers = [];
        this.bazporsiReceive(receiveType.start);
        await this.delay(this.bazporsiWait.bazporsiReceive * 1000);
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
        this.state = 'defae';

        if (this.finish)
            return;

        
        await this.delay(1000);
        this.defaeReceive(receiveType.wait, -1);
        await this.delay(2000);

        //نفر 1
        this.defaeReceive(receiveType.start, 0);
        await this.delay(this.bazporsiWait.start *1000);
        this.defaeReceive(receiveType.end, 0);

        await this.delay(2000);

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
        this.loserUser = {};

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
                RangOrazControll.sendToMultipleSockets(this.roomId, 'stateReceive','main');
                await this.delay(200);
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

        this.loserUser = {
            id: user.id,
            type: user.type
        };
        this.hadseNaghshHandler();
    }

    public async hadseNaghshHandler() {
        this.state = 'main';

        this.hadseNaghshReceive(receiveType.wait)
        await this.delay(10000);

        if (!this.isShowOstad) {
            this.hadseNaghshReceive(receiveType.start)
            await this.delay(14000);
        }

        if (this.hadseNaghsh?.id) {
            this.hadseNaghshReceive(receiveType.end)
            await this.delay(10000);
        }

        this.endGame();
    }

    public async endGame() {
        this.state = 'gameresponse';

        const room = rangOrazDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            this.main();
            return;
        }

        const ostad = room.users.find((x: User) => x.type == 2);
        const jasos = room.users.find((x: User) => x.type == 11);

        const loser = room.users.find((x: User) => x.id == this.loserUser.id);
        const hadseNaghsh = room.users.find((x: User) => x.id == this.hadseNaghsh?.id);

        if (ostad?.userInGameStatus == 2 || ostad?.userInGameStatus == 11) {
            this.winner = winnerType.siah;
        }
        else if (jasos?.userInGameStatus == 2 || jasos?.userInGameStatus == 11) {
            this.winner = winnerType.sefid;
        }
        else if (loser?.type == 11) {
            if (hadseNaghsh?.type == 2) this.winner = winnerType.siah;
            else this.winner = winnerType.sefid;
        }
        else if (loser?.type != 11) {
            if (hadseNaghsh?.type == 11) this.winner = winnerType.sefid;
            else this.winner = winnerType.siah;
        }
        else {
            this.winner = winnerType.sefid;
        }


        this.gameResponseReceive(90)
        await this.delay(90000);

        RangOrazControll.sendToMultipleSockets(this.roomId, 'endGameReceive', true);
        await this.delay(500);

        this.setFinish();
    }

    //------------

    public barandeyeTasadofi() {
        const room = rangOrazDb().get(this.roomId);
        const unvotedUsers = room?.users.filter((user: User) => user.userInGameStatus == 1 || user.userInGameStatus == 10);
        if (!unvotedUsers) {
            this.setFinish();
            this.main();
            return;
        }
        const user = unvotedUsers![Math.floor(Math.random() * unvotedUsers!.length)];
        if (!user) {
            const user2 = room?.users.find((user: User) => user.type == 2);
            this.loserUser = {
                id: user2!.id,
                type: user2!.type
            };
            this.winner = winnerType.siah;
            this.setFinish();
            return;
        }

        this.loserUser = {
            id: user.id,
            type: user.type
        };

        this.hadseNaghshHandler();
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

export const rangOrazStart = RangOrazTimer.Start;
export const rangOrazStartAll = RangOrazTimer.StartAll;