import { winnerType2 } from '../../model/gameInterfaces';
import { khandeDb } from './khandeDb';
import * as fs from 'fs';

export enum DoorType {
    d0 = 'در انتظار شروع',
    d1 = 'معارفه',
    d2 = 'سوال‌پیچ 1',
    d3 = 'وقت‌آزاد 1',
    d4 = 'سوال‌پیچ 2',
    d5 = 'وقت‌آزاد 2',
    d6 = 'لبخونی 1',
    d7 = 'وقت‌آزاد 3',
    d8 = 'سوال‌پیچ 3',
    d9 = 'وقت‌آزاد 4',
    d10 = 'لبخونی 2',
    d11 = 'وقت‌آزاد 5',
    d12 = '---',
}
export class Property {
    constructor(roomId: string) {
        this.roomId = roomId;
        this.addGroups(roomId);
    }

    public roomId!: string;
    public door?: DoorType = DoorType.d0;

    public isAddDisconnec: boolean = false;
    public isUserAction: boolean = false;

    public wait: number = 14;
    public mainWait: number = 2;

    public activeUser1: number = -1;
    public activeUser2: number = -1;

    public state: string = 'main';

    public finish: boolean = false;

    public timeoutId?: NodeJS.Timeout;

    public nobatIndex: number = -1;

    protected winner: winnerType2 = winnerType2.undefined;

    protected isStream: boolean = false;

    public score: Map<string, number[]> = new Map();
    public smileReng: number = 80;
    public smile: Map<string, number> = new Map();
    public groups: any[] = [];

    protected soal: string = '';
    protected soal2: string = '';
    protected isSoal: boolean = false;
    protected get streamDoor(): boolean {
        return true;
    }

    protected delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected getNextStep() {
        const keys = Object.keys(DoorType).filter(key => isNaN(Number(key)));
        const currentIndex = keys.findIndex(key => DoorType[key as keyof typeof DoorType] === this.door);
        if (currentIndex === -1 || currentIndex === keys.length - 1) {
            this.door = undefined;
        }
        const nextKey = keys[currentIndex + 1];
        this.door = DoorType[nextKey as keyof typeof DoorType];
        this.setState();
    }

    public setState() {
        switch (this.door) {
            case DoorType.d0:
            case DoorType.d1:
            case DoorType.d3:
            case DoorType.d5:
            case DoorType.d7:
            case DoorType.d9:
            case DoorType.d11: this.state = 'main'; break;

            case DoorType.d2:
            case DoorType.d4:
            case DoorType.d8:this.state = 'soalPich'; break;

            case DoorType.d6:
            case DoorType.d10: this.state = 'labKhoni'; break;
        }
        if (this.door == DoorType.d0)
            this.wait = 12;
        else if (this.state == 'main')
            this.wait = 2;
        else if (this.state == 'soalPich')
            this.wait = 20;
        else if (this.state == 'labKhoni')
            this.wait = 20;
        else
            this.wait = 12;
    }

    private addGroups(roomId: string): void {
        const soalPichRawData = fs.readFileSync('data/data2.json', 'utf8');
        const soalPichData = JSON.parse(soalPichRawData);
        //const zabanPichRawData = fs.readFileSync('data/zabanPich.json', 'utf8');
        //const zabanPichData = JSON.parse(zabanPichRawData);
        const shaerRawData = fs.readFileSync('data/data3.json', 'utf8');
        const shaerData = JSON.parse(shaerRawData);
        const masalRawData = fs.readFileSync('data/data4.json', 'utf8');
        const masalData = JSON.parse(masalRawData);

        const room = khandeDb().get(roomId);
        room?.users.map((x: any) => {
            const randomSoalPich = getRandomItems(soalPichData, 5);
            const randomShaer = getRandomItems(shaerData, 1);
            const randomMasal = getRandomItems(masalData, 1);
            const model = {
                key: x.key,
                index: x.index,
                type: 'blue',
                soalPich1: randomSoalPich[0],
                soalPich2: randomSoalPich[1],
                soalPich3: randomSoalPich[2],
                shaer: randomShaer[0],
                masal: randomMasal[0],
            };

            if (x.type > 20) {
                model.type = 'red';
            }
            else if (x.type > 10) {
                model.type = 'green';
            }

            this.groups.push(model);
        });


        function getRandomItems(arr: string[], n: number = 2): string[] {
            const result: string[] = [];
            const clonedArr = [...arr];

            for (let i = 0; i < n && clonedArr.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * clonedArr.length);
                result.push(clonedArr[randomIndex]);
                clonedArr.splice(randomIndex, 1);
            }
            return result;
        }

    }

    public groupItem(key: string): any {
        return this.groups.find(x => x.key == key);
    }

    public getPartnerKey(key: string | undefined): any {
        if (!key) return undefined;
        const item = this.groups.find(x => x.key == key);
        const partner = this.groups.find(x => x.type == item.type && x.key != key);
        return partner.key;
    }

    public soalReplace(text: string | undefined): string {
        if (!text) return '';
        text = text.replace(/[\u200c ]/g, "");
        return text;
    }
}