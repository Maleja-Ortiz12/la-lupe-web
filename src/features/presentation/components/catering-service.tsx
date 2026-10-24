import Image from 'next/image';
import { ActionIcon } from './action-icon';
import { Flourish } from './flourish';
import { WhatsAppLink } from './whatsapp-link';
import { contact, whatsappMessages, whatsappUrl } from '@/shared/config/contact';

// Owner's photos of a "Fiestas en casa" buffet (odd/tasks/new-photos-catering.md, S2), processed by
// scripts/process-dishes.mjs. No prices or conditions are published: the quote happens on WhatsApp.
const photos = [
  { src: '/catering/fiestas-en-casa-1.webp', alt: 'Mesa de catering de La Lupe con taquiza, tortillas, salsas y flores' },
  { src: '/catering/fiestas-en-casa-2.webp', alt: 'Buffet de La Lupe para una fiesta en casa, servido sobre manteles mexicanos' },
  { src: '/catering/fiestas-en-casa-3.webp', alt: 'Catering de La Lupe al aire libre con papel picado y platos para los invitados' },
] as const;

// Additional service shown below the home specialties and at the end of the menu.
export function CateringService({ whatsappNumber = contact.whatsappNumber, variant = 'home' }: { whatsappNumber?: string; variant?: 'home' | 'menu' }) {
  const href = whatsappUrl(whatsappNumber, whatsappMessages.catering);
  return (
    <section id="catering" className={variant === 'menu' ? 'catering menu-section' : 'catering'} aria-labelledby="catering-title">
      <div className={variant === 'menu' ? 'catering-inner' : 'container catering-inner'}>
        <div className="catering-copy">
          <p className="catering-kicker">Catering · Servicio adicional</p>
          {variant === 'menu'
            ? <h2 id="catering-title" className="menu-title"><Flourish /><span>Fiestas en casa</span></h2>
            : <h2 id="catering-title" className="flourish"><Flourish /><span>Fiestas en casa</span><Flourish mirrored /></h2>}
          <p>Llevamos el sabor de La Lupe a tu celebración: taquiza, salsas y nuestros platos favoritos, servidos para tus invitados en casa.</p>
          <p>Cuéntanos la fecha y cuántas personas serán, y te enviamos una cotización.</p>
          <WhatsAppLink href={href} className="button button-whatsapp catering-cta" describedBy="catering-status">
            <ActionIcon kind="whatsapp" />Cotizar por WhatsApp
          </WhatsAppLink>
          {!href && <p id="catering-status" className="catering-status">WhatsApp no disponible por ahora; llámanos a cualquiera de nuestros teléfonos.</p>}
        </div>
        <ul className="catering-gallery" aria-label="Fotos de nuestro servicio de catering">
          {photos.map(photo => (
            <li key={photo.src}><Image src={photo.src} width={720} height={960} sizes="(max-width: 760px) 70vw, 240px" alt={photo.alt} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
