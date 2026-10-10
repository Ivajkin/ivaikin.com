import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { identity } from '../content/core.mjs';
import { homeLocales as locales, homePaths as paths } from '../content/home.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
const languageLabels = { en: 'EN', ru: 'RU', es: 'ES', zh: '中文' };
const bookUrls = ['https://www.goodwillbooks.com/good-results-art-of-efficiency-for-power-765-9781795182980.html', 'https://play.google.com/store/books/details/Timothy_Ivaikin_Shattering_Limits_Self_Improvement?id=2NuiEAAAQBAJ'];

function render(lang, c) {
  const canonical = identity.url + c.path;
  const schema = {
    '@context': 'https://schema.org', '@type': 'ProfilePage',
    '@id': canonical + '#profile', url: canonical, name: c.title,
    description: c.description, inLanguage: lang,
    mainEntity: {
      '@type': 'Person', '@id': identity.url + '/#person',
      name: identity.name, alternateName: identity.alternateName,
      url: identity.url + '/', image: identity.url + '/assets/front/portrait.webp',
      description: c.identity,
      sameAs: [...identity.profiles.map(([,url]) => url), identity.telegram],
    },
  };
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.description)}">
<meta name="author" content="Timothy Ivaikin">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#f5f7fa">
<link rel="canonical" href="${canonical}">
${Object.entries(paths).map(([code,path]) => `<link rel="alternate" hreflang="${code}" href="${identity.url}${path}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${identity.url}/">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Timothy Ivaikin">
<meta property="og:title" content="${esc(c.title)}">
<meta property="og:description" content="${esc(c.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${c.locale}">
${Object.values(locales).filter(l => l.locale !== c.locale).map(l => `<meta property="og:locale:alternate" content="${l.locale}">`).join('\n')}
<meta property="og:image" content="${identity.url}/assets/front/social.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.socialAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(c.title)}">
<meta name="twitter:description" content="${esc(c.description)}">
<meta name="twitter:image" content="${identity.url}/assets/front/social.jpg">
<meta name="twitter:image:alt" content="${esc(c.socialAlt)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/home/fonts/manrope-bold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/assets/front/home.css">
<script src="/assets/front/home.js" defer></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2Z5VJ13B20"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
(() => {
  const location = new URL(window.location.href);
  const languageReload = ['en', 'ru', 'es', 'zh'].includes(location.searchParams.get('lang'));
  if (!languageReload) gtag('config', 'G-2Z5VJ13B20', {page_location: location.origin + location.pathname, allow_google_signals: false, send_page_view: true});
})();
</script>
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
</head>
<body class="home-page">
<a class="skip-link" href="#main">${esc(c.skip)}</a>
<header class="site-header"><div class="wrap header-inner">
  <a class="wordmark" href="${c.path}" aria-label="${esc(c.name)}"><span aria-hidden="true">ti.</span></a>
  <nav class="main-nav" aria-label="${esc(c.navLabel)}"><a href="#work">${esc(c.nav[0])}</a><a href="#ideas">${esc(c.nav[1])}</a><a href="#contact">${esc(c.nav[2])}</a></nav>
  <nav class="language-nav" aria-label="${esc(c.languageLabel)}">${Object.entries(paths).map(([code,path]) => `<a class="language-link" href="${path}" lang="${code}" hreflang="${code}" aria-label="${esc(locales[code].nativeName)}"${lang === code ? ' aria-current="page"' : ''}>${languageLabels[code]}</a>`).join('')}</nav>
</div></header>
<main id="main">
  <section id="top" class="hero" aria-labelledby="name"><div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${esc(c.role)}</p>
      <h1 id="name" class="hero-name"><span>${esc(c.firstName)}</span> <span>${esc(c.lastName)}</span></h1>
      <p class="hero-heading">${esc(c.hero)}</p>
      <p class="hero-intro">${esc(c.intro)}</p>
      <div class="hero-actions"><a class="button primary" href="#contact">${esc(c.cta)}${arrow}</a><a class="button secondary" href="#work">${esc(c.secondaryCta)}</a></div>
      <p class="hero-identity">${esc(c.identity)} <a href="${c.aboutPath}">${esc(c.aboutLabel)}${arrow}</a></p>
    </div>
    <figure class="hero-portrait"><img src="/assets/front/portrait.webp" width="900" height="1200" alt="${esc(c.portraitAlt)}" fetchpriority="high" decoding="async"><figcaption>${esc(c.portraitCaption)}</figcaption></figure>
  </div></section>
  <section id="work" class="section work-section" aria-labelledby="work-title"><div class="wrap">
    <div class="section-heading"><p class="eyebrow">${esc(c.workEyebrow)}</p><h2 id="work-title">${esc(c.workTitle)}</h2><p class="section-intro">${esc(c.workIntro)}</p></div>
    <div class="work-grid">
      <article class="work-card ecosystem"><p class="card-eyebrow">${esc(c.ecosystemCategory)}</p><h3>${esc(c.ecosystemTitle)}</h3><p>${esc(c.ecosystemBody)}</p><ul class="tags">${c.ecosystemExamples.map(s => `<li>${esc(s)}</li>`).join('')}</ul><a class="text-link" href="https://edgeivaikin.com/">${esc(c.ecosystemLink)}${arrow}</a></article>
      <article class="work-card focus"><p class="card-eyebrow">${esc(c.focusCategory)}</p><h3>${esc(c.focusTitle)}</h3><p>${esc(c.focusBody)}</p><ul class="tags">${c.focusExamples.map(s => `<li>${esc(s)}</li>`).join('')}</ul><a class="text-link" href="https://landing.edgefocus.ru/">${esc(c.focusLink)}${arrow}</a></article>
    </div>
  </div></section>
  <section class="section approach-section" aria-labelledby="approach-title"><div class="wrap approach-grid">
    <div class="approach-copy"><p class="eyebrow">${esc(c.methodEyebrow)}</p><h2 id="approach-title">${esc(c.methodTitle)}</h2><div class="approach-list">${c.methods.map(([title,body]) => `<article class="approach-item"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}</div></div>
    <div class="approach-visual" aria-hidden="true"><img src="/assets/front/systems.webp" width="1536" height="1024" loading="lazy" decoding="async" alt=""></div>
  </div></section>
  <section id="ideas" class="section ideas-section" aria-labelledby="ideas-title"><div class="wrap">
    <div class="section-heading"><p class="eyebrow">${esc(c.ideasEyebrow)}</p><h2 id="ideas-title">${esc(c.ideasTitle)}</h2></div>
    <div class="ideas-grid">
      <article class="interview-card"><a href="${c.interviewPath}" class="interview-image" aria-label="${esc(c.interviewTitle)}"><img src="/assets/interviews/tai-chi-business/B-red.jpg" width="1672" height="941" loading="lazy" decoding="async" alt=""></a><div class="interview-copy"><p class="card-eyebrow">${esc(c.interviewTag)}</p><h3><a href="${c.interviewPath}">${esc(c.interviewTitle)}</a></h3><p>${esc(c.interviewBody)}</p><p class="meta">${esc(c.interviewMeta)}</p><a class="text-link" href="${c.interviewPath}">${esc(c.interviewLink)}${arrow}</a></div></article>
      <div class="books-list"><p class="card-eyebrow">${esc(c.booksLabel)}</p>${[['Good Results',c.bookOneBody,'GR'],['Shattering Limits',c.bookTwoBody,'SL']].map(([title,body,mark], i) => `<article class="book-item"><span class="book-mark" aria-hidden="true">${mark}</span><div><h3 lang="en">${title}</h3><p${lang === 'ru' ? ' lang="en"' : ''}>${esc(body)}</p><a class="text-link" href="${bookUrls[i]}" aria-label="${esc(c.bookLink)}: ${title}">${esc(c.bookLink)}${arrow}</a></div></article>`).join('')}<a class="writing-link text-link" href="https://ivaikin.medium.com/">${esc(c.writingLink)}${arrow}</a></div>
    </div>
  </div></section>
  <section class="section faq-section" aria-labelledby="faq-title"><div class="wrap faq-layout"><h2 id="faq-title">${esc(c.faqTitle)}</h2><div class="faq-list">${c.faqs.map(([q,a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div></section>
  <section id="contact" class="contact-section" aria-labelledby="contact-title"><div class="wrap contact-grid">
    <div class="contact-copy"><p class="eyebrow">${esc(c.contactEyebrow)}</p><h2 id="contact-title">${esc(c.contactTitle)}</h2><div class="contact-intents">${c.intents.map((s,i) => `<a href="mailto:${identity.email}?subject=${encodeURIComponent(c.intentSubjects[i])}&amp;body=${encodeURIComponent(c.intentBodies[i])}">${esc(s)}</a>`).join('')}</div><p>${esc(c.contactBody)}</p></div>
    <div class="contact-actions"><a class="button primary" href="${identity.telegram}">${esc(c.telegramLabel)}${arrow}</a><a class="email-link" href="mailto:${identity.email}" aria-label="${esc(c.emailLabel)}: ${identity.email}">${identity.email}</a><p>${esc(c.contactNote)}</p></div>
  </div></section>
</main>
<footer class="site-footer"><div class="wrap footer-inner"><div><a class="footer-brand" href="${c.path}">${esc(c.name)}</a><p class="footer-note">${esc(c.role)}</p></div><nav class="social-links" aria-label="${esc(c.profileLabel)}">${identity.profiles.map(([label,url]) => `<a href="${url}" rel="me">${esc(label)}</a>`).join('')}</nav><a class="back-top" href="#top">${esc(c.backTop)}<span aria-hidden="true">↑</span></a></div></footer>
</body>
</html>
`;
}

for (const [lang,c] of Object.entries(locales)) {
  const directory = resolve(root, '.' + c.path);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), render(lang, c));
}
const owned = new Set(Object.values(paths).map(path => identity.url + path));
const sitemapPath = resolve(root, 'sitemap.xml');
let sitemap = await readFile(sitemapPath, 'utf8');
if (!sitemap.includes('</urlset>') || !sitemap.includes('xmlns:xhtml=')) throw new Error('Unexpected sitemap structure');
sitemap = sitemap.replace(/[ \t]*<url\b[^>]*>[\s\S]*?<\/url>\r?\n?/g, block => owned.has(block.match(/<loc>\s*([^<]+)\s*<\/loc>/)?.[1].trim()) ? '' : block);
const alternates = Object.entries(paths).map(([lang,path]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${identity.url}${path}"/>`).join('\n    ');
const entries = Object.values(paths).map(path => `  <url><loc>${identity.url}${path}</loc>\n    ${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${identity.url}/"/>\n  </url>`);
await writeFile(sitemapPath, sitemap.replace('</urlset>', entries.join('\n') + '\n</urlset>'));
console.log('Built four static homepages; profile and interview pages preserved.');
