import { readAllWorkers } from '../../utils/workers-registry.js';
import type { WorkerEntry } from '../../common/types/worker-entry.js';
import { GRACEFUL_TIMEOUT_MS } from '../../common/constants/constants.js';

function isAlive(pid: number): boolean {
    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
}

async function waitForExit(pid: number): Promise<boolean> {
    const deadline = Date.now() + GRACEFUL_TIMEOUT_MS;

    while (Date.now() < deadline) {
        if (!isAlive(pid)) return true;
        await new Promise((res) => setTimeout(res, 500));
    }

    return false;
}

export async function stopWorkers(): Promise<void> {
    const workers = readAllWorkers();

    if (workers.length === 0) {
        console.log('No running workers found.');
        return;
    }

    console.log(`Found ${workers.length} worker(s). Sending SIGTERM...`);

    const alive: WorkerEntry[]   = [];
    const stale: WorkerEntry[]   = [];

    for (const w of workers) {
        if (isAlive(w.pid)) {
            alive.push(w);
        } else {
            stale.push(w);
        }
    }

    for (const w of stale) {
        console.log(`  [${w.workerId}] (PID ${w.pid}) is already dead — skipping.`);
    }


    for (const w of alive) {
        process.kill(w.pid, 'SIGTERM');
        console.log(`  Sent SIGTERM to [${w.workerId}] (PID ${w.pid}, started ${w.startedAt})`);
    }

    if (alive.length === 0) {
        console.log('All workers were already stopped.');
        return;
    }

    console.log(`Waiting up to ${GRACEFUL_TIMEOUT_MS / 1000}s for workers to finish...`);

    const results = await Promise.all(
        alive.map(async (w) => ({ w, exited: await waitForExit(w.pid) }))
    );


    const timedOut = results.filter(r => !r.exited);

    for (const { w } of results.filter(r => r.exited)) {
        console.log(`  [${w.workerId}] stopped.`);
    }

    for (const { w } of timedOut) {
        console.warn(`  [${w.workerId}] (PID ${w.pid}) did not exit in time. Send SIGKILL manually: kill -9 ${w.pid}`);
    }

    if (timedOut.length === 0) {
        console.log('All workers stopped gracefully.');
    }
}