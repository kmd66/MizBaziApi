import { Server, Namespace, Socket } from 'socket.io';
import {RangOrazMethod} from './rangOraz';
import { pid } from 'process';

type SocketHandler = (socket: Socket) => void;
type CustomSocketHandler = (socket: Socket, ...args: any[]) => void;
type NamespaceHandlers = {
    emit: Record<string, SocketHandler>;
    handler: Record<string, SocketHandler>;
    customHandler: Record<string, CustomSocketHandler>;
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
            //console.log(`New client connected to ${namespaceName}: ${socket.id}`);

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
                socket.on(eventName, (...args) => handler(socket, ...args));
            }
        });
    }
    public disconnectSocket(namespaceName: string, socketId: string): boolean {
        const namespace = this.getNamespace(namespaceName);
        const socket = namespace.sockets.get(socketId);
        if (socket) {
            socket.disconnect(true);
            return true;
        }
        return false;
    }

}
export default SocketManager.Instance();
export const SocketInit = SocketManager.Init;