import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {identity,coreLocales} from '../content/core.mjs';
import {extraLocales} from '../content/extra.mjs';
import {books,bookCopy,bookLanguages,bookPath,homePath} from '../content/books.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const profiles={...coreLocales,...extraLocales};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=async path=>path+'?v='+createHash('sha256').update(await readFile(resolve(root,'.'+path))).digest('hex').slice(0,12);
const styles=await Promise.all(['/assets/front/home.css','/assets/books/books.css'].map(css));

function render(lang,book){
  const labels=bookCopy[lang],copy=labels[book.slug],profile=profiles[lang];
  const route=bookPath(lang,book.slug),canonical=identity.url+route;
  const title=`${book.title} — ${labels.name}`;
  const schema={'@context':'https://schema.org','@type':'Book','@id':canonical+'#book',url:canonical,name:book.title,description:copy.description,inLanguage:'en',image:identity.url+book.cover,author:{'@type':'Person','@id':identity.url+'/#person',name:identity.name,url:identity.url+'/'} ,...(book.isbn?{isbn:book.isbn}:{})};
  const alternate=books.find(x=>x.slug!==book.slug);
  const sourceQuote=book.excerpt?`<blockquote class="book-excerpt-original" lang="en">${book.excerpt.map(p=>`<p>${esc(p)}</p>`).join('')}</blockquote>`:'';
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(copy.summary)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#f5f7fa">
<link rel="canonical" href="${canonical}">
${bookLanguages.map(code=>`<link rel="alternate" hreflang="${code}" href="${identity.url}${bookPath(code,book.slug)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${identity.url}${bookPath('en',book.slug)}">
<meta property="og:type" content="book">
<meta property="og:site_name" content="Timothy Ivaikin">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(copy.summary)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${profile.locale}">
${bookLanguages.filter(code=>code!==lang).map(code=>`<meta property="og:locale:alternate" content="${profiles[code].locale}">`).join('\n')}
<meta property="og:image" content="${identity.url}${book.cover}">
<meta property="og:image:width" content="${book.width}">
<meta property="og:image:height" content="${book.height}">
<meta property="og:image:alt" content="${esc(book.coverTitle||book.title)}">
<meta property="book:author" content="${identity.url}/">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(copy.summary)}">
<meta name="twitter:image" content="${identity.url}${book.cover}">
<meta name="twitter:image:alt" content="${esc(book.coverTitle||book.title)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/home/fonts/manrope-bold.ttf" as="font" type="font/ttf" crossorigin>
${styles.map(path=>`<link rel="stylesheet" href="${path}">`).join('\n')}
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>
</head>
<body class="book-page" id="top">
<a class="skip-link" href="#main">${esc(profile.skip)}</a>
<header class="site-header"><div class="wrap header-inner"><a class="wordmark" href="${homePath(lang)}" aria-label="${esc(labels.name)}">ti.</a><a class="book-back" href="${homePath(lang)}#ideas">${esc(labels.back)}</a><nav class="language-nav" aria-label="${esc(profile.languageLabel)}">${bookLanguages.map(code=>`<a href="${bookPath(code,book.slug)}" lang="${code}" hreflang="${code}" aria-label="${esc(profiles[code].nativeName)}"${code===lang?' aria-current="page"':''}>${code==='zh'?'中文':code.toUpperCase()}</a>`).join('')}</nav></div></header>
<main id="main" class="wrap book-main">
  <article aria-labelledby="book-title">
    <header class="book-introduction"><figure class="book-artwork"><img src="${book.cover}" width="${book.width}" height="${book.height}" decoding="async" fetchpriority="high" alt="${esc(book.coverTitle||book.title)}"></figure><div class="book-intro-copy"><p class="eyebrow">${esc(labels.books)}</p><h1 id="book-title" lang="en">${book.title}</h1><p class="book-subtitle" lang="en">${esc(book.subtitle)}</p><p class="book-byline">${esc(labels.author)} · ${esc(labels.language)}</p><p class="book-summary">${esc(copy.summary)}</p>${copy.editionNote?`<p class="book-edition-explanation">${esc(copy.editionNote)}</p>`:''}<a class="button primary" href="#reading">${esc(labels.excerpt)}</a></div></header>
    <div class="book-reading-grid"><div class="book-reading-copy"><section aria-labelledby="book-about"><h2 id="book-about">${esc(labels.about)}</h2><p>${esc(copy.description)}</p><ul class="book-topics">${copy.topics.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section>
    <section id="reading" aria-labelledby="reading-title"><h2 id="reading-title">${esc(labels.excerpt)}</h2>${book.excerpt?`<p class="book-reading-note">${esc(labels.excerptNote)}</p>${lang==='en'?sourceQuote:`<blockquote class="book-excerpt-translation" lang="${lang}">${copy.translatedExcerpt.map(p=>`<p>${esc(p)}</p>`).join('')}</blockquote><details class="book-original"><summary>${esc(labels.original)}</summary>${sourceQuote}</details>`}`:`<p>${esc(copy.previewNote)}</p><a class="text-link" href="${esc(book.preview)}">${esc(labels.preview)} ↗</a>`}</section></div>
    <section class="book-editions" aria-labelledby="editions-title"><h2 id="editions-title">${esc(labels.editions)}</h2><ul>${book.editions.map(e=>`<li><a href="${esc(e.url)}">${esc(e.label)} ↗</a></li>`).join('')}</ul>${book.isbn?`<p class="book-isbn">ISBN ${book.isbn}</p>`:''}<p class="book-availability">${esc(labels.availability)}</p></section></div>
    <footer class="book-related"><div><p class="eyebrow">${esc(labels.otherBook)}</p><a class="text-link" href="${bookPath(lang,alternate.slug)}" lang="en">${alternate.title} ↗</a></div><div><p>${esc(labels.contact)}</p><a class="text-link" href="${homePath(lang)}#contact">${esc(labels.contactLink)} ↗</a></div></footer>
  </article>
</main>
<footer class="wrap book-footer"><a href="${homePath(lang)}">${esc(labels.name)}</a> · ivaikin.com</footer>
</body>
</html>
`;
}
for(const lang of bookLanguages)for(const book of books){
  const directory=resolve(root,'.'+bookPath(lang,book.slug));
  await mkdir(directory,{recursive:true});await writeFile(resolve(directory,'index.html'),render(lang,book));
}
let sitemap=await readFile(resolve(root,'sitemap.xml'),'utf8');
if(!sitemap.includes('</urlset>')||!sitemap.includes('xmlns:xhtml='))throw Error('Unexpected sitemap structure');
const owned=new Set(bookLanguages.flatMap(lang=>books.map(book=>identity.url+bookPath(lang,book.slug))));
sitemap=sitemap.replace(/[ \t]*<url\b[^>]*>[\s\S]*?<\/url>\r?\n?/g,block=>owned.has(block.match(/<loc>\s*([^<]+)\s*<\/loc>/)?.[1].trim())?'':block);
const entries=books.flatMap(book=>bookLanguages.map(lang=>`  <url><loc>${identity.url}${bookPath(lang,book.slug)}</loc>\n    ${bookLanguages.map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${identity.url}${bookPath(code,book.slug)}"/>`).join('\n    ')}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${identity.url}${bookPath('en',book.slug)}"/>\n  </url>`));
await writeFile(resolve(root,'sitemap.xml'),sitemap.replace('</urlset>',entries.join('\n')+'\n</urlset>'));
console.log('Built eight localized book pages with canonical catalog identities.');
