import assert from 'node:assert/strict';
import test from 'node:test';
import { whatsappUrl } from '../src/shared/config/contact';

test('whatsappUrl keeps only digits and encodes the prefilled message', () => {
  assert.equal(whatsappUrl('+57 (300) 123-4567', 'Hola, ¿hay mesa?'), 'https://wa.me/573001234567?text=Hola%2C%20%C2%BFhay%20mesa%3F');
});

test('whatsappUrl returns null when no number is configured', () => {
  assert.equal(whatsappUrl('', 'Hola'), null);
  assert.equal(whatsappUrl('  ', 'Hola'), null);
});

test('contact config holds the supplied phones, the WhatsApp order number and the delivery area', async () => {
  const { contact, telUrl } = await import('../src/shared/config/contact');
  assert.equal(contact.whatsappNumber, '+57 311 634 1836');
  assert.deepEqual(contact.phones, ['311 634 1836', '310 257 2692', '300 457 7875']);
  assert.equal(contact.delivery, 'Domicilios a Cota y Chía');
  assert.equal(telUrl('311 634 1836'), 'tel:+573116341836');
});

const phoneLinks = ['tel:+573116341836', 'tel:+573102572692', 'tel:+573004577875'];

test('home, visit page and footer show the three phones as call links and the delivery area', async () => {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { HomePage } = await import('../src/features/presentation/components/home-page');
  const { VisitPage } = await import('../src/features/visit/components/visit-page');
  for (const [page, markup] of [['home', renderToStaticMarkup(<HomePage />)], ['visit', renderToStaticMarkup(<VisitPage />)]] as const) {
    const main = markup.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    const footer = markup.match(/<footer[\s\S]*<\/footer>/)?.[0] ?? '';
    for (const [index, href] of phoneLinks.entries()) {
      assert.ok(main.includes(`href="${href}"`), `${page} main ${href}`);
      assert.ok(footer.includes(`href="${href}"`), `${page} footer ${href}`);
      assert.ok(main.includes(['311 634 1836', '310 257 2692', '300 457 7875'][index]), `${page} label ${href}`);
    }
    assert.ok(main.includes('Domicilios a Cota y Chía'), `${page} delivery`);
    assert.ok(footer.includes('Domicilios a Cota y Chía'), `${page} footer delivery`);
    assert.doesNotMatch(markup, /Datos de contacto pendientes|número pendiente de confirmación|WhatsApp · Próximamente/);
    assert.ok(markup.includes('https://wa.me/573116341836?text='), `${page} WhatsApp`);
  }
});
