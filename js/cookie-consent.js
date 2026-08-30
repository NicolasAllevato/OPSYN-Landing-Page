/* ========================================
   BANNER DE CONSENTIMIENTO DE COOKIES

   Este sitio hoy solo usa localStorage técnico (idioma + esta misma
   preferencia de cookies). El banner deja la base lista para el día
   que se sume analítica/tracking: "Rechazar" queda registrado y
   cualquier script opcional futuro debe chequear opsynCookieConsent()
   antes de cargarse.
   ======================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'opsyn-cookie-consent';

  var COPY = {
    es: {
      text: 'Usamos almacenamiento técnico esencial (como tu idioma) para que el sitio funcione bien. No usamos cookies de seguimiento ni publicidad.',
      link: 'Más info',
      accept: 'Aceptar',
      reject: 'Rechazar'
    },
    en: {
      text: 'We use essential technical storage (like your language) so the site works well. We don’t use tracking or advertising cookies.',
      link: 'Learn more',
      accept: 'Accept',
      reject: 'Reject'
    }
  };

  function getLang() {
    var stored = localStorage.getItem('opsyn-lang');
    if (stored === 'es' || stored === 'en') return stored;
    return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'es';
  }

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) { /* almacenamiento no disponible: no bloquea la navegación */ }
  }

  function buildBanner() {
    var lang = getLang();
    var t = COPY[lang] || COPY.es;

    var el = document.createElement('div');
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', lang === 'en' ? 'Cookie notice' : 'Aviso de cookies');

    el.innerHTML =
      '<p class="cookie-banner-text">' + t.text +
      ' <a href="./cookies.html">' + t.link + '</a></p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="cookie-btn cookie-btn-reject">' + t.reject + '</button>' +
      '<button type="button" class="cookie-btn cookie-btn-accept">' + t.accept + '</button>' +
      '</div>';

    var accept = el.querySelector('.cookie-btn-accept');
    var reject = el.querySelector('.cookie-btn-reject');

    accept.addEventListener('click', function () {
      setConsent('accepted');
      hideBanner(el);
    });

    reject.addEventListener('click', function () {
      setConsent('rejected');
      hideBanner(el);
    });

    return el;
  }

  function hideBanner(el) {
    el.classList.remove('is-visible');
    window.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }

  function init() {
    if (getConsent()) return;

    var banner = buildBanner();
    document.body.appendChild(banner);

    window.requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.opsynCookieConsent = function () {
    return getConsent();
  };
})();
