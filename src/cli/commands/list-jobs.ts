import { initializeDatabase } from '../../db/db.js';
import { getJobsByStatus } from '../../db/repository/job.js';
import { JobStatus } from '../../common/enum/job-status.enum.js';

export async function listJobs(state: string, json: boolean): Promise<void> {
    const status = state.toUpperCase() as JobStatus;

    if (!Object.values(JobStatus).includes(status)) {
        console.error(`Invalid state "${state}". Valid states: ${Object.values(JobStatus).join(', ')}`);
        process.exit(1);
    }

    await initializeDatabase();

    const jobs = await getJobsByStatus(status);

    if (json) {
        console.log(JSON.stringify(jobs, null, 2));
        return;
    }

    if (jobs.length === 0) {
        console.log(`No ${status} jobs found.`);
        return;
    }

    console.log(`\n${status} jobs (${jobs.length})`);
    console.log('────────────────────────────────────────────────────────────');

    for (const job of jobs) {
        console.log(`  ID       : ${job.id}`);
        console.log(`  Command  : ${job.command}`);
        console.log(`  Attempts : ${job.attempts}/${job.maxAttempts}`);
        console.log(`  Created  : ${job.createdAt}`);
        console.log('  ──────────────────────────────────────────────────────');
    }
}
