#!/usr/bin/env node

import { program } from "../utils/parse-args.js";

try {
    program.parse();
} catch (error: Error | unknown) {
    console.error("Error: " + (error instanceof Error ? error.message : String(error)));
    process.exit(1);
}

