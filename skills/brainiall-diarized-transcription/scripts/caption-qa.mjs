#!/usr/bin/env node
import fs from "node:fs";

const TIMING = /^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})[,.](\d{3})(?:\s+.*)?$/;

function milliseconds(match) {
  const [, hh, mm, ss, ms] = match;
  return (((Number(hh) * 60 + Number(mm)) * 60 + Number(ss)) * 1000) + Number(ms);
}

function validateBlocks(blocks, kind) {
  const errors = [];
  const cues = [];
  let previousEnd = -1;
  for (let index = 0; index < blocks.length; index += 1) {
    const lines = blocks[index].split(/\r?\n/).map((line) => line.trimEnd());
    if (!lines.some(Boolean)) continue;
    const timingIndex = lines.findIndex((line) => TIMING.test(line));
    if (timingIndex < 0) {
      errors.push(`cue_${index + 1}: missing timing`);
      continue;
    }
    const timing = lines[timingIndex].match(TIMING);
    const start = milliseconds(timing.slice(0, 5));
    const end = milliseconds([timing[0], ...timing.slice(5, 9)]);
    const text = lines.slice(timingIndex + 1).filter(Boolean).join(" ");
    if (end <= start) errors.push(`cue_${index + 1}: end_not_after_start`);
    if (start < previousEnd) errors.push(`cue_${index + 1}: overlaps_previous`);
    if (!text) errors.push(`cue_${index + 1}: empty_text`);
    previousEnd = Math.max(previousEnd, end);
    cues.push({ cue: cues.length + 1, startMs: start, endMs: end, chars: text.length });
  }
  if (kind === "srt") {
    for (let index = 0; index < blocks.length; index += 1) {
      const first = blocks[index].split(/\r?\n/).find((line) => line.trim());
      if (first && !/^\d+$/.test(first.trim())) errors.push(`cue_${index + 1}: missing_srt_index`);
    }
  }
  return { ok: errors.length === 0 && cues.length > 0, kind, cues, errors };
}

export function validateCaption(text, extension = "") {
  const normalized = String(text).replace(/^\uFEFF/, "");
  const kind = extension.toLowerCase().endsWith(".vtt") || /^WEBVTT(?:\s|$)/.test(normalized) ? "vtt" : "srt";
  if (kind === "vtt" && !/^WEBVTT(?:\s|$)/.test(normalized)) return { ok: false, kind, cues: [], errors: ["missing_webvtt_header"] };
  const body = kind === "vtt" ? normalized.replace(/^WEBVTT[^\n]*(?:\r?\n){1,2}/, "") : normalized;
  return validateBlocks(body.split(/\r?\n\s*\r?\n/), kind);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: brainiall-caption-qa <file.srt|file.vtt>");
    process.exit(2);
  }
  const result = validateCaption(fs.readFileSync(file, "utf8"), file);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = result.ok ? 0 : 1;
}
