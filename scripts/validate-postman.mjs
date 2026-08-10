import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = new URL('../postman/BRAINIALL-Diarized-Transcription.postman_collection.json', import.meta.url);
const collection = JSON.parse(await readFile(path, 'utf8'));
const variables = Object.fromEntries(collection.variable.map((item) => [item.key, item]));

assert.equal(collection.info.schema, 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json');
assert.equal(variables.base_url.value, 'https://api.brainiall.com');
assert.equal(variables.brainiall_api_key.type, 'secret');
assert.equal(variables.brainiall_api_key.value, '');
assert.equal(variables.confirmed_rights_and_consent.value, '');
assert.equal(collection.item.length, 1, 'collection must expose one non-retried request');

const item = collection.item[0];
assert.equal(item.request.method, 'POST');
assert.equal(item.request.url, '{{base_url}}/v1/whisper/transcribe');
assert.equal(item.request.body.mode, 'formdata');
assert.equal(item.request.body.formdata.find((field) => field.key === 'audio')?.src, '');
assert.match(JSON.stringify(item.event), /confirmed_rights_and_consent/);
assert.match(JSON.stringify(item.event), /I CONFIRM/);
const executableScripts = item.event.flatMap((event) => event.script?.exec ?? []).join('\n');
assert.doesNotMatch(executableScripts, /setNextRequest|sendRequest|setTimeout/i, 'collection must not automate retries');

console.log('Postman collection validation: ok');
