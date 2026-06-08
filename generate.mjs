/**
 * UPNEPA NG Static Site Generator
 * Reads content from parent Next.js project (read-only) and generates HTML pages.
 * Run once: node generate.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = __dirname;
const CONTENT = path.join(ROOT, 'content');

const siteConfig = JSON.parse(fs.readFileSync(path.join(CONTENT, 'company/site-config.json'), 'utf8'));
const navigation = JSON.parse(fs.readFileSync(path.join(CONTENT, 'company/navigation.json'), 'utf8'));
const seoPages = JSON.parse(fs.readFileSync(path.join(CONTENT, 'seo/pages.json'), 'utf8'));

const homepage = JSON.parse(fs.readFileSync(path.join(CONTENT, 'homepage/index.json'), 'utf8'));
const about = JSON.parse(fs.readFileSync(path.join(CONTENT, 'about/index.json'), 'utf8'));
const contact = JSON.parse(fs.readFileSync(path.join(CONTENT, 'contact/index.json'), 'utf8'));
const solutions = JSON.parse(fs.readFileSync(path.join(CONTENT, 'solutions/index.json'), 'utf8'));
const industries = JSON.parse(fs.readFileSync(path.join(CONTENT, 'industries/index.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(CONTENT, 'projects/index.json'), 'utf8'));
const technology = JSON.parse(fs.readFileSync(path.join(CONTENT, 'technology/index.json'), 'utf8'));
const privacy = JSON.parse(fs.readFileSync(path.join(CONTENT, 'legal/privacy-policy.json'), 'utf8'));
const terms = JSON.parse(fs.readFileSync(path.join(CONTENT, 'legal/terms-of-service.json'), 'utf8'));

const ROUTE_MAP = {
  '/': 'index.html',
  '/solutions': 'solutions.html',
  '/industries': 'industries.html',
  '/projects': 'projects.html',
  '/technology': 'technology.html',
  '/about': 'about.html',
  '/contact': 'contact.html',
  '/privacy-policy': 'privacy-policy.html',
  '/terms-of-service': 'terms-of-service.html',
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toHref(href) {
  if (!href) return '#';
  if (/^(mailto:|tel:|https?:|#)/.test(href)) return href;
  const qIdx = href.indexOf('?');
  const hashIdx = href.indexOf('#');
  let base = href;
  let query = '';
  let hash = '';
  if (qIdx >= 0) {
    base = href.slice(0, qIdx);
    const rest = href.slice(qIdx + 1);
    const hInQ = rest.indexOf('#');
    if (hInQ >= 0) {
      query = rest.slice(0, hInQ);
      hash = rest.slice(hInQ);
    } else {
      query = rest;
    }
  } else if (hashIdx >= 0) {
    base = href.slice(0, hashIdx);
    hash = href.slice(hashIdx);
  }
  const file = ROUTE_MAP[base] || base;
  return query ? `${file}?${query}${hash}` : `${file}${hash}`;
}

function sanitizeGradient(g) {
  if (!g) return 'linear-gradient(135deg, #111111 0%, #ec3237 50%, #f3ad31 100%)';
  return g
    .replace(/rgba?\(\s*80\s*,\s*200\s*,\s*120[^)]*\)/gi, 'rgba(243,173,49,0.25)')
    .replace(/rgba?\(\s*46\s*,\s*120\s*,\s*70[^)]*\)/gi, 'rgba(243,173,49,0.35)')
    .replace(/rgba?\(\s*15\s*,\s*98\s*,\s*254[^)]*\)/gi, 'rgba(236,50,55,0.25)')
    .replace(/#2e7846/gi, '#b87e20')
    .replace(/#399457/gi, '#f3ad31')
    .replace(/#0f62fe/gi, '#ec3237')
    .replace(/#50c878/gi, '#f3ad31');
}

function btn(label, href, variant = 'primary', onDark = false, extra = '') {
  const cls = [
    'btn',
    variant === 'primary' ? 'btn--primary' : '',
    variant === 'ghost' && onDark ? 'btn--ghost-on-dark' : '',
    variant === 'outline' ? 'btn--outline' : '',
    variant === 'tertiary' ? 'btn--tertiary' : '',
    'btn--lg',
    extra,
  ].filter(Boolean).join(' ');
  return `<a href="${esc(toHref(href))}" class="${cls}">${esc(label)}</a>`;
}

function sectionHeading(eyebrow, title, body = '', center = false) {
  return `<div class="section-heading${center ? ' section-heading--center' : ''} reveal">
    ${eyebrow ? `<p class="section-heading__eyebrow">${esc(eyebrow)}</p>` : ''}
    <h2 class="section-heading__title">${esc(title)}</h2>
    ${body ? `<p class="section-heading__body">${esc(body)}</p>` : ''}
  </div>`;
}

function ctaSection(content) {
  return `<section class="section section--primary cta-section" aria-label="Call to action">
    <div class="container">
      <div class="cta-section__inner reveal">
        <h2 class="cta-section__headline">${esc(content.headline)}</h2>
        <p class="cta-section__body">${esc(content.body)}</p>
        <div class="cta-section__actions">
          ${btn(content.cta.label, content.cta.href, content.cta.variant || 'ghost', true)}
          ${content.secondaryCta ? btn(content.secondaryCta.label, content.secondaryCta.href, 'ghost', true) : ''}
        </div>
      </div>
    </div>
  </section>`;
}

function trustBar() {
  const items = ['REAN Certified', 'IFMA Member', 'Fully Insured Projects', 'Enterprise Solutions', 'Resilience Energy Architects', 'Professional Indemnity Covered'];
  const track = items.map((l) => `<span class="trust-bar__tag">${esc(l)}</span>`).join('');
  return `<section class="trust-bar" aria-label="Enterprise credibility">
    <div class="trust-bar__marquee">
      <div class="trust-bar__track">${track}</div>
      <div class="trust-bar__track" aria-hidden="true">${track}</div>
    </div>
  </section>`;
}

function breadcrumbs(items) {
  const lis = items.map((item, i) => {
    const isLast = i === items.length - 1;
    if (isLast) return `<li class="breadcrumbs__item" aria-current="page">${esc(item.label)}</li>`;
    return `<li class="breadcrumbs__item"><a href="${esc(toHref(item.href))}">${esc(item.label)}</a><span class="breadcrumbs__sep" aria-hidden="true">/</span></li>`;
  }).join('');
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><div class="container"><ol class="breadcrumbs__list">${lis}</ol></div></nav>`;
}

function homeHero(content) {
  const tags = ['REAN Certified', 'IFMA Corporate Member', 'Fully Insured Projects', '4R Resilience Framework™'];
  return `<section class="home-hero" aria-labelledby="hero-heading">
    <div class="home-hero__scene" aria-hidden="true">
      <div class="home-hero__grid"></div>
      <div class="home-hero__glow-red"></div>
      <div class="home-hero__glow-amber"></div>
      <div class="home-hero__vignette"></div>
    </div>
    <div class="container">
      <div class="home-hero__layout">
        <p class="home-hero__eyebrow animate-fade-in">${esc(content.eyebrow)}</p>
        <h1 id="hero-heading" class="home-hero__headline animate-fade-in animate-fade-in-delay-1">${esc(content.headline)}</h1>
        <div class="home-hero__ctas animate-fade-in animate-fade-in-delay-2">
          ${btn(content.primaryCta.label, content.primaryCta.href, 'primary')}
          ${content.secondaryCta ? btn(content.secondaryCta.label, content.secondaryCta.href, 'outline', true) : ''}
        </div>
        <div class="home-hero__visual animate-fade-in animate-fade-in-delay-3">
          <img src="office.png" alt="UPNEPA NG office and renewable energy operations" loading="eager" width="800" height="600">
        </div>
        <ul class="home-hero__trust-tags animate-fade-in animate-fade-in-delay-4" aria-label="Credentials">
          ${tags.map((t) => `<li><span class="home-hero__trust-tag">✓ ${esc(t)}</span></li>`).join('')}
        </ul>
        <div class="home-hero__body animate-fade-in animate-fade-in-delay-4">
          <p>${esc(content.subheadline)}</p>
          ${content.narrative ? `<p>${esc(content.narrative)}</p>` : ''}
          ${content.supporting ? `<p>${esc(content.supporting)}</p>` : ''}
        </div>
      </div>
    </div>
  </section>`;
}

function pageHero(content, headingId = 'page-hero-heading') {
  const bg = sanitizeGradient(content.background?.gradient);
  return `<section class="page-hero" aria-labelledby="${headingId}">
    <div class="page-hero__bg" style="background:${esc(bg)}" role="img" aria-label="${esc(content.background?.alt || '')}"></div>
    <div class="page-hero__grid-pattern" aria-hidden="true"></div>
    <div class="page-hero__overlay" aria-hidden="true"></div>
    <div class="container">
      <div class="page-hero__content">
        ${content.eyebrow ? `<p class="page-hero__eyebrow animate-fade-in">${esc(content.eyebrow)}</p>` : ''}
        <h1 id="${headingId}" class="page-hero__headline animate-fade-in animate-fade-in-delay-1">${esc(content.headline)}</h1>
        <p class="page-hero__subheadline animate-fade-in animate-fade-in-delay-2">${esc(content.subheadline)}</p>
        ${content.supporting ? `<p class="page-hero__supporting animate-fade-in animate-fade-in-delay-2">${esc(content.supporting)}</p>` : ''}
        <div class="page-hero__ctas animate-fade-in animate-fade-in-delay-3">
          ${btn(content.primaryCta.label, content.primaryCta.href, 'primary')}
          ${content.secondaryCta ? btn(content.secondaryCta.label, content.secondaryCta.href, 'ghost', true) : ''}
        </div>
      </div>
    </div>
  </section>`;
}

function frameworkSection(content, variant = 'light') {
  return `<section class="section section--${variant}" aria-label="${esc(content.title)}">
    <div class="container">
      ${sectionHeading(content.eyebrow, content.title)}
      <div class="framework reveal">
        ${content.items.map((item) => `<article class="framework__item">
          <div class="framework__pillar">${esc(item.pillar)}</div>
          <h3 class="framework__title">${esc(item.title)}</h3>
          ${item.subtitle ? `<p class="framework__subtitle">${esc(item.subtitle)}</p>` : ''}
          <p class="framework__desc">${esc(item.description)}</p>
          ${item.closing ? `<p class="framework__closing">${esc(item.closing)}</p>` : ''}
        </article>`).join('')}
      </div>
    </div>
  </section>`;
}

function certificationsSection(content, variant = 'white') {
  return `<section class="section section--${variant}" aria-label="Certifications">
    <div class="container">
      ${sectionHeading(content.eyebrow, content.title, content.description || '', true)}
      <div class="grid grid--3 reveal">
        ${content.items.map((item) => `<article class="card">
          <h3 class="card__title">${esc(item.name)}</h3>
          <p class="card__desc">${esc(item.description)}</p>
        </article>`).join('')}
      </div>
    </div>
  </section>`;
}

function eventsSection(content) {
  return `<section class="section section--light" aria-label="Events">
    <div class="container">
      ${sectionHeading(content.eyebrow, content.title)}
      <div class="grid grid--3 reveal">
        ${content.items.map((e) => `<article class="event-card">
          <div class="event-card__image" role="img" aria-label="${esc(e.imageAlt)}"></div>
          <div class="event-card__body">
            <p class="event-card__type">${esc(e.type)}</p>
            <h3 class="event-card__title">${esc(e.name)}</h3>
            <p class="event-card__meta">${esc(e.location)} · ${esc(e.date)}</p>
            <p class="event-card__desc">${esc(e.description)}</p>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>`;
}

function testimonialsSection(content) {
  const slides = content.items.map((t, i) => `<div class="testimonials__slide" data-testimonial-slide>
    <blockquote class="testimonials__quote">"${esc(t.quote)}"</blockquote>
    <p class="testimonials__author">${esc(t.clientName)}</p>
    <p class="testimonials__org">${esc(t.organization)} · ${esc(t.industry)} · ${esc(t.projectType)}</p>
  </div>`).join('');
  const dots = content.items.map((_, i) => `<button type="button" class="testimonials__dot${i === 0 ? ' is-active' : ''}" data-testimonial-dot aria-label="Testimonial ${i + 1}"></button>`).join('');
  return `<section class="section section--white" aria-label="Testimonials">
    <div class="container">
      ${sectionHeading(content.eyebrow, content.title, '', true)}
      <div class="testimonials reveal" data-testimonial-slider>
        <div class="testimonials__track" data-testimonial-track style="overflow:hidden">${slides}</div>
        <div class="testimonials__nav">${dots}</div>
      </div>
    </div>
  </section>`;
}

function siteHeader() {
  const nav = navigation.main.map((item) =>
    `<li><a href="${esc(toHref(item.href))}" class="site-header__nav-link" data-nav-link>${esc(item.label)}</a></li>`
  ).join('');
  const mobileNav = navigation.main.map((item) =>
    `<li><a href="${esc(toHref(item.href))}" class="site-header__mobile-link" data-nav-link>${esc(item.label)}</a></li>`
  ).join('');
  return `<header class="site-header">
    <div class="site-header__topbar">
      <div class="site-header__topbar-inner">
        <a href="${esc(siteConfig.phone)}" class="site-header__topbar-link">📞 ${esc(siteConfig.phoneDisplay)}</a>
        <a href="mailto:${esc(siteConfig.email)}" class="site-header__topbar-link">${esc(siteConfig.email)}</a>
      </div>
    </div>
    <div class="site-header__main">
      <a href="index.html" class="site-header__logo" aria-label="${esc(siteConfig.name)} home">
        <img src="logo.png" alt="UPNEPA NG Logo" width="400" height="120" loading="eager">
      </a>
      <nav class="site-header__nav" aria-label="Main navigation">
        <ul class="site-header__nav-list">${nav}</ul>
      </nav>
      <div class="site-header__actions">
        <a href="contact.html" class="btn btn--primary btn--lg site-header__cta-desktop">Request Assessment</a>
        <button type="button" class="site-header__menu-toggle" data-mobile-menu-toggle aria-expanded="false" aria-controls="mobile-navigation" aria-label="Open menu">☰</button>
      </div>
    </div>
    <button type="button" class="site-header__backdrop" data-mobile-backdrop aria-label="Close navigation menu"></button>
    <div class="site-header__mobile-nav" id="mobile-navigation" data-mobile-nav>
      <nav aria-label="Mobile navigation">
        <ul class="site-header__mobile-list">${mobileNav}</ul>
      </nav>
      <a href="contact.html" class="btn btn--primary btn--lg site-header__mobile-cta">Request Assessment</a>
    </div>
  </header>`;
}

function siteFooter() {
  const quickLinks = [{ label: 'Home', href: '/' }, ...navigation.main];
  const ql = quickLinks.map((i) => `<li><a href="${esc(toHref(i.href))}">${esc(i.label)}</a></li>`).join('');
  const legal = navigation.legal.map((i) => `<li><a href="${esc(toHref(i.href))}">${esc(i.label)}</a></li>`).join('');
  const social = Object.entries(siteConfig.social).map(([k, url]) =>
    `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(k)}">${esc(k.slice(0, 2).toUpperCase())}</a>`
  ).join('');
  return `<footer class="site-footer">
    <div class="container">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <a href="index.html" class="site-footer__logo">${esc(siteConfig.name)}</a>
          <p class="site-footer__tagline">${esc(siteConfig.tagline)}</p>
          <p class="site-footer__descriptor">${esc(siteConfig.descriptor)}</p>
          <div class="site-footer__contact">
            <a href="mailto:${esc(siteConfig.email)}">${esc(siteConfig.email)}</a>
            <a href="mailto:${esc(siteConfig.salesEmail)}">${esc(siteConfig.salesEmail)}</a>
            <a href="${esc(siteConfig.phone)}">${esc(siteConfig.phoneDisplay)}</a>
          </div>
          <div class="site-footer__social">${social}</div>
        </div>
        <nav aria-label="Quick links">
          <h2 class="site-footer__column-title">Quick Links</h2>
          <ul class="site-footer__link-list">${ql}</ul>
        </nav>
        <nav aria-label="Legal navigation">
          <h2 class="site-footer__column-title">Legal</h2>
          <ul class="site-footer__link-list">${legal}</ul>
        </nav>
      </div>
      <div class="site-footer__bottom">
        <p class="site-footer__disclaimer">${esc(siteConfig.disclaimer)}</p>
        <p class="site-footer__copyright">© ${new Date().getFullYear()} ${esc(siteConfig.name)}. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
}

function stickyCTAs() {
  return `<div class="sticky-mobile-cta" data-sticky-mobile-cta role="region" aria-label="Quick actions">
    <a href="contact.html?source=sticky-cta#assessment-form" class="btn btn--primary">Request Assessment</a>
    <a href="tel:+2347076985799" class="btn btn--ghost-on-dark">Get Power Now</a>
  </div>
  <div class="sticky-desktop-cta" data-sticky-desktop-cta>
    <a href="contact.html?source=sticky-cta#assessment-form" class="btn btn--primary btn--lg">Request Assessment</a>
  </div>`;
}

function exitIntentModal() {
  return `<div class="modal-overlay" data-exit-intent role="dialog" aria-modal="true" aria-labelledby="exit-intent-title">
    <div class="modal" style="position:relative">
      <button type="button" class="modal__close" data-exit-close aria-label="Close">×</button>
      <div class="modal__header"><h2 id="exit-intent-title" class="modal__title">Before You Leave...</h2></div>
      <div class="modal__body"><p>Would you like a Certified Energy Assessment from UPNEPA NG Resilience Energy Architects?</p></div>
      <div class="modal__footer">
        <button type="button" class="btn btn--primary" data-exit-accept>Yes, Request Assessment</button>
        <button type="button" class="btn btn--outline" data-exit-dismiss>Maybe Later</button>
      </div>
    </div>
  </div>`;
}

function pageShell({ title, description, keywords, canonical, page, jsonLd, body }) {
  const kw = (keywords || []).join(', ');
  const ogUrl = `${siteConfig.url}${canonical === '/' ? '' : canonical}`;
  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="${esc(kw)}">
  <link rel="canonical" href="${esc(ogUrl)}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(ogUrl)}">
  <meta property="og:site_name" content="${esc(siteConfig.name)}">
  <meta property="og:locale" content="en_NG">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="theme-color" content="#EC3237">
  <link rel="icon" href="icon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            upnepaRed: '#EC3237',
            upnepaGold: '#F3AD31',
            upnepaGoldLight: '#FFD54A',
            upnepaBlack: '#111111',
            upnepaGray: '#6F6F6F'
          }
        }
      }
    };
  </script>
  <link rel="stylesheet" href="styles.css">
  ${jsonLd ? jsonLd.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ') : ''}
</head>
<body data-page="${esc(page)}">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ${siteHeader()}
  <main id="main-content">
    ${body}
  </main>
  ${siteFooter()}
  ${stickyCTAs()}
  ${exitIntentModal()}
  <script src="script.js" defer></script>
</body>
</html>`;
}

/* ── Page Builders ── */

function buildHomePage() {
  const seo = seoPages['/'];
  const body = `
    ${homeHero(homepage.hero)}
    ${trustBar()}
    ${frameworkSection(homepage.challenges)}
    <section class="section section--white" id="industries" aria-label="Industries">
      <div class="container">
        ${sectionHeading(homepage.industries.eyebrow, homepage.industries.title)}
        <div class="grid grid--3 reveal">
          ${homepage.industries.items.map((i) => `<article class="card">
            <h3 class="card__title">${esc(i.name)}</h3>
            <p class="card__desc">${esc(i.description)}</p>
            <p class="card__stat">${esc(i.stat)}</p>
          </article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--light" id="projects" aria-label="Projects">
      <div class="container">
        ${sectionHeading(homepage.projects.eyebrow, homepage.projects.title)}
        <div class="grid grid--3 reveal">
          ${homepage.projects.items.map((p) => `<article class="project-card">
            <div class="project-card__image" role="img" aria-label="${esc(p.imageAlt)}"><span class="project-card__badge">${esc(p.clientType)}</span></div>
            <div class="project-card__body">
              <h3 class="project-card__title">${esc(p.title)}</h3>
              <p class="project-card__meta">${esc(p.capacity)}</p>
              <p class="project-card__result">${esc(p.result)}</p>
            </div>
          </article>`).join('')}
        </div>
        <p style="margin-top:var(--space-6)" class="reveal">${btn(homepage.projects.cta.label, homepage.projects.cta.href, 'tertiary')}</p>
      </div>
    </section>
    <section class="section section--white" id="technology" aria-label="Technology">
      <div class="container">
        ${sectionHeading(homepage.technology.eyebrow, homepage.technology.title, homepage.technology.description)}
        <div class="grid grid--4 reveal">
          ${homepage.technology.items.map((t) => `<article class="card">
            <h3 class="card__title">${esc(t.title)}</h3>
            <p class="card__desc">${esc(t.description)}</p>
          </article>`).join('')}
        </div>
        <p style="margin-top:var(--space-6)" class="reveal">${btn(homepage.technology.cta.label, homepage.technology.cta.href, 'tertiary')}</p>
      </div>
    </section>
    ${certificationsSection(homepage.certifications, 'light')}
    ${eventsSection(homepage.eventsPreview)}
    ${testimonialsSection(homepage.testimonials)}
    ${ctaSection(homepage.finalCta)}
  `;
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phoneDisplay,
    slogan: siteConfig.tagline,
  }];
  return pageShell({ title: seo.title, description: seo.description, keywords: seo.keywords, canonical: '/', page: 'home', jsonLd, body });
}

function buildAboutPage() {
  const seo = seoPages['/about'];
  const body = `
    ${pageHero(about.hero, 'about-hero-heading')}
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'About' }])}
    <section class="section section--white" aria-label="Our Story">
      <div class="container">
        ${sectionHeading(about.story.eyebrow, about.story.title)}
        <div class="legal-prose reveal">
          ${about.story.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--light" aria-label="Mission and Vision">
      <div class="container">
        <div class="grid grid--2 reveal">
          <article class="card"><h3 class="card__title">${esc(about.missionVision.mission.title)}</h3><p class="card__desc">${esc(about.missionVision.mission.description)}</p></article>
          <article class="card"><h3 class="card__title">${esc(about.missionVision.vision.title)}</h3><p class="card__desc">${esc(about.missionVision.vision.description)}</p></article>
        </div>
      </div>
    </section>
    <section class="section section--white" aria-label="Purpose">
      <div class="container">
        ${sectionHeading(about.purpose.eyebrow, about.purpose.title, about.purpose.body)}
        <ul class="feature-list reveal">${about.purpose.challenges.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      </div>
    </section>
    ${frameworkSection(about.framework, 'light')}
    <section class="section section--white" aria-label="Differentiators">
      <div class="container">
        ${sectionHeading(about.differentiators.eyebrow, about.differentiators.title)}
        <div class="grid grid--4 reveal">
          ${about.differentiators.items.map((d) => `<article class="card"><h3 class="card__title">${esc(d.title)}</h3><p class="card__desc">${esc(d.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    ${certificationsSection(about.certifications)}
    <section class="section section--light" aria-label="Insurance">
      <div class="container">
        ${sectionHeading(about.insurance.eyebrow, about.insurance.title, about.insurance.body)}
        <p class="reveal" style="font-weight:600;color:var(--brand-gold);margin-bottom:var(--space-6)">${esc(about.insurance.tagline)}</p>
        <div class="grid grid--3 reveal">
          ${about.insurance.items.map((i) => `<article class="card"><h3 class="card__title">${esc(i.name)}</h3><p class="card__desc">${esc(i.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--white" aria-label="People">
      <div class="container">
        ${sectionHeading(about.people.eyebrow, about.people.title, about.people.body)}
        <div class="grid grid--2 reveal">
          ${about.people.items.map((p) => `<article class="card"><h3 class="card__title">${esc(p.title)}</h3><p class="card__desc">${esc(p.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    ${eventsSection(about.events)}
    <section class="section section--white" aria-label="Partners">
      <div class="container">
        ${sectionHeading(about.partners.eyebrow, about.partners.title)}
        <div class="grid grid--2 reveal">
          ${about.partners.items.map((p) => `<article class="card"><h3 class="card__title">${esc(p.name)}</h3><p class="card__subtitle">${esc(p.category)}</p><p class="card__desc">${esc(p.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--light" aria-label="Values">
      <div class="container">
        ${sectionHeading(about.values.eyebrow, about.values.title)}
        <div class="grid grid--3 reveal">
          ${about.values.items.map((v) => `<article class="card"><h3 class="card__title">${esc(v.title)}</h3><p class="card__desc">${esc(v.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--dark" aria-label="Trust">
      <div class="container">
        ${sectionHeading(about.trust.eyebrow, about.trust.title)}
        <div class="stat-grid reveal" style="margin-bottom:var(--space-8)">
          ${about.trust.counters.map((c) => `<div class="stat">
            <div class="stat__value" data-count-up="${c.value}" data-count-suffix="${esc(c.suffix || '')}">0</div>
            <div class="stat__label">${esc(c.label)}</div>
          </div>`).join('')}
        </div>
        <div class="trust-highlights reveal">
          ${about.trust.highlights.map((h) => `<article class="trust-highlight card--dark"><h3 class="trust-highlight__title">${esc(h.title)}</h3><p class="trust-highlight__desc">${esc(h.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    ${ctaSection(about.finalCta)}
  `;
  return pageShell({ title: seo.title, description: seo.description, keywords: seo.keywords, canonical: '/about', page: 'about', body });
}

function buildContactPage() {
  const seo = seoPages['/contact'];
  const map = contact.map.config;
  const mapSrc = `https://maps.google.com/maps?q=${map.latitude},${map.longitude}&z=${map.zoom}&output=embed`;
  const body = `
    ${pageHero(contact.hero, 'contact-hero-heading')}
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Contact' }])}
    <section class="section section--white" aria-label="Contact options">
      <div class="container">
        ${sectionHeading(contact.contactOptions.eyebrow, contact.contactOptions.title, '', true)}
        <div class="grid grid--2 reveal">
          ${contact.contactOptions.items.map((o) => `<article class="contact-option">
            <h3 class="contact-option__title">${esc(o.title)}</h3>
            <p class="contact-option__value">${esc(o.value)}</p>
            <p class="contact-option__desc">${esc(o.description)}</p>
            ${btn(o.buttonLabel, o.href, 'primary', false, '')}
          </article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--light form-section" id="assessment-form" aria-label="Assessment form">
      <div class="container">
        <div class="reveal">
          <h2 class="section-heading__title">${esc(contact.form.title)}</h2>
          <p class="section-heading__body" style="margin-bottom:var(--space-6)">${esc(contact.form.description)}</p>
          <div class="form-success sr-only" data-form-success>
            <h3 class="form-success__title">${esc(contact.form.successTitle)}</h3>
            <p class="form-success__msg">${esc(contact.form.successMessage)}</p>
          </div>
          <form data-assessment-form novalidate>
            <div class="form-grid form-grid--2">
              <div class="form-group"><label for="fullName">Full Name *</label><input type="text" id="fullName" name="fullName" required></div>
              <div class="form-group"><label for="companyName">Company Name *</label><input type="text" id="companyName" name="companyName" required></div>
              <div class="form-group"><label for="email">Email *</label><input type="email" id="email" name="email" required></div>
              <div class="form-group"><label for="phone">Phone *</label><input type="tel" id="phone" name="phone" required placeholder="07076985799"></div>
              <div class="form-group"><label for="industry">Industry *</label><select id="industry" name="industry" required><option value="">Select industry</option>${contact.form.industryOptions.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></div>
              <div class="form-group"><label for="facilityType">Facility Type *</label><select id="facilityType" name="facilityType" required><option value="">Select facility type</option>${contact.form.facilityTypeOptions.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></div>
              <div class="form-group"><label for="location">Location *</label><input type="text" id="location" name="location" required></div>
              <div class="form-group"><label for="monthlyEnergySpend">Monthly Energy Spend *</label><input type="text" id="monthlyEnergySpend" name="monthlyEnergySpend" required></div>
              <div class="form-group" style="grid-column:1/-1"><label for="currentPowerSources">Current Power Sources *</label><input type="text" id="currentPowerSources" name="currentPowerSources" required></div>
              <div class="form-group" style="grid-column:1/-1"><label for="message">Message (optional)</label><textarea id="message" name="message" rows="4"></textarea></div>
            </div>
            <div class="form-honeypot"><label>Website</label><input type="text" name="company_website" tabindex="-1" autocomplete="off"></div>
            <button type="submit" class="btn btn--primary btn--lg" style="margin-top:var(--space-5)">${esc(contact.form.submitLabel)}</button>
          </form>
        </div>
      </div>
    </section>
    <section class="section section--white" aria-label="Why choose">
      <div class="container">
        ${sectionHeading(contact.whyChoose.eyebrow, contact.whyChoose.title, '', true)}
        <div class="trust-highlights reveal">
          ${contact.whyChoose.items.map((i) => `<article class="trust-highlight"><h3 class="trust-highlight__title">${esc(i.title)}</h3><p class="trust-highlight__desc">${esc(i.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--light" aria-label="Office">
      <div class="container">
        ${sectionHeading(contact.office.eyebrow, contact.office.title)}
        <div class="reveal" style="max-width:480px">
          <p><strong>${esc(contact.office.companyName)}</strong></p>
          <p>${esc(contact.office.businessUnit)}</p>
          <p>📞 <a href="tel:+2347076985799">${esc(contact.office.phone)}</a></p>
          <p>✉ <a href="mailto:${esc(contact.office.email)}">${esc(contact.office.email)}</a></p>
          <p>✉ <a href="mailto:${esc(contact.office.salesEmail)}">${esc(contact.office.salesEmail)}</a></p>
          <ul style="margin-top:var(--space-4);padding-left:var(--space-5)">
            ${contact.office.hours.map((h) => `<li>${esc(h.label)}: ${esc(h.hours)}</li>`).join('')}
          </ul>
        </div>
      </div>
    </section>
    <section class="section section--white" aria-label="Map">
      <div class="container">
        ${sectionHeading(contact.map.eyebrow, contact.map.title)}
        <iframe class="map-embed reveal" src="${esc(mapSrc)}" allowfullscreen loading="lazy" title="UPNEPA NG office location on Google Maps" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </section>
    ${certificationsSection(contact.certifications)}
    <section class="section section--light" aria-label="FAQ">
      <div class="container">
        ${sectionHeading(contact.faq.eyebrow, contact.faq.title, '', true)}
        <div class="accordion reveal" data-accordion>
          ${contact.faq.items.map((f) => `<div class="accordion__item" data-accordion-item>
            <button type="button" class="accordion__trigger" data-accordion-trigger aria-expanded="false">${esc(f.question)}<span class="accordion__icon" aria-hidden="true">▼</span></button>
            <div class="accordion__panel">${esc(f.answer)}</div>
          </div>`).join('')}
        </div>
      </div>
    </section>
    ${ctaSection(contact.finalCta)}
  `;
  return pageShell({ title: seo.title, description: seo.description, keywords: seo.keywords, canonical: '/contact', page: 'contact', body });
}

function buildSolutionsPage() {
  const seo = seoPages['/solutions'];
  const body = `
    ${pageHero(solutions.hero, 'solutions-hero-heading')}
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Solutions' }])}
    <section class="section section--white" aria-label="Overview">
      <div class="container">
        ${sectionHeading(solutions.overview.eyebrow, solutions.overview.title, solutions.overview.intro)}
        <div class="grid grid--2 reveal">
          ${solutions.overview.items.map((i) => `<article class="card" id="${esc(i.anchor)}"><h3 class="card__title">${esc(i.title)}</h3><p class="card__desc">${esc(i.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--light" aria-label="Solution details">
      <div class="container">
        ${solutions.solutions.map((s) => `<article class="detail-section reveal" id="${esc(s.id)}">
          <h2 class="detail-section__title">${esc(s.title)}</h2>
          <p class="detail-section__headline">${esc(s.headline)}</p>
          <p class="detail-section__desc">${esc(s.description)}</p>
          <ul class="feature-list">${(s.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          ${s.outcomes ? `<p style="margin-top:var(--space-4);font-weight:600">Outcomes:</p><ul class="feature-list">${s.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
        </article>`).join('')}
      </div>
    </section>
    ${frameworkSection(solutions.framework, 'white')}
    <section class="section section--light" aria-label="Industries">
      <div class="container">
        ${sectionHeading(solutions.industries.eyebrow, solutions.industries.title, solutions.industries.body || '')}
        <div class="grid grid--3 reveal">
          ${solutions.industries.items.map((i) => `<article class="card"><h3 class="card__title">${esc(i.name)}</h3><p class="card__desc">${esc(i.challenge || i.description || '')}</p></article>`).join('')}
        </div>
        ${solutions.industries.cta ? `<p style="margin-top:var(--space-6)" class="reveal">${btn(solutions.industries.cta.label, solutions.industries.cta.href, 'tertiary')}</p>` : ''}
      </div>
    </section>
    <section class="section section--white" aria-label="Why enterprises">
      <div class="container">
        ${sectionHeading(solutions.whyEnterprises.eyebrow, solutions.whyEnterprises.title, solutions.whyEnterprises.body)}
        <div class="grid grid--2 reveal">
          ${solutions.whyEnterprises.items.map((i) => `<article class="card"><p class="card__desc">${esc(i.text || i.title || '')}</p></article>`).join('')}
        </div>
      </div>
    </section>
    ${certificationsSection(solutions.certifications, 'light')}
    <section class="section section--white" aria-label="Projects">
      <div class="container">
        ${sectionHeading(solutions.projects.eyebrow, solutions.projects.title)}
        <div class="grid grid--3 reveal">
          ${solutions.projects.items.map((p) => `<article class="project-card">
            <div class="project-card__image" role="img" aria-label="${esc(p.imageAlt || p.title)}"><span class="project-card__badge">${esc(p.clientType || p.industry || '')}</span></div>
            <div class="project-card__body"><h3 class="project-card__title">${esc(p.title)}</h3><p class="project-card__result">${esc(p.result || p.description || '')}</p></div>
          </article>`).join('')}
        </div>
        ${solutions.projects.cta ? `<p style="margin-top:var(--space-6)" class="reveal">${btn(solutions.projects.cta.label, solutions.projects.cta.href, 'tertiary')}</p>` : ''}
      </div>
    </section>
    ${ctaSection(solutions.finalCta)}
  `;
  return pageShell({ title: seo.title, description: seo.description, keywords: seo.keywords, canonical: '/solutions', page: 'solutions', body });
}

function buildIndustriesPage() {
  const seo = seoPages['/industries'];
  const body = `
    ${pageHero(industries.hero, 'industries-hero-heading')}
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Industries' }])}
    <section class="section section--white" aria-label="Overview">
      <div class="container">
        ${sectionHeading(industries.overview.eyebrow, industries.overview.title, industries.overview.body)}
        <div class="grid grid--3 reveal">
          ${industries.overview.items.map((i) => `<article class="card" id="${esc(i.anchor)}"><h3 class="card__title">${esc(i.name)}</h3></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--light" aria-label="Industry details">
      <div class="container">
        ${industries.industries.map((ind) => `<article class="detail-section reveal" id="${esc(ind.slug)}">
          <h2 class="detail-section__title">${esc(ind.name)}</h2>
          <p class="detail-section__headline">${esc(ind.headline)}</p>
          <p class="detail-section__desc"><strong>Challenge:</strong> ${esc(ind.challenge)}</p>
          <p style="font-weight:600;margin:var(--space-4) 0 var(--space-2)">Solutions:</p>
          <ul class="feature-list">${ind.solutions.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <p style="font-weight:600;margin:var(--space-4) 0 var(--space-2)">Outcomes:</p>
          <ul class="feature-list">${ind.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
        </article>`).join('')}
      </div>
    </section>
    ${industries.comparison ? `<section class="section section--white" aria-label="Comparison">
      <div class="container">
        ${sectionHeading(industries.comparison.eyebrow, industries.comparison.title, industries.comparison.body || '')}
        <div class="comparison-table__wrapper reveal">
          <table class="comparison-table">
            <thead><tr><th>Industry</th><th>Challenges</th><th>Solutions</th><th>Results</th></tr></thead>
            <tbody>${industries.comparison.rows.map((r) => `<tr><td>${esc(r.industry)}</td><td>${esc(r.challenges)}</td><td>${esc(r.solutions)}</td><td>${esc(r.results)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </section>` : ''}
    <section class="section section--light" aria-label="Why choose">
      <div class="container">
        ${sectionHeading(industries.whyChoose.eyebrow, industries.whyChoose.title)}
        <div class="trust-highlights reveal">
          ${industries.whyChoose.items.map((i) => `<article class="trust-highlight"><h3 class="trust-highlight__title">${esc(i.title)}</h3><p class="trust-highlight__desc">${esc(i.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--white" aria-label="Projects">
      <div class="container">
        ${sectionHeading(industries.projects.eyebrow, industries.projects.title)}
        <div class="grid grid--3 reveal">
          ${industries.projects.items.map((p) => `<article class="project-card">
            <div class="project-card__image" role="img" aria-label="${esc(p.imageAlt || p.title)}"><span class="project-card__badge">${esc(p.clientType || p.industry || '')}</span></div>
            <div class="project-card__body"><h3 class="project-card__title">${esc(p.title)}</h3><p class="project-card__result">${esc(p.result || '')}</p></div>
          </article>`).join('')}
        </div>
        ${industries.projects.cta ? `<p style="margin-top:var(--space-6)" class="reveal">${btn(industries.projects.cta.label, industries.projects.cta.href, 'tertiary')}</p>` : ''}
      </div>
    </section>
    ${ctaSection(industries.finalCta)}
  `;
  return pageShell({ title: seo.title, description: seo.description, keywords: seo.keywords, canonical: '/industries', page: 'industries', body });
}

function buildProjectsPage() {
  const seo = seoPages['/projects'];
  const filters = projects.filter?.tabs || [{ id: 'all', label: 'All' }];
  const featuredItems = projects.overview.items.filter((p) => p.featured);
  const body = `
    ${pageHero(projects.hero, 'projects-hero-heading')}
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Projects' }])}
    <section class="section section--white" aria-label="Portfolio">
      <div class="container">
        ${sectionHeading(projects.overview.eyebrow, projects.overview.title, projects.overview.body)}
        <div class="grid grid--3 reveal">
          ${projects.overview.items.map((p) => `<article class="project-card">
            <div class="project-card__image" role="img" aria-label="${esc(p.imageAlt)}"><span class="project-card__badge">${esc(p.industry)}</span></div>
            <div class="project-card__body">
              <h3 class="project-card__title">${esc(p.title)}</h3>
              <p class="project-card__meta">${esc(p.location)} · ${esc(p.capacity)}</p>
              <p class="project-card__result">${esc(p.result)}</p>
            </div>
          </article>`).join('')}
        </div>
      </div>
    </section>
    ${featuredItems.length ? `<section class="section section--light" aria-label="Featured projects">
      <div class="container">
        ${sectionHeading('Featured', 'Featured Infrastructure Projects')}
        ${featuredItems.map((f) => `<article class="detail-section reveal">
          <h2 class="detail-section__title">${esc(f.title)}</h2>
          <p class="detail-section__desc"><strong>Challenge:</strong> ${esc(f.challenge)}</p>
          <p><strong>Solution:</strong> ${esc(f.solution)}</p>
          <p><strong>Result:</strong> ${esc(f.result)}</p>
        </article>`).join('')}
      </div>
    </section>` : ''}
    <section class="section section--white" aria-label="Filter projects" data-project-filter>
      <div class="container">
        ${sectionHeading(projects.filter?.eyebrow || 'Filter', projects.filter?.title || 'Browse by Industry')}
        <div class="filter-tabs reveal">
          ${filters.map((f, i) => `<button type="button" class="filter-tab${i === 0 ? ' is-active' : ''}" data-filter-tab="${esc(f.id)}">${esc(f.label)}</button>`).join('')}
        </div>
        <div class="grid grid--3 reveal">
          ${projects.overview.items.map((p) => `<article class="project-card" data-project-card data-industry="${esc(p.industryFilter || p.industry?.toLowerCase() || 'all')}">
            <div class="project-card__image" role="img" aria-label="${esc(p.imageAlt)}"><span class="project-card__badge">${esc(p.industry)}</span></div>
            <div class="project-card__body"><h3 class="project-card__title">${esc(p.title)}</h3><p class="project-card__result">${esc(p.result)}</p></div>
          </article>`).join('')}
        </div>
      </div>
    </section>
    ${projects.gallery ? `<section class="section section--light" aria-label="Gallery">
      <div class="container">
        ${sectionHeading(projects.gallery.eyebrow, projects.gallery.title)}
        <div class="gallery-grid reveal">
          ${projects.gallery.items.map((g) => `<div class="gallery-item" style="background:${esc(sanitizeGradient(g.gradient))}" role="img" aria-label="${esc(g.imageAlt || g.title)}"><span class="gallery-item__label">${esc(g.title || g.category)}</span></div>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${projects.products ? `<section class="section section--white" aria-label="Products">
      <div class="container">
        ${sectionHeading(projects.products.eyebrow, projects.products.title)}
        <div class="grid grid--3 reveal">
          ${projects.products.items.map((p) => `<article class="card"><h3 class="card__title">${esc(p.name)}</h3><p class="card__subtitle">${esc(p.category || '')}</p><p class="card__desc">${esc(p.purpose || p.description || '')}</p></article>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${projects.beforeAfter ? `<section class="section section--light" aria-label="Before and after">
      <div class="container">
        ${sectionHeading(projects.beforeAfter.eyebrow, projects.beforeAfter.title)}
        <div class="grid grid--3 reveal">
          ${projects.beforeAfter.items.map((m) => `<article class="card">
            <h3 class="card__title">${esc(m.label)}</h3>
            <div class="before-after" style="margin-top:var(--space-3)">
              <div class="before-after__panel before-after__panel--before"><p class="before-after__label">Before</p><p class="before-after__value">${esc(m.before)}</p></div>
              <div class="before-after__panel before-after__panel--after"><p class="before-after__label">After</p><p class="before-after__value">${esc(m.after)}</p></div>
            </div>
            <p class="card__stat" style="margin-top:var(--space-3)">${esc(m.improvement)}</p>
          </article>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${projects.process ? `<section class="section section--white" aria-label="Process">
      <div class="container">
        ${sectionHeading(projects.process.eyebrow, projects.process.title, projects.process.body)}
        <div class="timeline reveal">
          ${projects.process.steps.map((s, i) => `<article class="timeline__step">
            <div class="timeline__number">Step ${i + 1}</div>
            <h3 class="timeline__title">${esc(s.title)}</h3>
            <p class="timeline__desc">${esc(s.description)}</p>
          </article>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${projects.events ? eventsSection(projects.events) : ''}
    ${projects.certifications ? certificationsSection(projects.certifications) : ''}
    ${projects.testimonials ? testimonialsSection(projects.testimonials) : ''}
    ${projects.statistics ? `<section class="section section--dark" aria-label="Statistics">
      <div class="container">
        ${sectionHeading(projects.statistics.eyebrow, projects.statistics.title)}
        <div class="stat-grid reveal">
          ${projects.statistics.items.map((s) => `<div class="stat">
            <div class="stat__value" data-count-up="${s.value}" data-count-suffix="${esc(s.suffix || '')}">0</div>
            <div class="stat__label">${esc(s.label)}</div>
          </div>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${ctaSection(projects.finalCta)}
  `;
  return pageShell({ title: seo.title, description: seo.description, keywords: seo.keywords, canonical: '/projects', page: 'projects', body });
}

function buildTechnologyPage() {
  const seo = seoPages['/technology'];
  const body = `
    ${pageHero(technology.hero, 'technology-hero-heading')}
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Technology' }])}
    <section class="section section--white" aria-label="Overview">
      <div class="container">
        ${sectionHeading(technology.overview.eyebrow, technology.overview.title, technology.overview.body)}
        <div class="grid grid--3 reveal">
          ${technology.overview.items.map((i) => `<article class="card"><h3 class="card__title">${esc(i.title)}</h3><p class="card__desc">${esc(i.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section--light" aria-label="Capabilities">
      <div class="container">
        ${technology.capabilities.map((c) => `<article class="detail-section reveal" id="${esc(c.id)}">
          <h2 class="detail-section__title">${esc(c.title)}</h2>
          <p class="detail-section__headline">${esc(c.headline)}</p>
          <p class="detail-section__desc">${esc(c.description)}</p>
          <ul class="feature-list">${(c.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        </article>`).join('')}
      </div>
    </section>
    ${technology.stack ? `<section class="section section--white" aria-label="Technology stack">
      <div class="container">
        ${sectionHeading(technology.stack.eyebrow, technology.stack.title, technology.stack.body || '')}
        <div class="grid grid--3 reveal">
          ${technology.stack.items.map((i) => `<article class="card"><h3 class="card__title">${esc(i.name || i.title)}</h3><p class="card__desc">${esc(i.description)}</p>${i.application ? `<p class="card__stat">${esc(i.application)}</p>` : ''}</article>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${technology.process ? `<section class="section section--light" aria-label="Process">
      <div class="container">
        ${sectionHeading(technology.process.eyebrow, technology.process.title, technology.process.body)}
        <div class="timeline reveal">
          ${technology.process.steps.map((s, i) => `<article class="timeline__step">
            <div class="timeline__number">Step ${i + 1}</div>
            <h3 class="timeline__title">${esc(s.title)}</h3>
            <p class="timeline__desc">${esc(s.description)}</p>
          </article>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${technology.innovation ? `<section class="section section--white" aria-label="Innovation">
      <div class="container">
        ${sectionHeading(technology.innovation.eyebrow, technology.innovation.title, technology.innovation.description || technology.innovation.body || '')}
        <div class="grid grid--2 reveal">
          ${technology.innovation.items.map((i) => `<article class="card"><h3 class="card__title">${esc(i.title)}</h3><p class="card__desc">${esc(i.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${technology.dashboard ? `<section class="section section--dark" aria-label="Dashboard">
      <div class="container">
        ${sectionHeading(technology.dashboard.eyebrow, technology.dashboard.title, technology.dashboard.body)}
        <div class="grid grid--2 reveal">
          ${(technology.dashboard.metrics || []).map((m) => `<article class="card card--dark"><h3 class="card__title">${esc(m.label)}</h3><p class="card__stat">${esc(m.value)}</p></article>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${technology.whyTechnology ? `<section class="section section--light" aria-label="Why technology">
      <div class="container">
        ${sectionHeading(technology.whyTechnology.eyebrow, technology.whyTechnology.title)}
        <div class="trust-highlights reveal">
          ${technology.whyTechnology.items.map((i) => `<article class="trust-highlight"><h3 class="trust-highlight__title">${esc(i.title)}</h3><p class="trust-highlight__desc">${esc(i.description)}</p></article>`).join('')}
        </div>
      </div>
    </section>` : ''}
    ${technology.projects ? `<section class="section section--white" aria-label="Projects">
      <div class="container">
        ${sectionHeading(technology.projects.eyebrow, technology.projects.title)}
        <div class="grid grid--3 reveal">
          ${technology.projects.items.map((p) => `<article class="project-card">
            <div class="project-card__image" role="img" aria-label="${esc(p.imageAlt || p.title)}"><span class="project-card__badge">${esc(p.industry || '')}</span></div>
            <div class="project-card__body"><h3 class="project-card__title">${esc(p.title)}</h3><p class="project-card__meta">${esc(p.technologyUsed || '')}</p><p class="project-card__result">${esc(p.result || '')}</p></div>
          </article>`).join('')}
        </div>
        ${technology.projects.cta ? `<p style="margin-top:var(--space-6)" class="reveal">${btn(technology.projects.cta.label, technology.projects.cta.href, 'tertiary')}</p>` : ''}
      </div>
    </section>` : ''}
    ${ctaSection(technology.finalCta)}
  `;
  return pageShell({ title: seo.title, description: seo.description, keywords: seo.keywords, canonical: '/technology', page: 'technology', body });
}

function renderLegalSection(section) {
  switch (section.type) {
    case 'introduction':
      return `<div class="legal-prose reveal">${section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`;
    case 'prose':
      return `<div class="legal-prose reveal">
        <h2 class="section-heading__title">${esc(section.title)}</h2>
        ${Array.isArray(section.body) ? section.body.map((p) => `<p>${esc(p)}</p>`).join('') : `<p>${esc(section.body)}</p>`}
        ${section.statement ? `<p><strong>${esc(section.statement)}</strong></p>` : ''}
        ${section.items ? `<ul>${section.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
      </div>`;
    case 'list':
      return `<div class="legal-prose reveal">
        <h2 class="section-heading__title">${esc(section.title)}</h2>
        ${section.body ? `<p>${esc(section.body)}</p>` : ''}
        <ul>${section.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      </div>`;
    case 'accordion':
      return `<div class="reveal">
        <h2 class="section-heading__title">${esc(section.title)}</h2>
        <div class="accordion" data-accordion>
          ${section.items.map((item) => `<div class="accordion__item" data-accordion-item>
            <button type="button" class="accordion__trigger" data-accordion-trigger aria-expanded="false">${esc(item.title)}<span class="accordion__icon" aria-hidden="true">▼</span></button>
            <div class="accordion__panel"><ul>${(item.examples || []).map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>
          </div>`).join('')}
        </div>
      </div>`;
    case 'cards':
      return `<div class="reveal">
        <h2 class="section-heading__title">${esc(section.title)}</h2>
        <div class="grid grid--3" style="margin-top:var(--space-5)">
          ${section.items.map((i) => `<article class="card"><h3 class="card__title">${esc(i.title)}</h3></article>`).join('')}
        </div>
      </div>`;
    case 'company':
      return `<div class="legal-prose reveal">
        <h2 class="section-heading__title">${esc(section.title)}</h2>
        <p><strong>${esc(section.companyName)}</strong></p>
        <p>${esc(section.businessUnit)}</p>
        <p>${esc(section.location)}</p>
      </div>`;
    case 'contact':
      return `<div class="legal-prose reveal">
        <h2 class="section-heading__title">${esc(section.title)}</h2>
        <p>Email: <a href="mailto:${esc(section.contact.email)}">${esc(section.contact.email)}</a></p>
        <p>Phone: <a href="${esc(section.contact.phoneHref)}">${esc(section.contact.phone)}</a></p>
      </div>`;
    default:
      return '';
  }
}

function buildLegalPage(data, page, canonical) {
  const seo = seoPages[canonical];
  const body = `
    <section class="legal-hero">
      <div class="container">
        <h1 class="legal-hero__title">${esc(data.hero.headline)}</h1>
        <p class="legal-hero__sub">${esc(data.hero.subheadline)}</p>
        <p class="legal-hero__date">Last updated: ${esc(data.hero.lastUpdated)}</p>
      </div>
    </section>
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: data.hero.headline }])}
    <section class="section section--white" aria-label="${esc(data.hero.headline)}">
      <div class="container">
        ${data.sections.map((s) => `<div style="margin-bottom:var(--space-8)">${renderLegalSection(s)}</div>`).join('')}
      </div>
    </section>
  `;
  return pageShell({ title: seo.title, description: seo.description, keywords: seo.keywords, canonical, page, body });
}

/* ── Generate ── */
const pages = {
  'index.html': buildHomePage(),
  'about.html': buildAboutPage(),
  'contact.html': buildContactPage(),
  'solutions.html': buildSolutionsPage(),
  'industries.html': buildIndustriesPage(),
  'projects.html': buildProjectsPage(),
  'technology.html': buildTechnologyPage(),
  'privacy-policy.html': buildLegalPage(privacy, 'privacy-policy', '/privacy-policy'),
  'terms-of-service.html': buildLegalPage(terms, 'terms-of-service', '/terms-of-service'),
};

for (const [file, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(OUT, file), html, 'utf8');
  console.log(`✓ ${file}`);
}

console.log('\nStatic site generated successfully in project-static/');
