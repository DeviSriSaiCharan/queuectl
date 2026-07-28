
export interface QueueStatus {
    counts: {
        pending:    number;
        processing: number;
        completed:  number;
        failed:     number;
        dead:       number;
    };
    activeWorkers: number;
}
