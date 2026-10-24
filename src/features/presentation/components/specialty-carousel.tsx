'use client';

import { Children, cloneElement, isValidElement, useLayoutEffect, useRef, useSyncExternalStore, type ReactElement, type ReactNode } from 'react';

const PHONE_QUERY = '(max-width: 760px)';
const subscribeNever = () => () => {};

// Scroll position of every card relative to the first one, and the card currently at the start of the row.
const offsets = (element: HTMLElement) => {
  const cards = [...element.children] as HTMLElement[];
  return cards.map(card => card.offsetLeft - cards[0].offsetLeft);
};
const nearest = (element: HTMLElement) => {
  const positions = offsets(element);
  return positions.reduce((best, position, index) =>
    Math.abs(position - element.scrollLeft) < Math.abs(positions[best] - element.scrollLeft) ? index : best, 0);
};

// Nuestras Especialidades: a single horizontal row (3 cards from 761px, 1 on phones) that the visitor moves by
// swiping or with the ‹ › buttons (2 cards per step from 761px, 1 on phones); it never moves by itself
// (odd/tasks/home-hero-specialties.md S3). After hydration the cards are rendered three times; the outer copies
// are inert clones, and whenever the row settles on a clone it is silently re-anchored on the matching real card,
// so the row continues endlessly in both directions.
export function SpecialtyCarousel({ children }: { children: ReactNode }) {
  const grid = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<Record<string, unknown>>[];
  const count = items.length;
  // False on the server and during hydration, true afterwards: without JavaScript the row simply scrolls
  // through the real cards, and the loop clones only appear once the client can re-anchor them.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  const looping = hydrated && count > 1;

  useLayoutEffect(() => {
    const element = grid.current;
    if (!looping || !element) return;
    const jump = (index: number) => {
      element.style.scrollBehavior = 'auto';
      element.scrollLeft = offsets(element)[index];
      element.style.scrollBehavior = '';
    };
    // Keep the visible position on the middle (real) copy so the row can always continue either way.
    const reanchor = () => {
      const index = nearest(element);
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

  const move = (direction: 1 | -1) => {
    const element = grid.current;
    if (!element) return;
    const positions = offsets(element);
    const step = matchMedia(PHONE_QUERY).matches ? 1 : 2;
    const target = Math.min(Math.max(nearest(element) + direction * step, 0), positions.length - 1);
    element.scrollTo({ left: positions[target], behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const clones = (copy: string) => items.map(item =>
    cloneElement(item, { key: `${copy}-${String(item.key)}`, 'aria-hidden': true, inert: true, 'data-clone': '' }));

  return (
    <div className="specialty-carousel">
      <div ref={grid} className="specialty-grid" role="group" aria-label="Nuestras Especialidades: desliza para ver más">
        {looping ? [...clones('before'), ...items, ...clones('after')] : items}
      </div>
      <div className="specialty-controls">
        <button type="button" className="specialty-arrow specialty-arrow-prev" aria-label="Ver especialidades anteriores" onClick={() => move(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m14.5 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <p className="specialty-hint">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 11V6a1.6 1.6 0 0 1 3.2 0v4.5m0-1.8a1.6 1.6 0 0 1 3.2 0v2m0-1a1.6 1.6 0 0 1 3.2 0v4.3c0 3.6-2.4 6-6 6h-1.2a5 5 0 0 1-4.2-2.3L4.6 14a1.6 1.6 0 0 1 2.6-1.9L9 14.3M3 4.5h4M3 4.5l1.6-1.6M3 4.5l1.6 1.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span>Desliza para ver más productos</span>
        </p>
        <button type="button" className="specialty-arrow specialty-arrow-next" aria-label="Ver más especialidades" onClick={() => move(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9.5 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
