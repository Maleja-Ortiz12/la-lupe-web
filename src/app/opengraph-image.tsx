import { ImageResponse } from 'next/og';

export const alt = 'La Lupe · Comida mexicana en Chía · Demo local';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Social preview only; this artwork does not change the website's visible design.
export default function Image() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: 80, background: '#fff1d1', color: '#4b3021', borderTop: '24px solid #a33a25', borderBottom: '24px solid #28756d' }}>
      <div style={{ display: 'flex', fontSize: 30, color: '#28756d', marginBottom: 26 }}>DEMO LOCAL · CONTENIDO DE EJEMPLO</div>
      <div style={{ display: 'flex', fontSize: 100, fontWeight: 700, color: '#a33a25' }}>LA LUPE</div>
      <div style={{ display: 'flex', fontSize: 56, marginTop: 18 }}>Comida mexicana en Chía</div>
      <div style={{ display: 'flex', fontSize: 32, marginTop: 24 }}>Inspiración de México · Cundinamarca, Colombia</div>
    </div>,
    size,
  );
}
