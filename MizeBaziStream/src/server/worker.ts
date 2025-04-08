import express from 'express';
import * as fs from 'fs';
import config from './handler/config';
import work from './handler/work';
import api from './handler/api';
import path from 'path';
import { Server } from 'socket.io';
import { socketHandlers } from './handler/socket';
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
socketHandlers(io, process.pid);

; (async () => {
    await work.init();
})()

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'production';

httpsServer.listen(PORT, () => {
    console.log(`server ${ENV} work in http://localhost:${PORT}`);
});