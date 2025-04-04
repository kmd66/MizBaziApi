class Globals {
    private static _instance: Globals;

    public static getInstance(): Globals {
        if (!Globals._instance) {
            Globals._instance = (global as any).__GLOBALS_INSTANCE || new Globals();
            (global as any).__GLOBALS_INSTANCE = Globals._instance;
        }
        return Globals._instance;
    }


    public listRoom: any[];

    private constructor() {
        this.listRoom = [];
    }
}

export default Globals.getInstance();

