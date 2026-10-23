import { ActionIcon } from './action-icon';
import { WhatsAppLink } from './whatsapp-link';

export function FloatingWhatsApp({ href }: { href: string | null }) {
  return (
    <aside className="whatsapp-float" aria-label="WhatsApp">
      {!href && <span id="whatsapp-float-status" className="whatsapp-float-hint">WhatsApp · Próximamente</span>}
      <div className="whatsapp-float-control">
        <WhatsAppLink
          href={href}
          className="whatsapp-float-button"
          label={href ? 'Escríbenos por WhatsApp' : 'WhatsApp no disponible: número pendiente de confirmación'}
          describedBy="whatsapp-float-status"
        >
          <ActionIcon kind="whatsapp" />
        </WhatsAppLink>
      </div>
    </aside>
  );
}
