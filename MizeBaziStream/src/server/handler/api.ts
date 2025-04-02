import { Router, Request, Response } from 'express';
import { RoomUsers, User, GameType, Result } from './interfaces';
import { v4 as uuidv4 } from 'uuid';


class ApiRoot {
    constructor() { }

    public async api(req: Request, res: Response): Promise<any> {
        const result = Result.successful<string[]>({ data: ['mize bazi', 'api v1', '1.1.0'] });
        return res.status(200).json(result);
    }

    public async test(req: Request, res: Response): Promise<any> {
        const model: RoomUsers = req.body;

        console.log('----------JSON.stringify(model)------s----------')
        console.log(JSON.stringify(model))
        console.log('----------JSON.stringify(model)------s----------')
        const user1: User = {
            id: 45,
            type: "GameType.rangOraz",
            info: null,
            index: 54
        };
        const user2: User = {
            id: 34,
            type: "GameType.rangOraz",
            info: null,
            index: 677
        };
        const room: RoomUsers = {
            id: uuidv4(),
            type: GameType.rangOraz,
            info: null,
            users: [user1, user2]
        };
        const result = Result.successful<RoomUsers>({ data: room });
        return res.status(200).json(result);
    }

    public async createRoom(req: Request, res: Response): Promise<any> {
        try {
            const model: RoomUsers = req.body;
            const result = Result.success();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'An error occurred while processing your request'
            });
        }
    }
}

const router = Router();
const appApiRoots = new ApiRoot();

router.get('/api', (req, res) => appApiRoots.api(req, res));
router.get('/api/test', (req, res) => appApiRoots.test(req, res));
router.post('/api/test', (req, res) => appApiRoots.test(req, res));
router.post('/api/createRoom', (req, res) => appApiRoots.createRoom(req, res));

export default router;
