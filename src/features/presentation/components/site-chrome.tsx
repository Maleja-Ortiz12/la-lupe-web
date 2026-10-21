import Image from 'next/image';
import { ActionIcon } from './action-icon';
import { MexicanOrnament } from './mexican-ornament';
import { CornerLeaves } from './corner-leaves';
import { FloatingWhatsApp } from './floating-whatsapp';
import { contact, whatsappMessages, whatsappUrl } from '@/shared/config/contact';

export type SitePage = 'home' | 'menu' | 'essence' | 'visit';

const links = {
  home: [
    ['#inicio', 'Inicio'],
    ['/menu', 'Menú'],
    ['/nuestra-esencia', 'Nuestra esencia'],
    ['/visitanos', 'Visítanos'],
  ],
  essence: [
    ['/#inicio', 'Inicio'],
    ['/menu', 'Menú'],
    ['/nuestra-esencia', 'Nuestra esencia'],
    ['/visitanos', 'Visítanos'],
  ],
  visit: [
    ['/#inicio', 'Inicio'],
    ['/menu', 'Menú'],
    ['/nuestra-esencia', 'Nuestra esencia'],
    ['/visitanos', 'Visítanos'],
  ],
  menu: [
    ['/#inicio', 'Inicio'],
    ['/menu', 'Menú'],
    ['/nuestra-esencia', 'Nuestra esencia'],
    ['/visitanos', 'Visítanos'],
  ],
} as const;

const currentHref = { home: '#inicio', menu: '/menu', essence: '/nuestra-esencia', visit: '/visitanos' } as const;

function NavLinks({ page, current = false }: { page: SitePage; current?: boolean }) {
  return links[page].map(([href, label]) => (
    <a href={href} key={href} aria-current={current && href === currentHref[page] ? 'page' : undefined}>{label}</a>
  ));
}

export function Brand({ footer = false, page = 'home' }: { footer?: boolean; page?: SitePage }) {
  return (
    <a className={`brand${footer ? ' brand-footer' : ''}`} href={page === 'home' ? '#inicio' : '/'} aria-label="La Lupe, ir al inicio">
      <span className="brand-logo-frame"><Image className="brand-logo" src="/brand/la-lupe.png" width={150} height={150} sizes="150px" loading="eager" alt="Logotipo original de La Lupe · Cocina mexicana" /></span>
      {footer && <span className="brand-name">LA LUPE<small>COCINA MEXICANA</small></span>}
    </a>
  );
}

export function SiteHeader({ page = 'home' }: { page?: SitePage }) {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <div className="demo-bar">Demostración visual · Imágenes de referencia · Contenido pendiente de aprobación</div>
      <header className="site-header">
        <span className="corner-wood" aria-hidden="true" />
        <CornerLeaves />
        <div className="textile-top" aria-hidden="true" />
        <div className="container header-inner">
          <Brand page={page} />
          <nav aria-label="Navegación principal">
            <NavLinks page={page} current />
          </nav>
          {page !== 'menu' && <a className="button button-small" href={page === 'home' ? '#contacto' : '/#contacto'}><ActionIcon kind="contact" />Contáctanos</a>}
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ page = 'home', whatsappHref = whatsappUrl(contact.whatsappNumber, whatsappMessages.info) }: { page?: SitePage; whatsappHref?: string | null }) {
  return (
    <>
    <footer className="site-footer">
      <div className="container footer-inner">
        <Brand footer page={page} />
        <p>Propuesta de presentación<br />para La Lupe · Cocina mexicana.</p>
        <div className="footer-links">
          <MexicanOrnament compact />
          <nav aria-label="Navegación del pie">
            <NavLinks page={page} />
          </nav>
        </div>
      </div>
      <p className="container footer-note">Propuesta visual conceptual · Pedidos por WhatsApp · Sin pagos en línea</p>
    </footer>
    <FloatingWhatsApp href={whatsappHref} />
    </>
  );
}
