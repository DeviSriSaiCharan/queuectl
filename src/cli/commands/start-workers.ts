import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { syncDatabase } from '../../db/db.js';

interface WorkerProcess {
    pid: number | undefined;
    worker: ChildProcessWithoutNullStreams;
}

export async function startWorkers(count: number): Promise<void> {
    console.log('Syncing database schema...');
    await syncDatabase();
    console.log('Database ready.');

    console.log(`Starting ${count} worker(s)...`);
    for(let i=0 ; i<count; i++) {
        console.log(`Starting worker ${i+1}...`);

        const worker = spawn('node', ['dist/cli/commands/worker.js'], {
            stdio: 'inherit',
        });

        worker.on('error', (err) => {
            console.error(`Failed to start worker ${i+1}: ${err}`);
        });

        worker.on('exit', (code) => {
            if(code !== 0) {
                console.error(`Worker ${i+1} exited with code ${code}`);
            } else {
                console.log(`Worker ${i+1} exited successfully.`);
            }
        });
    }
}