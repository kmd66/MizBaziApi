import { Router, Request, Response } from 'express';
import { RoomUsers, Result } from './interfaces';
import { GameTypeExtension, userInGameStatusType } from './gameInterfaces';
import config from './config';
import { v4 as uuidv4 } from 'uuid';
import { type } from 'os';


class ApiRoot {
    constructor() { }

    public async api(req: Request, res: Response): Promise<any> {
        const result = Result.successful<string[]>({ data: ['mize bazi', 'api v1', '1.1.0'] });
        return res.status(200).json(result);
    }

    public async test(req: Request, res: Response): Promise<any> {
        return res.status(200).json({});
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
                v.key = key
                resultUser.users.push({
                    userId: v.id,
                    userKey: key
                });
            });

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

const router = Router();
const appApiRoots = new ApiRoot();

router.get('/api', (req, res) => appApiRoots.api(req, res));
router.get('/api/test', (req, res) => appApiRoots.test(req, res));
router.post('/api/test', (req, res) => appApiRoots.test(req, res));
router.post('/api/createRoom', (req, res) => appApiRoots.createRoom(req, res));

export default router;
