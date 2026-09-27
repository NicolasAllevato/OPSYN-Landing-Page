# Auditoría UX de la landing OPSYN y propuesta de rediseño

Fecha: 26 sep 2026. Alcance: `index.html`, `css/styles.css`, `js/main.js` y `docs/prompt-web-opsyn.txt`.

## 0. Cómo leer este informe

- Es un análisis estático del código, sin render real y sin tests con usuarios. Lo que dependía de ver la página en pantalla figura como "estimado" o "verificar".
- No leí `js/service-items.js`, `js/assets.js` ni `js/cookie-consent.js`. Lo que digo del acordeón de servicios sale solo del HTML y del CSS.
- Los contrastes están calculados con la fórmula WCAG 2.1 sobre el fondo `#0D0326` (luminancia relativa ~0.0029). Los valores de las tarjetas son aproximados.
- Restricción respetada: no se propone tocar marca, logo, paleta base ni tagline. Los cambios son de jerarquía, tipografía, orden, copy de apoyo y comportamiento.
- Se mantiene el voseo ("contanos", "vos") porque es el que usa el sitio hoy. El brief original dice "tú a tú", pero el sitio ya es rioplatense y cambiarlo sería un cambio de tono.

Lo que ya está bien y no hay que tocar:

- Paleta con buen contraste base: el texto blanco al 75 % da ~11:1, el cian `#79FFFF` da ~16.6:1 y el blanco sobre `#9434D4` da 5.68:1.
- Skip-link, `prefers-reduced-motion` global, honeypot, `aria-live` en el feedback y objetivos táctiles de 44 px en nav, idioma y submit.
- Métricas de portfolio como número grande en lugar de capturas.
- `scroll-margin-top` y menú móvil con `aria-expanded`.

---

## 1. Jerarquía visual y flujo de conversión por sección

### Flujo actual

Hero → Servicios → Nosotros → Portfolio → Blog → Contacto (formulario).

Un único CTA lleva al formulario y está en el hero. Después el visitante recorre cuatro secciones sin ninguna invitación a actuar, y la que está justo antes del formulario es el Blog, que es la menos comercial. La conversión depende de que la persona recuerde el botón del hero.

### Hero

Problemas:

1. **La frase que define a la marca es el texto más chico y flojo.** El tagline ("somos una idea, somos un proyecto, somos la solución para vos") va en 14 px (`--fs-sm`), cian, y queda encima del H1. Se lee como una nota al pie y compite con el H1 en vez de sostenerlo.
2. **El H1 es chico para un hero de 100vh.** Usa `clamp(22px, 3.6vw, 36px)`, con un máximo de 36 px. Son unas 13 palabras (~80 caracteres) en 2 o 3 líneas. Los tokens `--fs-2xl` (36 a 56 px) y `--fs-xl` existen y no se usan acá.
3. **Subtítulo de 14 px (13 px en móvil).** Es el párrafo que explica la propuesta y es el texto de lectura más chico de la página. Debería ir en 16 a 18 px.
4. **El logo (220 px) ocupa ~200 px de alto antes del primer texto.** En una laptop con ~650 px de viewport útil el CTA queda en el límite del pliegue. Estimación: 136 px de padding superior + logo ~196 + tagline + H1 en 3 líneas (~130) + subtítulo (~63) + CTA (~44) + gaps ≈ 690 a 750 px. Verificar en 1366x768 con la barra del navegador.
5. **CTA débil.** 14 px, padding `11px 28px`, sin `min-height: 44px` (la regla táctil cubre `.form-submit` pero no `.cta-button`), sin flecha y sin acción secundaria. Además, "Hablemos de tu proyecto" lleva a un formulario que tiene otro título ("Contanos tu idea"). Ese desajuste es una oportunidad narrativa (ver sección 3).
6. **No hay señal de que hay más contenido debajo.** No hay indicador de scroll ni asomo de la siguiente sección.
7. **Robustez.** `min-height: 100vh` en móviles con barra de URL dinámica salta. Conviene `100svh`.

Jerarquía propuesta, de arriba a abajo:

1. Logo más chico (140 a 160 px en móvil o si `max-height: 760px`). Sin cambiarlo, solo la escala.
2. H1 grande: `clamp(2rem, 5.2vw, 3.25rem)` (32 a 52 px), `line-height: 1.12`, máximo ~20 ch por línea con `text-wrap: balance`.
3. Subtítulo en 18 px (`--fs-md`) desktop y 16 px móvil, color `--text-muted`, máximo 60 ch.
4. CTA primario de 16 px, alto 48 px, más un enlace secundario "Ver cómo trabajamos" que baja a la sección nueva de la sección 3.
5. Tagline: pasarlo debajo del CTA, o mejor, convertirlo en el "hilo" del storytelling. Ver sección 3. Como mínimo, 16 px y `letter-spacing` 0.

### Servicios

- Cuatro tarjetas centradas con ícono de 32 px, título de 18 px y descripción de 14 px. La jerarquía interna es correcta, pero **ninguna tarjeta tiene acción**: no hay "Consultar" ni enlace al formulario. Es un callejón sin salida para alguien que ya sabe qué quiere.
- Todo el contenido está centrado. Con cuatro tarjetas cortas funciona; cuando el acordeón despliega ítems, el texto pasa a alinearse a la izquierda dentro de una tarjeta centrada, lo que rompe la lectura.
- El `⌄` del acordeón es un glifo de texto, sin `aria-expanded` visible en el HTML estático. Verificar en `service-items.js` que exista y que se pueda operar con Enter y Espacio.
- Al abrir una tarjeta en la grilla de 4 columnas, la altura de fila se estira y las hermanas quedan con mucho aire vacío. Verificar en pantalla.
- Falta una línea "en criollo" que aclare "agentes de IA" y "automatización" para el público que se digitaliza desde cero (que el brief nombra como target).

Propuesta: mantener las tarjetas y agregar un enlace discreto al pie de cada una, "Consultar por esto →", que lleve a `#contacto` con el servicio preseleccionado (ver sección 4).

### Nosotros

- Texto en 14 px con `rgba(255,255,255,.78)`. Contraste correcto (~11:1), tamaño insuficiente para dos párrafos largos.
- Las tres tarjetas (`h4` con 14 px cian) usan **`h4` sin haber un `h3` antes**. Esto rompe el orden de encabezados: pasa de `h2` a `h4`.
- El mensaje diferencial ("entre la agencia lenta y el freelancer suelto") es el mejor argumento comercial de la página y está enterrado en un párrafo. Merece un componente visual: dos columnas "Agencia tradicional / Freelancer suelto / OPSYN" con tres filas comparadas.
- Posición: viene antes de las pruebas (portfolio). Conviene que primero vengan los resultados y después el "quiénes somos".

### Portfolio

- **Riesgo de credibilidad.** Cuatro cifras ("+40 % en ventas", "−60 % tiempo de respuesta", "15 hs ahorradas por semana", "3× engagement") sin cliente, período ni método. Son placeholders, pero están publicadas en producción bajo el título "Casos de éxito". Si no son reales, hay que rotularlas como ejemplos ilustrativos; si lo son, agregar contexto. Una métrica sin contexto genera desconfianza en lugar de confianza.
- **Semántica invertida.** El `h3` es "en ventas" (la unidad) y el nombre del proyecto va en un `<p>` eyebrow. Un lector de pantalla recorre "en ventas, tiempo de respuesta, ahorradas por semana..." sin saber de qué proyecto se trata. El `h3` debe ser el nombre del proyecto.
- El eyebrow es JetBrains Mono de 12 px al 62 % de blanco. Es legible por contraste (~7.6:1) pero es el dato que le da sentido a la cifra y está en el elemento más discreto.
- Grilla 2x2 en desktop (≥1025 px) frente a 4 columnas en servicios. Es un cambio de ritmo válido, pero deja dos tarjetas grandes con mucho vacío lateral en 1120 px.
- Ninguna tarjeta enlaza a nada: ni caso ampliado ni CTA.

### Blog

- Tres tarjetas **no enlazables** (no hay `<a>`): el cursor sugiere interacción por el hover, pero no hay a dónde ir. Las imágenes son SVG placeholder con `alt=""` (aceptable para decorativas).
- Está ubicada justo antes del formulario y diluye la conversión.
- Recomendación: ocultar la sección hasta tener posts reales, o moverla debajo del contacto/al footer.

### Contacto

- El título "Contanos tu idea" y el subtítulo "Sin vueltas…" son buenos. Falta el compromiso concreto: tiempo de respuesta (por ejemplo "Te respondemos en menos de 24 hs hábiles"), a confirmar con el negocio.
- El formulario es corto (4 campos), lo cual es correcto.
- No hay canal alternativo visible junto al formulario (email/Instagram solo en el footer).
- Detalle en la sección 4 (microinteracciones y validación).

### Header y navegación

- Seis enlaces más selector de idioma, sin botón de acción. Sugerencia: "Contacto" como botón contorneado en el header, o un CTA separado "Hablemos".
- Entre 769 y ~900 px es posible que el header envuelva a una segunda línea (`flex-wrap: wrap`, gap 32, `logo min-width: 150px`). Verificar.
- **Altura móvil.** `--header-h` vale 76 px, pero en ≤480 px el header mide ~68 px (12 px de padding + 44 px de botón). El menú móvil se fija con `top: var(--header-h)`, con lo que queda un hueco de ~8 px.
- El `aria-label` del botón hamburguesa ("Abrir menú" / "Cerrar menú") está fijado en español en el JS y no cambia con el idioma.
- El menú móvil no cierra con Escape ni al tocar fuera, y no gestiona el foco.

### Orden de secciones recomendado

1. Hero (con CTA)
2. **Cómo trabajamos: Idea → Proyecto → Solución** (nueva, ver sección 3)
3. Servicios (con "Consultar por esto")
4. Portfolio (con casos reales y CTA de cierre "¿Tu caso podría ser el próximo?")
5. Nosotros (con la comparación agencia / freelancer / OPSYN)
6. Contacto
7. Blog: oculto hasta tener contenido, o debajo del contacto

Con este orden hay tres puntos de conversión (hero, servicios y portfolio) antes de Nosotros, y el formulario cierra el recorrido en lugar de perderse tras el blog.

---

## 2. Tipografía y contraste, con valores concretos

### 2.1 Contraste

| Elemento | Color / tamaño | Contraste estimado | Veredicto |
|---|---|---|---|
| `a:hover` global | `#9434D4` sobre `#0D0326` | ~3.5:1 | **Falla AA** para texto normal (mínimo 4.5:1) |
| `.nav-link:hover` | `#9434D4` sobre header ~ `#0D0326` | ~3.5:1 | **Falla AA** (13 a 15 px) |
| `.footer-section a:hover` | `#9434D4` | ~3.5:1 | **Falla AA** (14 px) |
| `.blog-date` | blanco al 50 %, 12 px | ~5.3:1 | Pasa AA, margen mínimo en 12 px |
| Portfolio `%` (`--teal` `#2D89AD`) | ~5.0:1 (≈4.7 sobre la tarjeta) | Pasa AA, es texto grande |
| `.lang-btn` inactivo | blanco al 60 %, 13 px | ~6.6:1 | Pasa |
| Texto cuerpo de tarjetas | blanco al 72 % | ~9:1 | Pasa |
| `--accent-text` `#C77DF0` | | ~7.0:1 | Pasa (es la alternativa correcta) |
| `--cyan` sobre fondo | | ~16.6:1 | Pasa con holgura |
| Blanco sobre `#9434D4` (CTA) | | 5.68:1 | Pasa |
| Error `#FF8A8A` | | ~9:1 | Pasa |

Hallazgo principal: en `a:hover` hay **dos declaraciones seguidas**, `color: var(--accent-text)` y a continuación `color: var(--primary-accent)`. La segunda pisa a la primera, así que el token pensado para texto (7.0:1) queda anulado y el hover usa el color que el propio CSS declara "solo fondos y gradientes". El mismo error se repite en `.nav-link:hover` y `.footer-section a:hover`. Arreglo: usar `var(--accent-text)` en los tres, o el cian.

Nota de diseño: el cian puro sobre fondo casi negro da 16.6:1. Es correcto en labels y acentos, pero en cuerpo de texto extenso genera vibración visual (halation). Mantenerlo en labels, métricas y detalles, y usar blanco al 75 % para lectura.

### 2.2 Tamaños

| Elemento | Valor actual | Problema | Propuesta |
|---|---|---|---|
| Subtítulo hero | 14 px (13 px ≤480) | Texto clave demasiado chico | 18 px desktop / 16 px móvil |
| Tagline | 14 px (12 px ≤480) | Frase de marca en el tamaño más chico | 16 a 18 px |
| H1 hero | máx. 36 px (20 px ≤480) | Poca presencia para un hero de pantalla completa | `clamp(2rem, 5.2vw, 3.25rem)`; móvil 28 a 32 px |
| H2 de sección | máx. 30 px (20 px ≤480) | Casi igual al H1 (ratio 1.2) | `clamp(1.75rem, 3.5vw, 2.25rem)` (`--fs-xl` ya existe) |
| Texto de Nosotros | 14 px | Párrafos largos en 14 px | 16 px, `line-height: 1.65` |
| Descripción de servicio | 14 px (12 px ≤480) | Piso demasiado bajo | 15 a 16 px, mínimo 14 px móvil |
| Ítems del acordeón | `--fs-xs` 12 px; 11.2 px (0.7rem) en ≤768 | Ilegible en móvil | mínimo 13 px |
| Nav móvil | 12 a 13 px | Bajo para un menú táctil | 16 px |
| Inputs (≥481 px) | 15 px | | 16 px |
| Inputs (≤480 px) | 14 px | **iOS Safari hace zoom automático al enfocar campos de texto con menos de 16 px** | 16 px en todos los anchos |
| `.section-label`, `.blog-date`, eyebrow | 12 px | Aceptable como metadato | 13 px |
| Footer | 13 a 14 px | Aceptable | dejar |
| Botón CTA | 14 px | | 16 px |

La escala tiene 36 / 30 / 18 / 14 / 12 px: demasiados escalones cercanos en el extremo bajo y una diferencia mínima entre H1 y H2. Adoptar una escala real y usar los tokens que ya existen:

- Display (hero): 52 px
- H2: 36 px
- H3: 24 px
- Lead: 18 px
- Body: 16 px
- Small: 14 px (solo metadatos)
- Micro: 12 px (solo etiquetas)

### 2.3 Fuentes

- Se cargan 7 archivos: Space Grotesk 500/600/700, Inter 400/500/600 y JetBrains Mono 500. Los títulos usan 700, así que **Space Grotesk 500 y 600 no se usan en el CSS revisado** (dos descargas de sobra). JetBrains Mono solo se usa en el eyebrow del portfolio y en páginas legales. Se puede evitar la tercera familia con Inter en mayúsculas más `letter-spacing`.
- El `display=swap` está bien. Falta `font-size-adjust` o una fuente de respaldo con métricas ajustadas para reducir el salto de layout.
- `line-height: 1.6` en body y 1.2 en títulos: correcto. En el H1 largo conviene 1.12 a 1.15 al agrandarlo.

### 2.4 Otros detalles de calidad

- El `<h4>` de las tarjetas de Nosotros y los del footer saltan niveles. Usar `h3` (Nosotros) y elementos no encabezado o `h2` visualmente chicos (footer).
- `h1` largo con voz de frase: correcto para SEO y conversión, pero se beneficia de `text-wrap: balance`.
- Los enlaces en cuerpo de texto no tienen subrayado (solo color). Si aparecen dentro de párrafos, agregar subrayado.

### 2.5 Defectos de código con impacto UX

1. **Conflicto de animación en `.fade-in`.** Hay una regla `animation: fadeIn 0.6s ease both` y más abajo otra con `opacity: 0` más transición hacia `.is-visible`. El `animation-fill-mode: both` mantiene `opacity: 1` y anula el efecto de la clase. El resultado es que el hero anima por CSS al cargar, no por `IntersectionObserver`; funciona, pero hay dos sistemas superpuestos. Además `.reveal-on-scroll.revealed` y `slideInUp` son código muerto porque el JS agrega `is-visible`, no `revealed`.
2. **Riesgo de contenido invisible.** El `<head>` agrega la clase `js` de forma inline, y las tarjetas nacen con `opacity: 0`. Si `main.js` falla, esas tarjetas nunca se muestran. En `main.js`, `localStorage.getItem(...)` se ejecuta en el nivel superior **sin try/catch**: en navegación privada estricta o con almacenamiento bloqueado lanza una excepción y detiene todo el script (nav, formulario, idioma y revelado). Envolver el acceso en try/catch.
3. **Idioma incompleto.** `TRANSLATIONS` no cubre: enlaces de navegación, tarjetas de portfolio (eyebrow y etiquetas), blog completo, opciones del `<select>` (excepto el placeholder), enlaces del footer, aria-label del menú. Al pasar a EN, media página queda en español. El brief pide "bilingüe", así que esto es un requisito incumplido.
4. **Al hacer clic en un ancla, el foco no se mueve** al destino, porque `preventDefault()` + `scrollIntoView()`. Para teclado y lector de pantalla, la próxima tabulación sigue en el menú.
5. **Decorativos.** `.glow-orb-3` y `.ring-2` están en el CSS sin usarse. El SVG del circuito tiene trazos con coordenadas fuera del `viewBox` (y hasta 1800 con `viewBox` de 1000), por lo que parte se recorta.
6. **Circuito fijo.** En desktop `.circuit-bg` es `position: fixed`, por lo que se ve detrás de todas las secciones al hacer scroll; en móvil ya se acotó al hero. Decidir un comportamiento único. Si es intencional, es un buen hilo visual y puede reusarse en el storytelling.
7. **`transition: all`** en tokens, botones y tarjetas. Anima propiedades no deseadas y cuesta rendimiento. Listar propiedades.
8. **Hover sobre táctil.** `translateY(-6px)` + sombra en todas las tarjetas se dispara también con toque. Envolverlo en `@media (hover: hover)`.

---

## 3. Storytelling didáctico: Idea → Proyecto → Solución

### Por qué

El tagline ya tiene la estructura ("somos una idea, somos un proyecto, somos la solución para vos") y hoy no se explica. La página lista servicios, pero no muestra **cómo pasa un negocio de una necesidad difusa a algo funcionando**. Ese recorrido responde la duda real de alguien que se digitaliza desde cero: "¿qué pasa si te escribo?". Además convierte la frase de marca en estructura de contenido sin cambiar una sola palabra del tagline ni el logo.

### Sección nueva: "Cómo lo hacemos"

Ubicación: inmediatamente después del hero (ancla `#proceso`, enlace secundario desde el hero).

Formato: lista ordenada `<ol>` de 3 pasos horizontal en desktop y vertical en móvil, conectados por una línea con el mismo lenguaje visual del circuito de fondo. Cada paso tiene: número, nombre de etapa, promesa en una línea, qué hacemos, qué necesitamos de vos y qué te llevás.

| Etapa | Promesa | Qué hacemos | Qué necesitamos de vos | Qué te llevás | Servicio asociado |
|---|---|---|---|---|---|
| **1. Idea** | "Ordenamos lo que tenés en la cabeza." | Una charla directa para entender cómo funciona tu negocio y a dónde querés llegar. Diagnóstico honesto, sin jerga. | 30 a 45 minutos y contarnos qué te frena hoy. | Un diagnóstico claro y un plan priorizado. | Consultoría tecnológica |
| **2. Proyecto** | "Lo diseñamos y lo construimos con vos." | Definimos alcance, armamos la solución y te mostramos avances cortos para decidir juntos. | Feedback rápido en cada avance. | Algo funcionando que podés probar, no un documento. | Desarrollo de software, Agentes de IA y automatización |
| **3. Solución** | "Funciona, se usa y sigue funcionando." | Lo ponemos en marcha, medimos el resultado, lo sostenemos y lo comunicamos. | Usarlo y contarnos qué mejora. | Tu operación funcionando y un canal directo para seguir. | Soporte, Marketing digital |

Notas de copy:

- Rótulos y promesas en voseo, coherentes con el sitio.
- Los plazos, entregables y "30 a 45 minutos" son **propuestas a validar con el negocio**, no datos confirmados. No publicar promesas de tiempo sin confirmarlas.
- Cada etapa lleva un mini-CTA: en Idea, "Contanos tu idea" hacia `#contacto`. El título del formulario ya dice "Contanos tu idea", así que el recorrido cierra donde empieza.

### Ejemplo que se sigue en las tres etapas (didáctico)

Debajo de los tres pasos, un ejemplo con el que se ve el proceso completo, usando un caso de portfolio:

- **Idea:** "Atender consultas por WhatsApp nos lleva medio día."
- **Proyecto:** "Un agente de IA que responde lo repetitivo y deriva lo complejo a una persona."
- **Solución:** "Tiempo de respuesta −60 %." (solo si el dato es real; si no, omitir la cifra).

Esto vuelve los números del portfolio parte de una historia en lugar de cifras sueltas.

### Interacción del storytelling

- Al hacer scroll, la línea entre las tres etapas se dibuja y un pulso cian (el mismo círculo del circuito del hero) avanza de una etapa a la siguiente. Al llegar a cada nodo, el nodo pasa de outline a relleno (150 a 200 ms). Implementación posible: `IntersectionObserver` que agrega `is-active`, con `animation-timeline: view()` como mejora progresiva donde haya soporte.
- Con `prefers-reduced-motion`, mostrar la línea completa y los tres nodos activos, sin animación.
- Hover o foco en un paso: expande "Qué necesitamos de vos" con `max-height` (200 ms). En táctil, siempre visible.
- Teclado: `<ol>` semántico, sin dependencia del movimiento para entender el orden.
- Móvil: línea vertical a la izquierda con nodos, tarjetas a la derecha.

### Conexiones con el resto de la página

- **Hero:** enlace secundario "Ver cómo trabajamos" hacia `#proceso`. El tagline puede reutilizarse como encabezado corto de la sección, sin comillas y sin cambiar su texto.
- **Servicios:** una etiqueta pequeña en cada tarjeta indica en qué etapa interviene ("Idea", "Proyecto", "Solución"), de modo que las cuatro tarjetas se leen como partes del mismo recorrido.
- **Servicios, línea "en criollo":** bajo cada descripción, una frase muy corta. Ejemplos: "Agente de IA: un asistente que responde por vos las consultas repetidas." o "Automatización: que la máquina haga las tareas que hoy hacés a mano."
- **Nosotros:** la comparación agencia / freelancer / OPSYN se apoya en el proceso ("nosotros empezamos por la Idea").
- **Contacto:** reutilizar la metáfora en el título o subtítulo, sin agregar campos.

---

## 4. Microinteracciones

### 4.1 Tokens de movimiento

```
--dur-instant: 80ms;   /* press */
--dur-fast:   150ms;   /* hover, focus */
--dur-base:   250ms;   /* expandir, revelar */
--dur-slow:   500ms;   /* entradas de sección */
--ease-out:   cubic-bezier(0.2, 0.8, 0.2, 1);
```

Regla general: animar solo `transform`, `opacity`, `box-shadow` y `border-color`. Nada de `transition: all`. El bloque global de `prefers-reduced-motion` ya existente se mantiene y cubre todo lo nuevo.

### 4.2 Botones (CTA del hero, submit, botones de cookies, "Consultar por esto")

| Estado | Comportamiento propuesto |
|---|---|
| Reposo | Gradiente actual (`#9434D4` a `#5A1CA1`), sombra `0 0 24px rgba(148,52,212,.5)`. Alto mínimo 48 px, 16 px de texto. |
| Hover (solo `@media (hover:hover)`) | `translateY(-2px)` (hoy es -3 px + `scale(1.03)`; el escalado desenfoca el texto y mueve el layout). Sombra a `0 0 38px rgba(148,52,212,.8)`. Flecha "→" interna se desplaza 4 px a la derecha en 150 ms. |
| Foco de teclado | Anillo cian de 2 px con `outline-offset: 3px` (ya existe el outline; sumar `box-shadow: 0 0 0 6px var(--cyan-10)`) para que se distinga sobre el gradiente. |
| Presionado | `translateY(0) scale(0.98)` en 80 ms, sombra reducida. Da respuesta táctil inmediata. |
| Cargando | El texto cambia a "Enviando…" (hoy solo aparece el spinner y el texto sigue igual), `aria-busy="true"`, ancho fijo para que el botón no salte. |
| Deshabilitado | Opacidad 0.7 (ya existe) más `cursor: not-allowed`. Comunicar el motivo con texto, no solo con opacidad. |
| Éxito | Ícono de tilde y "¡Enviado!" durante 2 a 3 s, luego el formulario da paso al panel de confirmación (ver 4.3). |

Reglas: sin efectos "magnéticos" ni parallax en botones (mala accesibilidad y difícil de apuntar), sin ripple. La jerarquía de botones es: primario relleno (un solo por pantalla), secundario con borde cian y terciario como enlace con subrayado animado.

Botón "Contacto" del header: borde `1px solid var(--accent-40)` y fondo transparente. En hover, relleno al 15 %. No debe competir con el CTA del hero.

### 4.3 Formulario

Estado actual: `novalidate` sin validación en cliente. Todo se valida en el servidor y el usuario recibe un mensaje genérico ("Revisá los datos del formulario"), sin saber qué campo falló. No hay indicador de campos obligatorios ni contador. No hay `aria-invalid`. Tras enviar, solo aparece una línea de texto bajo el botón. El campo de servicio es un `select` nativo.

Propuesta:

1. **Validación al salir del campo (blur), no mientras se escribe.**
   - Error: borde `#FF8A8A`, mensaje de 14 px debajo del campo con ícono, `aria-invalid="true"` y `aria-describedby` apuntando al mensaje. Ejemplos de mensajes: "Necesitamos tu email para responderte.", "Contanos un poco más (mínimo 10 caracteres)."
   - Válido: tilde cian pequeño a la derecha, 150 ms de fade. Sin verde adicional para no salir de la paleta.
   - Al enviar con errores: el foco va al primer campo inválido y un resumen `role="alert"` arriba indica cuántos son. Sin sacudir nada si `prefers-reduced-motion` está activo.
   - Mantener `novalidate` y hacer la validación en JS con los mismos límites que el HTML (`maxlength`, `minlength`).
2. **Foco de campo.** El label pasa a cian y el borde a cian (ya hay borde y glow `0 0 0 4px var(--cyan-10)`). Hoy hay `outline` **y** `box-shadow` a la vez; alcanza con uno para no duplicar el anillo.
3. **Obligatorios.** Marcar con "(obligatorio)" en el label o un asterisco con `aria-hidden` más una nota "Todos los campos son obligatorios". Hoy no hay ninguna señal.
4. **Contador del textarea.** Aparece a partir de 80 % de uso ("4.100 / 5.000") y en el mínimo ("faltan 4 caracteres"). Discreto, 13 px, alineado a la derecha.
5. **Servicio como chips.** Reemplazar el `select` por cuatro chips seleccionables (`radiogroup` con `radio` reales) con los mismos nombres de las tarjetas. Es más rápido (un toque en lugar de dos), muestra las opciones sin abrir un menú y elimina el problema de estilo del desplegable nativo. Alternativa mínima: mantener el `select` con una flecha personalizada y `appearance: none`.
6. **Prellenado desde Servicios.** "Consultar por esto" en cada tarjeta lleva a `#contacto?servicio=ia` (o equivalente), selecciona el chip, hace scroll suave y enfoca el textarea. Es la microinteracción con mayor impacto en conversión de esta lista, porque conecta el interés con el formulario en un toque.
7. **Enviando.** Botón en estado de carga (4.2). Los campos quedan con `readonly` (no `disabled`, para no perder el valor ni el foco).
8. **Éxito.**
   - El formulario se reemplaza por un panel de confirmación con tilde, título ("¡Recibimos tu mensaje!"), una línea con el siguiente paso ("Te respondemos a tu email en menos de 24 hs hábiles", plazo a confirmar) y un enlace "Enviar otro mensaje".
   - El foco se mueve al título del panel (`tabindex="-1"`) para que lector de pantalla y teclado lo anuncien.
   - Transición: fade 250 ms y ligero `translateY(8px)` a 0.
9. **Error de servidor.** Panel arriba del botón con texto específico ("No pudimos enviarlo. Tu mensaje sigue acá, probá de nuevo o escribinos a hola@opsyn.com") y botón "Reintentar". **No vaciar el formulario nunca en caso de error** (hoy solo se limpia en éxito, correcto). Si el error es 429, mostrar el tiempo estimado de espera.
10. **Borrador.** Opcional: guardar el mensaje en `sessionStorage` (con try/catch) para no perderlo si se recarga. No guardar datos personales más tiempo del necesario; evaluar contra la política de privacidad.

### 4.4 Otras microinteracciones de bajo costo

- **Tarjetas:** unificar a `translateY(-4px)` con sombra suave, solo con `hover: hover`. Las tarjetas con acordeón: el chevron rota 180° en 250 ms y el contenido se despliega con `grid-template-rows: 0fr → 1fr` en lugar de `hidden`, para animar la altura sin saltos. Confirmar `aria-expanded`.
- **Enlaces del nav:** el subrayado actual (scaleX) está bien; agregar `transform-origin: left` al entrar y `right` al salir.
- **Selector de idioma:** transición de fondo del "pill" activo deslizando (150 ms) en vez de cambiar de golpe.
- **Menú móvil:** cierre con Escape y clic fuera, foco al primer enlace al abrir, y devolver el foco al botón al cerrar.
- **Indicador de scroll** en el hero: una flecha o barra que late 2 veces y desaparece al primer scroll.
- **Métricas del portfolio:** contador que sube de 0 al valor final (600 ms, `ease-out`) al entrar en pantalla. En `prefers-reduced-motion` mostrar el valor final directo. Solo si los datos son reales.
- **Copiar email:** en el footer y junto al formulario, un botón que copia `hola@opsyn.com` y muestra "Copiado" 2 s (con `aria-live`).

---

## 5. Prioridades ordenadas por impacto y esfuerzo

Escala: impacto (Alto/Medio/Bajo) sobre conversión, accesibilidad o credibilidad. Esfuerzo (S: menos de 1 h, M: medio día, L: 1 a 3 días).

### Hacer primero (alto impacto, esfuerzo S)

| # | Acción | Impacto | Esfuerzo |
|---|---|---|---|
| 1 | Corregir el color de hover a `--accent-text` en `a:hover`, `.nav-link:hover` y `.footer-section a:hover` (hoy 3.5:1, falla AA). Eliminar la declaración duplicada. | Alto (accesibilidad) | S |
| 2 | Inputs y select a 16 px en todos los anchos (evita el zoom de iOS al enfocar). | Alto (móvil) | S |
| 3 | Envolver `localStorage` en try/catch y no dejar el contenido con `opacity: 0` si falla el JS. | Alto (robustez) | S |
| 4 | Subir tamaños mínimos: subtítulo hero 18/16 px, cuerpo 16 px, móvil nunca menos de 13 px (ítems del acordeón hoy 11.2 px). | Alto (legibilidad) | S |
| 5 | Rotular o sustituir las métricas del portfolio (placeholders publicados como "Casos de éxito"). | Alto (credibilidad) | S |
| 6 | H1 más grande (`--fs-2xl` o similar), tagline a 16 a 18 px y CTA a 16 px / 48 px de alto. | Alto | S |
| 7 | Botón "Contacto" destacado en el header y mismo alto móvil para `--header-h` (68 px en ≤480). | Medio | S |

### Hacer después (alto impacto, esfuerzo M)

| # | Acción | Impacto | Esfuerzo |
|---|---|---|---|
| 8 | Completar la traducción EN: navegación, portfolio, blog, opciones del select, footer, aria-label. | Alto (requisito del brief) | M |
| 9 | Formulario: validación por campo, `aria-invalid`, estado "Enviando…", panel de éxito con foco, contador. | Alto (conversión) | M |
| 10 | Nueva sección "Cómo lo hacemos" (Idea → Proyecto → Solución) con ejemplo, versión estática primero. | Alto (storytelling y conversión) | M |
| 11 | Reordenar: proceso, servicios, portfolio, nosotros, contacto. Ocultar Blog hasta tener posts reales. | Alto | M |
| 12 | "Consultar por esto" en cada servicio con selección automática en el formulario. | Alto (conversión) | M |
| 13 | Corregir semántica: `h3` como nombre del proyecto en portfolio, `h3` en las tarjetas de Nosotros, orden de encabezados. | Medio (a11y y SEO) | S |

### Hacer más adelante (impacto medio, esfuerzo M a L)

| # | Acción | Impacto | Esfuerzo |
|---|---|---|---|
| 14 | Servicio como chips en lugar de `select`. | Medio | M |
| 15 | Comparación agencia / freelancer / OPSYN en Nosotros. | Medio | M |
| 16 | Animación scroll-linked de la línea del proceso y contadores de métricas. | Medio | M/L |
| 17 | Tarjetas con `hover: hover`, reemplazar `transition: all`, retirar código muerto (`.revealed`, `slideInUp`, `glow-orb-3`, `ring-2`) y resolver el conflicto de `.fade-in`. | Medio (rendimiento y mantenimiento) | M |
| 18 | Menú móvil: Escape, clic fuera, gestión de foco; mover foco al destino tras un ancla. | Medio (a11y) | M |
| 19 | Quitar Space Grotesk 500/600 y evaluar prescindir de JetBrains Mono (-2 a -3 archivos de fuente). | Bajo/Medio (rendimiento) | S |
| 20 | Casos de éxito ampliados (cliente, problema, solución, resultado, período) cuando existan datos reales. | Alto a futuro | L |

### Validación recomendada tras implementar

- Prueba de 5 usuarios con una tarea ("pedí una propuesta para automatizar la atención de tus clientes") y medición de tiempo hasta enviar el formulario.
- Revisión en 390x844, 768x1024 y 1366x768 (pliegue del hero, header entre 769 y 900 px, acordeón abierto).
- Auditoría con axe o Lighthouse y prueba de teclado completa (nav, acordeón, formulario, menú móvil).
- Prueba en iOS Safari real para confirmar que ya no hace zoom en los campos.
- Medir: clics en CTA hero y header, inicios de formulario, envíos completados, uso del enlace "Consultar por esto".

## Cierre

La base visual y de accesibilidad es sólida: paleta, foco, movimiento reducido y estructura semántica general están cuidados. Las debilidades están en jerarquía y tamaños (el mensaje central es el texto más chico), en el recorrido de conversión (un solo CTA lejos del formulario) y en la falta de una narrativa que explique el proceso. La propuesta Idea → Proyecto → Solución resuelve esto último usando el tagline existente como estructura, sin modificar marca ni logo.
