// ========================================
// SEGURIDAD DEL ASISTENTE
// ========================================
// Defensas en capas alrededor del modelo (el prompt por sí solo no alcanza):
//  1. Entrada: detecta intentos de manipulación y oculta datos sensibles
//     (tarjetas, CBU, contraseñas) antes de enviarlos al proveedor de IA.
//  2. Salida: bloquea fugas del prompt interno o de claves y oculta
//     emails ajenos que el modelo pudiera inventar o filtrar.
//  3. Leads: solo se derivan si el contacto lo escribió el propio visitante.

/** Marca secreta dentro del prompt: si aparece en una respuesta, hubo fuga. */
export const CANARIO = 'ZX-OPSYN-4471-QK';

const OMITIDO = '[dato sensible omitido]';

const quitarAcentos = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');

// ----------------------------------------
// Entrada
// ----------------------------------------

const PATRONES_MANIPULACION = [
  /(ignor|olvid|descart|salte|omit)\w*\s+(todas?\s+)?(las\s+|tus\s+|sus\s+|esas\s+)?(instrucciones|reglas|indicaciones|restricciones)/,
  /ignore\s+(all\s+|any\s+)?(the\s+)?(previous|prior|above|your|these)\s+(instructions|rules)/,
  /(revel|muestr|mostr|repet|escrib|imprim|dec|dame|pasa|copia|show|reveal|print|repeat|tell)\w*\s+(me\s+)?(tu|tus|el|las|la|your|the)\s+(system\s+)?(prompt|instrucciones|reglas|configuracion|instructions)/,
  /system\s*prompt|prompt\s+(del\s+|de\s+)?sistema|instrucciones\s+(internas|ocultas|del\s+sistema)/,
  /(modo|mode)\s+(desarrollador|developer|dios|god|debug|admin)/,
  /jailbreak|do\s+anything\s+now|\bact\s+as\s+dan\b|modo\s+dan\b/,
  /a\s+partir\s+de\s+(ahora|este\s+momento)\s+(sos|eres|actua|vas\s+a\s+ser)/,
  /you\s+are\s+now\b/,
];

/** true si el texto parece un intento de cambiar o extraer las reglas del asistente. */
export function detectarManipulacion(texto) {
  const normal = quitarAcentos(String(texto)).toLowerCase();
  return PATRONES_MANIPULACION.some((patron) => patron.test(normal));
}

function pasaLuhn(digitos) {
  let suma = 0;
  let doble = false;
  for (let i = digitos.length - 1; i >= 0; i -= 1) {
    let valor = Number(digitos[i]);
    if (doble) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }
    suma += valor;
    doble = !doble;
  }
  return suma % 10 === 0;
}

/**
 * Oculta datos que nunca deberían viajar al proveedor de IA ni quedar en el
 * mail al equipo: tarjetas (15-19 dígitos que pasan Luhn), CBU (22 dígitos)
 * y contraseñas/PIN dichos en el chat. Los teléfonos (≤13 dígitos) no se tocan.
 */
export function redactarSensibles(texto) {
  return String(texto)
    .replace(/\d(?:[ -]?\d){14,21}/g, (coincidencia) => {
      const digitos = coincidencia.replace(/\D/g, '');
      const esCbu = digitos.length === 22;
      const esTarjeta = digitos.length >= 15 && digitos.length <= 19 && pasaLuhn(digitos);
      return esCbu || esTarjeta ? OMITIDO : coincidencia;
    })
    .replace(/\b(contrase[ñn]a|password|clave|pin)\b\s*(?:es|is|:|=)\s*\S+/gi, (_, palabra) => `${palabra}: ${OMITIDO}`);
}

// ----------------------------------------
// Salida
// ----------------------------------------

const PATRONES_SECRETOS = [
  /AIza[0-9A-Za-z_-]{20,}/,
  /\bsk-[A-Za-z0-9_-]{16,}/,
  /\bre_[A-Za-z0-9]{16,}/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}/,
  /\bBearer\s+[A-Za-z0-9._-]{16,}/,
];

const ENCABEZADOS_PROMPT = /^#{1,6}\s*(reglas de seguridad|qu[eé] hac[eé]s|c[oó]mo habl[aá]s|cat[aá]logo de servicios|documentos publicados|contexto de marca)/im;

const REGEX_EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

/**
 * Revisa lo que respondió el modelo antes de mostrarlo.
 * @param {string} texto
 * @param {{ emailsPermitidos: string[] }} opciones emails que sí pueden aparecer
 *   (el del equipo y los que escribió el propio visitante).
 * @returns {{ texto: string, bloqueada: boolean }}
 */
export function filtrarRespuesta(texto, { emailsPermitidos = [] } = {}) {
  const original = String(texto);
  const hayFuga =
    original.includes(CANARIO) ||
    PATRONES_SECRETOS.some((patron) => patron.test(original)) ||
    ENCABEZADOS_PROMPT.test(original);
  if (hayFuga) return { texto: '', bloqueada: true };

  const permitidos = new Set(emailsPermitidos.map((e) => e.toLowerCase()));
  const limpio = original
    // El widget muestra texto plano: se quita el markdown que el modelo a veces agrega igual.
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\b\d{2}-?\d{8}-?\d\b/g, '[dato omitido]') // CUIT/CUIL
    .replace(REGEX_EMAIL, (email) => (permitidos.has(email.toLowerCase()) ? email : '[dato omitido]'))
    .trim();
  return { texto: limpio, bloqueada: false };
}

/** Emails presentes en los mensajes del visitante (los únicos ajenos que se pueden repetir). */
export function emailsDelVisitante(mensajes) {
  return mensajes
    .filter((m) => m.role === 'user')
    .flatMap((m) => m.content.match(REGEX_EMAIL) || []);
}

// ----------------------------------------
// Leads
// ----------------------------------------

/**
 * Un lead solo es válido si el contacto aparece en lo que escribió el visitante.
 * Evita que una inyección de prompt haga derivar contactos inventados o ajenos.
 */
export function contactoPresenteEnMensajes(contacto, mensajes) {
  const delVisitante = mensajes.filter((m) => m.role === 'user').map((m) => m.content);
  if (contacto.includes('@')) {
    const buscado = contacto.trim().toLowerCase();
    return delVisitante.some((texto) => texto.toLowerCase().includes(buscado));
  }
  const digitos = contacto.replace(/\D/g, '');
  if (digitos.length < 6) return false;
  return delVisitante.some((texto) => texto.replace(/\D/g, '').includes(digitos));
}
