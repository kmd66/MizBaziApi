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
            case 'zabanPich': this.zabanPichReceiveEnd(); break;
            case 'soalPich': this.soalPichReceiveEnd(); break;
            case 'naghashi': this.naghashiReceiveEnd(); break;
            case 'labKhoni': this.labKhoniReceiveEnd(); break;

            default: this.main();
        }
    }

    //-----------main

    public async main() {
        if (this.finish)
            return;

        if (this.isAddDisconnec || !this.door || this.door == DoorType.d11) {
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
                case 'zabanPich': this.zabanPichReceive(); break;
                case 'soalPich': this.soalPichReceive(); break;
                case 'naghashi': this.naghashiReceive();break;
                case 'labKhoni': this.labKhoniReceive(); break;

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

        if (!this.door || this.door == DoorType.d11) {
        }

        this.main();
    }

    private async endGame() {
    }

    //--------------------

    private async mainReceive() {
        this.sendStateReceive('mainReceive');
    }
    private async mainReceiveEnd() {
        this.sendStateEnd('mainReceive');
    }

    private async zabanPichReceive() {
        this.sendStateReceive('zabanPichReceive');
    }
    private async zabanPichReceiveEnd() {
        this.sendStateEnd('zabanPichReceive');
    }

    private async soalPichReceive() {
        this.sendStateReceive('soalPichReceive');
    }
    private async soalPichReceiveEnd() {
        this.sendStateEnd('soalPichReceive');
    }

    private naghashiReceive() {
        this.sendStateReceive('naghashiReceive');
    }
    private naghashiReceiveEnd() {
        this.sendStateEnd('naghashiReceive');
    }

    private async sendStateReceive(eventName: string) {
        this.sendMainReceive(eventName, 'wait', this.mainWait);
        await this.delay(this.mainWait * 1000);

        this.startProduceStream();
        await this.delay(500);
        this.sendMainReceive(eventName, 'start', this.wait);
        this.timeoutId = setTimeout(() => {
            this.sendStateEnd(eventName);
        }, this.wait * 1000);
    }
    private async sendStateEnd(eventName: string) {
        this.sfu.stopProducer();
        this.sfu.closeAllConsumer();
        this.sendMainReceive(eventName, 'end', 0);
        await this.delay(200);
        this.setNobatIndex();
    }

    private async labKhoniReceive() {
        this.sendMainReceive('labKhoniReceive', 'wait', this.mainWait);
        await this.delay(this.mainWait * 1000);

        this.startProduceStream();
        await this.delay(500);
        this.sendMainReceive('labKhoniReceive', 'start', this.wait);
        this.timeoutId = setTimeout(() => {
            this.mainReceiveEnd();
        }, this.wait * 1000);
    }
    private async labKhoniReceiveEnd() {
        this.sfu.stopProducer();
        this.sendMainReceive('labKhoniReceive', 'end', 0);
        await this.delay(200);
        this.setNobatIndex();
    }
} 

