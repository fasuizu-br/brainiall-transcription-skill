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

## Postman collection

Import [`postman/BRAINIALL-Diarized-Transcription.postman_collection.json`](postman/BRAINIALL-Diarized-Transcription.postman_collection.json) to test the same hosted API without installing a client. Before the request can run, set:

- `brainiall_api_key` as a secret collection variable;
- `confirmed_rights_and_consent` to the exact value `I CONFIRM`;
- the `audio` form-data field to one authorized local recording.

The collection sends one request only and has no automatic retry. It exposes language, diarization, and output-format variables, and includes response checks for JSON plus word timestamps. A request may consume account credit; verify the current price and balance before sending it.

## OpenAPI contract

[`openapi/brainiall-diarized-transcription.openapi.json`](openapi/brainiall-diarized-transcription.openapi.json) is the canonical, machine-readable contract for the same multipart endpoint. Import it into Postman, Bruno, Insomnia, Swagger tooling, or an SDK generator. The document deliberately describes only the verified request and response fields; it does not claim OpenAI compatibility or expose an API key, file path, transcript, or account data.

The OpenAPI file cannot enforce recording rights or speaker consent. The caller must perform that check before selecting a file or sending a request, and must not automatically retry an ambiguous metered upload.

### Import into an API client

[Run the verified operation in Insomnia](https://app.insomnia.rest/run?operationId=transcribeAuthorizedRecording&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Ffasuizu-br%2Fbrainiall-transcription-skill%2Fmain%2Fopenapi%2Fbrainiall-diarized-transcription.openapi.json), or follow the dependency-free [client import guide](docs/API_CLIENT_IMPORTS.md) for Bruno, Hoppscotch, Yaak, Insomnia, and Kiota.

Every route imports the same public contract. It does not include an API key, recording, transcript, or automatic retry. Add a dedicated key locally and choose media only after confirming rights and any required speaker notice or consent.

## Copyable quickstarts

Three audited, single-send examples are available for teams that prefer code over an API client:

- [`examples/curl/transcribe-once.sh`](examples/curl/transcribe-once.sh)
- [`examples/python/transcribe_once.py`](examples/python/transcribe_once.py)
- [`examples/javascript/transcribe-once.mjs`](examples/javascript/transcribe-once.mjs)

All three require the exact environment gate
`BRAINIALL_CONFIRM=I_CONFIRM_RIGHTS_AND_COST`, a dedicated
`BRAINIALL_API_KEY`, one local regular media file, and an explicit `pt` or `es`
language. They reject symlinks, files over 25 MB, existing output targets, and
automatic retries. Review the current account price and balance before running
any example because a successful upload may consume credit.

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
node scripts/validate-postman.mjs
node scripts/validate-openapi.mjs
node scripts/validate-integration-guide.mjs
node scripts/validate-quickstarts.mjs
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

## C108 demand-capture blueprints

The `integrations/c108/` notes cover app marketplaces, ecommerce caption
pilots, and Asana/Linear/Google Workspace workflow fixtures. They are
permission-first research assets; no listing, install, approval, partnership
or revenue is implied without a separate receipt.

## C110 B2B demand fixtures

The `integrations/c110/` notes cover Teams call notes, a HubSpot RevOps
handoff, and a WordPress caption workflow. They are public, permission-first
fixtures: no marketplace submission, tenant install, partnership, or revenue
is implied without a separate receipt.

## C107 demand-capture blueprints

The `integrations/c107/` notes cover registry/package preflights, Obsidian and
Zotero knowledge workflows, Chrome/Google Play store gates, and creator caption
QA. They are local, permission-first recipes; no listing, install, partnership,
approval or revenue is implied without a separate receipt.
