import Image from 'next/image';
import { SiteHeader, SiteFooter } from '@/features/presentation/components/site-chrome';
import { Flourish } from '@/features/presentation/components/flourish';
import { MexicanOrnament } from '@/features/presentation/components/mexican-ornament';

const essenceStory = [
  {
    title: 'Para compartir',
    text: 'Nachos, guacamole con chicharrón, esquite y la entrada mixta para poner al centro de la mesa.',
    image: '/dishes/guacamole-con-chicharron.webp',
    alt: 'Entradas mexicanas para compartir',
  },
  {
    title: 'Tacos y taquizas',
    text: 'Tacos al pastor, carnitas, birria, cochinita y más, y taquizas para 2, 4 o 6 personas.',
    image: '/dishes/taquiza-e4ea759b.webp',
    alt: 'Taquiza con tortillas y salsas',
  },
  {
    title: 'Fajitas a tu gusto',
    text: 'Fajitas de pollo, carne o mixtas, en media orden u orden completa, con sus acompañamientos.',
    image: '/dishes/fajitas.webp',
    alt: 'Fajitas con acompañamientos',
  },
] as const;

export function EssencePage() {
  return (<>
    <SiteHeader page="essence" />
    <main id="contenido">
        <section id="nosotros" className="essence" aria-labelledby="essence-title">
          <div className="essence-image">
            <Image className="essence-backdrop" src="/reference/esencia-brandless.webp" width={576} height={231} alt="Composición decorativa de madera y textiles mexicanos" unoptimized />
            <span className="essence-logo-frame"><Image className="essence-logo" src="/brand/la-lupe.png" width={232} height={232} sizes="240px" loading="eager" alt="Logotipo original de La Lupe · Cocina mexicana" /></span>
          </div>
          <div className="essence-copy">
            <h1 id="essence-title" className="flourish"><Flourish /><span>Nuestra Esencia</span><Flourish mirrored /></h1>
            <p>La Lupe empieza cada vez que alguien corre una silla para hacerle espacio a otro. En nuestra pequeña leyenda, las tortillas marcan el ritmo, las salsas ponen el carácter y el primer taco siempre trae una conversación nueva.</p>
            <p>Hay mesas que se recuerdan por una receta. La nuestra quiere quedarse en la memoria por ese momento en que un plato llega al centro, todos prueban algo y la sobremesa se alarga un taco más. Ese es nuestro México: el que se comparte aquí, en Chía.</p>
            <p>Encuéntranos en Cl. 2 #11-80, Chía, o pide a domicilio en Cota y Chía por WhatsApp.</p>
            <MexicanOrnament />
            <Image className="essence-deco essence-deco-gecko" src="/reference/essence-gecko.webp" width={109} height={118} alt="" unoptimized />
            <Image className="essence-deco essence-deco-agave" src="/reference/essence-agave.webp" width={115} height={85} alt="" unoptimized />
            <Image className="essence-deco essence-deco-hat" src="/reference/essence-hat.webp" width={89} height={52} alt="" unoptimized />
          </div>
          <div className="container essence-story">
            <p className="essence-story-intro">Lo que encuentras en nuestra carta.</p>
            <div className="essence-story-grid">
              {essenceStory.map((chapter, index) => (
                <article className="essence-story-card" key={chapter.image}>
                  <figure>
                    <Image src={chapter.image} width={339} height={147} alt={chapter.alt} unoptimized />
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
