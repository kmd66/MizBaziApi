import { afsonDb } from './afsonDb';
import SocketManager from '../../handler/socket';
import { User } from '../../model/interfaces';
import { receiveType } from '../../model/gameInterfaces';
import Stream from './stream';
import { AfsonControll } from './extensions';

export default class Receive extends Stream {
    constructor(roomId: string) {
        super(roomId);
    }

}