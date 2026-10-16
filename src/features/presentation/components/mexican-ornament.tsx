export function MexicanOrnament({ compact = false }: { compact?: boolean }) {
  return (
    <svg className={compact ? 'mexican-ornament compact' : 'mexican-ornament'} data-ornament="mexican" viewBox="0 0 250 28" aria-hidden="true" focusable="false">
      <path d="M3 14h49m146 0h49" stroke="#28756d" strokeWidth="2" />
      <path d="m69 10 4 4-4 4-4-4Zm24 0 4 4-4 4-4-4Zm64 0 4 4-4 4-4-4Zm24 0 4 4-4 4-4-4Z" fill="#a33a25" />
      <path d="m125 3 11 11-11 11-11-11Z" fill="none" stroke="#a33a25" strokeWidth="2" />
      <path d="m125 9 5 5-5 5-5-5Z" fill="#ca9c42" />
      <circle cx="82" cy="14" r="2" fill="#28756d" /><circle cx="168" cy="14" r="2" fill="#28756d" />
    </svg>
  );
}
