Demo Link: https://drive.google.com/file/d/1bX9chR7W4H7oyTcJyC5OjB7dc03DqMDa/view?usp=sharing

<div align="center">

<video src="https://github.com/user-attachments/assets/dff3490b-9368-45fb-b31e-1f00acc3ac89" autoplay loop muted playsinline width="100%"></video>

# QueueCTL

A simple job queue CLI for Node.js. Enqueue shell commands, run workers to process them, and manage failures — all from your terminal.

</div>

---

## Setup

**Requirements:** Node.js 18+

```bash
# 1. Clone and install dependencies
git clone https://github.com/DeviSriSaiCharan/queuectl.git
cd queuectl
npm install

# 2. Build
npm run build

# 3. Link globally so you can use the `queuectl` command anywhere
npm link
```

That's it. No external database or services needed — queuectl uses SQLite stored locally.

---

## How it works

1. You **enqueue** a job (a shell command).
2. **Workers** pick up jobs from the queue and run them one at a time.
3. If a job fails, it **retries automatically** with a backoff delay.
4. After all retries are exhausted, the job moves to the **Dead Letter Queue (DLQ)**.
5. You can **retry dead jobs** manually from the DLQ.

---

## Commands

### Enqueue a job

```bash
queuectl enqueue '{"command": "echo Hello World"}'
queuectl enqueue '{"command": "sleep 10"}'
queuectl enqueue '{"command": "node scripts/process.js"}'
```

Adds a new job to the queue. The `command` is any shell command.

---

### Start workers

```bash
queuectl worker start --count 3
```

Starts 3 workers that continuously poll the queue and run jobs. Workers run in the foreground — press `Ctrl+C` to stop them gracefully.

| Flag | Default | Description |
|---|---|---|
| `--count` | `2` | Number of worker processes to start |

---

### Stop workers

```bash
queuectl worker stop
```

Gracefully stops all running workers from any terminal. Each worker finishes its current job before exiting — no jobs are abandoned.

---

### View queue status

```bash
queuectl status
```

Shows a summary of all job states and how many workers are currently active.

```
Queue Status
────────────────────────
  Pending    : 4
  Processing : 2
  Completed  : 31
  Failed     : 0
  Dead       : 1
────────────────────────
  Active workers: 2
    - worker-1 (PID 49580, started 2026-07-29T...)
    - worker-2 (PID 49581, started 2026-07-29T...)
```

---

### List jobs by state

```bash
queuectl list --state pending
queuectl list --state failed
queuectl list --state completed --json
```

Lists all jobs in the given state. Use `--json` to get raw JSON output.

| State | Description |
|---|---|
| `pending` | Waiting to be picked up |
| `processing` | Currently running |
| `completed` | Finished successfully |
| `failed` | Failed but will be retried |
| `dead` | Exhausted all retries, in DLQ |

---

### Dead Letter Queue (DLQ)

**List dead jobs:**
```bash
queuectl dlq list
queuectl dlq list --json
```

**Retry a dead job:**
```bash
queuectl dlq retry <job-id>
```

Re-enqueues the job with a fresh retry cycle (attempts reset to 0). The job will go through the full retry sequence again.

---

### Configuration

```bash
queuectl config set max-retries 5
queuectl config get max-retries
```

Sets the default number of retry attempts for **new jobs**. Existing jobs in the queue are not affected.

| Key | Default | Description |
|---|---|---|
| `max-retries` | `3` | How many times a job is retried before going to the DLQ |

Config is stored at `~/.queuectl/config.json`.

---

## Retry & Backoff

When a job fails, it is not retried immediately. The delay before the next retry grows exponentially:

```
delay = 2 ^ attempts  seconds

Attempt 1 failed → retry after  2s
Attempt 2 failed → retry after  4s
Attempt 3 failed → retry after  8s  → moved to DLQ
```

---

## Data & Files

| Path | What's stored |
|---|---|
| `~/.queuectl/queue.db` | SQLite database — all jobs and their state |
| `~/.queuectl/workers.json` | Registry of currently running workers (PIDs) |
| `~/.queuectl/config.json` | Your configuration (max-retries, etc.) |
