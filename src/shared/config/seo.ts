import type { Metadata } from 'next';

// Intentionally local: this demo must not advertise a fictional production origin.
// Change the origin and indexing policy only after production content is approved.
const demoOrigin = new URL('http://localhost:3005');
const socialImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'La Lupe · Comida mexicana en Chía · Demo local',
};

export function demoMetadata(path: string, title: string, description: string): Metadata {
  return {
    metadataBase: demoOrigin,
    title,
    description,
    applicationName: 'La Lupe · Demo local',
    category: 'Restaurante de comida mexicana',
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      siteName: 'La Lupe · Demo local',
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
