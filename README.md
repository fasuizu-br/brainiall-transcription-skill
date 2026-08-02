# BRAINIALL diarized transcription skill

An installable Agent Skill for converting one explicitly authorized Brazilian
Portuguese or Spanish recording into speaker-labelled JSON, SRT, and WebVTT.
It uses the external metered BRAINIALL transcription API and includes a tested,
dependency-free Node.js 22 client.

## Install

```bash
npx skills add fasuizu-br/brainiall-transcription-skill \
  --skill brainiall-diarized-transcription
```

The skill guides the agent through consent, local-file and size checks, a
dedicated `BRAINIALL_API_KEY`, and a single non-retried API request. Create or
manage the required account through the
[skill-specific setup link](https://app.brainiall.com/?utm_source=skills_sh&utm_medium=agent_skill&utm_campaign=diarized_transcription)
and check the current terms before live use.

## Caption QA helper

The repository also includes a dependency-free SRT/WebVTT structural check for CI or a local handoff:

```bash
node skills/brainiall-diarized-transcription/scripts/caption-qa.mjs reviewed.vtt
```

It checks the WebVTT header, cue timing, overlap, empty text, and SRT indexes. It does not assess semantic accuracy, rights, accessibility conformance, or payment, and it never sends media to BRAINIALL.

## Safety boundaries

- One explicit local regular file; no remote URL, directory, glob, or symlink.
- Brazilian Portuguese (`pt`) or Spanish (`es`), with a 25 MB limit.
- Literal rights-and-consent confirmation before any request.
- API key only through the environment; no transcript or upstream error body in logs.
- No automatic retry of a potentially metered request.
- New private output directory containing `transcript.json`, `transcript.srt`, and `transcript.vtt`.

## Validate

```bash
npm test
python3 /path/to/skill-creator/scripts/quick_validate.py \
  skills/brainiall-diarized-transcription
```

The test suite uses synthetic bytes and mocked responses. It does not need an
API key, send media, or contact BRAINIALL.

MIT licensed. BRAINIALL is responsible for this repository; it is not endorsed
by Vercel or the maintainers of the skills CLI.

## C104 integration blueprints

Open VSX, JetBrains, editorial, and OSS partner notes live under
`integrations/c104/`. They are public recipes and publication gates only; they
do not claim marketplace approval, installation, partnership, or revenue.

## C105 demand-capture blueprints

The `integrations/c105/` notes cover npm, PyPI, Hugging Face Spaces, Apify
Actors, referrals, and permission-first partner pilots. They are deliberately
provider-neutral recipes: publication requires the corporate account and the
surface's current review rules, while payment still requires a BRAINIALL
checkout, settlement, and reconciliation receipt.

## C106 demand-capture blueprints

The `integrations/c106/` notes cover LinkedIn newsletters and Pages, Reddit,
Indie Hackers, Medium, GitHub Discussions, Docker Hub, RapidAPI, and
alternative storefront preflights. They are research and opt-in recipes, not
claims of publication, approval, installs, partnership, or revenue.

## C107 demand-capture blueprints

The `integrations/c107/` notes cover registry/package preflights, Obsidian and
Zotero knowledge workflows, Chrome/Google Play store gates, and creator caption
QA. They are local, permission-first recipes; no listing, install, partnership,
approval or revenue is implied without a separate receipt.
