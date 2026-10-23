import assert from 'node:assert/strict';
import test from 'node:test';
import { addToCart, cartMessage, cartSubtotal, menuProducts } from '../src/features/menu/cart';

// Public cart contract: incomplete combinations must never become order lines.
test('churros expose all seven valid topping combinations at their unchanged prices', () => {
  const products = menuProducts.filter(product => product.id.startsWith('churros:'));
  assert.equal(products.length, 7);
  for (const [size, count, price] of [[1, 3, 23900], [2, 3, 24900], [3, 1, 25900]]) {
    const matches = products.filter(product => product.id.startsWith(`churros:${size}|`));
    assert.equal(matches.length, count);
    for (const product of matches) {
      assert.equal(product.price, price);
      const chosen = product.id.split('|')[1].split('+');
      assert.equal(chosen.length, size);
      assert.equal(new Set(chosen).size, size);
      assert.ok(chosen.every(value => ['Chocolate', 'Arequipe', 'Helado'].includes(value)));
      const cart = addToCart([], product.id, 2);
      assert.equal(cartSubtotal(cart), price * 2);
      for (const value of chosen) assert.ok(cartMessage(cart).includes(value));
    }
  }
});

test('Taquiza allows exactly three of all seven flavors for every group size', () => {
  const products = menuProducts.filter(product => product.id.startsWith('taquiza:'));
  assert.equal(products.length, 105);
  for (const product of products) {
    const chosen = product.id.split('|')[1].split('+');
    assert.equal(chosen.length, 3);
    assert.equal(new Set(chosen).size, 3);
    assert.ok(cartMessage(addToCart([], product.id, 1)).includes(chosen.join(' + ')));
  }
  assert.ok(products.some(product => product.name.includes('Pescado') && product.name.includes('Camarón')));
});

test('incomplete, unknown or repeated multi-pick selections leave an existing cart and subtotal unchanged', () => {
  const cart = addToCart([], 'nachos-grandes', 1);
  const before = structuredClone(cart);
  for (const id of ['churros:1', 'churros:2|Chocolate', 'churros:2|Chocolate+Chocolate', 'churros:3|Chocolate+Arequipe+Otra', 'taquiza:2', 'taquiza:2|Al Pastor+Carnitas']) {
    assert.deepEqual(addToCart(cart, id, 1), before, id);
    assert.equal(cartSubtotal(cart), 38900);
  }
});

test('Hatsu offers separate Té and Soda choices at the unchanged price, with named cart and WhatsApp lines', () => {
  const products = menuProducts.filter(product => product.id.startsWith('te-o-soda-hatsu|'));
  assert.deepEqual(products.map(product => product.id), ['te-o-soda-hatsu|Té', 'te-o-soda-hatsu|Soda']);
  for (const product of products) {
    assert.equal(product.price, 13900);
    const cart = addToCart([], product.id, 1);
    assert.equal(cartSubtotal(cart), 13900);
    assert.ok(cartMessage(cart).includes(product.name));
  }
  assert.deepEqual(addToCart([], 'te-o-soda-hatsu', 1), [], 'a choice is required');
});

test('existing single-choice products preserve their prices, identifiers and WhatsApp details', () => {
  for (const id of ['enchiladas|Mole', 'fajitas-famosas:full|Carne', 'tacos|Carnitas', 'aguas-frescas|Horchata']) {
    const product = menuProducts.find(product => product.id === id)!;
    assert.ok(product);
    const cart = addToCart([], id, 1);
    assert.equal(cartSubtotal(cart), product.price);
    assert.ok(cartMessage(cart).includes(product.name));
  }
});
