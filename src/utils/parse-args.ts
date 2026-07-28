import  { Command } from "commander";
import { displayBanner } from "./banner.js";
import { startWorkers } from "../cli/commands/start-workers.js";
import type { JobDetailsInput } from "../common/types/job-details-input.js";
import { enqueueJob } from "../cli/commands/enqueue-job.js";
import { stopWorkers } from "../cli/commands/stop-workers.js";

export const program = new Command();

program
    .name("queuectl")
    .description("Job Queue Manager for Node.js")


const worker = program.command("worker")

worker
    .command("start")
    .option("-c, --count <number>", "Number of workers to start", "2")
    .action(async (options) => {
        const count = parseInt(options.count);
        if(count < 0) {
            throw new Error("Count must be a non-negative integer.");
        }
        displayBanner();
        await startWorkers(count);
    })

worker
    .command("stop")
    .action(async () => {
        await stopWorkers();
    })

program
    .command("enqueue")
    .arguments("<job>")
    .action(async (job: string) => {
        if(!job) {
            throw new Error("Job details must be provided in JSON format.");
        }

        const jobDetails: JobDetailsInput = JSON.parse(job);
        await enqueueJob(jobDetails);
    })