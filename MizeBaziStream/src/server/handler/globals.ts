import { v4 as uuidv4 } from 'uuid';
import { RoomUsers } from './interfaces';
import Database from 'better-sqlite3';
import { Database as DatabaseType } from 'better-sqlite3'

export class GlobalsDb {
    private static _instance: GlobalsDb
    public db = new Database(':memory:');

    private constructor() {
        this.createRoom();
    }

    private createRoom(): void {
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS rooms (
            id TEXT PRIMARY KEY,
            json TEXT
          )
        `);
    }

    public static getInstance(): GlobalsDb {
        if (!GlobalsDb._instance) {
            GlobalsDb._instance = (global as any).__GLOBALS_INSTANCE || new GlobalsDb();
            (global as any).__GLOBALS_INSTANCE = GlobalsDb._instance
        }
        return GlobalsDb._instance
    }

    public getRoomDb(): RoomDb{
        return RoomDb.getInstance();
    }

}

export default GlobalsDb.getInstance();

class RoomDb {
    private static _instance: RoomDb
    private db: DatabaseType;

    private constructor() {
        this.db = GlobalsDb.getInstance().db;
    }

    public static getInstance(): RoomDb {
        if (!RoomDb._instance) {
            RoomDb._instance = (global as any).__ROOMDB_INSTANCE || new RoomDb();
            (global as any).__ROOMDB_INSTANCE = RoomDb._instance
        }
        return RoomDb._instance
    }

    public addRoom(room: RoomUsers): RoomUsers {
        const newRoom: RoomUsers = {
            ...room,
            id: uuidv4(),
            createdAt: new Date(),
        }

        const json = JSON.stringify(newRoom)

        const stmt = this.db.prepare('INSERT INTO rooms (id, json) VALUES (?, ?)')
        stmt.run(newRoom.id, json)

        return newRoom
    }

    public getRoomById(id: string): RoomUsers | null {
        //const stmt = db.prepare<User[]>('SELECT * FROM users')
        const stmt = this.db.prepare('SELECT json FROM rooms WHERE id = ?')
        const row = stmt.get(id) as { json: string } | undefined
        return row ? JSON.parse(row.json) : null
    }

    public getRoomCount(): number {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM rooms');
        const row = stmt.get() as { count: number };
        return row.count;
    }

    public clear(): void {
        const stmt = this.db.prepare('DELETE FROM rooms')
        stmt.run()
    }
}



