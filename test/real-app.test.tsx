import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../src/app/page';
import Menu, { metadata as menu } from '../src/app/menu/page';
import Essence, { metadata as essence } from '../src/app/nuestra-esencia/page';
import Visit, { metadata as visit } from '../src/app/visitanos/page';
import { metadata as home } from '../src/app/page-metadata';
import { alt as socialAlt } from '../src/app/opengraph-image';

// odd/tasks/mobile-polish-real-app.md S4: this is the restaurant's app, not a proposal or demo.
const demoCopy = /Demostraci[oó]n|Propuesta|\bDemo\b|demo local|Imagen(?:es)? de referencia|de referencia|pendientes? de aprobaci[oó]n|Historia de ejemplo|historia imaginada|imaginamos|ficticia|conceptual|no es una fotograf[ií]a|no es un plato verificado/i;
const routes = [['/', Home, home], ['/menu', Menu, menu], ['/nuestra-esencia', Essence, essence], ['/visitanos', Visit, visit]] as const;

test('no route shows demo, proposal, reference or pending-approval copy', () => {
  for (const [path, Page] of routes) {
    const markup = renderToStaticMarkup(<Page />);
    assert.doesNotMatch(markup.replace(/<script[\s\S]*?<\/script>/g, ''), demoCopy, path);
    assert.doesNotMatch(markup, /class="demo-bar"/, path);
  }
});

test('metadata, social image and structured data drop "Demo" but keep noindex until the real domain exists', () => {
  for (const [path, , metadata] of routes) {
    for (const text of [metadata.title, metadata.description, metadata.applicationName, metadata.openGraph && 'siteName' in metadata.openGraph ? metadata.openGraph.siteName : '']) {
      assert.doesNotMatch(String(text), demoCopy, `${path}: ${text}`);
    }
    assert.deepEqual(metadata.robots, { index: false, follow: false }, path);
  }
  assert.doesNotMatch(socialAlt, demoCopy);
  const data = JSON.parse(renderToStaticMarkup(<Home />).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '{}');
  assert.doesNotMatch(data.description, demoCopy);
  assert.match(data.description, /Chía/);
});

test('Nuestra esencia uses short truthful copy about the restaurant instead of an invented story', () => {
  const section = renderToStaticMarkup(<Essence />).match(/<section id="nosotros"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(section, /Chía/);
  assert.equal((section.match(/class="essence-story-card"/g) ?? []).length, 3);
  assert.doesNotMatch(section, /<figcaption>/);
  assert.doesNotMatch(section, /Todo empieza en una mesa|Una idea con sabor a México|Lo que queremos compartir/);
});
