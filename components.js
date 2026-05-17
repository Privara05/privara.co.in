/* ============================================================
   PRIVARA — GLOBAL COMPONENTS
   components.js — Step 2, Phase 1
   Handles: Nav, Mobile Menu, Dropdowns, Accordion, Reveal,
            Scroll-to, Tabs, Form validation, Schema injection
   Import on every page AFTER design-system.css
   ============================================================ */

'use strict';

/* ── 1. NAV — Sticky scroll shadow ───────────────────────── */
(function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ── 2. MOBILE HAMBURGER ──────────────────────────────────── */
(function initMobileMenu() {
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileNav = document.querySelector('.nav__mobile');
  const body      = document.body;

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    body.style.overflow = isOpen ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on overlay click (tap outside drawer)
  document.addEventListener('click', (e) => {
    if (
      mobileNav.classList.contains('open') &&
      !mobileNav.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', false);
    }
  });
})();


/* ── 3. DESKTOP DROPDOWN — keyboard accessible ────────────── */
(function initDropdowns() {
  const items = document.querySelectorAll('.nav__item');

  items.forEach(item => {
    const trigger  = item.querySelector('.nav__link');
    const dropdown = item.querySelector('.nav__dropdown');
    if (!trigger || !dropdown) return;

    // Accessibility
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    const open  = () => { trigger.setAttribute('aria-expanded', 'true');  };
    const close = () => { trigger.setAttribute('aria-expanded', 'false'); };

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);

    // Keyboard: Enter/Space to toggle
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          close();
          item.classList.remove('dropdown-open');
        } else {
          open();
          item.classList.add('dropdown-open');
          // Focus first dropdown link
          const firstLink = dropdown.querySelector('.nav__dropdown-link');
          if (firstLink) firstLink.focus();
        }
      }
    });

    // Tab out closes dropdown
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
        item.classList.remove('dropdown-open');
        trigger.focus();
      }
    });
  });
})();


/* ── 4. ACCORDION / FAQ ───────────────────────────────────── */
(function initAccordion() {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach(accordion => {
    const items = accordion.querySelectorAll('.accordion-item');

    items.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      const content = item.querySelector('.accordion-content');
      if (!trigger || !content) return;

      // Accessibility attributes
      const id = 'accordion-' + Math.random().toString(36).slice(2, 7);
      content.id = id;
      trigger.setAttribute('aria-controls', id);
      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Option: close other open items in same accordion (comment out for multi-open)
        items.forEach(other => {
          if (other !== item && other.classList.contains('open')) {
            other.classList.remove('open');
            const otherTrigger = other.querySelector('.accordion-trigger');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen);
      });

      // Keyboard: Enter/Space
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
    });
  });
})();


/* ── 5. SCROLL REVEAL ─────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  // Use IntersectionObserver if available
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    targets.forEach(el => el.classList.add('visible'));
  }
})();


/* ── 6. SMOOTH SCROLL for anchor links ───────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72',
      10
    );

    const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;

    window.scrollTo({ top, behavior: 'smooth' });

    // Close mobile menu if open
    const mobileNav  = document.querySelector('.nav__mobile');
    const hamburger  = document.querySelector('.nav__hamburger');
    if (mobileNav && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      hamburger && hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();


/* ── 7. TABS ──────────────────────────────────────────────── */
(function initTabs() {
  const tabGroups = document.querySelectorAll('[data-tabs]');

  tabGroups.forEach(group => {
    const triggers = group.querySelectorAll('[data-tab-trigger]');
    const panels   = group.querySelectorAll('[data-tab-panel]');

    if (!triggers.length || !panels.length) return;

    const activate = (index) => {
      triggers.forEach((t, i) => {
        t.classList.toggle('tab-active', i === index);
        t.setAttribute('aria-selected', i === index);
      });
      panels.forEach((p, i) => {
        p.classList.toggle('tab-panel-active', i === index);
        p.hidden = i !== index;
      });
    };

    // Init first tab
    activate(0);

    triggers.forEach((trigger, i) => {
      trigger.setAttribute('role', 'tab');
      trigger.setAttribute('tabindex', i === 0 ? '0' : '-1');

      trigger.addEventListener('click', () => activate(i));

      // Arrow key navigation
      trigger.addEventListener('keydown', (e) => {
        let next = i;
        if (e.key === 'ArrowRight') next = (i + 1) % triggers.length;
        if (e.key === 'ArrowLeft')  next = (i - 1 + triggers.length) % triggers.length;
        if (next !== i) {
          activate(next);
          triggers[next].focus();
        }
      });
    });
  });
})();


/* ── 8. ACTIVE NAV LINK ───────────────────────────────────── */
(function setActiveNavLink() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  document.querySelectorAll('.nav__link, .nav__dropdown-link, .nav__mobile-link').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '');
    if (href && href !== '#' && path === href) {
      link.classList.add('nav__link--active');
    }
  });
})();


/* ── 9. CONTACT FORM — client-side validation ─────────────── */
(function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const showError = (input, message) => {
    clearError(input);
    input.classList.add('form-input--error');
    const err = document.createElement('span');
    err.className = 'form-error';
    err.textContent = message;
    err.setAttribute('role', 'alert');
    input.parentNode.appendChild(err);
  };

  const clearError = (input) => {
    input.classList.remove('form-input--error');
    const existing = input.parentNode.querySelector('.form-error');
    if (existing) existing.remove();
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  form.addEventListener('submit', (e) => {
    let valid = true;

    // Required fields
    form.querySelectorAll('[required]').forEach(field => {
      clearError(field);
      if (!field.value.trim()) {
        showError(field, 'This field is required.');
        valid = false;
      }
    });

    // Email validation
    const emailField = form.querySelector('[type="email"]');
    if (emailField && emailField.value.trim() && !validateEmail(emailField.value)) {
      showError(emailField, 'Please enter a valid email address.');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      // Focus first error
      const firstError = form.querySelector('.form-input--error');
      if (firstError) firstError.focus();
    }
  });

  // Clear error on input
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
    field.addEventListener('input', () => clearError(field));
  });
})();


/* ── 10. INTERACTIVE CHECKLIST (Checklist page) ───────────── */
(function initChecklist() {
  const checkItems = document.querySelectorAll('.check-item[data-check]');
  if (!checkItems.length) return;

  checkItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.setAttribute('role', 'checkbox');
    item.setAttribute('aria-checked', 'false');
    item.setAttribute('tabindex', '0');

    const toggle = () => {
      const checked = item.classList.toggle('checked');
      item.setAttribute('aria-checked', checked);
      // Persist state in sessionStorage
      const key = 'check-' + item.dataset.check;
      sessionStorage.setItem(key, checked ? '1' : '0');
      updateProgress();
    };

    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    // Restore state
    const saved = sessionStorage.getItem('check-' + item.dataset.check);
    if (saved === '1') {
      item.classList.add('checked');
      item.setAttribute('aria-checked', 'true');
    }
  });

  function updateProgress() {
    const total   = checkItems.length;
    const checked = document.querySelectorAll('.check-item.checked').length;
    const bar     = document.querySelector('.checklist-progress-bar');
    const label   = document.querySelector('.checklist-progress-label');
    if (bar)   bar.style.width   = (checked / total * 100) + '%';
    if (label) label.textContent = checked + ' of ' + total + ' items reviewed';
  }

  updateProgress();
})();


/* ── 11. FINDING TABS (Homepage Section 5) ────────────────── */
/* Uses the generic tabs system above via [data-tabs].
   No additional code needed — driven by data attributes.    */


/* ── 12. SCHEMA INJECTION HELPER ─────────────────────────── */
/* Called per-page via inline script to inject JSON-LD.
   Usage: Privara.injectSchema({ "@type": "FAQPage", ... })  */
window.Privara = window.Privara || {};

Privara.injectSchema = function(schemaObj) {
  const script   = document.createElement('script');
  script.type    = 'application/ld+json';
  script.textContent = JSON.stringify(schemaObj);
  document.head.appendChild(script);
};

// Organization schema — injected on every page automatically
(function injectOrgSchema() {
  Privara.injectSchema({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Privara",
    "url": "https://privara.co.in",
    "email": "contact@privara.co.in",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Pune",
      "addressCountry": "IN"
    },
    "description": "DPDPA compliance audit and governance advisory firm for Indian organisations.",
    "logo": "https://privara.co.in/assets/logo.png"
  });
})();


/* ── 13. FONT OVERRIDE ────────────────────────────────────── */
/* Injects Fraunces + DM Sans Google Fonts link if not already
   present (backup in case CSS @import is blocked by browser) */
(function ensureFonts() {
  const id = 'privara-fonts';
  if (document.getElementById(id)) return;

  const link  = document.createElement('link');
  link.id     = id;
  link.rel    = 'stylesheet';
  link.href   = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap';
  document.head.appendChild(link);
})();


/* ── 14. UTILITY EXPORTS ──────────────────────────────────── */
Privara.utils = {
  /* Format Indian rupees */
  formatINR: (n) => '₹' + Number(n).toLocaleString('en-IN'),

  /* Debounce */
  debounce: (fn, ms = 200) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  /* Trap focus inside modal / drawer (accessibility) */
  trapFocus: (el) => {
    const focusable = el.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
};
