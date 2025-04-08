import { Server, Socket } from 'socket.io';
export interface ChatMessage {
    username: string;
    message: string;
}

function disconnect(socket: Socket) {
    socket.on('disconnect', () => {
        console.log(`disconnect : ${socket.id}`);
    });
}

function exitRoom(socket: Socket) {

    socket.on('exitRoom', (msg: ChatMessage) => {
        console.log(`پیام دریافت شد: ${msg.username}: ${msg.message}`);
        socket.emit('exitRoomReceive', {
            ...msg,
            timestamp: new Date()
        });
    });
}

export function socketHandlers(io: Server, pId: number) {

    const so = io.of('/mediasoup');
    so.on('connection', (socket: Socket) => {
        //console.log(`---connection---${pId}---${socket.id} -- ${socket.handshake.auth.token}`);

        socket.emit('connectionReceive', {
            socketId: socket.id
        })

        socket.on("message", (msg) => {
            so.emit("messageResivd", {
                msg: `[Worker ${process.pid}] ${msg}`
            } );
        });

        socket.on('sendImg', function ({ data }) {
            socket.broadcast.emit('ImgReceive', {
                img: data
            })
        });

        exitRoom(socket);

        disconnect(socket);
    });
}