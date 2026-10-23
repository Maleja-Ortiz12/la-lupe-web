import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { metadata as home } from '../src/app/page-metadata';
import { metadata as menu } from '../src/app/menu/page';
import { metadata as essence } from '../src/app/nuestra-esencia/page';
import { metadata as visit } from '../src/app/visitanos/page';
import Home from '../src/app/page';

const pages = [['/', home], ['/menu', menu], ['/nuestra-esencia', essence], ['/visitanos', visit]] as const;

test('all four routes have unique, consistent local SEO and social metadata while retaining noindex', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [path, metadata] of pages) {
    assert.deepEqual(metadata.robots, { index: false, follow: false });
    assert.ok(metadata.metadataBase instanceof URL);
    assert.equal(metadata.metadataBase.origin, 'http://localhost:3005');
    assert.equal(typeof metadata.title, 'string');
    assert.match(String(metadata.title), /La Lupe/);
    assert.match(String(metadata.title), /comida mexicana/i);
    assert.doesNotMatch(String(metadata.title), /Demo/);
    assert.doesNotMatch(String(metadata.description), /demostración|demo|ejemplo|ficticia/i);
    assert.ok(String(metadata.title).length <= 60);
    assert.ok(String(metadata.description).length <= 170);
    titles.add(metadata.title);
    descriptions.add(metadata.description);
    const og = metadata.openGraph;
    assert.ok(og && 'type' in og);
    assert.equal(og.type, 'website');
    assert.equal(og.locale, 'es_CO');
    assert.equal(og.title, metadata.title);
    assert.equal(og.description, metadata.description);
    assert.equal(og.url, path);
    assert.deepEqual(og.images, [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'La Lupe · Comida mexicana en Chía' }]);
    assert.ok(metadata.twitter && 'card' in metadata.twitter);
    assert.equal(metadata.twitter.card, 'summary_large_image');
    assert.equal(metadata.twitter.title, metadata.title);
    assert.equal(metadata.twitter.description, metadata.description);
    assert.equal(metadata.alternates?.canonical, undefined);
    assert.equal(metadata.keywords, undefined);
  }
  assert.equal(titles.size, 4);
  assert.equal(descriptions.size, 4);
  assert.match(String(home.description), /Chía/);
  assert.match(String(essence.description), /mexicana/);
  assert.match(String(essence.description), /Chía/);
  assert.match(String(menu.description), /con precios/);
  assert.match(String(menu.description), /Domicilios a Cota y Chía/);
  assert.doesNotMatch(String(menu.description), /referencia|pendientes de aprobación/);
});

test('home exposes parseable restaurant data using only supplied location, phone and delivery facts', () => {
  const markup = renderToStaticMarkup(<Home />);
  const scripts = [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  const data = JSON.parse(scripts[0][1]);
  assert.equal(data['@context'], 'https://schema.org');
  assert.equal(data['@type'], 'Restaurant');
  assert.equal(data.name, 'La Lupe');
  assert.equal(data.servesCuisine, 'Mexicana');
  assert.match(data.description, /comida mexicana en Chía/i);
  assert.doesNotMatch(data.description, /demostración|pendiente/i);
  assert.deepEqual(data.address, { '@type': 'PostalAddress', streetAddress: 'Cl. 2 #11-80', addressLocality: 'Chía', addressRegion: 'Cundinamarca', addressCountry: 'CO' });
  assert.deepEqual(data.geo, { '@type': 'GeoCoordinates', latitude: 4.8533766, longitude: -74.0645729 });
  assert.match(data.hasMap, /^https:\/\/www.google.com\/maps\/place\/La\+Lupe/);
  assert.equal(data.telephone, '+57 311 634 1836');
  assert.deepEqual(data.areaServed, [{ '@type': 'City', name: 'Cota' }, { '@type': 'City', name: 'Chía' }]);
  for (const field of ['openingHours', 'openingHoursSpecification', 'aggregateRating', 'review', 'offers', 'priceRange', 'url', 'image']) {
    assert.equal(data[field], undefined, `Do not invent ${field} without owner data`);
  }
});
