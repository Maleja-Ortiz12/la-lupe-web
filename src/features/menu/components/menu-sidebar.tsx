'use client';

import { useEffect, useState } from 'react';

export type SidebarSection = { id: string; label: string };

// Simple line icons for the desktop "Categorías" sidebar (template: Menú La Lupe con pedido cerrado).
const icons: Record<string, string> = {
  'platos-estrella': 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z',
  entradas: 'M3 12h18a9 6 0 0 1-18 0ZM7 12l2-6M11 12l1-7M15 12l-1-6M18 12l-2-5',
  sopas: 'M3 12h18a9 7 0 0 1-18 0ZM9 9c-1-1.5 1-2.5 0-4M13 9c-1-1.5 1-2.5 0-4M17 9c-1-1.5 1-2.5 0-4',
  fajitas: 'M6 18c-3-4 1-11 8-12 2 0 4 1 5 3-2 0-3 1-4 3-2 4-5 7-9 6ZM17 5c0-1.5 1-2.5 2.5-2.5',
  'tacos-y-taquiza': 'M3 17a9 9 0 0 1 18 0ZM7 13l1 1M11 11l1 1M15 12l1 1',
  carnes: 'M5 9c1-3 5-4 8-3 4 1 7 4 6 8-1 3-5 5-9 4-3-1-6-3-5-6 0-1 0-2 0-3ZM14 12a2 2 0 1 0 0 .1',
  'mero-mexico': 'M12 20V8M12 20c-3-2-5-6-5-11 2 2 4 5 5 8M12 20c3-2 5-6 5-11-2 2-4 5-5 8M12 20c-4-1-7-4-8-7 3 1 6 3 8 6M12 20c4-1 7-4 8-7-3 1-6 3-8 6',
  bebidas: 'M7 7h10l-1.5 13h-7ZM12 7l3-4h3M8 11h8',
  'cocteles-y-chelas': 'M5 4h14l-7 8ZM12 12v7M8 20h8M15 4l3-2',
  postres: 'M4 18h16v-6L4 12ZM4 12l16-4v4M8 9.5V7M12 8.5V6',
};

// Sticky desktop navigation that marks the section currently in view (phones use the pill navigation).
export function MenuSidebar({ sections }: { sections: readonly SidebarSection[] }) {
  const [current, setCurrent] = useState(sections[0]?.id);

  useEffect(() => {
    const targets = sections.map(section => document.getElementById(section.id)).filter((element): element is HTMLElement => Boolean(element));
    // A thin band near the top of the viewport decides which section is being read.
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setCurrent(visible[0].target.id);
    }, { rootMargin: '-25% 0px -70% 0px' });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="menu-sidebar">
      <p className="menu-sidebar-title" id="menu-sidebar-title">Categorías</p>
      <nav aria-labelledby="menu-sidebar-title">
        <ul>
          {sections.map(section => (
            <li key={section.id}>
              <a aria-current={section.id === current ? 'location' : undefined} href={`#${section.id}`} onClick={() => setCurrent(section.id)}>
                <svg className="menu-sidebar-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={icons[section.id] ?? icons['platos-estrella']} /></svg>
                <span>{section.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
