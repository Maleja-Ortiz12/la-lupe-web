import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import Page, { metadata } from '../src/app/nuestra-esencia/page';

test('essence describes the restaurant in three truthful parts with local images', () => {
  const markup = renderToStaticMarkup(<Page />);
  const section = markup.match(/<section id="nosotros"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(section, /Cl\. 2 #11-80, Chía/);
  for (const title of ['Para compartir', 'Tacos y taquizas', 'Fajitas a tu gusto']) {
    assert.ok(section.includes(`<h3>${title}</h3>`), title);
  }
  assert.equal((section.match(/class="essence-story-card"/g) ?? []).length, 3);
  assert.doesNotMatch(section, /<figcaption>/);
  for (const asset of ['guacamole-con-chicharron.webp', 'taquiza.webp', 'fajitas.webp']) {
    assert.ok(section.includes(`/dishes/${asset}`));
  }
  assert.doesNotMatch(section, /La historia y descripción del restaurante están pendientes/);
});

test('essence route has its own heading, current navigation and noindex metadata', () => {
  const markup = renderToStaticMarkup(<Page />);
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1);
  assert.match(markup, /<a href="\/nuestra-esencia" aria-current="page">Nuestra esencia<\/a>/);
  for (const href of ['/#inicio', '/menu', '/visitanos']) assert.ok(markup.includes(`href="${href}"`));
  assert.deepEqual(metadata.robots, { index: false, follow: false });
});
