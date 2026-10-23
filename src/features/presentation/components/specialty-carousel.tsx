'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

const AUTOPLAY_MS = 7000;
const PHONE_QUERY = '(max-width: 760px)';

// Nuestras Especialidades: a wrapping grid on tablet/desktop; on phones a swipeable carousel that
// advances every 7 seconds, loops, pauses while touched/focused/hovered and can be paused (WCAG 2.2.2).
export function SpecialtyCarousel({ children }: { children: ReactNode }) {
  const grid = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || engaged || reducedMotion) return;
    const timer = setInterval(() => {
      const element = grid.current;
      if (!element || !matchMedia(PHONE_QUERY).matches || document.visibilityState !== 'visible') return;
      const cards = [...element.children] as HTMLElement[];
      if (cards.length < 2) return;
      const start = element.getBoundingClientRect().left;
      const current = cards.reduce((best, card, index) =>
        Math.abs(card.getBoundingClientRect().left - start) < Math.abs(cards[best].getBoundingClientRect().left - start) ? index : best, 0);
      const next = cards[(current + 1) % cards.length];
      element.scrollTo({ left: element.scrollLeft + next.getBoundingClientRect().left - start, behavior: 'smooth' });
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, engaged, reducedMotion]);

  return (
    <div className="specialty-carousel">
      <div
        ref={grid}
        className="specialty-grid"
        role="group"
        aria-label="Nuestras Especialidades: desliza para ver más"
        onPointerEnter={() => setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
        onTouchStart={() => setEngaged(true)}
        onTouchEnd={() => setEngaged(false)}
        onFocus={() => setEngaged(true)}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEngaged(false); }}
      >
        {children}
      </div>
      {!reducedMotion && (
        <button type="button" className="carousel-pause" onClick={() => setPaused(value => !value)}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            {paused ? <path d="m7 4 9 6-9 6Z" fill="currentColor" /> : <path d="M6 4h3v12H6Zm5 0h3v12h-3Z" fill="currentColor" />}
          </svg>
          <span>{paused ? 'Reanudar' : 'Pausar'}</span><span className="visually-hidden"> avance automático de especialidades</span>
        </button>
      )}
    </div>
  );
}
