/* =========================================================
   Ehab Abutahoun — Portfolio
   No dependencies. All motion respects prefers-reduced-motion.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav background ---------- */

  var nav = document.getElementById('nav');

  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */

  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      navToggle.focus();
    }
  });

  /* ---------- Scroll reveal ---------- */

  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('is-visible'); }, i * 60);
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Count-up statistics ---------- */

  var stats = document.querySelectorAll('.stat__num');

  function setStat(el, value) {
    el.textContent = value + (el.dataset.suffix || '');
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    stats.forEach(function (el) { setStat(el, el.dataset.count); });
  } else {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var duration = 1100;
        var start = null;

        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);          // ease-out cubic
          setStat(el, Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        statObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    stats.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---------- Scroll-spy nav highlighting ---------- */

  var spyLinks = Array.prototype.slice.call(
    navLinks.querySelectorAll('a[href^="#"]')
  );
  var spySections = spyLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spySections.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.classList.toggle(
            'is-active',
            a.getAttribute('href') === '#' + entry.target.id
          );
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    spySections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* ---------- Timeline: earlier roles ---------- */

  var toggleEarly = document.getElementById('toggleEarly');
  var earlyRoles = document.querySelectorAll('.role--early');

  toggleEarly.addEventListener('click', function () {
    var expanded = toggleEarly.getAttribute('aria-expanded') === 'true';
    var next = !expanded;

    earlyRoles.forEach(function (role) {
      role.hidden = !next;
      if (next) role.classList.add('is-visible');
    });

    toggleEarly.setAttribute('aria-expanded', String(next));
    toggleEarly.querySelector('.toggle-early__text').textContent =
      next ? 'Hide earlier roles' : 'Show earlier roles (1999 – 2007)';
    toggleEarly.querySelector('.toggle-early__icon').textContent = next ? '−' : '+';
  });

  /* ---------- Gallery lightbox ---------- */

  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  var lightbox = document.getElementById('lightbox');
  var lbImage = document.getElementById('lbImage');
  var lbCaption = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var current = 0;
  var lastFocused = null;

  function render(index) {
    current = (index + shots.length) % shots.length;
    var shot = shots[current];
    var img = shot.querySelector('img');
    lbImage.src = img.src;
    lbImage.alt = img.alt;
    lbCaption.textContent =
      shot.dataset.caption + '  ·  ' + (current + 1) + ' / ' + shots.length;
  }

  function openLightbox(index) {
    lastFocused = document.activeElement;
    render(index);
    lightbox.hidden = false;
    document.body.classList.add('lb-open');
    requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lb-open');
    var delay = reduceMotion ? 0 : 250;
    setTimeout(function () {
      lightbox.hidden = true;
      lbImage.src = '';
    }, delay);
    if (lastFocused) lastFocused.focus();
  }

  shots.forEach(function (shot, i) {
    shot.setAttribute('tabindex', '0');
    shot.setAttribute('role', 'button');
    shot.setAttribute('aria-label', 'View image: ' + shot.dataset.caption);

    shot.addEventListener('click', function () { openLightbox(i); });
    shot.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { render(current - 1); });
  lbNext.addEventListener('click', function () { render(current + 1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;

    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowLeft') { render(current - 1); return; }
    if (e.key === 'ArrowRight') { render(current + 1); return; }

    /* Focus trap */
    if (e.key === 'Tab') {
      var focusable = [lbClose, lbPrev, lbNext];
      var idx = focusable.indexOf(document.activeElement);
      e.preventDefault();
      var nextIdx = e.shiftKey ? idx - 1 : idx + 1;
      focusable[(nextIdx + focusable.length) % focusable.length].focus();
    }
  });

})();
