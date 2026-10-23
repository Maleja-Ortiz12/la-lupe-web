// Single source for the restaurant's contact facts, supplied by the owner (odd/tasks/real-menu.md, S4-S5).
// `whatsappNumber` receives cart orders and the floating chat; every WhatsApp control is disabled if it is empty.
export const contact = {
  whatsappNumber: '+57 311 634 1836',
  phones: ['311 634 1836', '310 257 2692', '300 457 7875'],
  delivery: 'Domicilios a Cota y Chía',
  deliveryAreas: ['Cota', 'Chía'],
} as const;

export function telUrl(phone: string) {
  return `tel:+57${phone.replace(/\D/g, '')}`;
}

export const whatsappMessages = {
  order: 'Hola La Lupe, quiero hacer un pedido.',
  info: 'Hola La Lupe, quiero más información.',
} as const;

export function whatsappUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
