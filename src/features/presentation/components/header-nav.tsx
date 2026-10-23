'use client';

import { useEffect, useRef, useState } from 'react';

export type HeaderNavLink = { href: string; label: string; current: boolean };

// Main navigation: inline on tablet/desktop, collapsed behind a hamburger button on phones (CSS ≤700px).
export function HeaderNav({ links }: { links: readonly HeaderNavLink[] }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div className="header-nav" ref={wrapper}>
      <button ref={toggle} type="button" className="nav-toggle" aria-controls="site-nav" aria-expanded={open} aria-label={open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'} onClick={() => setOpen(value => !value)}>
        <svg className="nav-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <nav id="site-nav" aria-label="Navegación principal" data-open={open}>
        {links.map(link => (
          <a href={link.href} key={link.href} aria-current={link.current ? 'page' : undefined} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
      </nav>
    </div>
  );
}
