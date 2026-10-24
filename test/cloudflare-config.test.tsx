import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Workers deployment is configured in the repository without interactive migration', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['build:worker'], 'opennextjs-cloudflare build');
  assert.equal(pkg.scripts.deploy, 'opennextjs-cloudflare build && opennextjs-cloudflare deploy');
  assert.equal(pkg.scripts.preview, 'opennextjs-cloudflare build && opennextjs-cloudflare preview');
  assert.ok(pkg.dependencies['@opennextjs/cloudflare']);
  assert.ok(pkg.devDependencies.wrangler);
  const config = JSON.parse(read('wrangler.jsonc'));
  assert.equal(config.main, '.open-next/worker.js');
  assert.equal(config.assets.directory, '.open-next/assets');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.ok(config.compatibility_flags.includes('nodejs_compat'));
  assert.equal(config.services.find((service: { binding: string }) => service.binding === 'WORKER_SELF_REFERENCE').service, config.name);
  assert.equal(config.images.binding, 'IMAGES');
  assert.match(read('open-next.config.ts'), /static-assets-incremental-cache/);
  assert.match(read('next.config.ts'), /initOpenNextCloudflareForDev/);
  assert.match(read('public/_headers'), /\/_next\/static\/\*\s+Cache-Control: public,max-age=31536000,immutable/);
  for (const entry of ['.open-next/', '.wrangler/', '.dev.vars*']) {
    assert.ok(read('.gitignore').split(/\r?\n/).includes(entry));
  }
  assert.match(read('eslint.config.mjs'), /\.open-next\/\*\*/);
});

test('existing Node development, production and test commands stay available', () => {
  const { scripts } = JSON.parse(read('package.json'));
  assert.equal(scripts.dev, 'next dev');
  assert.equal(scripts.build, 'next build');
  assert.equal(scripts.start, 'next start');
  assert.equal(scripts.test, 'tsx --test test/*.test.tsx');
});
