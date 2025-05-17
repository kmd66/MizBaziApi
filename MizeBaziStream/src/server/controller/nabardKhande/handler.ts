import  Set from './set';

export default class khandeHandler extends Set {

    constructor(roomId: string) {
        super(roomId);

        this.rooz = new Rooz(this);
        this.raygiri = new Raygiri(this);
        this.shab = new Shab(this);
    }

    //-----------main

    public async main() {
        if (this.finish)
            return;
    }
} 

