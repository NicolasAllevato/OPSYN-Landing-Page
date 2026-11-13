import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consultarGemini, ERROR_CUOTA } from '../api/_lib/gemini.js';

const ok = (texto) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'razonando…', thought: true }, { text: texto }] } }] }), { status: 200 });
const conocimiento = { catalogo: '', documentos: '' };
const msjs = [{ role: 'user', content: 'hola' }];

async function conFetch(simulado, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = simulado;
  try { return await fn(); } finally { globalThis.fetch = original; }
}

test('si el modelo principal no tiene cuota, responde el de respaldo', async () => {
  const usados = [];
  const r = await conFetch(async (url) => {
    usados.push(String(url).match(/models\/([^:]+)/)[1]);
    return usados.length === 1 ? new Response('cuota', { status: 429 }) : ok('¡Hola! ¿Cómo andás?');
  }, () => consultarGemini(msjs, conocimiento));
  assert.equal(usados.length, 2);
  assert.notEqual(usados[0], usados[1]);
  assert.equal(r.texto, '¡Hola! ¿Cómo andás?'); // el razonamiento interno no se muestra
});

test('si ambos modelos están sin cuota, lanza ERROR_CUOTA', async () => {
  await assert.rejects(
    conFetch(async () => new Response('cuota', { status: 429 }), () => consultarGemini(msjs, conocimiento)),
    { message: ERROR_CUOTA },
  );
});

test('un error que no es de cuota no reintenta', async () => {
  let llamadas = 0;
  await assert.rejects(conFetch(async () => { llamadas += 1; return new Response('x', { status: 500 }); }, () => consultarGemini(msjs, conocimiento)));
  assert.equal(llamadas, 1);
});
