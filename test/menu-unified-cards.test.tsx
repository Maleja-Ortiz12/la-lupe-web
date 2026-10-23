import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { hasOptions, menuCategories } from '../src/features/menu/menu-data';

const html = renderToStaticMarkup(<MenuPage />);
const desktopSection = (id: string) => (html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))?.[0] ?? '').split('<ul class="m-carousel"')[0];
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

test('every category renders exactly one consistent desktop card per dish, including Entrada mixta', () => {
  for (const category of menuCategories) {
    const section = desktopSection(category.id);
    const cards = section.match(/<article class="dish-card[^\"]*"[\s\S]*?<\/article>/g) ?? [];
    assert.equal(cards.length, category.items.length, category.id);
    for (const item of category.items) assert.equal(cards.filter(card => card.includes(`id="plato-${item.id}"`)).length, 1, item.id);
    assert.doesNotMatch(section, /<table\b|class="variant-card|class="menu-board/);
  }
  assert.equal((desktopSection('entradas').match(/<article\b/g) ?? []).length, 5);
});

test('all option cards preview variation names but route Agregar to the accessible shared dialog', () => {
  for (const category of menuCategories) for (const item of category.items.filter(hasOptions)) {
    const cards = desktopSection(category.id).match(/<article class="dish-card[^\"]*"[\s\S]*?<\/article>/g) ?? [];
    const card = cards.find(card => card.includes(`id="plato-${item.id}"`)) ?? '';
    assert.match(card, /class="card-variations"/);
    const labels = [...item.variants.map(variant => variant.label), ...(item.choice?.options ?? item.picks?.options ?? []).map(option => option.label)].filter(Boolean);
    for (const label of labels) assert.ok(card.includes(escape(label)), `${item.id}: ${label}`);
    assert.ok(card.includes(`aria-label="Elegir opciones de ${escape(item.name)}"`), item.id);
    assert.match(card, /aria-haspopup="dialog" aria-controls="opciones-producto"/);
    assert.match(card, />Agregar<\/button>/);
    assert.doesNotMatch(card, /class="cart-stepper"/);
  }
});

test('Entrada mixta is one X2/X4/X6 preview without separate variant price blocks', () => {
  const card = (desktopSection('entradas').match(/<article class="dish-card[^\"]*"[\s\S]*?<\/article>/g) ?? []).find(card => card.includes('id="plato-entrada-mixta"')) ?? '';
  for (const size of ['X2', 'X4', 'X6']) assert.ok(card.includes(size));
  assert.doesNotMatch(card, /\$81\.900|\$112\.900/);
  assert.match(card, /Desde \$40\.900/);
});
