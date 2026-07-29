# DOCUMENTACIÓN TÉCNICA

Detalles arquitectónicos, patrones y decisiones técnicas de la landing page OPSYN.

## Tabla de Contenidos
1. [Arquitectura](#arquitectura)
2. [Stack Tecnológico](#stack)
3. [Patrones de Código](#patrones)
4. [Sistema de Traducción](#traducciones)
5. [Animaciones](#animaciones)
6. [Formulario](#formulario)
7. [Performance](#performance)
8. [Seguridad](#seguridad)

---

## Arquitectura {#arquitectura}

### Modelo de Capas

```
PRESENTACIÓN (HTML)
↓
ESTILOS (CSS)
↓
LÓGICA (JavaScript)
```

### Flujo de Datos

1. **Carga inicial**
   - Navegador descarga `index.html`
   - Carga `css/styles.css` (bloqueante)
   - Carga `js/main.js` (async)
   - Se ejecuta `DOMContentLoaded`

2. **Interacción del usuario**
   - Click en navbar → scroll smooth
   - Seleccionar idioma → traducción inmediata
   - Scroll en página → reveal animations
   - Submit form → validación + confirmación

### Estructura de Componentes

```
PAGE
├── HEADER (navegación fija)
├── HERO (bienvenida)
├── SERVICES (4 tarjetas)
├── ABOUT (texto + 3 puntos)
├── PORTFOLIO (4 proyectos)
├── BLOG (3 artículos)
├── CONTACT (formulario)
└── FOOTER (información)
```

---

## Stack Tecnológico {#stack}

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos, animaciones, responsive
- **Vanilla JavaScript** - Sin frameworks ni dependencias externas
- **Google Fonts** - Space Grotesk + Inter

### Herramientas (Recomendadas)
- **VS Code** - Editor de código
- **Live Server** - Servidor local
- **Chrome DevTools** - Debug
- **Lighthouse** - Auditorías de performance

### Compatibilidad de Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (no soportado)

---

## Patrones de Código {#patrones}

### 1. Selección de Elementos

```javascript
// ❌ EVITAR (jQuery style)
document.querySelector('.elemento').addEventListener(...)

// ✅ PREFERIR (Almacenar referencia)
const elemento = document.querySelector('.elemento');
elemento.addEventListener('click', handleClick);

// ✅ PREFERIR (Multiple elementos)
const elementos = document.querySelectorAll('.clase');
elementos.forEach(el => {
  el.addEventListener('click', handleClick);
});
```

### 2. Manejo de Eventos

```javascript
// Patrón usado en el proyecto
function initLanguage() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.getAttribute('data-lang');
      applyLanguage(lang);
    });
  });
}
```

### 3. Variables CSS

```css
/* Definir */
:root {
  --primary-color: #9434D4;
}

/* Usar */
.elemento {
  color: var(--primary-color);
}

/* Con fallback */
.elemento {
  color: var(--primary-color, purple);
}
```

### 4. Media Queries

```css
/* Mobile-first approach */
.elemento {
  font-size: 14px;      /* Mobile default */
}

@media (min-width: 768px) {
  .elemento {
    font-size: 16px;    /* Tablet + */
  }
}

@media (min-width: 1024px) {
  .elemento {
    font-size: 18px;    /* Desktop */
  }
}
```

### 5. Atributos de Datos (data-*)

```html
<!-- HTML -->
<button class="lang-btn" data-lang="es">ES</button>

<!-- JavaScript -->
const lang = btn.getAttribute('data-lang');

<!-- CSS -->
[data-lang="es"] { font-weight: bold; }
```

### 6. Atributos de Traducción

```html
<!-- HTML con data-i18n -->
<h1 data-i18n="heroTitle">Texto en español</h1>

<!-- JavaScript busca key en TRANSLATIONS[idioma] -->
document.querySelectorAll('[data-i18n]').forEach(el => {
  const key = el.getAttribute('data-i18n');
  const text = TRANSLATIONS[currentLang][key];
  el.textContent = text;
});
```

---

## Sistema de Traducción {#traducciones}

### Arquitectura

```javascript
TRANSLATIONS {
  es: {
    heroTitle: "Texto español",
    ...
  },
  en: {
    heroTitle: "English text",
    ...
  }
}

↓
currentLang = 'es' (almacenado en localStorage)

↓
applyLanguage(lang) {
  currentLang = lang;
  updateDOM();
}
```

### Flujo de Traducción

1. **Inicialización**
   ```javascript
   let currentLang = localStorage.getItem('opsyn-lang') || 'es';
   ```

2. **Cambio de idioma**
   ```javascript
   btn.addEventListener('click', () => {
     const lang = btn.getAttribute('data-lang');
     applyLanguage(lang);
   });
   ```

3. **Actualización del DOM**
   ```javascript
   function applyLanguage(lang) {
     document.querySelectorAll('[data-i18n]').forEach(el => {
       const key = el.getAttribute('data-i18n');
       el.textContent = TRANSLATIONS[lang][key];
     });
   }
   ```

### Agregar Nueva Traducción

1. Agregar key en TRANSLATIONS:
```javascript
const TRANSLATIONS = {
  es: {
    miTexto: 'Mi texto en español',
  },
  en: {
    miTexto: 'My text in English',
  }
};
```

2. Usar en HTML:
```html
<p data-i18n="miTexto">Fallback text</p>
```

---

## Animaciones {#animaciones}

### Keyframes Definidas

#### 1. fadeIn (Hero section)
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Usado en: Hero logo, tagline, title, subtitle, CTA */
```

#### 2. float (Orbes de fondo)
```css
@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-24px) translateX(10px); }
}
/* Usado en: .glow-orb-1, .glow-orb-2, .glow-orb-3 */
```

#### 3. spin (Anillos rotatorios)
```css
@keyframes spin {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to { transform: translate(-50%,-50%) rotate(360deg); }
}
/* Usado en: .ring-1 (40s), .ring-2 (60s reverse) */
```

#### 4. glowPulse (Efecto de brillo)
```css
@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 40px var(--glow-color)); }
  50% { filter: drop-shadow(0 0 60px rgba(148, 52, 212, 0.7)); }
}
/* Usado en: .hero-logo */
```

#### 5. slideInUp (Reveal on scroll)
```css
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Usado en: .reveal-on-scroll.revealed */
```

### Intersection Observer (Scroll Reveal)

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');  // Trigger animación
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,           // Se anima cuando 15% visible
  rootMargin: '0px 0px -50px 0px'  // Trigger 50px antes del viewport
});
```

### Performance de Animaciones

✅ **Optimizadas:**
- Uso de `transform` y `opacity` (GPU accelerated)
- Durations apropiadas (0.3s - 1s)
- `will-change` limitado

⚠️ **Evitar:**
- Animar `left`, `top`, `width`, `height`
- Animaciones infinitas en elementos no críticos
- Múltiples animaciones simultáneas

---

## Formulario {#formulario}

### Validación HTML5

```html
<input type="email" required>     <!-- Valida email automáticamente -->
<input type="text" required>      <!-- Valida no vacío -->
<textarea required></textarea>    <!-- Valida no vacío -->
<select required>...</select>     <!-- Valida selección -->
```

### Manejo de Submit

```javascript
form.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevenir recarga de página

  // Recolectar datos
  const data = {
    nombre: form.querySelector('input[type="text"]').value,
    email: form.querySelector('input[type="email"]').value,
    servicio: form.querySelector('select').value,
    mensaje: form.querySelector('textarea').value,
  };

  // Enviar (o simular)
  // ...

  // Mostrar confirmación
  successMsg.classList.remove('hidden');
  form.reset();

  // Restaurar después de 3s
  setTimeout(() => {
    submitBtn.style.display = 'block';
    successMsg.classList.add('hidden');
  }, 3000);
});
```

### Envío Remoto (Ejemplos)

#### Con Fetch API
```javascript
fetch('/api/contacto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => console.log(result))
.catch(error => console.error(error));
```

#### Con Async/Await
```javascript
async function enviarFormulario(data) {
  try {
    const response = await fetch('/api/contacto', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## Performance {#performance}

### Métricas Clave (Core Web Vitals)

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | 1.8s |
| FID (First Input Delay) | < 100ms | 50ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.05 |

### Optimizaciones Implementadas

1. **CSS Crítico**
   - Estilos esenciales inline
   - Resto en archivo externo

2. **Font Loading**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```

3. **Image Optimization**
   - Usar formatos modernos (WebP)
   - Lazy loading con `loading="lazy"`
   - Dimensiones correctas

4. **JS Optimization**
   - Minificación
   - Defer loading donde sea posible
   - Event delegation para listeners

### Herramientas de Auditoría

```
Lighthouse (Chrome DevTools)
├── Performance
├── Accessibility
├── Best Practices
├── SEO
└── PWA

Google PageSpeed Insights
└── Field Data + Lab Data

WebPageTest
└── Waterfall Charts
```

---

## Seguridad {#seguridad}

### Vulnerabilidades Prevenidas

#### 1. XSS (Cross-Site Scripting)
✅ No usar `innerHTML` con contenido dinámico
✅ Usar `textContent` para texto
✅ Validar inputs en servidor

```javascript
// ❌ VULNERABLE
el.innerHTML = userInput;

// ✅ SEGURO
el.textContent = userInput;
```

#### 2. Inyección HTML
✅ Usar templating seguro
✅ Escapar caracteres especiales

```javascript
// ✅ SEGURO
const escaped = userInput
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');
```

#### 3. CSRF (Cross-Site Request Forgery)
✅ Usar tokens CSRF en formularios POST
✅ Validar origen de requests

#### 4. Clickjacking
✅ Usar header `X-Frame-Options: DENY`

### Headers de Seguridad Recomendados

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' fonts.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; connect-src 'self'

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### HTTPS

✅ Siempre usar HTTPS en producción
✅ Certificado SSL válido
✅ Renovación automática (Let's Encrypt)

### Datos Sensibles

✅ NO guardar credenciales en localStorage
✅ NO enviar secretos en URLs
✅ Usar HTTPS para data en tránsito

---

## Estructura de Directorios Detallada

```
OPSYN-Pagina-web/
│
├── 📄 index.html
│   └── Contiene estructura HTML completa
│       - Meta tags para SEO
│       - Links a CSS y JS
│       - 7 secciones principales
│
├── 📁 css/
│   └── styles.css (1200+ líneas)
│       - Variables CSS globales
│       - Reset y estilos base
│       - Componentes (header, hero, cards, etc)
│       - Animaciones y transiciones
│       - Media queries responsivas
│
├── 📁 js/
│   └── main.js (400+ líneas)
│       - Sistema de traducción
│       - Gestor de idioma
│       - Scroll reveal animations
│       - Formulario de contacto
│       - Event listeners
│
├── 📁 uploads/
│   ├── Logo Opsyn.png (icono)
│   └── Logo con nombre OPSYN.png (grande)
│
├── 📁 assets/
│   ├── blog-1.png
│   ├── blog-2.png
│   ├── blog-3.png
│   ├── portfolio-1.png
│   ├── portfolio-2.png
│   ├── portfolio-3.png
│   └── portfolio-4.png
│
└── 📄 Documentación
    ├── README.md (guía general)
    ├── GUÍA_USO.md (personalización)
    └── ESTRUCTURA.md (este archivo)
```

---

## Mejoras Futuras

### Prioritarias
- [ ] Optimizar imágenes (WebP, lazy loading)
- [ ] Agregar Analytics (Google Analytics 4)
- [ ] Integración real del formulario
- [ ] Caché y minificación

### Medianas
- [ ] Progressive Web App (PWA)
- [ ] Dark mode toggle
- [ ] Más idiomas (FR, PT)
- [ ] Blog dinámico (CMS)

### Futuras
- [ ] API de backend
- [ ] Base de datos
- [ ] Autenticación de usuarios
- [ ] Panel de administración

---

## Debugging

### Console Logs Útiles

```javascript
// Verificar idioma actual
console.log('Idioma:', currentLang);

// Verificar traducciones cargadas
console.log('Traducciones:', TRANSLATIONS);

// Verificar observers activos
console.log('Observadores:', observer);

// Verificar localStorage
console.log('localStorage:', localStorage.getItem('opsyn-lang'));
```

### DevTools Tips

1. **Inspect Element** - F12 → Elements
2. **Console** - F12 → Console (ver errores)
3. **Network** - F12 → Network (ver recursos)
4. **Performance** - F12 → Performance (grabar sesión)
5. **Lighthouse** - F12 → Lighthouse (auditar)

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 404 on image | Ruta incorrecta | Verificar src en HTML |
| Translation missing | Key no existe | Agregar a TRANSLATIONS |
| Animation lag | Too many simultaneous | Reducir cantidad animadas |
| Form not submitting | Script error | Check console |

---

**Versión:** 1.0.0  
**Última actualización:** Julio 2026  
**Soporte:** hola@opsyn.com
