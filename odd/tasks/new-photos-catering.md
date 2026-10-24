# Real photos for dishes without one, and the "Fiestas en casa" catering service
Process the owner's new photos with the existing realistic pipeline, wire them into the menu and the star specialties, and add catering as an additional service on the home page and at the end of the menu.
Commits only when the owner asks.

## Specs
- S1 Photos: "en la carpeta Raiz acabe de subir unos platos que no tenian forto, porfa mejoralos pero sin perder la esencial real y agregalos a l menu y a los especiales si es el caso porfa y si no estan porfa agregalos". New photos in `images/` are improved with `scripts/process-dishes.mjs` (crop, exposure, warm brand palette, sharpening, vignette; no generative edits) and used for: Burritos, Carne a la tampiqueña, Churros, Combo mero mero, Esquite, Nachos grandes, Pozole, Entrada mixta, Fajitas Famosas, Taquiza, Tinga de pollo, and the Birria option of Tacos. Star dishes (Carne a la tampiqueña, Nachos grandes, Combo mero mero, Taquiza) show them in Platos estrella and the home specialties. Every dish already exists in the carta, so no dish is added; original files stay untouched.
- S2 Catering: "hay una imagenes de catering ese ponlo como un servicio adicional porfa debajo de os especiales en el inicio y al finall del menu en la secion del menu". A "Fiestas en casa · Catering" block with the 3 catering photos, a short description and a "Cotizar por WhatsApp" button (prefilled message) appears on the home page right below Nuestras Especialidades and at the end of /menu (after Postres, also linked from the desktop sidebar and the phone pills). No prices, capacities or conditions are invented.
- S3 Preserve: existing photos, prices, cart, options dialog, WhatsApp ordering, mobile carousels, desktop layout, accessibility.

## Tasks
- [x] T1 S1 — process new photos and wire them into the menu data — RED 0/5 → S1 GREEN; before/after reviewed. No commit yet.
- [x] T2 S2 — catering block on home and at the end of the menu — browser GREEN 4 widths, screenshots reviewed. No commit yet.
- [x] T3 S1-S3 — npm test 106/106, lint 0 errors, types, build, check-cart 17/17 (twice), test:mobile 22, check-layout 9. Verifier mvltjh2v-a-o2br: S1/S2 PASS, one harness blocker (742px click flake) fixed with a 600 ms stable-target wait; recheck mvlucbe7-b-1u57 PASS. No commit yet.

## Log
- L1 (user, verbatim): "en la carpeta Raiz acabe de subir unos platos que no tenian forto, porfa mejoralos pero sin perder la esencial real y agregalos a l menu y a los especiales si es el caso porfa y si no estan porfa agregalos hay una imagenes de catering ese ponlo como un servicio adicional porfa debajo de os especiales en el inicio y al finall del menu en la secion del menu"
- L2 (exploration): 15 new files in `images/`: Burritos, Carne a la Tampiqueña, Churros, Combo mero mero, Esquite, Nachos grandes, Pozole, entrada Mixta, fagitas Famosas, tacos de birria, taquiza, tinga de pollo, Fiestas en casa caterig1-3. Churros, Pozole, Fajitas Famosas and Taquiza previously used photos extracted from the PDF carta, Entrada mixta a crop of the design reference; the owner's new real photos replace them.
- L3 (owner report): "eL pozole no lo cambiaste dejaste la imagen anterior" — investigated: public/dishes/pozole.webp and what localhost serves are the new photo (old/new/served comparison); the old one is what the unpublished production site and any browser cache still show.
- L4 (verification advisories): load-time layout shift at 742px from the font-dependent "Ver más" toggle; sidebar shows Postres after an instant jump to catering (wheel scroll and clicks select Catering); catering photos 1 and 2 are near-identical; catering copy mentions "taquiza" from what the photos show.
