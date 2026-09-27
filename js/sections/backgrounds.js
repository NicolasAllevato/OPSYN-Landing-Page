// ========================================
// FONDOS DINÁMICOS GLOBALES — listener de scroll único
// Movido desde js/main.js (initParallax) para centralizar en un solo
// listener con rAF todo el trabajo de scroll relacionado a fondos.
// Aplica parallax leve al circuito decorativo del hero mientras está
// en el viewport inicial. Respeta prefers-reduced-motion.
// ========================================

(function () {
  'use strict';

  function initHeroParallax() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var circuitBg = document.querySelector('.circuit-bg');
    if (!circuitBg || prefersReducedMotion) return;

    var ticking = false;

    var update = function () {
      var scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        circuitBg.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
      }
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroParallax);
  } else {
    initHeroParallax();
  }
})();
