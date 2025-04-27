import { rangOrazDb } from './rangOrazDb';
import SocketManager from '../../handler/socket';
import { User } from '../../model/interfaces';
import { receiveType } from './rangOrazProperty';
import BaseRangOrazStream from './rangOrazStream';
import { RangOrazControll } from './rangOrazExtensions';

export default class BaseRangOrazReceive extends BaseRangOrazStream {
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