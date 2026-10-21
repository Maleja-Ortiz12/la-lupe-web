import { EssencePage } from '@/features/essence/components/essence-page';
import { demoMetadata } from '@/shared/config/seo';

export const metadata = demoMetadata(
  '/nuestra-esencia',
  'La Lupe | Nuestra esencia y comida mexicana · Demo',
  'Descubre una historia ficticia de La Lupe inspirada en México, la comida mexicana y las mesas compartidas. Relato de ejemplo para la demo local, no historia real.',
);

export default function Page() {
  return <EssencePage />;
}
