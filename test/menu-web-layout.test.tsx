import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { menuCategories } from '../src/features/menu/menu-data';

// odd/tasks/menu-web-template.md S2: desktop "Categorías" sidebar from the owner's template.
const html = renderToStaticMarkup(<MenuPage />);
const sidebar = html.match(/<aside class="menu-sidebar"[\s\S]*?<\/aside>/)?.[0] ?? '';
const escape = (text: string) => text.replace(/&/g, '&amp;');

test('the desktop menu has a Categorías sidebar linking every section in order, each with an icon', () => {
  assert.ok(sidebar, 'sidebar');
  assert.match(sidebar, /<p class="menu-sidebar-title" id="menu-sidebar-title">Categorías<\/p>/);
  assert.match(sidebar, /<nav[^>]*aria-labelledby="menu-sidebar-title"/);
  const links = [...sidebar.matchAll(/<a\b[^>]*href="#([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.deepEqual(links.map(link => link[1]), ['platos-estrella', ...menuCategories.map(category => category.id)]);
  const labels = ['Estrella', ...menuCategories.map(category => escape(category.title))];
  links.forEach((link, index) => {
    assert.match(link[2], /<svg\b[^>]*class="menu-sidebar-icon"[^>]*aria-hidden="true"/, `${labels[index]} icon`);
    assert.ok(link[2].includes(`<span>${labels[index]}</span>`), labels[index]);
  });
});

test('the first sidebar entry starts as the current location and no other one does', () => {
  const current = [...sidebar.matchAll(/<a\b[^>]*aria-current="location"[^>]*href="#([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(current, ['platos-estrella']);
});

test('phones keep their pill navigation alongside the sidebar markup', () => {
  assert.match(html, /<nav class="menu-category-nav" aria-label="Categorías del menú">/);
});
