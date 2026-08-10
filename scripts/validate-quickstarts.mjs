import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const files = {
  curl: new URL('../examples/curl/transcribe-once.sh', import.meta.url),
  python: new URL('../examples/python/transcribe_once.py', import.meta.url),
  javascript: new URL('../examples/javascript/transcribe-once.mjs', import.meta.url),
};
const texts = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([name, url]) => [name, await readFile(url, 'utf8')])));

for (const [name, source] of Object.entries(texts)) {
  for (const marker of ['I_CONFIRM_RIGHTS_AND_COST', 'BRAINIALL_API_KEY', 'https://api.brainiall.com/v1/whisper/transcribe']) {
    if (!source.includes(marker) && !(name === 'javascript' && marker.startsWith('https://'))) {
      throw new Error(`${name} quickstart is missing ${marker}`);
    }
  }
  if (/sk-[A-Za-z0-9_-]{12,}|BRAINIALL_API_KEY\s*=\s*[^"'$\s]+/u.test(source)) {
    throw new Error(`${name} quickstart appears to contain a credential value`);
  }
}

if (!texts.curl.includes('--retry 0') || !texts.curl.includes('--max-redirs 0')) {
  throw new Error('curl quickstart must disable retries and redirects');
}
if (!texts.python.includes('NoRedirect') || !texts.python.includes('exactly one attempt')) {
  throw new Error('python quickstart must reject redirects and document one attempt');
}
if (!texts.javascript.includes('transcribeToNewDirectory')) {
  throw new Error('javascript quickstart must reuse the tested single-send client');
}

const paths = Object.fromEntries(Object.entries(files).map(([name, url]) => [name, fileURLToPath(url)]));
execFileSync('bash', ['-n', paths.curl], { stdio: 'inherit' });
execFileSync('python3', ['-c', `import ast,pathlib; ast.parse(pathlib.Path(${JSON.stringify(paths.python)}).read_text())`], { stdio: 'inherit' });
execFileSync(process.execPath, ['--check', paths.javascript], { stdio: 'inherit' });

console.log('Quickstart validation passed.');
