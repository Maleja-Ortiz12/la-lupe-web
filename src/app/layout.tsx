import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import '../shared/styles/tokens.css';
import './globals.css';

export { metadata } from './page-metadata';

const brushFont = localFont({
  src: './fonts/CaveatBrush-Regular.ttf',
  variable: '--font-brush',
  display: 'swap',
});

const heroFont = localFont({
  src: './fonts/Chewy-Regular.ttf',
  variable: '--font-hero',
  display: 'swap',
});

const readingFont = localFont({
  src: [
    { path: './fonts/FiraSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/FiraSans-Medium.ttf', weight: '500', style: 'normal' },
  ],
  variable: '--font-reading',
  display: 'swap',
});

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={`${brushFont.variable} ${heroFont.variable} ${readingFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
