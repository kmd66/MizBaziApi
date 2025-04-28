import { Socket } from 'socket.io';
import { userInDb } from '../userInDb';
import { GameControll } from '../globalMethod';
import SocketManager from '../../handler/socket';
import { userInGameStatusType } from '../../model/gameInterfaces';
import { RangOrazControll } from './rangOrazExtensions';

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
            SocketManager.disconnectSocket('hubRangOraz', userConnectionId, 'home');
        }
        infoRoomReceive(roomId, user.type, connectionId);

        RangOrazControll.statusReceive(roomId);
        return;
    }

    SocketManager.disconnectSocket('hubRangOraz', connectionId, 'home');
}
function infoRoomReceive(roomId: string, userType: number, connectionId: string): boolean {

    const handler = RangOrazControll.getHandler(roomId);
    if (!handler)
        return false;
    const modelRoom = {
        isShowOstad: handler.isShowOstad,
        door: handler.door,
        progressTime: handler.wait,
        activeUser: handler.activeUser,
        state: handler.state,
        loserUser: handler.loserUser,
        hadseNaghsh: handler.hadseNaghsh,
        bazporsiUsers: handler.bazporsiUsers,
        mozoeNaghashi: handler.mozoeNaghashi,
        naghashi: Array.from(handler.naghashi.entries()) 
    };
    var _userInDb = userInDb();
    const users = _userInDb.getAll(roomId);
    if (!users)
        return false;

    const model = {
        room: modelRoom,
        users: RangOrazControll.SafeUsers(userType, handler!.isShowOstad, users),
        status: GameControll.userStatus(users)
    }

    SocketManager.sendToSocket(
        'hubRangOraz', 'infoRoomReceive',
        connectionId, model
    );
    return true;
}
export function RangOrazMethod() {
    const wrapHandler = (method: string) => (model: any) => {
        const handler = RangOrazControll.getHandler(model.roomId);
        if (handler && typeof (handler as any)[method] === 'function') {
            (handler as any)[method](model);
        }
    };
    const wrapHandlerWithCallback = (method: string) => (model: any, callback: Function) => {
        const handler = RangOrazControll.getHandler(model.roomId);
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
                const handler = RangOrazControll.getHandler(socket.handshake.auth.roomId);
                if (handler)
                    handler.closeConsumer(socket.handshake.auth.roomId, socket.handshake.auth.userKey)
            },
        },

        handler: {
            'disconnect': (socket: Socket) => {
                GameControll.disconnect('hubRangOraz', socket.handshake.auth.roomId, socket.id)
            },
        },

        customHandler: {
            setBazporsi: wrapHandler('setBazporsi'),
            setRaieGiriCount: wrapHandler('setRaieGiriCount'),
            setShowOstad: wrapHandler('setShowOstad'),
            setHadseNaghsh: wrapHandler('setHadseNaghsh'),
            setCancel: wrapHandler('cancel'),
            addChalesh: wrapHandler('addChalesh'),
            addSticker: wrapHandler('addSticker'),
            addTarget: wrapHandler('addTarget'),
            setChalesh: wrapHandler('setChalesh'),
            sendImg: wrapHandler('sendImg'),
            setMozoeNaghashi: wrapHandler('setMozoeNaghashi'),

            setMessage: (model: any) => {
                GameControll.setMessage('hubRangOraz', model);
            },
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
