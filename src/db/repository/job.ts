import { AppDataSource } from '../db.js';
import { Job } from '../entities/jobs.entity.js';
import { JobStatus } from '../../common/enum/job-status.enum.js';
import type { QueueStatus } from '../../common/types/queue-status.js';

export async function getQueueStatus(): Promise<QueueStatus['counts']> {
    const jobRepo = AppDataSource.getRepository(Job);

    const rows: { status: string; count: string }[] = await jobRepo.query(`
        SELECT status, COUNT(*) as count
        FROM jobs
        GROUP BY status
    `);

    const counts = {
        pending:    0,
        processing: 0,
        completed:  0,
        failed:     0,
        dead:       0,
    };

    for (const row of rows) {
        switch (row.status) {
            case JobStatus.PENDING:    counts.pending    = Number(row.count); break;
            case JobStatus.PROCESSING: counts.processing = Number(row.count); break;
            case JobStatus.COMPLETED:  counts.completed  = Number(row.count); break;
            case JobStatus.FAILED:     counts.failed     = Number(row.count); break;
            case JobStatus.DEAD:       counts.dead       = Number(row.count); break;
        }
    }

    return counts;
}
