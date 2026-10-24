# Home: rotating hero dishes, complete specialty photos, manual specialties carousel
Home-page follow-up after the new owner photos. Commits only when the owner asks.

## Specs
- S1 Photos: "en nuestras especialidades no le des tanto zoom a las imagnes porue se esta perdienedo el diseño". Specialty cards show the complete dish photo (natural 4:3 frame, no fixed-height crop).
- S2 Hero: "en la parte de sabor mexicano, podrias dejar qque la imagen cambie por diferentes platos, elige los 6 mas llamativos y que se cambie automaticamente en en lapzo de 5 segundos". The "Sabor Mexicano" hero photo cross-fades every 5 s through 6 real dish photos (Fajitas Famosas, Tacos de birria, Nachos grandes, Carne a la tampiqueña, Entrada mixta, Taquiza). Parent decision: pauses on hover/focus, a small accessible pause control (WCAG 2.2.2), static first photo under reduced motion.
- S3 Specialties: "quitar el carrusel en movimiento de las especialidadees que siga el carrusel pero que se pueda deslizar manualmente y aparezca un letrero debjo que diga deslizaa para ver mas productos". No autoplay and no pause button; same one-row infinite carousel (3 per view from 761px, 1 on phones) moved by swipe/scroll; a hint below reads "Desliza para ver más productos". Parent decision: ‹ › buttons beside the hint on >=761px so mouse users can move it.
- S5 Taquiza photo: "la imagen de la tiquiza la puedes mejorar subiendola no enfocando las tazas llenaas de productos si no el plao dee carne y las botellas ya que se 3esta viendo muy borrosa arreglala en toda la app porfa". The single taquiza.webp (used by menu, specialties, essence, hero and cart) is reframed on the sharp top of the original (Sol bottles and meat plate) instead of the out-of-focus salsa bowls.
- S4 Preserve: specialty links to the menu, layout widths, header, catering block, accessibility.

## Tasks
- [x] T1 S1/S3 — complete photos, manual carousel with hint and desktop arrows (inline) — no commit
- [x] T2 S2 — rotating hero photos (inline) — no commit
- [x] T3 S1-S5 — regression, visual review, independent verify — no commit

## Log
- L4 Verification: job-91 passed 107 tests, lint (2 existing warnings), types/build, mobile 22, cart 17, layout 9. Independent verification found overlapping hover/focus pause failure; reproduced RED 0/2, fixed with separate hovered/focused states, GREEN 2/2; independent bounded recheck passed S1-S5. Job-92 passed 109 tests/types/build but failed lint on three explicit-any types in the new test; corrected test types, focused tests 2/2, focused lint and typecheck passed. Native assessment unavailable due to unrelated untracked scope; independent verification completed instead. No commits/publishing authorized. Production public-route check remains separately blocked on public URL.
- L1 (user, verbatim): "en nuestras especialidades no le des tanto zoom a las imagnes porue se esta perdienedo el diseño y en la parte de sabor mexicano, podrias dejar qque la imagen cambie por diferentes platos, elige los 6 mas llamativos y que se cambie automaticamente en en lapzo de 5 segundos y quitar el carrusel en movimiento de las especialidadees que siga el carrusel pero que se pueda deslizar manualmente y aparezca un letrero debjo que diga deslizaa para ver mas productos"
- L3 (user, verbatim): "la imagen de la tiquiza la puedes mejorar subiendola no enfocando las tazas llenaas de productos si no el plao dee carne y las botellas ya que se 3esta viendo muy borrosa arreglala en toda la app porfa" — cause: the original has shallow depth of field (bowls blurred on purpose) and the automatic crop kept the bowls; now `position: 'north'` in scripts/process-dishes.mjs. Sharpness (Laplacian variance) 198 → 1467; before/after reviewed.
- L2 (parent decisions, reported to owner): the 6 hero dishes listed in S2; hero pause control + reduced motion; desktop arrows for the manual carousel. Supersedes the 5 s specialties autoplay from the slider change (0aa31f5).
