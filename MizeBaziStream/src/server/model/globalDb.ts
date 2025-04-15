import { GameType } from './gameInterfaces';
import {rangOrazDb} from './rangOrazDb';

export class GlobalsDb {
    private static _instance: GlobalsDb;
    private db: Map<string, GameType>;
    constructor() {
        this.db = new Map<string, GameType>();
    }

    public static Instance(): GlobalsDb {
        if (!GlobalsDb._instance) {
            GlobalsDb._instance = (global as any).__GLOBALS_INSTANCE || new GlobalsDb();
            (global as any).__GLOBALS_INSTANCE = GlobalsDb._instance
        }
        return GlobalsDb._instance
    }

    public getDb(type: GameType): any {
        if (type == GameType.rangOraz)
            return rangOrazDb;

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
    public delete(id: string): void {
        this.db.delete(id);
    }

    public clear(): void {
        this.db.clear();
        rangOrazDb.clear();
    }

}

export default GlobalsDb.Instance();



