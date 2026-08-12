document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const AFFILIATE_URL =
    (typeof CONFIG !== 'undefined' && CONFIG.partner?.siteUrl) ||
    'https://streamaf.net/ref/b0896ea90a877cabe5a7dfdf0b3955f57ba2';
  const PROMO_CODE =
    (typeof CONFIG !== 'undefined' && CONFIG.partner?.promoCode) || 'GOLDENBOY';

  let currentLang = localStorage.getItem('goldenboy-lang') || 'pl';

  function t(key) {
    return translations[currentLang]?.[key] ?? translations.pl?.[key] ?? key;
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('goldenboy-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const translation = translations[lang]?.[key];
      if (translation === undefined) return;
      if (translation.includes('<')) {
        el.innerHTML = translation;
      } else {
        el.textContent = translation;
      }
    });

    const copyBtnText = document.getElementById('copyBtnText');
    if (copyBtnText && !copyBtnText.dataset.locked) {
      copyBtnText.textContent = t('codeCopy');
    }
  }

  document.querySelectorAll('.lang-toggle button').forEach((btn) => {
    btn.addEventListener('click', function () {
      setLanguage(this.dataset.lang);
    });
  });

  setLanguage(currentLang);

  document
    .querySelectorAll(
      'a[href*="streamaf.net"], a[href*="bsr.lynmonkel.com"], a[href*="coldredir.com"]',
    )
    .forEach((a) => {
      a.href = AFFILIATE_URL;
    });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');

        entry.target.querySelectorAll('.reveal-stagger').forEach((child, i) => {
          child.style.transitionDelay = `${i * 80}ms`;
          child.classList.add('is-visible');
        });

        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.querySelectorAll('.reveal-stagger').forEach((child, i) => {
      child.style.transitionDelay = `${120 + i * 90}ms`;
      requestAnimationFrame(() => child.classList.add('is-visible'));
    });
  }

  document.querySelectorAll('.reveal-stagger').forEach((el) => {
    if (!el.closest('.reveal') && !el.closest('.hero')) {
      revealObserver.observe(el);
    }
  });

  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('.footer-year').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const copyBtn = document.getElementById('copyPromoBtn');
  const codeDisplay = document.getElementById('promoCodeDisplay');
  const btnText = document.getElementById('copyBtnText');

  async function copyPromo() {
    const markCopied = () => {
      if (!btnText) return;
      btnText.dataset.locked = '1';
      btnText.textContent = t('codeCopied');
      codeDisplay?.classList.add('is-copied');
      setTimeout(() => {
        btnText.dataset.locked = '';
        btnText.textContent = t('codeCopy');
        codeDisplay?.classList.remove('is-copied');
      }, 1800);
    };

    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      markCopied();
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = PROMO_CODE;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      markCopied();
    }
  }

  copyBtn?.addEventListener('click', copyPromo);
  codeDisplay?.addEventListener('click', copyPromo);
});
