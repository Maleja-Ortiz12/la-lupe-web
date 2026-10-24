import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { menuCategories } from '../src/features/menu/menu-data';

test('mobile category header has labelled icon links and one initially active category', () => {
  const markup = renderToStaticMarkup(<MenuPage />);
  const nav = markup.match(/<nav class="menu-category-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(nav, /class="menu-category-heading"/);
  assert.match(nav, /class="menu-category-strip"/);
  const links = nav.match(/<a\b[\s\S]*?<\/a>/g) ?? [];
  assert.equal(links.length, menuCategories.length + 2);
  assert.equal((nav.match(/aria-current="location"/g) ?? []).length, 1);
  for (const link of links) {
    assert.match(link, /<svg\b[^>]*aria-hidden="true"/);
    assert.match(link, /<span>[^<]+<\/span>/);
  }
  for (const id of ['platos-estrella', ...menuCategories.map(category => category.id), 'catering']) {
    assert.ok(nav.includes(`href="#${id}"`));
    assert.ok(markup.includes(`id="${id}"`));
  }
});
