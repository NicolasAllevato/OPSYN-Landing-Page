# opsyn-mailer (Cloudflare Worker)

Envía por mail los mensajes del formulario de contacto y los leads del asistente, desde `web@opsyn.app` hacia `opsyn.soluciones@gmail.com`. Las funciones de Vercel (`api/_lib/correo.js`) lo llaman con `POST` y `Authorization: Bearer <MAILER_TOKEN>`.

## Puesta en marcha
1. Cloudflare → `opsyn.app` → **Email → Email Routing** → activar (agrega los registros MX/SPF).
2. En **Destination addresses** agregar y verificar `opsyn.soluciones@gmail.com` (llega un mail de confirmación).
3. `cd cloudflare/mailer && wrangler deploy`
4. Token compartido: `wrangler secret put MAILER_TOKEN` y el mismo valor en Vercel como `MAILER_TOKEN` (Sensitive), junto con `MAILER_URL` (la URL que imprime el deploy).
5. Redeploy de Vercel.

El destinatario está fijo en `wrangler.toml`: el Worker solo puede escribirle al equipo.
