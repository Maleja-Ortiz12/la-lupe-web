import Image from 'next/image';
import { SiteFooter, SiteHeader } from './site-chrome';
import { ActionIcon } from './action-icon';
import { ContactPhones } from './contact-phones';
import { Flourish } from './flourish';
import { MexicanOrnament } from './mexican-ornament';
import { WhatsAppLink } from './whatsapp-link';
import { SpecialtyCarousel } from './specialty-carousel';
import { contact, whatsappMessages, whatsappUrl } from '@/shared/config/contact';
import { location } from '@/shared/config/location';
import { formatPrice, hasOptions, starItems, startingPrice } from '@/features/menu/menu-data';

// Owner's star dishes (odd/tasks/real-menu.md, S9), with the reference brush colors cycling per card.
const brushColors = ['red', 'green', 'yellow'] as const;

export function HomePage({ whatsappNumber = contact.whatsappNumber }: { whatsappNumber?: string }) {
  const whatsappHref = whatsappUrl(whatsappNumber, whatsappMessages.info);

  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <span className="hero-side-textile" aria-hidden="true" />
          <div className="hero-photo">
            <Image src="/reference/hero.webp" width={587} height={283} alt="Fajitas con pimentones, tortillas, guacamole y pico de gallo" priority unoptimized />
          </div>
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1 id="hero-title">Sabor Mexicano<br /><span>en Cada Encuentro</span></h1>
              <p>Fajitas, taquizas y mucho más. Auténtica comida mexicana para disfrutar de una mesa cálida y llena de color.</p>
              <div className="hero-actions">
                <a href="/menu" className="button"><ActionIcon kind="menu" />Ver menú</a>
                <a href="#contacto" className="button button-green"><ActionIcon kind="contact" />Contáctanos</a>
              </div>
            </div>
          </div>
        </section>
        <div className="textile-band" aria-hidden="true" />
        <section id="carta" className="specialties" aria-labelledby="carta-title">
          <div className="container">
            <div className="section-heading">
              <h2 id="carta-title" className="flourish"><Flourish /><span>Nuestras Especialidades</span><Flourish mirrored /></h2>
              <p>Los sabores que nos inspiran: auténtica comida mexicana.</p>
            </div>
            <SpecialtyCarousel>
              {starItems.map((item, index) => {
                const price = startingPrice(item);
                return (
                  <article className={`specialty-card${item.image ? '' : ' specialty-card-text'}`} key={item.id}>
                    {item.image
                      ? <Image className="card-photo" src={item.image} width={960} height={720} sizes="(max-width: 600px) 100vw, (max-width: 950px) 50vw, 25vw" alt={`${item.name}, foto real de La Lupe`} />
                      : <Image className="card-photo dish-logo" src="/brand/la-lupe.png" width={240} height={180} alt="Logo de La Lupe · foto del plato próximamente" />}
                    <span className="specialty-badge"><span aria-hidden="true">★ </span>Plato estrella</span>
                    <div className="card-copy">
                      <h3 className={`brush brush-${brushColors[index % brushColors.length]}`}>{item.name}{item.unit && <small>{` (${item.unit})`}</small>}</h3>
                      {item.description && <p>{item.description}</p>}
                      <p className="specialty-price">{price === null ? 'Precio por confirmar' : `${hasOptions(item) ? 'Desde ' : ''}${formatPrice(price)}`}</p>
                      <a className="specialty-link" href={`/menu#plato-${item.id}`}>Ver en el menú <span aria-hidden="true">→</span></a>
                    </div>
                  </article>
                );
              })}
            </SpecialtyCarousel>
            <p className="section-note">Mira la carta completa con precios en el <a href="/menu">menú</a>.</p>
          </div>
        </section>
        <section id="nosotros" className="essence" aria-labelledby="essence-title">
          <div className="essence-image">
            <Image className="essence-backdrop" src="/reference/esencia-brandless.webp" width={576} height={231} alt="Composición decorativa de madera y textiles mexicanos" unoptimized />
            <span className="essence-logo-frame"><Image className="essence-logo" src="/brand/la-lupe.png" width={232} height={232} sizes="240px" loading="eager" alt="Logotipo original de La Lupe · Cocina mexicana" /></span>
          </div>
          <div className="essence-copy">
            <h2 id="essence-title" className="flourish"><Flourish /><span>Nuestra Esencia</span><Flourish mirrored /></h2>
            <p>Una mesa cálida, mucho color y el sabor de la cocina mexicana, aquí en Chía.</p>
            <a className="essence-story-link" href="/nuestra-esencia">Conoce nuestra historia <span aria-hidden="true">→</span></a>
            <MexicanOrnament />
            <Image className="essence-deco essence-deco-gecko" src="/reference/essence-gecko.webp" width={109} height={118} alt="" unoptimized />
            <Image className="essence-deco essence-deco-agave" src="/reference/essence-agave.webp" width={115} height={85} alt="" unoptimized />
            <Image className="essence-deco essence-deco-hat" src="/reference/essence-hat.webp" width={89} height={52} alt="" unoptimized />
          </div>
        </section>
        <section id="contacto" className="contact" aria-labelledby="contact-title">
          <div className="container contact-grid">
            <div className="visit-brush">
              <h2 id="contact-title"><ActionIcon kind="location" /><span>Visítanos</span></h2>
              <p>{location.address}</p>
              <a className="visit-preview-link" href="/visitanos">Ver ubicación y cómo llegar <span aria-hidden="true">→</span></a>
            </div>
            <div className="contact-details">
              <p><ActionIcon kind="clock" /><span>Horarios por confirmar</span></p>
              <WhatsAppLink href={whatsappHref} describedBy="contact-status"><ActionIcon kind="whatsapp" />{whatsappHref ? 'Escríbenos por WhatsApp' : 'WhatsApp no disponible'}</WhatsAppLink>
              <p id="contact-status">{whatsappHref ? 'Pedidos y reservas por WhatsApp.' : 'WhatsApp no disponible por ahora; llámanos a cualquiera de nuestros teléfonos.'}</p>
              <ContactPhones />
            </div>
            <Image className="village-art" src="/reference/village.webp" width={270} height={85} alt="" unoptimized />
          </div>
        </section>
      </main>
      <SiteFooter whatsappHref={whatsappHref} />
    </>
  );
}
