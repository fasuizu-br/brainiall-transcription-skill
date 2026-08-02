import test from "node:test";
import assert from "node:assert/strict";
import { validateCaption } from "./caption-qa.mjs";

test("accepts a reviewed WebVTT fixture", () => {
  const result = validateCaption("WEBVTT\n\n00:00:00.000 --> 00:00:01.200\nOlá\n\n00:00:01.300 --> 00:00:02.000\nMundo\n", "fixture.vtt");
  assert.equal(result.ok, true);
  assert.equal(result.cues.length, 2);
});

test("rejects overlapping SRT cues", () => {
  const result = validateCaption("1\n00:00:00,000 --> 00:00:02,000\nA\n\n2\n00:00:01,000 --> 00:00:03,000\nB\n", "fixture.srt");
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("cue_2: overlaps_previous"));
});

test("rejects VTT without its header", () => {
  const result = validateCaption("00:00:00.000 --> 00:00:01.000\ntexto\n", "fixture.vtt");
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("missing_webvtt_header"));
});
