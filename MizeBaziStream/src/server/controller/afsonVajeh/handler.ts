import { afsonDb } from './afsonDb';
import  Set from './set';
import { User } from '../../model/interfaces';
import { winnerType } from '../../model/gameInterfaces';
import { AfsonControll } from './extensions';

export default class AfsonHandler extends Set {

    constructor(roomId: string) {
        super(roomId);
    }

    public cancel(model: any) {
        if (this.activeUser == -1)
            return;
        const room = afsonDb().get(this.roomId);
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
        this.chalenger = 0;
        this.chalengerList = [];
    }

    //-----------main

    public async main() {
        if (this.finish)
            return;

        if (this.isUserAction || this.isAddDisconnec || this.door > 8) {
            this.checkLoser();
            return;
        }

        if (this.door == 0) {
            await this.delay(this.wait * 1000);
        }

        this.setState();

        if (this.activeUser > -1) {
            await this.delay(100);
            this.getDefensePositionReceive();
            await this.delay(this.mainWait * 1000);
            this.startProduceStream();
            await this.delay(500);
            this.startStreamReceive();
            this.timer();
        }
        else
            this.next();

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

    public async next() {

        if (this.activeUser > -1) {
            this.endStreamReceive();
            await this.delay(200);
        }

        if (this.activeUser == -1) {
            this.nextReset();
            this.door++;
            this.infoMainReceive();
            await this.delay(this.mainWait * 1000);
        }
        this.setNobatIndex();
    }

    private setNobatIndex() {
        const room = afsonDb().get(this.roomId);
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
            this.nextReset();
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

    public checkLoser() {
        this.isUserAction = false;
        this.isAddDisconnec = false;
        let blue: number = 0;
        let red: number = 0;

        const room = afsonDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            return;
        }
        let checkAction = false;
        room.users.map((x) => {
            if ([1, 10].indexOf(x.userInGameStatus) > -1) {
                const item = this.groupItem(x.key!);
                if (item.gun || item.talk)
                    checkAction = true;

                if (item.type == 'blue')
                    blue++;
                if (item.type == 'red')
                    red++;
            }
        });

        if (red == 0 || blue == 0 || this.door > 8 || !checkAction) this.endGame(blue, red);
        else this.main();
    }

    public async endGame(blue: number, red: number) {
        this.state = 'gameresponse';

        if (blue > red) {
            this.winner = winnerType.sefid;
        }
        else if (blue < red) {
            this.winner = winnerType.siah;
        }
        else {
            this.winner = Math.random() < 0.5 ? winnerType.sefid : winnerType.siah;
        }

        this.gameResponseReceive(90)
        await this.delay(90000);

        AfsonControll.sendToMultipleSockets(this.roomId, 'endGameReceive', true);
        await this.delay(1000);

        this.setFinish();
    }
} 