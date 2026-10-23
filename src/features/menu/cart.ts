import { whatsappUrl } from '@/shared/config/contact';
import { menuCategories, formatPrice, itemOptions, type MenuItem, type MenuVariant, type MenuChoiceOption } from './menu-data';

export type CartLine = { productId: string; quantity: number };
// `price: null` marks an item whose price the restaurant has not confirmed yet.
export type MenuProduct = { id: string; name: string; price: number | null; image: string; isBeverage: boolean };

const fallbackImage = '/brand/la-lupe.png';

// Product id: `<item>` + `:<variant>` when the price varies + `|<choice>` when the item has a non-price choice.
export function productId(item: MenuItem, variant: MenuVariant, option?: MenuChoiceOption) {
  return `${item.id}${variant.id ? `:${variant.id}` : ''}${option ? `|${option.value}` : ''}`;
}

function productName(item: MenuItem, variant: MenuVariant, option?: MenuChoiceOption) {
  const details = [item.unit, variant.label, option?.label].filter(Boolean);
  return details.length ? `${item.name} (${details.join(' · ')})` : item.name;
}

export const menuProducts: readonly MenuProduct[] = menuCategories.flatMap(category => category.items.flatMap(item =>
  item.variants.flatMap(variant => itemOptions(item, variant).map(option => ({
    id: productId(item, variant, option),
    name: productName(item, variant, option),
    price: variant.price,
    image: option?.image ?? item.image ?? fallbackImage,
    isBeverage: category.id === 'bebidas' || category.id === 'cocteles-y-chelas',
  }))),
));

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

export function cartHasPendingPrices(cart: readonly CartLine[]): boolean {
  return cart.some(line => menuProducts.find(item => item.id === line.productId)?.price === null);
}

export function lineTotalLabel(product: MenuProduct, quantity: number): string {
  return product.price === null ? 'precio por confirmar' : formatPrice(product.price * quantity);
}

export function cartMessage(cart: readonly CartLine[]): string {
  const lines = cart.map(line => {
    const product = menuProducts.find(item => item.id === line.productId)!;
    return `${line.quantity} × ${product.name} — ${lineTotalLabel(product, line.quantity)}`;
  });
  const pending = cartHasPendingPrices(cart) ? ' (sin incluir los productos con precio por confirmar)' : '';
  return `Hola La Lupe, quiero hacer este pedido:\n\n${lines.join('\n')}\n\nSubtotal: ${formatPrice(cartSubtotal(cart))} COP${pending}\n\nEl restaurante confirma disponibilidad, domicilio y total. Este mensaje no confirma el pedido ni realiza un pago.`;
}

export function cartWhatsAppUrl(cart: readonly CartLine[], number: string): string | null {
  return cart.length ? whatsappUrl(number, cartMessage(cart)) : null;
}
