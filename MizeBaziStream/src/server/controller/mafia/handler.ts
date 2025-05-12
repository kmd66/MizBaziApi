import { mafiaDb } from './mafiaDb';
import  Set from './set';
import { User } from '../../model/interfaces';
import { winnerType } from '../../model/gameInterfaces';
import { MafiaControll } from './extensions';
import { userInDb } from '../userInDb';

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

    public setRaye(model: any) {
        if (this.raygiri.activeDefaeUser == -1 && this.raygiri.activeRaygiriUser == -1) return;
        if (model.type == 'rayeDefae')
            this.raygiri.setRayeDefa(model);
        if (model.type == 'rayeKhoroj')
            this.raygiri.setRayeKhoroj(model);
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
            this.door++;
        }
        
        if (this.shab.checkProperty()) {
            this.checkEstelam();
            return;
        } else {
            await this.delay(100);
            this.infoMainReceive();
            await this.delay(3000);
        }

        if (this.isEstelam) {
            this.checkEstelam();
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

    public async sendMsg() {
        const room = mafiaDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            return;
        }
        const status = room.users.map(({ id, userInGameStatus }) => ({
            id, userInGameStatus,
        }));

        const model = {
            door: this.door,
            doorType: this.doorType,
            wait: this.mainWait + 2,
            status: status
        };

        await this.delay(100);
        MafiaControll.sendToMultipleSockets(this.roomId, 'nightUpdate', model);

        if (this.shab.isMobarezMsg) {
            const mobarez = room.users.find(x => x.type == 9);
            if (mobarez) {
                await this.delay(100);
                MafiaControll.sendToSocket('mobarezMsgReceive', mobarez.connectionId!, true);
            }
        }
        if (this.shab.Karagah != null) {
            const Karagah = room.users.find(x => x.type == 5);
            if (Karagah) {
                await this.delay(100);
                MafiaControll.sendToSocket('KaragahMsgReceive', Karagah.connectionId!, this.shab.kharabkar);
            }
        }
        if (this.shab.kharabkar > 0) {
            const kharabkar = room.users.find(x => x.id == this.shab.kharabkar);
            if (kharabkar) {
                await this.delay(100);
                MafiaControll.sendToSocket('kharabkarMsgReceive', kharabkar.connectionId!, true);
            }

        }
        await this.delay(2000);
        
        this.shab.resetProperty();
        this.main();
    }

    public async checkEstelam() {
        const room = mafiaDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            return;
        }

        MafiaControll.sendToMultipleSockets(this.roomId, 'estelamReceive', { type: 'start', wait: 10 });
        await this.delay(10000);
        this.isEstelam = false;

        const users = room.users.filter(x => x.userInGameStatus == 1 || x.userInGameStatus == 10);
        if (this.estelamList.length >= Math.floor(users.length / 2)) {
            const shahr = room.users.filter(x => x.type < 20 && [2, 11].indexOf(x.userInGameStatus) > -1);
            const mafia = room.users.filter(x => x.type > 20 && [2, 11].indexOf(x.userInGameStatus) > -1);
            const model = {
                type: 'result',
                wait: 5,
                shahr: shahr.length,
                mafia: mafia.length,
            }
            this.estelam--;
            MafiaControll.sendToMultipleSockets(this.roomId, 'estelamReceive', model);
            await this.delay(5000);
        }
        this.nightEvents = [];
        this.main();
    }

    public async next() {
        if (this.doorType == 1)
            this.rooz.next();
    }

    public checkLoser() {
        this.isUserAction = false;
        this.isAddDisconnec = false;

        const room = mafiaDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            return;
        }
        let siah = 0;
        let sefid = 0;

        room.users.map(x => {
            if (x.type < 20)
                sefid++;
            else siah++;
        })

        if (siah == 0 || siah >= sefid) {
            this.endGame(siah, sefid);
            return;
        }

        const users = room.users.filter(x => x.userInGameStatus == 1 || x.userInGameStatus == 10);
        if (users.length < 4) {
            this.Chaos();
            return;
        }

        this.main();
    }

    public async Chaos() {
        MafiaControll.sendToMultipleSockets(this.roomId, 'chaosReceive', { type: 'chaos', wait: 10 });
        await this.delay(10000);
        this.isChaos = true;
        this.rayeChaos.clear();
        this.nobatIndex = -1;
        this.nobatChaos();
    }

    private async nobatChaos() {

        const room = mafiaDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            return;
        }
        this.nobatIndex = this.nobatIndex + 1;
        if (this.nobatIndex >= room.users.length) {
            this.checkChaos();
            return;
        }
        const user = room.users.find(x => x.index == this.nobatIndex);
        if (!user || user.userInGameStatus != 1) {
            this.nobatChaos();
            return;
        }

        this.activeUser = user.index;
        this.nobatChaos2();
    }

    private async nobatChaos2() {
        await this.delay(100);
        MafiaControll.sendToMultipleSockets(this.roomId, 'chaosReceive', { type: 'wait', wait: 3, activeUser: this.activeUser });
        await this.delay(3000);
        this.startProduceStream();
        await this.delay(500);
        MafiaControll.sendToMultipleSockets(this.roomId, 'defaeReceive', { type: 'start', wait: 15, activeUser: this.activeUser });
        await this.delay(15000);
        this.sfu.stopProducer();
        MafiaControll.sendToMultipleSockets(this.roomId, 'defaeReceive', { type: 'end' });

        this.nobatChaos();
    }

    private async checkChaos() {

        await this.delay(1000);

        MafiaControll.sendToMultipleSockets(this.roomId, 'chaosReceive', { type: 'resultChaos', wait: 15 });
        await this.delay(15000);

        const room = mafiaDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            return;
        }
        const voteCounts: Map<number, number> = new Map();

        for (const [, votedFor] of this.rayeChaos.entries()) {
            voteCounts.set(votedFor, (voteCounts.get(votedFor) || 0) + 1);
        }

        let maxVotes = 0;
        let candidates: number[] = [];

        for (const [id, count] of voteCounts.entries()) {
            if (count > maxVotes) {
                maxVotes = count;
                candidates = [id];
            } else if (count === maxVotes) {
                candidates.push(id);
            }
        }

        let userId = 0;
        if (candidates.length == 1) {
            const user = room.users.find(x => x.id == candidates[0]);
            if (user)
                userId = user.id;

        } else {
            const users = room.users.filter(x => x.userInGameStatus == 1 || x.userInGameStatus == 10);
            const index = Math.floor(Math.random() * users.length);
            if (index > -1)
                userId = users[index].id;
        }
        if (userId == 0)
            this.endGame(5, 0);
        const userLoser = room.users.find(x => x.id == userId);
        if (!userLoser)
            this.endGame(5, 0);
        userLoser!.userInGameStatus = 2;
        userInDb().update(this.roomId, userLoser!);

        MafiaControll.sendToMultipleSockets(this.roomId, 'chaosReceive', { type: 'resultChaos', wait: 5, id: userId });
        await this.delay(5000);
        this.checkLoser();
    }

    public async endGame(siah: number, sefid: number) {
        if (siah >= sefid)
            this.winner = winnerType.siah;
        else
            this.winner = winnerType.sefid;

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
            this.handler.sfu.stopProducer();
            this.handler.endStreamReceive();
            await this.delay(200);
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
            if (this.handler.door == 1)
                this.handler.doorType = 3;
            else
                this.handler.doorType = 2;
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
        if (this.nobatIndex >= room.users.length) {
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
            activeUser: this.activeDefaeUser
        });
        await this.delay(1500);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'rayegiriReceive', {
            type: 'start',
            activeUser: this.activeDefaeUser,
            wait: 5
        });
        await this.delay(5000);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'rayegiriReceive', { type: 'end' });
        await this.delay(1000);
        this.activeDefaeUser = -1;

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
            this.handler.doorType = 3;
            this.handler.main();
        }
        else {
            await this.delay(100);
            //MafiaControll.sendToMultipleSockets(this.handler.roomId, 'defaeListReceive', this.defaeList);
            //await this.delay(5000);
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
            this.defae();
            return;
        }

        await this.delay(100);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'defaeReceive', { type: 'wait', wait: 3, activeUser: user.index });
        await this.delay(3000);
        if (user.userInGameStatus == 1) {
            this.handler.startProduceStream2(user.connectionId!);
            await this.delay(500);
            MafiaControll.sendToMultipleSockets(this.handler.roomId, 'defaeReceive', { type: 'start', wait: 15, activeUser: user.index });
            await this.delay(15000);
            this.handler.sfu.stopProducer();
        }
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
            activeUser: this.activeRaygiriUser
        });
        await this.delay(1500);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'rayeKhorojReceive', {
            type: 'start',
            activeUser: this.activeRaygiriUser,
            wait: 5
        });
        await this.delay(5000);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'rayegiriReceive', { type: 'end' });
        await this.delay(1000);
        this.activeRaygiriUser = -1;

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
            const user = room.users.find(x => x.id == this.khorojList[0]);
            this.khoroj(user);
        }
        else {
            this.handler.doorType = 3;
            this.handler.main();
        }

    }

    private async khoroj(user: User | undefined) {
        if (!user) {
            this.handler.doorType = 3;
            this.handler.main();
            return;
        }
        this.handler.khorojId = user.id;

        await this.delay(100);
            MafiaControll.sendToMultipleSockets(this.handler.roomId, 'khorojReceive', { type: 'wait', wait: 3, activeUser: user.index });
            await this.delay(3000);
        if (user.userInGameStatus == 1) {
            this.handler.startProduceStream2(user.connectionId!);
            await this.delay(500);
            MafiaControll.sendToMultipleSockets(this.handler.roomId, 'khorojReceive', { type: 'start', wait: 15, activeUser: user.index });
            await this.delay(15000);
            this.handler.sfu.stopProducer();
        }
        this.handler.isUserAction = true;
        user.userInGameStatus = 2;
        userInDb().update(this.handler.roomId, user);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'khorojReceive', { type: 'end', activeUser: user.index });

        this.handler.khorojId = 0;
        await this.delay(100);

        this.handler.doorType = 3;
        this.handler.main();
    }

    public setRayeDefa(model: any) {
        const room = mafiaDb().get(this.handler.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeDefaeUser);
        const user2 = room?.users.find((x: User) => x.index == model.index && x.index == this.activeDefaeUser);
        if (!user1 || !user2) return;

        if (!this.handler.defae.has(user2.id)) {
            this.handler.defae.set(user2.id, []);
        }
        var list = this.handler.defae.get(user2.id) || [];
        if (list.includes(user1.id)) return;

        list.push(user1.id);
        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'setRayeReceive', {id: user1.id});
    }

    public setRayeKhoroj(model: any) {
        const room = mafiaDb().get(this.handler.roomId);
        const user1 = room?.users.find((x: User) => x.key == model.userKey && x.index != this.activeRaygiriUser);
        const user2 = room?.users.find((x: User) => x.index == model.index && x.index == this.activeRaygiriUser);
        if (!user1 || !user2) return;

        if (!this.handler.rayeKhoroj.has(user2.id)) {
            this.handler.rayeKhoroj.set(user2.id, []);
        }
        var list = this.handler.rayeKhoroj.get(user2.id) || [];
        if (list.includes(user1.id)) return;

        list.push(user1.id);

        MafiaControll.sendToMultipleSockets(this.handler.roomId, 'setRayeReceive', { id: user1.id });
    }
}
class Shab {
    private removeId = 0;
    private mobarez = 0;
    public isMobarezMsg = false;
    private ahangar = 0;
    public kharabkar = 0;
    public Karagah: any = null;
    private shekarchi = 0;

    private handler: mafiaHandler;
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    constructor(handler: mafiaHandler) {
        this.handler = handler;
    }

    public main() {
        this.resetProperty();
        setTimeout(() => {
            this.check();
        }, this.handler.nightWait * 1000);
    }

    public resetProperty() {
        this.removeId = 0;
        this.mobarez = 0;
        this.isMobarezMsg = false;
        this.ahangar = 0;
        this.kharabkar = 0;
        this.Karagah = null;
        this.shekarchi = 0;
    }

    public checkProperty(): boolean {
        if (this.removeId > 0 || this.shekarchi > 0 || this.Karagah != null )
            return true;
        return false;
    }

    public check() {

        this.check22();
        this.check4();
        this.check9();
        this.mafiaShot();
        this.check5();
        this.check6();

        this.dbUpdate();

        this.handler.nextReset();
        this.handler.isUserAction = true;
        this.handler.door++;
        this.handler.doorType = 1;
        if (this.handler.estelam > 0 && this.handler.door > 2)
            this.handler.isEstelam = true;
        this.handler.main();
    }

    private mafiaShot() {
        const events = this.handler.nightEvents.filter(x => x.eventType == 0 && x.type > 20);
        if (events.length == 0) return;
        const priorityOrder = [21, 22, 23];

        const selected = priorityOrder
            .map(type => events.find(e => e.type === type))
            .find(e => e !== undefined);

        if (selected.targetType == 8) return;

        else if (selected.targetType == 9) {
            if (this.mobarez == 0)
                this.removeId = selected.targetId;
            else {
                this.isMobarezMsg = true;
                if (selected.type > 21 && this.mobarez != this.ahangar)
                    this.removeId = selected.userId;
            }
        } else {
            if (selected.targetId != this.ahangar)
                this.removeId = selected.targetId;
        }

    }

    //kharabkar
    private check22() {
        const event = this.handler.nightEvents.find(x => x.eventType == 1 && x.type == 22);
        if (!event) return;

        const events = this.handler.nightEvents.filter(x => x.type == 10);
        const hasMatch = events.some(e => e.targetId == event.userId);
        const targetHasMatch = events.some(e => e.targetId == event.targetId);
        if (hasMatch || targetHasMatch) return;

        this.kharabkar = event.targetId;
    }

    //Ahangar
    private check4() {
        const event = this.handler.nightEvents.find(x => x.type == 4);
        if (!event) return;
        if (this.kharabkar == event.userId) return;
        this.ahangar = event.targetId;
    }

    //Karagah
    private check5() {
        const event = this.handler.nightEvents.find(x => x.type == 5);
        if (!event) return;
        if (this.kharabkar == event.userId) return;

        let model = {
            isMafia: event.targetType > 21 ? true : false,
            targetId: event.targetId
        }
        if (event.targetType == 21) {
            this.Karagah = model;
            return;
        }

        const event23 = this.handler.nightEvents.find(x => x.type == 23);
        if (event23 && event23.targetId == event.targetId) {
            const events = this.handler.nightEvents.filter(x => x.type == 10);
            const hasMatch = events.some(e => e.targetId == event.userId);
            const targetHasMatch = events.some(e => e.targetId == event.targetId);
            if (!hasMatch && !targetHasMatch)
                model.isMafia = !model.isMafia;
        }
        this.Karagah = model;
    }

    //shekarchi
    private check6() {
        const event = this.handler.nightEvents.find(x => x.type == 6);
        if (!event) return;
        if (this.kharabkar == event.userId) return;
        if (event.targetType > 20) {
            if (event.targetType > 21 && this.ahangar != event.targetId)
                this.shekarchi = event.targetId;
        }
        else {
            this.shekarchi = event.userId;
        }
    }

    //mobarez
    private check9() {
        const event = this.handler.nightEvents.find(x => x.type == 9);
        if (!event) return;
        if (this.kharabkar == event.userId) return;

        if (event.targetType > 20) {
            this.mobarez = event.targetId;
        }
    }


    private dbUpdate() {
        const room = mafiaDb().get(this.handler.roomId);

        if (!room) {
            this.handler.setFinish();
            return;
        }
        if (this.removeId > 0) {
            const removeUser = room.users.find(x => x.id == this.removeId);
            if (removeUser) 
                removeUser.userInGameStatus = 2;
        }

        if (this.shekarchi > 0) {
            const shekarchiUser = room.users.find(x => x.id == this.shekarchi);
            if (shekarchiUser) 
                shekarchiUser.userInGameStatus = 2;
        }

        if (this.shekarchi > 0 || this.shekarchi)
            mafiaDb().update(this.handler.roomId, room);

        if (this.Karagah) { }
        if (this.isMobarezMsg) {
            const mobarez = room.users.find(x => x.type == 9);
            if (mobarez) {
                const iMobarez = this.handler.groups.findIndex(x => x.key == mobarez.key)
                if (iMobarez > -1)
                    this.handler.groups[iMobarez].shot = false;
            }
        }
        if (this.shekarchi > 0) {
            const shekarchi = room.users.find(x => x.type == 6);
            if (shekarchi) {
                const ishekarchi = this.handler.groups.findIndex(x => x.key == shekarchi.key)
                if (ishekarchi > -1)
                    this.handler.groups[ishekarchi].shot = false;
            }
        }
    }
}