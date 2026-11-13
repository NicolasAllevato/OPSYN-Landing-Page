// ========================================
// API SERVERLESS: ASISTENTE VIRTUAL DE OPSYN
// ========================================
// Vercel Serverless Function (Node.js, sin build ni dependencias).
// Recibe el historial de la conversación (la "memoria" vive en el
// navegador del visitante), responde con Gemini usando solo contenido
// publicado en la web (servicios, marca y documentos legales) y, cuando el
// visitante acepta que lo contacten, deriva el lead al equipo (email por
// Resend y/o webhook).
//
// Seguridad en capas (ver api/_lib/seguridad.js): detección de manipulación,
// datos sensibles ocultos antes de llegar al modelo, filtro de la respuesta
// y leads validados contra lo que escribió el visitante.
//
// Contrato: POST { messages: [{ role, content }], lang }
//        →  { success, data: { reply, lead, delivered }, error }

import { crearLimitador, obtenerIpCliente, escapeHtml } from './_lib/shared.js';
import { cargarConocimiento } from './_lib/conocimiento.js';
import { consultarGemini, ERROR_CUOTA } from './_lib/gemini.js';
import {
  detectarManipulacion,
  redactarSensibles,
  filtrarRespuesta,
  emailsDelVisitante,
  contactoPresenteEnMensajes,
} from './_lib/seguridad.js';

const MAX_MENSAJES = 24;          // memoria básica: últimos turnos de la charla
const MAX_CARACTERES_MENSAJE = 1000;
const EMAIL_EQUIPO = 'opsyn.soluciones@gmail.com';

// 20 mensajes cada 10 minutos por IP (best effort, ver api/_lib/shared.js).
const excedeLimite = crearLimitador({ ventanaMs: 10 * 60 * 1000, maximo: 20 });

// ----------------------------------------
// Validación de entrada
// ----------------------------------------

function normalizarMensajes(crudos) {
  if (!Array.isArray(crudos) || crudos.length === 0) return null;
  const mensajes = [];
  for (const m of crudos.slice(-MAX_MENSAJES)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return null;
    const contenido = redactarSensibles(m.content.trim().slice(0, MAX_CARACTERES_MENSAJE));
    if (!contenido) return null;
    mensajes.push({ role: m.role, content: contenido });
  }
  // La API exige empezar por el usuario y terminar por el usuario.
  while (mensajes.length && mensajes[0].role !== 'user') mensajes.shift();
  if (!mensajes.length || mensajes[mensajes.length - 1].role !== 'user') return null;
  // Colapsa turnos consecutivos del mismo rol (no deberían llegar, pero la API los rechaza).
  return mensajes.reduce((acc, m) => {
    const ultimo = acc[acc.length - 1];
    if (ultimo && ultimo.role === m.role) {
      return [...acc.slice(0, -1), { role: m.role, content: `${ultimo.content}\n${m.content}` }];
    }
    return [...acc, m];
  }, []);
}

function normalizarLead(entrada) {
  if (!entrada || typeof entrada !== 'object') return null;
  const texto = (valor, max) => (typeof valor === 'string' ? valor.replace(/[\r\n]+/g, ' ').trim().slice(0, max) : '');
  const lead = {
    nombre: texto(entrada.nombre, 100),
    contacto: texto(entrada.contacto, 160),
    servicio: ['software', 'ia', 'consulting', 'marketing'].includes(entrada.servicio) ? entrada.servicio : 'otro',
    resumen: typeof entrada.resumen === 'string' ? entrada.resumen.trim().slice(0, 1200) : '',
  };
  return lead.nombre.length >= 2 && contactoValido(lead.contacto) ? lead : null;
}

const REGEX_EMAIL_EXACTO = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

/** Un email único y bien formado, o un teléfono/WhatsApp con al menos 8 dígitos. */
function contactoValido(contacto) {
  if (contacto.includes('@')) return REGEX_EMAIL_EXACTO.test(contacto);
  return /^[+\d\s().-]+$/.test(contacto) && contacto.replace(/\D/g, '').length >= 8;
}

// ----------------------------------------
// Derivación del lead al equipo
// ----------------------------------------

const ETIQUETAS_LEAD = {
  software: 'Desarrollo de software',
  ia: 'Agentes de IA y automatización',
  consulting: 'Consultoría tecnológica',
  marketing: 'Marketing digital',
  otro: 'A definir',
};

function transcripcion(mensajes) {
  return mensajes.map((m) => `${m.role === 'user' ? 'Visitante' : 'Asistente'}: ${m.content}`).join('\n');
}

async function enviarLeadPorEmail(lead, mensajes) {
  const apiKey = process.env.RESEND_API_KEY;
  const destinatario = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !destinatario) return false;

  const servicio = ETIQUETAS_LEAD[lead.servicio];
  const charla = transcripcion(mensajes);
  const fila = (etiqueta, valor) =>
    `<p style="margin:0 0 12px;"><strong style="color:#79FFFF;">${etiqueta}:</strong> ${escapeHtml(valor)}</p>`;

  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'OPSYN Landing <contacto@opsyn.dev>',
      to: [destinatario],
      ...(lead.contacto.includes('@') ? { reply_to: lead.contacto } : {}),
      subject: `Lead del asistente: ${lead.nombre} — ${servicio}`,
      html: `<div style="font-family:Arial,sans-serif;background:#0B0F14;color:#E6F7F7;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#101820;border-radius:12px;border:1px solid #2D89AD;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#9434D4,#2D89AD);padding:20px 24px;"><h2 style="margin:0;color:#fff;font-size:18px;">Nuevo lead desde el asistente de OPSYN</h2></div>
    <div style="padding:24px;">
      ${fila('Nombre', lead.nombre)}${fila('Contacto', lead.contacto)}${fila('Servicio', servicio)}${fila('Resumen', lead.resumen)}
      <p style="margin:16px 0 8px;color:#79FFFF;"><strong>Conversación:</strong></p>
      <p style="margin:0;line-height:1.6;background:#0B0F14;padding:12px 16px;border-radius:8px;border:1px solid #2D89AD;">${escapeHtml(charla).replace(/\n/g, '<br>')}</p>
    </div>
  </div>
</div>`,
      text: `Nuevo lead desde el asistente de OPSYN\n\nNombre: ${lead.nombre}\nContacto: ${lead.contacto}\nServicio: ${servicio}\nResumen: ${lead.resumen}\n\nConversación:\n${charla}`,
    }),
  });
  if (!respuesta.ok) {
    console.error('Lead: Resend respondió', respuesta.status, await respuesta.text().catch(() => ''));
    return false;
  }
  return true;
}

async function enviarLeadPorWebhook(lead, mensajes) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return false;
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origen: 'asistente-opsyn', ...lead, conversacion: transcripcion(mensajes) }),
  });
  if (!respuesta.ok) console.error('Lead: el webhook respondió', respuesta.status);
  return respuesta.ok;
}

/** Devuelve true si el lead llegó al equipo por al menos un canal. */
async function derivarLead(lead, mensajes) {
  const resultados = await Promise.allSettled([enviarLeadPorEmail(lead, mensajes), enviarLeadPorWebhook(lead, mensajes)]);
  resultados.forEach((r) => {
    if (r.status === 'rejected') console.error('Lead: fallo de envío', r.reason);
  });
  return resultados.some((r) => r.status === 'fulfilled' && r.value === true);
}

const TEXTOS = {
  es: {
    leadOk: '¡Listo! Ya le pasé tus datos al equipo. Una persona de OPSYN te va a escribir a la brevedad.',
    leadPendiente: 'Ya tengo tus datos. Para que le lleguen al equipo ahora mismo, tocá uno de los botones de abajo.',
    leadIncompleto: 'Para pasarle tus datos al equipo necesito tu nombre y un contacto (WhatsApp o email). ¿Me los dejás?',
    vacio: 'Perdón, no pude armar una respuesta. ¿Me lo contás de otra forma?',
    rechazo: 'Eso no lo puedo hacer ni compartir. Sí puedo contarte sobre los servicios de OPSYN, cómo trabajamos o lo que dicen nuestras políticas. ¿Qué necesitás?',
  },
  en: {
    leadOk: "Done! I've passed your details to the team. Someone from OPSYN will reach out shortly.",
    leadPendiente: 'I have your details. To get them to the team right now, tap one of the buttons below.',
    leadIncompleto: 'To pass your details to the team I need your name and a contact (WhatsApp or email). Could you share them?',
    vacio: "Sorry, I couldn't put an answer together. Could you rephrase that?",
    rechazo: "I can't do or share that. I can tell you about OPSYN's services, how we work, or what our policies say. What do you need?",
  },
};

// ----------------------------------------
// Handler principal
// ----------------------------------------

const responder = (res, estado, data, error) => res.status(estado).json({ success: !error, data, error: error || null });
const sinLead = (reply) => ({ reply, lead: null, delivered: false });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return responder(res, 405, null, 'Método no permitido. Usá POST.');
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('Chat: falta GEMINI_API_KEY.');
    return responder(res, 503, null, 'El asistente no está disponible en este momento.');
  }

  try {
    const body = req.body || {};
    const textos = TEXTOS[body.lang === 'en' ? 'en' : 'es'];
    const mensajes = normalizarMensajes(body.messages);
    if (!mensajes) return responder(res, 400, null, 'La conversación enviada no es válida.');

    if (excedeLimite(obtenerIpCliente(req))) {
      return responder(res, 429, null, 'Demasiados mensajes seguidos. Esperá unos minutos y seguimos.');
    }

    // Intento evidente de manipulación: se responde sin gastar una llamada al modelo.
    if (detectarManipulacion(mensajes[mensajes.length - 1].content)) {
      return responder(res, 200, sinLead(textos.rechazo));
    }

    const resultado = await consultarGemini(mensajes, await cargarConocimiento());
    if (resultado.bloqueado) return responder(res, 200, sinLead(textos.rechazo));

    const filtrada = filtrarRespuesta(resultado.texto, {
      emailsPermitidos: [EMAIL_EQUIPO, ...emailsDelVisitante(mensajes)],
    });
    if (filtrada.bloqueada) {
      console.error('Chat: respuesta bloqueada por posible fuga de información interna.');
      return responder(res, 200, sinLead(textos.rechazo));
    }

    const lead = normalizarLead(resultado.lead);
    // Solo se deriva si el contacto lo escribió el visitante (defensa contra inyección de prompt).
    if (!lead || !contactoPresenteEnMensajes(lead.contacto, mensajes)) {
      const sinDatos = resultado.lead ? textos.leadIncompleto : null;
      return responder(res, 200, sinLead(filtrada.texto || sinDatos || textos.vacio));
    }

    const entregado = await derivarLead(lead, mensajes);
    return responder(res, 200, {
      reply: entregado ? textos.leadOk : textos.leadPendiente,
      lead,
      delivered: entregado,
    });
  } catch (error) {
    if (error instanceof Error && error.message === ERROR_CUOTA) {
      return responder(res, 503, null, 'El asistente está con mucha demanda en este momento. Probá de nuevo en un minuto o escribinos por el formulario.');
    }
    console.error('Error inesperado en /api/chat:', error);
    return responder(res, 500, null, 'El asistente tuvo un problema. Probá de nuevo en un momento.');
  }
}
