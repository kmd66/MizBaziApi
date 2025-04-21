import { Socket } from 'socket.io';
import { userInDb } from './userInDb';
import SocketManager from '../handler/socket';
import { userInGameStatusType } from '../model/gameInterfaces';
import { User } from '../model/interfaces';
import { RangOrazControll } from './RangOrazExtensions';
import { rangOrazDb } from './rangOrazDb';

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
        RangOrazControll.roomReceive(roomId, connectionId);
        usersReceive(roomId, user.type, connectionId);
        RangOrazControll.statusReceive(roomId);
        return;
    }

    SocketManager.disconnectSocket('hubRangOraz', connectionId, 'home');
}
function disconnect(roomId: string, connectionId: string): boolean {
    var _userInDb = userInDb();
    const user = _userInDb.getByConnectionId(roomId, connectionId);
    if (user) {
        if (user.userInGameStatus == 2)
            return true;

        user.userInGameStatus = userInGameStatusType.ofline;
        _userInDb.update(roomId, user);
        RangOrazControll.statusReceive(roomId);
        return true;
    }
    return false;
}
function usersReceive(roomId: string, userType: number, connectionId: string): boolean {
    var _userInDb = userInDb();
    const users = _userInDb.getAll(roomId);
    if (users) {
        const users: User[] | undefined = userInDb().getAll(roomId);
        const handler = RangOrazControll.getRangOrazHandler(roomId);
        if (!handler) return false;
        SocketManager.sendToSocket(
            'hubRangOraz', 'usersReceive',
            connectionId, RangOrazControll.SafeUsers(userType, handler!.isShowOstad, users)
        );
        return true;
    }
    return false;
}
function setMessage(model: any) {
    if (!model.message || model.message == '') return;
    const room = rangOrazDb().get(model.roomId);
    if (!room) return;
    const user = room?.users.find((x: User) => x.key == model.userKey);
    if (!user) return;
    var users = room?.users.filter((user: User) => user.userInGameStatus != userInGameStatusType.ofline && user.userInGameStatus != userInGameStatusType.ekhraj);
    if (!users) return;

    if (model.message.length > 50)
        model.message = model.message.slice(0, 50)

    const message = {
        msg: model.message,
        userId: user.id
    };
    const connectionIds = users?.map(user => user.connectionId) || [];
    SocketManager.sendToMultipleSockets('hubRangOraz', 'getMessage', connectionIds, message)
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
            'setBazporsi': (socket: Socket, model: any) => {
                const handler = RangOrazControll.getRangOrazHandler(model.roomId)
                if (handler)
                    handler.setBazporsi(model)
            },
            'setRaieGiriCount': (socket: Socket, model: any) => {
                const handler = RangOrazControll.getRangOrazHandler(model.roomId)
                if (handler)
                    handler.setRaieGiriCount(model)
            },
            'setShowOstad': (socket: Socket, model: any) => {
                const handler = RangOrazControll.getRangOrazHandler(model.roomId)
                if (handler)
                    handler.setShowOstad(model)
            },
            'setHadseNaghsh': (socket: Socket, model: any) => {
                const handler = RangOrazControll.getRangOrazHandler(model.roomId)
                if (handler)
                    handler.setHadseNaghsh(model)
            },
            'setMessage': (socket: Socket, model: any) => {
                setMessage(model)
            },
        }
    };
}
