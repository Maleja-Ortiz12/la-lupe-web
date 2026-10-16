# La Lupe — landing (plan Básico)

Visual demo landing for La Lupe, a Mexican restaurant. Frontend only: Next.js 16 + TypeScript. No backend, database, orders, payments or AI.

**Status:** demo. Content, photos, menu, prices and contact details are pending approval. The page requests `noindex, nofollow`, and the WhatsApp button is visual only (disabled, no number or link).

## Run locally

Requires Node.js 24.x and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm test` | Content, scope, navigation, logo and WhatsApp tests |
| `npm run test:layout -- "<Chromium path>" [URL] [label]` | Rendered check at 1920/1440/1122/375 px; needs a running server and a local Chromium/Edge |
| `npm run typecheck` | Strict TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

## Deploy (Vercel)

Import this repository in Vercel with the default Next.js settings: no environment variables or extra configuration are needed. Each push to the default branch redeploys.

## Structure

```text
src/app/                     Routes, layout, metadata, global styles, local fonts
src/features/presentation/   Landing sections, header/footer, icons, floating WhatsApp
src/shared/styles/           Design tokens
public/brand/                Original logo
public/reference/            Reference-only crops and textures (see its README)
test/                        Unit tests (node:test)
scripts/check-layout.mjs     Browser layout check
```

## Before production

- Replace reference crops with approved original photos and confirm usage rights.
- Confirm menu, texts, address, hours and the WhatsApp number; then enable contact links.
- Remove the demo notices and `noindex`, and configure the final domain, canonical URL and sitemap.

Fonts are served locally with their licenses in `src/app/fonts/`.
