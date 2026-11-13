// ========================================
// CONOCIMIENTO DEL ASISTENTE
// ========================================
// Todo lo que el asistente puede decir sale de contenido ya publicado en la web:
// el catálogo de servicios, el texto de marca y los documentos legales.
// Los documentos se leen de las propias páginas HTML, así que al actualizar
// una política el asistente queda al día sin tocar código.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const SITIO = 'https://opsyn.app';

const ETIQUETAS_SERVICIO = {
  service1: 'Desarrollo de software',
  service2: 'Agentes de IA y automatización',
  service3: 'Consultoría tecnológica',
  service4: 'Marketing digital',
};

const DOCUMENTOS = [
  { archivo: 'privacidad.html', titulo: 'Política de Privacidad' },
  { archivo: 'terminos.html', titulo: 'Términos y Condiciones' },
  { archivo: 'cookies.html', titulo: 'Política de Cookies' },
  { archivo: 'eliminar-datos.html', titulo: 'Cómo eliminar tus datos' },
];

// Texto de marca publicado en la home (js/main.js, versión en español).
export const TEXTO_MARCA = `OPSYN (Opsyn Soluciones) es una agencia boutique argentina, partner tecnológico integral. Lema: "somos una idea, somos un proyecto, somos la solución para vos".
Propuesta: pensamos tu negocio antes de programar y te acompañamos de cerca en cada paso. Combinamos visión estratégica y ejecución técnica, sin capas corporativas y con trato directo: desde digitalizar un negocio desde cero hasta llevarlo al siguiente nivel con IA.
Quiénes somos: OPSYN nació para cerrar la brecha entre las agencias tradicionales, lentas y con capas de gestión, y el freelancer suelto que resuelve tareas puntuales sin mirar el negocio completo. Se piensa primero el negocio (cómo funciona, a dónde quiere llegar) y recién después se programa, trabajando codo a codo con respuestas rápidas y decisiones compartidas. Puntos fuertes: visión estratégica (no se empieza por el código sino por el negocio), trato cercano (se habla directo con quien construye, sin intermediarios) y ejecución técnica real (lo que se diseña, se construye y se sostiene). Cuatro áreas de servicio. Atención en español e inglés.
Cómo trabajamos:
- Idea: "Ordenamos lo que tenés en la cabeza." Charla directa para entender cómo funciona tu negocio y a dónde querés llegar, con diagnóstico honesto y sin jerga. Se necesita que cuentes qué te frena hoy. Te llevás un diagnóstico claro y un plan priorizado.
- Proyecto: "Lo diseñamos y lo construimos con vos." Se define el alcance, se arma la solución y se muestran avances cortos para decidir juntos. Se necesita feedback rápido en cada avance. Te llevás algo funcionando que podés probar, no un documento.
- Solución: "Funciona, se usa y sigue funcionando." Se pone en marcha, se mide el resultado, se sostiene y se comunica. Se necesita que lo uses y cuentes qué mejora. Te llevás tu operación funcionando y un canal directo para seguir.
Ejemplo práctico del sitio: Idea "atender consultas por WhatsApp nos lleva medio día" → Proyecto: un agente de IA que responde lo repetitivo y deriva lo complejo a una persona → Solución: tiempo de respuesta −60%.
Casos del portfolio (son casos ILUSTRATIVOS, no clientes reales): rediseño de checkout y catálogo con foco en velocidad y conversión móvil; agente conversacional que resuelve consultas frecuentes y deriva casos complejos a un humano; app a medida que centraliza tareas administrativas dispersas en planillas y mensajes; identidad visual renovada y calendario de contenido consistente en las redes.
Contacto público: formulario de la web, email opsyn.soluciones@gmail.com e Instagram instagram.com/opsyn.`;

// ----------------------------------------
// Lectura de archivos del sitio
// ----------------------------------------

/** Lee un archivo del despliegue; si no viajó con la función, lo pide al propio sitio. */
async function leerArchivoDelSitio(relativo) {
  try {
    return await readFile(path.join(process.cwd(), relativo), 'utf8');
  } catch {
    try {
      const respuesta = await fetch(`${SITIO}/${relativo}`);
      if (respuesta.ok) return await respuesta.text();
    } catch { /* sin acceso: el asistente sigue sin este fragmento */ }
  }
  return '';
}

const ENTIDADES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&larr;': '←', '&rarr;': '→' };

/**
 * El titular es una persona física: su CUIT y domicilio figuran en el pie del sitio,
 * pero el asistente no los recibe (lo que no tiene, no lo puede filtrar).
 */
export function quitarDatosDelTitular(texto) {
  return texto
    .replace(/,?\s*CUIT\s*[\d-]{11,13}/gi, '')
    .replace(/,?\s*con domicilio en[\s\S]*?Argentina\./g, '. El CUIT y el domicilio del titular figuran en el pie de página del sitio.');
}

/** Convierte el contenido principal (<main>) de una página HTML en texto plano legible. */
export function htmlATexto(html) {
  const principal = /<main[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  return (principal ? principal[1] : html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/(p|h[1-6]|ul|ol|div)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, (entidad) => ENTIDADES[entidad.toLowerCase()] ?? ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function leerCatalogo() {
  let datos = null;
  try {
    datos = JSON.parse(await leerArchivoDelSitio('data/service-items.json'));
  } catch { /* catálogo ausente o ilegible */ }
  if (!datos || typeof datos !== 'object') return '';

  const lineas = [];
  for (const [clave, etiqueta] of Object.entries(ETIQUETAS_SERVICIO)) {
    const items = Array.isArray(datos[clave]) ? datos[clave] : [];
    lineas.push(`## ${etiqueta}`);
    for (const item of items) {
      const titulo = item?.title?.es;
      const desc = item?.desc?.es;
      if (typeof titulo === 'string' && typeof desc === 'string') lineas.push(`- ${titulo}: ${desc}`);
    }
  }
  return lineas.join('\n');
}

async function leerDocumentos() {
  const textos = await Promise.all(
    DOCUMENTOS.map(async ({ archivo, titulo }) => {
      const texto = quitarDatosDelTitular(htmlATexto(await leerArchivoDelSitio(archivo)));
      return texto ? `### ${titulo} (${SITIO}/${archivo})\n${texto}` : '';
    }),
  );
  return textos.filter(Boolean).join('\n\n');
}

let cache = null;

/** Catálogo y documentos, cacheados mientras viva la instancia de la función. */
export async function cargarConocimiento() {
  if (cache) return cache;
  const [catalogo, documentos] = await Promise.all([leerCatalogo(), leerDocumentos()]);
  // Solo se cachea si se pudo leer todo: un fallo transitorio no debe quedar fijado.
  if (catalogo && documentos) cache = { catalogo, documentos };
  return { catalogo, documentos };
}
