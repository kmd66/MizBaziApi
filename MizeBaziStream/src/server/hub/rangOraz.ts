import { Socket } from 'socket.io';
import { rangOrazDb, userInDb } from '../model/rangOrazDb';
import SocketManager from './socket';
interface ChatMessage {
    username: string;
    message: string;
}

function disconnectOtherSocketId(roomId: string, userKey: string, connectionId: string): boolean {
    const user = userInDb.get(roomId, userKey);
    if (user) {
        if (user.connectionId) {
            SocketManager.disconnectSocket('hubRangOraz', user.connectionId);
        }
        user.connectionId = connectionId;
        userInDb.update(roomId, user);

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
                if (!disconnectOtherSocketId(socket.handshake.auth.roomId, socket.handshake.auth.userKey, socket.id))
                    socket.disconnect(true);
            },
        },

        handler: {
            'disconnect': (socket: Socket) => {
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
