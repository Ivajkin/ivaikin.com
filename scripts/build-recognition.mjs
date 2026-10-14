import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { identity, coreLocales } from '../content/core.mjs';
import { recognitionPaths as paths, recognitionLocales as locales, recognitionIssuer as issuer, recognitionImages as images } from '../content/recognition.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const styles = await Promise.all(['assets/front/home.css', 'assets/recognition/recognition.css'].map(async path => {
  const version = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex').slice(0,12);
  return `/${path}?v=${version}`;
}));

function render(lang, c) {
  const profile = coreLocales[lang];
  const home = lang === 'en' ? '/' : '/ru/';
  const canonical = identity.url + paths[lang];
  const schema = {
    '@context': 'https://schema.org', '@type': 'Article', '@id': canonical + '#article',
    url: canonical, headline: c.title, description: c.description, inLanguage: lang,
    mainEntityOfPage: canonical,
    about: { '@type': 'Person', '@id': identity.url + '/#person', name: identity.name, alternateName: identity.alternateName, url: identity.url + '/' },
    author: { '@type': 'Person', '@id': identity.url + '/#person', name: identity.name, url: identity.url + profile.path },
    mentions: { '@type': 'Organization', name: issuer.name, url: issuer.url },
    image: Object.entries(images).map(([key,path]) => ({ '@type': 'ImageObject', contentUrl: identity.url + path, width: 1280, height: 960, caption: c[key + 'Caption'] })),
  };
  const figure = key => `<figure><div class="document-photo"><img src="${images[key]}" width="1280" height="960" alt="${esc(c[key + 'Alt'])}" loading="lazy" decoding="async"></div><figcaption>${esc(c[key + 'Caption'])}</figcaption></figure><a class="document-original" href="${images[key]}">${esc(c.originalLink)}</a>`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#f5f7fa">
<link rel="canonical" href="${canonical}">
${Object.entries(paths).map(([code,path]) => `<link rel="alternate" hreflang="${code}" href="${identity.url}${path}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${identity.url}${paths.en}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Timothy Ivaikin">
<meta property="og:title" content="${esc(c.title)}">
<meta property="og:description" content="${esc(c.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${profile.locale}">
<meta property="og:locale:alternate" content="${coreLocales[lang === 'en' ? 'ru' : 'en'].locale}">
<meta property="og:image" content="${identity.url}/assets/home/timothy-ivaikin.jpg">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="1144">
<meta property="og:image:alt" content="${esc(profile.portraitAlt)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(c.title)}">
<meta name="twitter:description" content="${esc(c.description)}">
<meta name="twitter:image" content="${identity.url}/assets/home/timothy-ivaikin.jpg">
<meta name="twitter:image:alt" content="${esc(profile.portraitAlt)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/home/fonts/manrope-bold.ttf" as="font" type="font/ttf" crossorigin>
${styles.map(path => `<link rel="stylesheet" href="${path}">`).join('\n')}
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>
</head>
<body id="top">
<a class="skip-link" href="#main">${esc(profile.skip)}</a>
<header class="site-header"><div class="wrap header-inner"><a class="wordmark" href="${home}" aria-label="${esc(profile.name)} — ivaikin.com">ti.</a><nav class="main-nav" aria-label="${esc(profile.navLabel)}"><a href="${profile.path}">${esc(c.profileLink)}</a><a href="${home}#ideas">${esc(c.booksLink)}</a></nav><nav class="language-nav" aria-label="${esc(profile.languageLabel)}">${Object.entries(paths).map(([code,path]) => `<a href="${path}" lang="${code}" hreflang="${code}" aria-label="${esc(coreLocales[code].nativeName)}"${code === lang ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`).join('')}</nav></div></header>
<main id="main" class="wrap">
  <article aria-labelledby="recognition-title">
    <header class="recognition-header"><p class="eyebrow">${esc(c.eyebrow)}</p><h1 id="recognition-title">${esc(c.title)}</h1><p class="recognition-intro">${esc(c.intro)}</p></header>
    <section class="recognition-documents" aria-labelledby="documents-title"><h2 id="documents-title">${esc(c.documentsTitle)}</h2><p>${esc(c.documentsIntro)}</p>
      <div class="document-grid">
        <section class="document-card" aria-labelledby="diploma-title"><h3 id="diploma-title">${esc(c.diplomaTitle)}</h3><p class="document-date">2026</p>${figure('diploma')}<blockquote class="document-quote"><p>${esc(c.diplomaQuote)}</p></blockquote><p class="document-attribution">${esc(c.diplomaAttribution)}</p></section>
        <section class="document-card" aria-labelledby="appreciation-title"><h3 id="appreciation-title">${esc(c.appreciationTitle)}</h3><p class="document-date"><time datetime="2026-10-07">${esc(c.appreciationDate)}</time></p>${figure('appreciation')}<blockquote class="document-quote"><p>${esc(c.appreciationQuote)}</p></blockquote><p class="document-attribution">${esc(c.appreciationAttribution)}</p></section>
      </div>
    </section>
    <aside class="recognition-issuer"><p><span>${esc(c.issuerLabel)}</span>${esc(c.issuerName)}</p><a href="${issuer.url}">${esc(c.issuerLink)}</a></aside>
    <section class="recognition-related" aria-labelledby="related-title"><div><h2 id="related-title">${esc(c.relatedTitle)}</h2><p>${esc(c.relatedBody)}</p><nav aria-label="${esc(c.relatedTitle)}"><a href="${home}#ideas">${esc(c.booksLink)}</a><a href="${profile.path}">${esc(c.profileLink)}</a></nav></div><div class="recognition-contact"><p>${esc(c.contactBody)}</p><a href="mailto:${identity.email}">${esc(c.contactLink)} ↗</a></div></section>
  </article>
</main>
<footer class="wrap recognition-footer"><a href="${home}">${esc(profile.name)}</a> · ivaikin.com</footer>
</body>
</html>
`;
}

for (const [lang,c] of Object.entries(locales)) {
  const directory = resolve(root, '.' + paths[lang]);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), render(lang, c));
}
const sitemapPath = resolve(root, 'sitemap.xml');
let sitemap = await readFile(sitemapPath, 'utf8');
if (!sitemap.includes('</urlset>') || !sitemap.includes('xmlns:xhtml=')) throw new Error('Unexpected sitemap structure');
const owned = new Set(Object.values(paths).map(path => identity.url + path));
sitemap = sitemap.replace(/[ \t]*<url\b[^>]*>[\s\S]*?<\/url>\r?\n?/g, block => owned.has(block.match(/<loc>\s*([^<]+)\s*<\/loc>/)?.[1].trim()) ? '' : block);
const alternates = Object.entries(paths).map(([lang,path]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${identity.url}${path}"/>`).join('\n    ');
const entries = Object.values(paths).map(path => `  <url><loc>${identity.url}${path}</loc>\n    ${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${identity.url}${paths.en}"/>\n  </url>`);
await writeFile(sitemapPath, sitemap.replace('</urlset>', entries.join('\n') + '\n</urlset>'));
console.log('Built English and Russian recognition pages; existing sitemap entries preserved.');
