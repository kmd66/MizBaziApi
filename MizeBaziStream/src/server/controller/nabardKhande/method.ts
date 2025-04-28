import { Socket } from 'socket.io';
import { GameControll } from '../globalMethod';

export function KandeMethod() {
    const wrapHandler = (method: string) => (model: any) => {
    };
    const wrapHandlerWithCallback = (method: string) => (model: any, callback: Function) => {
    };

    return {
        emit: {
            'connectionReceive': (socket: Socket) => {
                socket.emit('connectionReceive', {
                    socketId: socket.id
                });
            },
        },

        handler: {
            'disconnect': (socket: Socket) => {
            },
        },

        customHandler: {
            setMessage: (model: any) => {
                GameControll.setMessage('hubRangOraz', model);
            },
        },

        streamHandler: {
        },
    };
}
