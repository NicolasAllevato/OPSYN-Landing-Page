# Imágenes 3D — Rediseño OPSYN (Fase 3)

Este documento lista los assets de imagen 3D que se generarán en la Fase 3 (requiere OK del usuario). Todos los slots ya están en el HTML/CSS con fallback visual (ícono SVG o gradiente) si el archivo todavía no existe o falla la carga.

## Hero y compartir en redes

El hero usa `logo-opsyn-icon-880.webp` existente como textura 3D (sin asset nuevo). Falta solo la imagen para compartir en redes, que hoy reusa el logo:

| Archivo | Tamaño | Uso | Prompt (inglés) |
|---|---|---|---|
| `assets/3d/og-image.webp` | 1200×630 | `og:image`/`twitter:image` (reemplaza el logo reusado en `index.html:15,20`) | 3D glass/neon rendering of the OPSYN impossible-triangle logo (lion, fish, cosmic swirl) floating in a dark cosmic scene, violet #9434D4 + cyan #79FFFF aurora glow, dark #0D0326 background, soft studio lighting, isometric, centered, wide 1200x630 composition with clean space for a headline overlay |

## Servicios (`css/sections/services.css`, `js/sections/services.js`)

| Archivo | Tamaño | Uso | Prompt (inglés) |
|---|---|---|---|
| `assets/3d/servicio-software.webp` | 160×160 | Card "Desarrollo de software" | 3D glass icon of interlocking code brackets `</>`, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/servicio-agentes-ia.webp` | 160×160 | Card "Agentes de IA y automatización" | 3D glass/neon robot chat bubble with circuit patterns, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/servicio-consultoria.webp` | 160×160 | Card "Consultoría tecnológica" | 3D glass compass or target icon glowing, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/servicio-marketing.webp` | 160×160 | Card "Marketing digital" | 3D glass megaphone with growth arrow, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |

## Ítems de servicio (acordeón, `data/service-items.json`)

| Archivo | Tamaño | Uso | Prompt (inglés) |
|---|---|---|---|
| `assets/3d/item-crm-personalizados.webp` | 48×48 | Ítem "CRM Personalizados" | 3D glass database/CRM icon with connected nodes, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/item-agente-soporte.webp` | 48×48 | Ítem "Agente de soporte" | 3D glass headset/chat icon, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/item-agente-ventas.webp` | 48×48 | Ítem "Agente de ventas" | 3D glass handshake/growth chart icon, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/item-agente-automatizacion-interna.webp` | 48×48 | Ítem "Automatización interna" | 3D glass gear/workflow connector icon, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/item-asistente-personal.webp` | 48×48 | Ítem "Asistente personal" | 3D glass calendar/assistant icon, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/item-armado-de-base-de-datos.webp` | 48×48 | Ítem "Armado de base de datos" | 3D glass server rack/database stack icon, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |

## Portfolio (`css/sections/portfolio.css`, `js/sections/portfolio.js`)

| Archivo | Tamaño | Uso | Prompt (inglés) |
|---|---|---|---|
| `assets/3d/portfolio-1.webp` | 200×140 | Caso "Proyecto E-commerce" | 3D glass shopping cart with upward arrow, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/portfolio-2.webp` | 200×140 | Caso "Agente IA de soporte" | 3D glass chat bubble with clock/speed lines, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/portfolio-3.webp` | 200×140 | Caso "App de gestión interna" | 3D glass dashboard/mobile app mockup, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |
| `assets/3d/portfolio-4.webp` | 200×140 | Caso "Rebranding + redes" | 3D glass social media icons cluster with brand palette, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |

## Cómo lo hacemos + Nosotros (`css/sections/process.css`, `css/sections/about.css`, `js/sections/process.js`)

Slots con fallback CSS (`.img-slot`, gradiente + marco) activado vía JS (`js/sections/process.js`, `initImgSlotFallbacks`) si el archivo falta.

| Archivo | Tamaño | Uso | Prompt (inglés) |
|---|---|---|---|
| `assets/3d/proceso-idea.webp` | 240×240 (mostrado a 72×72, subir @2–3x) | Ícono/render 3D del paso 1 "Idea" en la tarjeta de proceso | 3D glass/neon icon of a glowing lightbulb or spark made of translucent violet and cyan glass, violet #9434D4 + cyan #79FFFF accents, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal, centered composition |
| `assets/3d/proceso-proyecto.webp` | 240×240 | Ícono/render 3D del paso 2 "Proyecto" | 3D glass/neon icon of interlocking geometric building blocks or a blueprint taking shape, translucent violet and cyan glass material, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal, centered composition |
| `assets/3d/proceso-solucion.webp` | 240×240 | Ícono/render 3D del paso 3 "Solución" | 3D glass/neon icon of a glowing checkmark or a rocket/gear in motion, translucent violet and cyan glass material, violet #9434D4 + cyan #79FFFF, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal, centered composition |
| `assets/3d/nosotros.webp` | 640×640 (mostrado hasta 320×320, subir @2x) | Visual principal de la sección "Nosotros" | 3D glass/neon abstract sculpture representing partnership and craftsmanship — two intertwined translucent glass shapes forming a handshake or connected nodes, violet #9434D4 + cyan #79FFFF glow, dark #0D0326 background or transparent, soft studio lighting, isometric, minimal |

Notas: `loading="lazy"` en las tres (no son hero), `width`/`height` fijos para evitar layout shift, `alt=""` porque son decorativas.
