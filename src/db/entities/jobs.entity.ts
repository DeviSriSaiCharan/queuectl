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

    @Column()
    attempts: number;

    @Column()
    maxAttempts: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}