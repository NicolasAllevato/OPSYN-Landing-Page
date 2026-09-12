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
const path = require('node:path');

const HOST = '127.0.0.1';
const PORT = 4321;
const ROOT_DIR = path.join(__dirname, '..');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'service-items.json');
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB, de sobra para este JSON

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
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, { error: 'No se pudo escribir data/service-items.json: ' + error.message });
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

  if (pathname === '/api/admin/translate') {
    if (req.method === 'POST') {
      handleTranslate(req, res);
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
