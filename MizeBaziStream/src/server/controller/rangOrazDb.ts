import { v4 as uuidv4 } from 'uuid';
import { RoomRangOraz } from '../model/interfaces';
import { GameType } from '../model/gameInterfaces';
import { globalDb } from '../handler/globalDb';
import { rangOrazStart, rangOrazStartAll } from './RangOrazExtensions';
import Loki from 'lokijs';

class RangOrazDb {
    private static _instance: RangOrazDb
    public db: Loki;
    public rooms: Loki.Collection<RoomRangOraz>;

    private constructor() {
        let port = globalDb().port;
        //اصلاح
        // حذف ذخیره خودکار 
        this.db = new Loki(`RangOrazDb${port}.db`, {
            autoload: true,
            autoloadCallback: this.initializeDatabase.bind(this),
            autosave: true,
            autosaveInterval: 1000
        });
        this.rooms = this.db.addCollection<RoomRangOraz>('rooms', {});
    }

    private initializeDatabase(): void {
        this.rooms.clear();
        var c = this.db.getCollection('rooms');
        if (c) {
            this.rooms = this.db.addCollection<RoomRangOraz>('rooms', {});
        }
        else {
            this.rooms = c;
        }

        const ids = this.rooms.find().map(doc => doc.id);
        //اصلاح . حذف 
        globalDb().addAll(ids, GameType.rangOraz);
        rangOrazStartAll(ids);
    }

    public static Instance(): RangOrazDb {
        if (!RangOrazDb._instance) {
            RangOrazDb._instance = new RangOrazDb();
        }
        return RangOrazDb._instance
    }

    public add(room: Omit<RoomRangOraz, 'id' | 'createdAt'>): RoomRangOraz {
        const newRoom = {
            ...room,
            id: uuidv4(),
            createdAt: new Date(),
        };
        globalDb().add(newRoom.id, GameType.rangOraz);
        this.rooms.insert(newRoom);
        console.log(`----------newRoom.id ${newRoom.id}`)
        rangOrazStart(newRoom.id);
        return newRoom
    }

    public get(id: string): RoomRangOraz | null {
        return this.rooms.findOne({ id });
    }

    public getCount(): number {
        return this.rooms.count();
    }

    public update(id: string, updatedRoom: RoomRangOraz): boolean {
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

export const rangOrazDb = RangOrazDb.Instance;
