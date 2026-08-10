import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, ptBrHtml, esHtml, captionQaHtml, robots, sitemap, hostedSpec, canonicalSpec] = await Promise.all([
  readFile(new URL('../docs/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../docs/pt-br/transcricao-com-diarizacao/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../docs/es/transcripcion-con-diarizacion/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../docs/github-action-caption-qa/index.html', import.meta.url), 'utf8'),
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
assert.equal((sitemap.match(/<url>/gu) ?? []).length, 7);

for (const [name, localized, lang, canonical, campaign] of [
  ['PT-BR', ptBrHtml, 'pt-BR', '/pt-br/transcricao-com-diarizacao/', 'pt_br_diarization_c173'],
  ['Spanish', esHtml, 'es', '/es/transcripcion-con-diarizacion/', 'es_diarization_c173'],
]) {
  assert.ok(localized.includes(`<html lang="${lang}">`), `${name} page has the wrong language`);
  assert.ok(localized.includes(canonical), `${name} page is missing its canonical path`);
  assert.ok(localized.includes('hreflang="pt-BR"') && localized.includes('hreflang="es"'), `${name} page is missing reciprocal hreflang`);
  assert.ok(localized.includes(campaign), `${name} page is missing its attribution campaign`);
  assert.ok(localized.includes('https://app.brainiall.com/?utm_source=github_pages'), `${name} page is missing its account CTA`);
  assert.doesNotMatch(localized, /sk-[A-Za-z0-9_-]{12,}|BRAINIALL_API_KEY\s*=\s*\S+/u, `${name} page appears to contain a credential`);
}

for (const marker of [
  '<html lang="en">',
  '/github-action-caption-qa/',
  'caption_qa_c174',
  'fasuizu-br/brainiall-caption-qa-action@v1.2.0',
  'isAccessibleForFree',
]) assert.ok(captionQaHtml.includes(marker), `Caption QA page is missing ${marker}`);

for (const [name, text] of [['HTML', html], ['PT-BR HTML', ptBrHtml], ['Spanish HTML', esHtml], ['Caption QA HTML', captionQaHtml], ['robots', robots], ['sitemap', sitemap]]) {
  assert.doesNotMatch(text, /sk-[A-Za-z0-9_-]{12,}|BRAINIALL_API_KEY\s*=\s*\S+/u, `${name} appears to contain a credential`);
}

console.log('GitHub Pages validation passed.');
