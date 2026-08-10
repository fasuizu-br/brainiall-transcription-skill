# Import the BRAINIALL transcription contract

Use this guide to import the same verified OpenAPI 3.1 contract into an API client. The contract describes one operation: `POST /v1/whisper/transcribe` for one explicitly authorized Brazilian Portuguese (`pt`) or Spanish (`es`) recording.

Canonical specification:

```text
https://raw.githubusercontent.com/fasuizu-br/brainiall-transcription-skill/main/openapi/brainiall-diarized-transcription.openapi.json
```

## Safety and cost gate

Before every live request:

1. confirm that you have the rights to use the recording and any required speaker notice or consent;
2. use a dedicated, revocable BRAINIALL API key stored only in the client secret or environment field;
3. select one local file only after those checks;
4. confirm the current price and account balance;
5. send once and do not automatically retry an ambiguous upload.

The public contract and this guide contain no key, recording, transcript, or customer data.

## Insomnia

[Run in Insomnia](https://app.insomnia.rest/run?operationId=transcribeAuthorizedRecording&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Ffasuizu-br%2Fbrainiall-transcription-skill%2Fmain%2Fopenapi%2Fbrainiall-diarized-transcription.openapi.json), then add the bearer token locally and choose an authorized file.

Manual route: create a project, choose **Import**, select **URL**, paste the canonical specification URL, scan it, and import the document.

## Bruno

From the Bruno home screen choose **Import Collection → OpenAPI Specification → URL**, paste the canonical specification URL, and import it. Add bearer authentication locally; do not save a real key in the repository.

## Hoppscotch

Open **Collections → Import → OpenAPI → Import from URL**, paste the canonical specification URL, and import it. Hoppscotch imports the authorization method and headers, but you must supply the secret value locally.

## Yaak

Download the public contract, then import the local file from **Settings → Import/Export → Import**:

```bash
curl --fail --show-error --location \
  --output brainiall-diarized-transcription.openapi.json \
  https://raw.githubusercontent.com/fasuizu-br/brainiall-transcription-skill/main/openapi/brainiall-diarized-transcription.openapi.json
```

Add bearer authentication at workspace or request level after import.

## Kiota

Inspect the contract before generation, then generate only the transcription client surface:

```bash
kiota generate \
  --openapi https://raw.githubusercontent.com/fasuizu-br/brainiall-transcription-skill/main/openapi/brainiall-diarized-transcription.openapi.json \
  --language TypeScript \
  --class-name BrainiallTranscriptionClient \
  --namespace-name Brainiall.Transcription \
  --output ./generated/brainiall-transcription
```

Review generated multipart and authentication handling before any live request. Generated code does not replace the rights, consent, price, or single-send gate.

## Postman

If you need the explicit `I CONFIRM` pre-request gate and response checks, use the repository's [safe Postman collection](../postman/BRAINIALL-Diarized-Transcription.postman_collection.json) instead of generating a generic collection.

## Measurement boundary

An import, download, generated client, successful request, or checkout visit is not revenue. BRAINIALL counts revenue only when an independent buyer is linked server-side to the product event, order, payment, payout, and settlement.
