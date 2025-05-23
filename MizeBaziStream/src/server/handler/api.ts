﻿import { Router, Request, Response } from 'express';
import { RoomUsers, Result } from '../model/interfaces';
import { GameTypeExtension, userInGameStatusType } from '../model/gameInterfaces';
import config from './config';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import { globalDb } from '../handler/globalDb';


class PageRoot {
    //اصلاح
    private _fileBaseUrl: string = '';
    //private _fileBaseUsrl: string = config.apiUrl;
    //اصلاح

    constructor() { }

    public async rangOraz(req: Request, res: Response) {
        const itemclickFile = path.join(__dirname, '../../public/itemclick.html');
        const itemclickTemplate = fs.readFileSync(itemclickFile, 'utf8');

        const stickerFile = path.join(__dirname, '../../public/sticker.html');
        const stickerTemplate = fs.readFileSync(stickerFile, 'utf8');

        const gameresponseFile = path.join(__dirname, '../../public/gameresponse.html');
        const gameresponsePartial = fs.readFileSync(gameresponseFile, 'utf8');


        const filePathindex = path.join(__dirname, '../../public/rangOraz/index.html');
        const mainTemplate = fs.readFileSync(filePathindex, 'utf8');

        const filePathBody = path.join(__dirname, '../../public/rangOraz/body.html');
        const bodyPartial = fs.readFileSync(filePathBody, 'utf8');

        const filePathMain = path.join(__dirname, '../../public/rangOraz/main.html');
        const mainPartial = fs.readFileSync(filePathMain, 'utf8');

        const filePathPaint = path.join(__dirname, '../../public/rangOraz/paint.html');
        const paintPartial = fs.readFileSync(filePathPaint, 'utf8');

        const filePathImgsForSpy = path.join(__dirname, '../../public/rangOraz/imgsForSpy.html');
        const imgsForSpyPartial = fs.readFileSync(filePathImgsForSpy, 'utf8');

        const fileHelp = path.join(__dirname, '../../public/rangOraz/help.html');
        const helpPartial = fs.readFileSync(fileHelp, 'utf8');

        const defaeFile = path.join(__dirname, '../../public/rangOraz/defae.html');
        const defaePartial = fs.readFileSync(defaeFile, 'utf8');

        const waitFile = path.join(__dirname, '../../public/rangOraz/wait.html');
        const waitPartial = fs.readFileSync(waitFile, 'utf8');

        const renderedHtml = ejs.render(mainTemplate, {
            fileBaseUsrl: this._fileBaseUrl,
            sticker: stickerTemplate,
            itemclick: itemclickTemplate,
            gameresponse: gameresponsePartial,

            body: bodyPartial,
            main: mainPartial,
            paint: paintPartial,
            imgsForSpy: imgsForSpyPartial,
            help: helpPartial,
            defae: defaePartial,
            wait: waitPartial, 

            title: 'رنگ و راز',
        });
        res.send(renderedHtml);
    }

    public async afsonVajeh(req: Request, res: Response) {
        const indexFile = path.join(__dirname, '../../public/afsonVajeh/index.html');
        const indexTemp = fs.readFileSync(indexFile, 'utf8');
        const bodyFile = path.join(__dirname, '../../public/afsonVajeh/body.html');
        const bodyTemp = fs.readFileSync(bodyFile, 'utf8');

        const mainFile = path.join(__dirname, '../../public/afsonVajeh/main.html');
        const mainTemp = fs.readFileSync(mainFile, 'utf8');
        const helpFile = path.join(__dirname, '../../public/afsonVajeh/help.html');
        const helpTemp = fs.readFileSync(helpFile, 'utf8');
        const stickerFile = path.join(__dirname, '../../public/sticker.html');
        const stickerTemp = fs.readFileSync(stickerFile, 'utf8');
        const itemclickFile = path.join(__dirname, '../../public/itemclick.html');
        const itemclickTemp = fs.readFileSync(itemclickFile, 'utf8');

        const gameresponseFile = path.join(__dirname, '../../public/gameresponse.html');
        const gameresponseTemp = fs.readFileSync(gameresponseFile, 'utf8');

        const renderedHtml = ejs.render(indexTemp, {
            fileBaseUsrl: this._fileBaseUrl,
            body: bodyTemp,
            title: 'افسون واژه',

            main: mainTemp,
            help: helpTemp,
            sticker: stickerTemp,
            itemclick: itemclickTemp,
            gameresponse: gameresponseTemp
        });
        res.send(renderedHtml);
    }

    public async mafia(req: Request, res: Response) {
        const filePathindex = path.join(__dirname, '../../public/mafia/index.html');
        const mainTemplate = fs.readFileSync(filePathindex, 'utf8');

        const filePathBody = path.join(__dirname, '../../public/mafia/body.html');
        const bodyPartial = fs.readFileSync(filePathBody, 'utf8');

        const mainFile = path.join(__dirname, '../../public/mafia/main.html');
        const mainTemp = fs.readFileSync(mainFile, 'utf8');
        const helpFile = path.join(__dirname, '../../public/mafia/help.html');
        const helpTemp = fs.readFileSync(helpFile, 'utf8');
        const chaosFile = path.join(__dirname, '../../public/mafia/chaos.html');
        const chaosTemp = fs.readFileSync(chaosFile, 'utf8');

        const stickerFile = path.join(__dirname, '../../public/sticker.html');
        const stickerTemp = fs.readFileSync(stickerFile, 'utf8');
        const itemclickFile = path.join(__dirname, '../../public/itemclick.html');
        const itemclickTemp = fs.readFileSync(itemclickFile, 'utf8');

        const gameresponseFile = path.join(__dirname, '../../public/gameresponse.html');
        const gameresponseTemp = fs.readFileSync(gameresponseFile, 'utf8');

        const renderedHtml = ejs.render(mainTemplate, {
            fileBaseUsrl: this._fileBaseUrl,
            body: bodyPartial,
            title: 'مافیا',

            main: mainTemp,
            help: helpTemp,
            chaos: chaosTemp,
            sticker: stickerTemp,
            itemclick: itemclickTemp,
            gameresponse: gameresponseTemp
        });
        res.send(renderedHtml);
    }

    public async nabardKhande(req: Request, res: Response) {
        const filePathindex = path.join(__dirname, '../../public/nabardKhande/index.html');
        const mainTemplate = fs.readFileSync(filePathindex, 'utf8');

        const filePathBody = path.join(__dirname, '../../public/nabardKhande/body.html');
        const bodyPartial = fs.readFileSync(filePathBody, 'utf8');

        const renderedHtml = ejs.render(mainTemplate, {
            fileBaseUsrl: this._fileBaseUrl,
            body: bodyPartial,
            title: 'نبرد خنده',
        });
        res.send(renderedHtml);
    }
    
}
class ApiRoot {
    constructor() { }

    public async api(req: Request, res: Response): Promise<any> {
        const result = Result.successful<string[]>({ data: ['mize bazi', 'api v1', '1.1.0'] });
        return res.status(200).json(result);
    }

    public async createRoom(req: Request, res: Response): Promise<any> {
        try {
            const model: RoomUsers = req.body;

            if (model.key != config.apiKey)
                return res.status(200).json(Result.fail(401, '401'));

            var roomCount = GameTypeExtension.count(model.type);
            if (roomCount == 0)
                return res.status(200).json(Result.fail(401, 't 0'));

            var types = GameTypeExtension.roles(model.type);
            types = this.shuffleArray(types);
            model.users = this.shuffleArray(model.users);

            var resultUser: any = {
                roomId: '',
                users: []
            }

            model.users.forEach((v, i) => {
                const key = uuidv4();
                v.userInGameStatus = userInGameStatusType.ofline;
                v.index = i;
                v.typeName = types[i];
                v.type = GameTypeExtension.getType(model.type, types[i]);
                v.key = key;
                v.lastConnectAt = new Date();
                v.oflineSecond = 0;
                resultUser.users.push({
                    userId: v.id,
                    userKey: key
                });
            });

            var roomDb = globalDb().getDb(model.type);
            var newRoom = roomDb?.add(model);
            model.id = newRoom.id;
            resultUser.roomId = newRoom.id;

            const result = Result.successful<any>({ data: resultUser });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'An error occurred while processing your request'
            });
        }
    }

    shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
class TestApiRoot {
    constructor() { }
    public async testCreateRoom(req: Request, res: Response): Promise<any> {
        const jsonData = fs.readFileSync(__dirname + '../../../wwwUrl/testPage/userdata-mafia.json', 'utf-8');
        const model: RoomUsers = JSON.parse(jsonData);
        globalDb().clear();
        model.key = config.apiKey;
        const req1 = {
            body: model
        } as Request;
        const res1 = {
            status: function (code: number) {
                (this as any).statusCode = code;
                return this;
            },
            json: function (data: any) {
                (this as any).responseData = data;
                return this;
            }
        } as unknown as Response;
        var t = await appApiRoots.createRoom(req1, res1);
        return res.status(200).json(t);
    }

    public async stressTest(req: Request, res: Response) {
        let sum = 0;
        for (let i = 0; i < 1e6; i++) {
            Math.floor(Math.random() * 1e6); 
            sum += Math.sqrt(i);
        }
        res.send(`Done. Sum: ${sum}`);
    }
}

const router = Router();
const appApiRoots = new ApiRoot();
const appTestApiRoot = new TestApiRoot();
const appPageRoots = new PageRoot();

router.get('/mafia', (req, res) => appPageRoots.mafia(req, res));
router.get('/rangOraz', (req, res) => appPageRoots.rangOraz(req, res));
router.get('/afsonVajeh', (req, res) => appPageRoots.afsonVajeh(req, res));
router.get('/nabardKhande', (req, res) => appPageRoots.nabardKhande(req, res));

router.get('/api', (req, res) => appApiRoots.api(req, res));
router.post('/api/createRoom', (req, res) => appApiRoots.createRoom(req, res));


router.get('/testApi/CreateRoom', (req, res) => appTestApiRoot.testCreateRoom(req, res));
router.get('/stressTest', (req, res) => appTestApiRoot.stressTest(req, res));


export default router;
