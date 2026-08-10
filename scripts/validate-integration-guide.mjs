import { readFile } from 'node:fs/promises';

const guide = await readFile(new URL('../docs/API_CLIENT_IMPORTS.md', import.meta.url), 'utf8');
const llms = await readFile(new URL('../docs/llms.txt', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');

const specUrl = 'https://raw.githubusercontent.com/fasuizu-br/brainiall-transcription-skill/main/openapi/brainiall-diarized-transcription.openapi.json';

for (const [name, text] of [['guide', guide], ['llms', llms]]) {
  if (!text.includes(specUrl)) throw new Error(`${name} does not reference the canonical OpenAPI URL`);
}

for (const [name, text] of [['guide', guide], ['llms', llms], ['README', readme]]) {
  if (/sk-[A-Za-z0-9_-]{12,}|BRAINIALL_API_KEY\s*=\s*\S+/i.test(text)) {
    throw new Error(`${name} appears to contain a credential value`);
  }
}

for (const marker of ['Insomnia', 'Bruno', 'Hoppscotch', 'Yaak', 'Kiota', 'do not automatically retry']) {
  if (!guide.includes(marker)) throw new Error(`integration guide is missing ${marker}`);
}

const runInInsomnia = 'https://app.insomnia.rest/run?operationId=transcribeAuthorizedRecording&specUrl=';
if (!guide.includes(runInInsomnia) || !readme.includes(runInInsomnia)) {
  throw new Error('Run in Insomnia route is missing');
}

console.log('Integration guide validation passed.');
