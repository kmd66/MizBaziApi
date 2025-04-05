
import { GameType, userInGameStatusType } from './gameInterfaces';

export class Result<T> implements IResult {
    public data: any;
    public code: number = 0;
    public success: boolean = false;
    public message?: string;

    constructor(success: boolean = false, code: number, message?: string, data?: T) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static failure<T>(options: {
        code: number;
        message: string;
    }): Result<T> {
        return new Result<T>(false, options.code || -1, options.message, null as any);
    }
    public static successful<T>(options: {
        code?: number;
        data: T;
    }): Result<T> {
        return new Result<T>(true, options.code || 0, '', options.data);
    }
    public static success(code: number = 0) {
        return new Result<boolean>(true, code, '', true);
    }
    public static fail(code: number = 0, message: string) {
        return new Result<boolean>(false, code, message, false);
    }

}

export interface IResult {
    code: number;
    success: boolean;
    message?: string;
}

export interface User {
    id: number;
    index: number;
    typeName: string;
    type: number;
    info: any;
    key?: string;
    userInGameStatus: userInGameStatusType
}
export interface RoomUsers {
    id: string;
    key?: string;
    type: GameType;
    info: any;
    users: User[];

    createdAt?: Date;       // تاریخ و زمان ایجاد رکورد
}

