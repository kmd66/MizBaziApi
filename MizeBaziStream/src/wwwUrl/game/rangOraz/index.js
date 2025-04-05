import * as mediasoupClient from 'mediasoup-client'
import io from 'socket.io-client'


const socket = io("/mediasoup", {
    auth: {
        token: "1wwwwwww23"
    }
});

socket.on('connection-success', ({ socketId }) => {
    console.log(socketId)
})
