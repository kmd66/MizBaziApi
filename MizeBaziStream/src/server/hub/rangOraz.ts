﻿import { Socket } from 'socket.io';
import { rangOrazDb, userInDb } from '../model/rangOrazDb';
import SocketManager from './socket';
import { userInGameStatusType } from '../model/gameInterfaces';
import { User } from '../model/interfaces';
import { SafeUserModelRangoRaz, userStatus } from '../handler/extensions';
interface ChatMessage {
    username: string;
    message: string;
}

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

        const connectionIdsUsers: User[] | undefined = userInDb().getUselFaal(socket.handshake.auth.roomId);
        const connectionIds = connectionIdsUsers?.map(user => user.connectionId).filter(Boolean) || [];
        SocketManager.sendToMultipleSockets('hubRangOraz', 'userStatusReceive', connectionIds, userStatus(user))

        const users: User[] | undefined = userInDb().getAll(socket.handshake.auth.roomId);
        const room = rangOrazDb().get(roomId);
        socket.emit('usersReceive', SafeUserModelRangoRaz(room!.isShowOstad, users));
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
        const users: User[] | undefined = userInDb().getUselFaal(roomId);
        const connectionIds = users?.map(user => user.connectionId) || [];
        SocketManager.sendToMultipleSockets('hubRangOraz', 'userStatusReceive', connectionIds, userStatus(user));
        return true;
    }
    return false;

    //const lastConnectDate = user.lastDisConnectAt ? new Date(user.lastDisConnectAt) : new Date();
    //const newDate = new Date();
    //user.oflineSecond += (newDate.getTime() - lastConnectDate.getTime()) / 1000;
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

            'exitRoom': (socket: Socket, msg: ChatMessage) => {
                socket.emit('exitRoomReceive', {
                    ...msg,
                    timestamp: new Date()

                });
            }
        }
    };
}
