import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { metadata } from '../src/app/menu/page';

const html = (whatsappNumber?: string) => renderToStaticMarkup(<MenuPage whatsappNumber={whatsappNumber} />);

test('menu page has its own hero and the three categories', () => {
  const markup = html();
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1);
  assert.match(markup, /<h1[^>]*>Menú <span>y pedido<\/span><\/h1>/);
  for (const id of ['entradas', 'fajitas', 'taquiza']) assert.match(markup, new RegExp(`id="${id}"`));
  for (const label of ['Entradas', 'Fajitas', 'Taquiza', '1/2 Orden', 'Full Orden']) assert.ok(markup.includes(label), label);
  for (const asset of ['menu-hero.webp', 'menu-entradas.webp', 'menu-fajitas.webp', 'menu-taquiza.webp']) {
    assert.ok(markup.includes(`/reference/${asset}`), asset);
  }
});

test('menu shows the reference prices from the supplied design', () => {
  const markup = html();
  for (const price of ['$22.500', '$40.500', '$60.000', '$30.500', '$58.000', '$32.500', '$34.500', '$62.000', '$40.000', '$80.000', '$120.000']) {
    assert.ok(markup.includes(price), price);
  }
  for (const item of ['(2) Quesadillas', '(4) Flautas', '(6) Fajitas nachos', 'De Pollo', 'De Carne', 'Combinadas', '2 per. (10 T)', '4 per. (20 T)', '6 per. (40 T)']) {
    assert.ok(markup.includes(item), item);
  }
  assert.match(markup, /Precios de referencia pendientes de aprobación/);
});

test('menu cart does not introduce payments, fake order states or an assistant', () => {
  const markup = html('+57 300 123 4567');
  assert.doesNotMatch(markup, /Continuar al pago|Estados de ejemplo|Pago verificado|Pendiente de aceptación|Asistente|<form|<input/);
});

test('menu describes authentic Mexican food instead of Tex-Mex', () => {
  const markup = html();
  assert.doesNotMatch(markup, /tex-?mex/i);
  assert.match(markup, /auténtica comida mexicana/);
});

test('without a confirmed number every WhatsApp order control is disabled and has no destination', () => {
  const markup = html();
  const controls = markup.match(/<(?:a|button)\b[^>]*>(?:(?!<\/(?:a|button)>).)*Pedir carrito por WhatsApp<\/(?:a|button)>/g) ?? [];
  assert.equal(controls.length, 1);
  for (const control of controls) assert.match(control, /^<button[^>]*disabled=""/);
  assert.match(markup, /Número de WhatsApp pendiente de confirmación/);
  assert.doesNotMatch(markup, /wa\.me|api\.whatsapp/);
});

test('with a configured number the empty cart stays disabled while the floating information chat works', () => {
  const markup = html('+57 300 123 4567');
  assert.match(markup, /<button class="button cart-checkout"[^>]*disabled=""/);
  assert.match(markup, /Agrega al menos un producto para preparar tu mensaje/);
  assert.doesNotMatch(markup, /pendiente de confirmación/);
  assert.ok(markup.includes('https://wa.me/573001234567?text=Hola%20La%20Lupe%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n.'));
  assert.doesNotMatch(markup, /quiero%20hacer%20un%20pedido/);
});

test('menu header marks Menú as current and links back to the landing sections', () => {
  const markup = html();
  assert.match(markup, /<a href="\/menu" aria-current="page">Menú<\/a>/);
  for (const href of ['/#inicio', '/nuestra-esencia', '/visitanos']) assert.ok(markup.includes(`href="${href}"`), href);
  assert.match(markup, /href="#contenido"/);
});

test('menu metadata prevents indexing', () => {
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(metadata.title, 'Menú de comida mexicana | La Lupe · Demo');
  assert.doesNotMatch(String(metadata.description), /tex-?mex|sin pedidos/i);
});


test('menu keeps its only order CTA at the end and one floating WhatsApp control', () => {
  const markup = html();
  assert.equal((markup.match(/class="whatsapp-float"/g) ?? []).length, 1);
  const hero = markup.match(/<section class="menu-hero"[\s\S]*?<\/section>/)?.[0];
  const header = markup.match(/<header[\s\S]*?<\/header>/)?.[0];
  const finalCTA = markup.match(/<aside id="tu-pedido" class="cart-panel"[\s\S]*?<\/aside>/)?.[0];
  assert.ok(hero && header && finalCTA);
  assert.doesNotMatch(hero + header, /Pedir carrito por WhatsApp/);
  assert.match(finalCTA, /Pedir carrito por WhatsApp/);
});


test('menu initially keeps the cart hidden until a product is added or the cart is opened', () => {
  const markup = html();
  assert.match(markup, /<aside id="tu-pedido" class="cart-panel"[^>]*hidden=""/);
  assert.match(markup, /data-cart-open="false"/);
  assert.match(markup, /<button[^>]*class="cart-continue"[^>]*>Agregar más productos<\/button>/);
});

test('menu exposes an empty cart, accessible add/quantity controls and both fajita portions', () => {
  const markup = html();
  assert.match(markup, /Tu carrito está vacío/);
  assert.match(markup, /class="cart-subtotal"><span>Subtotal<\/span><strong>\$0<\/strong>/);
  assert.match(markup, /aria-label="Agregar Entradas “X2”"/);
  assert.match(markup, /aria-label="Aumentar cantidad de Entradas “X2”"/);
  assert.match(markup, /aria-label="Porción de Fajitas De Pollo"/);
  assert.match(markup, /<option value="full">Full Orden<\/option>/);
  assert.match(markup, /aria-controls="tu-pedido" aria-expanded="false"/);
});
