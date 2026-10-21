import { whatsappUrl } from '@/shared/config/contact';
import { entradas, fajitas, taquiza, formatPrice } from './menu-data';

export type CartLine = { productId: string; quantity: number };
export type MenuProduct = { id: string; name: string; price: number; image: string };

export const menuProducts: readonly MenuProduct[] = [
  ...entradas.map(item => ({ id: `entrada-${item.count}`, name: `Entradas ${item.name}`, price: item.price, image: 'menu-entradas' })),
  ...fajitas.flatMap((item, index) => [
    { id: `fajita-${index}-half`, name: `Fajitas ${item.name} (1/2 Orden)`, price: item.half, image: 'menu-fajitas' },
    { id: `fajita-${index}-full`, name: `Fajitas ${item.name} (Full Orden)`, price: item.full, image: 'menu-fajitas' },
  ]),
  ...taquiza.map((item, index) => ({ id: `taquiza-${index}`, name: `Taquiza ${item.name}`, price: item.price, image: 'menu-taquiza' })),
];

const validQuantity = (quantity: number) => Number.isInteger(quantity) && quantity >= 1 && quantity <= 99;

export function addToCart(cart: readonly CartLine[], productId: string, quantity: number): CartLine[] {
  if (!validQuantity(quantity) || !menuProducts.some(item => item.id === productId)) return [...cart];
  const existing = cart.find(line => line.productId === productId);
  return existing
    ? cart.map(line => line.productId === productId ? { ...line, quantity: Math.min(99, line.quantity + quantity) } : line)
    : [...cart, { productId, quantity }];
}

export function changeQuantity(cart: readonly CartLine[], productId: string, quantity: number): CartLine[] {
  if (!validQuantity(quantity)) return [...cart];
  return cart.map(line => line.productId === productId ? { ...line, quantity } : line);
}

export function removeFromCart(cart: readonly CartLine[], productId: string): CartLine[] {
  return cart.filter(line => line.productId !== productId);
}

export function cartSubtotal(cart: readonly CartLine[]): number {
  return cart.reduce((total, line) => total + (menuProducts.find(item => item.id === line.productId)?.price ?? 0) * line.quantity, 0);
}

export function cartMessage(cart: readonly CartLine[]): string {
  const lines = cart.map(line => {
    const product = menuProducts.find(item => item.id === line.productId)!;
    return `${line.quantity} × ${product.name} — ${formatPrice(product.price * line.quantity)}`;
  });
  return `Hola La Lupe, quiero solicitar este pedido:\n\n${lines.join('\n')}\n\nSubtotal de referencia: ${formatPrice(cartSubtotal(cart))} COP\n\nPrecios y disponibilidad pendientes de confirmación por el restaurante. Este mensaje no confirma el pedido ni realiza un pago.`;
}

export function cartWhatsAppUrl(cart: readonly CartLine[], number: string): string | null {
  return cart.length ? whatsappUrl(number, cartMessage(cart)) : null;
}
