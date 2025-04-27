import { userInDb } from './userInDb';
import { User } from '../model/interfaces';
import SocketManager from '../handler/socket';

export class GameControll {
    public static SafeUsers(userType: number, isShowOstad: boolean, model?: any[]): any {
        if (!model)
            return model;
        return model.map(({ id, index, info, type, key }) => ({
            id, index, info,
            ...(type === 1 && { type: type }) ||
            (userType == 1 && type === 2 && { type: type }) ||
            (userType == type && { type: type }) ||
            (isShowOstad && type === 2 && { type: type })
        }));
    }

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

}