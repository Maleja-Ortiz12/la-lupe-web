# Mobile polish and real-restaurant copy
Phone header/cart/home-carousel polish plus removal of every "demo / propuesta" notice; the site is now the restaurant's app.
Owner constraint: no commits or push until explicitly authorized.

## Specs
- S1 Cart position: "baja el icono del carrito arriba del icono de whashtapp". Decision (L2): "Solo en celular" — on phones (≤700px) the floating cart sits bottom-right directly above the WhatsApp button; tablet/desktop keep it top-right. The menu header no longer reserves top-right space on phones.
- S2 Brand in bar: "pon el nombre del restaurante en la barra del menu y alineas mejor el logo y el ☰ solo dejas el texto parrafo abajo alinea mejor los items generales". Decision (L2): "Nombre y debajo 'Cocina mexicana'" — phone header shows logo, "La Lupe" with "Cocina mexicana" below, and the ☰ right-aligned, all vertically centered.
- S3 Home carousel: "tambien deja de carrusel en el inicio las esparcialidades y que se pasen automaticamente cada 7 segundos pero solo para moviles". Nuestras Especialidades becomes a horizontal carousel at phone widths (≤760px) that advances every 7 seconds and loops; desktop grid unchanged. Autoplay pauses while the user touches/hovers/focuses it, offers a visible pause/play button (WCAG 2.2.2), and does not autoplay under prefers-reduced-motion. Supersedes S1 of odd/tasks/mobile-menu-carousel.md (stacked home).
- S4 Real app copy: "quita todo lo que dice propuesta de presentacion esta ya es la app para el restaurante". Remove demo bar, "Propuesta de presentación", "Propuesta visual conceptual", "Demo"/"Demo local" in titles, descriptions, OG image and structured data, "Imagen de referencia" captions and editorial "pendiente de aprobación / historia de ejemplo" notes. Decision (L2) "Texto breve sin inventar": Nuestra esencia uses a short truthful text (Mexican food in Chía, shared tables) with no invented history. Decision (L2) "Quitar 'Demo', sin indexar aún": keep robots noindex and the local origin until the owner provides the real domain. Functional fallbacks (WhatsApp number missing, price por confirmar) stay.
- S5 Preserve: cart, options sheet, WhatsApp ordering, menu carousels, hamburger behaviour, desktop layouts, accessibility (44px targets, labels).

## Tasks
- [x] T1 S1 — phone cart above WhatsApp — browser RED→GREEN.
- [x] T2 S2 — phone header brand name + alignment — browser RED→GREEN.
- [x] T3 S3 — home specialties autoplay carousel — markup RED→GREEN, browser 7 s/loop/pause/reduced motion.
- [x] T4 S4 — demo/proposal copy removed, truthful essence text, noindex kept — test/real-app.test.tsx RED→GREEN.
- [x] T5 S1-S5 — 83 tests, lint 0 errors, types, check-cart, check-layout, test:mobile 21 PASS; verifier mvl69apr-4-zmms PASS S1-S5; pause button accessible name fixed (WCAG 2.5.3).

## Log
- L1 (user, verbatim): "baja el icono del carrito arriba del icono de whashtapp y pon el nombre del restaurante en la barra del menu  y alineas mejor el logo y el  ☰ solo dejas el texto parrafo abajo alinea mejor los items generales tambien deja de carrusel en el inicio las esparcialidades y que se pasen automaticamente cada 7 segundos pero solo para  moviles y quita todo lo que dice propuesta de presentacion esta ya es la app para el restaurante"
- L2 (user decisions via questionnaire): 1 "Nombre y debajo 'Cocina mexicana'"; 2 "Solo en celular"; 3 "Texto breve sin inventar (Recomendado)"; 4 "Quitar 'Demo', sin indexar aún (Recomendado)".
- L3 (parent): phone breakpoint for cart/header = ≤700px (same as hamburger); home carousel ≤760px (same as /menu carousels).

- L4 (delivery evidence): owner explicitly authorized local commits with "haz los commits". Branch `feat/restaurant-menu-responsive`: `be8c454` contains the real image sources/optimized assets and processing scripts; `d12c4a2` contains the complete restaurant implementation together with its tests and runtime documentation. Latest centering/button adjustment supersedes earlier left-alignment notes. Final checks: 93/93 tests, production build exit0, prior cart/browser and independent verification PASS. No push or production deployment performed; unrelated root commercial/reference documents remain untracked.
