import type { Metadata } from 'next';

// Production origin: social previews (WhatsApp, Facebook) resolve image URLs against it.
export const siteOrigin = new URL('https://lalupe.co');
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
    robots: { index: true, follow: true },
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
