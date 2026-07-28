import { exec } from "child_process";
import { initializeDatabase, AppDataSource } from "../../db/db.js";
import { Job } from "../../db/entities/jobs.entity.js";
import { JobStatus } from "../../common/enum/job-status.enum.js";
import { markAsAlive } from "../../db/repository/worker.js";
import { POLL_INTERVAL_MS, MARK_ALIVE_INTERVAL_MS } from "../../common/constants/constants.js";


let jobId = '';

async function processJob(job: Job): Promise<void> {
  const jobRepo = AppDataSource.getRepository(Job);
  jobId = job.id;

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
  } finally {
    jobId = '';
    await jobRepo.save(job);
  }
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

 const job = await jobRepo.query(`
    UPDATE jobs
    SET status = '${JobStatus.PROCESSING}', attempts = attempts + 1
    WHERE id = (
      SELECT id FROM jobs
      WHERE status IN ('${JobStatus.PENDING}', '${JobStatus.FAILED}')
      ORDER BY createdAt ASC
      LIMIT 1
    )
    RETURNING *;
  `)

  if (job.length > 0) {
    await processJob(job[0]);
  }
}

var workerId = process.argv[2] || "worker-?";

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


const markAliveInterval = setInterval(async () => {
  await markAsAlive(jobId);
}, MARK_ALIVE_INTERVAL_MS);

process.on("SIGINT", () => {
  console.log(`[${workerId}] Received SIGINT. Exiting...`);
  clearInterval(markAliveInterval);
  process.exit(0);
});


process.on("SIGTERM", () => {
  console.log(`[${workerId}] Received SIGTERM. Exiting...`);
  clearInterval(markAliveInterval);
  process.exit(0);
});