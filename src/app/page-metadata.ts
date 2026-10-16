import type { Metadata } from 'next';

const title = 'La Lupe | Cocina mexicana · Demostración';
const description = 'Propuesta visual de La Lupe: presentación, carta informativa y contacto. Contenido pendiente de aprobación; no es un sitio operativo.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, locale: 'es_CO', type: 'website' },
};
