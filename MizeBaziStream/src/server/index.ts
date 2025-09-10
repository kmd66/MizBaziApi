import cluster from 'cluster';
import { availableParallelism } from 'os';
import express from 'express';

const numCPUs = availableParallelism();
const portMap: Record<number, number> = {};

function init() {
    if (cluster.isPrimary) {
        var basePort: number = 3000;
        console.log(`Primary ${process.pid} is running`);

        for (let i = 0; i < numCPUs - 1; i++) {
            basePort++;
            const worker = cluster.fork({ PORT: basePort.toString() });
            if (worker.process.pid) {
                portMap[worker.process.pid] = basePort;
            }
        }

        cluster.on('exit', (worker) => {
            if (worker.process.pid) {
                const deadPort = portMap[worker.process.pid];
                console.log(`Worker ${worker.process.pid} on port ${deadPort} died`);

                const newWorker = cluster.fork({ PORT: deadPort.toString() });

                if (newWorker.process.pid) {
                    portMap[newWorker.process.pid] = basePort;
                }
                delete portMap[worker.process.pid];
            }

        });

        const statusApp = express();
        const statusPort = 3000;

        statusApp.post('/status', (req, res) => {
            const array = Object.values(portMap);
            res.json(array);
        });

        statusApp.listen(statusPort, () => {
            console.log(`📡 Status API running at http://0.0.0.0:${statusPort}/status`);
        });
    }
    else {
        console.log(`Worker ${process.pid} started`);
        require('./worker');
    }
}

// اصلاح
//حتماً! اینجا یه benchmark ساده می‌ذارم که نشون بده آیا مستر درگیر کار سنگینی شده یا نه.
//جدا کردن 1 cpu برای پردازش صوت
require('./worker');
//init();