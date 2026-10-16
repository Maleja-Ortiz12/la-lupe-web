export function Flourish({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg className={`flourish-garnish${mirrored ? ' flourish-garnish-mirrored' : ''}`} viewBox="0 0 52 44" aria-hidden="true" focusable="false">
      <path d="M34 29C23 27 5 9 9 4C16-4 31 12 34 29Z" fill="#a9231c" />
      <path d="M32 34C21 38 0 36 1 29C3 21 22 26 32 34Z" fill="#2e633e" />
      <path d="M39 28C35 17 37 2 43 4C52 9 45 23 39 28Z" fill="#2e633e" />
    </svg>
  );
}
