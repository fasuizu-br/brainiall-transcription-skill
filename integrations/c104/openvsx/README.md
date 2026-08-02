# C104 Open VSX transcript blueprint

This is a provider-neutral blueprint for an Open VSX extension that opens one
explicitly authorized local recording, sends it through the existing
`brainiall-diarized-transcription` skill, and exposes a review-first SRT/VTT
handoff. It is documentation only: no extension is published, no Open VSX
account is accessed, and no installation or revenue is claimed.

## Proposed commands

- `Brainiall: Check caption file` runs the local caption QA helper.
- `Brainiall: Prepare transcript` opens the skill instructions and requires
  the user to confirm rights, language, size, and a dedicated API key.
- `Brainiall: Open output folder` opens only the new private output directory.

The extension must never read a directory, follow a remote URL, log media or
transcript text, retry a metered request, or publish an artifact automatically.
See [Open VSX](https://open-vsx.org/) and the
[vendor-neutral registry source](https://github.com/eclipse-openvsx/openvsx)
before considering a real submission.
