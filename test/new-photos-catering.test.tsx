import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomePage } from '../src/features/presentation/components/home-page';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { menuCategories, starItems } from '../src/features/menu/menu-data';
import { menuProducts } from '../src/features/menu/cart';

// odd/tasks/new-photos-catering.md
const items = menuCategories.flatMap(category => category.items);
const item = (id: string) => items.find(entry => entry.id === id)!;

const newPhotos: Record<string, string> = {
  burritos: 'burritos',
  'carne-a-la-tampiquena': 'carne-a-la-tampiquena',
  churros: 'churros',
  'combo-mero-mero': 'combo-mero-mero',
  esquite: 'esquite',
  'nachos-grandes': 'nachos-grandes',
  pozole: 'pozole',
  'entrada-mixta': 'entrada-mixta',
  'fajitas-famosas': 'fajitas',
  taquiza: 'taquiza-e4ea759b',
  'tinga-de-pollo': 'tinga-de-pollo',
};

test('S1: every dish with a new owner photo uses its processed 960x720 WebP', async () => {
  for (const [id, slug] of Object.entries(newPhotos)) {
    assert.equal(item(id).image, `/dishes/${slug}.webp`, id);
    const file = `public/dishes/${slug}.webp`;
    assert.ok(existsSync(file), file);
    const meta = await sharp(file).metadata();
    assert.deepEqual([meta.format, meta.width, meta.height], ['webp', 960, 720], file);
  }
});

test('S1: the Birria tacos option carries its own photo into the cart line', () => {
  assert.equal(menuProducts.find(product => product.id === 'tacos|Birria')?.image, '/dishes/tacos-de-birria.webp');
  assert.ok(existsSync('public/dishes/tacos-de-birria.webp'));
});

test('S1: star dishes with new photos show them in Platos estrella and on the home specialties', () => {
  const home = renderToStaticMarkup(<HomePage />);
  for (const id of ['carne-a-la-tampiquena', 'nachos-grandes', 'combo-mero-mero', 'taquiza']) {
    assert.ok(starItems.some(star => star.id === id && star.image === `/dishes/${newPhotos[id]}.webp`), id);
    assert.ok(home.includes(`%2Fdishes%2F${newPhotos[id]}.webp`) || home.includes(`/dishes/${newPhotos[id]}.webp`), `home ${id}`);
  }
});

const catering = (markup: string) => markup.match(/<section id="catering"[\s\S]*?<\/section>/)?.[0] ?? '';

test('S2: the home page shows the catering service right after Nuestras Especialidades', () => {
  const home = renderToStaticMarkup(<HomePage />);
  const block = catering(home);
  assert.ok(block, 'catering section');
  assert.ok(home.indexOf('id="carta"') < home.indexOf('id="catering"') && home.indexOf('id="catering"') < home.indexOf('id="nosotros"'), 'between specialties and essence');
  assert.match(block, /Fiestas en casa/);
  assert.match(block, /Catering/);
  assert.equal((block.match(/<img\b/g) ?? []).length, 3);
  assert.match(block, /href="https:\/\/wa\.me\/573116341836\?text=[^"]*catering/i);
  assert.match(block, /Cotizar por WhatsApp/);
  assert.doesNotMatch(block, /\$\d/, 'no invented prices');
});

test('S2: the menu ends with the catering service and links it from both navigations', () => {
  const menu = renderToStaticMarkup(<MenuPage />);
  const block = catering(menu);
  assert.ok(block, 'catering section');
  assert.ok(menu.indexOf('id="postres"') < menu.indexOf('id="catering"'), 'after Postres');
  assert.equal((block.match(/<img\b/g) ?? []).length, 3);
  assert.match(block, /Cotizar por WhatsApp/);
  assert.match(menu.match(/<aside class="menu-sidebar"[\s\S]*?<\/aside>/)?.[0] ?? '', /href="#catering"/);
  assert.match(menu.match(/<nav class="menu-category-nav"[\s\S]*?<\/nav>/)?.[0] ?? '', /href="#catering"/);
  for (let index = 1; index <= 3; index++) assert.ok(existsSync(`public/catering/fiestas-en-casa-${index}.webp`), `photo ${index}`);
});

test('S2: without a WhatsApp number the quote button is disabled and explained', () => {
  const block = catering(renderToStaticMarkup(<HomePage whatsappNumber="" />));
  assert.match(block, /<button class="[^"]*catering-cta"[^>]*disabled=""[^>]*aria-describedby="catering-status"/);
  assert.match(block, /<p id="catering-status"/);
  assert.doesNotMatch(block, /wa\.me/);
});

test('S2/S3: catering adds no duplicate ids and invents no prices or capacities', () => {
  for (const markup of [renderToStaticMarkup(<HomePage />), renderToStaticMarkup(<MenuPage />)]) {
    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(ids.filter((id, index) => ids.indexOf(id) !== index), []);
    const block = catering(markup);
    assert.match(block, /<ul class="catering-gallery" aria-label="[^"]+"/);
    assert.equal((block.match(/<img\b[^>]*alt="[^"]{10,}"/g) ?? []).length, 3);
    assert.doesNotMatch(block, /\$\s?\d|\d+\s?(personas|invitados)|m[ií]nimo/i);
  }
});
