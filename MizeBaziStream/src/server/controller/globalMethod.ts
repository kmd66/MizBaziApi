import { userInDb } from './userInDb';
import { User } from '../model/interfaces';
import { userInGameStatusType } from '../model/gameInterfaces';
import SocketManager from '../handler/socket';
import { globalDb } from '../handler/globalDb';

export class GameControll {
    public static disconnectTime: number = 14000;
    public static disconnectAge: number = 20;

    public static userStatus(model?: any[]): any {
        if (!model)
            return model;
        return model.map(({ id, userInGameStatus }) => ({
            id, userInGameStatus,
        }));
    }

    public static statusReceive(nameSpace: string, roomId: string): boolean {
        const _userInDb = userInDb();
        const users = _userInDb.getAll(roomId);
        if (users) {
            GameControll.sendToMultipleSockets(nameSpace, roomId, 'userStatusReceive', GameControll.userStatus(users));
            return true;
        }
        return false;
    }

    public static sendToMultipleSockets(nameSpace:string, roomId: string, name: string, model: any) {
        const userConnectionId: User[] | undefined = userInDb().getUselFaal(roomId);
        const connectionIds = userConnectionId?.map(user => user.connectionId) || [];
        if (connectionIds.length > 0)
            SocketManager.sendToMultipleSockets(nameSpace, name, connectionIds, model)
    }

    public static setMessage(nameSpace: string, model: any) {
        if (!model.message || model.message == '') return;
        const room = globalDb().getDbByid(model.roomId);
        if (!room) return;
        const user = room?.users.find((x: User) => x.key == model.userKey);
        if (!user) return;
        var users: User[] = room?.users.filter((user: User) => user.userInGameStatus != userInGameStatusType.ofline && user.userInGameStatus != userInGameStatusType.ekhraj) || [];
        if (!users) return;

        if (model.message.length > 50)
            model.message = model.message.slice(0, 50)

        const message = {
            msg: model.message,
            userId: user.id
        };

        const connectionIds = users?.map(x => x.connectionId) || [];
        SocketManager.sendToMultipleSockets(nameSpace, 'getMessage', connectionIds, message)
    }

    public static disconnect(nameSpace: string, roomId: string, connectionId: string): boolean {
        var _userInDb = userInDb();
        const user = _userInDb.getByConnectionId(roomId, connectionId);
        if (user) {
            if (user.userInGameStatus == 2)
                return true;

            user.userInGameStatus = userInGameStatusType.ofline;
            _userInDb.update(roomId, user);
            GameControll.statusReceive(nameSpace, roomId);
            return true;
        }
        return false;
    }
}