import assert from 'node:assert/strict';
import test from 'node:test';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';

test('robots.txt allows every crawler and points to the production sitemap', () => {
  assert.deepEqual(robots(), {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://lalupe.co/sitemap.xml',
  });
});

test('sitemap.xml lists the four public pages on the production domain', () => {
  assert.deepEqual(sitemap().map(entry => entry.url), [
    'https://lalupe.co/',
    'https://lalupe.co/menu',
    'https://lalupe.co/nuestra-esencia',
    'https://lalupe.co/visitanos',
  ]);
});
