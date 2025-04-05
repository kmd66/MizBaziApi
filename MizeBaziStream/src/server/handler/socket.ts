import { Server, Socket } from 'socket.io';
export interface ChatMessage {
    username: string;
    message: string;
}

function disconnect(socket: Socket) {
    socket.on('disconnect', () => {
        console.log(`کاربر قطع شد: ${socket.id}`);
    });
}

function exitRoom(socket: Socket) {

    socket.on('exitRoom', (msg: ChatMessage) => {
        console.log(`پیام دریافت شد: ${msg.username}: ${msg.message}`);
        socket.emit('exitRoom', {
            ...msg,
            timestamp: new Date()
        });
    });
}

export function socketHandlers(io: Server) {

    const so = io.of('/mediasoup');
    so.on('connection', (socket: Socket) => {
        console.log(`---connection------${socket.id} -- ${socket.handshake.auth.token}`);

        socket.emit('connection-success', {
            socketId: socket.id
        })
        
        exitRoom(socket);

        disconnect(socket);
    });
}