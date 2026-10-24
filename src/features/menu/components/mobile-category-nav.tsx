'use client';

import { useEffect, useRef, useState } from 'react';
import { MenuCategoryIcon, type SidebarSection } from './menu-sidebar';

export function MobileCategoryNav({ sections }: { sections: readonly SidebarSection[] }) {
  const [current, setCurrent] = useState(sections[0]?.id);
  const strip = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const interacting = useRef(false);

  useEffect(() => {
    const media = matchMedia('(max-width: 760px)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!media.matches || interacting.current) return;
      const targets = sections.map(section => document.getElementById(section.id)).filter((target): target is HTMLElement => Boolean(target));
      // Include the space reserved by anchor scrolling above each section heading.
      const anchorOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + parseFloat(targets[0] ? getComputedStyle(targets[0]).scrollMarginTop : '0');
      const edge = Math.max((nav.current?.getBoundingClientRect().height ?? 88) + 24, anchorOffset + 4);
      let selected: string | undefined = targets[0]?.id;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= edge) selected = target.id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) selected = targets.at(-1)?.id;
      if (selected) setCurrent(selected);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // A drag may end outside the strip: release the guard even when that happens.
    const releasePointer = () => { interacting.current = false; schedule(); };
    window.addEventListener('pointerup', releasePointer);
    window.addEventListener('pointercancel', releasePointer);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
    };
  }, [sections]);

  useEffect(() => {
    const element = strip.current;
    const active = element?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!element || !active || interacting.current || !matchMedia('(max-width: 760px)').matches) return;
    const viewport = element.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    // Only scroll the horizontal strip: scrollIntoView would also move the page being read.
    const delta = item.left < viewport.left + 8 ? item.left - viewport.left - 8 : item.right > viewport.right - 8 ? item.right - viewport.right + 8 : 0;
    if (delta) element.scrollTo({ left: element.scrollLeft + delta, behavior: 'instant' });
  }, [current]);

  return (
    <nav className="menu-category-nav" aria-label="Categorías del menú" ref={nav} onPointerDownCapture={() => { interacting.current = true; }} onPointerUp={() => { interacting.current = false; }} onPointerCancel={() => { interacting.current = false; }}>
      <div className="menu-category-heading"><span>Categorías</span><span aria-hidden="true">Desliza para explorar <span>→</span></span></div>
      <div className="menu-category-strip" ref={strip}>
        {sections.map(section => (
          <a key={section.id} href={`#${section.id}`} aria-current={section.id === current ? 'location' : undefined} onClick={() => setCurrent(section.id)}>
            <MenuCategoryIcon id={section.id} /><span>{section.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
