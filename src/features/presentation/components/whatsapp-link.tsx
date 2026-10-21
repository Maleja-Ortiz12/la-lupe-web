import type { ReactNode } from 'react';

type WhatsAppLinkProps = {
  href: string | null;
  className?: string;
  label?: string;
  describedBy?: string;
  children: ReactNode;
};

// Renders a real chat link once a number is configured, otherwise a disabled button with no destination.
export function WhatsAppLink({ href, className, label, describedBy, children }: WhatsAppLinkProps) {
  if (href) {
    return <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>{children}</a>;
  }
  return <button className={className} type="button" disabled aria-label={label} aria-describedby={describedBy}>{children}</button>;
}
