import { Router, Request, Response } from 'express';
import { RoomUsers, Result } from './interfaces';
import { GameTypeExtension, userInGameStatusType } from './gameInterfaces';
import config from './config';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import GlobalsDb from './globals';


class PageRoot {
    //اصلاح
    private _fileBaseUrl: string = '';
    //private _fileBaseUsrl: string = config.apiUrl;
    //اصلاح

    constructor() { }

    public async rangOraz(req: Request, res: Response) {
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

        const renderedHtml = ejs.render(mainTemplate, {
            fileBaseUsrl: this._fileBaseUrl,
            body: bodyPartial,
            main: mainPartial,
            paint: paintPartial,
            imgsForSpy: imgsForSpyPartial,
            help: helpPartial,
            title: 'رنگ و راز',
        });
        res.send(renderedHtml);
    }

    public async mafia(req: Request, res: Response) {
        const filePathindex = path.join(__dirname, '../../public/mafia/index.html');
        const mainTemplate = fs.readFileSync(filePathindex, 'utf8');

        const filePathBody = path.join(__dirname, '../../public/mafia/body.html');
        const bodyPartial = fs.readFileSync(filePathBody, 'utf8');

        const renderedHtml = ejs.render(mainTemplate, {
            fileBaseUsrl: this._fileBaseUrl,
            body: bodyPartial,
            title: 'مافیا',
        });
        res.send(renderedHtml);
    }

    public async afsonVajeh(req: Request, res: Response) {
        const filePathindex = path.join(__dirname, '../../public/afsonVajeh/index.html');
        const mainTemplate = fs.readFileSync(filePathindex, 'utf8');

        const filePathBody = path.join(__dirname, '../../public/afsonVajeh/body.html');
        const bodyPartial = fs.readFileSync(filePathBody, 'utf8');

        const renderedHtml = ejs.render(mainTemplate, {
            fileBaseUsrl: this._fileBaseUrl,
            body: bodyPartial,
            title: 'افسون واژه',
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

            model.id = uuidv4();
            var resultUser: any = {
                roomId: model.id,
                users: []
            }

            model.users.forEach((v, i) => {
                const key = uuidv4();
                v.userInGameStatus = userInGameStatusType.faal;
                v.index = i;
                v.typeName = types[i];
                v.type = GameTypeExtension.getType(model.type, types[i]);
                v.key = key;
                resultUser.users.push({
                    userId: v.id,
                    userKey: key
                });
            });

            var roomDb = GlobalsDb.getRoomDb();
            roomDb.addRoom(model);

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
        var roomDb = GlobalsDb.getRoomDb();
        roomDb.clear();
        const jsonData = fs.readFileSync(__dirname + '../../../wwwUrl/userdata-rangoraz.json', 'utf-8');
        const model: RoomUsers = JSON.parse(jsonData);
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


export default router;
