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

  if (prefersReducedMotion || !isDesktop) {
    initCssTilt(wrap);
    return;
  }

  // La escena 3D es una mejora progresiva: el <picture> con el logo estático
  // ya está visible. Se difiere a después del `load` y a un momento ocioso para
  // que parsear three.js (~670 KB) y compilar shaders no compita con el primer
  // render ni sume Total Blocking Time. hasWebGL() también va acá: crea un
  // contexto WebGL solo para chequear soporte.
  whenIdleAfterLoad(function () {
    if (!hasWebGL()) {
      initCssTilt(wrap);
      return;
    }
    init3D(wrap).catch(function () {
      initCssTilt(wrap);
    });
  });

  function whenIdleAfterLoad(callback) {
    var schedule = function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout: 2500 });
      } else {
        setTimeout(callback, 600);
      }
    };
    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }
  }

  // Normaliza la posición del puntero respecto de un rect a [-0.5, 0.5]:
  // sin el tope, con el mouse lejos del logo el giro crecía sin límite.
  function relativePointer(event, rect) {
    var clamp = function (v) { return Math.max(-0.5, Math.min(0.5, v)); };
    return {
      x: clamp((event.clientX - rect.left) / rect.width - 0.5),
      y: clamp((event.clientY - rect.top) / rect.height - 0.5),
    };
  }

  // ---- Fallback: tilt 2D con CSS custom properties sobre el <picture> ----
  function initCssTilt(el) {
    if (!hasFinePointer) {
      // Táctil: inclinación sutil con el giroscopio (sin animación continua).
      if (!prefersReducedMotion) initGyroTilt(el);
      return;
    }
    var img = el.querySelector('.hero-logo');
    if (!img) return;

    var raf = null;
    var pendingEvent = null;

    var applyFrame = function () {
      raf = null;
      if (!pendingEvent) return;
      var p = relativePointer(pendingEvent, el.getBoundingClientRect());
      img.style.setProperty('--hero-tilt-y', (p.x * 10).toFixed(2) + 'deg');
      img.style.setProperty('--hero-tilt-x', (p.y * -10).toFixed(2) + 'deg');
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

  // ---- Celular/tablet: tilt CSS con el giroscopio ----
  // Máximo ±6° y referencia que se re-centra sola: sigue la forma en que la
  // persona sostiene el teléfono y solo reacciona a movimientos de la mano.
  function initGyroTilt(el) {
    // Constante local: esta función se invoca desde arriba del IIFE, antes de
    // que corra cualquier `var` declarada más abajo (valdría undefined → NaN).
    var GYRO_MAX_DEG = 6;
    var img = el.querySelector('.hero-logo');
    if (!img || !('DeviceOrientationEvent' in window)) return;

    var base = null;
    var raf = null;
    var tilt = { x: 0, y: 0 };

    var apply = function () {
      raf = null;
      img.style.setProperty('--hero-tilt-y', tilt.y.toFixed(2) + 'deg');
      img.style.setProperty('--hero-tilt-x', tilt.x.toFixed(2) + 'deg');
    };

    var onOrientation = function (event) {
      if (event.gamma == null || event.beta == null) return;
      if (!base) base = { beta: event.beta, gamma: event.gamma };
      // Re-centrado lento hacia la postura actual
      base.beta += (event.beta - base.beta) * 0.005;
      base.gamma += (event.gamma - base.gamma) * 0.005;
      var clamp = function (v) { return Math.max(-1, Math.min(1, v)); };
      tilt.y = clamp((event.gamma - base.gamma) / 30) * GYRO_MAX_DEG;
      tilt.x = clamp((event.beta - base.beta) / 30) * -GYRO_MAX_DEG;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    var start = function () {
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
    };

    // iOS 13+ exige permiso explícito tras un gesto del usuario: se pide
    // solo si la persona toca el logo (nunca con un diálogo sorpresa).
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      el.addEventListener('click', function askOnce() {
        el.removeEventListener('click', askOnce);
        DeviceOrientationEvent.requestPermission()
          .then(function (state) { if (state === 'granted') start(); })
          .catch(function () { /* sin permiso: el logo queda estático */ });
      });
    } else {
      start();
    }
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
        function () {
          // Recién con la textura lista se reemplaza el logo estático: si se
          // activara antes, el canvas quedaría vacío unos instantes (parpadeo).
          el.classList.add('has-3d');
          container.classList.add('is-active');
        },
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

      // Giro máximo ±0.25 rad (~14°): antes era ±0.5 rad sin tope y con el
      // mouse lejos del logo llegaba a ~40°.
      function onPointerMove(event) {
        var p = relativePointer(event, container.getBoundingClientRect());
        targetRotY = p.x * 0.5;
        targetRotX = -p.y * 0.5;
      }

      // Giroscopio suave (tablets/notebooks con sensor): pequeño rango
      // para que el efecto sea sutil, igual que el tilt del mouse.
      function onOrientation(event) {
        if (event.gamma == null || event.beta == null) return;
        targetRotY = THREE.MathUtils.clamp(event.gamma / 45, -1, 1) * 0.15;
        targetRotX = THREE.MathUtils.clamp((event.beta - 45) / 45, -1, 1) * 0.15;
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
    });
  }
})();
