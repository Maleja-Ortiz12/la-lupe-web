import { SiteHeader, SiteFooter } from '@/features/presentation/components/site-chrome';
import { ActionIcon } from '@/features/presentation/components/action-icon';
import { ContactPhones } from '@/features/presentation/components/contact-phones';
import { Flourish } from '@/features/presentation/components/flourish';
import { MexicanOrnament } from '@/features/presentation/components/mexican-ornament';
import { location } from '@/shared/config/location';

export function VisitPage() {
  return (
    <>
      <SiteHeader page="visit" />
      <main id="contenido">
        <section className="visit-page container" aria-labelledby="visit-title">
          <div className="visit-heading">
            <p className="visit-eyebrow">La Lupe · Chía</p>
            <h1 id="visit-title" className="flourish"><Flourish /><span>Visítanos</span><Flourish mirrored /></h1>
            <p>El sabor de México, más cerca de ti. Encuentra nuestra ubicación y prepara tu visita.</p>
            <MexicanOrnament />
          </div>
          <div className="visit-page-grid">
            <div className="visit-info">
              <h2><ActionIcon kind="location" />Aquí nos encuentras</h2>
              <address>{location.address}</address>
              <p className="visit-hours"><ActionIcon kind="clock" />Horarios por confirmar</p>
              <ContactPhones />
              <p>Consulta la ruta desde tu punto de partida en Google Maps.</p>
              <a className="button button-green" href={location.directionsUrl} target="_blank" rel="noopener noreferrer"><ActionIcon kind="location" />Cómo llegar<span className="visually-hidden"> (abre Google Maps en otra pestaña)</span></a>
              <a className="visit-map-link" href={location.mapUrl} target="_blank" rel="noopener noreferrer">Ver La Lupe en Google Maps<span className="visually-hidden"> (otra pestaña)</span></a>
            </div>
            <div className="visit-map-panel">
              <iframe className="visit-map" title="Mapa de ubicación de La Lupe en Chía" loading="lazy" src={location.mapEmbedUrl} referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              <p>El mapa es un servicio externo de Google Maps. Si no carga, usa el enlace para ver la ubicación o el botón «Cómo llegar».</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter page="visit" />
    </>
  );
}
