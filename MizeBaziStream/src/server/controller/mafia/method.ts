import { Socket } from 'socket.io';
import { userInDb } from '../userInDb';
import { userInGameStatusType } from '../../model/gameInterfaces';
import { GameControll } from '../globalMethod';
import SocketManager from '../../handler/socket';
import { MafiaControll } from './extensions';


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
            SocketManager.disconnectSocket('hubMafia', userConnectionId, 'home');
        }
        infoRoomReceive(roomId, userKey, user.type, connectionId);

        MafiaControll.statusReceive(roomId);
        return;
    }

    SocketManager.disconnectSocket('hubMafia', connectionId, 'home');
}
function infoRoomReceive(roomId: string, userKey: string, userType: number, connectionId: string): boolean {

    const handler = MafiaControll.getHandler(roomId);
    if (!handler)
        return false;
    const modelRoom = {
        door: handler.door,
        activeUser: handler.activeUser,
        state: handler.state,
        wait: handler.wait
    };
    var _userInDb = userInDb();
    const users = _userInDb.getAll(roomId);
    if (!users)
        return false;

    const model = {
        room: modelRoom,
        users: MafiaControll.SafeUsers(userType, users),
        status: GameControll.userStatus(users),
        groupItem: handler.groupItem(userKey)
    }

    SocketManager.sendToSocket(
        'hubMafia', 'infoRoomReceive',
        connectionId, model
    );
    return true;
}

export function MafiaMethod() {
    const wrapHandler = (method: string) => (model: any) => {
        const handler = MafiaControll.getHandler(model.roomId);
        if (handler && typeof (handler as any)[method] === 'function') {
            (handler as any)[method](model);
        }
    };
    const wrapHandlerWithCallback = (method: string) => (model: any, callback: Function) => {
        const handler = MafiaControll.getHandler(model.roomId);
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
                const handler = MafiaControll.getHandler(socket.handshake.auth.roomId);
                if (handler)
                    handler.closeConsumer(socket.handshake.auth.roomId, socket.handshake.auth.userKey)
            },
        },

        handler: {
            'disconnect': (socket: Socket) => {
                GameControll.disconnect('hubMafia', socket.handshake.auth.roomId, socket.id)
            },
        },

        customHandler: {
            setMessage: (model: any) => {
                GameControll.setMessage('hubMafia', model);
            },
            setCancel: wrapHandler('cancel'),
            addSticker: wrapHandler('addSticker'),
            addChalesh: wrapHandler('addChalesh'),
            setChalesh: wrapHandler('setChalesh'),
            addTarget: wrapHandler('addTarget'),

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
