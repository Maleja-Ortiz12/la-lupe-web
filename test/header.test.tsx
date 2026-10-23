import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SiteFooter, SiteHeader } from '../src/features/presentation/components/site-chrome';

test('reference header keeps four navigation links and a menu-entry action on every route', () => {
  for (const page of ['home', 'menu', 'essence', 'visit'] as const) {
    const html = renderToStaticMarkup(<SiteHeader page={page} />);
    const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
    const nav = header.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? '';
    assert.equal((nav.match(/<a\b/g) ?? []).length, 4);
    assert.equal((nav.match(/aria-current="page"/g) ?? []).length, 1);
    assert.match(header, /Hacer pedido/);
    assert.ok(header.includes(`href="${page === 'menu' ? '#platos-estrella' : '/menu'}"`));
    assert.doesNotMatch(header, /wa\.me|checkout|<form\b/);
    assert.match(header, /Logotipo original de La Lupe/);
  }
});

test('phone header exposes an accessible hamburger toggle controlling the main navigation', () => {
  for (const page of ['home', 'menu', 'essence', 'visit'] as const) {
    const header = renderToStaticMarkup(<SiteHeader page={page} />).match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
    const toggle = header.match(/<button\b[^>]*class="nav-toggle"[^>]*>/)?.[0] ?? '';
    assert.ok(toggle, `${page}: hamburger button`);
    assert.match(toggle, /aria-controls="site-nav"/);
    assert.match(toggle, /aria-expanded="false"/);
    assert.match(toggle, /aria-label="Abrir menú de navegación"/);
    assert.match(header, /<nav\b[^>]*id="site-nav"[^>]*data-open="false"/);
  }
});

test('header uses the supplied leaves as a lightweight transparent decoration', async () => {
  const html = renderToStaticMarkup(<SiteHeader />);
  assert.match(html, /<img\b(?=[^>]*class="corner-leaves")(?=[^>]*aria-hidden="true")[^>]*>/);
  assert.ok(html.includes('/brand/corner-leaves.webp'));
  assert.doesNotMatch(html, /<svg class="corner-leaves"/);
  const { statSync } = await import('node:fs');
  const sharp = (await import('sharp')).default;
  const metadata = await sharp('public/brand/corner-leaves.webp').metadata();
  assert.equal(metadata.hasAlpha, true);
  assert.ok((metadata.width ?? Infinity) <= 320);
  assert.ok(statSync('public/brand/corner-leaves.webp').size < 45000, 'decoration should remain below 45 KB');
});

test('header wooden frame is a tiny vector asset without raster images or filter effects', async () => {
  const { readFileSync, statSync } = await import('node:fs');
  const path = 'public/brand/header-wood.svg';
  const svg = readFileSync(path, 'utf8');
  assert.match(svg, /<svg\b/);
  assert.match(svg, /<path\b/);
  assert.doesNotMatch(svg, /<image\b|<filter\b|<script\b|<foreignObject\b/);
  assert.ok(statSync(path).size < 3000, 'wood frame should remain below 3 KB');
});

test('only the header navigation marks the current page; the footer never does', () => {
  for (const page of ['home', 'menu', 'essence', 'visit'] as const) {
    const header = renderToStaticMarkup(<SiteHeader page={page} />);
    assert.equal((header.match(/aria-current="page"/g) ?? []).length, 1, page);
    assert.doesNotMatch(renderToStaticMarkup(<SiteFooter page={page} />), /aria-current/);
  }
});
