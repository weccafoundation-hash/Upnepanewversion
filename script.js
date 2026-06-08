/**
 * UPNEPA NG — Static Site JavaScript
 */
(function () {
  'use strict';

  const STORAGE_EXIT_INTENT = 'upnepa_exit_intent_dismissed';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ── Mobile Navigation ── */
  function initMobileNav() {
    const toggle = document.querySelector('[data-mobile-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    const backdrop = document.querySelector('[data-mobile-backdrop]');
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove('is-open');
      backdrop?.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    const open = () => {
      nav.classList.add('is-open');
      backdrop?.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? close() : open();
    });

    backdrop?.addEventListener('click', close);
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
    });
  }

  /* ── Scroll Reveal ── */
  function initScrollReveal() {
    if (prefersReducedMotion()) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-10% 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /* ── Sticky CTAs ── */
  function initStickyCTAs() {
    const mobileCta = document.querySelector('[data-sticky-mobile-cta]');
    const desktopCta = document.querySelector('[data-sticky-desktop-cta]');

    const onScroll = () => {
      const show = window.scrollY > 400;
      mobileCta?.classList.toggle('is-visible', show);
      desktopCta?.classList.toggle('is-visible', show);
      document.body.classList.toggle('has-sticky-cta', show && !!mobileCta);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Exit Intent Modal ── */
  function initExitIntent() {
    const overlay = document.querySelector('[data-exit-intent]');
    if (!overlay || sessionStorage.getItem(STORAGE_EXIT_INTENT)) return;

    const dismiss = () => {
      overlay.classList.remove('is-open');
      sessionStorage.setItem(STORAGE_EXIT_INTENT, '1');
    };

    const accept = () => {
      window.location.href = 'contact.html?source=exit-intent#assessment-form';
    };

    overlay.querySelector('[data-exit-accept]')?.addEventListener('click', accept);
    overlay.querySelector('[data-exit-dismiss]')?.addEventListener('click', dismiss);
    overlay.querySelector('[data-exit-close]')?.addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });

    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !sessionStorage.getItem(STORAGE_EXIT_INTENT)) {
        overlay.classList.add('is-open');
      }
    });
  }

  /* ── Accordion ── */
  function initAccordions() {
    document.querySelectorAll('[data-accordion]').forEach((accordion) => {
      accordion.querySelectorAll('[data-accordion-trigger]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
          const item = trigger.closest('[data-accordion-item]');
          const isOpen = item.classList.contains('is-open');

          accordion.querySelectorAll('[data-accordion-item]').forEach((i) => {
            i.classList.remove('is-open');
            i.querySelector('[data-accordion-trigger]')?.setAttribute('aria-expanded', 'false');
          });

          if (!isOpen) {
            item.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });
  }

  /* ── Testimonial Slider ── */
  function initTestimonialSlider() {
    const slider = document.querySelector('[data-testimonial-slider]');
    if (!slider) return;

    const track = slider.querySelector('[data-testimonial-track]');
    const slides = slider.querySelectorAll('[data-testimonial-slide]');
    const dots = slider.querySelectorAll('[data-testimonial-dot]');
    let current = 0;

    const goTo = (index) => {
      current = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    if (!prefersReducedMotion() && slides.length > 1) {
      setInterval(() => goTo((current + 1) % slides.length), 6000);
    }
  }

  /* ── Project Filter ── */
  function initProjectFilter() {
    const container = document.querySelector('[data-project-filter]');
    if (!container) return;

    const tabs = container.querySelectorAll('[data-filter-tab]');
    const cards = container.querySelectorAll('[data-project-card]');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filterTab;
        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
        cards.forEach((card) => {
          const match = filter === 'all' || card.dataset.industry === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ── Count Up ── */
  function initCountUp() {
    if (prefersReducedMotion()) return;

    const counters = document.querySelectorAll('[data-count-up]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.countUp);
          const suffix = el.dataset.countSuffix || '';
          const duration = 1500;
          const start = performance.now();

          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ── Energy Assessment Form ── */
  function initAssessmentForm() {
    const form = document.querySelector('[data-assessment-form]');
    if (!form) return;

    const successEl = document.querySelector('[data-form-success]');
    const errorEl = document.querySelector('[data-form-error]');

    const validate = (data) => {
      const errors = {};
      if (!data.fullName.trim()) errors.fullName = 'Full name is required';
      if (!data.companyName.trim()) errors.companyName = 'Company name is required';
      if (!data.email.trim()) {
        errors.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Enter a valid email address';
      }
      if (!data.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^(\+234|0)[789]\d{9}$/.test(data.phone.replace(/[\s-]/g, ''))) {
        errors.phone = 'Enter a valid Nigerian phone number';
      }
      if (!data.industry) errors.industry = 'Select an industry';
      if (!data.facilityType) errors.facilityType = 'Select a facility type';
      if (!data.location.trim()) errors.location = 'Location is required';
      if (!data.monthlyEnergySpend.trim()) errors.monthlyEnergySpend = 'Monthly energy spend is required';
      if (!data.currentPowerSources.trim()) errors.currentPowerSources = 'Current power sources are required';
      return errors;
    };

    const showErrors = (errors) => {
      form.querySelectorAll('.form-error').forEach((el) => el.remove());
      form.querySelectorAll('.is-error').forEach((el) => el.classList.remove('is-error'));

      Object.entries(errors).forEach(([field, msg]) => {
        const input = form.querySelector(`[name="${field}"]`);
        if (!input) return;
        input.classList.add('is-error');
        const err = document.createElement('span');
        err.className = 'form-error';
        err.textContent = msg;
        input.parentElement.appendChild(err);
      });
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errorEl?.classList.add('sr-only');

      const honeypot = form.querySelector('[name="company_website"]');
      if (honeypot?.value) return;

      const data = {
        fullName: form.fullName?.value || '',
        companyName: form.companyName?.value || '',
        email: form.email?.value || '',
        phone: form.phone?.value || '',
        industry: form.industry?.value || '',
        facilityType: form.facilityType?.value || '',
        location: form.location?.value || '',
        monthlyEnergySpend: form.monthlyEnergySpend?.value || '',
        currentPowerSources: form.currentPowerSources?.value || '',
        message: form.message?.value || '',
      };

      const errors = validate(data);
      if (Object.keys(errors).length) {
        showErrors(errors);
        return;
      }

      const body = [
        'Certified Energy Assessment Request',
        '',
        `Full Name: ${data.fullName}`,
        `Company: ${data.companyName}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        `Industry: ${data.industry}`,
        `Facility Type: ${data.facilityType}`,
        `Location: ${data.location}`,
        `Monthly Energy Spend: ${data.monthlyEnergySpend}`,
        `Current Power Sources: ${data.currentPowerSources}`,
        '',
        'Message:',
        data.message || 'N/A',
      ].join('\n');

      const mailto = `mailto:sales@upnepang.com?subject=${encodeURIComponent('Certified Energy Assessment Request')}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;

      form.style.display = 'none';
      successEl?.classList.remove('sr-only');
    });
  }

  /* ── Active Nav ── */
  function initActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;

    document.querySelectorAll('[data-nav-link]').forEach((link) => {
      const href = link.getAttribute('href');
      const isHome = page === 'home' && (href === 'index.html' || href === '/');
      const isActive = !isHome && href === `${page}.html`;
      if (isHome || isActive) link.classList.add('is-active');
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScrollReveal();
    initStickyCTAs();
    initExitIntent();
    initAccordions();
    initTestimonialSlider();
    initProjectFilter();
    initCountUp();
    initAssessmentForm();
    initActiveNav();
  });
})();
