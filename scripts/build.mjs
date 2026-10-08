import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { identity, coreLocales } from '../content/core.mjs';
import { extraLocales } from '../content/extra.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const locales = { ...coreLocales, ...extraLocales };
const paths = { en: '/about/', ru: '/ru/about/', es: '/es/about/', zh: '/zh/about/' };
const esc = (text) => String(text).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
const links = [
  ['en', 'EN'], ['ru', 'RU'], ['es', 'ES'], ['zh', '中文'],
];
const brandMark = '<svg class="brand-mark" aria-hidden="true" viewBox="0 0 36 36" fill="none"><path d="M3 6h22v7H3zM11 16h22v7H11zM3 26h22v7H3z" fill="currentColor"/></svg>';
const focusMark = '<svg class="focus-mark" aria-hidden="true" viewBox="0 0 80 80" fill="none"><path d="M8 27V8h19M53 8h19v19M72 53v19H53M27 72H8V53" stroke="currentColor" stroke-width="5"/><circle cx="40" cy="40" r="10" fill="currentColor"/></svg>';

function render(lang, c) {
  const canonical = identity.url + c.path;
  const alternates = Object.entries(paths).map(([code,path]) => `<link rel="alternate" hreflang="${code}" href="${identity.url}${path}">`).join('\n');
  const schema = {
    '@context': 'https://schema.org', '@type': 'ProfilePage',
    '@id': canonical + '#profile', url: canonical, name: c.title,
    description: c.description, inLanguage: lang,
    mainEntity: {
      '@type': 'Person', '@id': identity.url + '/#person',
      name: identity.name, alternateName: identity.alternateName,
      url: identity.url + '/', image: identity.url + '/assets/home/timothy-ivaikin.jpg',
      description: c.identity,
      sameAs: [...identity.profiles.map(([,url]) => url), identity.telegram],
    },
  };
  const langNav = links.map(([code,label]) => `<a href="${paths[code]}" lang="${code}" hreflang="${code}" aria-label="${esc(locales[code].nativeName)}"${lang === code ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const methodRows = c.methods.map(([title, body]) => `<li><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join('\n');
  const faqRows = c.faqs.map(([q,a]) => `<details><summary>${esc(q)}<span aria-hidden="true">+</span></summary><p>${esc(a)}</p></details>`).join('\n');
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.description)}">
<meta name="author" content="Timothy Ivaikin">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#edf2f7">
<link rel="canonical" href="${canonical}">
${alternates}
<link rel="alternate" hreflang="x-default" href="${identity.url}/about/">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Timothy Ivaikin">
<meta property="og:title" content="${esc(c.title)}">
<meta property="og:description" content="${esc(c.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${c.locale}">
${Object.values(locales).filter(l => l.locale !== c.locale).map(l => `<meta property="og:locale:alternate" content="${l.locale}">`).join('\n')}
<meta property="og:image" content="${identity.url}/assets/home/timothy-ivaikin.jpg">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="1144">
<meta property="og:image:alt" content="${esc(c.portraitAlt)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(c.title)}">
<meta name="twitter:description" content="${esc(c.description)}">
<meta name="twitter:image" content="${identity.url}/assets/home/timothy-ivaikin.jpg">
<meta name="twitter:image:alt" content="${esc(c.portraitAlt)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/home/fonts/manrope-bold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/assets/home/home.css">
<script src="/assets/home/home.js" defer></script>
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>
</head>
<body id="top">
<a class="skip-link" href="#main">${esc(c.skip)}</a>
<header class="site-header wrap">
  <a class="wordmark" href="/" aria-label="${esc(c.name)} — ivaikin.com"><span class="monogram" aria-hidden="true">ti.</span><span>${esc(c.name)}<small>ivaikin.com ↗</small></span></a>
  <nav class="main-nav" aria-label="${esc(c.navLabel)}"><a href="#work">${esc(c.nav[0])}</a><a href="#ideas">${esc(c.nav[1])}</a><a href="#contact">${esc(c.nav[2])}</a></nav>
  <nav class="language-nav" aria-label="${esc(c.languageLabel)}">${langNav}</nav>
</header>
<main id="main">
  <section id="hero" class="hero wrap" aria-labelledby="name">
    <div class="hero-copy">
      <p class="eyebrow"><span class="blue-dot" aria-hidden="true"></span>${esc(c.role)}</p>
      <h1 id="name"><span>${esc(c.firstName)}</span> <span>${esc(c.lastName)}<b class="name-stop" aria-hidden="true">.</b></span></h1>
      <h2 class="hero-statement">${esc(c.hero)}</h2>
      <p class="hero-intro">${esc(c.intro)}</p>
      <div class="hero-actions"><a class="button primary" href="#contact">${esc(c.cta)}${arrow}</a><a class="text-link" href="#work">${esc(c.secondaryCta)}</a></div>
    </div>
    <figure class="portrait">
      <div class="portrait-image"><img src="/assets/home/timothy-ivaikin.jpg" width="800" height="1144" alt="${esc(c.portraitAlt)}" fetchpriority="high" decoding="async"></div>
      <figcaption><span>${esc(c.portraitCaption)}</span><span class="portrait-signature" aria-hidden="true">ti.</span></figcaption>
    </figure>
    <p class="identity-line">${esc(c.identity)}</p>
  </section>
  <section id="work" class="section work wrap" aria-labelledby="work-title">
    <div class="section-heading"><div><p class="eyebrow">${esc(c.workEyebrow)}</p><h2 id="work-title">${esc(c.workTitle)}</h2></div><p class="section-intro">${esc(c.workIntro)}</p></div>
    <div class="projects">
      <article class="project ecosystem">
        <div class="project-top"><span class="project-type">${esc(c.ecosystemCategory)}</span>${brandMark}</div>
        <h3>${esc(c.ecosystemTitle)}</h3><p>${esc(c.ecosystemBody)}</p>
        <ul class="project-capabilities">${c.ecosystemExamples.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <a class="project-link" href="https://edgeivaikin.com/">${esc(c.ecosystemLink)}${arrow}</a>
      </article>
      <article class="project focus">
        <div class="project-top"><span class="project-type">${esc(c.focusCategory)}</span>${focusMark}</div>
        <h3>${esc(c.focusTitle)}</h3><p>${esc(c.focusBody)}</p>
        <ul class="project-capabilities">${c.focusExamples.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <a class="project-link" href="https://landing.edgefocus.ru/">${esc(c.focusLink)}${arrow}</a>
      </article>
    </div>
  </section>
  <section class="philosophy" aria-labelledby="philosophy-title"><div class="wrap philosophy-inner"><p class="eyebrow">${esc(c.philosophyEyebrow)}</p><div><h2 id="philosophy-title">${esc(c.philosophyTitle)}</h2><p>${esc(c.philosophyBody)}</p></div><div class="orbit" aria-hidden="true"><i></i><i></i><i></i><span></span></div></div></section>
  <section class="section method wrap" aria-labelledby="method-title"><div><p class="eyebrow">${esc(c.methodEyebrow)}</p><h2 id="method-title">${esc(c.methodTitle)}</h2></div><ol>${methodRows}</ol></section>
  <section id="ideas" class="section ideas wrap" aria-labelledby="ideas-title"><div class="section-heading"><div><p class="eyebrow">${esc(c.ideasEyebrow)}</p><h2 id="ideas-title">${esc(c.ideasTitle)}</h2></div></div>
    <div class="ideas-grid">
      <article class="interview"><a href="${c.interviewPath}" class="interview-image" aria-label="${esc(c.interviewTitle)}"><img src="/assets/interviews/tai-chi-business/B-red.jpg" width="1536" height="1024" loading="lazy" alt=""></a><div class="interview-copy"><p class="eyebrow">${esc(c.interviewTag)}</p><h3><a href="${c.interviewPath}">${esc(c.interviewTitle)}</a></h3><p>${esc(c.interviewBody)}</p><p class="meta">${esc(c.interviewMeta)}</p><a class="text-link" href="${c.interviewPath}">${esc(c.interviewLink)}${arrow}</a></div></article>
      <div class="books"><p class="eyebrow">${esc(c.booksLabel)}</p><article><span class="book-spine" aria-hidden="true">GR</span><div><h3>Good Results</h3><p lang="${lang === 'ru' ? 'en' : lang}">${esc(c.bookOneBody)}</p><a class="text-link" href="https://www.goodwillbooks.com/good-results-art-of-efficiency-for-power-765-9781795182980.html" aria-label="${esc(c.bookLink)}: Good Results">${esc(c.bookLink)}${arrow}</a></div></article><article><span class="book-spine second" aria-hidden="true">SL</span><div><h3>Shattering Limits</h3><p lang="${lang === 'ru' ? 'en' : lang}">${esc(c.bookTwoBody)}</p><a class="text-link" href="https://play.google.com/store/books/details/Timothy_Ivaikin_Shattering_Limits_Self_Improvement?id=2NuiEAAAQBAJ" aria-label="${esc(c.bookLink)}: Shattering Limits">${esc(c.bookLink)}${arrow}</a></div></article><a class="writing-link text-link" href="https://ivaikin.medium.com/">${esc(c.writingLink)}${arrow}</a></div>
    </div>
  </section>
  <section class="faq wrap" aria-labelledby="faq-title"><h2 id="faq-title">${esc(c.faqTitle)}</h2><div>${faqRows}</div></section>
  <section id="contact" class="contact" aria-labelledby="contact-title"><div class="wrap contact-inner"><div><p class="eyebrow">${esc(c.contactEyebrow)}</p><h2 id="contact-title">${esc(c.contactTitle)}</h2><p class="contact-body">${esc(c.contactBody)}</p></div><div class="contact-actions"><a class="button light" href="${identity.telegram}">${esc(c.telegramLabel)}${arrow}</a><a class="email-link" href="mailto:${identity.email}">${identity.email}</a><p>${esc(c.contactNote)}</p></div></div></section>
</main>
<footer class="footer wrap"><div><a class="footer-name" href="${c.path}">${esc(c.name)}</a><p>${esc(c.footerNote)}</p></div><nav aria-label="${esc(c.name)} — profiles">${identity.profiles.map(([label,url]) => `<a href="${url}" rel="me">${esc(label)}</a>`).join('')}</nav><a class="back-top" href="#top">${esc(c.backTop)}<span aria-hidden="true">↑</span></a></footer>
</body>
</html>
`;
}

for (const [lang, c] of Object.entries(locales)) {
  if (c.path !== paths[lang]) throw new Error(`Unexpected locale path: ${lang}`);
  const target = resolve(root, '.' + c.path);
  await mkdir(target, { recursive: true });
  await writeFile(resolve(target, 'index.html'), render(lang, c));
}
const localized = Object.entries(paths).map(([lang,path]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${identity.url}${path}"/>`).join('\n    ');
const landingUrls = Object.values(paths).map(path => `  <url><loc>${identity.url}${path}</loc>\n    ${localized}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${identity.url}/about/"/>\n  </url>`);
// Own only the four child entries. Preserve every existing URL and its metadata.
const sitemapPath = resolve(root, 'sitemap.xml');
const ownedUrls = new Set(Object.values(paths).map(path => identity.url + path));
let sitemap = await readFile(sitemapPath, 'utf8');
if (!sitemap.includes('</urlset>') || !sitemap.includes('xmlns:xhtml=')) throw new Error('Unexpected sitemap structure');
sitemap = sitemap.replace(/[ \t]*<url\b[^>]*>[\s\S]*?<\/url>\r?\n?/g, block => {
  const location = block.match(/<loc>\s*([^<]+)\s*<\/loc>/)?.[1].trim();
  return ownedUrls.has(location) ? '' : block;
});
await writeFile(sitemapPath, sitemap.replace('</urlset>', landingUrls.join('\n') + '\n</urlset>'));
console.log(`Built ${Object.keys(locales).length} child landing pages. Existing homepage and sitemap entries preserved.`);
