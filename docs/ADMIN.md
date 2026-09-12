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
4. **Agregar**: botón "+ Agregar" → completar título y descripción en Español e Inglés → Guardar.
5. **Editar/Eliminar**: usar los botones en cada tarjeta del tablero.

Cada guardado escribe inmediatamente en `data/service-items.json`. Los cambios se ven
al recargar `index.html` (local, con `npm start`, o en tu entorno de desarrollo).

## Publicar los cambios

`data/service-items.json` es un archivo versionado normal del repo. Para que los cambios
lleguen a producción:

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
  `127.0.0.1:4321`, sirve `/admin` y expone `GET`/`PUT /api/admin/service-items` para
  leer y escribir el JSON. No es una Vercel Function ni se expone en producción.

## Agregar un quinto servicio (u otro) más adelante

Si en el futuro se agrega una quinta tarjeta de servicio en `index.html`:

1. Agregar `data-service-id="service5"` a la tarjeta nueva y un
   `<div class="service-items" hidden></div>` dentro, igual que las existentes.
2. Agregar `"service5": []` a `data/service-items.json`.
3. Agregar `{ id: 'service5', label: '...' }` al arreglo `SERVICES` en `admin/admin.js`
   y a `VALID_SERVICE_IDS` en `scripts/admin-server.js`.
