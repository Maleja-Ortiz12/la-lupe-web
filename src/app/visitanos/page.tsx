import { VisitPage } from '@/features/visit/components/visit-page';
import { demoMetadata } from '@/shared/config/seo';

export const metadata = demoMetadata(
  '/visitanos',
  'Comida mexicana en Chía | Visita La Lupe · Demo',
  'Encuentra La Lupe, comida mexicana en Cl. 2 #11-80, Chía, Cundinamarca. Consulta el mapa y cómo llegar. Demo local; horarios pendientes de confirmación.',
);

export default function Page() {
  return <VisitPage />;
}
