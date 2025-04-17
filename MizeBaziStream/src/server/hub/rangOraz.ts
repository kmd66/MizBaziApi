import { Socket } from 'socket.io';
import { rangOrazDb, userInDb } from '../model/rangOrazDb';
import SocketManager from './socket';
import { userInGameStatusType } from '../model/gameInterfaces';
import { User} from '../model/interfaces';
import { RangOrazControll } from '../handler/extensions';

function connectionReceive(roomId: string, userKey: string, connectionId: string): void {

    const namespace = SocketManager.getNamespace('hubRangOraz');
    const socket = namespace.sockets.get(connectionId);
    if (!socket) return;

    var _userInDb = userInDb();
    const user = _userInDb.get(roomId, userKey);
    if (user) {
        const userConnectionId = user.connectionId;

        user.connectionId = connectionId;
        user.userInGameStatus = userInGameStatusType.faal;
        user.lastConnectAt = new Date();
        _userInDb.update(roomId, user);

        if (userConnectionId) {
            const socket2 = namespace.sockets.get(userConnectionId);
            socket2?.disconnect(true);
        }
        roomReceive(roomId, connectionId);
        usersReceive(roomId, userKey, connectionId);
        statusReceive(roomId);
        return;
    }

    socket.disconnect(true);
}
function disconnect(roomId: string, connectionId: string): boolean {
    var _userInDb = userInDb();
    const user = _userInDb.getByConnectionId(roomId, connectionId);
    if (user) {
        user.userInGameStatus = userInGameStatusType.ofline;
        _userInDb.update(roomId, user);
        statusReceive(roomId);
        return true;
    }
    return false;

    //const lastConnectDate = user.lastDisConnectAt ? new Date(user.lastDisConnectAt) : new Date();
    //const newDate = new Date();
    //user.oflineSecond += (newDate.getTime() - lastConnectDate.getTime()) / 1000;
}
function statusReceive(roomId: string): boolean {
    var _userInDb = userInDb();
    const users = _userInDb.getAll(roomId);
    if (users) {
        const userConnectionId: User[] | undefined = userInDb().getUselFaal(roomId);
        const connectionIds = userConnectionId?.map(user => user.connectionId) || [];
        SocketManager.sendToMultipleSockets(
            'hubRangOraz', 'userStatusReceive',
            connectionIds, RangOrazControll.userStatus(users)
        );
        return true;
    }
    return false;
}
function usersReceive(roomId: string, userKey: string, connectionId: string): boolean {
    var _userInDb = userInDb();
    const users = _userInDb.getAll(roomId);
    if (users) {
        const users: User[] | undefined = userInDb().getAll(roomId);
        const room = rangOrazDb().get(roomId);
        SocketManager.sendToSocket(
            'hubRangOraz', 'usersReceive',
            connectionId, RangOrazControll.SafeUsers(userKey, room!.isShowOstad, users)
        );
        return true;
    }
    return false;
}
function roomReceive(roomId: string, connectionId: string): boolean {
    const room = rangOrazDb().get(roomId);
    if (room) {
        SocketManager.sendToSocket('hubRangOraz', 'roomReceive', connectionId, RangOrazControll.SafeRoom(room));
        return true;
    }
    return false;
}

export function RangOrazMethod() {
    return {
        emit: {
            'connectionReceive': (socket: Socket) => {
                socket.emit('connectionReceive', {
                    socketId: socket.id
                });
                connectionReceive(socket.handshake.auth.roomId, socket.handshake.auth.userKey, socket.id);
            },
        },

        handler: {
            'disconnect': (socket: Socket) => {
                disconnect(socket.handshake.auth.roomId, socket.id)
            },
        },

        customHandler: {
            'message': (socket: Socket, msg: any) => {
                socket.emit('exitRoomReceive', {
                    timestamp: new Date()
                });
            },
        }
    };
}
