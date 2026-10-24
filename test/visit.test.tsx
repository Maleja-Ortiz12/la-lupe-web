import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import Page, { metadata } from '../src/app/visitanos/page';
import { HomePage } from '../src/features/presentation/components/home-page';

const address = 'Cl. 2 #11-80, Chía, Cundinamarca';

test('visit page shows the supplied address and an accessible lazy map at the supplied coordinates', () => {
  const markup = renderToStaticMarkup(<Page />);
  assert.ok(markup.includes(address));
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1);
  assert.match(markup, /<iframe[^>]*title="Mapa de ubicación de La Lupe en Chía"[^>]*loading="lazy"/);
  assert.match(markup, /src="https:\/\/www.google.com\/maps\?q=4\.8533766%2C-74\.0645729&amp;z=17&amp;output=embed"/);
  assert.match(markup, /Cómo llegar/);
  assert.match(markup, /destination=4\.8533766%2C-74\.0645729/);
  assert.match(markup, /target="_blank" rel="noopener noreferrer"/);
  assert.match(markup, /El mapa es un servicio externo de Google Maps/);
  assert.match(markup, /Horarios por confirmar/);
  assert.doesNotMatch(markup, /mailto:|Dirección y ubicación por confirmar/);
  assert.match(markup, /<a href="\/visitanos" aria-current="page">Visítanos<\/a>/);
  assert.deepEqual(metadata.robots, { index: true, follow: true });
});

test('home links to the visit page without embedding a map or losing the supplied address', () => {
  const markup = renderToStaticMarkup(<HomePage />);
  assert.ok(markup.includes(address));
  assert.match(markup, /href="\/visitanos"[^>]*>Ver ubicación y cómo llegar/);
  assert.doesNotMatch(markup, /<iframe/);
});
