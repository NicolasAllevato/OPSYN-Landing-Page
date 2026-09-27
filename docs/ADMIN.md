# Panel de administración local (Servicios / Agentes)

Herramienta **exclusivamente local** para agregar y editar, sin tocar código, los ítems
desplegables que aparecen al tocar cada tarjeta de la sección "Servicios" de la landing
(por ejemplo, los distintos tipos de agente de IA dentro de "Agentes de IA y automatización").

No requiere login ni base de datos: edita directamente `data/service-items.json`, que la
landing pública lee vía `fetch` en el navegador. Por eso corre **solo en tu máquina** y
**no se despliega a producción** (`admin/` y `scripts/` están excluidos del deploy de
Vercel en `.vercelignore`).

## Cómo usarlo

1. Levantar el servidor local del panel:
   ```bash
   npm run admin
   ```
2. Abrir en el navegador: `http://127.0.0.1:4321/admin`
3. Elegir la pestaña del servicio (por ejemplo, "Agentes de IA y automatización").
4. **Agregar**: botón "+ Agregar" → completar solo **título y descripción en Español**
   → el inglés se traduce solo al salir del campo (queda editable; botón "↻ Traducir"
   para forzar una nueva traducción) → Guardar.
5. **Editar/Eliminar**: usar los botones en cada tarjeta del tablero.

### "✨ Mejorar" — reescribir la descripción con IA (opcional)

Junto al campo "Descripción (Español)" hay un botón **"✨ Mejorar"**: toma lo que
escribiste (aunque sea una idea suelta o informal) y lo reescribe en un tono más
profesional con IA (Google Gemini). El resultado reemplaza el campo y queda 100%
editable — es un punto de partida, no un texto final obligatorio.

Requiere una API key gratis de Google (nivel gratis, sin tarjeta de crédito):

1. Andá a **https://aistudio.google.com/apikey** e iniciá sesión con tu cuenta de Google.
2. Clic en "Create API key" / "Crear clave de API" y copiala.
3. Creá un archivo `.env` en la raíz del proyecto (junto a `package.json` — mirá
   `.env.example` como referencia) con esta línea:
   ```
   GEMINI_API_KEY=tu_clave_aquí
   ```
4. Reiniciá `npm run admin` para que tome la clave.

`.env` ya está en `.gitignore` — la clave nunca se sube al repo ni se usa en producción.
Sin esta clave configurada, el botón "✨ Mejorar" simplemente avisa con un mensaje claro
(no rompe nada más del panel).

## Contacto y redes

Arriba del panel hay dos vistas: **Servicios** (lo de arriba) y **Contacto y redes**.
En esta última se edita `data/site-config.json`:

- **Email de contacto**: el que se ve en el pie de página y en las páginas legales.
  No cambia adónde llegan los mensajes del formulario: eso es la variable
  `CONTACT_TO_EMAIL` configurada en Vercel.
- **WhatsApp**: número en formato internacional, solo dígitos (país + área + número).
  Para celulares de Argentina: `549` + código de área sin 0 + número sin 15
  (ej. `5491122334455`). Podés pegarlo con `+`, espacios o guiones: se limpia solo.
  El link "(probar)" abre `wa.me` para verificarlo antes de guardar. Con número cargado
  aparecen: un botón flotante en todo el sitio, un link en el pie y un "¿Preferís
  WhatsApp?" debajo del formulario. El **mensaje inicial** (ES/EN) es el texto que
  aparece ya escrito en el chat; el inglés se traduce solo. Número vacío = no se
  muestra nada de WhatsApp.
- **Redes sociales**: Instagram, LinkedIn, Facebook, TikTok, X y YouTube. Link completo
  del perfil; las vacías no se muestran.

Validación: el servidor rechaza emails mal formados, números de WhatsApp de menos de 10
o más de 15 dígitos y links de redes que no sean `https://` del dominio de esa red (por
ejemplo, en Instagram solo se acepta `instagram.com`). La landing vuelve a validar al
leer el archivo (`js/site-config.js`), así que un valor inválido nunca llega a ser un link.

**Limitación conocida:** el bloque JSON-LD de `index.html` (datos para Google: `email` y
`sameAs`) es estático, porque su hash está fijado en la CSP de `vercel.json`. Si cambiás
el email o las redes de forma permanente, conviene actualizarlo también a mano y
regenerar el hash (ver `docs/ESTRUCTURA.md`, sección Seguridad).

## Publicar los cambios

Cada guardado escribe en `data/service-items.json` o `data/site-config.json` **y lo publica solo**: el servidor
local corre automáticamente `git add` / `git commit` / `git push` de ese archivo (y
solo de ese archivo — no toca otros cambios que tengas en curso en otra terminal).
Como el repo tiene auto-deploy en Vercel, el cambio llega a la web en ~1 minuto sin que
tengas que tocar git vos mismo. El panel te avisa con un banner si se publicó, si no
había nada nuevo, o si algo falló (por ejemplo, sin conexión a internet) — en ese último
caso podés publicarlo vos a mano:

```bash
git add data/service-items.json
git commit -m "content: actualizar tipos de agente"
git push
```

## Cómo funciona (para referencia técnica)

- `data/service-items.json`: fuente de verdad, bilingüe (`{ "es": "...", "en": "..." }`
  en cada `title`/`desc`), agrupada por servicio (`service1`..`service4`, en el mismo
  orden que las tarjetas de `index.html`).
- `js/service-items.js`: en la landing pública, carga ese JSON y agrega el desplegable
  (acordeón) solo a las tarjetas que tengan ítems cargados. Si una tarjeta no tiene
  ítems, se ve exactamente igual que antes (sin flecha ni comportamiento de clic).
- `admin/`: interfaz del panel (HTML/CSS/JS vanilla, sin dependencias).
- `scripts/admin-server.js`: servidor Node sin dependencias externas, escucha solo en
  `127.0.0.1:4321`, sirve `/admin` y expone `GET`/`PUT /api/admin/service-items` (leer y
  escribir el JSON, con auto-publish a git), `POST /api/admin/translate` (traducción
  ES→EN vía MyMemory, gratis, sin key) y `POST /api/admin/enhance-description`
  (reescritura con IA vía Gemini, requiere `GEMINI_API_KEY` en `.env`). No es una Vercel
  Function ni se expone en producción.

## Agregar un quinto servicio (u otro) más adelante

Si en el futuro se agrega una quinta tarjeta de servicio en `index.html`:

1. Agregar `data-service-id="service5"` a la tarjeta nueva y un
   `<div class="service-items" hidden></div>` dentro, igual que las existentes.
2. Agregar `"service5": []` a `data/service-items.json`.
3. Agregar `{ id: 'service5', label: '...' }` al arreglo `SERVICES` en `admin/admin.js`
   y a `VALID_SERVICE_IDS` en `scripts/admin-server.js`.
