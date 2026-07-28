import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR  = path.join(os.homedir(), '.queuectl');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface Config {
    maxRetries: number;
}

const DEFAULTS: Config = {
    maxRetries: 3,
};

export function readConfig(): Config {
    try {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Config>) };
    } catch {
        return { ...DEFAULTS };
    }
}

export function writeConfig(config: Config): void {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

export function getMaxRetries(): number {
    return readConfig().maxRetries;
}
