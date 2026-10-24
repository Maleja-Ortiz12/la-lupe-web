# Despliegue en Cloudflare Workers

La configuración de OpenNext y Wrangler vive en el repositorio: no ejecutar la migración automática durante el despliegue. Se conservan `npm run dev`, `npm run build` y `npm start` para desarrollo y ejecución con Node.js.

En **Workers & Pages → tu Worker → Settings → Build**, usar:

| Ajuste | Valor |
| --- | --- |
| Directorio raíz | La carpeta que contiene este `package.json` (raíz del repositorio si no está anidada) |
| Node.js | `24.14.0` (variable de build `NODE_VERSION`) |
| Comando de build | `npm run build:worker` |
| Comando de deploy | `npx opennextjs-cloudflare deploy` |

El build instala dependencias con el lockfile (`npm ci`). No usar `wrangler deploy` como comando genérico de autodetección ni `opennextjs-cloudflare migrate`. El nombre del Worker en Cloudflare debe ser `la-lupe-web`, como `name` y `WORKER_SELF_REFERENCE` en `wrangler.jsonc`; si se renombra, actualizar los tres.

### Verificar antes de publicar

```sh
npm ci
npm run build:worker
npm run preview
```

`build:worker` genera `.open-next/worker.js` y `.open-next/assets`; `preview` compila y sirve la app localmente en el runtime de Workers. Revisar inicio, menú/carrito, imágenes, `/nuestra-esencia`, `/visitanos` y `/opengraph-image`. El adaptador tiene soporte limitado en Windows; si aparece un fallo específico de plataforma, realizar estos pasos en Linux/WSL o en el build de Cloudflare.

`npm run deploy` compila y **publica** en Cloudflare; ejecutarlo solo cuando se decida publicar y con una cuenta autorizada. No requiere responder preguntas de migración porque los archivos ya existen. No guardar tokens en Git; usar la integración de Cloudflare o sus secretos de CI.

### Recursos y límites

- Las rutas actuales se prerenderizan y usan caché de solo lectura en Static Assets: no se crea un bucket R2 ni una base de datos. Si se incorpora ISR o revalidación, cambiar esta estrategia por una caché con escritura.
- `IMAGES` permite optimizar los `next/image` existentes mediante Cloudflare Images y puede generar cargos según el plan y el uso.
- `.open-next/`, `.wrangler/` y `.dev.vars*` quedan fuera de Git. Para bindings locales, se puede crear `.dev.vars` con `NEXTJS_ENV=development`; no se necesitan secretos para la web actual.
- El dominio SEO es `https://lalupe.co` y las páginas son indexables (`src/shared/config/seo.ts`).

Referencias: [OpenNext para aplicaciones existentes](https://opennext.js.org/cloudflare/get-started), [caché de OpenNext](https://opennext.js.org/cloudflare/caching), [Next.js en Workers](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/).
