import {books,bookCopy,bookPath} from '../content/books.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderBookCards(lang,arrow){
  const labels=bookCopy[lang];
  return books.map(book=>{
    const copy=labels[book.slug], path=bookPath(lang,book.slug);
    return `<article class="book-item"><a class="book-cover-link" href="${path}" aria-label="${esc(labels.details)}: ${book.title}"><img class="book-cover" src="${book.cover}" width="${book.width}" height="${book.height}" loading="lazy" decoding="async" alt="${esc(book.coverTitle||book.title)}"></a><div><h3 lang="en"><a href="${path}">${book.title}</a></h3>${copy.coverNote?`<p class="book-edition-note">${esc(copy.coverNote)}</p>`:''}<p>${esc(copy.summary)}</p><a class="text-link" href="${path}" aria-label="${esc(labels.details)}: ${book.title}">${esc(labels.details)}${arrow}</a></div></article>`;
  }).join('');
}
