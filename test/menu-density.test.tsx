import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPage } from '../src/features/menu/components/menu-page';

const markup = () => renderToStaticMarkup(<MenuPage />);
const desktopCards = () => markup().match(/<article class="dish-card[^\"]*"[\s\S]*?<\/article>/g) ?? [];

test('menu omits the introductory price and delivery notice without leaving an empty paragraph', () => {
  assert.doesNotMatch(markup(), /Precios de nuestra carta 2025 en COP|id="menu-status"/);
});

test('option products keep one accessible Agregar button opening their shared dialog', () => {
  const cards = desktopCards().filter(card => card.includes('class="card-variations"'));
  assert.ok(cards.length > 10);
  for (const card of cards) {
    const button = card.match(/<button\b[^>]*class="cart-add dish-options"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';
    assert.match(button, /aria-label="Elegir opciones de [^"]+"/);
    assert.match(button, /aria-haspopup="dialog" aria-controls="opciones-producto"/);
    assert.match(button, />Agregar<\/button>/);
  }
});

test('option dishes share the ordinary card photo and description structure, not small table summaries', () => {
  const cards = desktopCards().filter(card => card.includes('class="card-variations"') && card.includes('<img'));
  assert.ok(cards.length > 5);
  for (const card of cards) {
    assert.match(card, /class="dish-photo(?: dish-logo)?"/);
    assert.match(card, /class="dish-copy"/);
    assert.doesNotMatch(card, /menu-board-summary|<table\b/);
  }
});

test('single products keep visible Agregar and their accessible quantity controls', () => {
  const cards = desktopCards().filter(card => !card.includes('class="card-variations"'));
  assert.ok(cards.length > 10);
  for (const card of cards) {
    assert.match(card, /class="cart-add"[\s\S]*?>Agregar<\/button>/);
    assert.match(card, /aria-label="Aumentar cantidad de /);
    assert.doesNotMatch(card, /dish-options/);
  }
});
