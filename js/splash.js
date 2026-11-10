// ========================================
// PRESENTACIÓN DE ENTRADA (logo + eslogan)
// Se carga en el <head>, antes de pintar: decide si la presentación
// se muestra (una vez por sesión, nunca con movimiento reducido) y
// permite saltarla. La animación y su final viven en CSS
// (css/components/splash.css): si este script falla, se apaga sola.
// ========================================

(function () {
  'use strict';

  var CLAVE = 'opsyn-splash';
  var raiz = document.documentElement;

  function yaVista() {
    try {
      return sessionStorage.getItem(CLAVE) === '1';
    } catch (e) {
      return false; // almacenamiento bloqueado: se muestra, es breve
    }
  }

  function marcarVista() {
    try {
      sessionStorage.setItem(CLAVE, '1');
    } catch (e) { /* sin almacenamiento: se volverá a mostrar */ }
  }

  var movimientoReducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (yaVista() || movimientoReducido) {
    raiz.classList.add('splash-skip');
    return;
  }

  marcarVista();

  document.addEventListener('DOMContentLoaded', function () {
    var splash = document.querySelector('.splash');
    if (!splash) return;

    var EVENTOS_SALTO = ['pointerdown', 'keydown', 'wheel', 'touchmove'];

    function quitar() {
      EVENTOS_SALTO.forEach(function (tipo) {
        window.removeEventListener(tipo, saltar);
      });
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }

    function saltar(evento) {
      if (evento.type === 'keydown' && evento.key === 'Tab') return;
      splash.classList.add('is-leaving');
      window.setTimeout(quitar, 260);
    }

    EVENTOS_SALTO.forEach(function (tipo) {
      window.addEventListener(tipo, saltar, { passive: true });
    });

    // Fin natural de la animación de salida definida en CSS.
    splash.addEventListener('animationend', function (evento) {
      if (evento.target === splash) quitar();
    });
  });
})();
