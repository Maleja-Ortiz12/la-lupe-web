import assert from 'node:assert/strict';
import test from 'node:test';
import { addToCart, changeQuantity, removeFromCart, cartSubtotal, cartMessage, cartWhatsAppUrl, menuProducts, type CartLine } from '../src/features/menu/cart';

const entry = 'entrada-2';
const half = 'fajita-0-half';
const full = 'fajita-0-full';

test('cart starts empty, adds selected quantities and merges the same product', () => {
  const empty: CartLine[] = [];
  assert.equal(cartSubtotal(empty), 0);
  const first = addToCart(empty, entry, 2);
  assert.deepEqual(first, [{ productId: entry, quantity: 2 }]);
  assert.deepEqual(empty, []);
  assert.deepEqual(addToCart(first, entry, 1), [{ productId: entry, quantity: 3 }]);
  assert.deepEqual(first, [{ productId: entry, quantity: 2 }]);
});

test('half and full fajitas are independent variants and reproduce the reference subtotal', () => {
  let cart = addToCart([], entry, 1);
  cart = addToCart(cart, half, 1);
  assert.equal(cartSubtotal(cart), 53000);
  assert.equal(menuProducts.find(item => item.id === half)?.price, 30500);
  assert.equal(menuProducts.find(item => item.id === full)?.price, 58000);
  cart = addToCart(cart, full, 1);
  assert.equal(cart.length, 3);
  assert.equal(cartSubtotal(cart), 111000);
});

test('cart quantities change line totals and removing the final item returns an empty cart', () => {
  const first = addToCart([], entry, 1);
  const doubled = changeQuantity(first, entry, 2);
  assert.equal(cartSubtotal(doubled), 45000);
  assert.deepEqual(changeQuantity(doubled, entry, 1), first);
  assert.deepEqual(removeFromCart(doubled, entry), []);
});

test('invalid products and quantities leave the cart and its subtotal unchanged; quantities cap at 99', () => {
  const cart = addToCart([], entry, 1);
  for (const quantity of [0, -1, 1.5, NaN, Infinity, 100]) {
    assert.deepEqual(addToCart(cart, entry, quantity), cart);
    assert.deepEqual(changeQuantity(cart, entry, quantity), cart);
    assert.equal(cartSubtotal(cart), 22500);
  }
  assert.deepEqual(addToCart(cart, 'unknown', 1), cart);
  assert.deepEqual(changeQuantity(cart, 'unknown', 2), cart);
  assert.deepEqual(removeFromCart(cart, 'unknown'), cart);
  const capped = addToCart(addToCart([], entry, 98), entry, 2);
  assert.deepEqual(capped, [{ productId: entry, quantity: 99 }]);
});

test('WhatsApp uses every selected product, variant, quantity and subtotal with a manual confirmation disclaimer', () => {
  const cart = addToCart(addToCart([], entry, 2), full, 1);
  const message = cartMessage(cart);
  assert.equal(message, 'Hola La Lupe, quiero solicitar este pedido:\n\n2 × Entradas “X2” — $45.000\n1 × Fajitas De Pollo (Full Orden) — $58.000\n\nSubtotal de referencia: $103.000 COP\n\nPrecios y disponibilidad pendientes de confirmación por el restaurante. Este mensaje no confirma el pedido ni realiza un pago.');
  const href = cartWhatsAppUrl(cart, '+57 300 123 4567');
  assert.ok(href);
  const url = new URL(href);
  assert.equal(url.origin + url.pathname, 'https://wa.me/573001234567');
  assert.equal(url.searchParams.get('text'), message);
  assert.equal(cartWhatsAppUrl(cart, ''), null);
  assert.equal(cartWhatsAppUrl([], '+57 300 123 4567'), null);
});
