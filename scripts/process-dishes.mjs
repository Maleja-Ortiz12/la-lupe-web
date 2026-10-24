// Retouches the supplied dish photos in `images/` (phone photos) and `images/menu-pdf/` (photos extracted
// from `images/Menu Lupe 2025 Vertical.pdf`) into consistent menu assets in `public/dishes/`.
// Only photographic corrections (crop, exposure, color transfer to the reference palette, sharpening, vignette);
// no generative edits, so every plate keeps its real appearance.
// Usage: node scripts/process-dishes.mjs [slug ...]   (no slug = every photo; slugs = only those).
import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Source file -> output slug. The two dessert files are swapped on purpose: `Buñuelos mexicanos.jpeg`
// shows a fried ice-cream ball and `Helado frito.jpeg` shows fried tortillas with cream.
// `brightness` lifts the darker phone shots so the set reads evenly; `position` overrides the automatic crop.
const dishes = [
  { file: 'Guacamole con chicharrón.jpeg', slug: 'guacamole-con-chicharron', brightness: 1.1 },
  { file: 'Quesadillas.jpeg', slug: 'quesadillas', brightness: 1.05 },
  { file: 'Sopa de tortillas.jpeg', slug: 'sopa-de-tortillas', brightness: 1.04 },
  { file: 'Enchiladas verdes, rojas y mole (2).jpeg', slug: 'enchiladas-verdes', brightness: 1 },
  { file: 'Enchiladas verdes, rojas y mole.jpeg', slug: 'enchiladas-rojas', brightness: 1.02 },
  { file: 'Enchiladas verdes, rojas y mole (3).jpeg', slug: 'enchiladas-de-mole', brightness: 1.02 },
  { file: 'Tacos de carnitas.jpeg', slug: 'tacos-de-carnitas', brightness: 1.04 },
  { file: 'Tacos de pastor.jpeg', slug: 'tacos-de-pastor', brightness: 1 },
  { file: 'Tamales mexicanos.jpeg', slug: 'tamales-mexicanos', brightness: 1.05 },
  { file: 'Steak Lupe.jpeg', slug: 'steak-lupe', brightness: 1.02 },
  { file: 'Hoy pepper steak.jpeg', slug: 'hot-pepper-steak', brightness: 1.1 },
  { file: 'Helado frito.jpeg', slug: 'bunuelos-mexicanos', brightness: 1.05, position: 'south' },
  { file: 'Buñuelos mexicanos.jpeg', slug: 'helado-frito', brightness: 1.08 },
  { file: 'menu-pdf/flautas.png', slug: 'flautas', brightness: 1, position: 'south' },
  { file: 'menu-pdf/chelas.png', slug: 'chelas', brightness: 1 },
  // Owner's real photos (odd/tasks/new-photos-catering.md). Pozole, Fajitas Famosas, Taquiza and Churros
  // replace the earlier crops from the PDF carta; the PDF sources stay in images/menu-pdf/.
  { file: 'Pozole.jpeg', slug: 'pozole', brightness: 1.02 },
  { file: 'fagitas Famosas.jpeg', slug: 'fajitas', brightness: 1.03 },
  // The foreground salsa bowls are out of focus in the original; frame the sharp beers and meat plate instead.
  { file: 'taquiza.jpeg', slug: 'taquiza', brightness: 1.02, position: 'north', cacheFile: 'taquiza-e4ea759b' },
  { file: 'Churros.jpeg', slug: 'churros', brightness: 1.02 },
  { file: 'Burritos.jpeg', slug: 'burritos', brightness: 1.03 },
  { file: 'Carne a la Tampiqueña.jpeg', slug: 'carne-a-la-tampiquena', brightness: 1.02 },
  { file: 'Combo mero mero.jpeg', slug: 'combo-mero-mero', brightness: 1.03 },
  { file: 'Esquite.jpeg', slug: 'esquite', brightness: 1.02 },
  { file: 'Nachos grandes.jpeg', slug: 'nachos-grandes', brightness: 1.02 },
  { file: 'entrada Mixta.jpeg', slug: 'entrada-mixta', brightness: 1.03 },
  { file: 'tacos de birria.jpeg', slug: 'tacos-de-birria', brightness: 1.02 },
  { file: 'tinga de pollo.jpeg', slug: 'tinga-de-pollo', brightness: 1.02 },
  // "Fiestas en casa" catering: portrait 3:4 frames in public/catering/.
  { file: 'Fiestas en casa caterig1.jpeg', slug: 'fiestas-en-casa-1', brightness: 1.06, dir: 'catering', width: 720, height: 960 },
  { file: 'Fiestas en casa caterig2.jpeg', slug: 'fiestas-en-casa-2', brightness: 1.06, dir: 'catering', width: 720, height: 960 },
  { file: 'Fiestas en casa caterig3.jpeg', slug: 'fiestas-en-casa-3', brightness: 1.06, dir: 'catering', width: 720, height: 960 },
];

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const only = process.argv.slice(2);
const unknown = only.filter(slug => !dishes.some(dish => dish.slug === slug));
if (unknown.length) throw new Error(`Unknown slug(s): ${unknown.join(', ')}`);
const selected = only.length ? dishes.filter(dish => only.includes(dish.slug)) : dishes;

// Color transfer (Reinhard, in CIE Lab): each photo's mean and spread per channel are pulled toward
// the palette of the menu reference art, so the whole set shares one warm tonality while keeping
// its real background. `strength` < 1 keeps whites and food colors believable.
const strength = 0.65;
const references = ['menu-hero', 'menu-entradas', 'menu-fajitas', 'menu-taquiza'];

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const fInv = (t) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
const [Xn, Yn, Zn] = [0.95047, 1, 1.08883];

function rgbToLab(pixels) {
  const lab = new Float32Array(pixels.length);
  for (let i = 0; i < pixels.length; i += 3) {
    const r = toLinear(pixels[i] / 255), g = toLinear(pixels[i + 1] / 255), b = toLinear(pixels[i + 2] / 255);
    const fx = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / Xn);
    const fy = f((0.2126 * r + 0.7152 * g + 0.0722 * b) / Yn);
    const fz = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / Zn);
    lab[i] = 116 * fy - 16; lab[i + 1] = 500 * (fx - fy); lab[i + 2] = 200 * (fy - fz);
  }
  return lab;
}

function labToRgb(lab) {
  const pixels = Buffer.alloc(lab.length);
  for (let i = 0; i < lab.length; i += 3) {
    const fy = (lab[i] + 16) / 116, fx = fy + lab[i + 1] / 500, fz = fy - lab[i + 2] / 200;
    const x = fInv(fx) * Xn, y = fInv(fy) * Yn, z = fInv(fz) * Zn;
    const rgb = [3.2406 * x - 1.5372 * y - 0.4986 * z, -0.9689 * x + 1.8758 * y + 0.0415 * z, 0.0557 * x - 0.204 * y + 1.057 * z];
    for (let c = 0; c < 3; c++) pixels[i + c] = Math.round(Math.min(1, Math.max(0, toGamma(Math.max(0, rgb[c])))) * 255);
  }
  return pixels;
}

function labStats(...labs) {
  const mean = [0, 0, 0], sq = [0, 0, 0];
  let n = 0;
  for (const lab of labs) {
    n += lab.length / 3;
    for (let i = 0; i < lab.length; i += 3) for (let c = 0; c < 3; c++) { mean[c] += lab[i + c]; sq[c] += lab[i + c] ** 2; }
  }
  return mean.map((m, c) => ({ mean: m / n, std: Math.sqrt(Math.max(1e-6, sq[c] / n - (m / n) ** 2)) }));
}

const rawRgb = async (image) => (await image.removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true })).data;

const referenceLab = [];
for (const name of references) {
  const pixels = await rawRgb(sharp(fileURLToPath(new URL(`../public/reference/${name}.webp`, import.meta.url))));
  referenceLab.push(rgbToLab(pixels));
}
const target = labStats(...referenceLab);

const vignette = (width, height) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><radialGradient id="v" cx="50%" cy="50%" r="72%">
    <stop offset="55%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#1a0d04" stop-opacity="0.4"/>
  </radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);

for (const dish of selected) {
  const { width = 960, height = 720, dir = 'dishes' } = dish;
  mkdirSync(`${publicDir}${dir}`, { recursive: true });
  const pixels = await rawRgb(sharp(fileURLToPath(new URL(`../images/${dish.file}`, import.meta.url)))
    .rotate()
    .flatten({ background: '#ffffff' })
    .resize(width, height, { fit: 'cover', position: dish.position ?? sharp.strategy.attention })
    .normalise({ lower: 1, upper: 99.5 })
    .modulate({ brightness: dish.brightness }));
  const lab = rgbToLab(pixels);
  const source = labStats(lab);
  for (let i = 0; i < lab.length; i += 3) {
    for (let c = 0; c < 3; c++) {
      // Spread ratio is clamped so flat or very busy photos are not over-stretched.
      const ratio = Math.min(1.35, Math.max(0.75, target[c].std / source[c].std));
      const matched = (lab[i + c] - source[c].mean) * ratio + target[c].mean;
      lab[i + c] += (matched - lab[i + c]) * strength;
    }
  }
  await sharp(labToRgb(lab), { raw: { width, height, channels: 3 } })
    .sharpen({ sigma: 0.8, m1: 0.7, m2: 1.4 })
    .composite([{ input: vignette(width, height), blend: 'multiply' }])
    .webp({ quality: 82 })
    .toFile(`${publicDir}${dir}/${dish.slug}.webp`);
  // Keep the original URL available, but use a fresh URL in the app to bypass older optimized copies.
  if (dish.cacheFile) copyFileSync(`${publicDir}${dir}/${dish.slug}.webp`, `${publicDir}${dir}/${dish.cacheFile}.webp`);
  console.log(`${dir}/${dish.slug}.webp`);
}
