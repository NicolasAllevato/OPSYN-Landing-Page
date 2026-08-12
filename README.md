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
├── privacidad.html             # Política de Privacidad
├── terminos.html                # Términos y Condiciones
├── cookies.html                 # Política de Cookies
├── 404.html                     # Página de error 404
├── robots.txt                   # Directivas para crawlers
├── sitemap.xml                  # Mapa del sitio
├── css/
│   └── styles.css            # Estilos (variables CSS, responsive)
├── js/
│   ├── main.js                # JavaScript (idioma, animaciones, formulario)
│   └── assets.js              # Configuración del CDN de imágenes (R2, hoy inactivo)
├── api/
│   └── contact.js             # Backend del formulario (Vercel Function + Resend)
├── assets/                     # Logos e imágenes optimizados (WebP/PNG)
├── Logo Opsyn.png               # Logo original (fuente de las variantes optimizadas)
├── Logo con nombre OPSYN.png    # Logo original con nombre
├── vercel.json                  # Config de hosting + cabeceras de seguridad (CSP, HSTS, etc.)
├── README.md                 # Este archivo
├── GUÍA_USO.md              # Guía de personalización
├── ESTRUCTURA.md             # Documentación técnica
└── CHANGELOG.md               # Historial de cambios
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

El formulario ya está integrado con un backend real: `js/main.js` hace `fetch` a `/api/contact`, una Vercel Serverless Function (`api/contact.js`) que valida los datos, aplica honeypot y rate limit (5 envíos / 15 min por IP), y envía el email vía **Resend** (API REST nativa, sin SDK).

Para que funcione en producción falta:
1. Crear cuenta en [Resend](https://resend.com) y verificar un dominio propio de envío (Resend no permite enviar desde dominios de terceros como `gmail.com`; se necesita un dominio propio con los registros DNS verificados).
2. Cargar `RESEND_API_KEY` en Vercel → Project Settings → Environment Variables (ver `.env.example`).
3. Cargar `CONTACT_TO_EMAIL=opsyn.soluciones@gmail.com` en las mismas Environment Variables — esa es la casilla que **recibe** los mensajes del formulario, no requiere verificación de dominio.
4. Una vez verificado el dominio en Resend, actualizar el `from` en `api/contact.js` (hoy `contacto@opsyn.dev`, placeholder) por `algo@<tu-dominio-verificado>`.

Ver `api/README.md` para el detalle del endpoint.

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
- Title, Description, Keywords y `<meta name="robots">`
- `<link rel="canonical">`
- Open Graph (og:title, og:description, og:type, og:url, og:image, og:locale)
- Twitter Card
- JSON-LD `Organization` (schema.org)
- Viewport para responsive
- Favicon
- `robots.txt` y `sitemap.xml` en la raíz

### Pendiente
1. Verificar con Google Search Console una vez que el dominio final esté conectado.
2. Actualizar `opsyn-landing.vercel.app` por el dominio propio (`opsyn.com`) en `index.html`, `robots.txt` y `sitemap.xml` cuando esté configurado.
3. Optimizar alt text en imágenes de portfolio/blog.

## Legal

El sitio incluye `privacidad.html`, `terminos.html` y `cookies.html`, enlazadas desde el footer. Contenido completo: jurisdicción Argentina, Ley 25.326 de Protección de Datos Personales. OPSYN opera hoy como emprendimiento sin razón social registrada; si en el futuro se constituye una sociedad, actualizar el nombre legal en `privacidad.html` y `terminos.html`.

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

**Última actualización:** Agosto 2026  
**Versión:** 1.3.0  
**Mantenedor:** OPSYN Team
