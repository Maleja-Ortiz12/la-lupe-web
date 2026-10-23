import type { Metadata } from 'next';

// Local origin and noindex until the owner provides the real domain (odd/tasks/mobile-polish-real-app.md, S4).
// Then set the production origin here and allow indexing.
const siteOrigin = new URL('http://localhost:3005');
const socialImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'La Lupe · Comida mexicana en Chía',
};

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    metadataBase: siteOrigin,
    title,
    description,
    applicationName: 'La Lupe',
    category: 'Restaurante de comida mexicana',
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      siteName: 'La Lupe',
      locale: 'es_CO',
      type: 'website',
      url: path,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}
