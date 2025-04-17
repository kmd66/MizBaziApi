import { User } from '../model/interfaces';
import { userInGameStatusType } from '../model/gameInterfaces';
import { globalDb } from '../handler/globalDb';

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

