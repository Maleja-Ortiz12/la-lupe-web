# Reference-only assets

These WebP crops come from the user-provided root file `WhatsApp Image 2026-10-15 at 6.08.12 PM.jpeg` (1122 × 1402). The user requested a faithful visual reconstruction with the same sections. The original image is unchanged.

| Asset | Source crop: left, top, width, height |
| --- | --- |
| hero.webp | 535, 110, 587, 283 |
| fajitas.webp | 42, 631, 339, 147 |
| taquiza.webp | 402, 631, 326, 147 |
| entradas.webp | 748, 631, 331, 147 |
| esencia.webp | 0, 953, 576, 231 |
| logo.webp | 107, 7, 106, 149; superseded, not used by the landing |
| paper.webp | 25, 518, 220, 90 |
| textile.webp | 720, 0, 320, 28 |
| wood.webp | 340, 968, 80, 60 |
| village.webp | 825, 1210, 270, 85 |

The live logo is no longer cropped from this reference: `public/brand/la-lupe.png` is an unchanged copy of the supplied root `Logo Final Lupe.png`. All three brand placements use that original. Next.js serves smaller optimized versions while preserving the original public asset. The decorative essence panel has its conceptual emblem covered with a wood-texture patch (`esencia-brandless.webp`); the supplied logo is placed separately as an HTML image. `paper-seamless.webp` and `wood-seamless.webp` mirror source texture tiles to eliminate hard repetition seams. `border.webp` uses the reference's textile separator (crop 2,486,1118,28).

Only photographic/conceptual and decorative portions are used. Headings, navigation, descriptions, buttons and contact information remain real HTML; the screenshot is not embedded as the page. The hero crop excludes the reference's assistant widget.

These are low-resolution demo references, NOT verified restaurant photographs, original brand files, verified menu items, or proof of publication rights. Replace them with approved original assets before production. No address, telephone, prices or operating hours were inferred from the source image.

Section heading font: Caveat Brush, downloaded from `google/fonts/ofl/caveatbrush`, served locally by Next.js. License is preserved at `src/app/fonts/OFL.txt` (SIL Open Font License 1.1). No runtime Google Fonts requests are required.

## Menu page (`/menu`)

Crops from the user-provided root file `menu.png` (1122 × 1402), the "Menú y pedido" design. The original image is unchanged.

| Asset | Source crop: left, top, width, height |
| --- | --- |
| menu-hero.webp | 575, 100, 547, 262; the reference's "Asistente para elegir" widget is covered with a soft-edged patch of the same photo (source 150,176 → 337,176, 200 × 80) |
| menu-entradas.webp | 38, 456, 230, 126 |
| menu-fajitas.webp | 32, 881, 209, 177 |
| menu-taquiza.webp | 34, 1120, 268, 135 |

Prices on `/menu` are copied from `menu.png` and shown as reference prices pending approval. The cart, order panel, steppers, add buttons and assistant from the reference were removed: orders go through WhatsApp. The WhatsApp number lives only in `src/shared/config/contact.ts`; while it is empty every WhatsApp control renders disabled with no destination. The reference footer's address was not copied.
