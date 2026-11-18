// Generates the Hunt ladder funnel pages: /ladder/N/ (EN) and /ru/ladder/N/ (RU), N = 1..7.
// Static output is committed. Run: node scripts/build-funnel.mjs
// Copy comes only from text already published on the homepages of this site.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://ivaikin.com';
const TELEGRAM = 'https://t.me/timothyivaikin';
const EMAIL = 'hello@edgeivaikin.com';
const RECS = 'https://www.linkedin.com/in/timothyivaikin/details/recommendations/?detailScreenTabIndex=0';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const base = (lang, n) => (lang === 'ru' ? `/ru/ladder/${n}/` : `/ladder/${n}/`);
const home = (lang) => (lang === 'ru' ? '/ru/' : '/');
const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';

// Mail links with the subject and the brief template are taken from the live homepages, so they stay identical.
async function intents(file) {
  const html = await readFile(resolve(root, file), 'utf8');
  const out = {};
  for (const m of html.matchAll(/<a data-contact-intent="(project|partnership|media)" href="([^"]+)">([^<]+)<\/a>/g)) out[m[1]] = { href: m[2], label: m[3] };
  if (!out.project || !out.partnership || !out.media) throw new Error('contact intents not found in ' + file);
  return out;
}
const MAIL = { en: await intents('index.html'), ru: await intents('ru/index.html') };

const hash = async (path) => createHash('sha256').update(await readFile(resolve(root, path))).digest('hex').slice(0, 12);
const ASSET = { css: `/assets/front/home.css?v=${await hash('assets/front/home.css')}`, funnelCss: `/assets/front/funnel.css?v=${await hash('assets/front/funnel.css')}`, js: `/assets/front/funnel.js?v=${await hash('assets/front/funnel.js')}` };

const T = {
  en: {
    locale: 'en_US', siteName: 'Timothy Ivaikin',
    skip: 'Skip to content', wordmark: 'Timothy Ivaikin', stepsLabel: 'Funnel steps', langLabel: 'Choose language',
    stage: ['Start', 'Work', 'Approach', 'Proof', 'Format', 'Brief', 'Contact'],
    stepOf: (n) => `Step ${n} of 7`, next: (l) => `Next: ${l}`, discuss: 'Discuss a project', tgLine: 'Prefer to write now?', tgLink: 'Message me on Telegram',
    siteLink: 'Back to the homepage', footerNote: 'Entrepreneur. Founder. Author.', press: 'Press',
  },
  ru: {
    locale: 'ru_RU', siteName: 'Timothy Ivaikin',
    skip: 'Перейти к содержанию', wordmark: 'Тимофей Ивайкин', stepsLabel: 'Шаги воронки', langLabel: 'Выбрать язык',
    stage: ['Начало', 'Работа', 'Подход', 'Опыт', 'Формат', 'Бриф', 'Связь'],
    stepOf: (n) => `Шаг ${n} из 7`, next: (l) => `Дальше: ${l}`, discuss: 'Обсудить проект', tgLine: 'Удобнее написать сразу?', tgLink: 'Написать в Telegram',
    siteLink: 'На главную', footerNote: 'Предприниматель. Основатель. Автор.', press: 'Для СМИ',
  },
};

const CASES = { en: 'https://edgeivaikin.com/cases/', ru: 'https://edgeivaikin.com/ru/cases/' };
const EDGE = { en: 'https://edgeivaikin.com/', ru: 'https://edgeivaikin.com/' };

const C = {
  en: {
    1: { title: 'People. Technology. Systems that work.', lead: 'I bring software, AI, infrastructure and teams together to turn business needs into digital products and services.',
      body: () => `<div class="funnel-intro"><figure class="funnel-portrait"><img src="/assets/front/portrait.webp" width="900" height="1200" alt="Portrait of Timothy Ivaikin" decoding="async"><figcaption>Founder of Edge Ecosystem</figcaption></figure>
        <div><h2>Who is Timothy Ivaikin?</h2><p>Timothy Ivaikin is an entrepreneur, founder of Edge Ecosystem, creator of EdgeFocus with his team and author of Good Results and Shattering Limits.</p></div></div>` },
    2: { title: 'Business, technology and people. Connected.', lead: 'I lead technical delivery: from understanding the business need and assembling the team to implementation and acceptance of an agreed result.',
      body: (l) => `<div class="funnel-cards">
        <article class="funnel-card"><p class="card-eyebrow">Company</p><h3>Edge Ecosystem</h3><p>With my team, I build customer portals, internal systems and automation so customers can access services online, staff can work without repeated data entry and manual handoffs, and leaders can see the status of operations.</p><ul><li>Customer-facing services</li><li>Internal business systems</li><li>Integration &amp; automation</li></ul><a class="text-link" href="${EDGE[l]}">Explore Edge Ecosystem${arrow}</a></article>
        <article class="funnel-card"><p class="card-eyebrow">Product</p><h3>EdgeFocus</h3><p>A workspace for notes, goals, projects and actions. A product I created with my team to connect the bigger picture with everyday work.</p><ul><li>Capture what matters</li><li>Connect it to a goal</li><li>Choose the next action</li></ul><a class="text-link" href="https://landing.edgefocus.ru/">Explore EdgeFocus${arrow}</a></article></div>` },
    3: { title: 'Start with the result people need.', lead: 'How I work with a business need.',
      body: () => `<ol class="funnel-steps-list"><li><h3>Understand the situation</h3><p>Who will use the product? What needs to change? We define the problem, the intended outcome and the boundaries of the work.</p></li>
        <li><h3>Connect the parts</h3><p>Bring the software, infrastructure and people into one delivery plan, with clear responsibilities and dependencies.</p></li>
        <li><h3>Put it into use</h3><p>Agree how the result will be accepted, deliver in bounded stages and plan for the people who will operate it.</p></li></ol>` },
    4: { title: 'Examples and colleagues\u2019 words', lead: 'Client delivery, work in other teams and an owned product. Each case keeps its own contribution and context.',
      body: (l) => `<div class="funnel-cards">
        <article class="funnel-card"><p class="card-eyebrow">2023\u20132024</p><h3>Discover Culture</h3><p class="funnel-meta">Technical lead \u00b7 partner delivery</p><dl><dt>Situation</dt><dd>One place to discover cultural events and book tickets.</dd><dt>Result</dt><dd>Saudi Arabia\u2019s Ministry of Culture announced the platform\u2019s beta launch on 23 November 2023.</dd></dl><a class="text-link" href="${CASES[l]}#discover-culture">Case &amp; contribution${arrow}</a> <a class="text-link" href="https://www.spa.gov.sa/en/N2002647">Launch announcement${arrow}</a></article>
        <article class="funnel-card"><p class="card-eyebrow">Edge</p><h3>EdgeFocus</h3><p class="funnel-meta">Product founder \u00b7 with the Edge team</p><dl><dt>Situation</dt><dd>Keep customer relationships and project delivery connected.</dd><dt>Result</dt><dd>A working product for capturing a lead, developing a deal and managing the project\u2019s tasks.</dd></dl><a class="text-link" href="${CASES[l]}#edgefocus">Case &amp; contribution${arrow}</a> <a class="text-link" href="https://landing.edgefocus.ru/">Open the product${arrow}</a></article></div>
      <h2 class="funnel-sub">In colleagues\u2019 words</h2><p class="funnel-meta">Excerpts from professional recommendations.</p>
      <div class="funnel-quotes"><figure><blockquote><p>When shifting priorities and tight timelines might derail a project, Timothy is already anticipating scenarios, orchestrating globally distributed teams\u2026</p></blockquote><figcaption><strong>Oleg Nozhichkin</strong> \u00b7 December 10, 2024</figcaption></figure>
        <figure><blockquote><p>Under his leadership, we built a high-performing team entirely from scratch and delivered innovative solutions on tight deadlines.</p></blockquote><figcaption><strong>Mark Beseliya</strong> \u00b7 December 8, 2024</figcaption></figure></div>
      <p><a class="text-link" href="${RECS}">Read the recommendations on LinkedIn${arrow}</a></p><p class="funnel-meta">LinkedIn may require sign-in and limit visibility by account.</p>` },
    5: { title: 'What we can discuss and how it starts', lead: 'A few important answers.',
      body: (l) => `<div class="funnel-faq"><details open><summary>What can I get in touch about?</summary><p>Launching digital products and services that need software, IT infrastructure and coordinated teamwork: customer portals, internal systems, integrations and automation. Start by describing the situation and the result you need.</p></details>
        <details open><summary>Can I invite you to an interview or event?</summary><p>Yes. Send the topic, audience, format and proposed dates. Relevant themes include building digital products, leadership, delegation and organizing work.</p></details>
        <details open><summary>What happens after my message?</summary><p>We start by clarifying your situation and the result you need. If the project is a fit, we discuss the first stage, its scope and terms before work begins. For a partnership or invitation, we agree the purpose and format.</p></details></div>
      <p><a class="text-link" href="https://edgeivaikin.com/partners/">Explore referral, delivery and technology partnerships with Edge${arrow}</a></p>` },
    6: { title: 'A brief for email or Telegram', lead: 'A few lines are enough. Leave anything you do not know yet open.',
      body: () => `<ol class="funnel-brief"><li>Business and your role</li><li>What is blocked, and why it matters now</li><li>The result you need, and who it is for</li><li>Current stage</li><li>Target date, if any</li><li>Budget range, if known</li><li>Who decides and accepts the result</li></ol>` },
    7: { title: 'What are you building?', lead: 'Tell me what needs to work, who it is for, and where you are now. For a partnership, interview or speaking invitation, include the topic and the people involved.',
      body: (l) => `<div class="funnel-intents"><a class="button secondary" data-contact-intent="project" href="${MAIL[l].project.href}">${esc(MAIL[l].project.label)}</a><a class="button secondary" data-contact-intent="partnership" href="${MAIL[l].partnership.href}">${esc(MAIL[l].partnership.label)}</a><a class="button secondary" data-contact-intent="media" href="${MAIL[l].media.href}">${esc(MAIL[l].media.label)}</a></div>
        <div class="hero-actions"><a class="button primary" href="${TELEGRAM}" data-prefill="${esc(PREFILL.en)}">Message me on Telegram${arrow}</a><a class="email-link" href="mailto:${EMAIL}" aria-label="Email: ${EMAIL}">${EMAIL}</a></div>
        <p class="funnel-meta">A short, specific introduction is a good place to start.</p>` },
  },
  ru: {
    1: { title: 'Люди. Технологии. Работающие системы.', lead: 'Соединяю программное обеспечение, AI, инфраструктуру и команду, чтобы превращать бизнес-задачи в цифровые продукты и услуги.',
      body: () => `<div class="funnel-intro"><figure class="funnel-portrait"><img src="/assets/front/portrait.webp" width="900" height="1200" alt="Портрет Тимофея Ивайкина" decoding="async"><figcaption>Основатель Edge Ecosystem</figcaption></figure>
        <div><h2>Кто такой Тимофей Ивайкин?</h2><p>Тимофей Ивайкин (Timothy Ivaikin) \u2014 предприниматель, основатель Edge Ecosystem, создатель EdgeFocus вместе с командой и автор книг Good Results и Shattering Limits.</p></div></div>` },
    2: { title: 'Бизнес, технологии и люди. Вместе.', lead: 'Руковожу технической реализацией: от разбора бизнес-задачи и подбора команды до внедрения и приёмки согласованного результата.',
      body: (l) => `<div class="funnel-cards">
        <article class="funnel-card"><p class="card-eyebrow">Компания</p><h3>Edge Ecosystem</h3><p>Вместе с командой создаю клиентские порталы, внутренние системы и автоматизацию: чтобы клиенты могли получать услуги онлайн, сотрудники \u2014 выполнять операции без повторного ввода и ручной передачи данных, а руководители \u2014 видеть состояние работы.</p><ul><li>Клиентские онлайн-сервисы</li><li>Внутренние бизнес-системы</li><li>Интеграции и автоматизация</li></ul><a class="text-link" href="${EDGE[l]}">О компании Edge Ecosystem${arrow}</a></article>
        <article class="funnel-card"><p class="card-eyebrow">Продукт</p><h3>EdgeFocus</h3><p>Рабочее пространство для заметок, целей, проектов и действий. Продукт, который мы создаём с командой, чтобы связывать общую картину с повседневной работой.</p><ul><li>Сохранить важное</li><li>Связать с целью</li><li>Выбрать следующее действие</li></ul><a class="text-link" href="https://landing.edgefocus.ru/">Познакомиться с EdgeFocus${arrow}</a></article></div>` },
    3: { title: 'Начать с нужного людям результата.', lead: 'Как я работаю с бизнес-задачей.',
      body: () => `<ol class="funnel-steps-list"><li><h3>Разобраться в ситуации</h3><p>Кто будет пользоваться продуктом? Что должно измениться? Определяем проблему, нужный результат и границы работы.</p></li>
        <li><h3>Соединить части</h3><p>Объединяем программное обеспечение, инфраструктуру и людей в план реализации с понятными зонами ответственности и зависимостями.</p></li>
        <li><h3>Довести до использования</h3><p>Согласуем способ приёмки, поставляем результат отдельными этапами и учитываем работу тех, кто будет им пользоваться.</p></li></ol>` },
    4: { title: 'Примеры и слова коллег', lead: 'Клиентские проекты, работа в других командах и собственный продукт. У каждого примера \u2014 свой вклад и контекст.',
      body: (l) => `<div class="funnel-cards">
        <article class="funnel-card"><p class="card-eyebrow">2023\u20132024</p><h3>Discover Culture</h3><p class="funnel-meta">Технический руководитель \u00b7 партнёрская поставка</p><dl><dt>Задача</dt><dd>Единая площадка для поиска культурных мероприятий и оформления билетов.</dd><dt>Результат</dt><dd>Министерство культуры Саудовской Аравии объявило о бета-запуске платформы 23 ноября 2023 года.</dd></dl><a class="text-link" href="${CASES[l]}#discover-culture">Кейс и вклад${arrow}</a> <a class="text-link" href="https://www.spa.gov.sa/en/N2002647">Объявление о запуске${arrow}</a></article>
        <article class="funnel-card"><p class="card-eyebrow">Edge</p><h3>EdgeFocus</h3><p class="funnel-meta">Основатель продукта \u00b7 вместе с командой Edge</p><dl><dt>Задача</dt><dd>Связать работу с клиентами и исполнение проектов.</dd><dt>Результат</dt><dd>Работающий продукт, в котором можно завести лид, вести сделку и управлять задачами по проекту.</dd></dl><a class="text-link" href="${CASES[l]}#edgefocus">Кейс и вклад${arrow}</a> <a class="text-link" href="https://landing.edgefocus.ru/">Открыть продукт${arrow}</a></article></div>
      <h2 class="funnel-sub">Словами коллег</h2><p class="funnel-meta">Переводы фрагментов профессиональных рекомендаций.</p>
      <div class="funnel-quotes"><figure><blockquote lang="ru"><p>Когда смена приоритетов и сжатые сроки могут сорвать проект, Тимофей уже просчитывает сценарии и координирует распределённые по миру команды\u2026</p></blockquote><figcaption><strong>Oleg Nozhichkin</strong> \u00b7 10 декабря 2024 г.</figcaption></figure>
        <figure><blockquote lang="ru"><p>Под его руководством мы с нуля создали высокоэффективную команду и реализовали инновационные решения в сжатые сроки.</p></blockquote><figcaption><strong>Mark Beseliya</strong> \u00b7 8 декабря 2024 г.</figcaption></figure></div>
      <p><a class="text-link" href="${RECS}">Читать рекомендации в LinkedIn${arrow}</a></p><p class="funnel-meta">LinkedIn может потребовать вход и ограничить видимость в зависимости от аккаунта.</p>` },
    5: { title: 'О чём можно поговорить и как это начинается', lead: 'Несколько важных ответов.',
      body: () => `<div class="funnel-faq"><details open><summary>С чем можно обратиться?</summary><p>С запуском цифровых продуктов и услуг, которым нужны программное обеспечение, IT-инфраструктура и согласованная работа команды: клиентских порталов, внутренних систем, интеграций и автоматизации. Начните с описания ситуации и нужного результата.</p></details>
        <details open><summary>Можно пригласить на интервью или выступление?</summary><p>Да. Пришлите тему, аудиторию, формат и предполагаемые даты. Темы для разговора: создание цифровых продуктов, лидерство, делегирование и организация работы.</p></details>
        <details open><summary>Что будет после моего сообщения?</summary><p>Сначала уточним вашу ситуацию и нужный результат. Если задача подходит, обсудим первый этап, его объём и условия до начала работы. Для партнёрства или приглашения \u2014 согласуем цель и формат.</p></details></div>
      <p><a class="text-link" href="https://edgeivaikin.com/ru/partners/">Партнёрство с Edge: рекомендации, совместная поставка и технологии${arrow}</a></p>` },
    6: { title: 'Бриф для письма или Telegram', lead: 'Достаточно нескольких строк. Если что-то пока неизвестно \u2014 так и напишите.',
      body: () => `<ol class="funnel-brief"><li>Компания и ваша роль</li><li>Что мешает и почему это важно сейчас</li><li>Нужный результат и для кого он</li><li>Текущий этап</li><li>Желаемый срок, если есть</li><li>Диапазон бюджета, если известен</li><li>Кто принимает решение и результат работы</li></ol>` },
    7: { title: 'Что вы хотите создать?', lead: 'Расскажите, что должно заработать, для кого и на каком этапе вы сейчас. Для партнёрства, интервью или выступления \u2014 укажите тему и участников.',
      body: (l) => `<div class="funnel-intents"><a class="button secondary" data-contact-intent="project" href="${MAIL[l].project.href}">${esc(MAIL[l].project.label)}</a><a class="button secondary" data-contact-intent="partnership" href="${MAIL[l].partnership.href}">${esc(MAIL[l].partnership.label)}</a><a class="button secondary" data-contact-intent="media" href="${MAIL[l].media.href}">${esc(MAIL[l].media.label)}</a></div>
        <div class="hero-actions"><a class="button primary" href="${TELEGRAM}" data-prefill="${esc(PREFILL.ru)}">Написать в Telegram${arrow}</a><a class="email-link" href="mailto:${EMAIL}" aria-label="Написать на почту: ${EMAIL}">${EMAIL}</a></div>
        <p class="funnel-meta">Короткое и конкретное знакомство \u2014 хорошее начало.</p>` },
  },
};


// ---------------------------------------------------------------------------------------------------------------
// SEO / GEO / CRO layer (v2). Everything below is built from wording that already exists on this site.
// ---------------------------------------------------------------------------------------------------------------
// Indexing decision: the funnel pages stay noindex. Flip INDEXABLE to true (and add the 14 URLs to sitemap.xml) only
// after the 7-day story A/B review; see docs/seo-funnel-v2.md.
const INDEXABLE = false;
// CRO bundle A/B. '' = random 50/50 per browser. Set 'a' to roll every visitor back to the control.
const AB_FORCE = '';
const AB_KEY = 'iv_funnel_ab_cro_v1';
const OG_IMAGE = ORIGIN + '/assets/front/social.jpg';
const PERSON_ID = ORIGIN + '/#person';
const ORG_NAME = 'Edge Ecosystem';

const SEO = {
  en: {
    1: ['Timothy Ivaikin: who will use the product, what must change?', 'Timothy Ivaikin, founder of Edge Ecosystem, brings software, AI, infrastructure and teams together to turn business needs into digital products and services.'],
    2: ['Business, technology and people, connected | Timothy Ivaikin', 'Technical delivery from the business need and the team to implementation and acceptance of an agreed result. Edge Ecosystem and EdgeFocus.'],
    3: ['How I work with a business need | Timothy Ivaikin', 'Understand the situation, connect the parts, put it into use: the result people need, delivered in bounded stages with agreed acceptance.'],
    4: ['Examples and colleagues\u2019 words | Timothy Ivaikin', 'Discover Culture (technical lead, beta launch announced 23 November 2023), EdgeFocus, and excerpts from professional recommendations.'],
    5: ['What we can discuss and how it starts | Timothy Ivaikin', 'Projects, interviews and partnerships: what to send and what happens after your message.'],
    6: ['A brief for email or Telegram | Timothy Ivaikin', 'A few lines are enough: your business and role, what is blocked, the result you need, current stage, target date, budget range, who decides.'],
    7: ['What are you building? Contact Timothy Ivaikin', 'Tell me what needs to work, who it is for and where you are now. For a partnership, interview or speaking invitation, include the topic and the people involved.'],
  },
  ru: {
    1: ['Тимофей Ивайкин: кто будет пользоваться продуктом?', 'Тимофей Ивайкин, основатель Edge Ecosystem, соединяет программное обеспечение, AI, инфраструктуру и команду, чтобы превращать бизнес-задачи в цифровые продукты.'],
    2: ['Бизнес, технологии и люди: вместе | Тимофей Ивайкин', 'Техническая реализация от бизнес-задачи и команды до внедрения и приемки согласованного результата. Edge Ecosystem и EdgeFocus.'],
    3: ['Как я работаю с бизнес-задачей | Тимофей Ивайкин', 'Разобраться в ситуации, соединить части, довести до использования: нужный людям результат, поставка этапами и согласованная приемка.'],
    4: ['Примеры и слова коллег | Тимофей Ивайкин', 'Discover Culture (технический руководитель, бета-запуск объявлен 23 ноября 2023 года), EdgeFocus и фрагменты профессиональных рекомендаций.'],
    5: ['О чем можно поговорить и как это начинается | Тимофей Ивайкин', 'Проекты, интервью и партнерство: что прислать и что будет после вашего сообщения.'],
    6: ['Бриф для письма или Telegram | Тимофей Ивайкин', 'Достаточно нескольких строк: компания и роль, что мешает, нужный результат, этап, срок, диапазон бюджета, кто принимает решение.'],
    7: ['Что вы хотите создать? Связаться с Тимофеем Ивайкиным', 'Расскажите, что должно заработать, для кого и на каком этапе вы сейчас. Для партнерства, интервью или выступления укажите тему и участников.'],
  },
};

const ANSWER = {
  en: {
    2: ['What does Timothy Ivaikin do?', 'He leads technical delivery: from understanding the business need and assembling the team to implementation and acceptance of an agreed result. With his team he builds customer portals, internal systems and automation at Edge Ecosystem, and the EdgeFocus workspace.'],
    3: ['How does Timothy work with a business need?', 'In three steps: understand the situation (who will use the product, what needs to change), connect software, infrastructure and people into one delivery plan, and put the result into use by agreeing acceptance and delivering in bounded stages.'],
    4: ['What can be checked?', 'Discover Culture, a platform to discover cultural events and book tickets: Saudi Arabia\u2019s Ministry of Culture announced its beta launch on 23 November 2023, with Timothy as technical lead. EdgeFocus is a working product for capturing a lead, developing a deal and managing project tasks.'],
    6: ['What should the first message include?', 'A few lines: the business and your role, what is blocked and why it matters now, the result you need and who it is for. Anything not yet known can be left open.'],
  },
  ru: {
    2: ['Чем занимается Тимофей Ивайкин?', 'Руководит технической реализацией: от разбора бизнес-задачи и подбора команды до внедрения и приемки согласованного результата. Вместе с командой создает клиентские порталы, внутренние системы и автоматизацию в Edge Ecosystem и рабочее пространство EdgeFocus.'],
    3: ['Как Тимофей работает с бизнес-задачей?', 'В три шага: разобраться в ситуации (кто будет пользоваться продуктом, что должно измениться), соединить программное обеспечение, инфраструктуру и людей в один план реализации и довести до использования: согласовать приемку и поставлять этапами.'],
    4: ['Что можно проверить?', 'Discover Culture, площадка для поиска культурных мероприятий и оформления билетов: министерство культуры Саудовской Аравии объявило о ее бета-запуске 23 ноября 2023 года, Тимофей был техническим руководителем. EdgeFocus: работающий продукт, в котором можно завести лид, вести сделку и управлять задачами проекта.'],
    6: ['Что написать в первом сообщении?', 'Несколько строк: компания и ваша роль, что мешает и почему это важно сейчас, нужный результат и для кого он. Если что-то пока неизвестно, так и напишите.'],
  },
};

const SHARE = {
  en: { label: 'Share the checklist', text: 'A short brief for a first conversation about a digital project: business and role, what is blocked, the result needed, stage, date, budget range, who decides.' },
  ru: { label: 'Переслать чек-лист коллеге', text: 'Короткий бриф к первому разговору о цифровом проекте: компания и роль, что мешает, нужный результат, этап, срок, бюджет, кто решает.' },
};
const PREFILL = {
  en: 'Hello! My business and role: \nWhat is blocked: \nResult needed and for whom: \nStage and date: ',
  ru: 'Здравствуйте! Моя компания и роль: \nЧто мешает: \nКакой результат нужен и для кого: \nЭтап и срок: ',
};

const plain = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const ldScript = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function jsonLd(lang, n, t, body, url, seoTitle, seoDesc) {
  const person = {
    '@type': 'Person', '@id': PERSON_ID, name: 'Timothy Ivaikin', alternateName: '\u0422\u0438\u043c\u043e\u0444\u0435\u0439 \u0418\u0432\u0430\u0439\u043a\u0438\u043d', url: ORIGIN + '/', image: ORIGIN + '/assets/front/portrait.webp',
    jobTitle: lang === 'ru' ? '\u041e\u0441\u043d\u043e\u0432\u0430\u0442\u0435\u043b\u044c Edge Ecosystem' : 'Founder of Edge Ecosystem',
    worksFor: { '@type': 'Organization', name: ORG_NAME, url: 'https://edgeivaikin.com/' },
    sameAs: ['https://www.linkedin.com/in/timothyivaikin', 'https://www.youtube.com/@TimothyIvaikin', 'https://github.com/Ivajkin', 'https://ivaikin.medium.com/', 'https://t.me/timothyivaikin'],
  };
  const org = { '@type': 'Organization', '@id': 'https://edgeivaikin.com/#org', name: ORG_NAME, url: 'https://edgeivaikin.com/', founder: { '@id': PERSON_ID } };
  const crumbs = {
    '@type': 'BreadcrumbList', '@id': url + '#breadcrumb',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Timothy Ivaikin', item: ORIGIN + home(lang) },
      { '@type': 'ListItem', position: 2, name: `${t.stepOf(n)}: ${t.stage[n - 1]}`, item: url },
    ],
  };
  const page = { '@type': 'WebPage', '@id': url + '#webpage', url, name: seoTitle, description: seoDesc, inLanguage: lang, isPartOf: { '@id': ORIGIN + '/#profile' }, about: { '@id': PERSON_ID }, breadcrumb: { '@id': url + '#breadcrumb' } };
  const graph = [person, org, page, crumbs];
  if (n === 2) {
    graph.push({
      '@type': 'Service', '@id': url + '#service', name: lang === 'ru' ? '\u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u0446\u0438\u0444\u0440\u043e\u0432\u044b\u0445 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432 \u0438 \u0443\u0441\u043b\u0443\u0433' : 'Technical delivery of digital products and services',
      provider: { '@id': PERSON_ID }, description: seoDesc,
      serviceType: lang === 'ru' ? ['\u041a\u043b\u0438\u0435\u043d\u0442\u0441\u043a\u0438\u0435 \u043e\u043d\u043b\u0430\u0439\u043d-\u0441\u0435\u0440\u0432\u0438\u0441\u044b', '\u0412\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0435 \u0431\u0438\u0437\u043d\u0435\u0441-\u0441\u0438\u0441\u0442\u0435\u043c\u044b', '\u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438 \u0438 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044f'] : ['Customer-facing services', 'Internal business systems', 'Integration & automation'],
    });
  }
  if (n === 5) {
    const items = [...body.matchAll(/<summary>(.*?)<\/summary><p>(.*?)<\/p>/g)].map((m) => ({ '@type': 'Question', name: plain(m[1]), acceptedAnswer: { '@type': 'Answer', text: plain(m[2]) } }));
    if (items.length) graph.push({ '@type': 'FAQPage', '@id': url + '#faq', url, inLanguage: lang, mainEntity: items });
  }
  return ldScript({ '@context': 'https://schema.org', '@graph': graph });
}

const AB_SCRIPT = `<script>(function(){var v="${AB_FORCE}";try{if(!v){v=localStorage.getItem("${AB_KEY}");if(v!=="a"&&v!=="b"){v=Math.random()<.5?"a":"b";localStorage.setItem("${AB_KEY}",v)}}}catch(e){}v=v==="b"?"b":"a";window.edgeFunnelAB=v;if(v==="b")document.documentElement.className+=" fab-b"})()</script>`;

const GTAG = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-2Z5VJ13B20"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
var loc = window.location.origin + window.location.pathname, q = [];
try { new URLSearchParams(window.location.search).forEach(function (v, k) { if (/^utm_(source|medium|campaign|content|term)$/.test(k) && /^[A-Za-z0-9_.\-]{1,64}$/.test(v)) q.push(k + '=' + v); }); } catch (e) {}
if (q.length) loc += '?' + q.join('&');
gtag('config', 'G-2Z5VJ13B20', {page_location: loc, allow_google_signals: false, send_page_view: true});
</script>`;

function render(lang, n) {
  const t = T[lang];
  const c = C[lang][n];
  const url = ORIGIN + base(lang, n);
  const other = lang === 'ru' ? 'en' : 'ru';
  const body = c.body(lang);
  const steps = t.stage.map((label, i) => {
    const k = i + 1;
    return `<a href="${base(lang, k)}"${k === n ? ' aria-current="step"' : ''}><span class="n">${k}</span><span class="l">${esc(label)}</span></a>`;
  }).join('');
  const nextBlock = n < 7
    ? `<a class="button primary" href="${base(lang, n + 1)}">${esc(t.next(t.stage[n]))}</a><a class="button secondary" href="${base(lang, 7)}" data-ladder-contact>${esc(t.discuss)}</a>`
    : `<a class="button secondary" href="${home(lang)}">${esc(t.siteLink)}</a>`;
  const tg = n < 7 ? `<p class="funnel-meta">${esc(t.tgLine)} <a href="${TELEGRAM}">${esc(t.tgLink)}</a></p>` : '';
  const [seoTitle, seoDesc] = SEO[lang][n];
  const ans = ANSWER[lang][n];
  const answerBlock = ans ? `\n  <section class="section answer-section"><div class="wrap"><div class="answer" data-answer><h2>${esc(ans[0])}</h2><p>${esc(ans[1])}</p></div></div></section>` : '';
  const shareUrl = `${url}?utm_source=telegram&utm_medium=share&utm_campaign=ladder&utm_content=share_s${n}`;
  const shareBlock = n === 6 ? `<p class="share"><a class="button secondary" href="https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&amp;text=${encodeURIComponent(SHARE[lang].text)}" target="_blank" rel="noopener">${esc(SHARE[lang].label)}</a></p>` : '';
  const heroCta = n < 7 ? `<p class="hero-cta"><a class="button primary" href="${base(lang, 7)}" data-ladder-contact>${esc(t.discuss)}</a></p>` : '';
  const stickyCta = n < 7
    ? `<div class="sticky-cta" data-sticky-cta><a class="button primary" href="${base(lang, 7)}" data-ladder-contact>${esc(t.discuss)}</a></div>`
    : `<div class="sticky-cta" data-sticky-cta><a class="button primary" href="${TELEGRAM}" data-prefill="${esc(PREFILL[lang])}">${esc(t.tgLink)}</a></div>`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(seoTitle)}</title>
<meta name="description" content="${esc(seoDesc)}">
<meta name="author" content="Timothy Ivaikin">
<meta name="robots" content="${INDEXABLE ? 'index,follow' : 'noindex'}">
<meta name="theme-color" content="#f5f7fa">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="${other}" href="${ORIGIN + base(other, n)}">
<link rel="alternate" hreflang="${lang}" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${t.siteName}">
<meta property="og:title" content="${esc(seoTitle)}">
<meta property="og:description" content="${esc(seoDesc)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${t.locale}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(lang === 'ru' ? 'Тимофей Ивайкин — предприниматель, основатель и автор' : 'Timothy Ivaikin — entrepreneur, founder and author')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(seoTitle)}">
<meta name="twitter:description" content="${esc(seoDesc)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/home/fonts/manrope-bold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="${ASSET.css}">
<link rel="stylesheet" href="${ASSET.funnelCss}">
${AB_SCRIPT}
${jsonLd(lang, n, t, body, url, seoTitle, seoDesc)}
${GTAG}
</head>
<body class="home-page funnel" data-funnel-step="${n}">
<a class="skip-link" href="#main">${esc(t.skip)}</a>
<header class="site-header"><div class="wrap header-inner">
  <a class="wordmark" href="${home(lang)}" aria-label="${esc(t.wordmark)}"><span aria-hidden="true">ti.</span></a>
  <nav class="funnel-nav" aria-label="${esc(t.stepsLabel)}">${steps}</nav>
  <nav class="language-nav" aria-label="${esc(t.langLabel)}"><a class="language-link" href="${base('en', n)}" lang="en" hreflang="en" aria-label="English"${lang === 'en' ? ' aria-current="page"' : ''}>EN</a><a class="language-link" href="${base('ru', n)}" lang="ru" hreflang="ru" aria-label="Русский"${lang === 'ru' ? ' aria-current="page"' : ''}>RU</a></nav>
</div></header>
<main id="main">
  <section class="section funnel-step" id="step-${n}" data-ladder-stage aria-labelledby="funnel-title"><div class="wrap">
    <p class="eyebrow">${esc(t.stepOf(n))} \u00b7 ${esc(t.stage[n - 1])}</p>
    <h1 id="funnel-title" class="funnel-title">${esc(c.title)}</h1>
    <p class="funnel-lead">${esc(c.lead)}</p>
    ${heroCta}
    ${n === 7 ? `<div id="contact" class="contact-stack">${body}</div>` : body}
    ${shareBlock}
  </div></section>${answerBlock}
  <section class="section funnel-next"><div class="wrap">
    <div class="hero-actions">${nextBlock}</div>
    ${tg}
  </div></section>
</main>
${stickyCta}
<footer class="site-footer"><div class="wrap footer-inner"><div><a class="footer-brand" href="${home(lang)}">${esc(t.wordmark)}</a><p class="footer-note">${esc(t.footerNote)}</p></div><nav class="social-links" aria-label="${lang === 'ru' ? 'Публичные профили' : 'Public profiles'}"><a href="${lang === 'ru' ? '/ru/press/' : '/press/'}">${esc(t.press)}</a><a href="https://www.linkedin.com/in/timothyivaikin" rel="me">LinkedIn</a></nav></div></footer>
<script src="${ASSET.js}" defer></script>
</body>
</html>
`;
}

for (const lang of ['en', 'ru']) {
  for (let n = 1; n <= 7; n++) {
    const file = resolve(root, base(lang, n).slice(1), 'index.html');
    await mkdir(dirname(file), { recursive: true });
    // House style for these pages: no \u0451 (\u0451 -> \u0435).
    await writeFile(file, render(lang, n).replace(/\u0451/g, '\u0435').replace(/\u0401/g, '\u0415'));
  }
}
console.log('funnel pages written: 14');
