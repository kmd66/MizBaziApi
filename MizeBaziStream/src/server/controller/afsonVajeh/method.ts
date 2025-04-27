import { Socket } from 'socket.io';

export function AfsonMethod() {
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
        },

        streamHandler: {
        },
    };
}
