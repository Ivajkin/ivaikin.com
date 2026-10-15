/* Interview visits and contact intent. A click is not a received or qualified lead. */
(() => {
  'use strict';
  const location = new URL(window.location.href);
  const page = /^\/(ru|en)\/interviews\/tai-chi-business\/$/.exec(location.pathname);
  if (location.origin !== 'https://ivaikin.com' || !page ||
      document.querySelector('meta[name="staging-release"]') || window.edgeInterviewAnalyticsInitialized) return;
  window.edgeInterviewAnalyticsInitialized = true;

  // Only public, predefined campaign labels may leave this page. Never forward
  // arbitrary query values, fragment text, contact details or referrer paths.
  const allowed = {
    source: ['telegram', 'youtube', 'vk', 'linkedin', 'instagram', 'facebook', 'x', 'email', 'participant'],
    medium: ['social', 'video', 'referral', 'email', 'organic'],
    campaign: ['tai_chi_business'],
    content: ['announcement', 'main', 'team_ru', 'system_ru', 'people_ru', 'team_en', 'system_en', 'participant'],
  };
  const entry = {};
  for (const [key, values] of Object.entries(allowed)) {
    const value = location.searchParams.get('utm_' + key);
    entry[key] = values.includes(value) ? value : key === 'source' ? 'unattributed' : 'none';
  }
  // Language navigation opens a new document. Carry only the same approved
  // campaign labels, without storing a visitor identifier or forwarding text.
  document.querySelectorAll('a[hreflang]').forEach(link => {
    const target = new URL(link.getAttribute('href'), location);
    if (target.origin !== location.origin || !/^\/(ru|en)\/interviews\/tai-chi-business\/$/.test(target.pathname)) return;
    for (const key of Object.keys(allowed)) {
      if (allowed[key].includes(entry[key])) target.searchParams.set('utm_' + key, entry[key]);
    }
    link.setAttribute('href', target.href);
  });
  let referrer = '';
  try {
    const url = new URL(document.referrer);
    if (url.protocol === 'https:' || url.protocol === 'http:') referrer = url.origin + '/';
  } catch { /* No referrer is an ordinary direct visit. */ }
  const cleanLocation = location.origin + location.pathname;
  const measurementId = 'G-2Z5VJ13B20';
  window.dataLayer = window.dataLayer || [];
  const existingTag = typeof window.gtag === 'function';
  if (!existingTag) window.gtag = function () { window.dataLayer.push(arguments); };
  if (!existingTag) window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_location: cleanLocation,
    page_referrer: referrer,
    page_language: page[1],
    content_group: 'interview',
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: true,
    campaign_source: entry.source,
    campaign_medium: entry.medium,
    campaign_name: entry.campaign,
    campaign_content: entry.content,
    campaign_id: 'none',
    campaign_term: 'none',
  });
  if (!existingTag) {
    const loader = document.createElement('script');
    loader.async = true;
    loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(loader);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || !link.closest('.contact') || link.getAttribute('href') !== 'https://t.me/timothyivaikin') return;
    window.gtag('event', 'contact_click', {
      send_to: measurementId,
      channel: 'telegram',
      page_language: page[1],
      content_id: 'tai_chi_business',
      section: 'contact',
      page_location: cleanLocation,
      entry_source: entry.source,
      entry_medium: entry.medium,
      entry_campaign: entry.campaign,
      entry_content: entry.content,
    });
  });
})();
