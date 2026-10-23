# La Lupe — base modular del plan Básico

Proyecto exclusivamente frontend con Next.js y TypeScript, según [PROPUESTA_WEB_BASICA_Y_COBRO.md](PROPUESTA_WEB_BASICA_Y_COBRO.md). Es el sitio del restaurante: inicio, menú con precios y carrito que arma el pedido por WhatsApp, Nuestra esencia y Visítanos. No hay pagos en línea. En celular el encabezado usa menú hamburguesa, el menú se muestra en carruseles y el carrito flota encima de WhatsApp. En el inicio, Nuestras Especialidades es una sola fila infinita: 3 tarjetas en tablet/escritorio (avanza de a 2) y 1 en celular (avanza de a 1), automática cada 5 s con botón de pausa y sin movimiento si el sistema pide reducir animaciones.

> Las secciones de historial más abajo (pruebas RED/GREEN, revisiones visuales) describen etapas anteriores, cuando el sitio era una demostración. El estado vigente es el de esta introducción y la sección **Estado actual**.

## Ejecutar localmente

Entorno declarado: Node.js >=24.14.0 y <25, npm. Verificado inicialmente con Node.js 24.14.0 y npm 11.9.0. Las versiones instaladas se registran en `la-lupe-web/package-lock.json`.

```sh
cd la-lupe-web
npm ci
npm run dev
```

Abrir `http://localhost:3000`. No requiere levantar una API ni configurar una base de datos.

## Arquitectura modular

```text
la-lupe-web/
  src/app/                         Rutas, layout y metadatos de Next.js
  src/features/presentation/       Landing y cabecera/pie modulares
  src/app/fonts/                   Chewy, Caveat Brush y Fira Sans locales, con sus licencias
  public/reference/                Recortes y texturas de la referencia para demostración
  public/brand/                    PNG original del logo, sin modificaciones
  src/shared/styles/               Tokens visuales reutilizables
  test/                            Prueba del contenido inicial
```

Las rutas componen las funcionalidades. Los componentes de presentación y los estilos se mantienen separados; los elementos compartidos se extraen solo cuando se reutilizan. No hay backend propio, API de negocio, acceso a base de datos ni dependencias de NestJS.

La presentación utiliza Server Components de Next.js; el catálogo y carrito de `/menu` son un Client Component con estado local. Esto no representa una API de negocio; la posibilidad de exportación estática se evaluará al definir el alojamiento. No hay proveedor ni despliegue configurados.

## Alcance del plan Básico

- Inicio y presentación del negocio.
- Nosotros y propuesta de valor.
- Productos o servicios; para el restaurante, carta informativa con contenido aprobado.
- Contacto, horarios y ubicación proporcionados por el cliente.
- Enlaces a redes sociales y apertura voluntaria de WhatsApp, sin envío automático.
- Diseño responsive y personalización con imágenes, logo y textos autorizados.
- HTML semántico y metadatos SEO conforme al plan.

**No incluye:** backend, base de datos, autenticación, panel administrativo, registro de pedidos, pagos, reservas automáticas, bots ni IA. Como ampliación autorizada, `/menu` incorpora un carrito local para preparar una solicitud manual por WhatsApp. El contenido se mantendrá en el frontend; no depende de una API de catálogo.

## Comandos disponibles

Ejecutar dentro de `la-lupe-web/`:

| Comando | Función |
| --- | --- |
| `npm run dev` | Desarrollo con recarga |
| `npm test` | Pruebas de contenido, alcance, navegación y logo con Node.js |
| `npm run test:layout -- "<ruta del navegador>" [URL] [etiqueta]` | Prueba renderizada de ancho completo en cuatro tamaños; requiere frontend iniciado |
| `npm run test:cart -- "<ruta del navegador>" [URL] [etiqueta]` | Carrito, variantes y WhatsApp en escritorio/tablet (1440/1122), más selección exacta de toppings de Churros y sabores de Taquiza en celular/escritorio (375/1440) |
| `npm run test:mobile -- "<ruta del navegador>" [URL] [etiqueta]` | Celular: menú hamburguesa, carrito encima de WhatsApp, nombre en la barra, slider infinito de especialidades cada 5 s (3/1 por vista, paso 2/1) y carruseles del menú con selector de opciones |
| `npm run typecheck` | Revisión estricta de TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Compilación de producción |
| `npm start` | Inicio local después del build |

### Comprobar el diseño en navegador

Con el frontend iniciado en otra terminal y Edge/Chromium instalado, ejecutar desde `la-lupe-web/`:

```sh
npm run test:layout -- "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" http://127.0.0.1:3000 layout
```

Sustituir la ruta por el ejecutable de un navegador Chromium local. No instala navegadores ni dependencias. La URL predeterminada es `http://127.0.0.1:3000` y la etiqueta predeterminada es `layout`; esta última acepta letras, números, guiones y guiones bajos. `npm run test:layout -- --help` muestra el uso. El proceso usa un perfil independiente en `.preview/layout-profile/`, no el perfil personal, y cierra su navegador al terminar.

El script valida 1920, 1440, 1122 y 375 px: cabecera, demostración, contenido y pie llegan a ambos bordes del área útil; no hay desbordamiento horizontal; cargan imágenes y fuentes; se mantienen los tres logos, las secciones y botones de al menos 44 px. También verifica inclinación del título, cuatro adornos SVG y WhatsApp flotante fijo, visible dentro del viewport, deshabilitado y sin destino. Comprueba además las fuentes de título/cuerpo, párrafos de al menos 16 px con interlineado mínimo de 1,35, flotación continua de 3,6 s, halo breve, control de pausa/reanudación que no habilita contacto, enlaces del pie no cubiertos y ausencia de animaciones y del control al emular `prefers-reduced-motion: reduce`. Guarda capturas y métricas bajo `.preview/<etiqueta>-*`, sin publicarlas ni agregarlas a Git. Una aserción fallida o el límite de 45 segundos produce salida no exitosa.

## Estado y verificaciones

La landing tiene diez pruebas (incluida la esquina superior izquierda): navegación y landmarks; demostración sin datos operativos inventados; secciones y recursos de la referencia; logo original en las tres ubicaciones; adornos e iconos SVG; WhatsApp flotante visual sin destino; adornos de Esencia y pie; control para pausar la flotación; metadatos sin indexación. Se observó RED al exigir el logo original y GREEN después. `npm test` (10/10), `npm run typecheck`, `npm run lint` y `npm run build` finalizaron con código 0.

Se revisaron capturas reales en Edge de escritorio (1122 × 1402) y móvil (375 × 812): nueve imágenes cargadas, sin desbordamiento horizontal, fuente pintada aplicada y tres logos sin filtros, mezcla de colores ni distorsión. Las capturas y métricas temporales están en `la-lupe-web/.preview/`, excluido de Git y ESLint. Se comprobó por HTTP que el SHA-256 del logo público coincide exactamente con `Logo Final Lupe.png`; las rutas inexistentes siguen respondiendo 404.

La prueba de ancho completo reprodujo primero una franja exterior de 312,5 px a cada lado en una pantalla de 1920 px (RED). Se eliminaron los topes de 1280 px del marco y de 1120 px del contenido; los fondos ahora llegan de borde a borde, con márgenes internos fluidos y títulos, espacios y tarjetas escalables. El mismo script pasó en los cuatro tamaños (GREEN), y se revisaron las capturas de pantalla ancha, referencia y móvil. Suite 5/5, typecheck, lint y build también aprobados.

En una revisión previa de detalles se observó RED por título sin inclinación (0°), adornos ausentes y falta del flotante. Se corrigió a −2° (−1,5° en móvil), con cuerpo Fira Sans Condensed servido localmente, gotas SVG rojas/verdes y Visítanos con pin, pincelada y reloj. El flotante muestra «WhatsApp · Próximamente»: está deshabilitado y no tiene número, enlace ni envío asociado, por indicación del usuario. GREEN: siete pruebas, typecheck, lint, build y prueba de navegador en cuatro tamaños; capturas `details-green-*` revisadas.

La revisión tipográfica actual usa Chewy para el título principal, más gruesa y redondeada, y Fira Sans sin condensar para párrafos y navegación. Los párrafos aumentaron de tamaño y usan interlineado 1,4. Se conservaron la inclinación del título, las secciones y el ancho completo; se pulieron el pin y el auricular de los iconos. Se observó RED por fuentes nuevas ausentes y animación `none`, luego GREEN en los cuatro tamaños, con siete pruebas, typecheck, lint y build aprobados; capturas `typography-final-*` revisadas.

El WhatsApp de demostración flota de forma continua y suave (ciclo de 3,6 s, desplazamiento máximo de 10 px y leve giro), con un halo inicial de tres ciclos de 1,6 s. Un botón pequeño junto a él pausa y reanuda la flotación (`aria-pressed`, etiqueta «Pausar/Reanudar animación de WhatsApp»). Con reducción de movimiento activada no se anima y el control de pausa se oculta.

La esquina superior izquierda replica los detalles de la referencia: hojas de palma (SVG decorativo) sobre una cuña de madera, una franja textil vertical recortada de la referencia (`hero-side-textile.webp`) a lo largo del borde izquierdo del inicio y un leve envejecido en los bordes del papel. En móvil las hojas y la franja se reducen para no tapar el logo ni el texto. RED: prueba unitaria y de navegador sin esos elementos; GREEN: diez pruebas, typecheck, lint, build y navegador en cuatro tamaños (posición de las hojas y franja cubriendo todo el inicio).

### SEO

**La indexación sigue desactivada hasta tener el dominio real.** Las cuatro páginas conservan `noindex, nofollow` y no se genera sitemap ni canonical de producción. Al publicar, cambiar el origen en `src/shared/config/seo.ts` y habilitar `robots`.

| Área | Implementación |
| --- | --- |
| Palabra clave principal | Comida mexicana en Chía, con La Lupe como marca; México como inspiración gastronómica, no ubicación del restaurante. |
| Metadatos por página | Títulos y descripciones únicos para inicio, menú, esencia y ubicación, sin textos de demo ni de propuesta. |
| Redes sociales | Open Graph y Twitter Cards coherentes con cada página, idioma `es_CO` y una imagen PNG local de 1200 × 630 en `/opengraph-image`. |
| Datos estructurados | JSON-LD `Restaurant` solo en el inicio, con nombre, cocina y dirección/coordenadas aportadas. Sin inventar teléfono, horarios, reseñas, precios ni una URL comercial. |
| Origen local | `src/shared/config/seo.ts` usa `http://localhost:3005` para resolver los enlaces sociales. Para otra vista local, ajustar ese origen; esto no define un dominio de producción. |

La imagen social no se muestra dentro de la página y no descarga fotografías ni fuentes externas. Los rastreadores públicos de redes sociales no pueden acceder a `localhost`. No se añadieron meta keywords ni repeticiones artificiales: Google no usa la etiqueta `keywords` para posicionar y desaconseja el relleno de palabras clave.

**Evidencia:** RED en las pruebas nuevas antes de implementar; GREEN 36/36, typecheck, lint y build. Se comparó el HTML renderizado de las cuatro páginas antes y después, excluyendo el script JSON-LD invisible: idéntico. La comprobación HTTP verificó título único, descripción, `noindex`, Open Graph/Twitter por ruta, URL local, JSON-LD válido y PNG servido con tamaño 1200 × 630. La primera comparación de `og:url` fue demasiado estricta con la barra final del inicio; corregida para comparar URLs equivalentes, todas las rutas pasaron. Evidencias locales en `.preview/seo-http-results.json`, `.preview/seo-body-baseline.json` y `.preview/seo-social-preview.png`. El fallo inicial de typecheck fue una falta de estrechamiento de `metadataBase` en la prueba, ya corregida.

**Antes de una publicación futura:** confirmar dominio HTTPS y contenido real, sustituir la historia/precios/fotos de referencia, revisar permisos de imágenes, confirmar horarios/contacto, definir canonical/sitemap y decidir expresamente retirar `noindex`. Luego validar los datos con Rich Results Test, registrar Search Console y trabajar la ficha de Google Business Profile. Nada de esto se ejecutó para la demo; no hay garantía de alcanzar el primer puesto.

Referencias consultadas: [skill Next.js SEO Audit](https://github.com/thisisAhsanIqbal/nextjs-seo-audit) (revisada como referencia, no instalada), [Google sobre meta keywords](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag), [políticas contra keyword stuffing](https://developers.google.com/search/docs/essentials/spam-policies) y [datos estructurados de negocios locales](https://developers.google.com/search/docs/appearance/structured-data/local-business). Se contrastó la skill con las guías oficiales; sus umbrales de densidad de palabras clave no se aplicaron como reglas de posicionamiento.

### Carrito local y solicitud por WhatsApp

`/menu` incorpora el panel «Tu pedido» inspirado en `menu.png`. Al entrar, el carrito está oculto y el catálogo ocupa el espacio disponible. Pulsar «Agregar» muestra el carrito y lleva el foco a su título: a la derecha en escritorio y después del catálogo en móvil. «Agregar más productos» oculta el panel sin borrar la selección y devuelve el foco al último botón «Agregar» utilizado; si se abrió vacío, vuelve al catálogo. «Ver carrito» permite volver a abrirlo sin modificar productos. En móvil, las opciones de fajitas y taquiza se apilan con sus precios y porciones identificados, sin necesidad de desplazar tablas horizontalmente; los controles mantienen al menos 44 px de alto. Cada producto tiene cantidad y botón «Agregar». Las fajitas permiten elegir `1/2 Orden` o `Full Orden`, con líneas y precios independientes. Agregar otra vez el mismo producto combina sus cantidades; desde el carrito se pueden aumentar, reducir o quitar productos. Se permiten de 1 a 99 unidades por producto; nuevas adiciones se limitan a 99. El carrito comienza vacío y se borra al recargar o salir de la página: no usa almacenamiento persistente, backend ni datos personales.

Churros permite elegir Chocolate, Arequipe y Helado: exactamente 1, 2 o 3 toppings según el tamaño. Taquiza exige 3 de los 7 sabores disponibles (incluidos Pescado y Camarón). Las elecciones viajan en el carrito y en el mensaje de WhatsApp; no se puede agregar una combinación incompleta. Los selectores funcionan en celular y escritorio.

El flotante de WhatsApp ya no tiene botón de pausa; conserva su enlace y respeta la reducción de movimiento. El botón de pausa del carrusel de Especialidades es independiente y se mantiene.

El único cierre es **«Pedir carrito por WhatsApp»**. Prepara un enlace con el detalle de productos, variantes, cantidades, importes de línea y subtotal de referencia en COP. El cliente revisa y decide enviar el mensaje; abrir WhatsApp no registra ni confirma un pedido. No se incorporan pagos, estados ficticios de pago, asistentes ni envío automático. El botón queda deshabilitado si el carrito está vacío o falta el número del restaurante. Para activar la apertura real, confirmar el número y configurarlo en `src/shared/config/contact.ts`; no se incorporó ningún número de ejemplo a la web.

Para verificar el carrito con un navegador Chromium y el frontend iniciado:

```sh
npm run test:cart -- "<ruta al ejecutable de Chromium>" http://127.0.0.1:3005 cart
```

`--help` muestra la invocación. La prueba usa el número vacío de la demo y comprueba mediante clics reales la apertura automática del carrito, el regreso con «Agregar más productos» conservando contenido y foco, cantidades, combinación de líneas, porciones independientes, eliminación, reinicio al recargar y envío deshabilitado en 1440, 1122 y 375 px. También verifica opciones móviles sin desplazamiento horizontal y controles de al menos 44 px de alto. Reproduce el ejemplo de la referencia: entradas X2 ($22.500) + fajitas de pollo de media orden ($30.500) = **$53.000**. Las pruebas unitarias también verifican el mensaje y enlace completo con un número ficticio aislado, sin abrir WhatsApp ni enviar solicitudes. Capturas y resultados quedan en `.preview/cart-*`; se conserva la referencia original sin modificar.

Evidencia de esta ampliación: RED por ausencia del módulo de carrito, GREEN 42/42 pruebas, typecheck, lint y build aprobados; navegador del carrito aprobado en tres tamaños y regresión del flotante aprobada en las cuatro rutas, escritorio y móvil. El error de comillas al generar inicialmente el comprobador no produjo cambios de aplicación; el script corregido pasó su validación sintáctica y funcional.

### Verificar el WhatsApp flotante

Con el frontend local iniciado y un navegador Chromium instalado:

```sh
npm run test:whatsapp -- "<ruta al ejecutable de Chromium>" http://127.0.0.1:3005 whatsapp
```

El número de WhatsApp debe seguir vacío para esta prueba de demostración. El chequeo abre `/`, `/menu`, `/nuestra-esencia` y `/visitanos` en 1440 y 375 px con un perfil nuevo. Espera la carga de la página, envía clics reales y observa cada transición de pausa/reanudación con un límite de cinco segundos. Verifica el estado accesible, la animación del botón y del halo, movimiento reducido, un solo flotante, ausencia de solapamiento con los enlaces del pie y un único botón final de pedido en el menú. Guarda capturas y estados JSON en `.preview/`; `--help` muestra la invocación.

La prueba anterior podía hacer clic sintético antes de la hidratación de React, perdiendo el evento y produciendo un falso fallo. Se reprodujo demorando la descarga de JavaScript: el clic temprano no cambiaba el estado; después de cargar, el clic real pausaba correctamente. No fue necesario modificar el componente. El nuevo chequeo también usa desplazamiento instantáneo para medir el pie, evitando que el desplazamiento suave deje el pie fuera de la vista al medir. Esta prueba no valida la carga del proveedor externo del mapa.

El menú conserva un único cierre «Pedir carrito por WhatsApp» en el panel «Tu pedido», más el botón flotante de información. Se eliminaron las repeticiones de la cabecera y del hero. El flotante se renderiza una sola vez desde el pie compartido en `/`, `/menu`, `/nuestra-esencia` y `/visitanos`, conservando el control de pausa y la preferencia de movimiento reducido. Todos usan la configuración compartida; sin un número confirmado siguen deshabilitados y sin enlace.

La ruta `/visitanos` muestra la dirección aportada: **Cl. 2 #11-80, Chía, Cundinamarca**. Incluye un mapa externo de Google Maps en las coordenadas `4.8533766, -74.0645729`, un botón «Cómo llegar» y el enlace a la ficha suministrada. La ubicación se centraliza en `src/shared/config/location.ts`; el mapa no necesita clave de API y se carga de forma diferida. Google recibe las solicitudes del mapa al cargar el iframe; si el servicio falla, la dirección y los enlaces siguen disponibles. Los enlaces externos se abren en otra pestaña. El inicio conserva un resumen sin mapa, y la navegación lleva a la página independiente. Los horarios y el número de WhatsApp siguen pendientes; la ubicación no los confirma.

**Verificación del mapa:** en Edge, con el mapa visible durante unos segundos, el iframe muestra el marcador sobre la Calle 2, en Chía. La respuesta final de Google (`/maps/embed`) devuelve 200 sin `X-Frame-Options`. La redirección inicial no bloquea la carga. Las capturas de página completa de `test:layout` muestran el recuadro vacío porque el mapa es diferido y externo: no indican un fallo. El fallo anterior de imagen en el inicio no se reprodujo; el chequeo completo pasa en cuatro tamaños.

La ruta `/nuestra-esencia` tiene página propia, accesible desde cabecera, pie y el enlace «Conoce nuestra historia» del inicio. La portada conserva solo una presentación breve. La página «Nuestra Esencia» incluye un relato ficticio de demostración en tres momentos: el comienzo alrededor de una mesa, la inspiración mexicana y el encuentro que se quiere compartir. El aviso visible aclara que no es la historia real del restaurante y requiere aprobación. Las tres tarjetas reutilizan imágenes locales ya existentes, con rótulos de referencia; no representan fundadores ni instalaciones reales. La composición pasa a una columna en pantallas pequeñas. La prueba de renderizado verifica los tres capítulos, imágenes y aviso, además de conservar los tests anteriores.

«Nuestra Esencia» tiene panel de papel con borde rasgado, ornamento mexicano SVG y adornos recortados de la referencia (geco, agave y sombrero, con bordes difuminados). «Visítanos» usa una pincelada turquesa con textura e iconos más grandes. El pie suma borde superior, nombre de marca con la tipografía del título, ornamento y enlaces más legibles; los enlaces del pie se separan del botón flotante para no quedar cubiertos. RED: dos pruebas nuevas (adornos y control de pausa) y flotación de 1,6 s finita; GREEN: nueve pruebas, typecheck, lint, build y la prueba de navegador en cuatro tamaños, que también valida pausar/reanudar, que el botón siga deshabilitado sin navegar y que no cubra los enlaces del pie. Las métricas JSON ahora conservan los resultados de pausa y de reducción de movimiento. Continúa deshabilitado, sin teléfono ni enlace; la animación no habilita contacto. La verificación independiente de esa revisión aprobó las capturas, las siete pruebas de entonces y HTTP 200/404/noindex. En aquella revisión, el JSON de métricas no conservaba el resultado de reducción de movimiento; se corrigió en la revisión siguiente.

La captura inicial reprodujo la fuente incorrecta y el pergamino en bloques. Se corrigió la variable de fuente, se crearon texturas sin juntas y se acercaron alturas y botones a la referencia. La primera sonda confundía el espacio de la barra de desplazamiento con overflow; se corrigió y la captura final pasó. El primer lint incluyó el script temporal de capturas; tras excluir `.preview/`, el lint y build finales pasaron. Estos fallos iniciales no permanecen abiertos.

Un verificador independiente comparó las capturas con ambos originales: cinco pruebas y una sonda HTTP aprobadas (logo idéntico, página 200, enlaces internos y ruta inexistente 404). No encontró bloqueos funcionales. El encuadre del hero y los bordes decorativos todavía tienen diferencias de detalle respecto de la referencia; no se afirma igualdad píxel a píxel. La captura móvil incluye un indicador de incidencias de Next en desarrollo cuyo diagnóstico no se investigó en esta revisión.

No se ejecutó auditoría de vulnerabilidades. npm informó que ESLint 9.39.5 está fuera de soporte; evaluar una actualización compatible antes de producción. La evaluación nativa anterior no pudo resolver los archivos sin seguimiento y no produjo una revisión aprobada.

## Pendientes

**Estado actual:** el sitio ya es la app del restaurante, con carta real, precios en COP, fotos de platos, contacto (WhatsApp +57 311 634 1836) y domicilios a Cota y Chía. El logo original `Logo Final Lupe.png` se conserva completo en `public/brand/la-lupe.png`. Algunas imágenes decorativas (hero, Nuestra esencia) siguen siendo recortes de la referencia de diseño y conviene reemplazarlas por fotos propias antes de publicar. Los horarios siguen por confirmar. Las tipografías Chewy, Caveat Brush y Fira Sans se sirven localmente con sus licencias en `src/app/fonts/`.

Las páginas mantienen `noindex, nofollow` y el origen local hasta tener el dominio real; los títulos, descripciones, Open Graph y datos estructurados ya no dicen "demo". El sitio no se ha publicado.

Los documentos `PLAN_INTEGRACION_FRONTEND_LA_LUPE.md`, `PLAN_INTEGRACION_BACKEND_LA_LUPE.md` y `PLAN_PROPUESTA_RESTAURANTES.md` se conservan como antecedentes de otra propuesta. Sus referencias a NestJS y al registro de pedidos **no forman parte del alcance vigente**. El carrito local con solicitud manual por WhatsApp sí se incorporó posteriormente por autorización expresa, sin adoptar el backend ni los pagos de esas propuestas. La referencia vigente es el plan Básico enlazado al inicio.
