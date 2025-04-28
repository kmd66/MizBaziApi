import { afsonDb } from './afsonDb';
import SocketManager from '../../handler/socket';
import { User } from '../../model/interfaces';
import Receive from './receive';
import { AfsonControll } from './extensions';

export default class Set extends Receive {
    constructor(roomId: string) {
        super(roomId);
    }

}
