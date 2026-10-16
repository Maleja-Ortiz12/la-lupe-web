import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomePage } from '../src/features/presentation/components/home-page';
import { metadata } from '../src/app/page-metadata';

const html = () => renderToStaticMarkup(<HomePage />);

test('landing exposes the basic sections and working internal navigation', () => {
  const markup = html();
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1);
  for (const id of ['inicio', 'carta', 'nosotros', 'contacto']) {
    assert.match(markup, new RegExp(`id="${id}"`));
    assert.match(markup, new RegExp(`href="#${id}"`));
  }
  assert.match(markup, /<header/);
  assert.match(markup, /<main id="contenido"/);
  assert.match(markup, /<footer/);
  assert.match(markup, /href="#contenido"/);
});

test('demo preserves the non-operational scope and never invents contact or prices', () => {
  const markup = html();
  assert.match(markup, /Demostración visual/);
  assert.match(markup, /Carta pendiente de aprobación/);
  assert.match(markup, /Datos de contacto pendientes/);
  assert.match(markup, /Imágenes de referencia/);
  assert.doesNotMatch(markup, /wa\.me|checkout|tel:|mailto:|\$[0-9]|Hacer pedido|Asistente/);
  assert.match(markup, /WhatsApp no disponible/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*aria-describedby="contact-status"/);
  assert.doesNotMatch(markup, /<input|<form/);
});

test('landing follows the supplied reference sections and uses local reference assets', () => {
  const markup = html();
  for (const label of ['Sabor Mexicano', 'en Cada Encuentro', 'Nuestras Especialidades', 'Fajitas', 'Taquiza', 'Entradas para compartir', 'Nuestra Esencia', 'Visítanos']) {
    assert.ok(markup.includes(label), label);
  }
  assert.doesNotMatch(markup, /viewBox="0 0 600 460"|El sabor nos|Para abrir/);
  for (const asset of ['hero.webp', 'fajitas.webp', 'taquiza.webp', 'entradas.webp', 'esencia-brandless.webp']) {
    assert.ok(markup.includes(`/reference/${asset}`), asset);
  }
});

test('all brand placements use the supplied original logo without tinting or the concept logo', () => {
  const markup = decodeURIComponent(html());
  assert.equal((markup.match(/<img\b[^>]*\bsrc="[^"]*\/brand\/la-lupe\.png[^"]*"/g) ?? []).length, 3);
  assert.doesNotMatch(markup, /\/reference\/logo\.webp/);
  assert.match(markup, /Logotipo original de La Lupe/);
});

test('reference flourishes and location/contact icons use decorative SVG instead of text symbols', () => {
  const markup = html();
  assert.equal((markup.match(/class="flourish-garnish/g) ?? []).length, 4);
  assert.match(markup, /data-icon="location"/);
  assert.match(markup, /data-icon="clock"/);
  assert.doesNotMatch(markup, /⌖|◷/);
});

test('floating WhatsApp is visibly labeled but disabled with no destination', () => {
  const markup = html();
  assert.match(markup, /class="whatsapp-float"/);
  assert.match(markup, /id="whatsapp-float-status"[^>]*>WhatsApp · Próximamente/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*aria-label="WhatsApp no disponible: número pendiente de confirmación"[^>]*aria-describedby="whatsapp-float-status"/);
  assert.match(markup, /data-icon="whatsapp"/);
  assert.doesNotMatch(markup, /wa\.me|api\.whatsapp|href="whatsapp:|onclick=/i);
});

test('essence and footer retain the reference decorative details', () => {
  const markup = html();
  for (const asset of ['essence-gecko.webp', 'essence-agave.webp', 'essence-hat.webp']) {
    assert.ok(markup.includes(`/reference/${asset}`), `Missing decorative reference asset: ${asset}`);
  }
  assert.equal((markup.match(/data-ornament="mexican"/g) ?? []).length, 2);
});

test('continuous floating WhatsApp offers a separate accessible pause control', () => {
  const markup = html();
  assert.ok(markup.includes('class="motion-toggle"'), 'Missing animation pause control');
  assert.ok(markup.includes('aria-label="Pausar animación de WhatsApp"'));
  assert.ok(markup.includes('aria-pressed="false"'));
  assert.ok(markup.includes('data-motion="running"'));
});

test('top-left corner carries the reference palm leaves and side textile border', () => {
  const markup = html();
  assert.match(markup, /class="corner-leaves"[^>]*aria-hidden="true"/);
  assert.match(markup, /class="hero-side-textile"[^>]*aria-hidden="true"/);
});

test('demo metadata continues to prevent indexing', () => {
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(metadata.title, 'La Lupe | Cocina mexicana · Demostración');
  assert.equal(metadata.openGraph && typeof metadata.openGraph === 'object' && metadata.openGraph.locale, 'es_CO');
});
