// ========================================
// CINE — escenas: entrada con golpe en títulos, rayos del hero con parallax.
// Anima el CONTENEDOR (nunca divide el texto): applyLanguage() reescribe
// textContent de [data-i18n] y borraría cualquier span interno.
// ========================================

(function () {
  'use strict';

  var C = window.OpsynCine;
  if (!C || C.reduced) return;

  function golpeEnTitulos() {
    var els = document.querySelectorAll('.section-title');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    els.forEach(function (el) { el.classList.add('golpe'); io.observe(el); });
  }

  function rayosHero() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var rays = document.createElement('div');
    rays.className = 'hero-rays';
    rays.setAttribute('aria-hidden', 'true');
    hero.insertBefore(rays, hero.firstChild);

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking || window.scrollY > window.innerHeight * 1.2) return;
      ticking = true;
      requestAnimationFrame(function () {
        rays.style.setProperty('--scroll-y', window.scrollY);
        ticking = false;
      });
    }, { passive: true });
  }

  function init() { golpeEnTitulos(); rayosHero(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
