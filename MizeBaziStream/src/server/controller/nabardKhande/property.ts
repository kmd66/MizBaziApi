import { winnerType2 } from '../../model/gameInterfaces';
import { khandeDb } from './khandeDb';
import * as fs from 'fs';

export enum DoorType {
    d0 = 'در انتظار شروع',
    d1 = 'معارفه',
    d2 = 'خوانندگی',
    d3 = 'وقت‌آزاد',
    d4 = 'سوال‌پیچ',
    d5 = 'وقت‌آزاد',
    d6 = 'لبخونی',
    d7 = 'وقت‌آزاد',
    d8 = 'زبان‌پیچ',
    d9 = 'وقت‌آزاد',
    d10 = 'لبخونی',
    d11 = '---',
}
export class Property {
    constructor(roomId: string) {
        this.roomId = roomId;
        this.addGroups(roomId);
    }

    public roomId!: string;
    public door?: DoorType = DoorType.d0;

    public isAddDisconnec: boolean = false;

    public wait: number = 14;
    public mainWait: number = 5;

    public activeUser1: number = -1;
    public activeUser2: number = -1;

    public state: string = 'main';

    public finish: boolean = false;

    public timeoutId?: NodeJS.Timeout;

    public nobatIndex: number = -1;

    protected winner: winnerType2 = winnerType2.undefined;

    protected isStream: boolean = false;

    public score: Map<number, number[]> = new Map();
    public groups: any[] = [];

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
            case DoorType.d2:
            case DoorType.d3:
            case DoorType.d5:
            case DoorType.d7:
            case DoorType.d9: this.state = 'main'; break;

            case DoorType.d4:
            case DoorType.d8: this.state = 'soalPich'; break;
            case DoorType.d6:
            case DoorType.d10: this.state = 'labKhoni'; break;
        }

        switch (this.door) {
            case DoorType.d0: this.wait = 12; break;

            case DoorType.d1:
            case DoorType.d3:
            case DoorType.d5:
            case DoorType.d7:
            case DoorType.d9: this.wait = 30; break;

            case DoorType.d2:
            case DoorType.d4:
            case DoorType.d6:
            case DoorType.d8:
            case DoorType.d10: this.wait = 60; break;
        }
    }

    private addGroups(roomId: string): void {
        const soalPichRawData = fs.readFileSync('data/tata2.json', 'utf8');
        const soalPichData = JSON.parse(soalPichRawData);
        const zabanPichRawData = fs.readFileSync('data/zabanPich.json', 'utf8');
        const zabanPichData = JSON.parse(zabanPichRawData);
        const shaerRawData = fs.readFileSync('data/data3.json', 'utf8');
        const shaerData = JSON.parse(shaerRawData);
        const masalRawData = fs.readFileSync('data/data4.json', 'utf8');
        const masalData = JSON.parse(masalRawData);

        const room = khandeDb().get(roomId);
        room?.users.map((x: any) => {
            const randomSoalPich = getRandomItems(soalPichData, 3);
            const randomZabanPich = getRandomItems(zabanPichData, 3);
            const randomShaer = getRandomItems(shaerData, 3);
            const randomMasal = getRandomItems(masalData, 3);
            const model = {
                key: x.key,
                type: 'blue',
                soalPich: randomSoalPich,
                zabanPich: randomZabanPich,
                shear: randomShaer,
                masal: randomMasal,
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
}