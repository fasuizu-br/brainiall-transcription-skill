#!/usr/bin/env node

import { transcribeToNewDirectory } from "../../skills/brainiall-diarized-transcription/scripts/lib.mjs";

const CONFIRMATION = "I_CONFIRM_RIGHTS_AND_COST";

function parse(argv) {
  if (argv.length !== 3) {
    throw new Error("Usage: transcribe-once.mjs INPUT.(mp3|wav|m4a|mp4|mpeg|mpga|webm|ogg) LANGUAGE(pt|es) NEW_OUTPUT_DIRECTORY");
  }
  return { inputPath: argv[0], language: argv[1], outputDirectory: argv[2] };
}

try {
  if (process.env.BRAINIALL_CONFIRM !== CONFIRMATION) {
    throw new Error(`Set BRAINIALL_CONFIRM=${CONFIRMATION} after checking rights, speaker notice or consent, current price, and balance.`);
  }
  const options = parse(process.argv.slice(2));
  const result = await transcribeToNewDirectory({
    ...options,
    rightsAndConsent: true,
    apiKey: process.env.BRAINIALL_API_KEY,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Transcription failed."}\n`);
  process.exitCode = 1;
}
