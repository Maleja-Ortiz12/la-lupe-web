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
  assert.equal((markup.match(/href="\/menu"/g) ?? []).length, 5);
  assert.match(markup, /<header/);
  assert.match(markup, /<main id="contenido"/);
  assert.match(markup, /<footer/);
  assert.match(markup, /href="#contenido"/);
});

test('home keeps the WhatsApp-only scope and never invents payments or order flows', () => {
  const markup = html('');
  assert.doesNotMatch(markup, /Demostración visual|Imágenes de referencia/);
  assert.doesNotMatch(markup, /wa\.me|checkout|mailto:|Asistente/);
  assert.match(markup, /WhatsApp no disponible/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*aria-describedby="contact-status"/);
  assert.doesNotMatch(markup, /<input|<form/);
});

test('landing follows the supplied reference sections and uses local reference assets', () => {
  const markup = html();
  for (const label of ['Sabor Mexicano', 'en Cada Encuentro', 'Nuestras Especialidades', 'Nuestra Esencia', 'Visítanos']) {
    assert.ok(markup.includes(label), label);
  }
  assert.doesNotMatch(markup, /viewBox="0 0 600 460"|El sabor nos|Para abrir/);
  for (const asset of ['hero.webp', 'esencia-brandless.webp']) {
    assert.ok(markup.includes(`/reference/${asset}`), asset);
  }
});

test('all brand placements use the supplied original logo without tinting or the concept logo', () => {
  const markup = decodeURIComponent(html());
  // Three original brand placements plus three requested missing-photo placeholders.
  assert.equal((markup.match(/<img\b[^>]*\bsrc="[^"]*\/brand\/la-lupe\.png[^"]*"/g) ?? []).length, 6);
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
  const markup = html('');
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

test('floating WhatsApp has no pause control while preserving the contact link and carousel pause', () => {
  const markup = html();
  assert.doesNotMatch(markup, /class="motion-toggle"|Pausar animación de WhatsApp|Reanudar animación de WhatsApp/);
  assert.match(markup, /aria-label="Escríbenos por WhatsApp"/);
  assert.match(markup, /https:\/\/wa\.me\/573116341836/);
  assert.match(markup, /class="carousel-pause"/);
});

test('top-left corner carries the supplied leaves and reference side textile border', () => {
  const markup = html();
  assert.match(markup, /<img\b(?=[^>]*class="corner-leaves")(?=[^>]*aria-hidden="true")[^>]*>/);
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

test('home metadata keeps noindex until the real domain exists', () => {
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(metadata.title, 'Comida mexicana en Chía | La Lupe');
  assert.equal(metadata.openGraph && typeof metadata.openGraph === 'object' && metadata.openGraph.locale, 'es_CO');
});

test('home specialties point to the real carta instead of a pending-approval notice', () => {
  const markup = renderToStaticMarkup(<HomePage whatsappNumber="" />);
  assert.doesNotMatch(markup, /Carta pendiente de aprobación|sin precios ni disponibilidad confirmados/);
  assert.match(markup, /class="section-note">Mira la carta completa con precios en el <a href="\/menu">menú<\/a>\.<\/p>/);
});

test('home Nuestras Especialidades shows the star dishes with price and a link to each one in the menu', () => {
  const markup = html('');
  const section = markup.match(/<section id="carta"[\s\S]*?<\/section>/)?.[0] ?? '';
  const cards = section.match(/<article class="specialty-card[^"]*"[\s\S]*?<\/article>/g) ?? [];
  const expected = [
    ['Taquiza', 'taquiza', 'Desde $79.900'],
    ['Carne a la tampiqueña', 'carne-a-la-tampiquena', '$42.900'],
    ['Nachos grandes', 'nachos-grandes', '$38.900'],
    ['Combo &quot;mero mero&quot;', 'combo-mero-mero', '$42.900'],
    ['Flautas', 'flautas', '$35.900'],
    ['Fajitas Quesadillas', 'fajitas-quesadillas', '$35.900'],
    ['Tacos', 'tacos', '$40.900'],
  ];
  assert.equal(cards.length, expected.length);
  for (const [index, [name, id, price]] of expected.entries()) {
    assert.match(cards[index], new RegExp(`<h3 class="brush brush-(red|green|yellow)">${name}`), name);
    assert.ok(cards[index].includes(price), `${name} ${price}`);
    assert.ok(cards[index].includes(`href="/menu#plato-${id}"`), `${name} link`);
    assert.match(cards[index], /Plato estrella/);
  }
  for (const slug of ['taquiza', 'flautas', 'quesadillas', 'tacos-de-pastor']) assert.ok(section.includes(`%2Fdishes%2F${slug}.webp`) || section.includes(`/dishes/${slug}.webp`), slug);
  assert.doesNotMatch(section, /imagen conceptual de referencia|Ingredientes y presentación por confirmar/);
});

test('every star dish has a menu anchor for the home links', async () => {
  const { MenuPage } = await import('../src/features/menu/components/menu-page');
  const menu = renderToStaticMarkup(<MenuPage whatsappNumber="" />);
  for (const id of ['taquiza', 'carne-a-la-tampiquena', 'nachos-grandes', 'combo-mero-mero', 'flautas', 'fajitas-quesadillas', 'tacos']) {
    assert.equal((menu.match(new RegExp(`id="plato-${id}"`, 'g')) ?? []).length, 1, id);
  }
});

test('specialties are wrapped in a phone carousel with a visible pause control for the 7-second autoplay', () => {
  const markup = renderToStaticMarkup(<HomePage />);
  const carousel = markup.match(/<div class="specialty-carousel"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(carousel, /<div class="specialty-grid"[^>]*aria-label="Nuestras Especialidades: desliza para ver más"/);
  assert.equal((carousel.match(/<article class="specialty-card/g) ?? []).length, 7);
  const pause = carousel.match(/<button\b[^>]*class="carousel-pause"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';
  // The accessible name is the visible text plus a hidden suffix (WCAG 2.5.3), never a different aria-label.
  assert.doesNotMatch(pause, /aria-label=/);
  assert.match(pause.replace(/<[^>]+>/g, ''), /^Pausar avance automático de especialidades$/);
});
