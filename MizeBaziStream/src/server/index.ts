import express from 'express';
import * as fs from 'fs';
import config from './handler/config';
import work from './handler/work';
import api from './handler/api';
import path from 'path';
const https = require('httpolyglot');

const app = express();


// Middleware
app.use(express.json());

app.use('/', api);

app.use(express.static(path.join(__dirname, '../wwwUrl')));

const options = {
    key: fs.readFileSync(__dirname + config.sslKey, 'utf-8'),
    cert: fs.readFileSync(__dirname + config.sslCrt, 'utf-8')
};
const httpsServer = https.createServer(options, app);

//const io = socketIo(httpsServer, {
//    cors: {
//        origin: '*',
//        methods: ['GET', 'POST'],
//        allowedHeaders: ['Content-Type'],
//    }
//});

//socket.init(io);

; (async () => {
    await work.init();
})()

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'production';

httpsServer.listen(PORT, () => {
    console.log(`سرور ${ENV} در حال اجرا است روی پورت ${PORT}`);
    console.log(`آدرس: http://localhost:${PORT}`);
});