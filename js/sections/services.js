// ========================================
// SECCIÓN SERVICIOS
// - Tilt 3D en hover (solo puntero fino, sin reduced-motion).
// - Fallback de imagen 3D: si el <img> del slot falla (todavía no
//   existe el asset de Fase 3), se oculta y queda el ícono SVG.
// - Botón "Consultar por esto": dispara un evento personalizado que
//   el formulario de contacto escucha para preseleccionar el servicio.
// ========================================

(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  function setupImageFallback(picture) {
    var img = picture.querySelector('img');
    if (!img) return;
    img.addEventListener('error', function () {
      picture.classList.add('img-slot--broken');
    });
    // Si el navegador ya cacheó un error antes de que se registre el listener.
    if (img.complete && img.naturalWidth === 0) {
      picture.classList.add('img-slot--broken');
    }
  }

  function setupTilt(card) {
    if (!hasFinePointer || prefersReducedMotion) return;

    var maxTilt = 8; // grados

    card.addEventListener('pointerenter', function () {
      card.classList.add('tilt-active');
    });

    card.addEventListener('pointermove', function (event) {
      var rect = card.getBoundingClientRect();
      var relX = (event.clientX - rect.left) / rect.width; // 0..1
      var relY = (event.clientY - rect.top) / rect.height; // 0..1
      var tiltY = (relX - 0.5) * (maxTilt * 2);
      var tiltX = (0.5 - relY) * (maxTilt * 2);
      card.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
    });

    card.addEventListener('pointerleave', function () {
      card.classList.remove('tilt-active');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  }

  function setupConsultButton(btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-service-value');
      if (!value) return;
      document.dispatchEvent(new CustomEvent('opsyn:select-service', {
        detail: { value: value }
      }));
      // No se hace preventDefault: el enlace sigue navegando a #contacto
      // con el comportamiento nativo/smooth-scroll existente.
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.service-card').forEach(function (card) {
      setupTilt(card);
    });

    document.querySelectorAll('.service-media').forEach(function (picture) {
      setupImageFallback(picture);
    });

    document.querySelectorAll('.service-consult-btn').forEach(function (btn) {
      setupConsultButton(btn);
    });
  });
})();
