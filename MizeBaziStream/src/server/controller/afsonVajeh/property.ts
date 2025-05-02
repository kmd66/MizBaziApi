import { User } from '../../model/interfaces';
import { afsonDb } from './afsonDb';
import { winnerType } from '../../model/gameInterfaces';
import * as fs from 'fs';

export class Property {
    constructor(roomId: string) {
        this.roomId = roomId;
        this.addGroups(roomId);
    }

    public door: number = 0;

    public roomId!: string;

    public isAddDisconnec: boolean = false;

    public wait: number = 12;
    public mainWait: number = 3;
    public activeUser: number = -1;
    public isChalesh: boolean = false;
    public isSticker: boolean = false;
    public state: string = 'main';

    public finish: boolean = false;

    protected timeoutId?: NodeJS.Timeout;

    protected chalenger: number = -1;
    protected chalengerTime: boolean = false;
    protected chalengerList: number[] = [];

    protected nobatIndex: number = -1;

    protected winner: winnerType = winnerType.undefined;

    protected isStream: boolean = false;
    protected isUserAction: boolean = false;

    public groups: any[] = [];

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

    private addGroups(roomId: string): void {
        const secrets: string[] = this.readFile();
        const room = afsonDb().get(roomId);

        room?.users.map((x: User) => {
            const model = {
                key: x.key,
                type: 'neutral',
                gun: false,
                talk: true,
                secret: ''
            };

            if ([1, 2, 3].indexOf(x.type) > -1) {
                model.type = 'blue';
                model.gun = true;
                model.secret = secrets[0];
            }
            else if ([11, 12, 13].indexOf(x.type) > -1) {
                model.type = 'red';
                model.gun = true;
                model.secret = secrets[1];
            }

            this.groups.push(model);
        });
    }

    private readFile(): string[] {
        function getRandomItems(arr: string[]): string[] {
            const result: string[] = [];
            const clonedArr = [...arr];

            const randomIndex = Math.floor(Math.random() * clonedArr.length);
            result.push(clonedArr[randomIndex]);
            clonedArr.splice(randomIndex, 1);

            const randomNumber = Math.floor(Math.random() * 12) + 1;
            let randomIndex2 = randomIndex + randomNumber
            if (randomIndex2 > clonedArr.length - 2)
                randomIndex2 = randomNumber - 1;
            result.push(clonedArr[randomIndex2]);
            return result;
        }

        const rawData = fs.readFileSync('data/kalameRamz.json', 'utf8');
        const data = JSON.parse(rawData);

        const randomItems = getRandomItems(data);
        return randomItems;
    }

    public groupItem(key: string): any {
        return  this.groups.find(x => x.key == key);
    }
}

