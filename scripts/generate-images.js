// ========================================
// GENERADOR DE IMÁGENES 3D (Rediseño, Fase 3)
//
// Genera los assets de assets/3d/ con Gemini (Nano Banana) y los
// convierte a WebP con sharp. Herramienta local: scripts/ está
// excluido del deploy por .vercelignore.
//
// Uso:
//   node scripts/generate-images.js                 # genera los que faltan
//   node scripts/generate-images.js --only a,b      # solo esos (nombre sin extensión)
//   node scripts/generate-images.js --force         # regenera aunque existan
//
// Requiere GEMINI_API_KEY en .env (raíz) o en el entorno.
// Inventario y prompts: docs/REDISENO-imagenes.md
// ========================================

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT_DIR = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'assets', '3d');
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 120000;

// Pro: mejor calidad para lo más visible (og, servicios). Flash: el resto.
const MODELS = {
  pro: 'gemini-3-pro-image',
  flash: 'gemini-3.1-flash-image',
};

// Estilo común para que las 19 imágenes se vean como una misma familia.
const STYLE =
  'Style: premium 3D render, translucent frosted glass material with subtle neon edge glow, ' +
  'brand colors violet #9434D4 and cyan #79FFFF, solid deep dark background #0D0326 filling the whole frame ' +
  '(no transparency, no checkerboard), soft studio lighting, isometric view, minimal, centered subject with generous margin. ' +
  'No text, no letters, no watermark, no frame, no border.';

const icon = (subject) => `3D glass/neon icon of ${subject}.`;

// Tamaños de salida a 2x del tamaño en que se muestran (nitidez en pantallas retina).
const IMAGES = [
  {
    name: 'og-image', model: 'pro', aspect: '16:9', width: 1200, height: 630,
    prompt: '3D glass/neon abstract composition evoking an impossible triangle made of translucent glass, surrounded by thin glowing circuit traces, floating in a dark cosmic scene with a violet and cyan aurora glow. Wide composition with the subject on the right third, leaving clean dark space on the left for a headline overlay.',
  },
  { name: 'servicio-software', model: 'pro', aspect: '1:1', width: 320, height: 320, prompt: icon('interlocking code brackets </> as solid glass shapes') },
  { name: 'servicio-agentes-ia', model: 'pro', aspect: '1:1', width: 320, height: 320, prompt: icon('a friendly robot chat bubble with engraved circuit patterns') },
  { name: 'servicio-consultoria', model: 'pro', aspect: '1:1', width: 320, height: 320, prompt: icon('a glowing compass') },
  { name: 'servicio-marketing', model: 'pro', aspect: '1:1', width: 320, height: 320, prompt: icon('a megaphone with an upward growth arrow') },

  { name: 'item-crm-personalizados', model: 'flash', aspect: '1:1', width: 96, height: 96, prompt: icon('a database cylinder with connected network nodes') },
  { name: 'item-agente-soporte', model: 'flash', aspect: '1:1', width: 96, height: 96, prompt: icon('a support headset next to a chat bubble') },
  { name: 'item-agente-ventas', model: 'flash', aspect: '1:1', width: 96, height: 96, prompt: icon('a rising bar chart with an arrow') },
  { name: 'item-agente-automatizacion-interna', model: 'flash', aspect: '1:1', width: 96, height: 96, prompt: icon('two interlocking gears connected by a workflow line') },
  { name: 'item-asistente-personal', model: 'flash', aspect: '1:1', width: 96, height: 96, prompt: icon('a calendar with a small sparkle') },
  { name: 'item-armado-de-base-de-datos', model: 'flash', aspect: '1:1', width: 96, height: 96, prompt: icon('a stack of three database disks') },

  { name: 'portfolio-1', model: 'flash', aspect: '3:2', width: 400, height: 280, prompt: icon('a clearly recognizable shopping cart (basket on wheels) with a small upward arrow above it') },
  { name: 'portfolio-2', model: 'flash', aspect: '3:2', width: 400, height: 280, prompt: icon('a chat bubble with a clock and speed lines') },
  { name: 'portfolio-3', model: 'flash', aspect: '3:2', width: 400, height: 280, prompt: icon('a dashboard screen with charts beside a mobile phone') },
  { name: 'portfolio-4', model: 'flash', aspect: '3:2', width: 400, height: 280, prompt: icon('a cluster of abstract social media bubbles (heart, share, comment symbols)') },

  { name: 'proceso-idea', model: 'flash', aspect: '1:1', width: 240, height: 240, prompt: icon('a glowing lightbulb with a spark inside') },
  { name: 'proceso-proyecto', model: 'flash', aspect: '1:1', width: 240, height: 240, prompt: icon('interlocking geometric building blocks assembling into a structure') },
  { name: 'proceso-solucion', model: 'flash', aspect: '1:1', width: 240, height: 240, prompt: icon('a rocket lifting off with a small checkmark badge') },

  {
    name: 'nosotros', model: 'flash', aspect: '1:1', width: 640, height: 640,
    prompt: '3D glass/neon abstract sculpture representing partnership and craftsmanship: two intertwined translucent glass shapes forming connected nodes.',
  },
];

// A diferencia de admin-server.js, acá el .env PISA la variable de sistema:
// la key con billing para imágenes es la del .env del proyecto.
function loadEnvFile(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    if (key) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const onlyIdx = argv.indexOf('--only');
  const only = onlyIdx !== -1 && argv[onlyIdx + 1]
    ? new Set(argv[onlyIdx + 1].split(',').map((s) => s.trim()).filter(Boolean))
    : null;
  return { only, force: argv.includes('--force') };
}

async function requestImage(apiKey, spec) {
  const body = {
    contents: [{ parts: [{ text: `${spec.prompt}\n\n${STYLE}` }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: spec.aspect },
    },
  };
  const res = await fetch(`${API_BASE}/${MODELS[spec.model]}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${json.error?.message || 'sin detalle'}`);
    err.retryable = res.status === 429 || res.status >= 500;
    throw err;
  }
  const parts = json.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) {
    const reason = json.candidates?.[0]?.finishReason || json.promptFeedback?.blockReason || 'desconocido';
    throw new Error(`La respuesta no trajo imagen (motivo: ${reason})`);
  }
  return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function generateOne(apiKey, spec) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const raw = await requestImage(apiKey, spec);
      const outPath = path.join(OUT_DIR, `${spec.name}.webp`);
      await sharp(raw)
        .resize(spec.width, spec.height, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85 })
        .toFile(outPath);
      return outPath;
    } catch (error) {
      lastError = error;
      if (!error.retryable || attempt === 3) break;
      await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
  throw lastError;
}

async function main() {
  const systemKey = process.env.GEMINI_API_KEY;
  loadEnvFile(path.join(ROOT_DIR, '.env'));
  const fromSystem = Boolean(systemKey) && process.env.GEMINI_API_KEY === systemKey;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Falta GEMINI_API_KEY (en .env de la raíz o en el entorno).');
    process.exit(1);
  }
  // Una variable de sistema pisa al .env: mostrar cuál se usa evita confundir proyectos/billing.
  console.log(`Usando GEMINI_API_KEY …${apiKey.slice(-4)} (${fromSystem ? 'variable de sistema' : '.env'})`);

  const { only, force } = parseArgs(process.argv.slice(2));
  if (only) {
    const unknown = [...only].filter((n) => !IMAGES.some((img) => img.name === n));
    if (unknown.length) {
      console.error(`Nombres desconocidos: ${unknown.join(', ')}`);
      process.exit(1);
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const queue = IMAGES.filter((img) => (!only || only.has(img.name))
    && (force || !fs.existsSync(path.join(OUT_DIR, `${img.name}.webp`))));

  if (!queue.length) {
    console.log('Nada para generar (usá --force para regenerar).');
    return;
  }

  const failures = [];
  for (const spec of queue) {
    process.stdout.write(`→ ${spec.name} (${spec.model}) ... `);
    try {
      const outPath = await generateOne(apiKey, spec);
      const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`ok (${spec.width}×${spec.height}, ${kb} KB)`);
    } catch (error) {
      console.log(`ERROR: ${error.message}`);
      failures.push(spec.name);
    }
  }

  if (failures.length) {
    console.error(`\nFallaron ${failures.length}: ${failures.join(', ')} — reintentá con --only`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
