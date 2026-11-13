# opsyn-mailer (Cloudflare Worker)

Dos envíos, ambos pedidos por las funciones de Vercel (`api/_lib/correo.js`) con `POST` y `Authorization: Bearer <MAILER_TOKEN>`:

| Modo | Binding | De → Para |
|------|---------|-----------|
| (por defecto) aviso al equipo | `EMAIL` (Email Routing, destino fijo) | `web@opsyn.app` → `opsyn.soluciones@gmail.com` |
| `tipo: "confirmacion"` | `CLIENTES` (Email Sending) | `contacto@opsyn.app` → el cliente que consultó |

La confirmación al cliente la arma `api/_lib/respuesta-cliente.js`: plantilla fija + un párrafo personalizado que escribe Gemini (filtrado; si falla, sale sin párrafo). El Worker rechaza confirmaciones con links a dominios que no sean opsyn.app.

## Estado en Cloudflare (cuenta "Opsyn wallet")
- Email Routing activo en `opsyn.app`, destino `opsyn.soluciones@gmail.com` verificado.
- Catch-all: todo `*@opsyn.app` se reenvía a `opsyn.soluciones@gmail.com` (además de la regla de `runa-ayuda@`).
- Email Sending activo para `opsyn.app` (cupo 200/día, destinatarios arbitrarios).

## Publicar
1. `npx wrangler login` y en la pantalla de permisos elegir la cuenta **Opsyn wallet**.
2. `cd cloudflare/mailer && npm i && npx wrangler deploy`
3. `npx wrangler secret put MAILER_TOKEN` y el mismo valor en Vercel como `MAILER_TOKEN` (Sensitive), junto con `MAILER_URL` (la URL que imprime el deploy) y `GEMINI_API_KEY`.
4. Redeploy de Vercel.
