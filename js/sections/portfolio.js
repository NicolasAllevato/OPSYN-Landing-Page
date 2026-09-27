// ========================================
// SECCIÓN PORTFOLIO
// - Count-up de métricas al entrar en viewport (se pausa/ignora con
//   reduced-motion: en ese caso se muestra directo el valor final).
// - Fallback de imagen del mockup si el asset de Fase 3 no existe/falla.
// ========================================

(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COUNT_DURATION = 900; // ms

  function setupImageFallback(picture) {
    var img = picture.querySelector('img');
    if (!img) return;
    img.addEventListener('error', function () {
      picture.classList.add('img-slot--broken');
    });
    if (img.complete && img.naturalWidth === 0) {
      picture.classList.add('img-slot--broken');
    }
  }

  // Actualiza solo el nodo de texto inicial de la métrica (el prefijo +
  // el número), dejando intacto el <span class="portfolio-unit"> que le sigue.
  function setMetricText(metricEl, prefix, value) {
    var textNode = metricEl.firstChild;
    var text = prefix + value;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = text;
    } else {
      metricEl.insertBefore(document.createTextNode(text), metricEl.firstChild);
    }
  }

  function animateCount(metricEl) {
    var target = parseInt(metricEl.getAttribute('data-count-target'), 10);
    if (Number.isNaN(target)) return;
    var prefix = metricEl.getAttribute('data-count-prefix') || '';

    if (prefersReducedMotion) {
      setMetricText(metricEl, prefix, target);
      return;
    }

    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / COUNT_DURATION, 1);
      var current = Math.round(progress * target);
      setMetricText(metricEl, prefix, current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function setupCountUpObserver() {
    var metrics = document.querySelectorAll('.portfolio-metric[data-count-target]');
    if (!metrics.length) return;

    if (!('IntersectionObserver' in window)) {
      metrics.forEach(function (metricEl) {
        var target = metricEl.getAttribute('data-count-target');
        var prefix = metricEl.getAttribute('data-count-prefix') || '';
        setMetricText(metricEl, prefix, target);
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    metrics.forEach(function (metricEl) {
      observer.observe(metricEl);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.portfolio-media').forEach(function (picture) {
      setupImageFallback(picture);
    });
    setupCountUpObserver();
  });
})();
