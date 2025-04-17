import { v4 as uuidv4 } from 'uuid';
import { RoomRangOraz, User, RangOrazDoor } from './interfaces';
import { GameType, userInGameStatusType } from './gameInterfaces';
import { globalDb } from './globalDb';
import Loki from 'lokijs';

class UserInDb {
    private static instance: UserInDb;
    constructor() { }

    public static Instance(): UserInDb {
        if (!UserInDb.instance) {
            UserInDb.instance = new UserInDb();
        }
        return UserInDb.instance;
    }

    public get(roomId: string, userKey: string): User | undefined {
        const room = globalDb().getRoom(roomId);
        return room?.users.find((user: User) => user.key == userKey && user.userInGameStatus != userInGameStatusType.ekhraj);
    }
    public getByConnectionId(roomId: string, connectionId: string): User | undefined {
        const room = globalDb().getRoom(roomId);
        return room?.users.find((user: User) => user.connectionId == connectionId && user.userInGameStatus != userInGameStatusType.ekhraj);
    }
    public getAll(roomId: string, filterFn?: (user: User) => boolean): User[] | undefined {
        const room = globalDb().getRoom(roomId);
        if (!room || !room?.users) return undefined;

        return filterFn ? room.users.filter(filterFn) : room.users;
    }
    public getUselFaal(roomId: string): User[] | undefined {
        const room = globalDb().getRoom(roomId);
        if (!room || !room?.users) return undefined;

        return room.users.filter((user: User) => user.userInGameStatus === userInGameStatusType.faal || user.userInGameStatus === userInGameStatusType.koshte);
    }

    public update(roomId: string, updates: Partial<User>): boolean {
        const db = globalDb().getDbByid(roomId);
        if (!db) return false;

        var room = db.get(roomId);
        const userIndex = room.users.findIndex((user: User) => user.key == updates.key);

        if (userIndex === -1) return false;

        room.users[userIndex] = { ...room.users[userIndex], ...updates };
        return db.update(roomId, room );
    }
}
export const userInDb = UserInDb.Instance;

class RangOrazDb {
    private static _instance: RangOrazDb
    public users: UserInDb;
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
        this.users = new UserInDb();
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
        globalDb().addAll(ids, GameType.rangOraz);
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
            isShowOstad: false,
            door: RangOrazDoor.d0,
            wait: new Date(Date.now() + 10000),
            user:0
        };
        globalDb().add(newRoom.id, GameType.rangOraz);
        this.rooms.insert(newRoom);
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

class RoomTimer {
    private timers: Map<string, NodeJS.Timeout> = new Map();

    start(roomId: string) {
        this.stop(roomId);

        const intervalId = setInterval(() => {
            console.log(`Processing room ${roomId}`);
            // منطق کسب و کار...
        }, 10000);

        this.timers.set(roomId, intervalId);
    }

    stop(roomId: string) {
        const timer = this.timers.get(roomId);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(roomId);
        }
    }
}