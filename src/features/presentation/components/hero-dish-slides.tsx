'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const INTERVAL_MS = 5000;

// The six most eye-catching real dishes for the "Sabor Mexicano" hero (odd/tasks/home-hero-specialties.md S2).
const slides = [
  { src: '/dishes/fajitas.webp', alt: 'Fajitas Famosas de La Lupe con carne, pollo, pimentones asados y arroz' },
  { src: '/dishes/tacos-de-birria.webp', alt: 'Tacos de birria de La Lupe con su consomé, cebolla y cilantro' },
  { src: '/dishes/nachos-grandes.webp', alt: 'Nachos grandes de La Lupe con frijoles, carne, queso cheddar, guacamole y crema agria' },
  { src: '/dishes/carne-a-la-tampiquena.webp', alt: 'Carne a la tampiqueña de La Lupe con enchilada verde, arroz y frijoles' },
  { src: '/dishes/entrada-mixta.webp', alt: 'Entrada mixta de La Lupe con flautas, quesadillas y fajita nachos' },
  { src: '/dishes/taquiza-e4ea759b.webp', alt: 'Taquiza de La Lupe con carne, limón, tortillas y cervezas Sol' },
] as const;

// Cross-fades one photo every 5 seconds; pauses while hovered or focused, can be paused (WCAG 2.2.2) and stays
// on the first photo when the visitor prefers reduced motion.
export function HeroDishSlides() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || reducedMotion) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') setActive(index => (index + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, hovered, focused, reducedMotion]);

  return (
    <div className="hero-photo" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          className={`hero-slide${index === active ? ' is-active' : ''}`}
          src={slide.src}
          width={960}
          height={720}
          sizes="(max-width: 600px) 100vw, 60vw"
          alt={slide.alt}
          aria-hidden={index === active ? undefined : true}
          priority={index === 0}
        />
      ))}
      {!reducedMotion && (
        <button
          type="button"
          className="hero-pause"
          aria-label={paused ? 'Reanudar fotos de platos' : 'Pausar fotos de platos'}
          aria-pressed={paused}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={() => setPaused(value => !value)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            {paused ? <path d="m7 4 9 6-9 6Z" fill="currentColor" /> : <path d="M6 4h3v12H6Zm5 0h3v12h-3Z" fill="currentColor" />}
          </svg>
        </button>
      )}
    </div>
  );
}
