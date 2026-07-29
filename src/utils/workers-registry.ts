import fs from 'fs';
import path from 'path';
import os from 'os';
import type { WorkerEntry } from '../common/types/worker-entry.js';

const REGISTRY_DIR  = path.join(os.homedir(), '.queuectl');
const REGISTRY_FILE = path.join(REGISTRY_DIR, 'workers.json');


function readRegistry(): WorkerEntry[] {
    try {
        const raw = fs.readFileSync(REGISTRY_FILE, 'utf8');
        return JSON.parse(raw) as WorkerEntry[];
    } catch {
        return [];
    }
}

function writeRegistry(entries: WorkerEntry[]): void {
    fs.mkdirSync(REGISTRY_DIR, { recursive: true });
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

/** Called by a worker process on startup to register itself. */
export function registerWorker(entry: WorkerEntry): void {
    const entries = readRegistry();
    entries.push(entry);
    writeRegistry(entries);
}

/** Called by a worker process on exit to remove itself from the registry. */
export function deregisterWorker(workerId: string): void {
    const entries = readRegistry().filter(e => e.workerId !== workerId);
    writeRegistry(entries);
}

/** Returns all registered worker entries. */
export function readAllWorkers(): WorkerEntry[] {
    return readRegistry();
}
