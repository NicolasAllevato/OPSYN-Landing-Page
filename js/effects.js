// ========================================
// EFECTOS DE BOTONES (.btn)
// Brillo que sigue al cursor (--mx/--my) + magnetismo leve.
// Sin librerías, con pointermove + rAF. Se desactiva por completo
// con prefers-reduced-motion o en dispositivos sin puntero fino
// (táctil), donde estos efectos no aportan y solo consumen batería.
// ========================================

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (prefersReducedMotion || !hasFinePointer) return;

  var MAGNETIC_STRENGTH = 0.15;
  var MAGNETIC_MAX = 6; // px, para que el desplazamiento sea "leve"

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function initButtonEffects() {
    var buttons = document.querySelectorAll('.btn');

    buttons.forEach(function (btn) {
      var raf = null;
      var pendingEvent = null;

      var applyFrame = function () {
        raf = null;
        if (!pendingEvent) return;

        var rect = btn.getBoundingClientRect();
        var mx = pendingEvent.clientX - rect.left;
        var my = pendingEvent.clientY - rect.top;

        btn.style.setProperty('--mx', mx + 'px');
        btn.style.setProperty('--my', my + 'px');

        var dx = clamp((pendingEvent.clientX - (rect.left + rect.width / 2)) * MAGNETIC_STRENGTH, -MAGNETIC_MAX, MAGNETIC_MAX);
        var dy = clamp((pendingEvent.clientY - (rect.top + rect.height / 2)) * MAGNETIC_STRENGTH, -MAGNETIC_MAX, MAGNETIC_MAX);
        btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      };

      btn.addEventListener('pointermove', function (event) {
        pendingEvent = event;
        if (raf) return;
        raf = requestAnimationFrame(applyFrame);
      });

      btn.addEventListener('pointerleave', function () {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        pendingEvent = null;
        btn.style.transform = '';
        btn.style.removeProperty('--mx');
        btn.style.removeProperty('--my');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtonEffects);
  } else {
    initButtonEffects();
  }
})();
