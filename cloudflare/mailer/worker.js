// ========================================
// OPSYN MAILER (Cloudflare Worker)
// ========================================
// Recibe un pedido autenticado desde las funciones de Vercel (formulario de
// contacto y asistente) y manda el mail al equipo con el binding `send_email`
// de Cloudflare Email Routing. El destinatario está fijo en la configuración:
// aunque alguien robara el token, solo podría escribirle al equipo de OPSYN.

import { EmailMessage } from 'cloudflare:email';

const MAX_ASUNTO = 200;
const MAX_CUERPO = 50_000;
const REGEX_EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;

const respuestaJson = (estado, cuerpo) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Comparación en tiempo constante para no filtrar el token por diferencias de tiempo. */
async function tokenValido(recibido, esperado) {
  if (!recibido || !esperado) return false;
  const codificador = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', codificador.encode(recibido)),
    crypto.subtle.digest('SHA-256', codificador.encode(esperado)),
  ]);
  const va = new Uint8Array(a);
  const vb = new Uint8Array(b);
  let diferencia = 0;
  for (let i = 0; i < va.length; i += 1) diferencia |= va[i] ^ vb[i];
  return diferencia === 0;
}

const linea = (texto) => String(texto ?? '').replace(/[\r\n]+/g, ' ').trim();

/** Base64 de un texto UTF-8, cortado en líneas de 76 caracteres (RFC 2045). */
function base64Utf8(texto) {
  const bytes = new TextEncoder().encode(texto);
  let binario = '';
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/.{1,76}/g, '$&\r\n').trimEnd();
}

/** Encabezado con acentos o emojis codificado según RFC 2047. */
const encabezadoUtf8 = (texto) => `=?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(texto)))}?=`;

function construirMime({ de, nombreDe, para, asunto, texto, html, responderA, dominio }) {
  const limite = `opsyn-${crypto.randomUUID()}`;
  const encabezados = [
    `From: ${encabezadoUtf8(nombreDe)} <${de}>`,
    `To: ${para}`,
    `Subject: ${encabezadoUtf8(asunto)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${dominio}>`,
    'MIME-Version: 1.0',
  ];
  if (responderA) encabezados.push(`Reply-To: ${responderA}`);

  const partes = [`--${limite}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', base64Utf8(texto)];
  if (html) {
    partes.push(`--${limite}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', base64Utf8(html));
  }
  partes.push(`--${limite}--`, '');

  return [...encabezados, `Content-Type: multipart/alternative; boundary="${limite}"`, '', ...partes].join('\r\n');
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return respuestaJson(405, { ok: false, error: 'Método no permitido' });

    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!(await tokenValido(token, env.MAILER_TOKEN))) return respuestaJson(401, { ok: false, error: 'No autorizado' });

    let datos;
    try {
      datos = await request.json();
    } catch {
      return respuestaJson(400, { ok: false, error: 'JSON inválido' });
    }

    const asunto = linea(datos?.asunto).slice(0, MAX_ASUNTO);
    const texto = typeof datos?.texto === 'string' ? datos.texto.slice(0, MAX_CUERPO) : '';
    const html = typeof datos?.html === 'string' ? datos.html.slice(0, MAX_CUERPO) : '';
    const responderA = linea(datos?.responderA);
    if (!asunto || !texto) return respuestaJson(400, { ok: false, error: 'Faltan asunto o texto' });
    if (responderA && !REGEX_EMAIL.test(responderA)) return respuestaJson(400, { ok: false, error: 'responderA inválido' });

    const de = env.REMITENTE;
    const mime = construirMime({
      de,
      nombreDe: env.NOMBRE_REMITENTE || 'OPSYN Web',
      para: env.DESTINO,
      asunto,
      texto,
      html,
      responderA,
      dominio: de.split('@')[1],
    });

    try {
      await env.EMAIL.send(new EmailMessage(de, env.DESTINO, mime));
      return respuestaJson(200, { ok: true });
    } catch (error) {
      console.error('Mailer: fallo al enviar', error instanceof Error ? error.message : error);
      return respuestaJson(502, { ok: false, error: 'No se pudo enviar el mail' });
    }
  },
};
