import { v4 as uuidv4 } from 'uuid';
import { RoomKhande } from '../../model/interfaces';
import { GameType } from '../../model/gameInterfaces';
import { globalDb } from '../../handler/globalDb';
import { khandeStart, khandeStartAll } from './extensions';
import Loki from 'lokijs';

class KhandeDb {
    private static _instance: KhandeDb
    public db: Loki;
    public rooms: Loki.Collection<RoomKhande>;

    private constructor() {
        let port = globalDb().port;
        //اصلاح
        // حذف ذخیره خودکار 
        this.db = new Loki(`KhandeDb${port}.db`, {
            autoload: true,
            autoloadCallback: this.initializeDatabase.bind(this),
            autosave: true,
            autosaveInterval: 1000
        });
        this.rooms = this.db.addCollection<RoomKhande>('rooms', {});
    }

    private initializeDatabase(): void {
        this.rooms.clear();
        var c = this.db.getCollection('rooms');
        if (c) {
            this.rooms = this.db.addCollection<RoomKhande>('rooms', {});
        }
        else {
            this.rooms = c;
        }

        const ids = this.rooms.find().map(doc => doc.id);
        //اصلاح . حذف 
        globalDb().addAll(ids, GameType.nabardKhande);
        khandeStartAll(ids);
    }

    public static Instance(): KhandeDb {
        if (!KhandeDb._instance) {
            KhandeDb._instance = new KhandeDb();
        }
        return KhandeDb._instance
    }

    public add(room: Omit<RoomKhande, 'id' | 'createdAt'>): RoomKhande {
        const newRoom = {
            ...room,
            id: uuidv4(),
            createdAt: new Date(),
        };
        globalDb().add(newRoom.id, GameType.nabardKhande);
        this.rooms.insert(newRoom);
        khandeStart(newRoom.id);
        return newRoom
    }

    public get(id: string): RoomKhande | null {
        return this.rooms.findOne({ id });
    }

    public getCount(): number {
        return this.rooms.count();
    }

    public update(id: string, updatedRoom: RoomKhande): boolean {
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

export const khandeDb = KhandeDb.Instance;
