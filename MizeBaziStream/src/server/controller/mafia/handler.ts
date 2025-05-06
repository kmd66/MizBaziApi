import { mafiaDb } from './mafiaDb';
import  Set from './set';
import { User } from '../../model/interfaces';
import { winnerType } from '../../model/gameInterfaces';
import { MafiaControll } from './extensions';

export default class mafiaHandler extends Set {

    constructor(roomId: string) {
        super(roomId);
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

    private nextReset() {
        this.activeUser = -1;
        this.nobatIndex = -1;
        this.chalenger = 0;
        this.chalengerList = [];
    }

    //-----------main

    public async main() {
        if (this.finish || 1==1)
            return;

        if (this.isUserAction || this.isAddDisconnec || this.door > 10) {
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
        const room = mafiaDb().get(this.roomId);
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
        
    }

    public async endGame(blue: number, red: number) {
     
        this.gameResponseReceive(90)
        await this.delay(90000);

        MafiaControll.sendToMultipleSockets(this.roomId, 'endGameReceive', true);
        await this.delay(1000);

        this.setFinish();
    }
} 