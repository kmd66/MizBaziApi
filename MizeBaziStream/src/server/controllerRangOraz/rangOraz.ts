import { Socket } from 'socket.io';
import { rangOrazDb, userInDb } from './rangOrazDb';
import SocketManager from '../handler/socket';
import { userInGameStatusType } from '../model/gameInterfaces';
import { User} from '../model/interfaces';
import { RangOrazControll } from './extensions';

function connectionReceive(roomId: string, userKey: string, connectionId: string): void {
    var _userInDb = userInDb();
    const user = _userInDb.get(roomId, userKey);
    if (user) {
        const userConnectionId = user.connectionId;

        user.connectionId = connectionId;
        user.userInGameStatus = userInGameStatusType.faal;
        user.lastConnectAt = new Date();
        _userInDb.update(roomId, user);

        if (userConnectionId) {
            SocketManager.disconnectSocket('hubRangOraz', userConnectionId, 'home');
        }
        roomReceive(roomId, connectionId);
        usersReceive(roomId, userKey, connectionId);
        RangOrazControll.statusReceive(roomId);
        return;
    }

    SocketManager.disconnectSocket('hubRangOraz', connectionId, 'home');
}
function disconnect(roomId: string, connectionId: string): boolean {
    var _userInDb = userInDb();
    const user = _userInDb.getByConnectionId(roomId, connectionId);
    if (user) {
        user.userInGameStatus = userInGameStatusType.ofline;
        _userInDb.update(roomId, user);
        RangOrazControll.statusReceive(roomId);
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
