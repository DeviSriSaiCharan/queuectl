import { initializeDatabase } from '../../db/db.js';
import { getDeadJobs, retryJob } from '../../db/repository/dlq.js';

export async function dlqList(json: boolean): Promise<void> {
    await initializeDatabase();

    const jobs = await getDeadJobs();

    if (json) {
        console.log(JSON.stringify(jobs, null, 2));
        return;
    }

    if (jobs.length === 0) {
        console.log('No dead jobs in the DLQ.');
        return;
    }

    console.log(`\nDead Letter Queue (${jobs.length} job(s))`);
    console.log('────────────────────────────────────────────────────────────');

    for (const job of jobs) {
        console.log(`  ID       : ${job.id}`);
        console.log(`  Command  : ${job.command}`);
        console.log(`  Attempts : ${job.attempts}/${job.maxAttempts}`);
        console.log(`  Failed at: ${job.updatedAt}`);
        console.log('  ──────────────────────────────────────────────────────');
    }
}

export async function dlqRetry(id: string): Promise<void> {
    await initializeDatabase();

    const requeued = await retryJob(id);

    if (!requeued) {
        console.error(`No dead job found with ID: ${id}`);
        process.exit(1);
    }

    console.log(`Job ${id} re-enqueued successfully.`);
}
