export enum RangOrazDoor {
    d0 = 'در انتظار شروع',
    d1 = 'معارفه',
    d2 = 'تعیین موضوع',
    d3 = 'نقاشی',
    d4 = 'نقاشی جاسوس',
    d5 = 'دور 1',
    d6 = 'دور 2',
    d7 = 'دور 3',
    d8 = 'دور 4',
    d9 = 'دور 5',
}
export enum NobatType {
    undefined = 0,

    nobat = 1, //'نوبت صحبت کردن',

    bazporsi = 10, //'بازپرسی',
    defae = 11, //'دفاع',
    raieGiri = 12, //'رایگیری',

    hadseNaghsh = 15, //'حدس نقش',
}
export enum receiveType {
    undefined = 0,
    start = 1,
    end = 2,
    wait = 10,
    response = 20,
}
export enum winnerType {
    undefined = 0,
    sefid = 1,
    siah = 2,
}

export class RangOrazProperty {
    constructor(roomId: string) {
        this.roomId = roomId;
        this.mozoeNaghashiList = [
            'موضوع 1',
            'موضوع 2',
            'موضوع 3',
            'موضوع 4',
            'موضوع 5',
            'موضوع 6',
            'موضوع 7',
            'موضوع 8',
            'موضوع 9',
            'موضوع 10',
        ];
    }

    public roomId!: string;

    public wait: number = 12;
    public mainWait: number = 3;
    public door?: RangOrazDoor = RangOrazDoor.d0;
    public activeUser: number = -1;
    public isShowOstad: boolean = false;
    public isChalesh: boolean = false;
    public isSticker: boolean = false;
    public state: string = 'main';

    public finish: boolean = false;

    protected mozoeNaghashiList: string[] = [];
    public naghashi: Map<number, any> = new Map();
    public mozoeNaghashi: string = '';

    protected raieGiriCount: Map<number, number> = new Map(); //[userId]

    protected timeoutId?: NodeJS.Timeout;

    protected chalenger: number = -1;
    protected chalengerTime: boolean = false;
    protected chalengerList: number[] = [];

    public bazporsiUsers: number[] = [];
    protected bazporsiWait: any = {
        bazporsiReceive:10, //10
        start: 20, //20
        end: 0,
        raigiriStart: 12, //12
        raigiriEnd: 0,
        raigiriResponse: 10, //10
    }

    public nobatType: NobatType = NobatType.undefined;
    protected nobatIndex: number = -1;

    protected winner: winnerType = winnerType.undefined;

    public loserUser: any = {};

    public hadseNaghsh: any = {};

    protected isStream: boolean = false;
    protected get streamDoor(): boolean {
        if (!this.door)
            return false;
        if ([RangOrazDoor.d1, RangOrazDoor.d5, RangOrazDoor.d6, RangOrazDoor.d7, RangOrazDoor.d8, RangOrazDoor.d9].indexOf(this.door!) != -1)
            return true;
        return false;
    }

    protected delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    protected getNextStep() {
        const keys = Object.keys(RangOrazDoor).filter(key => isNaN(Number(key)));
        const currentIndex = keys.findIndex(key => RangOrazDoor[key as keyof typeof RangOrazDoor] === this.door);
        if (currentIndex === -1 || currentIndex === keys.length - 1) {
            this.door = undefined;
        }
        const nextKey = keys[currentIndex + 1];
        this.door = RangOrazDoor[nextKey as keyof typeof RangOrazDoor];
    }

    protected setState() {

        if (this.door! == RangOrazDoor.d2) {
            this.state = 'main';
        } else if ([RangOrazDoor.d3, RangOrazDoor.d4].indexOf(this.door!) != -1) {
            this.state = 'paint';
        } else {
            this.state = 'main';
        }

        //if (this.door == RangOrazDoor.d2) {this.wait = 200; return; }
        switch (this.door) {
            case RangOrazDoor.d0:
                this.wait = 12;//12
                return;
            case RangOrazDoor.d1:
            case RangOrazDoor.d2:
                this.wait = 20; //20
                return;
            case RangOrazDoor.d3:
            case RangOrazDoor.d4:
                this.wait = 95; //95
                return;
            default:
                this.wait = this.chalengerTime? 20:30;
                return ;
        }
    }
}
