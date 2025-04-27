import { v4 as uuidv4 } from 'uuid';
import { RoomMafia } from '../../model/interfaces';
import { GameType } from '../../model/gameInterfaces';
import { globalDb } from '../../handler/globalDb';
import { mafiaStart, mafiaStartAll } from './extensions';
import Loki from 'lokijs';

class MafiaDb {
    private static _instance: MafiaDb
    public db: Loki;
    public rooms: Loki.Collection<RoomMafia>;

    private constructor() {
        let port = globalDb().port;
        //اصلاح
        // حذف ذخیره خودکار 
        this.db = new Loki(`MafiaDb${port}.db`, {
            autoload: true,
            autoloadCallback: this.initializeDatabase.bind(this),
            autosave: true,
            autosaveInterval: 1000
        });
        this.rooms = this.db.addCollection<RoomMafia>('rooms', {});
    }

    private initializeDatabase(): void {
        this.rooms.clear();
        var c = this.db.getCollection('rooms');
        if (c) {
            this.rooms = this.db.addCollection<RoomMafia>('rooms', {});
        }
        else {
            this.rooms = c;
        }

        const ids = this.rooms.find().map(doc => doc.id);
        //اصلاح . حذف 
        globalDb().addAll(ids, GameType.mafia);
        mafiaStartAll(ids);
    }

    public static Instance(): MafiaDb {
        if (!MafiaDb._instance) {
            MafiaDb._instance = new MafiaDb();
        }
        return MafiaDb._instance
    }

    public add(room: Omit<RoomMafia, 'id' | 'createdAt'>): RoomMafia {
        const newRoom = {
            ...room,
            id: uuidv4(),
            createdAt: new Date(),
        };
        globalDb().add(newRoom.id, GameType.mafia);
        this.rooms.insert(newRoom);
        mafiaStart(newRoom.id);
        return newRoom
    }

    public get(id: string): RoomMafia | null {
        return this.rooms.findOne({ id });
    }

    public getCount(): number {
        return this.rooms.count();
    }

    public update(id: string, updatedRoom: RoomMafia): boolean {
        const room = this.rooms.findOne({ id });
        if (!room) return false;

        const newRoom = {
            ...room,
            ...updatedRoom
        };

        this.rooms.update(newRoom);
        return true;
    }

    public delete(id: string): void {
        const room = this.rooms.findOne({ id });
        if (room) {
            this.rooms.remove(room);
        }
    }

    public clear(): void {
        this.rooms.clear();
    }
}

export const mafiaDb = MafiaDb.Instance;
