import { v4 as uuidv4 } from 'uuid';
import Loki from 'lokijs';
import { RoomUsers } from './interfaces';


class Globals {
    private static _instance: Globals;
    public db: Loki;
    public rooms: Loki.Collection<RoomUsers>;

    private constructor() {
        //اصلاح
        // حذف ذخیره خودکار 
        this.db = new Loki('global.db', {
            autoload: true,
            autoloadCallback: this.initializeDatabase.bind(this),
            autosave: true,
            autosaveInterval: 4000
        });

        this.rooms = this.db.addCollection<RoomUsers>('rooms', {});
    }

    private initializeDatabase(): void {
        this.rooms = this.db.getCollection('rooms');
        if (!this.rooms) {
            this.rooms = this.db.addCollection<RoomUsers>('rooms', {});
        }
    }

    public static getInstance(): Globals {
        if (!Globals._instance) {
            Globals._instance = (global as any).__GLOBALS_INSTANCE || new Globals();
            (global as any).__GLOBALS_INSTANCE = Globals._instance;
        }
        return Globals._instance;
    }

    public addRoom(room: Omit<RoomUsers, 'id' | 'createdAt'>): RoomUsers | undefined {
        const newRoom = {
            ...room,
            id: uuidv4(),
            createdAt: new Date()
        };
        newRoom.createdAt = new Date();
        //newRoom.updatedAt = now;
        //newRoom.expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
        return this.rooms.insert(newRoom);
    }

    public getRoomById(id: string): RoomUsers | null {
        return this.rooms.findOne({ id });
    }

    public clear() {
        this.rooms.clear();
    }
    
}


export default Globals.getInstance();
