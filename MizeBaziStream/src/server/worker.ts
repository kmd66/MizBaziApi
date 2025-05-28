import express from 'express';
import * as fs from 'fs';
import config from './handler/config';
import SFU from './handler/sfu';
import SFU2 from './handler/sfu2';
import api from './handler/api';
import path from 'path';
import { Server } from 'socket.io';
import { SocketInit } from './handler/socket';
import { globalDb } from './handler/globalDb';
const https = require('httpolyglot');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middleware
app.use(express.json());

app.use('/', api);

app.use(express.static(path.join(__dirname, '../wwwUrl')));

const options = {
    key: fs.readFileSync(__dirname + config.sslKey, 'utf-8'),
    cert: fs.readFileSync(__dirname + config.sslCrt, 'utf-8')
};
const httpsServer = https.createServer(options, app);

const io = new Server(httpsServer, {
    cors: {
        origin: "*", // Adjust this for production
        methods: ["GET", "POST"]
    }
});

SocketInit(io, process.pid);

async function init() {
    await SFU.createWorker();
    await SFU2.createWorker();
    const PORT = process.env.PORT || '3000';
    const ENV = process.env.NODE_ENV || 'production';
    globalDb(PORT);

    httpsServer.listen(PORT, () => {
        console.log(`serverid: ${process.pid}  ${ENV} work in http://localhost:${PORT}`);
    });

}
init();