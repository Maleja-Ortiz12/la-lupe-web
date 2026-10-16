'use client';

import { useState } from 'react';
import { ActionIcon } from './action-icon';

export function FloatingWhatsApp() {
  const [paused, setPaused] = useState(false);

  return (
    <aside className="whatsapp-float" data-motion={paused ? 'paused' : 'running'} aria-label="WhatsApp de demostración">
      <span id="whatsapp-float-status" className="whatsapp-float-hint">WhatsApp · Próximamente</span>
      <div className="whatsapp-float-control">
        <button className="whatsapp-float-button" type="button" disabled aria-label="WhatsApp no disponible: número pendiente de confirmación" aria-describedby="whatsapp-float-status">
          <ActionIcon kind="whatsapp" />
        </button>
        <button className="motion-toggle" type="button" aria-label={paused ? 'Reanudar animación de WhatsApp' : 'Pausar animación de WhatsApp'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            {paused ? <path d="m7 4 9 6-9 6Z" fill="currentColor" /> : <path d="M6 4h3v12H6Zm5 0h3v12h-3Z" fill="currentColor" />}
          </svg>
        </button>
      </div>
    </aside>
  );
}
