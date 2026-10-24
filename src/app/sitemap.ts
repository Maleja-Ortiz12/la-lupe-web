import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/shared/config/seo';

const publicPaths = ['/', '/menu', '/nuestra-esencia', '/visitanos'];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map(path => ({ url: new URL(path, siteOrigin).href }));
}
