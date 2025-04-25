import { SteamType } from '../model/gameInterfaces';
import { rangOrazDb } from './rangOrazDb';
import SFU from '../handler/sfu';
import { User } from '../model/interfaces';
import { RangOrazProperty, NobatType, receiveType, winnerType, RangOrazDoor } from './rangOrazProperty';
import { RangOrazControll } from './rangOrazExtensions';

export default class BaseRangOrazStream extends RangOrazProperty {
    constructor(roomId: string) {
        super(roomId);
    }

    public sfu = new SFU(SteamType.audio);

    public consumerResume(model: any) {
        const room = rangOrazDb().get(model.roomId);
        const user = room?.users.find((x: User) => x.key == model.userKey && x.type != 1);
        if (!user) return;
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