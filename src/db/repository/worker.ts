import { AppDataSource } from '../../db/db.js';
import { Job } from '../entities/jobs.entity.js';
import { JobStatus } from '../../common/enum/job-status.enum.js';
import { MARK_ALIVE_INTERVAL_MS } from '../../common/constants/constants.js';
import { In, LessThan } from 'typeorm';

export async function markAsAlive(jobId: string): Promise<void> {
    if(!jobId.trim()) return;

    const jobRepo = AppDataSource.getRepository(Job);

    await jobRepo.update(
        {id: jobId}, 
        { updatedAt: new Date() }
    )
}


export async function checkForHaltedJobs(): Promise<Job[]> {
    const jobRepo = AppDataSource.getRepository(Job);
    
    const tenSecondsAgo = new Date(Date.now() - MARK_ALIVE_INTERVAL_MS * 2);
    
    const haltedJobs = await jobRepo.find({
        where: {
            status: JobStatus.PROCESSING,
            updatedAt: LessThan(tenSecondsAgo)
        }
    });

    return haltedJobs;
}

export async function markJobsAsPending(jobs: Job[]) {
    const jobRepo = AppDataSource.getRepository(Job);

    await jobRepo.update(
        { id: In(jobs.map(job => job.id)), status: JobStatus.PROCESSING },
        { status: JobStatus.PENDING }
    )
}

export async function updateJobStatusToPending() {
    const jobRepo = AppDataSource.getRepository(Job);
    await jobRepo.update(
        { status: JobStatus.PROCESSING },
        { status: JobStatus.PENDING }
    );
}