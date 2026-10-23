import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

// Browser-tab and home-screen icons generated from the original logo by scripts/process-app-icons.mjs.

test('the browser tab icon is the La Lupe logo as a square transparent PNG', async () => {
  assert.ok(existsSync('src/app/icon.png'), 'src/app/icon.png');
  const icon = await sharp('src/app/icon.png').metadata();
  assert.equal(icon.format, 'png');
  assert.equal(icon.width, 512);
  assert.equal(icon.height, 512);
  assert.equal(icon.hasAlpha, true);
  // The logo is centered: its red oval reaches the top and bottom, the side margins stay transparent.
  const { data, info } = await sharp('src/app/icon.png').raw().toBuffer({ resolveWithObject: true });
  const alpha = (x: number, y: number) => data[(y * info.width + x) * info.channels + 3];
  assert.equal(alpha(0, 256), 0, 'transparent left margin');
  assert.equal(alpha(511, 256), 0, 'transparent right margin');
  assert.ok(alpha(256, 256) > 200, 'opaque logo center');
});

test('favicon.ico is a valid icon file with 16, 32 and 48 px images', () => {
  assert.ok(existsSync('src/app/favicon.ico'), 'src/app/favicon.ico');
  const ico = readFileSync('src/app/favicon.ico');
  assert.equal(ico.readUInt16LE(0), 0, 'reserved');
  assert.equal(ico.readUInt16LE(2), 1, 'type icon');
  const count = ico.readUInt16LE(4);
  const sizes = Array.from({ length: count }, (_, index) => ico[6 + index * 16] || 256);
  assert.deepEqual(sizes, [16, 32, 48]);
  for (let index = 0; index < count; index++) {
    const length = ico.readUInt32LE(6 + index * 16 + 8);
    const offset = ico.readUInt32LE(6 + index * 16 + 12);
    assert.ok(offset + length <= ico.length, 'image inside the file');
    assert.equal(ico.subarray(offset, offset + 8).toString('hex'), '89504e470d0a1a0a', 'embedded PNG');
  }
});

test('the home-screen icon is an opaque 180 px square on the cream brand background', async () => {
  assert.ok(existsSync('src/app/apple-icon.png'), 'src/app/apple-icon.png');
  const apple = await sharp('src/app/apple-icon.png').metadata();
  assert.equal(apple.width, 180);
  assert.equal(apple.height, 180);
  const { data, info } = await sharp('src/app/apple-icon.png').raw().toBuffer({ resolveWithObject: true });
  const pixel = (x: number, y: number) => Array.from(data.subarray((y * info.width + x) * info.channels, (y * info.width + x) * info.channels + 3));
  assert.deepEqual(pixel(2, 90), [0xff, 0xf1, 0xd1], 'cream corner instead of the black iOS fills behind transparency');
});
