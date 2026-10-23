# Menu web redesign from the "Menú La Lupe con pedido cerrado" template
Desktop/tablet (>=761px) /menu layout inspired by the owner's template; phones, cart and card colors/information unchanged.
Commits only when the owner asks.

## Specs
- S1 Scope: "sin cambiar la version movil vamos a modificar el diseño del menu en la web para que se vea mejor, deja el diseño del carrito taal como esta, igual las cards solo mejora el diseño sin cambiar colores ni informacion basate en la plantilla de la carpeta raiz con este nombre Menú La Lupe con pedido cerrado". Phones (<=760px, carousels) stay identical; the cart (floating button + dialog) stays identical; cards keep their colors and every piece of information (photo, name, description, price, notes, star badge, variation chips, add controls).
- S2 Categories sidebar (template): on >=761px a sticky left "Categorías" panel with one icon + label per section (Estrella, Entradas, Sopas, Fajitas, Tacos y Taquiza, Carnes, Mero México, Bebidas, Cócteles & Chelas, Postres); the section currently in view is highlighted in red with a chevron; links jump to the section. Replaces the top pill navigation on >=761px only (phones keep the pills).
- S3 Horizontal cards (template): photo on the left, name/description/price/controls on the right, two cards per row from 1100px, one per row between 761-1099px; complete photos (no cropping), drinks without photo stay text-only.
- S4 Section titles (template): large red title, leaf flourish after it and a thin red line extending to the right edge.
- S5 Decisions (L2): keep the "− 1 + Agregar" controls on simple dishes; Platos estrella use the same horizontal card design without losing description, price or add button; no talavera tile bands.
- S6 Preserve: prices, options dialog, cart behaviour, WhatsApp ordering, accessibility (labels, 44px targets, keyboard), header/footer.

## Tasks
- [x] T1 S2 — categories sidebar with icons and scroll-spy — unit RED 1/2 → GREEN 3/3; browser RED (no sidebar) → GREEN 1440/1122/800, 375 unchanged.
- [x] T2 S3/S5 — horizontal cards (2/row from 1100, 1/row 761-1099), Platos estrella included, old #sopas max-width overridden — browser GREEN, screenshots read.
- [x] T3 S4 — red titles with leaf and rule — browser GREEN.
- [x] T4 S1-S6 — job-81: 99/99 tests, lint 0 errors (2 pre-existing warnings), types, build, check-cart (incl. new desktop layout block), test:mobile, check-layout all PASS. Independent verifier mvlgh1f8-9-3q9x: PASS S1-S6, no blockers. Not committed (owner has not asked).

## Log
- L1 (user, verbatim): "sin cambiar la version movil vamos a modificar el diseño del menu en la web para que se vea mejor, deja el diseño del carrito taal como esta, igual las cards solo mejora el diseño sin cambiar colores ni informacion basate en la plantilla de la carpeta raiz con este nombre Menú La Lupe con pedido cerrado"
- L2 (user decisions): "Mantener “− 1 + Agregar” (Recomendado)"; "Mismo diseño horizontal que el resto (Recomendado)"; "No, sin franjas".
- L3 (template reading): `Menú La Lupe con pedido cerrado.png` shows hero "Menú y pedido", a row of star cards, a left "Categorías" sidebar with icons (active item red pill with chevron), sections with large red titles + leaf + red rule, two-column dish rows with photo left and round red "+" (not adopted, L2), "Elegir opciones" button for option dishes, talavera tile bands (not adopted, L2). Template header/cart button not adopted (cart stays as is).
- L4 (verifier advisories, not fixed): the fixed cart button overlaps the top-right corner of titles/cards at 1122/800 while scrolling (not measured at baseline); scroll-spy untested on viewports taller than 900px and the sidebar does not auto-scroll its active item on viewports under ~570px tall; the browser script's eager-image step triggers a dev-only hydration warning ("1 Issue" badge), not a product defect.
