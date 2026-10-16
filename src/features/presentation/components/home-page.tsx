import Image from 'next/image';
import { SiteFooter, SiteHeader } from './site-chrome';
import { ActionIcon } from './action-icon';
import { Flourish } from './flourish';
import { FloatingWhatsApp } from './floating-whatsapp';
import { MexicanOrnament } from './mexican-ornament';

const specialties = [
  { name: 'Fajitas', image: 'fajitas', color: 'red', detail: 'Una propuesta de fajitas con vegetales y acompañamientos para compartir. Ingredientes y presentación por confirmar.' },
  { name: 'Taquiza', image: 'taquiza', color: 'green', detail: 'Tortillas, variedad de sabores y el color de la cocina mexicana. Opciones y acompañamientos por confirmar.' },
  { name: 'Entradas para compartir', image: 'entradas', color: 'yellow', detail: 'Una propuesta de entradas para el centro de la mesa. Productos e ingredientes sujetos a la carta aprobada.' },
] as const;

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <span className="hero-side-textile" aria-hidden="true" />
          <div className="hero-photo">
            <Image src="/reference/hero.webp" width={587} height={283} alt="Imagen conceptual de fajitas y acompañamientos, extraída de la referencia; no es un plato verificado del restaurante" priority unoptimized />
          </div>
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1 id="hero-title">Sabor Mexicano<br /><span>en Cada Encuentro</span></h1>
              <p>Fajitas, taquizas y mucho más. Una propuesta Tex-Mex para disfrutar de una mesa cálida y llena de color.</p>
              <div className="hero-actions">
                <a href="#carta" className="button"><ActionIcon kind="menu" />Ver menú</a>
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
              <p>Los sabores que nos inspiran, con un toque Tex-Mex.</p>
            </div>
            <div className="specialty-grid">
              {specialties.map((item) => (
                <article className="specialty-card" key={item.image}>
                  <Image className="card-photo" src={`/reference/${item.image}.webp`} width={339} height={147} alt={`${item.name}: imagen conceptual de referencia, no corresponde a una oferta confirmada`} unoptimized />
                  <div className="card-copy">
                    <h3 className={`brush brush-${item.color}`}>{item.name}</h3>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="section-note">Carta pendiente de aprobación · Categorías e imágenes de referencia, sin precios ni disponibilidad confirmados.</p>
          </div>
        </section>
        <section id="nosotros" className="essence" aria-labelledby="essence-title">
          <div className="essence-image">
            <Image className="essence-backdrop" src="/reference/esencia-brandless.webp" width={576} height={231} alt="Composición decorativa de madera y textiles mexicanos; no es una fotografía del local" unoptimized />
            <span className="essence-logo-frame"><Image className="essence-logo" src="/brand/la-lupe.png" width={232} height={232} sizes="240px" loading="eager" alt="Logotipo original de La Lupe · Cocina mexicana" /></span>
          </div>
          <div className="essence-copy">
            <h2 id="essence-title" className="flourish"><Flourish /><span>Nuestra Esencia</span><Flourish mirrored /></h2>
            <p>Una mesa cálida, mucho color y la inspiración de la cocina mexicana: así se presenta el concepto visual de La Lupe.</p>
            <p className="editorial-note">La historia y descripción del restaurante están pendientes de aprobación.</p>
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
              <p>Dirección y ubicación por confirmar</p>
            </div>
            <div className="contact-details">
              <p><ActionIcon kind="clock" /><span>Horarios por confirmar</span></p>
              <button type="button" disabled aria-describedby="contact-status"><ActionIcon kind="whatsapp" />WhatsApp no disponible</button>
              <p id="contact-status">Datos de contacto pendientes: falta confirmar el número y los perfiles oficiales.</p>
            </div>
            <Image className="village-art" src="/reference/village.webp" width={270} height={85} alt="" unoptimized />
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  );
}
