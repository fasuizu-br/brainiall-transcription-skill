import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, robots, sitemap, hostedSpec, canonicalSpec] = await Promise.all([
  readFile(new URL('../docs/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../docs/robots.txt', import.meta.url), 'utf8'),
  readFile(new URL('../docs/sitemap.xml', import.meta.url), 'utf8'),
  readFile(new URL('../docs/brainiall-diarized-transcription.openapi.json', import.meta.url), 'utf8'),
  readFile(new URL('../openapi/brainiall-diarized-transcription.openapi.json', import.meta.url), 'utf8'),
]);

assert.equal(hostedSpec, canonicalSpec, 'hosted OpenAPI copy must exactly match the canonical contract');
for (const marker of [
  '<html lang="pt-BR">',
  'https://fasuizu-br.github.io/brainiall-transcription-skill/',
  'https://app.brainiall.com/?utm_source=github_pages',
  './brainiall-diarized-transcription.openapi.json',
  'Esta página é somente leitura',
  'Import, first value, checkout e pagamento pendente não são receita reconciliada.',
]) assert.ok(html.includes(marker), `Pages HTML is missing ${marker}`);

const structuredData = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)?.[1];
assert.ok(structuredData, 'Pages HTML is missing JSON-LD');
assert.equal(JSON.parse(structuredData)['@type'], 'SoftwareApplication');
assert.ok(robots.includes('Allow: /') && robots.includes('sitemap.xml'));
assert.equal((sitemap.match(/<url>/gu) ?? []).length, 4);

for (const [name, text] of [['HTML', html], ['robots', robots], ['sitemap', sitemap]]) {
  assert.doesNotMatch(text, /sk-[A-Za-z0-9_-]{12,}|BRAINIALL_API_KEY\s*=\s*\S+/u, `${name} appears to contain a credential`);
}

console.log('GitHub Pages validation passed.');
