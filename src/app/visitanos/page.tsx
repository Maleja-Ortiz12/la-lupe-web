import { VisitPage } from '@/features/visit/components/visit-page';
import { pageMetadata } from '@/shared/config/seo';

export const metadata = pageMetadata(
  '/visitanos',
  'Comida mexicana en Chía | Visita La Lupe',
  'Encuentra La Lupe, comida mexicana en Cl. 2 #11-80, Chía, Cundinamarca. Consulta el mapa, cómo llegar y nuestros teléfonos.',
);

export default function Page() {
  return <VisitPage />;
}
