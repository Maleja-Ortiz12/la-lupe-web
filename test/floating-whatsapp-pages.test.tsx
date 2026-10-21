import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomePage } from '../src/features/presentation/components/home-page';
import { MenuPage } from '../src/features/menu/components/menu-page';
import { EssencePage } from '../src/features/essence/components/essence-page';
import { VisitPage } from '../src/features/visit/components/visit-page';
import { SiteFooter } from '../src/features/presentation/components/site-chrome';

for (const [name, Page] of [['home', HomePage], ['menu', MenuPage], ['essence', EssencePage], ['visit', VisitPage]] as const) {
  test(`${name} has exactly one disabled floating WhatsApp and its pause control without a number`, () => {
    const markup = renderToStaticMarkup(<Page />);
    assert.equal((markup.match(/class="whatsapp-float"/g) ?? []).length, 1);
    assert.equal((markup.match(/id="whatsapp-float-status"/g) ?? []).length, 1);
    assert.match(markup, /<button[^>]*class="whatsapp-float-button"[^>]*disabled=""/);
    assert.match(markup, /aria-label="Pausar animación de WhatsApp"/);
    assert.doesNotMatch(markup, /wa\.me/);
  });
}

test('shared footer supports a configured floating chat on every page', () => {
  const href = 'https://wa.me/573001234567?text=Hola';
  for (const page of ['home', 'menu', 'essence', 'visit'] as const) {
    const markup = renderToStaticMarkup(<SiteFooter page={page} whatsappHref={href} />);
    assert.equal((markup.match(/class="whatsapp-float"/g) ?? []).length, 1);
    assert.ok(markup.includes(`href="${href}"`));
    assert.match(markup, /class="whatsapp-float-button"[^>]*target="_blank" rel="noopener noreferrer"/);
    assert.doesNotMatch(markup, /disabled=""|Próximamente/);
  }
});
