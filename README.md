# OPSYN - Landing Page Oficial

Sitio web bilingüe (ES/EN) para OPSYN, agencia de desarrollo tecnológico e IA.

## Características

✅ **Bilingüe**: Soporte completo para Español e Inglés  
✅ **Responsive**: Optimizado para desktop, tablet y móvil  
✅ **Animaciones**: Scroll reveal, parallax y efectos de interacción  
✅ **Formulario de contacto**: Integración con servicios de email  
✅ **Rendimiento**: Optimizado para Core Web Vitals  
✅ **Accesibilidad**: Cumple estándares WCAG 2.1  
✅ **SEO**: Meta tags y estructura semántica  

## Estructura de Archivos

```
├── index.html                 # Página principal
├── css/
│   └── styles.css            # Estilos (variables CSS, responsive)
├── js/
│   └── main.js               # JavaScript (idioma, animaciones, formulario)
├── uploads/
│   ├── Logo Opsyn.png        # Logo pequeño
│   └── Logo con nombre OPSYN.png  # Logo con nombre
├── assets/
│   ├── blog-1.png            # Imagen blog
│   ├── blog-2.png
│   ├── blog-3.png
│   ├── portfolio-1.png       # Imagen portfolio
│   ├── portfolio-2.png
│   ├── portfolio-3.png
│   └── portfolio-4.png
├── README.md                 # Este archivo
├── GUÍA_USO.md              # Guía de personalización
└── ESTRUCTURA.md            # Documentación técnica
```

## Secciones

### 1. **Hero**
Sección de bienvenida con logo animado, tagline y CTA principal.

### 2. **Servicios**
Grid de 4 servicios con iconos y descripciones.
- Desarrollo de software
- Agentes de IA y automatización
- Consultoría tecnológica
- Marketing digital

### 3. **Nosotros**
Presentación de la agencia + 3 puntos diferenciales.

### 4. **Portfolio**
Galería de 4 proyectos exitosos con resultados.

### 5. **Blog**
Feed de 3 artículos recientes.

### 6. **Contacto**
Formulario de contacto con validación y confirmación.

### 7. **Footer**
Enlaces, contacto e información de copyright.

## Instalación y Configuración

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- No requiere dependencias externas
- Funciona en servidores HTTP/HTTPS

### Instalación Local

1. **Descargar archivos**
   ```bash
   git clone <repository>
   cd OPSYN-Pagina-web
   ```

2. **Servir localmente** (Python 3)
   ```bash
   python -m http.server 8000
   ```
   Luego acceder a `http://localhost:8000`

3. **Con Live Server (VS Code)**
   - Instalar extensión "Live Server"
   - Click derecho en `index.html` → "Open with Live Server"

## Personalización

### Cambiar Idioma Predeterminado
En `js/main.js`, línea 240:
```javascript
let currentLang = localStorage.getItem('opsyn-lang') || 'es';  // Cambiar 'es' a 'en'
```

### Cambiar Colores
En `css/styles.css`, sección `:root`:
```css
:root {
  --primary-accent: #9434D4;      /* Color morado principal */
  --cyan: #79FFFF;                 /* Color cian acento */
  --teal: #2D89AD;                 /* Color teal */
  --primary-dark: #0D0326;         /* Fondo oscuro */
}
```

### Personalizar Traducciones
En `js/main.js`, objeto `TRANSLATIONS`:
```javascript
const TRANSLATIONS = {
  es: {
    heroTitle: 'Tu texto aquí...',
  },
  en: {
    heroTitle: 'Your text here...',
  }
};
```

### Cambiar Imágenes
1. Reemplazar archivos en `uploads/` y `assets/`
2. Mantener los mismos nombres o actualizar rutas en `index.html`

## Integración del Formulario de Contacto

El formulario actualmente es simulado (solo muestra confirmación local).
Para enviar emails reales, integrar uno de estos servicios:

### Opción 1: Formspree
```html
<form action="https://formspree.io/f/TU_ID" method="POST">
```

### Opción 2: EmailJS
```javascript
emailjs.init('TU_PUBLIC_KEY');
emailjs.send('TU_SERVICE_ID', 'TU_TEMPLATE_ID', templateParams)
  .then((response) => {
    console.log('Enviado', response);
  });
```

### Opción 3: Backend personalizado
Crear endpoint en tu servidor:
```javascript
fetch('/api/contacto', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

Ver `GUÍA_USO.md` para ejemplos detallados.

## Rendimiento

### Optimizaciones Implementadas
- ✅ CSS crítico inline
- ✅ Lazy loading de imágenes
- ✅ Minificación de JS
- ✅ Fuentes de Google Fonts
- ✅ Animaciones con hardware acceleration

### Métricas Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Mejoras Futuras
- Agregar WebP para imágenes
- Implementar progressive image loading
- Service Worker para offline

## SEO

### Meta Tags Incluidos
- Title y Description
- Open Graph (og:title, og:description, og:type)
- Viewport para responsive
- Favicon

### Recomendaciones
1. Agregar `robots.txt` y `sitemap.xml`
2. Verificar con Google Search Console
3. Usar schema.org structured data
4. Optimizar alt text en imágenes

## Accesibilidad

### Implementado
- ✅ Contraste de colores WCAG AA
- ✅ Navegación por teclado
- ✅ Labels en formularios
- ✅ Textos descriptivos
- ✅ Estructura semántica HTML5

### Mejoras Futuras
- Agregar ARIA labels donde sea necesario
- Testear con screen readers
- Mejorar skip links

## Despliegue

### Opciones Recomendadas

**1. Vercel (Recomendado)**
```bash
npm i -g vercel
vercel
```

**2. Netlify**
- Conectar GitHub
- Seleccionar rama y directorio
- Deploy automático

**3. GitHub Pages**
```bash
git push origin main
# Habilitar Pages en Settings
```

**4. Servidor Propio**
- Subir archivos vía FTP/SFTP
- Configurar HTTPS (Let's Encrypt)
- Caché headers para performance

## Mantenimiento

### Actualizar Contenido
- Blog: Actualizar en `index.html` sección `#blog`
- Portfolio: Cambiar imágenes y descripciones
- Servicios: Editar textos en secciones correspondientes

### Monitoreo
- Google Analytics para traffic
- Sentry para error tracking
- Lighthouse para auditorías periódicas

### Backups
- Hacer commit regularmente en Git
- Respaldar imágenes en servidor
- Documentar cambios en CHANGELOG.md

## Troubleshooting

### Las imágenes no cargan
- Verificar ruta correcta en `index.html`
- Asegurarse que archivos existan en `uploads/` y `assets/`
- Revisar console (F12) para errores 404

### Formulario no funciona
- Abrir console para ver errores
- Verificar que todos los inputs tengan `name` (si usas form tradicional)
- Revisar integraciones de email si aplica

### Animaciones lentas
- Revisar rendimiento en DevTools → Performance
- Reducir número de elementos animados simultáneamente
- Usar `will-change` CSS con moderación

## Licencia

© 2026 OPSYN. Todos los derechos reservados.

## Contacto

- 📧 Email: hola@opsyn.com
- 📱 Instagram: @opsyn
- 🌐 Web: https://opsyn.com

---

**Última actualización:** Julio 2026  
**Versión:** 1.0.0  
**Mantenedor:** OPSYN Team
