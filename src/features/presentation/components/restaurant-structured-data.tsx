import { contact } from '@/shared/config/contact';
import { location } from '@/shared/config/location';

// Only owner-supplied business facts (address, phone, delivery area).
const restaurant = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'La Lupe',
  description: 'La Lupe, restaurante de comida mexicana en Chía, Cundinamarca, con domicilios a Cota y Chía.',
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
  telephone: contact.whatsappNumber,
  areaServed: contact.deliveryAreas.map(name => ({ '@type': 'City', name })),
};

export function RestaurantStructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurant).replace(/</g, '\\u003c') }} />;
}
