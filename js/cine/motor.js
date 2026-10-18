// ========================================
// CINE — motor común (portado de la skill de animaciones: easings, RNG, lerp)
// Expone window.OpsynCine. Sin dependencias.
// ========================================

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  // Curvas de la skill: out3/out4 entradas, in3 salidas
  var E = {
    out3: function (t) { return 1 - Math.pow(1 - t, 3); },
    out4: function (t) { return 1 - Math.pow(1 - t, 4); },
    in3: function (t) { return t * t * t; }
  };

  // RNG determinista (mismo fondo en cada visita)
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // Nivel de rendimiento: define DPR y cantidad de partículas
  function perfTier() {
    var cores = navigator.hardwareConcurrency || 4;
    var small = window.innerWidth < 768;
    if (reduced) return 'off';
    if (small || cores <= 2) return 'bajo';
    return cores >= 8 ? 'alto' : 'medio';
  }

  window.OpsynCine = { reduced: reduced, clamp: clamp, lerp: lerp, E: E, rng: rng, perfTier: perfTier };
})();
