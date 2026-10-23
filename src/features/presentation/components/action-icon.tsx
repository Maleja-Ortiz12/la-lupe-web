type IconKind = 'menu' | 'contact' | 'location' | 'clock' | 'whatsapp' | 'phone' | 'delivery';

export function ActionIcon({ kind }: { kind: IconKind }) {
  return (
    <svg className="action-icon" data-icon={kind} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'menu' && <path d="M4 3v6m3-6v6m3-6v6M4 7h6M7 9v12M18 3c-3 3-3 7 0 8v10M18 3v8" />}
      {kind === 'contact' && <><path d="M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z" /><path d="M7 9h10M7 13h7" /></>}
      {kind === 'location' && <><path d="M12 23S4 13 4 9a8 8 0 0 1 16 0c0 4-8 14-8 14Z" fill="currentColor" stroke="none" /><circle cx="12" cy="9" r="3" fill="#246d74" stroke="none" /></>}
      {kind === 'phone' && <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" />}
      {kind === 'delivery' && <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M9 17h6l-2-6H8M15 17l2-8h3M5 11h4" /></>}
      {kind === 'clock' && <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>}
      {kind === 'whatsapp' && <><path d="M3.6 17.2 2 22l5-1.5a10 10 0 1 0-3.4-3.3Z" /><path d="M8.3 6.2c-.4-.2-1.1-.2-1.5.3-.8.9-1 2.4-.4 3.9 1.1 2.8 3.6 5.4 6.5 6.4 1.5.5 3 .2 3.9-.8.4-.4.5-1 .2-1.3l-2.4-1.2c-.4-.2-.6.2-1.2.9-1.8-.6-3.4-2.1-4.1-3.9.7-.6 1.1-1 .8-1.5L9 6.7c-.2-.3-.4-.4-.7-.5Z" fill="currentColor" stroke="none" /></>}
    </svg>
  );
}
