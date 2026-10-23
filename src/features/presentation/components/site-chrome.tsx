import Image from 'next/image';
import { ActionIcon } from './action-icon';
import { MexicanOrnament } from './mexican-ornament';
import { CornerLeaves } from './corner-leaves';
import { FloatingWhatsApp } from './floating-whatsapp';
import { ContactPhones } from './contact-phones';
import { HeaderNav } from './header-nav';
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

function NavLinks({ page }: { page: SitePage }) {
  return links[page].map(([href, label]) => <a href={href} key={href}>{label}</a>);
}

export function Brand({ footer = false, page = 'home' }: { footer?: boolean; page?: SitePage }) {
  return (
    <a className={`brand${footer ? ' brand-footer' : ''}`} href={page === 'home' ? '#inicio' : '/'} aria-label="La Lupe, ir al inicio">
      <span className="brand-logo-frame"><Image className="brand-logo" src="/brand/la-lupe.png" width={150} height={150} sizes="150px" loading="eager" alt="Logotipo original de La Lupe · Cocina mexicana" /></span>
      {footer
        ? <span className="brand-name">LA LUPE<small>COCINA MEXICANA</small></span>
        : <span className="brand-name brand-name-header"><span>La Lupe</span><small>Cocina mexicana</small></span>}
    </a>
  );
}

export function SiteHeader({ page = 'home' }: { page?: SitePage }) {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="site-header" data-page={page}>
        <span className="corner-wood" aria-hidden="true" />
        <CornerLeaves />
        <div className="textile-top" aria-hidden="true" />
        <div className="container header-inner">
          <Brand page={page} />
          <HeaderNav links={links[page].map(([href, label]) => ({ href, label, current: href === currentHref[page] }))} />
          <a className="button button-small header-order" href={page === 'menu' ? '#platos-estrella' : '/menu'}>
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14l1 14H4L5 7ZM9 7V5a3 3 0 0 1 6 0v2" /></svg>
            Hacer pedido
          </a>
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
        <p>Auténtica comida mexicana<br />en Chía, Cundinamarca.</p>
        <ContactPhones className="contact-phones footer-phones" />
        <div className="footer-links">
          <MexicanOrnament compact />
          <nav aria-label="Navegación del pie">
            <NavLinks page={page} />
          </nav>
        </div>
      </div>
      <p className="container footer-note">La Lupe · Cocina mexicana · Pedidos por WhatsApp · Sin pagos en línea</p>
    </footer>
    <FloatingWhatsApp href={whatsappHref} />
    </>
  );
}
