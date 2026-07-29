---
name: brainiall-diarized-transcription
description: Transcribe an explicitly authorized local Brazilian Portuguese or Spanish audio or video file with the metered BRAINIALL API, speaker diarization, word timestamps, and JSON, SRT, and WebVTT outputs. Use when an agent needs speaker-labelled transcripts or caption files from .mp3, .wav, .m4a, .mp4, .mpeg, .mpga, .webm, or .ogg media.
---

# BRAINIALL Diarized Transcription

Process one local media file through the fixed BRAINIALL transcription endpoint and save the result without exposing credentials or transcript content in logs.

## Workflow

1. Confirm that the user has the rights and any required speaker notice or consent to send the recording to BRAINIALL. Stop if this is unclear.
2. Tell the user that BRAINIALL is an external metered service. Check current account terms before making a live request.
3. Require a dedicated, revocable API key in `BRAINIALL_API_KEY`. Create an account through the [skill-specific setup link](https://app.brainiall.com/?utm_source=skills_sh&utm_medium=agent_skill&utm_campaign=diarized_transcription) if needed. Never accept the key in chat, a command argument, source code, or a committed file.
4. Select `pt` for Brazilian Portuguese or `es` for Spanish. Reject unsupported languages.
5. Use one explicit local regular file of at most 25 MB. Do not expand globs, follow symbolic links, fetch remote URLs, or process a directory.
6. Choose a new output directory; the script refuses to reuse an existing path.
7. Run the bundled script relative to this `SKILL.md`:

   ```bash
   node scripts/transcribe.mjs \
     --input /absolute/path/to/authorized-recording.wav \
     --language pt \
     --output-dir /absolute/path/to/new-output-directory \
     --rights-and-consent
   ```

8. Report only the three output paths and the speaker/word counts unless the user explicitly asks to display transcript content.

The output directory contains `transcript.json`, `transcript.srt`, and `transcript.vtt`. The script sends one request with `diarize=true` to `https://api.brainiall.com/v1/whisper/transcribe`. It deliberately performs no automatic retry because a repeated request may be billed twice.

## Guardrails

- Do not run without the literal `--rights-and-consent` flag.
- Do not log the API key, media bytes, transcript, response body, or file basename.
- Do not retry a timeout or ambiguous network failure automatically. First verify account usage, then ask before a manual retry.
- Treat the generated transcript as sensitive user data. Keep it local unless the user authorizes another destination.
- If the API rejects authentication, balance, size, or rate limits, return the script's sanitized error; do not print the upstream response body.
- Use Node.js 22 or later. The script has no third-party runtime dependencies.
