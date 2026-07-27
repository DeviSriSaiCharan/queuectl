import type { JobDetailsInput } from '../../common/types/job-details-input.js';
import { initializeDatabase, syncDatabase, AppDataSource } from '../../db/db.js';
import { Job } from '../../db/entities/jobs.entity.js';

export async function enqueueJob(jobDetails: JobDetailsInput) {
    console.log(`Syncing database schema...`);
    await syncDatabase();
    console.log(`Database ready.`);

    console.log(`Connecting to database...`);
    await initializeDatabase();
    console.log(`Database connected. Enqueuing job...`);

    const jobRepo = AppDataSource.getRepository(Job);
    const newJob = jobRepo.create({
        command: jobDetails.command,
    })
    await jobRepo.save(newJob);
    console.log(`Job enqueued with ID: ${newJob.id}`);
}
