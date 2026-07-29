import { constants } from "node:fs";
import { lstat, mkdir, open, rm, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

export const BRAINIALL_TRANSCRIBE_URL =
  "https://api.brainiall.com/v1/whisper/transcribe";
export const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

const ALLOWED_MEDIA = new Map([
  [".m4a", "audio/mp4"],
  [".mp3", "audio/mpeg"],
  [".mp4", "video/mp4"],
  [".mpeg", "video/mpeg"],
  [".mpga", "audio/mpeg"],
  [".ogg", "audio/ogg"],
  [".wav", "audio/wav"],
  [".webm", "audio/webm"],
]);

function cleanText(value) {
  return value.replace(/\s+/gu, " ").trim();
}

function cleanSpeaker(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return "unknown";
  }
  return cleanText(String(value)).slice(0, 64) || "unknown";
}

function joinTokens(tokens) {
  let result = "";
  for (const rawToken of tokens) {
    const token = cleanText(rawToken);
    if (!token) continue;
    if (!result || /^[,.;:!?%…\)\]\}]/u.test(token) || /[\(\[\{]$/u.test(result)) {
      result += token;
    } else {
      result += ` ${token}`;
    }
  }
  return result;
}

export function parseTranscript(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.words)) {
    throw new Error("BRAINIALL returned an invalid transcription response.");
  }

  const words = [];
  for (const item of value.words) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const token = typeof item.word === "string"
      ? cleanText(item.word)
      : typeof item.text === "string"
        ? cleanText(item.text)
        : "";
    if (
      !token ||
      typeof item.start !== "number" ||
      !Number.isFinite(item.start) ||
      item.start < 0 ||
      typeof item.end !== "number" ||
      !Number.isFinite(item.end) ||
      item.end <= item.start
    ) {
      continue;
    }
    words.push({
      word: token,
      start: item.start,
      end: item.end,
      speaker: cleanSpeaker(item.speaker),
    });
  }

  if (words.length === 0) {
    throw new Error("BRAINIALL returned no timestamped words.");
  }
  words.sort((left, right) => left.start - right.start || left.end - right.end);
  const responseText = typeof value.text === "string" ? cleanText(value.text) : "";
  return { text: responseText || joinTokens(words.map((item) => item.word)), words };
}

export function createCues(words) {
  const cues = [];
  const speakerNumbers = new Map();
  let current = [];

  const speakerNumber = (speaker) => {
    if (!speakerNumbers.has(speaker)) speakerNumbers.set(speaker, speakerNumbers.size + 1);
    return speakerNumbers.get(speaker);
  };
  const flush = () => {
    if (current.length === 0) return;
    cues.push({
      start: current[0].start,
      end: current.at(-1).end,
      speaker: speakerNumber(current[0].speaker),
      text: joinTokens(current.map((item) => item.word)),
    });
    current = [];
  };

  for (const word of words) {
    if (current.length === 0) {
      current.push(word);
      continue;
    }
    const first = current[0];
    const previous = current.at(-1);
    const candidate = joinTokens([...current.map((item) => item.word), word.word]);
    if (
      word.speaker !== first.speaker ||
      word.end - first.start > 6 ||
      word.start - previous.end > 1.5 ||
      candidate.length > 84
    ) {
      flush();
    }
    current.push(word);
  }
  flush();
  return cues;
}

function timestamp(seconds, separator) {
  const total = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const secs = Math.floor((total % 60_000) / 1000);
  const millis = total % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}${separator}${String(millis).padStart(3, "0")}`;
}

function label(language, speaker) {
  return `${language === "pt" ? "Falante" : "Hablante"} ${speaker}`;
}

export function renderSrt(cues, language) {
  return `${cues.map((cue, index) =>
    `${index + 1}\n${timestamp(cue.start, ",")} --> ${timestamp(cue.end, ",")}\n${label(language, cue.speaker)}: ${cue.text}`,
  ).join("\n\n")}\n`;
}

export function renderVtt(cues, language) {
  return `WEBVTT\n\n${cues.map((cue) =>
    `${timestamp(cue.start, ".")} --> ${timestamp(cue.end, ".")}\n${label(language, cue.speaker)}: ${cue.text}`,
  ).join("\n\n")}\n`;
}

function safeApiError(status) {
  if (status === 401 || status === 403) return new Error("BRAINIALL rejected the API key.");
  if (status === 402) return new Error("BRAINIALL account has insufficient balance.");
  if (status === 413) return new Error("BRAINIALL rejected the media size.");
  if (status === 429) return new Error("BRAINIALL rate limit reached.");
  if (status >= 500) return new Error("BRAINIALL service is temporarily unavailable.");
  return new Error(`BRAINIALL transcription failed with HTTP ${status}.`);
}

export async function inspectMedia(inputPath) {
  const absolutePath = resolve(inputPath);
  let info;
  try {
    info = await lstat(absolutePath, { bigint: false });
  } catch {
    throw new Error("Could not read the input media.");
  }
  if (info.isSymbolicLink()) throw new Error("Input media must not be a symbolic link.");
  if (!info.isFile()) throw new Error("Input must be one regular local file.");
  if (info.size < 1) throw new Error("Input media is empty.");
  if (info.size > MAX_MEDIA_BYTES) throw new Error("Input media exceeds 25 MB.");
  const extension = extname(absolutePath).toLowerCase();
  const contentType = ALLOWED_MEDIA.get(extension);
  if (!contentType) throw new Error("Input media extension is not supported.");
  return { absolutePath, contentType, filename: `upload${extension}`, size: info.size };
}

export async function callBrainiall(media, language, apiKey, fetcher = fetch) {
  const key = typeof apiKey === "string" ? apiKey.trim() : "";
  if (!key || key.length > 4096 || /[\r\n]/u.test(key)) {
    throw new Error("BRAINIALL_API_KEY is missing or invalid.");
  }
  if (language !== "pt" && language !== "es") {
    throw new Error("Language must be pt or es.");
  }

  let handle;
  let bytes;
  try {
    handle = await open(media.absolutePath, constants.O_RDONLY | constants.O_NOFOLLOW);
    const current = await handle.stat();
    if (!current.isFile() || current.size !== media.size) {
      throw new Error("Input media changed before upload.");
    }
    bytes = await handle.readFile();
  } catch (error) {
    if (error instanceof Error && error.message === "Input media changed before upload.") {
      throw error;
    }
    throw new Error("Could not read the input media for upload.");
  } finally {
    await handle?.close();
  }
  const form = new FormData();
  form.set("audio", new Blob([bytes], { type: media.contentType }), media.filename);
  form.set("language", language);
  form.set("diarize", "true");

  let response;
  try {
    response = await fetcher(BRAINIALL_TRANSCRIBE_URL, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(180_000),
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
  } catch {
    throw new Error("Could not confirm the BRAINIALL transcription result; do not retry automatically.");
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw safeApiError(response.status);
  }
  try {
    return parseTranscript(await response.json());
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("BRAINIALL returned")) throw error;
    throw new Error("BRAINIALL returned invalid JSON.");
  }
}

export async function transcribeToNewDirectory({
  inputPath,
  language,
  outputDirectory,
  rightsAndConsent,
  apiKey,
  fetcher = fetch,
}) {
  if (rightsAndConsent !== true) {
    throw new Error("Confirm rights and speaker consent before processing media.");
  }
  const media = await inspectMedia(inputPath);
  const outputPath = resolve(outputDirectory);
  await mkdir(outputPath, { recursive: false });

  try {
    const transcript = await callBrainiall(media, language, apiKey, fetcher);
    const cues = createCues(transcript.words);
    const jsonPath = resolve(outputPath, "transcript.json");
    const srtPath = resolve(outputPath, "transcript.srt");
    const vttPath = resolve(outputPath, "transcript.vtt");
    await writeFile(jsonPath, `${JSON.stringify(transcript, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await writeFile(srtPath, renderSrt(cues, language), {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await writeFile(vttPath, renderVtt(cues, language), {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    return {
      outputs: { json: jsonPath, srt: srtPath, vtt: vttPath },
      speakerCount: new Set(transcript.words.map((item) => item.speaker)).size,
      wordCount: transcript.words.length,
    };
  } catch (error) {
    await rm(outputPath, { recursive: true, force: true });
    throw error;
  }
}
