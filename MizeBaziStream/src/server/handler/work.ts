import * as mediasoup from 'mediasoup';
import config from './config';

const workers: mediasoup.types.Worker[] = [];
let nextMediasoupWorkerIdx = 0;

async function createWorkers(): Promise<void> {
    const numWorkers: number = config.numWorkers;

    for (let i = 0; i < numWorkers; i++) {
        const worker = await mediasoup.createWorker({
            // logLevel: config.mediasoup.worker.logLevel as mediasoup.types.WorkerLogLevel,
            // logTags: config.mediasoup.worker.logTags as mediasoup.types.WorkerLogTag[],
            rtcMinPort: config.rtcMinPort,
            rtcMaxPort: config.rtcMaxPort
        });

        worker.on('died', () => {
            console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
            setTimeout(() => process.exit(1), 2000);
        });

        workers.push(worker);
    }
}

function getMediasoupWorker(): mediasoup.types.Worker {
    const worker = workers[nextMediasoupWorkerIdx];

    if (++nextMediasoupWorkerIdx === workers.length) {
        nextMediasoupWorkerIdx = 0;
    }

    return worker;
}

export default {
    init: createWorkers,
    getWorker: getMediasoupWorker,
    workers: workers
};