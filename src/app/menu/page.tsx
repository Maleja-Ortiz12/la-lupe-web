import { MenuPage } from '@/features/menu/components/menu-page';
import { pageMetadata } from '@/shared/config/seo';

export const metadata = pageMetadata(
  '/menu',
  'Menú de comida mexicana | La Lupe',
  'Carta de comida mexicana de La Lupe en Chía con precios: entradas, fajitas, tacos y taquiza, carnes y postres. Domicilios a Cota y Chía.',
);

export default function Page() {
  return <MenuPage />;
}
