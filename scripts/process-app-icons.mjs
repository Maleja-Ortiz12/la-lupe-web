// Usage: node scripts/process-app-icons.mjs
// Builds the browser-tab and home-screen icons from the owner's original logo (public/brand/la-lupe.png)
// without redrawing it: transparent margins are trimmed and the oval is centered on a square canvas.
// Next.js picks the files up from src/app/ (favicon.ico, icon.png, apple-icon.png) and writes the <link> tags.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = fileURLToPath(new URL('../public/brand/la-lupe.png', import.meta.url));
const app = new URL('../src/app/', import.meta.url);
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const cream = { r: 0xff, g: 0xf1, b: 0xd1, alpha: 1 };

const logo = await sharp(source).trim().png().toBuffer();
// Large icons use a color palette to stay light; the tiny favicon sizes keep full color so they stay crisp.
const square = (size, padding = 0) => sharp(logo)
  .resize(size - 2 * padding, size - 2 * padding, { fit: 'contain', background: transparent })
  .extend({ top: padding, bottom: padding, left: padding, right: padding, background: transparent })
  .png(size >= 128 ? { compressionLevel: 9, palette: true, quality: 90, effort: 10 } : { compressionLevel: 9 })
  .toBuffer();

// Modern browsers: one large icon, downscaled by the browser.
writeFileSync(fileURLToPath(new URL('icon.png', app)), await square(512));

// iOS fills transparency with black, so the home-screen icon sits on the cream brand color.
writeFileSync(fileURLToPath(new URL('apple-icon.png', app)), await sharp(await square(180, 12)).flatten({ background: cream }).png().toBuffer());

// favicon.ico requested by browsers on their own: an ICO container with embedded PNG images.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => square(size)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[index].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
});
writeFileSync(fileURLToPath(new URL('favicon.ico', app)), Buffer.concat([header, ...images]));
console.log(`icon.png 512px, apple-icon.png 180px, favicon.ico ${sizes.join('/')}px (${offset} bytes)`);
