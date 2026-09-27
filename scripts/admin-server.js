// ========================================
// SERVIDOR LOCAL DEL PANEL DE ADMINISTRACIÓN
//
// Sirve /admin (tablero de Servicios/Agentes) y expone
// GET/PUT /api/admin/service-items para leer y escribir
// data/service-items.json.
//
// Sin dependencias externas (solo módulos nativos de Node),
// igual que el resto del sitio. Pensado para correr ÚNICAMENTE
// en tu máquina (npm run admin) — escucha solo en 127.0.0.1 y
// nunca se despliega en Vercel.
// ========================================

const http = require('node:http');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const HOST = '127.0.0.1';
const PORT = 4321;
const ROOT_DIR = path.join(__dirname, '..');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'service-items.json');
const SITE_CONFIG_FILE = path.join(ROOT_DIR, 'data', 'site-config.json');
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB, de sobra para este JSON

// Carga variables de entorno desde .env (raíz del proyecto) al process.env,
// sin pisar las que ya estén seteadas. Sin dependencias (sin dotenv), mismo
// criterio "cero dependencias" que el resto del sitio. Si no existe .env,
// no pasa nada — las claves que dependen de él (ej. GEMINI_API_KEY) quedan
// undefined y las funciones que las usan avisan con un mensaje claro.
function loadEnvFile(filePath) {
  let raw;
  try {
    raw = fsSync.readFileSync(filePath, 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT_DIR, '.env'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const VALID_SERVICE_IDS = ['service1', 'service2', 'service3', 'service4'];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function isBilingualText(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.es === 'string' &&
    typeof value.en === 'string'
  );
}

function isValidServiceItemsPayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;

  return Object.keys(data).every((key) => {
    if (!VALID_SERVICE_IDS.includes(key)) return false;
    const items = data[key];
    if (!Array.isArray(items)) return false;

    return items.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        item.id.length > 0 &&
        isBilingualText(item.title) &&
        isBilingualText(item.desc)
    );
  });
}

// ---- Contacto y redes (data/site-config.json) ----
// Misma tabla que js/site-config.js: la landing vuelve a validar al leer.
const SOCIAL_NETWORKS = {
  instagram: ['instagram.com'],
  linkedin: ['linkedin.com'],
  facebook: ['facebook.com', 'fb.com'],
  tiktok: ['tiktok.com'],
  x: ['x.com', 'twitter.com'],
  youtube: ['youtube.com', 'youtu.be'],
};
const EMAIL_RE = /^[^\s@<>"'()]+@[^\s@<>"'()]+\.[a-z]{2,}$/i;
const WA_MESSAGE_MAX = 300;

function isAllowedSocialUrl(network, value) {
  if (value === '') return true;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.replace(/^www\./, '');
    return SOCIAL_NETWORKS[network].some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

// Devuelve { config } normalizado o { error } con un mensaje para el panel.
function normalizeSiteConfig(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'Estructura inválida.' };
  }
  const email = typeof data.contact?.email === 'string' ? data.contact.email.trim() : '';
  if (!EMAIL_RE.test(email)) return { error: 'El email de contacto no es válido.' };

  const wa = data.contact?.whatsapp || {};
  const number = String(wa.number || '').replace(/\D/g, '');
  if (number && (number.length < 10 || number.length > 15)) {
    return { error: 'El número de WhatsApp debe tener entre 10 y 15 dígitos (con código de país).' };
  }
  const message = { es: '', en: '' };
  for (const lang of ['es', 'en']) {
    const text = typeof wa.message?.[lang] === 'string' ? wa.message[lang].trim() : '';
    if (text.length > WA_MESSAGE_MAX) {
      return { error: `El mensaje de WhatsApp (${lang.toUpperCase()}) supera ${WA_MESSAGE_MAX} caracteres.` };
    }
    message[lang] = text;
  }

  const social = {};
  for (const network of Object.keys(SOCIAL_NETWORKS)) {
    const value = typeof data.social?.[network] === 'string' ? data.social[network].trim() : '';
    if (!isAllowedSocialUrl(network, value)) {
      return {
        error: `El link de ${network} no es válido: tiene que empezar con https:// y ser de ${SOCIAL_NETWORKS[network].join(' o ')}.`,
      };
    }
    social[network] = value;
  }

  return { config: { contact: { email, whatsapp: { number, message } }, social } };
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Cuerpo de la petición demasiado grande'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleGetServiceItems(res) {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(raw);
  } catch (error) {
    sendJson(res, 500, { error: 'No se pudo leer data/service-items.json: ' + error.message });
  }
}

async function handlePutServiceItems(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw);
  } catch (error) {
    sendJson(res, 400, { error: 'JSON inválido: ' + error.message });
    return;
  }

  if (!isValidServiceItemsPayload(payload)) {
    sendJson(res, 400, {
      error:
        'Estructura inválida. Se espera { service1..service4: [{ id, title: {es,en}, desc: {es,en} }] }',
    });
    return;
  }

  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  } catch (error) {
    sendJson(res, 500, { error: 'No se pudo escribir data/service-items.json: ' + error.message });
    return;
  }

  const publishResult = await publishToGit('data/service-items.json');
  sendJson(res, 200, { ok: true, ...publishResult });
}

async function handleGetSiteConfig(res) {
  try {
    const raw = await fs.readFile(SITE_CONFIG_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(raw);
  } catch (error) {
    sendJson(res, 500, { error: 'No se pudo leer data/site-config.json: ' + error.message });
  }
}

async function handlePutSiteConfig(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readRequestBody(req));
  } catch (error) {
    sendJson(res, 400, { error: 'JSON inválido: ' + error.message });
    return;
  }

  const { config, error } = normalizeSiteConfig(payload);
  if (error) {
    sendJson(res, 400, { error });
    return;
  }

  try {
    await fs.writeFile(SITE_CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', 'utf8');
  } catch (writeError) {
    sendJson(res, 500, { error: 'No se pudo escribir data/site-config.json: ' + writeError.message });
    return;
  }

  const publishResult = await publishToGit('data/site-config.json');
  sendJson(res, 200, { ok: true, config, ...publishResult });
}

// Publica lo guardado en producción: commitea y pushea SOLO el archivo de
// datos indicado (nunca otros archivos que puedas tener en curso en el
// mismo repo, aunque estén "staged" en otra terminal). Vercel tiene
// auto-deploy en push a master, así que esto es lo único que hace falta
// para que el cambio llegue a la web — no hay paso manual de git.
const GIT_TIMEOUT_MS = 20000;

async function runGit(args) {
  return execFileAsync('git', args, { cwd: ROOT_DIR, timeout: GIT_TIMEOUT_MS });
}

async function publishToGit(pathspec) {
  try {
    const { stdout: statusOut } = await runGit(['status', '--porcelain', '--', pathspec]);
    if (!statusOut.trim()) {
      // Contenido idéntico al último commit (ej. abrir y guardar sin
      // cambios reales) — no hay nada que publicar, no es un error.
      return { published: false, reason: 'sin cambios' };
    }

    await runGit(['add', '--', pathspec]);
    // "git commit -- <pathspec>" commitea SOLO ese archivo aunque haya
    // otros cambios staged por vos en otra terminal — no los toca.
    await runGit([
      'commit',
      '-m',
      `content: actualizar ${path.basename(pathspec)} (vía panel admin)`,
      '--',
      pathspec,
    ]);
    await runGit(['push']);
    return { published: true };
  } catch (error) {
    const detail = (error.stderr && error.stderr.toString().trim()) || error.message;
    return { published: false, error: detail };
  }
}

// Traducción ES -> EN automática de los campos del panel. Usa MyMemory
// (https://mymemory.translated.net), API pública gratuita sin API key.
// Solo se llama desde este servidor local, nunca desde producción.
const TRANSLATE_MAX_CHARS = 500;

async function handleTranslate(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw);
  } catch (error) {
    sendJson(res, 400, { error: 'JSON inválido: ' + error.message });
    return;
  }

  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  if (!text) {
    sendJson(res, 400, { error: 'Falta "text" para traducir.' });
    return;
  }
  if (text.length > TRANSLATE_MAX_CHARS) {
    sendJson(res, 400, {
      error: `Texto demasiado largo para traducir automáticamente (máx. ${TRANSLATE_MAX_CHARS} caracteres). Completá el inglés a mano.`,
    });
    return;
  }

  try {
    const url =
      'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(text) +
      '&langpair=es|en';
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated !== 'string' || !translated) {
      throw new Error('Respuesta de traducción vacía o inválida');
    }
    sendJson(res, 200, { translated });
  } catch (error) {
    sendJson(res, 502, { error: 'No se pudo traducir (servicio externo): ' + error.message });
  }
}

// "Mejorar redacción" de la descripción en Español con IA (Google Gemini,
// nivel gratis: https://aistudio.google.com/apikey). A diferencia de la
// traducción, esto no es una API pública anónima — necesita tu propia
// GEMINI_API_KEY en un archivo .env en la raíz del proyecto (nunca se sube
// a git, nunca se usa en producción). Sin key configurada, devuelve un
// error explicando cómo conseguirla.
const ENHANCE_MAX_CHARS = 800;
const ENHANCE_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function handleEnhanceDescription(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw);
  } catch (error) {
    sendJson(res, 400, { error: 'JSON inválido: ' + error.message });
    return;
  }

  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  if (!text) {
    sendJson(res, 400, { error: 'Falta "text" para mejorar.' });
    return;
  }
  if (text.length > ENHANCE_MAX_CHARS) {
    sendJson(res, 400, {
      error: `Texto demasiado largo para mejorar automáticamente (máx. ${ENHANCE_MAX_CHARS} caracteres).`,
    });
    return;
  }

  if (!GEMINI_API_KEY) {
    sendJson(res, 400, {
      error:
        'Falta configurar GEMINI_API_KEY en el archivo .env (raíz del proyecto) y reiniciar "npm run admin". ' +
        'Conseguila gratis en https://aistudio.google.com/apikey — ver docs/ADMIN.md.',
    });
    return;
  }

  const prompt =
    'Reescribí el siguiente texto en español para que suene profesional y claro, ' +
    'sin inventar información nueva ni exagerar lo que dice. Es la descripción de ' +
    'un servicio dentro de una landing page. Máximo 2 oraciones cortas. Devolvé ' +
    'SOLO el texto reescrito, sin comillas, sin markdown y sin ninguna explicación ' +
    'adicional.\n\nTexto original: ' +
    text;

  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=` +
      encodeURIComponent(GEMINI_API_KEY);
    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 200,
            // gemini-2.5-flash "piensa" por defecto y esos tokens salen del
            // mismo presupuesto que maxOutputTokens — con thinking activado,
            // 200 tokens se gastaban casi enteros pensando y la respuesta
            // quedaba cortada a la mitad (finishReason: MAX_TOKENS). Esta
            // tarea (reescribir 1-2 oraciones) no necesita razonamiento.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
      ENHANCE_TIMEOUT_MS
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error?.message || 'HTTP ' + response.status);
    }
    const enhanced = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!enhanced) {
      throw new Error('Respuesta vacía o con formato inesperado');
    }
    sendJson(res, 200, { enhanced });
  } catch (error) {
    const detail = error.name === 'AbortError' ? 'tiempo de espera agotado' : error.message;
    sendJson(res, 502, { error: 'No se pudo mejorar el texto (servicio externo): ' + detail });
  }
}

async function serveStaticFile(res, filePath) {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/api/admin/service-items') {
    if (req.method === 'GET') {
      handleGetServiceItems(res);
      return;
    }
    if (req.method === 'PUT') {
      handlePutServiceItems(req, res);
      return;
    }
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Método no permitido');
    return;
  }

  if (pathname === '/api/admin/site-config') {
    if (req.method === 'GET') {
      handleGetSiteConfig(res);
      return;
    }
    if (req.method === 'PUT') {
      handlePutSiteConfig(req, res);
      return;
    }
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Método no permitido');
    return;
  }

  if (pathname === '/api/admin/translate') {
    if (req.method === 'POST') {
      handleTranslate(req, res);
      return;
    }
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Método no permitido');
    return;
  }

  if (pathname === '/api/admin/enhance-description') {
    if (req.method === 'POST') {
      handleEnhanceDescription(req, res);
      return;
    }
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Método no permitido');
    return;
  }

  if (pathname === '/admin' || pathname === '/admin/') {
    serveStaticFile(res, path.join(ADMIN_DIR, 'index.html'));
    return;
  }

  if (pathname.startsWith('/admin/')) {
    const relative = pathname.slice('/admin/'.length);
    const filePath = path.normalize(path.join(ADMIN_DIR, relative));
    // Evita path traversal fuera de admin/
    if (!filePath.startsWith(ADMIN_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Prohibido');
      return;
    }
    serveStaticFile(res, filePath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('No encontrado. El panel vive en /admin');
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  Panel de administración OPSYN (local)');
  console.log(`  → http://${HOST}:${PORT}/admin`);
  console.log('');
  console.log('  Solo accesible desde esta máquina. Ctrl+C para detener.');
  console.log('');
});
