# API de contacto — OPSYN Landing

Este directorio contiene la Serverless Function de Vercel que procesa el formulario de contacto de la landing.

## Archivos

- `contact.js` — Handler de `POST /api/contact`. Valida los datos, aplica honeypot y rate limiting, sanitiza el input y envía el email vía Resend usando `fetch` nativo (sin SDK, sin dependencias nuevas).

## Configuración de Resend

1. Crear una cuenta en https://resend.com
2. Verificar un dominio propio (o usar el dominio de pruebas de Resend mientras se verifica el definitivo) en **Domains**.
3. Generar una API Key en https://resend.com/api-keys.
4. Ajustar el remitente (`from`) en `contact.js` para que use un dominio verificado en tu cuenta de Resend (por defecto está seteado a `OPSYN Landing <contacto@opsyn.dev>` — cambiarlo si el dominio verificado es otro).

## Variables de entorno requeridas

Configurar en **Vercel → Project Settings → Environment Variables** (Production, Preview y Development):

| Variable            | Descripción                                                        |
|---------------------|---------------------------------------------------------------------|
| `RESEND_API_KEY`     | API Key generada en Resend.                                        |
| `CONTACT_TO_EMAIL`   | Email que recibirá los mensajes enviados desde el formulario.       |

Ver `.env.example` en la raíz del proyecto para referencia local (no contiene valores reales).

Si falta alguna de estas variables, `contact.js` responde con un `500` genérico al cliente y registra el detalle del error solo en los logs del servidor (nunca expone qué variable falta).

## Contrato de la API

### `POST /api/contact`

**Request body (JSON):**

```json
{
  "nombre": "string (2-100 caracteres)",
  "email": "string (email válido, máx 254 caracteres)",
  "servicio": "software | ia | consulting | marketing",
  "mensaje": "string (10-5000 caracteres)",
  "_gotcha": "string opcional (honeypot, debe quedar vacío)"
}
```

**Response body (siempre este envoltorio):**

```json
{
  "success": true,
  "data": { "enviado": true },
  "error": null
}
```

En caso de error:

```json
{
  "success": false,
  "data": null,
  "error": "Mensaje de error legible en español"
}
```

**Códigos de estado:**

- `200` — Envío exitoso (o honeypot detectado, para no dar señal al bot).
- `400` — Validación fallida (campo inválido).
- `405` — Método distinto de POST (incluye header `Allow: POST`).
- `429` — Rate limit excedido (máximo 5 envíos cada 15 minutos por IP).
- `500` — Error interno (configuración faltante o falla al enviar el email). Nunca expone detalles internos.

## Rate limiting

El límite se implementa en memoria (`Map` con timestamps por IP, ventana de 15 minutos, máximo 5 envíos). En Vercel con Fluid Compute, la memoria puede compartirse entre invocaciones de la **misma instancia**, pero no entre instancias distintas que Vercel escale en paralelo — por lo tanto es un límite "best effort". Si el tráfico crece o se necesita un límite estricto y consistente, migrar a un store compartido como **Upstash Redis** (`@upstash/ratelimit`).

## Seguridad

- Todo el input del usuario se sanitiza (`escapeHtml`) antes de interpolarse en el HTML del email, para evitar inyección de HTML.
- La validación es 100% server-side; nunca se confía en los atributos `required` del HTML del cliente.
- El campo honeypot `_gotcha` permite filtrar bots sin darles señal de que fueron detectados.
