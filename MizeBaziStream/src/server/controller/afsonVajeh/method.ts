import { Socket } from 'socket.io';
import { userInDb } from '../userInDb';
import { userInGameStatusType } from '../../model/gameInterfaces';
import { GameControll } from '../globalMethod';
import SocketManager from '../../handler/socket';
import { AfsonControll } from './extensions';


function connectionReceive(roomId: string, userKey: string, connectionId: string): void {
    var _userInDb = userInDb();
    const user = _userInDb.get(roomId, userKey);
    if (user) {
        const userConnectionId = user.connectionId;

        user.connectionId = connectionId;
        if (user.userInGameStatus != userInGameStatusType.koshte) {
            user.userInGameStatus = userInGameStatusType.faal;
            user.lastConnectAt = new Date();
            _userInDb.update(roomId, user);
        }
        if (userConnectionId) {
            SocketManager.disconnectSocket('hubAfsonVajeh', userConnectionId, 'home');
        }
        infoRoomReceive(roomId, user.type, connectionId);

        AfsonControll.statusReceive(roomId);
        return;
    }

    SocketManager.disconnectSocket('hubAfsonVajeh', connectionId, 'home');
}
function infoRoomReceive(roomId: string, userType: number, connectionId: string): boolean {

    const handler = AfsonControll.getHandler(roomId);
    if (!handler)
        return false;
    const modelRoom = {
        door: handler.door,
        activeUser: handler.activeUser,
        state: handler.state,
        loserUser: handler.loserUser,
        wait: handler.wait
    };
    var _userInDb = userInDb();
    const users = _userInDb.getAll(roomId);
    if (!users)
        return false;

    const model = {
        room: modelRoom,
        users: AfsonControll.SafeUsers(userType, users),
        status: GameControll.userStatus(users)
    }

    SocketManager.sendToSocket(
        'hubAfsonVajeh', 'infoRoomReceive',
        connectionId, model
    );
    return true;
}

export function AfsonMethod() {
    const wrapHandler = (method: string) => (model: any) => {
        const handler = AfsonControll.getHandler(model.roomId);
        if (handler && typeof (handler as any)[method] === 'function') {
            (handler as any)[method](model);
        }
    };
    const wrapHandlerWithCallback = (method: string) => (model: any, callback: Function) => {
        const handler = AfsonControll.getHandler(model.roomId);
        if (handler && typeof (handler as any)[method] === 'function') {
            (handler as any)[method](model, callback);
        }
    };

    return {
        emit: {
            'connectionReceive': (socket: Socket) => {
                socket.emit('connectionReceive', {
                    socketId: socket.id
                });
                connectionReceive(socket.handshake.auth.roomId, socket.handshake.auth.userKey, socket.id);
                //const handler = AfsonControll.getHandler(socket.handshake.auth.roomId);
                //if (handler)
                //    handler.closeConsumer(socket.handshake.auth.roomId, socket.handshake.auth.userKey)
            },
        },

        handler: {
            'disconnect': (socket: Socket) => {
                GameControll.disconnect('hubAfsonVajeh', socket.handshake.auth.roomId, socket.id)
            },
        },

        customHandler: {
            setMessage: (model: any) => {
                GameControll.setMessage('hubAfsonVajeh', model);
            },
            setCancel: wrapHandler('cancel'),
            addSticker: wrapHandler('addSticker'),
            addChalesh: wrapHandler('addChalesh'),
            setChalesh: wrapHandler('setChalesh'),
        },

        streamHandler: {
        },
    };
}
