'use client';

import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactElement, type ReactNode } from 'react';

const AUTOPLAY_MS = 5000;
const PHONE_QUERY = '(max-width: 760px)';
const subscribeNever = () => () => {};

// Nuestras Especialidades: a single horizontal row (3 cards from 761px, 1 on phones) that advances every
// 5 seconds by 2 cards (1 on phones) and loops forever. After hydration the cards are rendered three times;
// the outer copies are inert clones, and whenever the row settles on a clone it is silently re-anchored on
// the matching real card. Autoplay pauses while touched/focused/hovered and can be paused (WCAG 2.2.2).
export function SpecialtyCarousel({ children }: { children: ReactNode }) {
  const grid = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<Record<string, unknown>>[];
  const count = items.length;
  // False on the server and during hydration, true afterwards: without JavaScript the row simply scrolls
  // through the real cards, and the loop clones only appear once the client can re-anchor them.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  const looping = hydrated && count > 1;
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

  useLayoutEffect(() => {
    const element = grid.current;
    if (!looping || !element) return;
    const offsets = () => {
      const cards = [...element.children] as HTMLElement[];
      return cards.map(card => card.offsetLeft - cards[0].offsetLeft);
    };
    const nearest = () => {
      const positions = offsets();
      return positions.reduce((best, position, index) =>
        Math.abs(position - element.scrollLeft) < Math.abs(positions[best] - element.scrollLeft) ? index : best, 0);
    };
    const jump = (index: number) => {
      element.style.scrollBehavior = 'auto';
      element.scrollLeft = offsets()[index];
      element.style.scrollBehavior = '';
    };
    // Keep the visible position on the middle (real) copy so the row can always continue either way.
    const reanchor = () => {
      const index = nearest();
      if (index < count) jump(index + count);
      else if (index >= 2 * count) jump(index - count);
    };
    jump(count);
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => { clearTimeout(settle); settle = setTimeout(reanchor, 150); };
    element.addEventListener('scroll', onScroll, { passive: true });
    const resize = new ResizeObserver(() => { clearTimeout(settle); settle = setTimeout(reanchor, 150); });
    resize.observe(element);
    return () => { clearTimeout(settle); element.removeEventListener('scroll', onScroll); resize.disconnect(); };
  }, [looping, count]);

  useEffect(() => {
    if (!looping || paused || engaged || reducedMotion) return;
    const timer = setInterval(() => {
      const element = grid.current;
      if (!element || document.visibilityState !== 'visible') return;
      const cards = [...element.children] as HTMLElement[];
      const positions = cards.map(card => card.offsetLeft - cards[0].offsetLeft);
      const current = positions.reduce((best, position, index) =>
        Math.abs(position - element.scrollLeft) < Math.abs(positions[best] - element.scrollLeft) ? index : best, 0);
      const step = matchMedia(PHONE_QUERY).matches ? 1 : 2;
      const target = Math.min(current + step, positions.length - 1);
      element.scrollTo({ left: positions[target], behavior: 'smooth' });
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [looping, paused, engaged, reducedMotion]);

  const clones = (copy: string) => items.map(item =>
    cloneElement(item, { key: `${copy}-${String(item.key)}`, 'aria-hidden': true, inert: true, 'data-clone': '' }));

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
        {looping ? [...clones('before'), ...items, ...clones('after')] : items}
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
