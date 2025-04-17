import { GameType } from '../model/gameInterfaces';
import { rangOrazDb } from '../controllerRangOraz/rangOrazDb';

export class GlobalsDb {
    public port: string;
    private static _instance: GlobalsDb;
    private db: Map<string, GameType>;

    private constructor(port: string) {
        this.port = port;
        this.db = new Map<string, GameType>();
    }

    public static Instance(port?: string): GlobalsDb {
        if (!GlobalsDb._instance && port) {
            GlobalsDb._instance = new GlobalsDb(port);
            rangOrazDb()
        }
        return GlobalsDb._instance
    }

    public getDb(type: GameType): any {
        if (type == GameType.rangOraz)
            return rangOrazDb();

        return null;
    }
    public getDbByid(id: string): any {
        var item = this.db.get(id);
        if (item) 
            return this.getDb(item);

        return null;
    }

    public getRoom(id: string): any {
        var item = this.db.get(id);
        if (item != undefined) {
            const _db = this.getDb(item);
            return _db.get(id);
        }
        return null;
    }

    public add(id: string, type: GameType): void {
        this.db.set(id, type);
    }
    public addAll(ids: string[], type: GameType): void {
        for (const id of ids) {
            this.db.set(id, type);
        }
    }
    public delete(id: string): void {
        this.db.delete(id);
    }

    public clear(): void {
        this.db.clear();
        rangOrazDb().clear();
    }

}

export const globalDb = GlobalsDb.Instance;
//export default GlobalsDb.Instance();



