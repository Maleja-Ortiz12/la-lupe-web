import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomePage } from '../src/features/presentation/components/home-page';
import { metadata } from '../src/app/page-metadata';

const html = (whatsappNumber?: string) => renderToStaticMarkup(<HomePage whatsappNumber={whatsappNumber} />);

test('landing exposes the basic sections and working internal navigation', () => {
  const markup = html();
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1);
  for (const id of ['inicio']) {
    assert.match(markup, new RegExp(`id="${id}"`));
    assert.match(markup, new RegExp(`href="#${id}"`));
  }
  assert.match(markup, /id="carta"/);
  assert.match(markup, /id="contacto"/);
  assert.match(markup, /href="\/visitanos"/);
  assert.match(markup, /<a href="#inicio" aria-current="page">Inicio<\/a>/);
  assert.equal((markup.match(/href="\/menu"/g) ?? []).length, 3);
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

test('landing describes authentic Mexican food instead of Tex-Mex', () => {
  const markup = html();
  assert.doesNotMatch(markup, /tex-?mex/i);
  assert.match(markup, /auténtica comida mexicana/);
  assert.match(markup, /Pedidos por WhatsApp · Sin pagos en línea/);
});

test('with a configured number the contact and floating WhatsApp controls open a prefilled chat', () => {
  const markup = html('+57 300 123 4567');
  const contactLink = 'https://wa.me/573001234567?text=Hola%20La%20Lupe%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n.';
  assert.equal(markup.split(`href="${contactLink}"`).length - 1, 2);
  assert.match(markup, /<a[^>]*class="whatsapp-float-button"[^>]*target="_blank" rel="noopener noreferrer"[^>]*aria-label="Escríbenos por WhatsApp"/);
  assert.match(markup, /<a[^>]*target="_blank" rel="noopener noreferrer"[^>]*>.*Escríbenos por WhatsApp<\/a>/);
  assert.doesNotMatch(markup, /WhatsApp no disponible|Próximamente|disabled=""/);
});

test('home keeps a short essence preview linking to the dedicated story page', () => {
  const markup = html();
  assert.match(markup, /href="\/nuestra-esencia"[^>]*>Conoce nuestra historia/);
  assert.doesNotMatch(markup, /class="essence-story-card"/);
});

test('demo metadata continues to prevent indexing', () => {
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(metadata.title, 'Comida mexicana en Chía | La Lupe · Demo');
  assert.equal(metadata.openGraph && typeof metadata.openGraph === 'object' && metadata.openGraph.locale, 'es_CO');
});
