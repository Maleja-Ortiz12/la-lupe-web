// Usage: node scripts/process-header-leaves.mjs
// Generates the header decoration from the owner's original without tinting, cropping or flattening alpha.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../images/hojas imagen.png', import.meta.url));
const target = fileURLToPath(new URL('../public/brand/corner-leaves.webp', import.meta.url));
const result = await sharp(source).rotate().resize({ width: 288, withoutEnlargement: true })
  .webp({ quality: 80, alphaQuality: 85 }).toFile(target);
console.log(`corner-leaves.webp: ${result.width} × ${result.height}, ${result.size} bytes`);
