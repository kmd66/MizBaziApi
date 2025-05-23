﻿import { User } from '../../model/interfaces';
import { mafiaDb } from './mafiaDb';
import { winnerType } from '../../model/gameInterfaces';

export class Property {
    constructor(roomId: string) {
        this.roomId = roomId;
        this.addGroups(roomId);
    }

    public door: number = 0;
    public doorType: number = 1; // 1 roz // 2 ray // 3 shab

    public roomId!: string;

    public isAddDisconnec: boolean = false;

    public wait: number = 12;
    public mainWait: number = 3;
    public get nightWait(): number {
        if (this.door == 1)
            return 15;
        else return 50;
    }
    public activeUser: number = -1;
    public state: string = 'main';

    public defae: Map<number, number[]> = new Map();
    public rayeKhoroj: Map<number, number[]> = new Map();
    public rayeChaos: Map<number, number> = new Map();
    public isChaos: boolean = false;

    public finish: boolean = false;

    public timeoutId?: NodeJS.Timeout;

    public chalenger: number = -1;
    public chalengerTime: boolean = false;
    public chalengerList: number[] = [];

    public nobatIndex: number = -1;

    protected winner: winnerType = winnerType.undefined;

    protected isStream: boolean = false;
    public khorojId: number = 0;
    public isUserAction: boolean = false;

    public groups: any[] = [];

    public nightEvents: any[] = [];

    public isEstelam: boolean = false;
    public estelam: number = 2;
    public estelamList: number[] = [];

    protected get streamDoor(): boolean {
        return true;
    }

    protected delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    protected getNextStep() {
        this.door = this.door + 1;
    }

    public setState() {
        this.state = 'main';

        if (this.chalengerTime)
            this.wait = 20;
        else if (this.activeUser)
            this.wait = 30;
        else
            this.wait = 12;
    }

    private addGroups(roomId: string): void {
        const room = mafiaDb().get(roomId);

        room?.users.map((x: User) => {
            const model = {
                key: x.key,
                type: 'shahr',
                gun: false,
                hadseNaghsh: false,
                shot: false
            };

            if (x.type > 20) {
                model.type = 'mafia';
                model.hadseNaghsh = true;
            }
            else if ([9, 7, 6].indexOf(x.type) > -1) {
                model.shot = true;
            }

            this.groups.push(model);
        });
    }

    public groupItem(key: string): any {
        return  this.groups.find(x => x.key == key);
    }
}

