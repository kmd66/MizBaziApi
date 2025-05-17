import { DoorType } from './property';
import Set from './set';

export default class khandeHandler extends Set {

    constructor(roomId: string) {
        super(roomId);
    }

    //-----------main

    public cancel(model: any) {
        if (this.activeUser1 == -1)
            return;
    }
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
    }


    public checkLoser() {
        this.isAddDisconnec = false;

        this.main();
    }

    public async endGame() {
    }
} 

