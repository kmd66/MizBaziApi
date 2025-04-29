import { winnerType } from '../../model/gameInterfaces';
export class Property {
    constructor(roomId: string) {
        this.roomId = roomId;
    }

    public door: number = 0;

    public roomId!: string;

    public wait: number = 12;
    public mainWait: number = 3;
    public activeUser: number = -1;
    public isChalesh: boolean = false;
    public isSticker: boolean = false;
    public state: string = 'main';

    public finish: boolean = false;

    protected raieGiriCount: Map<number, number> = new Map();

    protected timeoutId?: NodeJS.Timeout;

    protected chalenger: number = -1;
    protected chalengerTime: boolean = false;
    protected chalengerList: number[] = [];

    protected nobatIndex: number = -1;

    protected winner: winnerType = winnerType.undefined;

    public loserUser: any = {};

    protected isStream: boolean = false;
    protected get streamDoor(): boolean {
        return true;
    }

    protected delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    protected getNextStep() {
        this.door = this.door + 1;
    }

    protected setState() {
        this.state = 'main';
        if (this.chalengerTime)
            this.wait = 20;
        else if (this.activeUser)
            this.wait = 30;
        else
            this.wait = 12;
    }
}
