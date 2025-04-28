import { Server, Namespace, Socket } from 'socket.io';
import { RangOrazMethod } from '../controller/rangOraz/rangOrazMethod';
import { AfsonMethod } from '../controller/afsonVajeh/method';
import { KandeMethod } from '../controller/nabardKhande/method';
import { MafiaMethod } from '../controller/mafia/method';

type SocketHandler = (socket: Socket) => void;
type CustomSocketHandler = (...args: any[]) => void;
type NamespaceHandlers = {
    emit: Record<string, SocketHandler>;
    handler: Record<string, SocketHandler>;
    customHandler: Record<string, CustomSocketHandler>;
    streamHandler: Record<string, CustomSocketHandler>;
};
class SocketManager {
    private io?: Server;
    private pId?: number;
    private static instance: SocketManager;
    private namespaces: Map<string, Namespace> = new Map();
    private handlers: Map<string, NamespaceHandlers> = new Map();


    public static Instance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }
    public static Init(io?: Server, pId?: number): void {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        SocketManager.instance.io = io;
        SocketManager.instance.pId = pId;
        SocketManager.instance.registerNamespace();
    }

    private registerNamespace(): void {
        if (!this.namespaces.has('hubRangOraz')) {
            this.handlers.set('hubRangOraz', RangOrazMethod());
            this.setupNamespace(this.getNamespace('hubRangOraz'));
        }
        if (!this.namespaces.has('hubAfsonVajeh')) {
            this.handlers.set('hubAfsonVajeh', AfsonMethod());
            this.setupNamespace(this.getNamespace('hubAfsonVajeh'));
        }
        if (!this.namespaces.has('hubMafia')) {
            this.handlers.set('hubMafia', MafiaMethod());
            this.setupNamespace(this.getNamespace('hubMafia'));
        }
        if (!this.namespaces.has('hubNabardKhande')) {
            this.handlers.set('hubNabardKhande', KandeMethod());
            this.setupNamespace(this.getNamespace('hubNabardKhande'));
        }
    }

    public getNamespace(name: string): Namespace {
        if (!this.namespaces.has(name)) {
            const namespace = this.io!.of(`/${name}`);
            this.namespaces.set(name, namespace);
        }
        return this.namespaces.get(name)!;
    }

    private setupNamespace(namespace: Namespace): void {
        const namespaceName = namespace.name.replace('/', '');
        const handlers = this.handlers.get(namespaceName);
        
        if (!handlers) return;

        namespace.on('connection', (socket: Socket) => {
            //(`New client connected to ${namespaceName}: ${socket.id}`);

            // هندلر connection عمومی
            for (const [eventName, handler] of Object.entries(handlers.emit)) {
                handler(socket);
            }
            // هندلر connection عمومی
            for (const [eventName, handler] of Object.entries(handlers.handler)) {
                socket.on(eventName, () => handler(socket));
            }

            // ثبت هندلرهای اختصاصی
            for (const [eventName, handler] of Object.entries(handlers.customHandler)) {
                socket.on(eventName, (...args) => handler(...args));
            }

            // ثبت هندلرهای استریم
            for (const [eventName, handler] of Object.entries(handlers.streamHandler)) {
                socket.on(eventName, (...args) => handler(...args));
            }
        });
    }
    public disconnectSocket(namespaceName: string, socketId: string, msg: string): boolean {
        const namespace = this.getNamespace(namespaceName);
        const socket = namespace.sockets.get(socketId);
        if (socket) {
            socket.emit('disconnectReceive', msg);
            setTimeout(() => {
                socket.disconnect(true);
            }, 100);
            return true;
        }
        return false;
    }
    public sendToSocket(namespaceName: string, eventName: string, connectionId: any, message: any): void {
        if (eventName && connectionId) {
            const namespace = this.getNamespace(namespaceName);
            const socket = namespace.sockets.get(connectionId);
            if (socket && socket.connected) {
                socket.emit(eventName, message);
            }
        }
    }
    public sendToMultipleSockets(namespaceName: string, eventName: string, connectionIds: any[], message: any): void {
        if (eventName && connectionIds && connectionIds.length > 0) {
            const namespace = this.getNamespace(namespaceName);
            connectionIds!.forEach(connectionId => {
                if (connectionId) {
                    const socket = namespace.sockets.get(connectionId);
                    if (socket && socket.connected) {
                        socket.emit(eventName, message);
                    }
                }
            });
        }
    }
    public async sendToMultipleSockets2(namespaceName: string, eventName: string, connectionIds: string[], message: any,
        options?: { safeMode?: boolean; batchSize?: number }): Promise<void> {
        //SocketManager.sendToMultipleSockets('myNamespace', 'newMessage', ['id1', 'id2', 'id3'], { text: 'hello' }, { safeMode: true, batchSize: 50 });
        if (!eventName || !connectionIds || connectionIds.length === 0) return;

        const namespace = this.getNamespace(namespaceName);
        const safeMode = options?.safeMode ?? false;
        const batchSize = options?.batchSize ?? 100; // پیشفرض ۱۰۰تا ۱۰۰تا در حالت safe

        if (!safeMode) {
            // حالت عادی، سریع، بدون صف بندی
            connectionIds.forEach(connectionId => {
                if (!connectionId) return;
                const socket = namespace.sockets.get(connectionId);
                if (socket && socket.connected) {
                    socket.emit(eventName, message);
                }
            });
        } else {
            // حالت ایمن، با صف بندی و کنترل شده
            for (let i = 0; i < connectionIds.length; i += batchSize) {
                const batch = connectionIds.slice(i, i + batchSize);

                await Promise.all(batch.map(async (connectionId) => {
                    if (!connectionId) return;
                    const socket = namespace.sockets.get(connectionId);
                    if (socket && socket.connected) {
                        return new Promise<void>((resolve) => {
                            socket.emit(eventName, message, () => {
                                resolve();
                            });
                        });
                    }
                }));
                
                await this.sleep(10);
            }
        }
    }
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}
export default SocketManager.Instance();
export const SocketInit = SocketManager.Init;