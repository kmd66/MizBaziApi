import { DoorType } from './property';
import { khandeDb } from './khandeDb';
import { User } from '../../model/interfaces';
import Set from './set';
import { KhandeControll } from './extensions';
import { winnerType2 } from '../../model/gameInterfaces';

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
            case 'labKhoni': this.labKhoniReceiveEnd(); break;

            default: this.main();
        }
    }


    public setPartnerLose() {
        const room = khandeDb().get(this.roomId);
        if (!room) return;
        room.users.map(x => {
            if (x.userInGameStatus == 11) {
                const pKey = this.getPartnerKey(x.key!);
                if (pKey) {
                    const pUser = room.users.find(x => x.key == pKey);
                    if (pUser && [2, 11].indexOf(pUser.userInGameStatus) == -1) {
                        pUser.userInGameStatus = 2;
                        khandeDb().update(this.roomId, room!);
                    }
                }
            }
        });
    }

    //-----------main

    public async main() {
        if (this.finish)
            return;

        if (this.isUserAction || this.isAddDisconnec || !this.door || this.door == DoorType.d12) {
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
        this.isUserAction = false;

        const room = khandeDb().get(this.roomId);
        if (!room) return;

        let usersLength = 0;
        room.users.map(x => {
            if (x.userInGameStatus == 10 || x.userInGameStatus == 1) {
                usersLength++;
            }
        });

        if (!this.door || this.door == DoorType.d12 || usersLength < 3) {
            this.endGame();
        }

        this.main();
    }

    private async endGame() {
        const room = khandeDb().get(this.roomId);
        if (!room) return;

        let type: string[] = [];
        room.users.map(x => {
            if (x.userInGameStatus == 10 || x.userInGameStatus == 1) {
                const item = this.groupItem(x.key!);
                if (item && !type.includes(item.type)) {
                    type.push(item.type);
                }
            }
        });

        if (type.length == 0) {
            const index = Math.floor(Math.random() * room.users.length);
            const randomUser = room.users[index];
            const item = this.groupItem(randomUser.key!);
            type.push(item.type);
        }

        this.winner = winnerType2.abi;

        if (type.length == 1) {
            if (type[0] == 'red')
                this.winner = winnerType2.germez;
            if (type[0] == 'green')
                this.winner = winnerType2.sabz;
        } else {
            let maxLength = -1;
            let candidates: string[] = [];

            for (const [type, scores] of this.score.entries()) {
                const len = scores.length;

                if (len > maxLength) {
                    maxLength = len;
                    candidates = [type];
                } else if (len === maxLength) {
                    candidates.push(type);
                }
            }

            let selectedType: string | undefined;

            if (candidates.length === 1) {
                selectedType = candidates[0];
            } else if (candidates.length > 1) {
                selectedType = candidates.reduce((minType, current) => {
                    const smileCurrent = this.smile.get(current) ?? 0;
                    const smileMin = this.smile.get(minType) ?? 0;
                    return smileCurrent < smileMin ? current : minType;
                });
            }

            if (selectedType == 'red')
                this.winner = winnerType2.germez;
            if (selectedType == 'green')
                this.winner = winnerType2.sabz;
        }

        this.gameResponseReceive(90)
        await this.delay(90000);

        KhandeControll.sendToMultipleSockets(this.roomId, 'endGameReceive', true);
        await this.delay(1000);

        this.setFinish();
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

    private async labKhoniReceive() {
        this.sendSoal();
        await this.delay(100);
        this.sendMainReceive('labKhoniReceive', 'wait', this.mainWait);
        await this.delay(this.mainWait * 1000);

        this.startPartnerStream();
        await this.delay(2000);
        this.startProduceStream();
        await this.delay(500);
        this.sendMainReceive('labKhoniReceive', 'start', this.wait);
        this.timeoutId = setTimeout(() => {
            this.labKhoniReceiveEnd();
        }, this.wait * 1000);
    }
    private async labKhoniReceiveEnd() {
        this.sfu.stopProducer();
        this.sendMainReceive('labKhoniReceive', 'end', 0);
        await this.delay(200);
        this.setNobatIndex();
    }
} 

