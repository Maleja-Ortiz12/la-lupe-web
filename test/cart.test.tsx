import assert from 'node:assert/strict';
import test from 'node:test';
import { addToCart, changeQuantity, removeFromCart, cartSubtotal, cartMessage, cartWhatsAppUrl, menuProducts, type CartLine } from '../src/features/menu/cart';
import { menuCategories, starItemIds } from '../src/features/menu/menu-data';

const mixta = 'entrada-mixta:x2';
const famosasFull = 'fajitas-famosas:full|Mixta';
const famosasHalf = 'fajitas-famosas:media|Mixta';

// Every price of `images/Menu Lupe 2025 Vertical.pdf`, keyed by item id and price variant.
const pdfPrices: Record<string, number | null> = {
  'guacamole-con-chicharron': 33900, esquite: 33900, chilaquiles: 33900, 'nachos-grandes': 38900,
  'entrada-mixta:x2': 40900, 'entrada-mixta:x4': 81900, 'entrada-mixta:x6': 112900,
  'sopa-de-tortilla': 35900, pozole: 40900,
  'fajitas-poblanas:media': 65900, 'fajitas-poblanas:full': 113900, 'fajitas-famosas:media': 85900, 'fajitas-famosas:full': 115900,
  'taquiza:2': 79900, 'taquiza:4': 155900, 'taquiza:6': 227900, tacos: 40900,
  'carne-a-la-tampiquena': 42900, 'steak-lupe': 42900, 'hot-pepper-steak': 42900, 'pollo-lupe': 42900, 'steak-pimienta': 42900,
  burritos: 34900, enchiladas: 42900, flautas: 35900, 'fajitas-quesadillas': 35900, 'combo-mero-mero': 42900, 'tinga-de-pollo': 42900, 'alambre-mexicano': 40900, 'tamales-mexicanos': null,
  'aguas-frescas': 12500, limonadas: 12500, jugos: 12500, 'soda-saborizada-maracuya': 15900, 'soda-saborizada-frutos-rojos': 15900, 'te-o-soda-hatsu': 13900, mangonada: 15900, gaseosas: 8500, 'agua-hatsu': 8500,
  margaritas: null, 'margarita-rita': null, 'tequila-sunrise': null, 'cantarito-paloma': null, 'sex-on-the-beach': null, 'mimosa-durazno': null, 'pina-colada': null, mojito: null, vinos: null,
  sol: 12900, heineken: 15900, 'club-colombia': 12900, 'chelas-importadas': 16900,
  'mexican-bunuelos': 20900, 'quesadilla-de-cajeta': 23900, 'helado-frito': 23900, 'churros:1': 23900, 'churros:2': 24900, 'churros:3': 25900,
};

test('menu data reproduces every category and price of the PDF carta', () => {
  assert.deepEqual(menuCategories.map(category => category.title), ['Entradas', 'Sopas', 'Fajitas', 'Tacos y Taquiza', 'Carnes', 'Mero México', 'Bebidas', 'Cócteles & Chelas', 'Postres']);
  const actual: Record<string, number | null> = {};
  for (const category of menuCategories) for (const item of category.items) {
    for (const variant of item.variants) actual[variant.id ? `${item.id}:${variant.id}` : item.id] = variant.price;
  }
  assert.deepEqual(actual, pdfPrices);
});

test('star dishes are the ones named by the owner, in order', () => {
  assert.deepEqual(starItemIds, ['taquiza', 'carne-a-la-tampiquena', 'nachos-grandes', 'combo-mero-mero', 'flautas', 'fajitas-quesadillas', 'tacos']);
  const items = menuCategories.flatMap(category => category.items);
  for (const id of starItemIds) assert.equal(items.find(item => item.id === id)?.star, true, id);
  assert.equal(items.filter(item => item.star).length, starItemIds.length);
});

test('non-price choices become separate cart products with the same price', () => {
  for (const salsa of ['Verde', 'Mole', 'Roja']) assert.equal(menuProducts.find(item => item.id === `enchiladas|${salsa}`)?.price, 42900, salsa);
  assert.equal(menuProducts.find(item => item.id === 'enchiladas|Verde')?.name, 'Enchiladas (Salsa Verde)');
  assert.equal(menuProducts.find(item => item.id === 'enchiladas|Mole')?.image, '/dishes/enchiladas-de-mole.webp');
  assert.equal(menuProducts.find(item => item.id === 'tacos|Carnitas')?.image, '/dishes/tacos-de-carnitas.webp');
  assert.equal(menuProducts.find(item => item.id === famosasFull)?.name, 'Fajitas Famosas (Full Orden · Mixta)');
  assert.equal(menuProducts.find(item => item.id === 'entrada-mixta:x4')?.name, 'Entrada mixta (X4)');
  assert.equal(new Set(menuProducts.map(item => item.id)).size, menuProducts.length);
});

test('cart starts empty, adds selected quantities and merges the same product', () => {
  const empty: CartLine[] = [];
  assert.equal(cartSubtotal(empty), 0);
  const first = addToCart(empty, mixta, 2);
  assert.deepEqual(first, [{ productId: mixta, quantity: 2 }]);
  assert.deepEqual(empty, []);
  assert.deepEqual(addToCart(first, mixta, 1), [{ productId: mixta, quantity: 3 }]);
  assert.deepEqual(first, [{ productId: mixta, quantity: 2 }]);
});

test('media and full fajitas are independent variants with the PDF subtotal', () => {
  let cart = addToCart([], mixta, 1);
  cart = addToCart(cart, famosasHalf, 1);
  assert.equal(cartSubtotal(cart), 126800);
  cart = addToCart(cart, famosasFull, 1);
  assert.equal(cart.length, 3);
  assert.equal(cartSubtotal(cart), 242700);
});

test('cart quantities change line totals and removing the final item returns an empty cart', () => {
  const first = addToCart([], mixta, 1);
  const doubled = changeQuantity(first, mixta, 2);
  assert.equal(cartSubtotal(doubled), 81800);
  assert.deepEqual(changeQuantity(doubled, mixta, 1), first);
  assert.deepEqual(removeFromCart(doubled, mixta), []);
});

test('invalid products and quantities leave the cart and its subtotal unchanged; quantities cap at 99', () => {
  const cart = addToCart([], mixta, 1);
  for (const quantity of [0, -1, 1.5, NaN, Infinity, 100]) {
    assert.deepEqual(addToCart(cart, mixta, quantity), cart);
    assert.deepEqual(changeQuantity(cart, mixta, quantity), cart);
    assert.equal(cartSubtotal(cart), 40900);
  }
  for (const id of ['unknown', 'enchiladas', 'enchiladas|Azul', 'entrada-mixta', 'entrada-mixta:x3']) {
    assert.deepEqual(addToCart(cart, id, 1), cart, id);
  }
  assert.deepEqual(changeQuantity(cart, 'unknown', 2), cart);
  assert.deepEqual(removeFromCart(cart, 'unknown'), cart);
  const capped = addToCart(addToCart([], mixta, 98), mixta, 2);
  assert.deepEqual(capped, [{ productId: mixta, quantity: 99 }]);
});

test('WhatsApp uses every selected product, variant, choice, quantity and subtotal with a manual confirmation note', () => {
  const cart = addToCart(addToCart(addToCart([], mixta, 2), famosasFull, 1), 'enchiladas|Mole', 1);
  const message = cartMessage(cart);
  assert.equal(message, 'Hola La Lupe, quiero hacer este pedido:\n\n2 × Entrada mixta (X2) — $81.800\n1 × Fajitas Famosas (Full Orden · Mixta) — $115.900\n1 × Enchiladas (Salsa Mole) — $42.900\n\nSubtotal: $240.600 COP\n\nEl restaurante confirma disponibilidad, domicilio y total. Este mensaje no confirma el pedido ni realiza un pago.');
  const href = cartWhatsAppUrl(cart, '+57 311 634 1836');
  assert.ok(href);
  const url = new URL(href);
  assert.equal(url.origin + url.pathname, 'https://wa.me/573116341836');
  assert.equal(url.searchParams.get('text'), message);
  assert.equal(cartWhatsAppUrl(cart, ''), null);
  assert.equal(cartWhatsAppUrl([], '+57 311 634 1836'), null);
});

test('items without a confirmed price can be added and are listed as pending in the subtotal and WhatsApp message', () => {
  const tamales = menuProducts.find(item => item.id === 'tamales-mexicanos');
  assert.ok(tamales);
  assert.equal(tamales.price, null);
  assert.equal(tamales.image, '/dishes/tamales-mexicanos.webp');
  assert.equal(menuProducts.find(item => item.id === 'mojito')?.image, '/brand/la-lupe.png');
  assert.equal(menuProducts.find(item => item.id === 'margaritas')?.image, '/brand/la-lupe.png');
  let cart = addToCart([], 'mojito', 2);
  assert.deepEqual(cart, [{ productId: 'mojito', quantity: 2 }]);
  assert.equal(cartSubtotal(cart), 0);
  cart = addToCart(cart, mixta, 1);
  assert.equal(cartSubtotal(cart), 40900);
  assert.deepEqual(addToCart(cart, 'mojito', 0), cart);
  assert.equal(cartMessage(cart), 'Hola La Lupe, quiero hacer este pedido:\n\n2 × Mojito — precio por confirmar\n1 × Entrada mixta (X2) — $40.900\n\nSubtotal: $40.900 COP (sin incluir los productos con precio por confirmar)\n\nEl restaurante confirma disponibilidad, domicilio y total. Este mensaje no confirma el pedido ni realiza un pago.');
});
