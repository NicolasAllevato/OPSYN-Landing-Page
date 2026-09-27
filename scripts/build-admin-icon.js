// ========================================
// ÍCONO DEL PANEL ADMIN (Windows .ico)
// Genera admin/opsyn-admin.ico a partir del logo de OPSYN:
// recorte cuadrado centrado en el triángulo, esquinas redondeadas y
// varios tamaños (16–256px) para escritorio, barra de tareas y explorador.
//
// Uso: node scripts/build-admin-icon.js
// ========================================

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT_DIR = path.join(__dirname, '..');
const SOURCE = path.join(ROOT_DIR, 'design-source', 'Logo Opsyn.png');
const OUT = path.join(ROOT_DIR, 'admin', 'opsyn-admin.ico');
const SIZES = [16, 24, 32, 48, 64, 128, 256];
const CROP_RATIO = 0.82; // lado del cuadrado respecto del lado corto: enfoca el triángulo

async function squareMaster() {
  const { width, height } = await sharp(SOURCE).metadata();
  const side = Math.round(Math.min(width, height) * CROP_RATIO);
  const left = Math.round((width - side) / 2);
  const top = Math.round((height - side) / 2);
  const base = await sharp(SOURCE).extract({ left, top, width: side, height: side }).resize(512, 512).png().toBuffer();
  const mask = Buffer.from(
    '<svg width="512" height="512"><rect width="512" height="512" rx="96" ry="96" fill="#fff"/></svg>'
  );
  return sharp(base).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

// Formato ICO con imágenes PNG embebidas (soportado desde Windows Vista).
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: ícono
  header.writeUInt16LE(pngs.length, 4);

  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 = 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // sin paleta
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4); // planos
    entry.writeUInt16LE(32, 6); // bits por píxel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function main() {
  const master = await squareMaster();
  const pngs = await Promise.all(
    SIZES.map(async (size) => ({ size, data: await sharp(master).resize(size, size).png().toBuffer() }))
  );
  fs.writeFileSync(OUT, buildIco(pngs));
  console.log(`Ícono generado: ${path.relative(ROOT_DIR, OUT)} (${SIZES.join(', ')} px)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
