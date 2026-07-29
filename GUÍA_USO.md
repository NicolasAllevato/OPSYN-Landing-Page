# GUÍA DE USO Y PERSONALIZACIÓN

Guía completa para personalizar y mantener la landing page de OPSYN.

## Tabla de Contenidos
1. [Estructura del Proyecto](#estructura)
2. [Personalización de Contenido](#contenido)
3. [Cambio de Colores y Diseño](#diseño)
4. [Integración del Formulario](#formulario)
5. [Agregar Nuevas Secciones](#secciones)
6. [Optimización y Performance](#performance)

---

## Estructura del Proyecto {#estructura}

### Jerarquía de Carpetas

```
OPSYN-Pagina-web/
├── index.html              (Página principal - TODO el contenido)
├── css/
│   └── styles.css          (Estilos globales y responsive)
├── js/
│   └── main.js             (Lógica de JS, traducciones, eventos)
├── uploads/
│   ├── Logo Opsyn.png      (40x40px - Header y footer)
│   └── Logo con nombre OPSYN.png  (220px - Hero)
├── assets/
│   ├── blog-1.png          (Imágenes del blog)
│   ├── blog-2.png
│   ├── blog-3.png
│   ├── portfolio-1.png     (Imágenes del portfolio)
│   ├── portfolio-2.png
│   ├── portfolio-3.png
│   └── portfolio-4.png
├── README.md               (Info general)
├── GUÍA_USO.md            (Este archivo)
└── ESTRUCTURA.md          (Documentación técnica)
```

### Archivos Principales

**index.html**
- Contiene estructura HTML completa
- Usa atributos `data-i18n` para traducciones
- Referencias a archivos CSS y JS externos
- Comentarios HTML para identificar secciones

**css/styles.css**
- Variables CSS (colores, fuentes, animaciones)
- Estilos responsive (mobile-first)
- Media queries para diferentes tamaños
- Animaciones keyframes reutilizables

**js/main.js**
- Sistema de idioma/traducción
- Manejo de eventos
- Intersection Observer para reveal on scroll
- Validación y envío de formulario

---

## Personalización de Contenido {#contenido}

### 1. Cambiar Título y Descripción de la Página

En `index.html`, dentro de `<head>`:

```html
<title>OPSYN - Tu nuevo título aquí</title>
<meta name="description" content="Tu descripción para SEO">
<meta property="og:title" content="Nuevo título">
<meta property="og:description" content="Nueva descripción">
```

### 2. Cambiar Logos

**Opción A: Reemplazar archivos**
1. Ir a carpeta `uploads/`
2. Reemplazar:
   - `Logo Opsyn.png` (40x40px)
   - `Logo con nombre OPSYN.png` (220px)
3. Mantener los mismos nombres

**Opción B: Cambiar rutas en HTML**
```html
<!-- En el header -->
<img src="./ruta/nuevo-logo.png" alt="OPSYN">

<!-- En el hero -->
<img src="./ruta/nuevo-logo-grande.png" alt="OPSYN">

<!-- En el footer -->
<img src="./ruta/nuevo-logo.png" alt="OPSYN">
```

### 3. Actualizar Texto de Secciones

**Método 1: Editar HTML directamente**

Buscar la sección en `index.html` y cambiar el texto entre las etiquetas `{{ }}` o `<h2>`, `<p>`, etc.

Ejemplo:
```html
<!-- ANTES -->
<h1 class="hero-title fade-in" data-i18n="heroTitle">
  Pensamos tu negocio antes de programar...
</h1>

<!-- DESPUÉS -->
<h1 class="hero-title fade-in" data-i18n="heroTitle">
  Tu nuevo título aquí
</h1>
```

**Método 2: Cambiar traducciones en JS**

En `js/main.js`, encontrar objeto `TRANSLATIONS`:

```javascript
const TRANSLATIONS = {
  es: {
    heroTitle: 'Tu nuevo título en español',
    heroCta: 'Mi botón personalizado',
    // ... más traducciones
  },
  en: {
    heroTitle: 'Your new title in English',
    heroCta: 'My custom button',
    // ... más traducciones
  }
};
```

### 4. Cambiar Información de Contacto

En `index.html`, buscar sección footer:

```html
<!-- Email -->
<a href="mailto:tu-email@domain.com">tu-email@domain.com</a>

<!-- Instagram -->
<a href="https://instagram.com/tu-usuario" target="_blank">Instagram</a>

<!-- Teléfono (si quieres agregar) -->
<a href="tel:+54-11-1234-5678">+54 11 1234-5678</a>
```

### 5. Actualizar Portfolio

**HTML en sección #portfolio:**

```html
<div class="portfolio-card reveal-on-scroll">
  <div class="portfolio-image">
    <img src="./assets/portfolio-1.png" alt="Mi Proyecto">
  </div>
  <div class="portfolio-info">
    <h3>Nombre del Proyecto</h3>
    <p>Resultado: +50% en métrica importante</p>
  </div>
</div>
```

### 6. Actualizar Blog

**Agregar nuevo artículo:**

```html
<div class="blog-card reveal-on-scroll">
  <div class="blog-image">
    <img src="./assets/blog-4.png" alt="Nuevo artículo">
  </div>
  <div class="blog-info">
    <span class="blog-date">15 ago 2026</span>
    <h3>Título del Artículo</h3>
    <p>Resumen breve del contenido...</p>
  </div>
</div>
```

### 7. Cambiar Servicios

En sección #servicios, editar cards:

```html
<div class="service-card reveal-on-scroll">
  <div class="service-icon">⚙️</div>  <!-- Cambiar emoji -->
  <h3>Nuevo Servicio</h3>
  <p>Descripción del servicio...</p>
</div>
```

---

## Cambio de Colores y Diseño {#diseño}

### Variables CSS Principales

En `css/styles.css`, sección `:root`:

```css
:root {
  /* Colores principales */
  --primary-dark: #0D0326;          /* Fondo oscuro */
  --primary-accent: #9434D4;        /* Morado (botones, acentos) */
  --secondary-accent: #5A1CA1;      /* Morado oscuro (gradientes) */
  --cyan: #79FFFF;                  /* Cyan (links, acentos) */
  --teal: #2D89AD;                  /* Teal (líneas de circuito) */

  /* Colores de texto */
  --text-light: #FFFFFF;            /* Texto blanco */
  --text-muted: rgba(255, 255, 255, 0.75);      /* Texto con opacidad */
  --text-subtle: rgba(255, 255, 255, 0.6);      /* Texto más sutil */

  /* Otros */
  --border-color: rgba(148, 52, 212, 0.25);     /* Color de bordes */
  --glow-color: rgba(148, 52, 212, 0.45);       /* Color de glow/sombra */
}
```

### Cambiar Esquema de Color Completo

**Ej: De morado a azul**

```css
:root {
  --primary-dark: #0A1628;          /* Azul muy oscuro */
  --primary-accent: #0066FF;        /* Azul brillante */
  --secondary-accent: #0052CC;      /* Azul oscuro */
  --cyan: #00D4FF;                  /* Cyan azulado */
  --teal: #2DB8D4;                  /* Teal azulado */
}
```

### Cambiar Fuentes

En `index.html`, sección `<head>`:

```html
<!-- ANTES (Space Grotesk e Inter) -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<!-- DESPUÉS (ej: Poppins) -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Luego en CSS:
```css
:root {
  --font-primary: 'Poppins', sans-serif;    /* Cambiar */
  --font-secondary: 'Poppins', sans-serif;  /* Cambiar */
}
```

### Cambiar Tamaños de Fuente

En `css/styles.css`:

```css
/* Hero título */
.hero-title {
  font-size: clamp(22px, 3.6vw, 36px);  /* min, preferido, max */
}

/* Subtítulos de secciones */
.section-title {
  font-size: clamp(22px, 3.2vw, 30px);
}
```

### Agregar/Cambiar Animaciones

En `css/styles.css`, sección `@keyframes`:

```css
@keyframes miAnimacion {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Usar en elemento */
.mi-elemento {
  animation: miAnimacion 0.6s ease forwards;
}
```

---

## Integración del Formulario {#formulario}

El formulario actualmente funciona **localmente** (muestra confirmación sin enviar).

### Opción 1: Formspree (Recomendada - Más Simple)

1. Ir a https://formspree.io
2. Crear cuenta y proyecto
3. Copiar ID del formulario
4. En `index.html`, cambiar:

```html
<!-- ANTES -->
<form class="contact-form" id="contactForm">

<!-- DESPUÉS -->
<form action="https://formspree.io/f/TU_ID_AQUI" method="POST" class="contact-form" id="contactForm">
```

5. Agregar atributo `name` a inputs:

```html
<input type="text" placeholder="Nombre" name="nombre" required>
<input type="email" placeholder="Email" name="email" required>
<select name="servicio" required>...</select>
<textarea placeholder="Mensaje" name="mensaje" required></textarea>
```

### Opción 2: EmailJS (JavaScript)

1. Ir a https://www.emailjs.com
2. Crear cuenta y servicio de email
3. Copiar: `PUBLIC_KEY`, `SERVICE_ID`, `TEMPLATE_ID`
4. Agregar script en `index.html`:

```html
<script type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/index.min.js">
</script>
```

5. En `js/main.js`, dentro de `initContactForm()`:

```javascript
function initContactForm() {
  emailjs.init('TU_PUBLIC_KEY');

  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const templateParams = {
      nombre: form.querySelector('input[type="text"]').value,
      email: form.querySelector('input[type="email"]').value,
      servicio: form.querySelector('select').value,
      mensaje: form.querySelector('textarea').value,
    };

    emailjs.send('TU_SERVICE_ID', 'TU_TEMPLATE_ID', templateParams)
      .then(() => {
        // Mostrar éxito
        form.querySelector('.form-success').classList.remove('hidden');
        form.reset();
      })
      .catch(error => console.error('Error:', error));
  });
}
```

### Opción 3: Backend Personalizado

Crear endpoint en tu servidor (`/api/contacto`):

En `js/main.js`:

```javascript
function initContactForm() {
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      nombre: form.querySelector('input[type="text"]').value,
      email: form.querySelector('input[type="email"]').value,
      servicio: form.querySelector('select').value,
      mensaje: form.querySelector('textarea').value,
    };

    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        form.querySelector('.form-success').classList.remove('hidden');
        form.reset();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
}
```

---

## Agregar Nuevas Secciones {#secciones}

### Ejemplo: Agregar Sección de "Testimonios"

1. **En `index.html`, agregar la sección:**

```html
<!-- TESTIMONIOS (antes del footer) -->
<section id="testimonios" class="testimonials">
  <div class="section-header">
    <p class="section-label" data-i18n="testimonialsLabel">Testimonios</p>
    <h2 class="section-title" data-i18n="testimonialsTitle">Qué dicen nuestros clientes</h2>
  </div>

  <div class="testimonials-grid">
    <div class="testimonial-card reveal-on-scroll">
      <p class="testimonial-text">"Trabajar con OPSYN fue transformador para nuestro negocio..."</p>
      <p class="testimonial-author">- Juan Pérez, CEO</p>
    </div>
    <!-- Más testimonios... -->
  </div>
</section>
```

2. **En `js/main.js`, agregar traducciones:**

```javascript
const TRANSLATIONS = {
  es: {
    // ... existentes
    testimonialsLabel: 'Testimonios',
    testimonialsTitle: 'Qué dicen nuestros clientes',
  },
  en: {
    // ... existentes
    testimonialsLabel: 'Testimonials',
    testimonialsTitle: 'What our clients say',
  }
};
```

3. **En `css/styles.css`, agregar estilos:**

```css
/* TESTIMONIOS */
.testimonials {
  padding: 56px 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.testimonial-card {
  border: 1px solid rgba(148, 52, 212, 0.3);
  border-radius: 12px;
  padding: 20px;
  background: rgba(56, 19, 124, 0.15);
  transition: var(--transition);
}

.testimonial-card:hover {
  border-color: var(--primary-accent);
  box-shadow: 0 0 24px rgba(148, 52, 212, 0.25);
}

.testimonial-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.testimonial-author {
  font-size: 12px;
  color: var(--cyan);
  font-weight: 600;
  margin: 0;
}
```

---

## Optimización y Performance {#performance}

### Métricas a Monitorear

1. **Lighthouse (Chrome DevTools)**
   - F12 → Lighthouse
   - Ejecutar auditoría
   - Objetivo: 90+ en todas las categorías

2. **Google PageSpeed Insights**
   - https://pagespeed.web.dev
   - Analizar URL en vivo

### Optimizaciones Básicas Implementadas

✅ Animaciones con `transform` y `opacity`  
✅ Lazy loading de imágenes (agregar después)  
✅ CSS crítico inline  
✅ Fuentes optimizadas  
✅ Minificación recomendada  

### Mejoras Adicionales

**1. Lazy Loading de Imágenes**

Cambiar:
```html
<img src="./assets/portfolio-1.png" alt="Proyecto">
```

Por:
```html
<img src="./assets/portfolio-1.png" alt="Proyecto" loading="lazy">
```

**2. WebP para Imágenes (Futuro)**

```html
<picture>
  <source srcset="./assets/portfolio-1.webp" type="image/webp">
  <img src="./assets/portfolio-1.png" alt="Proyecto">
</picture>
```

**3. Minificar CSS y JS**

Usar herramientas online:
- CSS: https://cssnano.co
- JS: https://www.minifycode.com/javascript-minifier/

### Checklist de Optimización

- [ ] Todas las imágenes < 100KB (usar TinyPNG)
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals verde
- [ ] Sin console errors
- [ ] Sin console warnings
- [ ] Formulario funcional
- [ ] Responsive en mobile
- [ ] Traducciones completas
- [ ] Links internos funcionan

---

## Tips y Mejores Prácticas

✨ **Mantener estructura HTML limpia** - Facilita mantenimiento  
✨ **Usar variables CSS** - Cambiar colores es trivial  
✨ **Comentar cambios** - En commit o changelog  
✨ **Testear en mobile** - Antes de publicar  
✨ **Respaldar cambios** - En Git o backup  
✨ **Monitorear performance** - Regularmente  
✨ **Actualizar contenido** - Periodicamente para SEO  

---

**Última actualización:** Julio 2026  
**Para soporte:** hola@opsyn.com
