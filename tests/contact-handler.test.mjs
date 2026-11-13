import { test } from 'node:test';
import assert from 'node:assert/strict';

// Importar el handler real detecta errores de sintaxis que `node --check` no ve.
const { default: handler } = await import('../api/contact.js');

function respuestaFalsa() {
  return { codigo: 0, cuerpo: null, setHeader() {}, status(c) { this.codigo = c; return this; }, json(b) { this.cuerpo = b; return this; } };
}

test('el handler de contacto carga y rechaza un pedido vacío con 400', async () => {
  const res = respuestaFalsa();
  await handler({ method: 'POST', headers: {}, body: {} }, res);
  assert.equal(res.codigo, 400);
  assert.equal(res.cuerpo.success, false);
});

test('el handler de contacto rechaza GET con 405', async () => {
  const res = respuestaFalsa();
  await handler({ method: 'GET', headers: {} }, res);
  assert.equal(res.codigo, 405);
});
