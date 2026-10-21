import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import Page, { metadata } from '../src/app/nuestra-esencia/page';

test('essence tells an explicitly fictional three-part story with reference images', () => {
  const markup = renderToStaticMarkup(<Page />);
  const section = markup.match(/<section id="nosotros"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(section, /Historia de ejemplo · No corresponde a la historia real del restaurante/);
  for (const title of ['Todo empieza en una mesa', 'Una idea con sabor a México', 'Lo que queremos compartir']) {
    assert.ok(section.includes(`<h3>${title}</h3>`), title);
  }
  assert.equal((section.match(/class="essence-story-card"/g) ?? []).length, 3);
  assert.equal((section.match(/<figcaption>Imagen de referencia<\/figcaption>/g) ?? []).length, 3);
  for (const asset of ['entradas.webp', 'taquiza.webp', 'fajitas.webp']) {
    assert.ok(section.includes(`/reference/${asset}`));
  }
  assert.doesNotMatch(section, /La historia y descripción del restaurante están pendientes/);
});

test('essence route has its own heading, current navigation and demo metadata', () => {
  const markup = renderToStaticMarkup(<Page />);
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1);
  assert.match(markup, /<a href="\/nuestra-esencia" aria-current="page">Nuestra esencia<\/a>/);
  for (const href of ['/#inicio', '/menu', '/visitanos']) assert.ok(markup.includes(`href="${href}"`));
  assert.deepEqual(metadata.robots, { index: false, follow: false });
});
