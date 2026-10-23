import { EssencePage } from '@/features/essence/components/essence-page';
import { pageMetadata } from '@/shared/config/seo';

export const metadata = pageMetadata(
  '/nuestra-esencia',
  'La Lupe | Nuestra esencia y comida mexicana',
  'La Lupe es cocina mexicana en Chía para compartir: tacos, taquizas, fajitas y más, en el restaurante o a domicilio en Cota y Chía.',
);

export default function Page() {
  return <EssencePage />;
}
