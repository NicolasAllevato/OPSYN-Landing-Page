// ========================================
// HERO — logo 3D (three.js, liviano) + fallback tilt CSS
// Requisitos para activar la escena 3D: WebGL disponible, pantalla
// >=768px y sin prefers-reduced-motion. Si falta cualquiera, o si
// falla la carga de three.js/la textura, se usa un tilt 2D con CSS
// custom properties sobre el <picture> existente (siempre en el DOM).
// ========================================

(function () {
  'use strict';

  var wrap = document.querySelector('.hero-logo-wrap');
  if (!wrap) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = window.matchMedia('(min-width: 768px)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  function hasWebGL() {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (prefersReducedMotion || !isDesktop || !hasWebGL()) {
    initCssTilt(wrap);
    return;
  }

  init3D(wrap).catch(function () {
    initCssTilt(wrap);
  });

  // ---- Fallback: tilt 2D con CSS custom properties sobre el <picture> ----
  function initCssTilt(el) {
    if (!hasFinePointer) return; // en táctil no aporta y consume batería
    var img = el.querySelector('.hero-logo');
    if (!img) return;

    var raf = null;
    var pendingEvent = null;

    var applyFrame = function () {
      raf = null;
      if (!pendingEvent) return;
      var rect = el.getBoundingClientRect();
      var px = (pendingEvent.clientX - rect.left) / rect.width - 0.5;
      var py = (pendingEvent.clientY - rect.top) / rect.height - 0.5;
      img.style.setProperty('--hero-tilt-y', (px * 14).toFixed(2) + 'deg');
      img.style.setProperty('--hero-tilt-x', (py * -14).toFixed(2) + 'deg');
    };

    el.addEventListener('pointermove', function (event) {
      pendingEvent = event;
      if (raf) return;
      raf = requestAnimationFrame(applyFrame);
    });

    el.addEventListener('pointerleave', function () {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      pendingEvent = null;
      img.style.setProperty('--hero-tilt-x', '0deg');
      img.style.setProperty('--hero-tilt-y', '0deg');
    });
  }

  // ---- Escena 3D con three.js (import dinámico) ----
  function init3D(el) {
    return import('../vendor/three.module.min.js').then(function (THREE) {
      var container = el.querySelector('.hero-logo-3d');
      if (!container) throw new Error('hero-logo-3d: contenedor no encontrado');

      var size = container.clientWidth || 360;

      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(size, size);
      container.appendChild(renderer.domElement);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10);
      camera.position.z = 3.4;

      var textureLoader = new THREE.TextureLoader();
      var texture = textureLoader.load(
        '../../assets/logo-opsyn-icon-880.webp',
        undefined,
        undefined,
        function () {
          // la textura no cargó (evento async): se aborta la escena y se cae al tilt CSS
          cleanup();
          initCssTilt(el);
        }
      );
      texture.colorSpace = THREE.SRGBColorSpace;

      var geometry = new THREE.PlaneGeometry(2.1, 2.1, 1, 1);

      // Capa principal (logo nítido al frente)
      var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      var plane = new THREE.Mesh(geometry, material);
      scene.add(plane);

      // Segunda capa levemente detrás y más grande: da sensación de
      // profundidad/extrusión con solo dos planos en parallax (liviano).
      var backMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.35 });
      var backPlane = new THREE.Mesh(geometry.clone(), backMaterial);
      backPlane.position.z = -0.15;
      backPlane.scale.set(1.08, 1.08, 1);
      scene.add(backPlane);

      var targetRotX = 0;
      var targetRotY = 0;
      var currentRotX = 0;
      var currentRotY = 0;

      function onPointerMove(event) {
        var rect = container.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        targetRotY = px * 0.5;
        targetRotX = -py * 0.5;
      }

      // Giroscopio suave (tablets/notebooks con sensor): pequeño rango
      // para que el efecto sea sutil, igual que el tilt del mouse.
      function onOrientation(event) {
        if (event.gamma == null || event.beta == null) return;
        targetRotY = THREE.MathUtils.clamp(event.gamma / 45, -1, 1) * 0.35;
        targetRotX = THREE.MathUtils.clamp((event.beta - 45) / 45, -1, 1) * 0.35;
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('deviceorientation', onOrientation, { passive: true });

      var isInViewport = true;
      var observer = new IntersectionObserver(function (entries) {
        isInViewport = entries[0].isIntersecting;
      }, { threshold: 0 });
      observer.observe(container);

      var rafId = null;
      function animate() {
        rafId = requestAnimationFrame(animate);
        if (!isInViewport) return; // pausa el render fuera de pantalla
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;
        plane.rotation.x = currentRotX;
        plane.rotation.y = currentRotY;
        backPlane.rotation.x = currentRotX;
        backPlane.rotation.y = currentRotY;
        renderer.render(scene, camera);
      }
      animate();

      function onResize() {
        var newSize = container.clientWidth || size;
        renderer.setSize(newSize, newSize);
      }
      window.addEventListener('resize', onResize, { passive: true });

      function cleanup() {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('deviceorientation', onOrientation);
        window.removeEventListener('resize', onResize);
        observer.disconnect();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        el.classList.remove('has-3d');
        container.classList.remove('is-active');
      }

      el.classList.add('has-3d');
      container.classList.add('is-active');
    });
  }
})();
