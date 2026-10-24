import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { metadata } from '../src/app/menu/page';

const html = (whatsappNumber?: string) => renderToStaticMarkup(<MenuPage whatsappNumber={whatsappNumber} />);

const categoryIds = ['entradas', 'sopas', 'fajitas', 'tacos-y-taquiza', 'carnes', 'mero-mexico', 'bebidas', 'cocteles-y-chelas', 'postres'];

test('menu page has its own hero, star dishes first and every PDF category', () => {
  const markup = html();
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1);
  assert.match(markup, /<h1[^>]*>Menú <span>y pedido<\/span><\/h1>/);
  const star = markup.indexOf('id="platos-estrella"');
  assert.ok(star > 0, 'star section');
  let previous = star;
  for (const id of categoryIds) {
    const index = markup.indexOf(`<section id="${id}"`);
    assert.ok(index > previous, `${id} after previous section`);
    previous = index;
    assert.ok(markup.includes(`href="#${id}"`), `category link ${id}`);
  }
  for (const title of ['Platos estrella', 'Entradas', 'Sopas', 'Fajitas', 'Tacos y Taquiza', 'Carnes', 'Mero México', 'Bebidas', 'Cócteles &amp; Chelas', 'Postres']) assert.ok(markup.includes(title), title);
});

test('star section shows the owner star dishes in order, each marked as estrella', () => {
  const markup = html();
  // The desktop showcase grid; phones get the same dishes again in a carousel (see menu-mobile.test.tsx).
  const section = markup.match(/<section id="platos-estrella"[\s\S]*?<ul class="m-carousel"/)?.[0] ?? '';
  const names = [...section.matchAll(/<h3>([^<]+)/g)].map(match => match[1].trim());
  assert.deepEqual(names, ['Taquiza', 'Carne a la tampiqueña', 'Nachos grandes', 'Combo &quot;mero mero&quot;', 'Flautas', 'Fajitas Quesadillas', 'Tacos']);
  assert.equal((section.match(/class="star-badge"/g) ?? []).length, 7);
  assert.equal((section.match(/<article class="star-card/g) ?? []).length, 7);
});

test('star dishes stand out on their own instead of being enclosed in a frame', async () => {
  const { readFileSync } = await import('node:fs');
  const markup = html();
  assert.match(markup, /<section id="platos-estrella" class="menu-section star-showcase"/);
  const css = readFileSync('src/app/menu/menu.css', 'utf8');
  const showcase = css.match(/\.star-showcase \{([^}]*)\}/)?.[1] ?? '';
  assert.doesNotMatch(showcase, /border|background/);
  assert.doesNotMatch(css, /\.menu-section-star/);
  const card = css.match(/\.star-card \{([^}]*)\}/)?.[1] ?? '';
  assert.match(card, /box-shadow/);
  assert.match(card, /border/);
});

test('menu shows starting prices and the Taquiza choice-count preview', () => {
  const markup = html();
  for (const price of ['$33.900', '$38.900', '$40.900', '$35.900', '$65.900', '$85.900', '$79.900', '$42.900', '$34.900', '$12.500', '$15.900', '$13.900', '$8.500', '$12.900', '$16.900', '$20.900', '$23.900']) {
    assert.ok(markup.includes(price), price);
  }
  assert.doesNotMatch(markup, /\$22\.500|\$30\.500|Precios de referencia pendientes de aprobación/);
  assert.match(markup, /Elige 3 sabores para tu taquiza/);
});

test('items without a price stay addable and say so', () => {
  const markup = html();
  for (const name of ['Tamales mexicanos', 'Mojito', 'Margaritas']) {
    const card = markup.match(new RegExp(`<article class="dish-card[^"]*"[^>]*>(?:(?!</article>).)*<h3>${name}[\\s\\S]*?</article>`))?.[0] ?? '';
    assert.ok(card.includes('Precio por confirmar'), `${name} pending`);
    assert.ok(card.includes(`aria-label="Agregar ${name}"`), `${name} add`);
  }
});

test('menu uses the processed photos for dishes that have one', async () => {
  const { existsSync } = await import('node:fs');
  const markup = html();
  for (const slug of ['guacamole-con-chicharron', 'sopa-de-tortillas', 'pozole', 'fajitas', 'taquiza-e4ea759b', 'tacos-de-pastor', 'steak-lupe', 'hot-pepper-steak', 'enchiladas-verdes', 'flautas', 'quesadillas', 'tamales-mexicanos', 'bunuelos-mexicanos', 'helado-frito', 'churros']) {
    assert.ok(markup.includes(`%2Fdishes%2F${slug}.webp`) || markup.includes(`/dishes/${slug}.webp`), slug);
    assert.ok(existsSync(`public/dishes/${slug}.webp`), `file ${slug}`);
  }
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
  const markup = html('');
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
  assert.equal(metadata.title, 'Menú de comida mexicana | La Lupe');
  assert.doesNotMatch(String(metadata.description), /tex-?mex|sin pedidos/i);
});


test('menu keeps its only order CTA at the end and one floating WhatsApp control', () => {
  const markup = html();
  assert.equal((markup.match(/class="whatsapp-float"/g) ?? []).length, 1);
  const hero = markup.match(/<section class="menu-hero"[\s\S]*?<\/section>/)?.[0];
  const header = markup.match(/<header[\s\S]*?<\/header>/)?.[0];
  const finalCTA = markup.match(/<dialog id="tu-pedido" class="cart-panel"[\s\S]*?<\/dialog>/)?.[0];
  assert.ok(hero && header && finalCTA);
  assert.doesNotMatch(hero + header, /Pedir carrito por WhatsApp/);
  assert.match(finalCTA, /Pedir carrito por WhatsApp/);
});


test('menu exposes an explicitly opened modal cart and floating count button', () => {
  const markup = html();
  assert.match(markup, /<dialog id="tu-pedido" class="cart-panel"[^>]*aria-labelledby="cart-title"/);
  assert.doesNotMatch(markup, /<dialog[^>]*\sopen(?:=|\s|>)/);
  assert.match(markup, /aria-haspopup="dialog"/);
  assert.match(markup, /aria-label="Cerrar carrito"/);
  assert.match(markup, /<button[^>]*class="cart-continue"[^>]*>Agregar más productos<\/button>/);
});

test('menu exposes an empty cart and accessible add/quantity controls', () => {
  const markup = html();
  assert.match(markup, /Tu carrito está vacío/);
  assert.match(markup, /class="cart-subtotal"><span>Subtotal<\/span><strong>\$0<\/strong>/);
  assert.match(markup, /aria-label="Agregar Nachos grandes"/);
  assert.match(markup, /aria-label="Aumentar cantidad de Nachos grandes"/);
  assert.match(markup, /aria-controls="tu-pedido" aria-expanded="false"/);
  assert.match(markup, /Domicilios a Cota y Chía/);
});

const categoryMarkup = (markup: string, id: string) => markup.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))?.[0] ?? '';

test('Entrada mixta is one card previewing X2/X4/X6 with an Agregar options trigger', () => {
  const entradas = categoryMarkup(html(), 'entradas').split('<ul class="m-carousel"')[0];
  const cards = entradas.match(/<article class="dish-card[^\"]*"[\s\S]*?<\/article>/g) ?? [];
  assert.equal(cards.length, 5);
  const card = cards.find(card => card.includes('id="plato-entrada-mixta"')) ?? '';
  for (const size of ['X2', 'X4', 'X6']) assert.ok(card.includes(`<li>${size}</li>`), size);
  assert.match(card, /Desde \$40\.900/);
  assert.match(card, /aria-label="Elegir opciones de Entrada mixta"/);
  assert.doesNotMatch(card, /\$81\.900|\$112\.900|<table\b/);
});

test('each Fajitas dish is one full-photo card previewing both portions and all proteins', () => {
  const fajitas = categoryMarkup(html(), 'fajitas').split('<ul class="m-carousel"')[0];
  const cards = fajitas.match(/<article class="dish-card[^\"]*"[\s\S]*?<\/article>/g) ?? [];
  assert.equal(cards.length, 2);
  for (const [card, name, price] of [[cards[0], 'Fajitas Poblanas', '$65.900'], [cards[1], 'Fajitas Famosas', '$85.900']]) {
    for (const label of ['1/2 Orden', 'Full Orden', 'Pollo', 'Carne', 'Mixta']) assert.ok(card.includes(`<li>${label}</li>`), `${name}: ${label}`);
    assert.ok(card.includes(`Desde ${price}`));
    assert.ok(card.includes(`aria-label="Elegir opciones de ${name}"`));
    assert.match(card, /class="dish-photo(?: dish-logo)?"/);
    assert.doesNotMatch(card, /menu-board|<table\b|<select\b/);
  }
});

test('all other option dishes use the same one-card preview and dialog entry point', () => {
  for (const [category, name, labels] of [
    ['tacos-y-taquiza', 'Taquiza', ['2 personas', '4 personas', '6 personas', 'Pescado', 'Camarón']],
    ['tacos-y-taquiza', 'Tacos', ['Al Pastor', 'Carnitas', 'Birria', 'Cochinita', 'Arrachera', 'Pescado', 'Camarón']],
    ['mero-mexico', 'Enchiladas', ['Salsa Verde', 'Salsa Mole', 'Salsa Roja']],
    ['mero-mexico', 'Burritos', ['Carne molida', 'Pollo', 'Carne asada', 'Mixto']],
    ['mero-mexico', 'Fajitas Quesadillas', ['Carnitas', 'Pastor', 'Birria', 'Cochinita', 'Carne', 'Pollo']],
    ['bebidas', 'Aguas frescas', ['Jamaica', 'Horchata', 'Tamarindo']],
    ['cocteles-y-chelas', 'Chelas Importadas', ['Stella Artois', 'Corona']],
    ['postres', 'Churros', ['1 topping', '2 toppings', '3 toppings', 'Chocolate', 'Arequipe', 'Helado']],
  ] as const) {
    const cards = categoryMarkup(html(), category).match(/<article class="dish-card[^\"]*"[\s\S]*?<\/article>/g) ?? [];
    const card = cards.find(card => card.includes(`<h3>${name}`)) ?? '';
    assert.ok(card, name);
    for (const label of labels) assert.ok(card.includes(`<li>${label}</li>`), `${name}: ${label}`);
    assert.equal((card.match(/aria-haspopup="dialog"/g) ?? []).length, 1, name);
    assert.ok(card.includes(`aria-label="Elegir opciones de ${name}"`), name);
  }
  assert.equal((html().match(/<select\b/g) ?? []).length, 0, 'choices move to the dialog, never an inline price table');
});
