import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = new URL('../openapi/brainiall-diarized-transcription.openapi.json', import.meta.url);
const document = JSON.parse(await readFile(path, 'utf8'));
const endpoint = document.paths?.['/v1/whisper/transcribe']?.post;
const multipart = endpoint?.requestBody?.content?.['multipart/form-data']?.schema;

assert.equal(document.openapi, '3.1.0');
assert.deepEqual(document.servers, [{
  url: 'https://api.brainiall.com',
  description: 'BRAINIALL production API',
}]);
assert.deepEqual(Object.keys(document.paths), ['/v1/whisper/transcribe']);
assert.equal(endpoint.operationId, 'transcribeAuthorizedRecording');
assert.deepEqual(endpoint.security, [{ bearerAuth: [] }]);
assert.equal(document.components.securitySchemes.bearerAuth.scheme, 'bearer');
assert.equal(multipart.additionalProperties, false);
assert.deepEqual(multipart.required, ['audio', 'language', 'diarize']);
assert.equal(multipart.properties.audio.contentEncoding, 'binary');
assert.deepEqual(multipart.properties.language.enum, ['pt', 'es']);
assert.equal(multipart.properties.diarize.const, true);
assert.equal(endpoint.responses['200'].content['application/json'].schema.$ref, '#/components/schemas/Transcript');
assert.equal(document.components.schemas.Transcript.properties.words.minItems, 1);
assert.equal(endpoint['x-brainiall-safety'].rightsAndConsentRequiredBeforeRequest, true);
assert.equal(endpoint['x-brainiall-safety'].automaticRetryAllowed, false);
assert.equal(endpoint['x-brainiall-safety'].humanReviewRequired, true);
assert.equal(endpoint['x-brainiall-safety'].speakerLabelsAreBiometricIdentity, false);

const serialized = JSON.stringify(document);
assert.doesNotMatch(serialized, /sk-[A-Za-z0-9_-]{8,}|bearer\s+[A-Za-z0-9_-]{8,}/i, 'spec must not contain an API key');
assert.doesNotMatch(serialized, /file:\/\/|\/Users\/|C:\\\\Users\\/i, 'spec must not contain a local file path');
assert.doesNotMatch(serialized, /openai.compatib/i, 'spec must not claim OpenAI compatibility');
assert.doesNotMatch(serialized, /setNextRequest|sendRequest|setTimeout/i, 'spec must not automate retries');

console.log('OpenAPI contract validation: ok');
