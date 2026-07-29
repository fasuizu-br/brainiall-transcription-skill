#!/usr/bin/env node

import { transcribeToNewDirectory } from "./lib.mjs";

function parseArguments(argv) {
  const values = new Map();
  let rightsAndConsent = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--rights-and-consent") {
      rightsAndConsent = true;
      continue;
    }
    if (!["--input", "--language", "--output-dir"].includes(argument)) {
      throw new Error(`Unknown argument: ${argument}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}.`);
    if (values.has(argument)) throw new Error(`Duplicate argument: ${argument}`);
    values.set(argument, value);
    index += 1;
  }
  for (const required of ["--input", "--language", "--output-dir"]) {
    if (!values.has(required)) throw new Error(`Missing required argument: ${required}`);
  }
  return {
    inputPath: values.get("--input"),
    language: values.get("--language"),
    outputDirectory: values.get("--output-dir"),
    rightsAndConsent,
  };
}

try {
  const options = parseArguments(process.argv.slice(2));
  const result = await transcribeToNewDirectory({
    ...options,
    apiKey: process.env.BRAINIALL_API_KEY,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  const message = error instanceof Error ? error.message : "Transcription failed.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
