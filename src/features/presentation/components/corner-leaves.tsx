// Decorative palm fronds for the top-left corner, matching the reference composition.
const fronds = [
  { angle: -6, length: 132, color: '#3f8a3c' },
  { angle: 20, length: 120, color: '#4f9a44' },
  { angle: 46, length: 108, color: '#357a37' },
  { angle: 72, length: 92, color: '#5aa34a' },
] as const;

export function CornerLeaves() {
  return (
    <svg className="corner-leaves" viewBox="0 0 150 150" aria-hidden="true" focusable="false">
      {fronds.map(({ angle, length, color }) => (
        <g key={angle} transform={`rotate(${angle} 4 4)`}>
          <path d={`M4 4 Q${length * 0.55} 14 ${length} 6`} stroke="#3c5a24" strokeWidth="2.2" fill="none" />
          {Array.from({ length: 7 }, (_, index) => {
            const x = 16 + index * ((length - 18) / 7);
            const size = 30 - index * 2.6;
            return (
              <g key={index}>
                <path d={`M${x} ${8 + index * 0.6} q${size * 0.35} ${-size * 0.9} ${size} ${-size * 0.75} q${-size * 0.45} ${size * 0.35} ${-size} ${size * 0.75}Z`} fill={color} />
                <path d={`M${x} ${8 + index * 0.6} q${size * 0.4} ${size * 0.85} ${size} ${size * 0.8} q${-size * 0.5} ${-size * 0.3} ${-size} ${-size * 0.8}Z`} fill={color} opacity=".88" />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
