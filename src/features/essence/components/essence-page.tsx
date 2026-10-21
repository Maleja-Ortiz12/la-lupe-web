import Image from 'next/image';
import { SiteHeader, SiteFooter } from '@/features/presentation/components/site-chrome';
import { Flourish } from '@/features/presentation/components/flourish';
import { MexicanOrnament } from '@/features/presentation/components/mexican-ornament';

const essenceStory = [
  {
    title: 'Todo empieza en una mesa',
    text: 'En esta historia imaginada, todo comenzó con una comida entre amigos. Entre tortillas, conversaciones largas y platos al centro, apareció una pregunta: ¿y si pudiéramos compartir esta sensación con más personas?',
    image: 'entradas',
    alt: 'Entradas para compartir en una composición conceptual de cocina mexicana',
  },
  {
    title: 'Una idea con sabor a México',
    text: 'La idea tomó forma alrededor de los colores, los aromas y la alegría de la cocina mexicana. Así imaginamos La Lupe: un lugar cercano, donde cada mesa invita a probar algo distinto y quedarse un rato más.',
    image: 'taquiza',
    alt: 'Taquiza en una imagen conceptual inspirada en los sabores de México',
  },
  {
    title: 'Lo que queremos compartir',
    text: 'Más que una comida, imaginamos un encuentro. Una mesa para celebrar lo cotidiano, compartir los sabores y hacer espacio para una buena conversación. Ese es el espíritu que proponemos contar con La Lupe.',
    image: 'fajitas',
    alt: 'Fajitas con acompañamientos en una composición gastronómica de referencia',
  },
] as const;

export function EssencePage() {
  return (<>
    <SiteHeader page="essence" />
    <main id="contenido">
        <section id="nosotros" className="essence" aria-labelledby="essence-title">
          <div className="essence-image">
            <Image className="essence-backdrop" src="/reference/esencia-brandless.webp" width={576} height={231} alt="Composición decorativa de madera y textiles mexicanos; no es una fotografía del local" unoptimized />
            <span className="essence-logo-frame"><Image className="essence-logo" src="/brand/la-lupe.png" width={232} height={232} sizes="240px" loading="eager" alt="Logotipo original de La Lupe · Cocina mexicana" /></span>
          </div>
          <div className="essence-copy">
            <h1 id="essence-title" className="flourish"><Flourish /><span>Nuestra Esencia</span><Flourish mirrored /></h1>
            <p>Las mejores historias se comparten alrededor de una mesa. La nuestra, por ahora imaginada, comienza con las ganas de reunirnos y el sabor de México como inspiración.</p>
            <p className="editorial-note">Historia de ejemplo · No corresponde a la historia real del restaurante. Texto pendiente de aprobación.</p>
            <MexicanOrnament />
            <Image className="essence-deco essence-deco-gecko" src="/reference/essence-gecko.webp" width={109} height={118} alt="" unoptimized />
            <Image className="essence-deco essence-deco-agave" src="/reference/essence-agave.webp" width={115} height={85} alt="" unoptimized />
            <Image className="essence-deco essence-deco-hat" src="/reference/essence-hat.webp" width={89} height={52} alt="" unoptimized />
          </div>
          <div className="container essence-story">
            <p className="essence-story-intro">Una mesa, una idea y muchas ganas de compartir.</p>
            <div className="essence-story-grid">
              {essenceStory.map((chapter, index) => (
                <article className="essence-story-card" key={chapter.image}>
                  <figure>
                    <Image src={`/reference/${chapter.image}.webp`} width={339} height={147} alt={chapter.alt} unoptimized />
                    <figcaption>Imagen de referencia</figcaption>
                  </figure>
                  <div className="essence-story-copy">
                    <span className="essence-story-number" aria-hidden="true">0{index + 1}</span>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
    </main>
    <SiteFooter page="essence" />
  </>);
}
