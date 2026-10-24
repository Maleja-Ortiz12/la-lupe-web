import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { HomePage } from '../src/features/presentation/components/home-page';
import { hasOptions, menuCategories, starItems } from '../src/features/menu/menu-data';

test('categories show selectable products first and preserve source order within both groups', () => {
  const html = renderToStaticMarkup(<MenuPage />);
  for (const category of menuCategories) {
    const section = html.match(new RegExp(`<section id="${category.id}"[\\s\\S]*?</section>`))?.[0] ?? '';
    const expected = [...category.items.filter(hasOptions), ...category.items.filter(item => !hasOptions(item))];
    let previous = -1;
    for (const item of expected) {
      const position = section.indexOf(`id="plato-${item.id}"`);
      assert.ok(position > previous, `${category.title}: ${item.id} follows preceding item`);
      previous = position;
    }
  }
});

test('every catalog product without a dish photograph uses the real logo, not invented food or blank art', () => {
  const html = renderToStaticMarkup(<MenuPage />);
  const home = renderToStaticMarkup(<HomePage />);
  for (const category of menuCategories.filter(category => !['bebidas', 'cocteles-y-chelas'].includes(category.id))) for (const item of category.items.filter(item => !item.image)) {
    const card = html.match(new RegExp(`<article[^>]*id="plato-${item.id}"[\\s\\S]*?</article>`))?.[0] ?? '';
    assert.ok(card.includes('%2Fbrand%2Fla-lupe.png') || card.includes('/brand/la-lupe.png'), item.id);
    assert.ok(card.includes('Logo de La Lupe'), item.id);
  }
  assert.doesNotMatch(html + home, /class="star-card-art"/);
  // Every star dish now has a real photo (odd/tasks/new-photos-catering.md), so the home logo fallback only
  // appears while a star dish still lacks one.
  const starsWithoutPhoto = starItems.filter(item => !item.image).length;
  assert.equal((home.match(/class="card-photo dish-logo"/g) ?? []).length, starsWithoutPhoto);
});
