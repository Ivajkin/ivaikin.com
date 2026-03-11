/**
 * Analytics Funnel Tracker for ivaikin.com
 *
 * 6-stage funnel:
 * 1. REACH    — page_view (language, source, device, country)
 * 2. ENGAGE   — scroll_depth, section_view, time_on_page
 * 3. INTEREST — pillar_click, testimonial_expand, cta_impression
 * 4. INTENT   — form_start, form_field_complete, form_abandon
 * 5. CONVERT  — form_submit, community_join
 * 6. QUALIFY   — tracked offline
 */

// ==================== CORE EVENT TRACKING ====================

function trackEvent(eventName, params = {}) {
  // Add common dimensions
  params.page_language = document.documentElement.lang || 'en';
  params.page_url = window.location.href;
  params.timestamp = new Date().toISOString();

  // GA4
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }

  // Console logging for development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`[Funnel] ${eventName}`, params);
  }
}

// ==================== STAGE 1: REACH ====================

function trackReach() {
  const urlParams = new URLSearchParams(window.location.search);
  trackEvent('page_view_enhanced', {
    funnel_stage: 'reach',
    utm_source: urlParams.get('utm_source') || 'direct',
    utm_medium: urlParams.get('utm_medium') || 'none',
    utm_campaign: urlParams.get('utm_campaign') || 'none',
    device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    referrer: document.referrer || 'direct',
  });
}

// ==================== STAGE 2: ENGAGE ====================

function trackScrollDepth() {
  const thresholds = [25, 50, 75, 100];
  const tracked = new Set();

  function checkScroll() {
    const scrollPct = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    thresholds.forEach(t => {
      if (scrollPct >= t && !tracked.has(t)) {
        tracked.add(t);
        trackEvent('scroll_depth', {
          funnel_stage: 'engage',
          depth_percent: t,
        });
      }
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        checkScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function trackSectionViews() {
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        trackEvent('section_view', {
          funnel_stage: 'engage',
          section_id: entry.target.id,
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => observer.observe(section));
}

function trackTimeOnPage() {
  const milestones = [30, 60, 120, 300];
  const tracked = new Set();
  const startTime = Date.now();

  setInterval(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    milestones.forEach(m => {
      if (seconds >= m && !tracked.has(m)) {
        tracked.add(m);
        trackEvent('time_on_page', {
          funnel_stage: 'engage',
          seconds: m,
        });
      }
    });
  }, 5000);
}

// ==================== STAGE 3: INTEREST ====================

function trackPillarClicks() {
  document.querySelectorAll('.pillar-card').forEach(card => {
    card.addEventListener('click', () => {
      trackEvent('pillar_click', {
        funnel_stage: 'interest',
        pillar: card.dataset.pillar,
      });
    });
  });
}

function trackCTAImpressions() {
  const ctas = document.querySelectorAll('.btn-primary, .btn-secondary');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const label = entry.target.textContent.trim().slice(0, 50);
        trackEvent('cta_impression', {
          funnel_stage: 'interest',
          cta_text: label,
          cta_href: entry.target.getAttribute('href') || 'button',
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  ctas.forEach(cta => observer.observe(cta));
}

function trackTestimonialInteraction() {
  document.querySelectorAll('.testimonial-card').forEach(card => {
    card.addEventListener('click', () => {
      const author = card.querySelector('.testimonial-author strong');
      trackEvent('testimonial_interact', {
        funnel_stage: 'interest',
        author: author ? author.textContent : 'unknown',
        source: card.dataset.source,
      });
    });
  });
}

// ==================== STAGE 4: INTENT ====================

function trackFormIntent() {
  const form = document.getElementById('applyForm');
  if (!form) return;

  let formStarted = false;
  const fieldsCompleted = new Set();

  // Track form start
  form.addEventListener('focusin', (e) => {
    if (!formStarted && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
      formStarted = true;
      trackEvent('form_start', {
        funnel_stage: 'intent',
        form_id: 'apply',
        first_field: e.target.name || e.target.id,
      });
    }
  });

  // Track individual field completion
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('change', () => {
      const fieldName = field.name || field.id;
      if (!fieldsCompleted.has(fieldName)) {
        fieldsCompleted.add(fieldName);
        trackEvent('form_field_complete', {
          funnel_stage: 'intent',
          form_id: 'apply',
          field_name: fieldName,
          fields_completed: fieldsCompleted.size,
        });
      }
    });
  });

  // Track form abandon
  window.addEventListener('beforeunload', () => {
    if (formStarted && fieldsCompleted.size > 0) {
      trackEvent('form_abandon', {
        funnel_stage: 'intent',
        form_id: 'apply',
        fields_completed: fieldsCompleted.size,
        last_field: Array.from(fieldsCompleted).pop(),
      });
    }
  });

  // Track checkbox interactions (pillar interest mapping)
  form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      trackEvent('interest_selected', {
        funnel_stage: 'intent',
        interest: cb.value,
        checked: cb.checked,
      });
    });
  });

  // Track budget selection (key qualification signal)
  const budgetSelect = form.querySelector('#budget');
  if (budgetSelect) {
    budgetSelect.addEventListener('change', () => {
      trackEvent('budget_selected', {
        funnel_stage: 'intent',
        budget_range: budgetSelect.value,
      });
    });
  }
}

// ==================== STAGE 5: CONVERT ====================

function trackFormSubmission() {
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      // Collect all checked interests
      const interests = Array.from(applyForm.querySelectorAll('input[name="interests"]:checked'))
        .map(cb => cb.value);

      trackEvent('form_submit', {
        funnel_stage: 'convert',
        form_id: 'apply',
        interests: interests.join(','),
        budget: applyForm.querySelector('#budget')?.value || 'none',
        has_message: !!applyForm.querySelector('#message')?.value,
      });
    });
  }

  const communityForm = document.getElementById('communityForm');
  if (communityForm) {
    communityForm.addEventListener('submit', () => {
      trackEvent('community_join', {
        funnel_stage: 'convert',
        form_id: 'community',
      });
    });
  }
}

// ==================== PILLAR DEMAND HEATMAP ====================

function trackPillarDemand() {
  // Track which pillars get most attention (time spent visible)
  const pillarCards = document.querySelectorAll('.pillar-card');
  const pillarTimes = {};

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const pillar = entry.target.dataset.pillar;
      if (entry.isIntersecting) {
        pillarTimes[pillar] = { start: Date.now(), total: pillarTimes[pillar]?.total || 0 };
      } else if (pillarTimes[pillar]?.start) {
        pillarTimes[pillar].total += Date.now() - pillarTimes[pillar].start;
        pillarTimes[pillar].start = null;
      }
    });
  }, { threshold: 0.5 });

  pillarCards.forEach(card => observer.observe(card));

  // Report on page unload
  window.addEventListener('beforeunload', () => {
    Object.entries(pillarTimes).forEach(([pillar, data]) => {
      const totalMs = data.total + (data.start ? Date.now() - data.start : 0);
      if (totalMs > 2000) {
        trackEvent('pillar_attention', {
          funnel_stage: 'interest',
          pillar: pillar,
          attention_seconds: Math.round(totalMs / 1000),
        });
      }
    });
  });
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
  // Stage 1: Reach
  trackReach();

  // Stage 2: Engage
  trackScrollDepth();
  trackSectionViews();
  trackTimeOnPage();

  // Stage 3: Interest
  trackPillarClicks();
  trackCTAImpressions();
  trackTestimonialInteraction();
  trackPillarDemand();

  // Stage 4: Intent
  trackFormIntent();

  // Stage 5: Convert
  trackFormSubmission();
});
