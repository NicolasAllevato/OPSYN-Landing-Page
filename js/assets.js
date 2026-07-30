/* ========================================
   ASSETS / CDN
   ========================================

   Punto único de configuración del CDN de imágenes (Cloudflare R2).

   Mientras CDN_BASE esté vacío, la página usa los placeholders locales
   de ./assets/ y no depende de ningún servicio externo.

   Para activar R2:
   1. Crear el bucket `opsyn-assets` en Cloudflare R2 y habilitar acceso público.
   2. Subir las imágenes respetando las rutas del atributo data-cdn del HTML
      (por ejemplo: images/blog/blog-1.webp).
   3. Poner acá el dominio público del bucket, sin barra final.
   4. Agregar ese mismo dominio a img-src en la CSP de vercel.json.
======================================== */

(function () {
  'use strict';

  // Ejemplo: 'https://cdn.opsyn.com.ar'  o  'https://pub-xxxxxxxx.r2.dev'
  var CDN_BASE = '';

  /**
   * Construye la URL absoluta de un asset del CDN.
   * Devuelve null si el CDN todavía no está configurado.
   */
  function assetUrl(path) {
    if (!CDN_BASE || !path) return null;
    return CDN_BASE.replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
  }

  /**
   * Reemplaza el src de las imágenes que declaran data-cdn.
   * Si una imagen del CDN falla, se conserva el placeholder local:
   * nunca se muestra el icono de imagen rota.
   */
  function upgradeImages() {
    var images = document.querySelectorAll('img[data-cdn]');

    Array.prototype.forEach.call(images, function (img) {
      var url = assetUrl(img.getAttribute('data-cdn'));
      if (!url) return;

      var fallback = img.getAttribute('src');

      img.addEventListener('error', function onError() {
        img.removeEventListener('error', onError);
        if (fallback) img.setAttribute('src', fallback);
      });

      img.setAttribute('src', url);
    });
  }

  // Fallback genérico: cualquier imagen que falle se oculta en lugar de
  // mostrar el icono de roto del navegador.
  function guardBrokenImages() {
    Array.prototype.forEach.call(document.images, function (img) {
      img.addEventListener('error', function () {
        if (!img.dataset.cdn) img.classList.add('img-failed');
      });
    });
  }

  function init() {
    upgradeImages();
    guardBrokenImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.OPSYN_ASSETS = { assetUrl: assetUrl, cdnBase: CDN_BASE };
})();
