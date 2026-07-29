import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  BRAINIALL_TRANSCRIBE_URL,
  callBrainiall,
  createCues,
  inspectMedia,
  parseTranscript,
  renderSrt,
  renderVtt,
  transcribeToNewDirectory,
} from "./lib.mjs";

const payload = {
  text: "Bom dia. Hola!",
  words: [
    { word: "Bom", start: 0, end: 0.2, speaker: "SPEAKER_00" },
    { word: "dia", start: 0.2, end: 0.4, speaker: "SPEAKER_00" },
    { word: ".", start: 0.4, end: 0.45, speaker: "SPEAKER_00" },
    { word: "Hola", start: 1, end: 1.3, speaker: "SPEAKER_01" },
    { word: "!", start: 1.3, end: 1.4, speaker: "SPEAKER_01" },
  ],
};

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "brainiall-skill-test-"));
  const input = join(directory, "synthetic.wav");
  await writeFile(input, Buffer.from("RIFFsynthetic-test-only"));
  return { directory, input, output: join(directory, "output") };
}

test("parses timestamps and renders speaker-labelled captions", () => {
  const transcript = parseTranscript(payload);
  const cues = createCues(transcript.words);
  assert.equal(cues.length, 2);
  assert.match(renderSrt(cues, "pt"), /Falante 1: Bom dia\./u);
  assert.match(renderVtt(cues, "es"), /^WEBVTT[\s\S]*Hablante 2: Hola!/u);
});

test("sends the fixed multipart contract without exposing the key", async () => {
  const item = await fixture();
  try {
    const media = await inspectMedia(item.input);
    const fetcher = async (url, init) => {
      assert.equal(url, BRAINIALL_TRANSCRIBE_URL);
      assert.equal(init.method, "POST");
      assert.equal(init.redirect, "error");
      assert.equal(init.headers.Authorization, "Bearer test-key");
      assert.equal(init.body.get("language"), "pt");
      assert.equal(init.body.get("diarize"), "true");
      assert.equal(init.body.get("audio").name, "upload.wav");
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };
    const transcript = await callBrainiall(media, "pt", "test-key", fetcher);
    assert.equal(transcript.words.length, 5);
    assert.doesNotMatch(JSON.stringify(transcript), /test-key/u);
  } finally {
    await rm(item.directory, { recursive: true, force: true });
  }
});

test("requires explicit consent before any API request", async () => {
  const item = await fixture();
  let calls = 0;
  try {
    await assert.rejects(
      transcribeToNewDirectory({
        inputPath: item.input,
        language: "pt",
        outputDirectory: item.output,
        rightsAndConsent: false,
        apiKey: "test-key",
        fetcher: async () => {
          calls += 1;
          return new Response();
        },
      }),
      /rights and speaker consent/u,
    );
    assert.equal(calls, 0);
  } finally {
    await rm(item.directory, { recursive: true, force: true });
  }
});

test("writes private JSON, SRT, and VTT files from a mocked response", async () => {
  const item = await fixture();
  try {
    const result = await transcribeToNewDirectory({
      inputPath: item.input,
      language: "pt",
      outputDirectory: item.output,
      rightsAndConsent: true,
      apiKey: "test-key",
      fetcher: async () => new Response(JSON.stringify(payload), { status: 200 }),
    });
    assert.equal(result.speakerCount, 2);
    assert.equal(result.wordCount, 5);
    assert.deepEqual(JSON.parse(await readFile(result.outputs.json, "utf8")), parseTranscript(payload));
    assert.match(await readFile(result.outputs.srt, "utf8"), /00:00:00,000/u);
    assert.match(await readFile(result.outputs.vtt, "utf8"), /^WEBVTT/u);
    await assert.rejects(
      transcribeToNewDirectory({
        inputPath: item.input,
        language: "pt",
        outputDirectory: item.output,
        rightsAndConsent: true,
        apiKey: "test-key",
        fetcher: async () => new Response(JSON.stringify(payload), { status: 200 }),
      }),
      /EEXIST/u,
    );
  } finally {
    await rm(item.directory, { recursive: true, force: true });
  }
});

test("redacts upstream bodies and forbids automatic ambiguity retries", async () => {
  const item = await fixture();
  try {
    const media = await inspectMedia(item.input);
    await assert.rejects(
      callBrainiall(
        media,
        "pt",
        "test-key",
        async () => new Response("secret upstream detail", { status: 401 }),
      ),
      (error) => {
        assert.equal(error.message, "BRAINIALL rejected the API key.");
        assert.doesNotMatch(error.message, /secret|test-key/u);
        return true;
      },
    );
    let calls = 0;
    await assert.rejects(
      callBrainiall(media, "pt", "test-key", async () => {
        calls += 1;
        throw new Error("socket reset after upload");
      }),
      /do not retry automatically/u,
    );
    assert.equal(calls, 1);
  } finally {
    await rm(item.directory, { recursive: true, force: true });
  }
});

test("rejects unsupported extensions and languages", async () => {
  const item = await fixture();
  try {
    const textFile = join(item.directory, "private.txt");
    await writeFile(textFile, "not media");
    await assert.rejects(inspectMedia(textFile), /extension is not supported/u);
    const link = join(item.directory, "linked.wav");
    await symlink(item.input, link);
    await assert.rejects(inspectMedia(link), /must not be a symbolic link/u);
    const media = await inspectMedia(item.input);
    await assert.rejects(callBrainiall(media, "en", "test-key", async () => new Response()), /pt or es/u);
  } finally {
    await rm(item.directory, { recursive: true, force: true });
  }
});
