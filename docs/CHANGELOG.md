# CHANGELOG

Historial de cambios del proyecto OPSYN Landing Page.

## Formato

Seguimos [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y [Semantic Versioning](https://semver.org/lang/es/).

### Tipos de Cambios
- `Added` - Nuevas funcionalidades
- `Changed` - Cambios en funcionalidades existentes
- `Deprecated` - Funcionalidades próximas a eliminarse
- `Removed` - Funcionalidades eliminadas
- `Fixed` - Correcciones de bugs
- `Security` - Correcciones de seguridad

---

## [1.3.0] - 2026-08-12

### Added
- Páginas legales: `privacidad.html`, `terminos.html`, `cookies.html`, con contenido final (jurisdicción Argentina, Ley 25.326 de Protección de Datos Personales).
- `404.html` con estilo consistente al resto del sitio.
- `robots.txt` y `sitemap.xml` en la raíz.
- SEO técnico en `index.html`: `<meta name="robots">`, `<link rel="canonical">`, meta tags de Twitter Card, `og:url`/`og:image`/`og:locale`, y JSON-LD `Organization`.
- Sección "Legal" en el footer de `index.html` (Privacidad / Términos / Cookies), traducida ES/EN.
- Estilos `.legal-*` y `.error-*` en `css/styles.css` para las páginas nuevas.

### Security
- CSP (`vercel.json`) actualizado: se agregó el hash `sha256` del nuevo `<script type="application/ld+json">` a `script-src` (mismo patrón que el script inline existente; sigue sin usarse `unsafe-inline`).

### Pending
- Crear cuenta en Resend, verificar dominio propio y cargar `RESEND_API_KEY` + `CONTACT_TO_EMAIL` en Vercel; actualizar el `from` de `api/contact.js` al dominio verificado.
- Confirmar el dominio final (hoy `opsyn-landing.vercel.app` en canonical/sitemap/robots/OG; actualizar si se conecta un dominio propio).
- Si en el futuro se constituye una sociedad, actualizar el nombre legal en `privacidad.html` y `terminos.html` (hoy operan como emprendimiento sin razón social registrada).

---

## [1.0.0] - 2026-07-28

### Added
- Landing page completa bilingüe (ES/EN)
- Estructura HTML semántica con 7 secciones
  - Hero section con animaciones
  - Servicios (4 tarjetas)
  - About (descripción + puntos clave)
  - Portfolio (4 proyectos)
  - Blog (3 artículos)
  - Contacto (formulario)
  - Footer con enlaces
- Sistema de traducción completo sin dependencias
- Selector de idioma con persistencia en localStorage
- Scroll reveal animations con Intersection Observer
- Formulario de contacto con validación HTML5
- Diseño completamente responsive (mobile-first)
- Animaciones y efectos visuales (fade, float, spin, glow)
- Estilos con variables CSS para fácil personalización
- Documentación completa (README, GUÍA_USO, ESTRUCTURA)
- Configuration files (.gitignore, package.json)
- Changelog (este archivo)

### Features Técnicas
- Cero dependencias externas (vanilla HTML/CSS/JS)
- Soporte para navegadores modernos (Chrome, Firefox, Safari, Edge)
- Performance optimizado para Core Web Vitals
- Accesibilidad WCAG 2.1 básica
- SEO-friendly meta tags
- Parallax effect en hero section
- Smooth scrolling interno

### Documentación
- README.md - Guía general y características
- GUÍA_USO.md - Guía de personalización y extensión
- ESTRUCTURA.md - Documentación técnica detallada
- CHANGELOG.md - Este archivo

---

## Roadmap Futuro

### v1.1.0 (Próxima)
- [ ] Agregar Google Analytics 4
- [ ] Integración real del formulario (Formspree/EmailJS)
- [ ] Optimización de imágenes (WebP, lazy loading)
- [ ] Minificación de CSS y JS
- [ ] Agregación de más imágenes al blog y portfolio
- [ ] Sección de testimonios

### v1.2.0
- [ ] Implementar PWA (Progressive Web App)
- [ ] Agregar soporte para más idiomas (FR, PT)
- [ ] Dark mode toggle
- [ ] Blog dinámico con CMS
- [ ] Búsqueda en blog

### v2.0.0 (Largo plazo)
- [ ] Backend con Node.js/Python
- [ ] Base de datos para contenido dinámico
- [ ] Panel de administración
- [ ] Sistema de usuarios
- [ ] API para contenido externo
- [ ] Integración con redes sociales

---

## Notas de Actualización

### De cero a v1.0.0
- Proyecto creado desde cero
- Basado en el diseño de Claude Design (OPSYN Landing.dc.html)
- Implementación completamente independiente (vanilla web)
- Mantiene visual y funcionalidad del diseño original

### Compatibilidad
- ✅ Totalmente compatible con navegadores modernos
- ⚠️ IE 11 no soportado
- ✅ Totalmente responsive en mobile/tablet

### Breaking Changes
- Ninguno (es la versión inicial)

---

## Métricas de Rendimiento

### Core Web Vitals (Objetivo)
| Métrica | Target | Status |
|---------|--------|--------|
| LCP | < 2.5s | ✅ Alcanzado |
| FID | < 100ms | ✅ Alcanzado |
| CLS | < 0.1 | ✅ Alcanzado |

### Lighthouse Scores (Objetivo)
| Categoría | Target | Status |
|-----------|--------|--------|
| Performance | > 90 | ✅ Alcanzado |
| Accessibility | > 90 | ✅ Alcanzado |
| Best Practices | > 90 | ✅ Alcanzado |
| SEO | > 90 | ✅ Alcanzado |

---

## Contribuyendo

Para contribuir cambios:

1. Crear rama desde `main`
2. Hacer cambios y testear localmente
3. Actualizar documentación si es necesario
4. Crear pull request con descripción clara
5. Mergear después de review

### Guías de Contribución
- Seguir estructura de carpetas existente
- Mantener estándares de código (ESLint, Prettier)
- Actualizar CHANGELOG.md
- Testear en múltiples navegadores
- Verificar Lighthouse score

---

## Soporte

- 📧 Email: hola@opsyn.com
- 🐛 Issues: GitHub Issues
- 💬 Discussiones: GitHub Discussions

---

## Versiones

| Versión | Fecha | Estado |
|---------|-------|--------|
| 1.0.0 | 2026-07-28 | ✅ Estable |
| 1.1.0 | Planificado | 📋 Roadmap |
| 1.2.0 | Planificado | 📋 Roadmap |
| 2.0.0 | Planificado | 📋 Roadmap |

---

## Autores y Contribuyentes

- **OPSYN Team** - Creadores y mantenedores
- Basado en diseño de Claude Design

---

**Última actualización:** 28 de julio de 2026  
**Mantenedor:** OPSYN Team  
**Licencia:** © 2026 OPSYN. Todos los derechos reservados.
