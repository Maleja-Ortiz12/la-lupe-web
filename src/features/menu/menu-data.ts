// Reference prices copied from the supplied `menu.png` design; pending client approval.

export const entradas = [
  { name: '“X2”', count: 2, price: 22500 },
  { name: '“X4”', count: 4, price: 40500 },
  { name: '“X6”', count: 6, price: 60000 },
] as const;

export const fajitas = [
  { name: 'De Pollo', half: 30500, full: 58000 },
  { name: 'De Carne', half: 32500, full: 60000 },
  { name: 'Combinadas', half: 34500, full: 62000 },
] as const;

export const taquiza = [
  { name: '2 per. (10 T)', price: 40000 },
  { name: '4 per. (20 T)', price: 80000 },
  { name: '6 per. (40 T)', price: 120000 },
] as const;

export function formatPrice(value: number) {
  return `$${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
