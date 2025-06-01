import { Socket } from 'socket.io';
import { GameControll } from '../globalMethod';
import { userInDb } from '../userInDb';
import { userInGameStatusType } from '../../model/gameInterfaces';
import SocketManager from '../../handler/socket';
import { KhandeControll } from './extensions';

function connectionReceive(roomId: string, userKey: string, connectionId: string): void {
    var _userInDb = userInDb();
    const user = _userInDb.get(roomId, userKey);
    if (user) {
        const userConnectionId = user.connectionId;

        user.connectionId = connectionId;
        if (user.userInGameStatus == userInGameStatusType.ofline) {
            user.userInGameStatus = userInGameStatusType.faal;
            user.lastConnectAt = new Date();
            _userInDb.update(roomId, user);
        }
        if (userConnectionId) {
            SocketManager.disconnectSocket('hubNabardKhande', userConnectionId, 'home');
        }
        infoRoomReceive(roomId, user.type, connectionId);

        KhandeControll.statusReceive(roomId);
        return;
    }

    SocketManager.disconnectSocket('hubNabardKhande', connectionId, 'home');
}

function infoRoomReceive(roomId: string, userType: number, connectionId: string): boolean {

    const handler = KhandeControll.getHandler(roomId);
    if (!handler)
        return false;
    const modelRoom = {
        door: handler.door,
        activeUser: handler.activeUser1,
        activeUser2: handler.activeUser2,
        state: handler.state,
        wait: handler.wait
    };
    var _userInDb = userInDb();
    const users = _userInDb.getAll(roomId);
    if (!users)
        return false;

    const model = {
        room: modelRoom,
        users: KhandeControll.SafeUsers(userType, users),
        status: GameControll.userStatus(users)
    }

    SocketManager.sendToSocket(
        'hubNabardKhande', 'infoRoomReceive',
        connectionId, model
    );

    return true;
}

export function KandeMethod() {
    const wrapHandler = (method: string) => (model: any) => {
        const handler = KhandeControll.getHandler(model.roomId);
        if (handler && typeof (handler as any)[method] === 'function') {
            (handler as any)[method](model);
        }
    };
    const wrapHandlerWithCallback = (method: string) => (model: any, callback: Function) => {
        const handler = KhandeControll.getHandler(model.roomId);
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
                const handler = KhandeControll.getHandler(socket.handshake.auth.roomId);
                if (handler) {
                    handler.closeProducer(socket.handshake.auth.roomId, socket.handshake.auth.userKey)
                    handler.closeConsumer(socket.handshake.auth.roomId, socket.handshake.auth.userKey)
                }
            },
        },

        handler: {
            'disconnect': (socket: Socket) => {
                GameControll.disconnect('hubNabardKhande', socket.handshake.auth.roomId, socket.id)
                const handler = KhandeControll.getHandler(socket.handshake.auth.roomId);
                if (handler) {
                    handler.closeProducer(socket.handshake.auth.roomId, socket.handshake.auth.userKey)
                    handler.closeConsumer(socket.handshake.auth.roomId, socket.handshake.auth.userKey)
                }
            },
        },

        customHandler: {
            setMessage: (model: any) => {
                GameControll.setMessage('hubNabardKhande', model);
            },
            setCancel: wrapHandler('cancel'),
            addSticker: wrapHandler('addSticker'),
            addSticker2: wrapHandler('addSticker2'),
            addMessage: wrapHandler('addMessage'),
            setSmile: wrapHandler('setSmile'),
        },

        streamHandler: {
            getRtpCapabilities: wrapHandler('getRtpCapabilities'),
            createWebRtcTransport: wrapHandlerWithCallback('createWebRtcTransport'),
            transportConnect: wrapHandler('transportConnect'),
            transportProduce: wrapHandlerWithCallback('transportProduce'),
            transportRecvConnect: wrapHandler('transportRecvConnect'),
            consume: wrapHandler('consume'),
            consumerResume: wrapHandler('consumerResume'),
        },
    };
}
