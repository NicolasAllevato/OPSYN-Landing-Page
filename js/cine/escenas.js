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

  // Paquete de luz: copia del trazo de fondo con un guion corto que avanza
  function paquetesProceso() {
    document.querySelectorAll('.process-line-bg').forEach(function (bg) {
      var p = bg.cloneNode(false);
      p.setAttribute('class', 'process-line-packet');
      bg.parentNode.appendChild(p);
    });
  }

  // Reflejo que sigue al puntero en las tarjetas (solo puntero fino)
  function reflejoServicios() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.service-card').forEach(function (card) {
      var raf = 0, ev = null;
      card.addEventListener('pointermove', function (e) {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = card.getBoundingClientRect();
          card.style.setProperty('--rx', (ev.clientX - r.left) + 'px');
          card.style.setProperty('--ry', (ev.clientY - r.top) + 'px');
        });
      }, { passive: true });
    });
  }

  function init() { golpeEnTitulos(); rayosHero(); paquetesProceso(); reflejoServicios(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
