/**
 * main.js — Pink Panther Portfolio
 * Plain vanilla JS, single file, no build step, no external libraries.
 * (Rebuilt: the original was split across main.js/navigation.js/animations.js/
 * paint.js/cursor.js/scroll.js via ES module imports, but only two of those
 * files existed in the export and their imports/exports didn't even match,
 * so nothing could run. Everything lives here now.)
 */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DOM = {
    body: document.body,
    loadingScreen: document.getElementById('loading-screen'),
    loaderBar: document.querySelector('.loader-bar'),
    nav: document.getElementById('main-nav'),
    navLinks: document.querySelectorAll('.nav-link'),
    navLinksList: document.getElementById('nav-links'),
    hamburger: document.getElementById('nav-hamburger'),
    sections: document.querySelectorAll('main > section'),
    ppChar: document.getElementById('pp-character'),
    ppBubble: document.getElementById('pp-speech-bubble'),
    ppBubbleText: document.querySelector('#pp-speech-bubble p'),
    paintOverlay: document.getElementById('paint-overlay'),
    cursorDot: document.getElementById('cursor-dot'),
    cursorRing: document.getElementById('cursor-ring'),
    backToTop: document.getElementById('back-to-top'),
    contactForm: document.getElementById('contact-form'),
    formNote: document.getElementById('form-note'),
  };

  var state = { menuOpen: false, soundOn: false, ppTimer: null, bubbleTimer: null };

  /* ── Loading screen ── */
  function initLoader() {
    if (!DOM.loadingScreen) return;
    var pct = 0;
    var iv = setInterval(function () {
      pct += Math.random() * 22 + 10;
      if (pct >= 100) { pct = 100; clearInterval(iv); }
      if (DOM.loaderBar) DOM.loaderBar.style.width = pct + '%';
    }, 140);

    window.addEventListener('load', function () {
      setTimeout(function () {
        DOM.loadingScreen.classList.add('hidden');
      }, 500);
    });
    // Fallback in case 'load' already fired or takes too long
    setTimeout(function () { DOM.loadingScreen.classList.add('hidden'); }, 2500);
  }

  /* ── Custom cursor ── */
  function initCursor() {
    if (!DOM.cursorDot || !DOM.cursorRing || window.matchMedia('(hover: none)').matches) return;
    var ringX = 0, ringY = 0, mouseX = 0, mouseY = 0, primed = false;
    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      if (!primed) { ringX = mouseX; ringY = mouseY; primed = true; }
      DOM.cursorDot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
    });
    (function loop() {
      ringX += (mouseX - ringX) * 0.28;
      ringY += (mouseY - ringY) * 0.28;
      DOM.cursorRing.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .project-card, .skill-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { DOM.cursorRing.classList.add('grow'); });
      el.addEventListener('mouseleave', function () { DOM.cursorRing.classList.remove('grow'); });
    });
  }

  /* ── Pink Panther state + speech bubble ── */
  function ppSetState(cls, revertMs) {
    if (!DOM.ppChar || reduced) return;
    DOM.ppChar.classList.remove('pp-idle', 'pp-walk', 'pp-celebrate', 'pp-surprised', 'pp-paint');
    DOM.ppChar.classList.add(cls);
    clearTimeout(state.ppTimer);
    if (revertMs) {
      state.ppTimer = setTimeout(function () {
        DOM.ppChar.classList.remove(cls);
        DOM.ppChar.classList.add('pp-idle');
      }, revertMs);
    }
  }

  function ppSay(text, ms) {
    if (!DOM.ppBubble || !DOM.ppBubbleText) return;
    DOM.ppBubbleText.textContent = text;
    DOM.ppBubble.classList.add('show');
    clearTimeout(state.bubbleTimer);
    state.bubbleTimer = setTimeout(function () { DOM.ppBubble.classList.remove('show'); }, ms || 2400);
  }


  /* ── Paint-wipe overlay + navigation ── */
  function paintWipeTo(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;

    if (reduced || !DOM.paintOverlay) {
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      return;
    }

    DOM.paintOverlay.classList.remove('animating');
    void DOM.paintOverlay.offsetWidth; // restart animation
    DOM.paintOverlay.classList.add('animating');

    ppSetState('pp-walk', 900);
    ppSay('Right this way!', 1600);

    setTimeout(function () {
      var y = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top: y, behavior: 'auto' });
    }, 480);

    setTimeout(function () { DOM.paintOverlay.classList.remove('animating'); }, 1050);
  }

  function initNavigation() {
    document.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var id = el.dataset.section;
        if (!id || !document.getElementById(id)) return;
        e.preventDefault();
        closeMenu();
        paintWipeTo(id);
      });
    });

    if (DOM.hamburger) {
      DOM.hamburger.addEventListener('click', function () {
        state.menuOpen ? closeMenu() : openMenu();
      });
    }

    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.id = 'nav-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeMenu);
  }

  function openMenu() {
    state.menuOpen = true;
    if (DOM.navLinksList) DOM.navLinksList.classList.add('open');
    document.getElementById('nav-overlay').classList.add('visible');
    if (DOM.hamburger) DOM.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    state.menuOpen = false;
    if (DOM.navLinksList) DOM.navLinksList.classList.remove('open');
    var ov = document.getElementById('nav-overlay');
    if (ov) ov.classList.remove('visible');
    if (DOM.hamburger) DOM.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ── Scroll: nav shadow, scrollspy, back-to-top, paw prints ── */
  function initScroll() {
    var lastPaw = 0;

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (DOM.nav) DOM.nav.classList.toggle('scrolled', y > 20);
      if (DOM.backToTop) DOM.backToTop.classList.toggle('show', y > 600);

      var now = Date.now();
      if (!reduced && now - lastPaw > 240) {
        lastPaw = now;
        spawnPaw();
      }
    }, { passive: true });

    if (DOM.backToTop) {
      DOM.backToTop.addEventListener('click', function () {
        ppSetState('pp-celebrate', 700);
        ppSay('Wheee!', 1400);
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
    }

    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var id = en.target.id;
            DOM.body.dataset.activeSection = id;
            DOM.navLinks.forEach(function (l) {
              l.classList.toggle('active', l.dataset.section === id);
            });
          }
        });
      }, { threshold: 0.4 });
      DOM.sections.forEach(function (s) { spy.observe(s); });

      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('visible'); reveal.unobserve(en.target); }
        });
      }, { threshold: 0.15 });
      document.querySelectorAll('[data-reveal]').forEach(function (el) { reveal.observe(el); });
    } else {
      document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('visible'); });
    }
  }

  function spawnPaw() {
    var paw = document.createElement('div');
    paw.className = 'paw';
    paw.style.left = (Math.random() * (window.innerWidth - 60) + 30) + 'px';
    paw.style.top = (Math.random() * 40 + 70) + 'px';
    document.body.appendChild(paw);
    setTimeout(function () { paw.remove(); }, 1200);
  }

  /* ── Project card paint-on-hover ── */
  function initProjectHover() {
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        ppSetState('pp-paint', 800);
      });
    });
  }

  /* ── Contact form ── */
  function initForm() {
    if (!DOM.contactForm) return;
    DOM.contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (DOM.formNote) DOM.formNote.classList.add('show');
      ppSetState('pp-celebrate', 700);
      ppSay('Message received!', 2200);
      DOM.contactForm.reset();
      setTimeout(function () {
        if (DOM.formNote) DOM.formNote.classList.remove('show');
      }, 4000);
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    initLoader();
    initCursor();
    initNavigation();
    initScroll();
    initProjectHover();
    initForm();
  });
})();
