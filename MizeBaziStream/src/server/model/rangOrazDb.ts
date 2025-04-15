import { v4 as uuidv4 } from 'uuid';
import { RoomUsers, RoomRangOraz, User } from './interfaces';
import { GameType, userInGameStatusType } from './gameInterfaces';
import GlobalsDb from './globalDb';

class UserInDb {
    private static instance: UserInDb;
    constructor() { }

    public static getInstance(): UserInDb {
        if (!UserInDb.instance) {
            UserInDb.instance = new UserInDb();
        }
        return UserInDb.instance;
    }

    public get(roomId: string, userId: string): User | undefined {
        const room = GlobalsDb.getRoom(roomId);
        return room?.users.find((user: User) => user.key == userId);
    }

    public update(roomId: string, updates: Partial<User>): boolean {
        const room = GlobalsDb.getRoom(roomId);
        if (!room) return false;
        const userIndex = room.users.findIndex((user: User) => user.key == updates.key);

        if (userIndex === -1) return false;

        room.users[userIndex] = { ...room.users[userIndex], ...updates };
        return true;
    }
}
export const userInDb = UserInDb.getInstance();

class RangOrazDb {
    private static _instance: RangOrazDb
    private db: Map<string, RoomRangOraz>;
    public users: UserInDb;

    constructor() {
        this.db = new Map<string, RoomRangOraz>();
        this.users = new UserInDb();
    }

    public static getInstance(): RangOrazDb {
        if (!RangOrazDb._instance) {
            RangOrazDb._instance = (global as any).__RangOrazDb_INSTANCE || new RangOrazDb();
            (global as any).__RangOrazDb_INSTANCE = RangOrazDb._instance
        }
        return RangOrazDb._instance
    }

    public add(room: RoomUsers): RoomRangOraz {
        const newRoom: RoomRangOraz = {
            ...room,
            id: uuidv4(),
            createdAt: new Date(),
        }
        this.db.set(newRoom.id, newRoom);
        GlobalsDb.add(newRoom.id, GameType.rangOraz);
        return newRoom
    }

    public get(id: string): RoomRangOraz | undefined {
        return this.db.get(id);
    }

    public getCount(): number {
        return this.db.size;
    }

    public update(key: string, newValue: RoomRangOraz): boolean {
        if (this.db.has(key)) {
            this.db.set(key, newValue);
            return true;
        }
        return false;
    }

    public keys(): IterableIterator<string> {
        return this.db.keys();
    }

    public has(key: string): boolean {
        return this.db.has(key);
    }

    public delete(id: string): void {
        this.db.delete(id);
        GlobalsDb.delete(id);
    }

    public clear(): void {
        this.db.clear();
    }
}

export const rangOrazDb = RangOrazDb.getInstance();



