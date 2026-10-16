import Image from 'next/image';
import { ActionIcon } from './action-icon';
import { MexicanOrnament } from './mexican-ornament';
import { CornerLeaves } from './corner-leaves';

const links = [
  ['#inicio', 'Inicio'],
  ['#carta', 'Menú'],
  ['#nosotros', 'Nuestra esencia'],
  ['#contacto', 'Visítanos'],
] as const;

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a className={`brand${footer ? ' brand-footer' : ''}`} href="#inicio" aria-label="La Lupe, ir al inicio">
      <span className="brand-logo-frame"><Image className="brand-logo" src="/brand/la-lupe.png" width={150} height={150} sizes="150px" loading="eager" alt="Logotipo original de La Lupe · Cocina mexicana" /></span>
      {footer && <span className="brand-name">LA LUPE<small>COCINA MEXICANA</small></span>}
    </a>
  );
}

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <div className="demo-bar">Demostración visual · Imágenes de referencia · Contenido pendiente de aprobación</div>
      <header className="site-header">
        <span className="corner-wood" aria-hidden="true" />
        <CornerLeaves />
        <div className="textile-top" aria-hidden="true" />
        <div className="container header-inner">
          <Brand />
          <nav aria-label="Navegación principal">
            {links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
          </nav>
          <a className="button button-small" href="#contacto"><ActionIcon kind="contact" />Contáctanos</a>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Brand footer />
        <p>Propuesta de presentación<br />para La Lupe · Cocina mexicana.</p>
        <div className="footer-links">
          <MexicanOrnament compact />
          <nav aria-label="Navegación del pie">
            {links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
          </nav>
        </div>
      </div>
      <p className="container footer-note">Propuesta visual conceptual · No es un sitio operativo · Sin pedidos ni pagos en línea</p>
    </footer>
  );
}
