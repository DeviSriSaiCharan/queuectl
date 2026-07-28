import { readConfig, writeConfig } from '../../utils/config.js';

const VALID_KEYS = ['max-retries'] as const;
type ConfigKey = typeof VALID_KEYS[number];

function parseKey(key: string): ConfigKey {
    if (!VALID_KEYS.includes(key as ConfigKey)) {
        console.error(`Unknown config key "${key}". Valid keys: ${VALID_KEYS.join(', ')}`);
        process.exit(1);
    }
    return key as ConfigKey;
}

export function configSet(key: string, value: string): void {
    parseKey(key);

    const config = readConfig();

    if (key === 'max-retries') {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 1) {
            console.error('max-retries must be a positive integer.');
            process.exit(1);
        }
        config.maxRetries = parsed;
    }

    writeConfig(config);
    console.log(`Config updated: ${key} = ${value}`);
}

export function configGet(key: string): void {
    parseKey(key);

    const config = readConfig();

    if (key === 'max-retries') {
        console.log(`max-retries = ${config.maxRetries}`);
    }
}
