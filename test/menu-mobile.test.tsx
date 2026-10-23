import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { itemOptions, formatPrice, hasOptions, menuCategories, startingPrice, starItems } from '../src/features/menu/menu-data';
import { menuProducts, productId } from '../src/features/menu/cart';

const html = renderToStaticMarkup(<MenuPage />);
const section = (id: string) => html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))?.[0] ?? '';
// Cards now include a nested list of variation labels. Do not stop at its first </ul>/<li>.
const carousel = (id: string) => {
  const markup = section(id);
  const start = markup.indexOf('<ul class="m-carousel"');
  return start < 0 ? '' : markup.slice(start);
};
const cards = (id: string) => {
  const markup = carousel(id);
  const starts = [...markup.matchAll(/<li class="m-card[^"]*"/g)].map(match => match.index!);
  return starts.map((start, index) => markup.slice(start, starts[index + 1] ?? markup.length));
};
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

test('every menu category and the star section have a labelled horizontal carousel with one card per dish', () => {
  for (const category of menuCategories) {
    assert.ok(carousel(category.id).includes(`aria-label="${escape(category.title)}: desliza para ver más"`), category.id);
    assert.equal(cards(category.id).length, category.items.length, category.id);
  }
  assert.equal(cards('platos-estrella').length, starItems.length);
});

test('carousel cards show the name, COP price and a direct + button; option dishes open a selector', () => {
  for (const category of menuCategories) {
    category.items.forEach((item, index) => {
      const card = cards(category.id)[index];
      assert.ok(card.includes(`>${escape(item.name)}`), `${item.id} name`);
      const price = startingPrice(item);
      const label = price === null ? 'Precio por confirmar' : `${hasOptions(item) ? 'Desde ' : ''}${formatPrice(price)}`;
      assert.ok(card.includes(label), `${item.id} price ${label}`);
      const plus = card.match(/<button\b[^>]*class="m-add"[^>]*>/)?.[0] ?? '';
      if (hasOptions(item)) {
        assert.ok(plus.includes(`aria-label="Elegir opciones de ${escape(item.name)}"`), `${item.id} options +`);
        assert.match(plus, /aria-haspopup="dialog"/);
      } else {
        assert.match(plus, new RegExp(`aria-label="Agregar ${escape(item.name).replace(/[()]/g, '\\$&')}`), `${item.id} direct +`);
      }
    });
  }
});

test('dish photos are shown except for beverages, and descriptions get a Ver más toggle', () => {
  for (const category of menuCategories) {
    const beverage = category.id === 'bebidas' || category.id === 'cocteles-y-chelas';
    category.items.forEach((item, index) => {
      const card = cards(category.id)[index];
      assert.equal(/<img\b/.test(card), !beverage, `${item.id} image`);
      if (item.description) assert.match(card, /<p class="m-desc" id="[^"]+"/);
      const toggle = /<button\b[^>]*class="m-more"[^>]*aria-expanded="false"[^>]*>Ver más<\/button>/.test(card);
      assert.equal(toggle, (item.description?.length ?? 0) > 70, `${item.id}: Ver más only for long descriptions`);
    });
  }
});

test('a single options sheet dialog is available for option dishes', () => {
  assert.equal((html.match(/<dialog\b[^>]*id="opciones-producto"/g) ?? []).length, 1);
});

test('menu markup has no duplicate ids and every aria-controls target exists', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual([...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))], []);
  const dangling = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(match => match[1]).filter(id => !ids.includes(id));
  assert.deepEqual(dangling, []);
});

test('every options-sheet combination maps to a cart product priced by its variant', () => {
  for (const category of menuCategories) for (const item of category.items.filter(hasOptions))
    for (const variant of item.variants) for (const option of itemOptions(item, variant)) {
      const product = menuProducts.find(entry => entry.id === productId(item, variant, option));
      assert.ok(product, `${item.id} ${variant.id} ${option?.value}`);
      assert.equal(product.price, variant.price);
    }
});
