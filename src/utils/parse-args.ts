import  { Command } from "commander";
import { displayBanner } from "./banner.js";
import { startWorkers } from "../cli/commands/start-workers.js";

export const program = new Command();

program
    .name("queuectl")
    .description("Job Queue Manager for Node.js")


const worker = program.command("worker")

worker
    .command("start")
    .option("-c, --count <number>", "Number of workers to start", "2")
    .action((options) => {
        const count = parseInt(options.count);
        if(count < 0) {
            throw new Error("Count must be a non-negative integer.");
        }
        displayBanner();
        console.log(`Starting ${count} worker(s)...`);
        startWorkers(count);
    })
