// Single source for the restaurant's WhatsApp. Leave empty until the number is confirmed;
// every WhatsApp control stays disabled while it is empty. Example: '+57 300 123 4567'.
export const contact = {
  whatsappNumber: '',
};

export const whatsappMessages = {
  order: 'Hola La Lupe, quiero hacer un pedido.',
  info: 'Hola La Lupe, quiero más información.',
} as const;

export function whatsappUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
