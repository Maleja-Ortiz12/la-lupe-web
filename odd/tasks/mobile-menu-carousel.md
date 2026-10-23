# Mobile menu: hamburger header, category carousels, stacked home
Responsive-only redesign of La Lupe navigation and product browsing. Desktop layouts stay unchanged.
Owner constraint: no commits or push until explicitly authorized (overrides work-unit commits).

## Specs
- S1 Home stacking: "que los productos no queden de a dos si no que se vean uno debajo del otro alineadas para captar mejor las imagenes y la informacion". Decision (L2): apilado en el home — "Nuestras Especialidades" shows one card per row at phone widths (≤760px).
- S2 Hamburger: "en menu dejalo con este tipo d menu menú de hamburguesa (también conocido como menú hamburguesa o hamburger menu en inglés)". Decision (L2): "Header del sitio" — the site header navigation (Inicio, Menú, Nuestra esencia, Visítanos) collapses behind a ☰ button on phones (≤700px), with aria-expanded/aria-controls, Escape/link/outside click closing it. Tablet/desktop header unchanged.
- S3 Carousel: "y este para los platos del menu solo en responsive • Secciones en cuadrícula horizontal (Carrousel): Listados categorizados". Decision (L2): "Carrusel en /menu" — on phones (≤760px) each /menu category (and Platos estrella) is a horizontal swipeable list with scroll snap, one large card at a time with the next one peeking. Desktop boards/tables unchanged.
- S4 Card content: "• Tarjetas de producto completas: Cada ítem muestra una imagen clara del platillo, su nombre, el precio en CUP y un botón directo (+) para añadir al carrito". Price stays COP (CUP was a template slip; site prices are COP). Photo complete, natural ratio; beverages keep no image. Single-price items: + adds one unit directly with the existing success feedback.
- S5 Description: "y que tenga un slider para er la descripcion". Decision (L2): "Texto corto + 'Ver más'" — description clamped to 2 lines, a Ver más / Ver menos toggle (aria-expanded) expands it inside the card.
- S6 Options: Decision (L2): "Abre selector de opciones" — items with variations show "Desde $X"; + opens a bottom-sheet dialog to choose sabor/proteína and porción/tamaño, quantity, and add; Escape/close returns focus.
- S7 Preserve: cart dialog, WhatsApp ordering, prices, accessible names, 44px targets; /menu#plato-<id> links from home still reach the dish on phones.

## Tasks
- [x] T1 S2 — hamburger header (inline) — no commit (owner constraint). Evidence: test/header.test.tsx RED→GREEN; browser 375/742/1440.
- [x] T2 S3-S7 — mobile carousel cards, Ver más, options sheet (inline) — no commit. Evidence: test/menu-mobile.test.tsx RED 0/4→GREEN; browser 375/742 + 1122 desktop intact.
- [x] T3 S1 — stacked home specialties (inline) — no commit. Evidence: browser RED (742: 4 rows/7) → GREEN.
- [x] T4 S1-S7 — regression + independent verify — no commit. Regression green (79 tests incl. verifier probes, lint 0 errors / 2 pre-existing warnings, types, cart 1440/1122, layout 4 widths, test:mobile). gentle-ai-verify mvl55dg1-3-gzgp: PASS S1-S7, no blockers.

## Log
- L1 (user, verbatim): "arreglemos el responsive, que los productos no queden de a  dos si no que se vean uno debajo del otro alineadas para captar mejor las imagenes y la informacion y en menu dejalo con este tipo d menu menú de hamburguesa (también conocido como menú hamburguesa o hamburger menu en inglés). y este para los platos del menu solo en responsive • Secciones en cuadrícula horizontal (Carrousel): Listados categorizados
• Tarjetas de producto completas: Cada ítem muestra una imagen clara del platillo, su nombre, el precio en CUP y un botón directo (+) para añadir al carrito y que tenga un slider para er la descripcion"
- L2 (user decisions via questionnaire): 1 "Carrusel en /menu, apilado en el home (Recomendado)"; 2 "Header del sitio (Recomendado)"; 3 "Texto corto + 'Ver más' (Recomendado)"; 4 "Abre selector de opciones (Recomendado)".
- L4 (parent): browser findings fixed during T2 — Ver más now measured (only when the clamp really hides text, re-measured after web fonts load); options sheet reopen race after Escape fixed with an open counter. Phone coverage moved from check-cart (now 1440/1122) to new scripts/check-mobile-menu.mjs (`npm run test:mobile`).
- L5 (verifier advisories, not fixed, for owner): "Desde" also shown for fixed-price dishes with only a flavor choice (Tacos, Burritos, aguas…, same as desktop star cards); beverage cards at 742 stretch to row height; hamburger label toggles with aria-expanded; tabbing out does not close the menu; dev overlay "1 Issue" seen (also seen before this feature, cause unknown); nav-link click close not browser-tested.
- L3 (parent): breakpoints chosen — products ≤760px, hamburger ≤700px (keeps the approved tablet header with Hacer pedido at ≥701px).

- L6 (delivery evidence): owner explicitly authorized local commits with "haz los commits". Branch `feat/restaurant-menu-responsive`: `be8c454` contains the real image sources/optimized assets and processing scripts; `d12c4a2` contains the complete restaurant implementation together with its tests and runtime documentation. Latest centering/button adjustment supersedes earlier left-alignment notes. Final checks: 93/93 tests, production build exit0, prior cart/browser and independent verification PASS. No push or production deployment performed; unrelated root commercial/reference documents remain untracked.
