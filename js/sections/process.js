// ========================================
// SECCIÓN "CÓMO LO HACEMOS" — línea que se dibuja al scrollear,
// nodo activo con pulso, y fallback de imágenes sin librerías.
// ========================================

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Oculta imágenes rotas (slots sin asset 3D todavía) sin usar
   * handlers inline: la CSP del sitio los bloquea.
   */
  function initImgSlotFallbacks() {
    var slots = document.querySelectorAll('.img-slot img');
    slots.forEach(function (img) {
      img.addEventListener('error', function () {
        var slot = img.closest('.img-slot');
        if (slot) {
          slot.classList.add('img-slot--broken');
        }
      });
      // Si la imagen ya falló antes de que se registre el listener.
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        var slotNow = img.closest('.img-slot');
        if (slotNow) {
          slotNow.classList.add('img-slot--broken');
        }
      }
    });
  }

  /**
   * Marca el paso visible como activo (nodo con pulso) usando
   * IntersectionObserver, sin listeners de scroll.
   */
  function initActiveStepObserver() {
    var steps = document.querySelectorAll('.process-step');
    if (!steps.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      steps.forEach(function (step) {
        step.classList.add('is-active');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
          } else if (entry.boundingClientRect.top > 0) {
            // Solo desactiva el pulso si el paso todavía no fue alcanzado
            // (evita parpadeos al bajar y volver a subir levemente).
            entry.target.classList.remove('is-active');
          }
        });
      },
      { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
    );

    steps.forEach(function (step) {
      observer.observe(step);
    });
  }

  /**
   * Dibuja la línea conectora con stroke-dashoffset según el avance
   * de scroll dentro del track del proceso. Se pausa fuera de pantalla.
   */
  function initScrollLine() {
    var track = document.querySelector('.process-track');
    var progressPaths = document.querySelectorAll('.process-line-progress');
    if (!track || !progressPaths.length) return;

    if (prefersReducedMotion) {
      progressPaths.forEach(function (path) {
        path.style.strokeDashoffset = '0';
      });
      return;
    }

    var ticking = false;
    var isInView = false;

    function updateProgress() {
      ticking = false;
      var rect = track.getBoundingClientRect();
      var viewportH = window.innerHeight || document.documentElement.clientHeight;

      // Progreso 0→1: empieza cuando el track entra por abajo,
      // termina cuando su final llega a un tercio superior del viewport.
      var start = viewportH * 0.85;
      var end = viewportH * 0.25;
      var total = rect.top - end;
      var range = start - end;
      var raw = 1 - total / range;
      var progress = Math.min(1, Math.max(0, raw));

      progressPaths.forEach(function (path) {
        path.style.strokeDashoffset = String(1 - progress);
      });
    }

    function onScroll() {
      if (!isInView || ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }

    if ('IntersectionObserver' in window) {
      var visibilityObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isInView = entry.isIntersecting;
            if (isInView) updateProgress();
          });
        },
        { threshold: 0 }
      );
      visibilityObserver.observe(track);
    } else {
      isInView = true;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateProgress();
  }

  function init() {
    initImgSlotFallbacks();
    initActiveStepObserver();
    initScrollLine();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
