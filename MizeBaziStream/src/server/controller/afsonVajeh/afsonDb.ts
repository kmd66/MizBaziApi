import { v4 as uuidv4 } from 'uuid';
import { RoomAfson } from '../../model/interfaces';
import { GameType } from '../../model/gameInterfaces';
import { globalDb } from '../../handler/globalDb';
import { afsonStart, afsonStartAll } from './extensions';
import Loki from 'lokijs';

class AfsonDb {
    private static _instance: AfsonDb
    public db: Loki;
    public rooms: Loki.Collection<RoomAfson>;

    private constructor() {
        let port = globalDb().port;
        //اصلاح
        // حذف ذخیره خودکار 
        this.db = new Loki(`AfsonDb${port}.db`, {
            autoload: true,
            autoloadCallback: this.initializeDatabase.bind(this),
            autosave: true,
            autosaveInterval: 1000
        });
        this.rooms = this.db.addCollection<RoomAfson>('rooms', {});
    }

    private initializeDatabase(): void {
        this.rooms.clear();
        var c = this.db.getCollection('rooms');
        if (c) {
            this.rooms = this.db.addCollection<RoomAfson>('rooms', {});
        }
        else {
            this.rooms = c;
        }

        const ids = this.rooms.find().map(doc => doc.id);
        //اصلاح . حذف 
        globalDb().addAll(ids, GameType.afsonVajeh);
        afsonStartAll(ids);
    }

    public static Instance(): AfsonDb {
        if (!AfsonDb._instance) {
            AfsonDb._instance = new AfsonDb();
        }
        return AfsonDb._instance
    }

    public add(room: Omit<RoomAfson, 'id' | 'createdAt'>): RoomAfson {
        const newRoom = {
            ...room,
            id: uuidv4(),
            createdAt: new Date(),
        };
        globalDb().add(newRoom.id, GameType.afsonVajeh);
        this.rooms.insert(newRoom);
        afsonStart(newRoom.id);
        return newRoom
    }

    public get(id: string): RoomAfson | null {
        return this.rooms.findOne({ id });
    }

    public getCount(): number {
        return this.rooms.count();
    }

    public update(id: string, updatedRoom: RoomAfson): boolean {
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

export const afsonDb = AfsonDb.Instance;
