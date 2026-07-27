import { exec } from "child_process";
import { initializeDatabase, AppDataSource } from "../../db/db.js";
import { Job } from "../../db/entities/jobs.entity.js";
import { JobStatus } from "../../common/enum/job-status.enum.js";

const POLL_INTERVAL_MS = 2000;

async function processJob(job: Job): Promise<void> {
  const jobRepo = AppDataSource.getRepository(Job);

  job.status = JobStatus.PROCESSING;
  job.attempts += 1;
  await jobRepo.save(job);

  try {
    console.log(`[${workerId}] Running job ${job.id}: ${job.command}`);

    await runCommand(job.command);

    job.status = JobStatus.COMPLETED;
    console.log(`[${workerId}] Job ${job.id} completed.`);
  } catch (err) {
    console.error(`[${workerId}] Job ${job.id} failed:`, err);

    if (job.attempts >= job.maxAttempts) {
      job.status = JobStatus.DEAD;
      console.warn(`[${workerId}] Job ${job.id} marked as DEAD after ${job.attempts} attempts.`);
    } else {
      job.status = JobStatus.FAILED;
      console.warn(`[${workerId}] Job ${job.id} will be retried (attempt ${job.attempts}/${job.maxAttempts}).`);
    }
  }

  await jobRepo.save(job);
}

function runCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = exec(command);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

async function pollJobs(): Promise<void> {
  const jobRepo = AppDataSource.getRepository(Job);

  const job = await jobRepo.findOne({
    where: [{ status: JobStatus.PENDING }, { status: JobStatus.FAILED }],
    order: { createdAt: "ASC" },
  });

  if (job) {
    await processJob(job);
  }
}

var workerId = process.argv[2] || "worker";

async function main(): Promise<void> {
  console.log(`[${workerId}] Connecting to database...`);
  await initializeDatabase();
  console.log(`[${workerId}] Database ready. Starting job poll loop.`);

  while (true) {
    await pollJobs();
    await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
  }
}

main().catch((err) => {
  console.error(`[${workerId}] Fatal error:`, err);
  process.exit(1);
});