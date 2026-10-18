// ========================================
// CINE — fondos canvas por sección (portados de capas.js de la skill)
//   data-cine="cortina|constelacion|malla|aurora|liso" en la <section>.
// Un único loop rAF; pausa fuera de vista y con la pestaña oculta.
// Sin reduced-motion ni canvas: queda el aurora CSS de backgrounds.css.
// ========================================

(function () {
  'use strict';

  var C = window.OpsynCine;
  if (!C || C.reduced) return;

  var tier = C.perfTier();
  if (tier === 'off') return;

  var DPR = Math.min(window.devicePixelRatio || 1, tier === 'bajo' ? 1 : 1.5);
  var K = { alto: 1, medio: 0.75, bajo: 0.45 }[tier]; // factor de cantidad
  var VIOLETA = '148,52,212', CIAN = '121,255,255', CLARO = '199,125,240', AZUL = '150,180,255';
  var A = 0.6; // intensidad "cine sobrio"

  function base(x, W, H, t) {
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d0326'); g.addColorStop(0.55, '#12062f'); g.addColorStop(1, '#0d0326');
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'lighter';
    glow(x, W * 0.5, H * 0.46, Math.max(W, H) * 0.55, VIOLETA, 0.16 * A * (0.85 + 0.15 * Math.sin(t * 0.9)));
    glow(x, W * 0.12, H * 0.9, Math.max(W, H) * 0.4, CIAN, 0.05 * A);
    glow(x, W * 0.9, H * 0.1, Math.max(W, H) * 0.36, CLARO, 0.06 * A);
    x.globalCompositeOperation = 'source-over'; // cada fondo elige su mezcla
  }
  function glow(x, cx, cy, r, rgb, a) {
    var g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(' + rgb + ',' + a.toFixed(3) + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  }
  function polvo(st, x, W, H, t) {
    if (!st.pv) {
      var r = C.rng(77), n = Math.round(60 * K);
      st.pv = []; for (var i = 0; i < n; i++) st.pv.push({ x: r() * W, y: r() * H, r: 0.6 + r() * 1.3, a: 0.1 + r() * 0.3, v: 5 + r() * 12, f: r() * 6.28 });
    }
    st.pv.forEach(function (p) {
      var py = ((p.y - t * p.v) % H + H) % H;
      x.fillStyle = 'rgba(215,225,255,' + (p.a * A * (0.5 + 0.5 * Math.sin(t * 1.5 + p.f))).toFixed(3) + ')';
      x.beginPath(); x.arc(p.x, py, p.r, 0, 6.2832); x.fill();
    });
  }

  // ---- Cortina: hebras de luz con paralaje + barrido ----
  function cortina(st, x, W, H, t) {
    if (!st.lin) {
      var r = C.rng(424242), mk = function (n, par, w0, w1, a0, a1, h0, h1) {
        var out = [], c = Math.round(n * K);
        for (var i = 0; i < c; i++) out.push({ x0: r() * (W + 380), w: C.lerp(w0, w1, r()), a: C.lerp(a0, a1, r()), h: C.lerp(h0, h1, r()) * H / 1080, yc: (480 + (r() - 0.5) * 260) * H / 1080, par: par, col: r() < 0.5 ? VIOLETA : r() < 0.7 ? CLARO : CIAN, f: r() * 6.28, fr: 0.4 + r() * 1.2 });
        return out;
      };
      st.lin = mk(10, 1.5, 36, 90, 0.03, 0.06, 520, 900).concat(mk(90, 0.35, 0.8, 1.6, 0.10, 0.28, 240, 600), mk(36, 0.7, 1.6, 3.2, 0.16, 0.40, 320, 740));
    }
    base(x, W, H, t);
    var D = t * 26, FR = W + 380, sx = (W + 300) - ((t + 2.2) % 6.5) / 6.5 * (W + 700);
    st.lin.forEach(function (L) {
      var X = ((L.x0 - D * L.par) % FR + FR) % FR - 190;
      var boost = 1 + 1.2 * Math.exp(-Math.pow(X - sx, 2) / 39200);
      var a = Math.min(1, L.a * A * (0.72 + 0.28 * Math.sin(t * L.fr + L.f)) * boost);
      var y0 = L.yc - L.h, y1 = L.yc + L.h, g = x.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, 'rgba(' + L.col + ',0)'); g.addColorStop(0.5, 'rgba(' + L.col + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + L.col + ',0)');
      x.fillStyle = g; x.fillRect(X - L.w / 2, y0, L.w, y1 - y0);
    });
    polvo(st, x, W, H, t);
  }

  // ---- Constelación: nodos unidos por líneas + paquetes de luz ----
  function constelacion(st, x, W, H, t) {
    if (!st.nod) {
      var r = C.rng(20260930), n = Math.round(70 * W * H / (1920 * 1080) * K + 18);
      st.nod = []; for (var i = 0; i < n; i++) st.nod.push({ x: r() * W, y: r() * H, ax: 16 + 36 * r(), ay: 16 + 36 * r(), fx: r() * 6.28, fy: r() * 6.28, s: 0.5 + 0.9 * r(), r: 1 + 1.8 * r(), g: r() < 0.12 });
      st.R = 220 * Math.max(W, H) / 1920 + 40;
      st.paq = []; for (var k = 0; k < 6; k++) st.paq.push({ i: Math.floor(r() * n), f: r(), v: 0.2 + 0.25 * r() });
    }
    base(x, W, H, t);
    var D = t / 3.2, R = st.R;
    var p = st.nod.map(function (n) { return { x: n.x + n.ax * Math.sin(D * n.s * 0.5 + n.fx), y: n.y + n.ay * Math.cos(D * n.s * 0.42 + n.fy), n: n }; });
    x.globalCompositeOperation = 'lighter'; x.lineWidth = 1;
    for (var i = 0; i < p.length; i++) for (var j = i + 1; j < p.length; j++) {
      var d = Math.hypot(p[i].x - p[j].x, p[i].y - p[j].y); if (d > R) continue;
      x.strokeStyle = 'rgba(' + AZUL + ',' + (0.2 * A * Math.pow(1 - d / R, 1.5)).toFixed(3) + ')';
      x.beginPath(); x.moveTo(p[i].x, p[i].y); x.lineTo(p[j].x, p[j].y); x.stroke();
    }
    st.paq.forEach(function (q) {
      var a = p[q.i], b = null, bd = R;
      p.forEach(function (o) { if (o === a) return; var d = Math.hypot(o.x - a.x, o.y - a.y); if (d < bd) { bd = d; b = o; } });
      if (!b) return;
      var u = (t * q.v + q.f) % 1;
      x.fillStyle = 'rgba(' + CIAN + ',' + (0.8 * A * Math.sin(Math.PI * u)).toFixed(3) + ')';
      x.beginPath(); x.arc(C.lerp(a.x, b.x, u), C.lerp(a.y, b.y, u), 2.4, 0, 6.2832); x.fill();
    });
    p.forEach(function (q) {
      var a = (0.45 + 0.55 * Math.pow(Math.sin(t * 0.9 + q.n.fx), 2)) * A;
      if (q.n.g) glow(x, q.x, q.y, 24, VIOLETA, 0.5 * a);
      x.fillStyle = 'rgba(' + (q.n.g ? CLARO : '220,228,255') + ',' + a.toFixed(3) + ')';
      x.beginPath(); x.arc(q.x, q.y, q.n.r * (q.n.g ? 1.5 : 1), 0, 6.2832); x.fill();
    });
    x.globalCompositeOperation = 'source-over';
  }

  // ---- Malla: líneas de relieve que ondulan ----
  function malla(st, x, W, H, t) {
    if (!st.pk) {
      var r = C.rng(31337);
      st.pk = []; for (var i = 0; i < 6; i++) st.pk.push({ x: 0.1 + 0.8 * r(), w: 0.05 + 0.09 * r(), a: 0.5 + r(), v: (r() - 0.5) * 0.7, f: r() * 6.28 });
    }
    base(x, W, H, t);
    var n = Math.round(22 * K + 8), top = H * 0.2, bot = H * 1.02, paso = (bot - top) / n, D = t / 8;
    for (var i = 0; i < n; i++) {
      var y0 = top + i * paso, prof = i / (n - 1), pts = [];
      for (var xx = -30; xx <= W + 30; xx += 16) {
        var u = xx / W, a = 0;
        st.pk.forEach(function (p) { var c = p.x + p.v * Math.sin(D * 0.7 + p.f); a += p.a * Math.exp(-Math.pow(u - c, 2) / (2 * p.w * p.w)); });
        a *= 0.55 + 0.45 * Math.sin(i * 0.55 + D * 1.3);
        a += 0.12 * Math.sin(u * 17 + i * 1.3 + D * 2.1);
        pts.push([xx, y0 - Math.max(0, a) * paso * 2.2]);
      }
      x.beginPath(); x.moveTo(pts[0][0], H + 10);
      pts.forEach(function (q) { x.lineTo(q[0], q[1]); });
      x.lineTo(pts[pts.length - 1][0], H + 10); x.closePath();
      x.fillStyle = 'rgba(13,3,38,.94)'; x.fill();
      x.beginPath(); pts.forEach(function (q, j) { j ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); });
      x.lineWidth = 1 + prof * 0.8;
      x.strokeStyle = 'rgba(' + (i % 5 === 0 ? VIOLETA : CLARO) + ',' + ((0.1 + 0.38 * prof) * A).toFixed(3) + ')'; x.stroke();
    }
  }

  // ---- Aurora: cintas de color suaves ----
  function aurora(st, x, W, H, t) {
    if (!st.cin) {
      var r = C.rng(9001), cols = [VIOLETA, CIAN, CLARO, AZUL];
      st.cin = []; for (var i = 0; i < 4; i++) st.cin.push({ col: cols[i], yc: 0.25 + 0.5 * (i + r() * 0.6) / 4, a1: 0.05 + 0.07 * r(), k1: 0.6 + r(), f1: r() * 6.28, v: (0.5 + 0.7 * r()) * (r() < 0.5 ? -1 : 1), g: 0.1 + 0.08 * r(), al: 0.2 + 0.14 * r() });
    }
    base(x, W, H, t);
    x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
    var D = t / 16;
    st.cin.forEach(function (c) {
      x.strokeStyle = 'rgba(' + c.col + ',' + (c.al * 0.35 * A).toFixed(3) + ')'; x.lineWidth = c.g * Math.min(W, H);
      x.beginPath();
      for (var i = 0; i <= 30; i++) { var u = i / 30, Y = (c.yc + c.a1 * Math.sin(c.k1 * u * 6.2832 + c.f1 + D * c.v)) * H; i ? x.lineTo(u * W, Y) : x.moveTo(0, Y); }
      x.stroke();
    });
    x.globalCompositeOperation = 'source-over';
    polvo(st, x, W, H, t);
  }

  function liso(st, x, W, H, t) { base(x, W, H, t); polvo(st, x, W, H, t); }

  var FONDOS = { cortina: cortina, constelacion: constelacion, malla: malla, aurora: aurora, liso: liso };

  // ---- Instancias + loop único ----
  var items = [], raf = 0, t0 = performance.now(), hidden = false;

  function mount(sec) {
    var fn = FONDOS[sec.getAttribute('data-cine')];
    if (!fn) return;
    var cv = document.createElement('canvas');
    cv.className = 'cine-canvas'; cv.setAttribute('aria-hidden', 'true');
    sec.insertBefore(cv, sec.firstChild);
    var it = { sec: sec, cv: cv, x: cv.getContext('2d'), fn: fn, st: {}, vis: false, W: 0, H: 0 };
    items.push(it);
    new IntersectionObserver(function (es) {
      it.vis = es[0].isIntersecting;
      if (it.vis) { sizeOne(it); cv.classList.add('is-on'); sec.classList.add('cine-activo'); loop(); }
    }, { rootMargin: '120px' }).observe(sec);
  }

  function sizeOne(it) {
    var w = it.sec.clientWidth, h = it.sec.clientHeight;
    if (w === it.W && h === it.H) return;
    it.W = w; it.H = h; it.st = {}; // regenerar partículas al cambiar tamaño
    it.cv.width = Math.round(w * DPR); it.cv.height = Math.round(h * DPR);
  }

  function frame(now) {
    raf = 0;
    var t = (now - t0) / 1000, any = false;
    items.forEach(function (it) {
      if (!it.vis) return;
      any = true;
      sizeOne(it);
      it.x.setTransform(DPR, 0, 0, DPR, 0, 0);
      it.fn(it.st, it.x, it.W, it.H, t);
    });
    if (any && !hidden) raf = requestAnimationFrame(frame);
  }
  function loop() { if (!raf && !hidden) raf = requestAnimationFrame(frame); }

  document.addEventListener('visibilitychange', function () {
    hidden = document.hidden;
    if (!hidden) loop();
  });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(loop, 150); }, { passive: true });

  function init() {
    if (!('IntersectionObserver' in window) || !document.createElement('canvas').getContext) return;
    document.querySelectorAll('[data-cine]').forEach(mount);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
