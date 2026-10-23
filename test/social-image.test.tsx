import assert from 'node:assert/strict';
import test from 'node:test';
import Image, { alt, size, contentType } from '../src/app/opengraph-image';

test('social preview is a local 1200x630 PNG for La Lupe, without remote dependencies', async () => {
  assert.equal(contentType, 'image/png');
  assert.deepEqual(size, { width: 1200, height: 630 });
  assert.match(alt, /La Lupe.*Comida mexicana.*Chía/);
  assert.doesNotMatch(alt, /Demo/);
  const response = Image();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /image\/png/);
  const png = Buffer.from(await response.arrayBuffer());
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});
