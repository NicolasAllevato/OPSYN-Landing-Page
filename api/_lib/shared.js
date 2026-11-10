// ========================================
// UTILIDADES COMPARTIDAS DE LAS FUNCIONES /api
// (los archivos bajo api/_lib no se publican como rutas)
// ========================================

/**
 * Crea un limitador de envíos por clave (IP) en memoria.
 * Es "best effort": la memoria se comparte solo dentro de una misma
 * instancia de la función, no entre instancias que Vercel escale en paralelo.
 * Devuelve una función (clave) => boolean: true si superó el límite.
 */
export function crearLimitador({ ventanaMs, maximo }) {
  const registro = new Map();

  return function excedeLimite(clave) {
    const ahora = Date.now();
    for (const [k, marcas] of registro.entries()) {
      const vigentes = marcas.filter((t) => ahora - t < ventanaMs);
      if (vigentes.length === 0) registro.delete(k);
      else registro.set(k, vigentes);
    }
    const vigentes = registro.get(clave) || [];
    if (vigentes.length >= maximo) return true;
    registro.set(clave, [...vigentes, ahora]);
    return false;
  };
}

/** IP del cliente: Vercel antepone la IP real en x-forwarded-for. */
export function obtenerIpCliente(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || 'desconocida';
}

/** Escapa HTML para interpolar texto del usuario en el cuerpo de un email. */
export function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
