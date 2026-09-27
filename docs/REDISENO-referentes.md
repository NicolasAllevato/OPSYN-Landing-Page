# Referentes de diseño para el rediseño de OPSYN

Investigación de landings actuales (septiembre 2026) de Linear, Stripe, Vercel, Framer, Raycast, Notion, Apple, Arc/The Browser Company, Lovable, Relevance AI y Sierra. El objetivo: extraer paleta, tipografía, patrones de hero/fondo/botones y CTA aplicables a la identidad cósmica violeta/cian de OPSYN.

**Nota de método:** para cada sitio se intentó primero un fetch directo de la landing (WebFetch). Cuando el HTML renderizado no exponía valores exactos (la mayoría de los sitios modernos cargan color/tipografía vía CSS-in-JS o fuentes variables que no aparecen en el markup visible), se complementó con búsqueda web sobre análisis de diseño y "design tokens" de terceros (DesignMD, Fudge, OpenDesign, shadcn.io, etc.). Los hex marcados como **(fuente secundaria)** provienen de esos análisis, no de una lectura directa del CSS del sitio — se los trata como aproximaciones razonables, no valores oficiales confirmados por Claude. Arc.net devolvió HTTP 403 al fetch directo; sus datos son 100% de fuentes secundarias.

---

## 1. Linear

- **Paleta:** casi monocromática oscura. Fondos casi negros `#0f1011` y `#08090a`, texto de alto contraste `#f7f8f8`. Un único acento violeta-índigo: `#5e6ad2` (fondos/superficies) y `#7170ff` (interactivo/hover) **(fuente secundaria)**.
- **Tipografía:** Inter Variable en todo el sitio, con features OpenType `cv01`/`ss03` activadas globalmente. Inter Display para titulares grandes (72/64/48px) con letter-spacing muy negativo (-1.6px a -1.1px); pesos desde 300 (body) hasta 510 (peso "de firma" de Linear) y 590 (énfasis). Body en Inter regular.
- **Patrón de hero:** titular directo y corto ("The product development system for teams and agents") + subtítulo de una línea + CTA textual con flecha ("→"). Sin imagen 3D protagónica; se apoya en capturas de producto (dashboards, diffs, timelines) como refuerzo visual, no como fondo decorativo.
- **Botones/hover:** CTAs de texto con flecha (link-style) para navegación secundaria; botones sólidos para "Get started"/"Contact sales". La marca prioriza el contraste tipográfico sobre el relleno de color — el acento violeta se reserva para estados interactivos y bordes, no para superficies grandes.
- **Fondos:** achromatic, sin ruido ni malla visible; la profundidad viene del apilado de superficies oscuras (negro > gris oscuro > acento) más que de efectos decorativos.
- **3D/imágenes dinámicas:** no hay 3D; el "efecto wow" es la fluidez de las transiciones de producto (capturas de UI animadas).
- **Formulario/CTA:** conversión vía "Get started"/"Open app" en el header; no hay formulario largo en la home, todo apunta a signup de un clic.

## 2. Stripe

- **Paleta:** base neutra `#061b31` sobre `#ffffff`, con violeta primario `#533afd` para interacciones clave **(fuente secundaria)**. El gradiente de marca combina naranja `#ff6118`, rosa `#ffe0ef` y violeta `#533afd` **(fuente secundaria)**. Focus ring azul-violeta translúcido `rgba(99,91,255,0.1)`.
- **Tipografía:** fuente propietaria variable "sohne-var", usada en pesos livianos (300/400) que dan una sensación aérea y moderna.
- **Patrón de hero:** headline + CTA doble ("Get started" / "Contact sales") sobre fondo con onda de gradiente animado (recursos "wave-fallback", "wave_crop").
- **Botones/hover:** botones sólidos redondeados con jerarquía clara primario/secundario; enlaces secundarios tipo "Read the story", "Watch video".
- **Fondos:** el elemento de marca más reconocible del mercado — gradiente WebGL fluido y animado (históricamente implementado con una librería propia "minigl"), mezclando 3-4 tonos que migran suavemente. Se combina con fotografía real (calles, comercios) en secciones de casos de cliente, dentro de un layout tipo bento-grid.
- **3D/imágenes dinámicas:** el gradiente WebGL animado es el recurso 3D/dinámico central; fuera de eso, fotografía documental, no renders 3D de producto.
- **Formulario/CTA:** ejemplos de pricing embebidos como tarjetas ("Pro Plan / $0.01 por 1.000 unidades") más que formularios; conversión principal es "Start now" / "Sign up with Google".

## 3. Vercel

- **Paleta:** casi sin color de marca — ink-casi-negro `#171717` sobre blanco-hueso `#fafafa`, escala de grises de 200 pasos para bordes/estados. Único acento cromático: verde terminal `#297a3a` para links y etiquetas **(fuente secundaria)**. Un gradiente espectral ("rainbow prism") se usa solo como acento decorativo en el hero.
- **Tipografía:** familia propia Geist — Geist Mono para todos los titulares, Geist Sans para body. Peso 450 para headlines hero (más pesado que light, más liviano que semibold): tono confiado sin gritar.
- **Patrón de hero:** headline corto orientado a developers ("For coding agents to ship apps...") + dos CTAs ("Deploy now", "Talk to sales"). Frecuentemente acompañado de una ilustración de prisma/triángulo que dispersa un espectro en líneas geométricas finas.
- **Botones/hover:** esquinas de 6px en contenedores/inputs, pero CTAs standalone usan pill completamente redondeado (radio 9999px) — contraste deliberado entre geometría "de sistema" y geometría "de acción".
- **Fondos:** blanco `#fafafa` con overlay de grilla sutil (~5% opacidad) — el fondo cuadriculado tipo "notebook de ingeniero" es su firma visual, sobre grid de 4px.
- **3D/imágenes dinámicas:** el prisma espectral funciona como único elemento "3D-ish"; el resto es tipografía y grilla, sin fotografía.
- **Formulario/CTA:** conversión de un clic ("Deploy now" enlaza a `/new`), sin formularios largos en home.

## 4. Framer

- **Paleta:** lienzo casi negro puro con tipografía blanca sobreescalada; paneles de "atmósfera" en gradientes vibrantes de magenta, violeta y naranja que actúan como vitrinas de showcase dentro del negro.
- **Tipografía:** GT Walsheim Medium para display (geométrica, ligeramente humanista, muy confiada en tamaños grandes con tracking negativo extremo); Inter Variable para el resto del sistema, con variantes OpenType extensas.
- **Patrón de hero:** CTA dual ("Get started for free" / "Start with agents") sobre fondo con paneles de gradiente tipo aurora. El marketplace de componentes de Framer ofrece explícitamente efectos "Aurora Gradient Tag", "Text Aurora" (con temas Borealis, Sunset, Ocean, Iridescent, Ember, Mono) y "Aurora Glow Text" — el vocabulario "aurora" es parte activa del lenguaje visual de la marca.
- **Botones/hover:** botones de alto contraste (blanco sobre negro) con letter-spacing negativo consistente con el resto de la tipografía.
- **Fondos:** paneles de gradiente grandes ("spotlights") que rompen el ritmo del negro — no es un fondo único sino bloques de color que aparecen entre secciones.
- **3D/imágenes dinámicas:** efectos de texto con gradiente animado (aurora glow) más que 3D real; el movimiento vive en el gradiente, no en geometría 3D.
- **Formulario/CTA:** signup directo, sin formulario largo.

## 5. Raycast

- **Paleta:** lienzo casi negro `#040506`/`#07080a`, 98% acromático, con un único acento coral cálido `#ff6363` (reservado a logo, arte del hero, badge de IA y superficies con tinte cálido — nunca para texto/íconos genéricos) **(fuente secundaria)**.
- **Tipografía:** Inter con `font-feature-settings: "calt","kern","liga","ss03"` activadas en todo el sitio (la `ss03` cambia la "g" de doble a un solo trazo — detalle tipográfico de firma). Geist Mono para metadatos técnicos y strings de versión.
- **Patrón de hero:** un teclado grande como gráfico central del hero, con teclas animadas/interactivas que destacan funcionalidades, sobre fondos glassmórficos azul/violeta.
- **Botones/hover:** rectángulos redondeados; jerarquía clara "Get started"/"Download" (primario) vs "Learn more"/"Browse the store" (secundario, tipo link).
- **Fondos:** dark theme dominante, efectos glassmórficos (superposiciones semitransparentes), patrones geométricos abstractos, transiciones de gradiente de oscuro a acento.
- **Tratamiento distintivo:** los componentes se definen menos por sombras y más por bordes de 1px ("hairline"), resaltes internos y una sombra interior tipo "tecla de teclado" que da sensación táctil/presionada en vez de flotante.
- **Formulario/CTA:** "Download and use Raycast for free" — conversión centrada en descarga, no en formulario.

## 6. Notion

- **Paleta:** gris cálido (no frío) — la escala va de `#f9f9f8` hasta `#494744`/`#31302e`, con tinte ecru/amarillo-marrón sutil en toda superficie. Azul único de acción: `#0075de`. Sistema completo: 53 tokens de color (violetas de marca, espectro de 10 colores, 9 tintes pastel de tarjetas, escalas de superficie/borde/texto) **(fuente secundaria)**.
- **Tipografía:** "NotionInter" (corte propio de Inter) para UI, combinado con Lyon Text (serif editorial) para citas destacadas. Titulares a 64px con tracking muy negativo (-2.1px); pesos 400 (body), 500 (UI), 600 (labels), 700 (headings).
- **Patrón de hero:** headline emocional ("Where teams and agents Think together") + imágenes tipo "pila de tarjetas" apiladas representando funciones distintas.
- **Botones/hover:** dos CTAs claros — "Get Notion free" (primario) y "Request a demo" (secundario) — bordes ultra-finos (1px, `rgba(0,0,0,0.1)`) en vez de sombras pesadas.
- **Fondos:** predominantemente blanco/claro, limpio; sin gradientes protagónicos.
- **3D/imágenes dinámicas:** capturas de interfaz (desktop/mobile) apiladas como collage, no 3D real.
- **Formulario/CTA:** carrusel de testimonios de clientes + indicador de confianza ("98% del Forbes Cloud 100"); conversión de un clic.

## 7. Apple (páginas de producto, ej. iPhone)

- **Paleta:** blanco puro, pergamino off-white o negro casi puro como fondos alternados; azul único y discreto para interacción (`#0071e3` en botones CTA, `#0066cc` en links inline) **(fuente secundaria)**. Gradientes radiales específicos por producto (ej. Music Red `#fa243c` → magenta `#ff4dc3` → aubergine `#591962`) **(fuente secundaria)**, no usados en iPhone pero sí en otras líneas.
- **Tipografía:** San Francisco (SF Pro Display para headlines, SF Pro Text para body), optimizada para nitidez en pantalla a tamaños chicos.
- **Patrón de hero:** carrusel/slider de "tiles" a todo el ancho, alternando fondo claro/oscuro, cada uno con: headline corto + tagline de una línea + dos CTAs tipo píldora pequeños ("Learn more" / "Buy") + render de producto ultra nítido.
- **Botones/hover:** píldoras azules pequeñas, nunca dominan la composición — el producto es el protagonista, el botón es un detalle funcional.
- **Fondos:** el espacio en blanco ES el diseño — mínimo 64px de aire sobre el headline, 48-64px debajo, 40px mínimo entre el render de producto y cualquier otro contenido.
- **3D/imágenes dinámicas:** renders de producto fotorrealistas (no interactivos en la home, pero de calidad "3D" altísima) + video hero.
- **Formulario/CTA:** sin formularios; conversión es "Shop"/"Buy"/"Compare", comercio directo.

## 8. Arc / The Browser Company

- **Estado de la fuente:** el fetch directo a arc.net devolvió **HTTP 403 Forbidden** — no se pudo leer el HTML/CSS real del sitio. Todo lo siguiente proviene de análisis de terceros (fuente secundaria) y debe tratarse con más cautela que el resto de este documento.
- **Paleta (fuente secundaria):** fondo general "Arc Offwhite" `#fffcec` (crema cálido, sensación de papel más que de pantalla); banda azul saturada `#3139fb` usada como sección de cita a todo el ancho; otros tonos de marca: `#ff5060`, `#2702c2`.
- **Tipografía (fuente secundaria):** Marlin Soft SQ (peso 700) para hero editorial (~45.5px); Inter para el "chrome" de interfaz; un serif display (tipo Argent CF) para piezas editoriales — Arc "habla" en registro editorial, inusual en tech.
- **Patrón de hero (fuente secundaria):** headline + tarjeta CTA negra grande (76px alto, radio 22px) promoviendo el producto sucesor (Dia).
- **Fondos (fuente secundaria):** firma visual = vidrio esmerilado (frosted glass) + un único gradiente saturado (durazno-coral o violeta-fucsia) que fija la temperatura emocional de toda la ventana; translucidez constante, la barra se funde con el wallpaper del sistema.
- **Confiabilidad:** dado el 403, este bloque es el menos verificado del informe — usar solo como inspiración direccional, no como referencia de hex exactos.

## 9. Lovable

- **Paleta (fuente secundaria):** gradiente hero full-viewport que recorre azul → magenta → naranja horizontalmente; el ícono de marca es un corazón con relleno degradado naranja/rojo a azul/violeta — el mismo espectro reaparece en efectos de texto con gradiente en titulares.
- **Tipografía:** familia propia "Camera Plain" / "Camera Plain Variable" (Dinamo) — calidez humanista, terminales ligeramente redondeados, curvas orgánicas. A tamaños display (48-60px) usa peso 600 con tracking muy negativo (-0.9 a -1.5px) para titulares compactos y editoriales.
- **Patrón de hero:** interfaz dark-mode construida alrededor de una única tipografía geométrica y un sistema de color dramático (el gradiente multicolor mencionado), con estética "friendly dev".
- **Fondos:** gradiente atmosférico cálido (rosas, naranjas, azules) detrás del hero, sutil y casi de fondo ("barely visible") más que un bloque sólido.
- **Formulario/CTA:** producto orientado a prompt-to-app; la conversión central es probar el producto directamente (no hay detalle de formulario largo en las fuentes revisadas).

## 10. Relevance AI

- **Paleta (fetch directo):** fondos predominantemente blancos/claros, texto gris oscuro/negro; acentos azul/teal en botones. Nota: el fetch directo mezcló íconos de modelos de terceros (Claude, OpenAI, Gemini) con la paleta propia del sitio — el hex `#D97757` que apareció en el análisis corresponde al ícono de marca de Claude embebido en la página, no al color propio de Relevance AI. Se descarta como dato de marca.
- **Tipografía:** no se pudo determinar (no expuesta en el HTML ni encontrada en búsquedas específicas).
- **Patrón de hero:** headline de propuesta de valor ("Specialist agents for every task") + dos CTAs ("Book a demo", "Try it out").
- **Fondos:** layouts de tarjetas sobre fondo blanco/gris claro, secciones alternadas con separación visual sutil.
- **3D/imágenes dinámicas:** ilustraciones de "avatares de agente" numerados (01-20) + panel de métricas en vivo (tareas procesadas, gasto, % de eval pass) como forma de mostrar el producto funcionando, no gráficos 3D.
- **Conclusión:** de los 10 referentes, este es el que menos detalle verificable arrojó — se documenta lo disponible pero se recomienda no basar decisiones de paleta/tipografía en Relevance AI sin una revisión visual manual adicional.

## 11. Sierra

- **Paleta (fetch directo):** predominancia de blanco, grises neutros para texto, con violeta oscuro visible en botones puntuales (ej. badges de GDPR / EU AI Act). No se hallaron hex confirmados ni por fetch ni por búsqueda adicional (la búsqueda de "aurora/mesh" sobre Sierra no devolvió resultados específicos del sitio).
- **Tipografía:** no determinada — no expuesta en el contenido ni encontrada en fuentes secundarias confiables (los resultados de búsqueda devolvieron información genérica no verificable sobre "Sierra Font" de MyFonts, sin confirmar que sea la usada en sierra.ai).
- **Patrón de hero:** minimalista — headline corto ("Better outcomes. Built on Sierra.") + subheading + un único CTA ("Learn more").
- **Fondos:** predominantemente blancos/claros; imágenes de dashboard de producto ("Agent Studio") como refuerzo visual.
- **Confianza/compliance como diseño:** fila de badges de certificación (SOC 2, ISO 27001, ISO 42001, HIPAA, GDPR, FedRAMP, PCI DSS) usada como elemento de diseño explícito — la seriedad regulatoria es parte del lenguaje visual.
- **Conclusión:** referente con la información más limitada de los diez; lo confirmable es la estructura (hero minimalista + prueba social + badges de compliance), no la paleta ni tipografía exactas.

---

## Paleta actual de OPSYN (referencia, tomada de `css/styles.css` y `admin/admin.css`)

Para que las recomendaciones sean útiles, este es el punto de partida real del proyecto (no un referente externo):

| Token | Hex | Uso |
|---|---|---|
| `--primary-dark` | `#0D0326` | fondo base |
| `--primary-accent` | `#9434D4` | fondos/gradientes (violeta) |
| `--secondary-accent` | `#5A1CA1` | violeta secundario |
| `--accent-text` | `#C77DF0` | texto/hover sobre fondo oscuro |
| `--cyan` | `#79FFFF` | acento cian |
| `--teal` | `#2D89AD` | acento teal/azulado |
| `--text-light` | `#FFFFFF` | texto principal |
| `--success` / `--danger` / `--warning` | `#6BD98A` / `#F0687D` / `#E0A93A` | estados |

---

## 3 patrones aplicables a OPSYN por referente

**Linear** → (1) Tipografía Inter Display con tracking muy negativo en titulares grandes para dar sensación "de ingeniería seria" sin perder legibilidad. (2) Reservar el acento violeta/cian solo para bordes, estados hover e interacciones — no rellenar superficies grandes de color, dejar que el negro cósmico domine. (3) CTA de texto con flecha ("Ver más →") para navegación secundaria, botón sólido solo para la conversión principal.

**Stripe** → (1) Gradiente WebGL animado y fluido como fondo de hero (violeta-cian de OPSYN en vez de naranja-violeta), con fallback estático para performance/accesibilidad. (2) Bento-grid para mostrar casos/servicios combinando color e imagen real. (3) Tarjetas de pricing/servicio con datos concretos embebidos (igual que Stripe muestra "$0.01 por 1.000 unidades") en vez de descripciones abstractas.

**Vercel** → (1) Overlay de grilla sutil (~5% opacidad) sobre el fondo oscuro para dar textura "técnica" sin ruido visual pesado — encaja con identidad cósmica sin caer en cliché de estrellas. (2) Contraste de geometría: esquinas rectas en contenedores/inputs vs. pill totalmente redondeado en CTAs de conversión. (3) Un solo acento cromático dominante (cian en vez del verde de Vercel) usado con moderación en links y etiquetas, dejando el resto casi monocromo.

**Framer** → (1) Paneles de gradiente tipo "aurora" (violeta-cian) como bloques que rompen el fondo oscuro entre secciones, en vez de un fondo único continuo. (2) Efecto de texto con gradiente animado (aurora glow) en palabras clave del headline. (3) Tipografía display geométrica con tracking negativo extremo para titulares cortos y contundentes.

**Raycast** → (1) Un único acento cálido/vibrante (cian de OPSYN) reservado estrictamente a logo, arte de hero y badges — nunca en texto/íconos genéricos — para que el acento mantenga impacto. (2) Bordes hairline de 1px y sombras interiores sutiles en vez de sombras pesadas, para look "premium dark". (3) Feature de OpenType tipo `ss03` en Inter para un detalle tipográfico de firma propio.

**Notion** → (1) Escala de grises con tinte propio (en vez de cálido/ecru, un tinte frío-violeta) para que hasta los neutros lleven la identidad de marca. (2) Bordes ultra-finos semitransparentes en vez de sombras para separar tarjetas. (3) Combinar una sans para UI con una serif/editorial puntual para citas o testimonios, dando variación tipográfica sin romper el sistema.

**Apple** → (1) Espacio en blanco (o "espacio en negro" en este caso) generoso como jerarquía: mínimo 48-64px sobre/bajo headlines, 40px alrededor de imágenes de producto. (2) Estructura de "tiles" alternados full-width para presentar cada servicio/caso como si fuera un producto propio. (3) Renders/mockups ultra nítidos del producto (dashboard, panel admin) como hero visual en vez de ilustración abstracta.

**Arc** *(referencia de baja confiabilidad — 403 en fetch directo)* → (1) Un único gradiente saturado violeta-cian que fija la "temperatura emocional" de toda la sección hero. (2) Frosted glass / blur sobre superficies flotantes (nav, cards) para dar sensación de profundidad sin sombras duras. (3) Registro editorial puntual (serif o tipografía display distinta) en una sección narrativa, para diferenciar "voz de producto" de "voz de marca".

**Lovable** → (1) Gradiente de marca recorriendo el hero de forma sutil y "casi invisible" en vez de saturado, para no competir con el contenido. (2) Ícono/isotipo con relleno degradado (violeta→cian) reutilizado como motivo recurrente en toda la identidad. (3) Tipografía display con calidez humanista para balancear la frialdad técnica de una agencia de IA.

**Relevance AI** → (1) Panel de métricas en vivo (tareas procesadas, % de éxito, ahorro) como prueba social cuantitativa en el hero o en una sección temprana. (2) Ilustraciones de "agentes" numerados/catalogados si OPSYN quiere mostrar un catálogo de agentes de IA como producto. (3) Dos CTAs claros con roles distintos ("Agendar demo" vs. "Probar/Ver en acción").

**Sierra** → (1) Fila de badges de confianza/compliance (certificaciones, stack tecnológico, clientes) como elemento de diseño explícito, no solo como footer discreto. (2) Hero ultra minimalista (headline + subheading + un CTA) para páginas de caso de éxito o de servicio específico. (3) Uso de dashboards de producto real como imagen de refuerzo en vez de ilustración genérica.

---

## Síntesis final

### Paleta recomendada (evolución de la paleta actual de OPSYN, no un reemplazo)

Mantener la base ya definida en `css/styles.css` — es coherente y ya tiene buen contraste verificado (5.67:1 y 7.02:1 documentados en el propio CSS) — y afinarla con lo aprendido:

- **Fondo base:** `#0D0326` (ya existe) — casi negro violáceo, en línea con el enfoque "casi monocromo oscuro" de Linear/Raycast/Framer.
- **Fondo secundario/superficie:** introducir un paso intermedio tipo `#170a35` (ya usado en `admin.css` línea 573) como paso entre `#0D0326` y las tarjetas, dando la sensación de "capas" que usa Linear.
- **Acento primario (violeta):** `#9434D4` para fondos/gradientes, `#C77DF0` para texto/hover — ya definidos y correctos, mantener uso restringido (a la Raycast: nunca como color de texto/ícono genérico, solo en elementos de marca y estados).
- **Acento secundario (cian):** `#79FFFF` — usarlo como Vercel usa su verde: solo en links, etiquetas y micro-interacciones, nunca en superficies grandes, para que conserve impacto.
- **Gradiente de marca (nuevo, para hero):** `#9434D4 → #5A1CA1 → #2D89AD → #79FFFF` en diagonal o como aurora animada — combina los 4 acentos existentes en un único elemento "signature" al estilo Stripe/Lovable/Arc.
- **Grises de apoyo:** considerar un gris con tinte frío-violeta (no neutro puro) para textos secundarios, siguiendo la lógica de Notion pero coherente con la identidad cósmica.

### Pareja tipográfica recomendada

- **Display/titulares:** una variable sans geométrica con soporte de tracking negativo agresivo — **Inter Display** (gratuita, ya validada por Linear/Raycast/Notion, fácil de integrar) o, si se busca más carácter propio, una alternativa tipo **Geist** (Vercel, también gratuita vía Vercel Fonts). Usar pesos 500-600 con letter-spacing de -1px a -2px en tamaños grandes (48-72px).
- **Cuerpo/UI:** **Inter** (regular/variable), pesos 400-500 — máxima legibilidad, ecosistema maduro, coherente con el display elegido y con feature `ss03` activada para un detalle tipográfico propio (a la Raycast).
- **Opcional editorial:** si OPSYN quiere una sección narrativa/testimonios diferenciada (casos de éxito, blog), considerar una serif display puntual (inspirado en Notion/Arc) solo para citas — sin volverse el tipo principal del sitio.

Esta pareja (Inter Display + Inter, o Geist + Inter) es la opción de menor riesgo: gratuita, con excelente soporte variable-font, y ya validada por al menos tres de los diez referentes analizados.

### 5 efectos de mayor impacto / menor costo de performance

1. **Overlay de grilla sutil (~4-5% opacidad)** sobre el fondo oscuro (patrón Vercel) — es una imagen SVG/CSS estática, costo de render prácticamente nulo, y da textura "técnica" inmediata.
2. **Gradiente CSS estático o de bajo costo** (violeta→cian) en el hero, con opción de animarlo solo con `background-position`/`filter: hue-rotate` en vez de WebGL — capta el 80% del efecto "Stripe" sin el costo de una librería de shaders.
3. **Bordes hairline (1px, `rgba(255,255,255,0.08-0.12)`)** en vez de sombras/glow pesados en tarjetas — más liviano en render y refuerza la sensación "premium dark" de Raycast/Notion.
4. **Efecto de texto con gradiente en palabras clave del headline** (`background-clip: text`) — puro CSS, cero JS, impacto visual alto tipo Framer/Lovable.
5. **Transición de hover simple en botones** (cambio de color + `transform: translateY(-1px)` + sombra sutil) en vez de animaciones complejas — es el patrón que usan Linear/Notion/Apple, barato en performance y perceptualmente "caro" (se siente pulido).

Evitar (alto costo, bajo retorno para una landing de agencia): partículas 3D interactivas, escenas WebGL complejas tipo Three.js para fondos completos, y video de fondo autoplay en el hero — ninguno de los diez referentes analizados los usa como elemento principal; todos priorizan tipografía + un gradiente/textura simple + producto real (capturas/dashboards) por sobre efectos 3D costosos.

---

## Fuentes consultadas

- [Linear — Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh)
- [Linear — How we redesigned the Linear UI (part II)](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Linear design tokens — DesignMD](https://designmd.cc/benchmarks/linear)
- [Vercel Geist Colors](https://vercel.com/geist/colors)
- [Vercel design system — shadcn.io](https://www.shadcn.io/design/vercel)
- [Vercel — Introducing Geist Pixel](https://vercel.com/blog/introducing-geist-pixel)
- [Stripe gradient effect — Bram.us](https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect/)
- [Stripe design tokens — DesignMD](https://designmd.cc/benchmarks/stripe)
- [Raycast design system — shadcn.io](https://www.shadcn.io/design/raycast)
- [Raycast design tokens — Dembrandt](https://www.dembrandt.com/explorer/raycast)
- [Raycast — design.withfudge.com](https://design.withfudge.com/share/raycast.com-design)
- [Notion design system — shadcn.io](https://www.shadcn.io/design/notion)
- [Notion design tokens — DesignMD](https://designmd.cc/benchmarks/notion)
- [Apple DESIGN.md — designmd.fun](https://designmd.fun/apple/design-md)
- [Apple — awesome-design-md (VoltAgent)](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/apple/DESIGN.md)
- [Arc Browser design system — OpenDesign](https://open-design.ai/plugins/design-system-arc/)
- [Arc — design.withfudge.com](https://design.withfudge.com/share/arc.net-design)
- [Arc brand colors — Loftlyy](https://www.loftlyy.com/en/arc-browser)
- [Framer — awesome-design-md (VoltAgent)](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/framer/DESIGN.md)
- [Framer — design.withfudge.com](https://design.withfudge.com/share/framer.com-design)
- [Framer Marketplace — Aurora Gradient Tag](https://www.framer.com/marketplace/components/aurora-gradient-tag/)
- [Framer Marketplace — Text Aurora](https://www.framer.com/marketplace/components/text-aurora/)
- Fetch directo (WebFetch) de: linear.app, stripe.com, vercel.com, framer.com, raycast.com, notion.com, apple.com/iphone/, lovable.dev, relevanceai.com, sierra.ai (arc.net devolvió 403).

Nota final: para Sierra, Relevance AI y Arc la información verificable fue limitada (paleta/tipografía exactas no confirmadas). Se recomienda, si estos tres referentes son prioritarios para el rediseño, hacer una revisión visual manual directa (captura de pantalla + inspección de DevTools) antes de tomar decisiones de diseño basadas en ellos.
