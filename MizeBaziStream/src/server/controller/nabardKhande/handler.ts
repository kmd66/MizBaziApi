import { DoorType } from './property';
import { khandeDb } from './khandeDb';
import { User } from '../../model/interfaces';
import Set from './set';

export default class khandeHandler extends Set {

    constructor(roomId: string) {
        super(roomId);
    }
    private nextReset() {
        this.activeUser1 = -1;
        this.activeUser2 = -1;
        this.nobatIndex = -1;
    }

    public cancel(model: any) {
        if (this.activeUser1 == -1)
            return;

        const room = khandeDb().get(this.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.index == this.activeUser1);
        if (!user)
            return;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
        switch (this.state) {
            case 'main': this.mainReceiveEnd(); break;
            case 'soalPich': this.soalPichReceiveEnd(); break;

            default: this.main();
        }
    }

    //-----------main

    public async main() {
        if (this.finish)
            return;

        if (this.isAddDisconnec || !this.door || this.door == DoorType.d12) {
            this.checkLoser();
            return;
        }
        if (this.door == DoorType.d0) {
            await this.delay(this.wait * 1000);
        }

        this.next();

    }

    private async next() {
        if (this.activeUser1 > -1) {
            switch (this.state) {
                case 'main': this.mainReceive(); break;
                case 'soalPich': this.soalPichReceive(); break;

                default: this.main();
            }
        }
        
        if (this.activeUser1 == -1) {
            this.nextReset();
            this.getNextStep();
            this.infoMainReceive();
            await this.delay(this.mainWait * 1000);
            this.setNobatIndex();
        }

    }

    private setNobatIndex() {
        const room = khandeDb().get(this.roomId);
        if (!room) {
            this.setFinish();
            this.main();
            return;
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

        const user = room.users[this.nobatIndex];
        const partnerKey = this.getPartnerKey(user?.key);
        const user2 = room.users.find(x => x.key == partnerKey);
        if (!user || !user2) {
            this.setFinish();
            this.main();
            return;
        }

        this.activeUser1 = user.index;
        this.activeUser2 = user2.index;
        this.main();
    }

    private checkLoser() {
        this.isAddDisconnec = false;

        if (!this.door || this.door == DoorType.d12) {
        }

        this.main();
    }

    private async endGame() {
    }

    //--------------------

    private async mainReceive() {
        this.sendMainReceive('mainReceive', 'wait', this.mainWait);
        await this.delay(this.mainWait * 1000);

        this.startProduceStream();
        await this.delay(500);
        this.sendMainReceive('mainReceive', 'start', this.wait);
        this.timeoutId = setTimeout(() => {
            this.mainReceiveEnd();
        }, this.wait * 1000);

    }
    private async mainReceiveEnd() {
        this.sfu.stopProducer();
        this.sfu.closeAllConsumer();
        this.sendMainReceive('mainReceive', 'end', 0);
        await this.delay(200);
        this.setNobatIndex();
    }

    private async soalPichReceive() {
        this.sendSoal();
        await this.delay(100);
        this.sendMainReceive('soalPichReceive', 'wait', this.mainWait);
        await this.delay(this.mainWait * 1000);

        this.startProduceStream();
        await this.delay(500);
        this.sendMainReceive('soalPichReceive', 'start', this.wait);
        this.timeoutId = setTimeout(() => {
            this.soalPichReceiveEnd();
        }, this.wait * 1000);

    }
    private async soalPichReceiveEnd() {
        this.soal = '';
        this.soal2 = '';
        this.sfu.stopProducer();
        this.sfu.closeAllConsumer();
        this.sendMainReceive('soalPichReceive', 'end', 0);
        await this.delay(200);
        this.setNobatIndex();
    }

    //private async labKhoniReceive() {
    //    this.sendMainReceive('labKhoniReceive', 'wait', this.mainWait);
    //    await this.delay(this.mainWait * 1000);

    //    this.startPartnerStream();
    //    await this.delay(500);
    //    this.startProduceStream();
    //    await this.delay(500);
    //    this.sendMainReceive('labKhoniReceive', 'start', this.wait);
    //    this.timeoutId = setTimeout(() => {
    //        this.mainReceiveEnd();
    //    }, this.wait * 1000);
    //}
    //private async labKhoniReceiveEnd() {
    //    this.sfu.stopProducer();
    //    this.sendMainReceive('labKhoniReceive', 'end', 0);
    //    await this.delay(200);
    //    this.setNobatIndex();
    //}
} 

