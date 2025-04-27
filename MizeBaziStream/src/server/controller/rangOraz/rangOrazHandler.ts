import { rangOrazDb } from './rangOrazDb';
import { User } from '../../model/interfaces';
import { NobatType, receiveType, winnerType, RangOrazDoor } from './rangOrazProperty';
import BaseRangOrazSet from './rangOrazSet';
import { RangOrazControll } from './rangOrazExtensions';
export default class RangOrazHandler extends BaseRangOrazSet {
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
            this.startProduceStream();
            await this.delay(500);
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
        await this.defaeUser(0);

        await this.delay(2000);
        //نفر 2
        await this.defaeUser(1);

        this.raigiri();
    }

    private async defaeUser(index: number): Promise<void> {
        this.startProduceStreamById(this.bazporsiUsers[index]);
        await this.delay(500);
        this.defaeReceive(receiveType.start, index);
        await this.delay(this.bazporsiWait.start * 1000);
        this.defaeReceive(receiveType.end, index);
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