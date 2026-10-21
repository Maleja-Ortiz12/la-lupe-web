import { MenuPage } from '@/features/menu/components/menu-page';
import { demoMetadata } from '@/shared/config/seo';

export const metadata = demoMetadata(
  '/menu',
  'Menú de comida mexicana | La Lupe · Demo',
  'Explora el menú de comida mexicana de La Lupe en Chía: entradas, fajitas y taquiza. Demo local con imágenes y precios de referencia pendientes de aprobación.',
);

export default function Page() {
  return <MenuPage />;
}
