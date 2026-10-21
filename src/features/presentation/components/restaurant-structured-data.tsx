import { location } from '@/shared/config/location';

// Only owner-supplied business facts; demo prices and the fictional story are excluded.
const restaurant = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'La Lupe',
  description: 'Sitio de demostración local de La Lupe, comida mexicana en Chía. Contenido pendiente de aprobación.',
  servesCuisine: 'Mexicana',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Cl. 2 #11-80',
    addressLocality: 'Chía',
    addressRegion: 'Cundinamarca',
    addressCountry: 'CO',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 4.8533766, longitude: -74.0645729 },
  hasMap: location.mapUrl,
};

export function RestaurantStructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurant).replace(/</g, '\\u003c') }} />;
}
