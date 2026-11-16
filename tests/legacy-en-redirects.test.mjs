import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://ivaikin.com';
const REDIRECTS = [
  { file: 'en/index.html', from: '/en/', to: '/' },
  { file: 'en/about/index.html', from: '/en/about/', to: '/about/' },
];

function read(relativePath) {
  const filename = resolve(ROOT, relativePath);
  assert.ok(existsSync(filename), `Missing published artifact: ${relativePath}`);
  return readFileSync(filename, 'utf8');
}

for (const { file, from, to } of REDIRECTS) {
  test(`legacy ${from} redirects to ${to} and stays out of the sitemap`, () => {
    const html = read(file);
    assert.ok(html.includes(`rel="canonical" href="${ORIGIN}${to}"`));
    assert.ok(html.includes(`content="0;url=${to}"`));
    assert.ok(html.includes(`location.replace(${JSON.stringify(to)})`));
    assert.ok(html.includes(`href="${to}"`));
    assert.match(html, /noindex/);
    const sitemap = read('sitemap.xml');
    const loc = `<loc>${ORIGIN}${from}</loc>`;
    const locNoSlash = from.endsWith('/') ? `<loc>${ORIGIN}${from.slice(0, -1)}</loc>` : loc;
    assert.ok(!sitemap.includes(loc), `${from} must not be added to the sitemap`);
    assert.ok(!sitemap.includes(locNoSlash) || from === '/', `${from} must not be added to the sitemap`);
  });
}

test('the about-page generator rewrites the legacy English redirects', () => {
  const copy = mkdtempSync(resolve(tmpdir(), 'ivaikin-legacy-en-'));
  try {
    for (const name of ['scripts', 'content', 'package.json', 'sitemap.xml', 'about', 'en', 'ru', 'es', 'zh']) {
      const source = resolve(ROOT, name);
      if (existsSync(source)) cpSync(source, resolve(copy, name), { recursive: true });
    }
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: copy, stdio: 'pipe' });
    for (const { file, to } of REDIRECTS) {
      const html = readFileSync(resolve(copy, file), 'utf8');
      assert.ok(html.includes(`content="0;url=${to}"`), `${file} was not regenerated`);
    }
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});
