// ========================================
// API SERVERLESS: FORMULARIO DE CONTACTO
// ========================================
// Vercel Serverless Function (Node.js runtime, sin build step).
// Envía el mensaje de contacto con api/_lib/correo.js (Worker de Cloudflare
// o, como respaldo, Resend) usando fetch nativo, sin dependencias externas.

import { enviarCorreo, enviarConfirmacionCliente } from './_lib/correo.js';
import { construirConfirmacion, redactarParrafo } from './_lib/respuesta-cliente.js';

// ----------------------------------------
// Configuración de rate limiting en memoria
// ----------------------------------------
// NOTA IMPORTANTE sobre el entorno de ejecución:
// En Vercel con Fluid Compute, la memoria del proceso puede reutilizarse
// entre invocaciones dentro de la MISMA instancia (contenedor), pero
// NO se comparte entre distintas instancias que Vercel escale en paralelo.
// Esto significa que este rate limiter es "best effort": limita bien
// bajo carga baja/moderada, pero un atacante distribuido en múltiples
// instancias podría superar el límite real. Si el volumen de tráfico
// crece o se necesita un límite estricto y global, migrar a un store
// compartido como Upstash Redis (@upstash/ratelimit) que sí es consistente
// entre instancias.
const VENTANA_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ENVIOS_POR_VENTANA = 5;
const registroEnvios = new Map(); // ip -> array de timestamps (ms)

/**
 * Limpia entradas viejas del registro de envíos para evitar
 * que la memoria crezca indefinidamente (memory leak).
 */
function limpiarRegistroViejo() {
  const ahora = Date.now();
  for (const [ip, timestamps] of registroEnvios.entries()) {
    const vigentes = timestamps.filter((t) => ahora - t < VENTANA_MS);
    if (vigentes.length === 0) {
      registroEnvios.delete(ip);
    } else {
      registroEnvios.set(ip, vigentes);
    }
  }
}

/**
 * Verifica si una IP superó el límite de envíos permitidos
 * dentro de la ventana de tiempo configurada.
 */
function excedeLimiteDeEnvios(ip) {
  limpiarRegistroViejo();
  const ahora = Date.now();
  const timestamps = registroEnvios.get(ip) || [];
  const vigentes = timestamps.filter((t) => ahora - t < VENTANA_MS);

  if (vigentes.length >= MAX_ENVIOS_POR_VENTANA) {
    registroEnvios.set(ip, vigentes);
    return true;
  }

  vigentes.push(ahora);
  registroEnvios.set(ip, vigentes);
  return false;
}

/**
 * Obtiene la IP del cliente a partir del header x-forwarded-for.
 * Vercel antepone la IP real del cliente a la lista.
 */
function obtenerIpCliente(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'desconocida';
}

// ----------------------------------------
// Sanitización de entrada
// ----------------------------------------

/**
 * Escapa caracteres HTML peligrosos para evitar inyección de HTML
 * al interpolar valores del usuario dentro del cuerpo del email.
 */
function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------
// Validación server-side
// ----------------------------------------

const SERVICIOS_VALIDOS = ['software', 'ia', 'consulting', 'marketing'];
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida los campos del formulario de contacto.
 * Devuelve { valido: boolean, error: string|null }.
 */
function validarDatosDeContacto(datos) {
  const { nombre, email, servicio, mensaje } = datos;

  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 100) {
    return { valido: false, error: 'El nombre debe tener entre 2 y 100 caracteres.' };
  }

  if (typeof email !== 'string' || email.length > 254 || !REGEX_EMAIL.test(email.trim())) {
    return { valido: false, error: 'El email ingresado no es válido.' };
  }

  if (typeof servicio !== 'string' || !SERVICIOS_VALIDOS.includes(servicio)) {
    return { valido: false, error: 'El tipo de servicio seleccionado no es válido.' };
  }

  if (typeof mensaje !== 'string' || mensaje.trim().length < 10 || mensaje.trim().length > 5000) {
    return { valido: false, error: 'El mensaje debe tener entre 10 y 5000 caracteres.' };
  }

  return { valido: true, error: null };
}

// ----------------------------------------
// Construcción del email
// ----------------------------------------

const ETIQUETAS_SERVICIO = {
  software: 'Desarrollo de software',
  ia: 'Agentes de IA y automatización',
  consulting: 'Consultoría tecnológica',
  marketing: 'Marketing digital'
};

/** Fecha y hora de recepción en Argentina, para el aviso al equipo. */
function fechaRecepcion() {
  const ahora = new Date();
  const zona = { timeZone: 'America/Argentina/Buenos_Aires' };
  return {
    fecha: ahora.toLocaleDateString('es-AR', { ...zona, day: '2-digit', month: '2-digit', year: 'numeric' }),
    hora: ahora.toLocaleTimeString('es-AR', { ...zona, hour: '2-digit', minute: '2-digit', hour12: false })
  };
}

/**
 * Construye el cuerpo HTML del aviso al equipo con la paleta de OPSYN.
 */
function construirCuerpoHtml({ nombre, email, servicio, mensaje }) {
  const { fecha, hora } = fechaRecepcion();
  const nombreSeguro = escapeHtml(nombre);
  const emailSeguro = escapeHtml(email);
  const servicioSeguro = escapeHtml(ETIQUETAS_SERVICIO[servicio] || servicio);
  const mensajeSeguro = escapeHtml(mensaje).replace(/
/g, '<br>');
  const fila = (etiqueta, valor) =>
    `<p style="margin: 0 0 10px;"><strong style="color: #79FFFF; display: inline-block; min-width: 80px;">${etiqueta}</strong> ${valor}</p>`;

  return `
    <div style="font-family: Arial, sans-serif; background-color: #0B0F14; color: #E6F7F7; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #101820; border-radius: 12px; overflow: hidden; border: 1px solid #2D89AD;">
        <div style="background: linear-gradient(135deg, #2D89AD, #79FFFF); padding: 20px 24px;">
          <h2 style="margin: 0; color: #0B0F14; font-size: 18px;">Nueva consulta desde opsyn.app</h2>
          <p style="margin: 4px 0 0; color: #0B0F14; font-size: 13px;">Recibida el ${fecha} a las ${hora} (hora de Argentina)</p>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 1px; color: #7D8B99;">DATOS DEL CONTACTO</p>
          ${fila('Nombre:', nombreSeguro)}
          ${fila('Email:', `<a href="mailto:${emailSeguro}" style="color: #E6F7F7;">${emailSeguro}</a>`)}
          ${fila('Servicio:', servicioSeguro)}
          ${fila('Origen:', 'Formulario de contacto')}
          <p style="margin: 20px 0 8px; font-size: 12px; letter-spacing: 1px; color: #7D8B99;">MENSAJE</p>
          <p style="margin: 0; line-height: 1.6; background-color: #0B0F14; padding: 12px 16px; border-radius: 8px; border: 1px solid #2D89AD;">${mensajeSeguro}</p>
          <p style="margin: 24px 0 0;"><a href="mailto:${emailSeguro}" style="display: inline-block; background: #79FFFF; color: #0B0F14; padding: 10px 18px; border-radius: 8px; font-weight: bold; text-decoration: none;">Responder a ${nombreSeguro}</a></p>
          <p style="margin: 16px 0 0; font-size: 12px; color: #7D8B99;">Al cliente ya le llegó la confirmación automática de recepción.</p>
        </div>
      </div>
    </div>
  `.trim();
}

/**
 * Construye la versión en texto plano del aviso al equipo.
 */
function construirCuerpoTexto({ nombre, email, servicio, mensaje }) {
  const { fecha, hora } = fechaRecepcion();
  return [
    'NUEVA CONSULTA DESDE OPSYN.APP',
    `Recibida el ${fecha} a las ${hora} (hora de Argentina)`,
    '',
    'DATOS DEL CONTACTO',
    `Nombre:    ${nombre}`,
    `Email:     ${email}`,
    `Servicio:  ${ETIQUETAS_SERVICIO[servicio] || servicio}`,
    'Origen:    Formulario de contacto',
    '',
    'MENSAJE',
    mensaje,
    '',
    '──────────',
    `Para contestarle, respondé este mail: le llega directo a ${email}.`
  ].join('
');
}

/**
 * Envía el aviso de la consulta al equipo de OPSYN.
 */
async function enviarEmailDeContacto(datos) {
  const nombreAsunto = datos.nombre.replace(/[
]+/g, ' ').trim();
  const asunto = `Nueva consulta: ${ETIQUETAS_SERVICIO[datos.servicio] || datos.servicio} — ${nombreAsunto}`;

  await enviarCorreo({
    asunto,
    texto: construirCuerpoTexto(datos),
    html: construirCuerpoHtml(datos),
    responderA: datos.email
  });
}

/**
 * Agente de respuesta: lee la consulta, redacta un párrafo personalizado y
 * le manda al cliente la confirmación de recepción. Si falla, la consulta
 * igual quedó registrada (el aviso al equipo ya salió): solo se loguea.
 */
// Una confirmación por dirección cada 24 h (best effort, en memoria de la
// instancia, igual que el rate limit por IP): frena que se use el formulario
// para inundar de mails la casilla de un tercero.
const VENTANA_CONFIRMACION_MS = 24 * 60 * 60 * 1000;
const confirmacionesEnviadas = new Map(); // email -> timestamp (ms)

function confirmacionReciente(email) {
  const ahora = Date.now();
  for (const [direccion, momento] of confirmacionesEnviadas) {
    if (ahora - momento >= VENTANA_CONFIRMACION_MS) confirmacionesEnviadas.delete(direccion);
  }
  const clave = email.toLowerCase();
  if (confirmacionesEnviadas.has(clave)) return true;
  confirmacionesEnviadas.set(clave, ahora);
  return false;
}

async function responderAlCliente(datos) {
  if (confirmacionReciente(datos.email)) return;
  try {
    const servicio = ETIQUETAS_SERVICIO[datos.servicio] || datos.servicio;
    const parrafo = await redactarParrafo({ ...datos, servicio });
    const correo = construirConfirmacion({ ...datos, servicio, parrafo });
    await enviarConfirmacionCliente({ para: datos.email, ...correo });
  } catch (error) {
    console.error('Contacto: no se pudo enviar la confirmación al cliente', error instanceof Error ? error.message : error);
  }
}

// ----------------------------------------
// Handler principal
// ----------------------------------------

/**
 * Handler de Vercel Serverless Function para el formulario de contacto.
 * Contrato de respuesta: { success: boolean, data: object|null, error: string|null }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      data: null,
      error: 'Método no permitido. Usá POST.'
    });
  }

  try {
    const body = req.body || {};
    const { nombre, email, servicio, mensaje, _gotcha } = body;

    // Honeypot: si viene con contenido, respondemos éxito falso sin enviar email.
    if (typeof _gotcha === 'string' && _gotcha.trim().length > 0) {
      return res.status(200).json({
        success: true,
        data: { enviado: true },
        error: null
      });
    }

    const { valido, error: errorValidacion } = validarDatosDeContacto({
      nombre,
      email,
      servicio,
      mensaje
    });

    if (!valido) {
      return res.status(400).json({
        success: false,
        data: null,
        error: errorValidacion
      });
    }

    const ip = obtenerIpCliente(req);
    if (excedeLimiteDeEnvios(ip)) {
      return res.status(429).json({
        success: false,
        data: null,
        error: 'Demasiados envíos. Por favor esperá unos minutos antes de intentar de nuevo.'
      });
    }

    const consulta = {
      nombre: nombre.trim(),
      email: email.trim(),
      servicio,
      mensaje: mensaje.trim()
    };

    await enviarEmailDeContacto(consulta);
    await responderAlCliente(consulta);

    return res.status(200).json({
      success: true,
      data: { enviado: true },
      error: null
    });
  } catch (error) {
    console.error('Error inesperado en /api/contact:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Ocurrió un error al procesar tu mensaje. Por favor intentá nuevamente más tarde.'
    });
  }
}
