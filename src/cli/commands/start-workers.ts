import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { syncDatabase } from '../../db/db.js';
import { MARK_ALIVE_INTERVAL_MS } from '../../common/constants/constants.js';
import { checkForHaltedJobs, markJobsAsPending, updateJobStatusToPending } from '../../db/repository/worker.js';
import { stopWorkers } from './stop-workers.js';


export async function startWorkers(count: number): Promise<void> {
    console.log('Syncing database schema...');
    await syncDatabase();
    console.log('Database ready.');

    await updateJobStatusToPending();    


    process.on('SIGINT', async () => {
        await stopWorkers();
        clearInterval(haltedJobsInterval);
        process.exit(0);
    });

    console.log(`Starting ${count} worker(s)...`);
    let liveWorkers = 0;

    for(let i=0 ; i<count; i++) {
        
        const worker = spawn('node', ['dist/cli/commands/worker.js', `worker-${i+1}`], {
            stdio: 'inherit',
        });

        liveWorkers++;
        console.log(`Starting worker ${i+1} with PID ${worker.pid}...`);

        worker.on('error', (err) => {
            console.error(`Failed to start worker ${i+1}: ${err}`);
        });

        worker.on('exit', (code, signal) => {
            console.log(`Worker ${i+1} exited with code ${code} and signal ${signal}`);
            liveWorkers--;
            if (liveWorkers === 0) {
                clearInterval(haltedJobsInterval);
                process.exit(0);
            }
        });
    }

    const haltedJobsInterval = setInterval(async () => {
        console.log(`Checking for halted jobs...`);
        const haltedJobs = await checkForHaltedJobs();
        await markJobsAsPending(haltedJobs);
    }, MARK_ALIVE_INTERVAL_MS * 2);
}
