'use client';

import { useState } from 'react';
import { ActionIcon } from './action-icon';
import { WhatsAppLink } from './whatsapp-link';

export function FloatingWhatsApp({ href }: { href: string | null }) {
  const [paused, setPaused] = useState(false);

  return (
    <aside className="whatsapp-float" data-motion={paused ? 'paused' : 'running'} aria-label={href ? 'WhatsApp' : 'WhatsApp de demostración'}>
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
        <button className="motion-toggle" type="button" aria-label={paused ? 'Reanudar animación de WhatsApp' : 'Pausar animación de WhatsApp'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            {paused ? <path d="m7 4 9 6-9 6Z" fill="currentColor" /> : <path d="M6 4h3v12H6Zm5 0h3v12h-3Z" fill="currentColor" />}
          </svg>
        </button>
      </div>
    </aside>
  );
}
