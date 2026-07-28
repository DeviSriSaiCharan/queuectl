import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JobStatus } from "../../common/enum/job-status.enum.js";

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    command: string;

    @Column({ default: JobStatus.PENDING })
    status: JobStatus;

    @Column({ default: 0})
    attempts: number;

    @Column({ default: 3 })
    maxAttempts: number;

    @Column({ type: 'datetime', nullable: true, default: null })
    runAfter: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}