import { mafiaDb } from './mafiaDb';
import  Set from './set';
import { User } from '../../model/interfaces';
import { winnerType } from '../../model/gameInterfaces';
import { MafiaControll } from './extensions';

export default class mafiaHandler extends Set {

    private rooz: Rooz;
    private raygiri: Raygiri;
    private shab: Shab;
    constructor(roomId: string) {
        super(roomId);

        this.rooz = new Rooz(this);
        this.raygiri = new Raygiri(this);
        this.shab = new Shab(this);
    }

    public cancel(model: any) {
        if (this.activeUser == -1)
            return;
        const room = mafiaDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser);
        if (!user)
            return;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
        this.next();
    }

    public nextReset() {
        this.activeUser = -1;
        this.nobatIndex = -1;
        this.chalenger = 0;
        this.chalengerList = [];
    }

    //-----------main

    public async main() {
        if (this.finish)
            return;

        if (this.isUserAction || this.isAddDisconnec || this.door > 14) {
            this.checkLoser();
            return;
        }

        if (this.door == 0) {
            await this.delay(this.wait * 1000);
        }

        if (this.door == 1 && this.doorType == 2) {
            this.shab.main();
            return;
        }

        this.setState();
        if (this.doorType == 1)
            this.rooz.main();
        else if (this.doorType == 2)
            this.raygiri.main();
        else if (this.doorType == 3)
            this.shab.main();

    }

    public async next() {
        if (this.doorType == 1)
            this.rooz.next();
    }

    public async Chaos() {
    }

    public checkLoser() {
        this.isUserAction = false;
        this.isAddDisconnec = false;
        
    }

    public async endGame(blue: number, red: number) {
     
        this.gameResponseReceive(90)
        await this.delay(90000);

        MafiaControll.sendToMultipleSockets(this.roomId, 'endGameReceive', true);
        await this.delay(1000);

        this.setFinish();
    }
} 


class Rooz {

    private nobatIndex: number = -1;
    private handler: mafiaHandler;
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    constructor(handler: mafiaHandler) {
        this.handler = handler;
    }

    private nextReset() {
        this.nobatIndex = -1;
        this.handler.nextReset();
    }

    public async main() {
        if (this.handler.finish)
            return;

        if (this.handler.isUserAction || this.handler.isAddDisconnec || this.handler.door > 14) {
            this.handler.checkLoser();
            return;
        }

        if (this.handler.activeUser > -1)
            this.timer();
        else
            this.next();

    }

    private async timer() {
        await this.delay(100);
        this.handler.getDefensePositionReceive();
        await this.delay(this.handler.mainWait * 1000);
        this.handler.startProduceStream();
        await this.delay(500);
        this.handler.startStreamReceive();

        if (this.handler.timeoutId) {
            clearTimeout(this.handler.timeoutId);
            this.handler.timeoutId = undefined;
        }

        this.handler.timeoutId = setTimeout(() => {
            this.next();
        }, this.handler.wait * 1000);
    }

    public async next() {
        if (this.handler.activeUser > -1) {
            this.handler.endStreamReceive();
            await this.delay(200);
        }

        if (this.handler.activeUser == -1) {
            this.nextReset();
            this.handler.door++;
            this.handler.infoMainReceive();
            await this.delay(this.handler.mainWait * 1000);
        }
        this.setNobatIndex();
    }

    private setNobatIndex() {
        const room = mafiaDb().get(this.handler.roomId);
        if (!room) {
            this.handler.setFinish();
            this.main();
            return;
        }

        this.handler.chalengerTime = false;
        if (this.handler.chalenger > 0) {
            const chalengerUser = room.users.find((x: User) => x.id == this.handler.chalenger && x.userInGameStatus == 1);
            if (chalengerUser) {
                this.handler.chalengerTime = true;
                this.handler.chalenger = 0;
                this.handler.activeUser = chalengerUser.index;
                this.main();
                return;
            }
        }

        this.nobatIndex = this.nobatIndex + 1;
        if (this.nobatIndex >= room.users.length) {
            this.nextReset();
            this.handler.doorType == 2;
            this.handler.main();
            return;
        }

        if (room.users[this.nobatIndex]?.userInGameStatus != 1) {
            this.setNobatIndex();
            return;
        }

        this.handler.activeUser = room.users[this.nobatIndex].index;
        this.main();
    }
}
class Raygiri {

    private nobatIndex: number = -1;
    protected defaeList: number[] = [];
    protected khorojList: number[] = [];
    public activeDefaeUser: number = -1;
    public activeRaygiriUser: number = -1;
    private handler: mafiaHandler;
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    constructor(handler: mafiaHandler) {
        this.handler = handler;
    }


    public async main() {
        await this.delay(100);
        this.handler.infoMainReceive();
        await this.delay(100);

        this.handler.defae.clear();
        this.handler.rayeKhoroj.clear();
        this.defaeList = [];
        this.khorojList = [];
        this.activeDefaeUser = -1;
        this.activeRaygiriUser = -1;
        this.nobatIndex = -1;
        this.setNobatIndex();
    }
    
    private setNobatIndex() {
        const room = mafiaDb().get(this.handler.roomId);
        if (!room) {
            this.handler.setFinish();
            return;
        }

        this.nobatIndex = this.nobatIndex + 1;
        if (this.handler.nobatIndex >= room.users.length) {
            this.checkDefae();
            return;
        }

        if (room.users[this.nobatIndex]?.userInGameStatus == 2 || room.users[this.nobatIndex]?.userInGameStatus == 11) {
            this.setNobatIndex();
            return;
        }

        this.activeDefaeUser = room.users[this.nobatIndex].index;
        this.rayegiri();
    }

    private async rayegiri() {
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'rayegiriReceive', {
            type: 'wait',
            activeUser: -1,
            wait: 3
        });
        await this.delay(3000);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'rayegiriReceive', {
            type: 'start',
            activeUser: this.activeDefaeUser,
            wait: 7
        });
        await this.delay(7000);
        this.setNobatIndex();
    }

    private async checkDefae() {
        const room = mafiaDb().get(this.handler.roomId);
        if (!room) {
            this.handler.setFinish();
            return;
        }
        const users = room.users.filter(x => x.userInGameStatus == 1 || x.userInGameStatus == 10);
        if (users.length < 4) {
            this.handler.Chaos();
            return;
        }

        for (const [key, value] of this.handler.defae) {
            if (value.length >= Math.floor(users.length / 2)) {
                this.defaeList.push(key);
            }
        }

        if (this.defaeList.length == 0) {
            this.handler.doorType == 3;
            this.handler.main();
        }
        else {
            await this.delay(100);
            MafiaControll.sendToMultipleSockets(this.handler.roomId, 'defaeListReceive', this.defaeList);
            await this.delay(7000);
            this.nobatIndex = -1;
            this.defae();
        }

    }

    public async defae() {

        this.nobatIndex = this.nobatIndex + 1;
        if (this.nobatIndex >= this.defaeList.length) {
            this.nobatIndex = -1;
            this.rayeKhoroj();
            return;
        }

        const room = mafiaDb().get(this.handler.roomId);
        if (!room) {
            this.handler.setFinish();
            return;
        }
        const user = room.users.find(x => x.id == this.defaeList[this.nobatIndex]);
        if (!user || user.userInGameStatus != 1) {
            this.setNobatIndex();
            return;
        }

        await this.delay(100);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'defaeReceive', {type:'wait', wait: 3, activeUser: user.id });
        this.handler.activeUser
        await this.delay(3000);
        this.handler.startProduceStream2(user.connectionId!);
        await this.delay(500);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'defaeReceive', { type: 'start', wait: 20, activeUser: user.id });
        await this.delay(20000);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'defaeReceive', { type: 'end' });

        this.defae();
    }

    private async rayeKhoroj() {
        this.nobatIndex = this.nobatIndex + 1;
        if (this.nobatIndex >= this.defaeList.length) {
            this.checKhoroj();
            return;
        }

        const room = mafiaDb().get(this.handler.roomId);
        if (!room) {
            this.handler.setFinish();
            return;
        }
        const user = room.users.find(x => x.id == this.defaeList[this.nobatIndex]);
        if (!user) {
            this.rayeKhoroj();
            return;
        }

        this.activeRaygiriUser = user.index;
        this.rayeKhoroj2();
    }

    private async rayeKhoroj2() {
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'rayeKhorojReceive', {
            type: 'wait',
            activeUser: -1,
            wait: 3
        });
        await this.delay(3000);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'rayeKhorojReceive', {
            type: 'start',
            activeUser: this.activeRaygiriUser,
            wait: 7
        });
        await this.delay(7000);
        this.rayeKhoroj();
    }

    private async checKhoroj() {
        const room = mafiaDb().get(this.handler.roomId);
        if (!room) {
            this.handler.setFinish();
            return;
        }
        const users = room.users.filter(x => x.userInGameStatus == 1 || x.userInGameStatus == 10);
        if (users.length < 4) {
            this.handler.Chaos();
            return;
        }

        let maxLength = 0;

        for (const [key, value] of this.handler.rayeKhoroj) {
            if (value.length >= Math.floor(users.length / 2)) {
                if (maxLength < value.length) {
                    this.khorojList = [];
                    this.khorojList.push(key);
                    maxLength = value.length;
                }
                else if (maxLength == value.length)
                    this.khorojList.push(key);
            }
        }

        if (this.khorojList.length == 1) {
            const user = room.users.find(x => x.index == this.khorojList[0]);
            this.khoroj(user);
        }
        else {
            this.handler.doorType == 3;
            this.handler.main();
        }

    }

    private async khoroj(user: User | undefined) {
        if (!user) {
            this.handler.doorType == 3;
            this.handler.main();
            return;
        }

        await this.delay(100);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'khorojReceive', { type: 'wait', wait: 3, activeUser: user.id });
        this.handler.activeUser
        await this.delay(3000);
        this.handler.startProduceStream2(user.connectionId!);
        await this.delay(500);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'khorojReceive', { type: 'start', wait: 15, activeUser: user.id });
        await this.delay(20000);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'khorojReceive', { type: 'end' });

        await this.delay(100);

        this.handler.doorType == 3;
        this.handler.main();
    }
}
class Shab {

    private handler: mafiaHandler;
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    constructor(handler: mafiaHandler) {
        this.handler = handler;
    }

    public async main() {
        await this.delay(100);
        this.handler.infoMainReceive();
        await this.delay(100);
        setTimeout(() => {
            this.check();
        }, 40000);
    }

    public async check() {
        const room = mafiaDb().get(this.handler.roomId);
        if (!room) {
            this.handler.setFinish();
            return;
        }


        const user = room.users.filter(x => x.userInGameStatus == 1 || x.userInGameStatus == 10);
        if (user.length < 4) {
            this.handler.Chaos();
            return;
        }

        this.handler.door++;
        this.handler.doorType == 1;
        this.handler.main();
    }

}