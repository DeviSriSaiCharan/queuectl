import { initializeDatabase } from '../../db/db.js';
import { getQueueStatus } from '../../db/repository/job.js';
import { readAllWorkers } from '../../utils/workers-registry.js';

export async function showStatus(): Promise<void> {
    await initializeDatabase();

    const counts       = await getQueueStatus();
    const activeWorkers = readAllWorkers();

    console.log('\nQueue Status');
    console.log('────────────────────────');
    console.log(`  Pending    : ${counts.pending}`);
    console.log(`  Processing : ${counts.processing}`);
    console.log(`  Completed  : ${counts.completed}`);
    console.log(`  Failed     : ${counts.failed}`);
    console.log(`  Dead       : ${counts.dead}`);
    console.log('────────────────────────');
    console.log(`  Active workers: ${activeWorkers.length}`);

    if (activeWorkers.length > 0) {
        for (const w of activeWorkers) {
            console.log(`    - ${w.workerId} (PID ${w.pid}, started ${w.startedAt})`);
        }
    }

    console.log('');
}
