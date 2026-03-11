document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Form submission handler (Formspree or custom)
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = applyForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';

      const formData = new FormData(applyForm);
      const action = applyForm.getAttribute('action');

      try {
        const res = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });

        if (res.ok) {
          btn.textContent = '\u2713';
          btn.style.background = '#2a7d4f';
          applyForm.reset();
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Submit failed');
        }
      } catch {
        btn.textContent = originalText;
        btn.disabled = false;
        // Fallback: open mailto
        const name = formData.get('name') || '';
        const contact = formData.get('contact') || '';
        const msg = formData.get('message') || '';
        const subject = encodeURIComponent(`Strategic Session Application from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nContact: ${contact}\n\n${msg}`);
        window.location.href = `mailto:ceo@edgeexperts.co?subject=${subject}&body=${body}`;
      }
    });
  }

  // Community form
  const communityForm = document.getElementById('communityForm');
  if (communityForm) {
    communityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = communityForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';

      const formData = new FormData(communityForm);
      const action = communityForm.getAttribute('action');

      try {
        const res = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });

        if (res.ok) {
          btn.textContent = '\u2713';
          btn.style.background = '#2a7d4f';
          communityForm.reset();
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Submit failed');
        }
      } catch {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  // Pillar card hover effect
  document.querySelectorAll('.pillar-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--accent-gold-dim)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '';
    });
  });
});
