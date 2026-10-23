import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';

const html = () => renderToStaticMarkup(<MenuPage />);
test('beverages and cocktails omit all photos and logo placeholders but retain prices and order controls', () => {
  const markup = html();
  for (const id of ['bebidas', 'cocteles-y-chelas']) {
    const section = markup.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))?.[0] ?? '';
    assert.ok(section, id);
    assert.doesNotMatch(section, /<img\b/, id);
    assert.match(section, /aria-label="Agregar /);
    assert.match(section, /\$[\d.]+/);
  }
});

test('cart has a lightweight live add-success feedback region', () => {
  assert.match(html(), /<p class="cart-feedback" role="status" aria-atomic="true"><\/p>/);
});
