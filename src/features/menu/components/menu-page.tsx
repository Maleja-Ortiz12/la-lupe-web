import Image from 'next/image';
import { SiteFooter, SiteHeader } from '@/features/presentation/components/site-chrome';
import { contact, whatsappMessages, whatsappUrl } from '@/shared/config/contact';
import { MenuCatalog } from './menu-catalog';

export function MenuPage({ whatsappNumber = contact.whatsappNumber }: { whatsappNumber?: string }) {
  return (
    <>
      <SiteHeader page="menu" />
      <main id="contenido">
        <section className="menu-hero" aria-labelledby="menu-title">
          <span className="hero-side-textile" aria-hidden="true" />
          <div className="menu-hero-photo">
            <Image src="/reference/menu-hero.webp" width={547} height={262} alt="Imagen conceptual de fajitas, tortillas, guacamole y pico de gallo, extraída del diseño de referencia" priority unoptimized />
          </div>
          <div className="container menu-hero-inner">
            <h1 id="menu-title">Menú <span>y pedido</span></h1>
            <p>Descubre nuestros platillos de auténtica comida mexicana, preparados con ingredientes frescos y mucho sabor. Agrega tus favoritos al carrito y prepara tu solicitud por WhatsApp.</p>
          </div>
        </section>
        <div className="textile-band" aria-hidden="true" />
        <MenuCatalog whatsappNumber={whatsappNumber} />
      </main>
      <SiteFooter page="menu" whatsappHref={whatsappUrl(whatsappNumber, whatsappMessages.info)} />
    </>
  );
}
