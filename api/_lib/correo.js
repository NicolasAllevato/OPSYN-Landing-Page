// ========================================
// ENVÍO DE CORREO AL EQUIPO
// ========================================
// Canal principal: el Worker de Cloudflare (cloudflare/mailer), que manda el
// mail desde @opsyn.app. Si no está configurado, cae a Resend (opcional).
//
// Variables: MAILER_URL + MAILER_TOKEN (Cloudflare)
//            RESEND_API_KEY + CONTACT_TO_EMAIL (+ CONTACT_FROM_EMAIL) (Resend)

export const ERROR_SIN_CONFIGURAR = 'CONFIGURACION_INCOMPLETA';
export const ERROR_ENVIO = 'ERROR_ENVIO_EMAIL';

const TIMEOUT_MS = 15_000;

async function pedirConTimeout(url, opciones) {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opciones, signal: control.signal });
  } finally {
    clearTimeout(temporizador);
  }
}

async function enviarPorCloudflare({ asunto, texto, html, responderA }) {
  const respuesta = await pedirConTimeout(process.env.MAILER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.MAILER_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ asunto, texto, html, responderA }),
  });
  if (!respuesta.ok) {
    console.error('Correo: el mailer de Cloudflare respondió', respuesta.status, await respuesta.text().catch(() => ''));
    throw new Error(ERROR_ENVIO);
  }
}

async function enviarPorResend({ asunto, texto, html, responderA }) {
  const respuesta = await pedirConTimeout('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'OPSYN Landing <contacto@opsyn.dev>',
      to: [process.env.CONTACT_TO_EMAIL],
      ...(responderA ? { reply_to: responderA } : {}),
      subject: asunto,
      text: texto,
      ...(html ? { html } : {}),
    }),
  });
  if (!respuesta.ok) {
    console.error('Correo: Resend respondió', respuesta.status, await respuesta.text().catch(() => ''));
    throw new Error(ERROR_ENVIO);
  }
}

/** true si hay al menos un canal de correo configurado. */
export function correoConfigurado() {
  return Boolean(
    (process.env.MAILER_URL && process.env.MAILER_TOKEN) ||
      (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL),
  );
}

/**
 * Envía un mail al equipo de OPSYN.
 * @param {{ asunto: string, texto: string, html?: string, responderA?: string }} correo
 * @throws {Error} ERROR_SIN_CONFIGURAR si no hay canal, ERROR_ENVIO si el proveedor falla.
 */
export async function enviarCorreo(correo) {
  if (process.env.MAILER_URL && process.env.MAILER_TOKEN) return enviarPorCloudflare(correo);
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) return enviarPorResend(correo);
  console.error('Correo: falta configurar MAILER_URL/MAILER_TOKEN (o RESEND_API_KEY/CONTACT_TO_EMAIL).');
  throw new Error(ERROR_SIN_CONFIGURAR);
}
