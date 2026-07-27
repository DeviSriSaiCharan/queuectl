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
    console.log(`[worker] Running job ${job.id}: ${job.command}`);

    await runCommand(job.command);

    job.status = JobStatus.COMPLETED;
    console.log(`[worker] Job ${job.id} completed.`);
  } catch (err) {
    console.error(`[worker] Job ${job.id} failed:`, err);

    if (job.attempts >= job.maxAttempts) {
      job.status = JobStatus.DEAD;
      console.warn(`[worker] Job ${job.id} marked as DEAD after ${job.attempts} attempts.`);
    } else {
      job.status = JobStatus.FAILED;
      console.warn(`[worker] Job ${job.id} will be retried (attempt ${job.attempts}/${job.maxAttempts}).`);
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
    where: { status: JobStatus.PENDING },
    order: { createdAt: "ASC" },
  });

  if (job) {
    await processJob(job);
  }
}

async function main(): Promise<void> {
  console.log("[worker] Connecting to database...");
  await initializeDatabase();
  console.log("[worker] Database ready. Starting job poll loop.");

  while (true) {
    await pollJobs();
    await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
  }
}

main().catch((err) => {
  console.error("[worker] Fatal error:", err);
  process.exit(1);
});