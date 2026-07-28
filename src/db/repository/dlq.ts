import { AppDataSource } from '../db.js';
import { Job } from '../entities/jobs.entity.js';
import { JobStatus } from '../../common/enum/job-status.enum.js';

export async function getDeadJobs(): Promise<Job[]> {
    const jobRepo = AppDataSource.getRepository(Job);
    return jobRepo.find({ where: { status: JobStatus.DEAD }, order: { updatedAt: 'DESC' } });
}

export async function retryJob(id: string): Promise<boolean> {
    const jobRepo = AppDataSource.getRepository(Job);

    const result = await jobRepo.update(
        { id, status: JobStatus.DEAD },
        { status: JobStatus.PENDING, attempts: 0, runAfter: null }
    );

    return (result.affected ?? 0) > 0;
}
