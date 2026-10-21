'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ActionIcon } from '@/features/presentation/components/action-icon';
import { Flourish } from '@/features/presentation/components/flourish';
import { WhatsAppLink } from '@/features/presentation/components/whatsapp-link';
import { entradas, fajitas, taquiza, formatPrice } from '../menu-data';
import { addToCart, changeQuantity, removeFromCart, cartSubtotal, cartWhatsAppUrl, menuProducts, type CartLine } from '../cart';

type AddHandler = (productId: string, quantity: number, trigger: HTMLButtonElement) => void;

function CartIcon() {
  return <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h3l3 12h11l3-9H6M9 19h.01M18 19h.01" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function QuantityControl({ label, quantity, onChange }: { label: string; quantity: number; onChange: (quantity: number) => void }) {
  return (
    <div className="cart-stepper" role="group" aria-label={`Cantidad de ${label}`}>
      <button type="button" aria-label={`Reducir cantidad de ${label}`} disabled={quantity <= 1} onClick={() => onChange(quantity - 1)}>−</button>
      <output aria-label={`Unidades de ${label}`}>{quantity}</output>
      <button type="button" aria-label={`Aumentar cantidad de ${label}`} disabled={quantity >= 99} onClick={() => onChange(quantity + 1)}>+</button>
    </div>
  );
}

function AddProduct({ productId, onAdd }: { productId: string; onAdd: AddHandler }) {
  const [quantity, setQuantity] = useState(1);
  const product = menuProducts.find(item => item.id === productId)!;
  return (
    <div className="product-actions">
      <QuantityControl label={product.name} quantity={quantity} onChange={setQuantity} />
      <button className="cart-add" type="button" aria-label={`Agregar ${product.name}`} onClick={event => onAdd(productId, quantity, event.currentTarget)}><CartIcon />Agregar</button>
    </div>
  );
}

function SectionTitle({ id, children }: { id: string; children: string }) {
  return <h2 id={id} className="menu-title"><Flourish /><span>{children}</span></h2>;
}

function FajitaRow({ index, onAdd }: { index: number; onAdd: AddHandler }) {
  const [portion, setPortion] = useState('half');
  const item = fajitas[index];
  return (
    <tr>
      <th scope="row">{item.name}</th>
      <td data-label="1/2 Orden">{formatPrice(item.half)}</td>
      <td data-label="Full Orden">{formatPrice(item.full)}</td>
      <td className="fajita-selection">
        <label><span className="visually-hidden">Porción de Fajitas {item.name}</span><select aria-label={`Porción de Fajitas ${item.name}`} value={portion} onChange={event => setPortion(event.target.value)}><option value="half">1/2 Orden</option><option value="full">Full Orden</option></select></label>
        <AddProduct key={portion} productId={`fajita-${index}-${portion}`} onAdd={onAdd} />
      </td>
    </tr>
  );
}

export function MenuCatalog({ whatsappNumber }: { whatsappNumber: string }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const cartHeading = useRef<HTMLHeadingElement>(null);
  const lastAddedControl = useRef<HTMLButtonElement | null>(null);
  const catalog = useRef<HTMLDivElement>(null);
  const hasOpened = useRef(false);

  useEffect(() => {
    if (cartOpen) {
      hasOpened.current = true;
      cartHeading.current?.focus({ preventScroll: true });
      cartHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else if (hasOpened.current) {
      const target = lastAddedControl.current?.isConnected ? lastAddedControl.current : catalog.current;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [cartOpen]);

  const addMore = () => setCartOpen(false);
  const showCart = () => {
    setCartOpen(true);
    if (cartOpen) {
      cartHeading.current?.focus({ preventScroll: true });
      cartHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  };
  const href = cartWhatsAppUrl(cart, whatsappNumber);
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const onAdd: AddHandler = (productId, quantity, trigger) => {
    lastAddedControl.current = trigger;
    showCart();
    setCart(current => addToCart(current, productId, quantity));
    setAnnouncement(`Carrito actualizado: ${menuProducts.find(item => item.id === productId)!.name}. Máximo 99 unidades por producto.`);
  };

  return (
    <div className="container menu-catalog">
      <p id="menu-status" className="menu-status">Precios de referencia pendientes de aprobación · Sin pagos en línea.{!whatsappNumber && ' Número de WhatsApp pendiente de confirmación.'}</p>
      <button type="button" className="cart-jump" aria-controls="tu-pedido" aria-expanded={cartOpen} onClick={showCart}><CartIcon />Ver carrito ({itemCount})</button>
      <p className="visually-hidden" role="status">{announcement}</p>
      <div className="menu-with-cart" data-cart-open={cartOpen}>
        <div className="menu-products" ref={catalog} tabIndex={-1}>
          <section id="entradas" aria-labelledby="entradas-title">
            <SectionTitle id="entradas-title">Entradas</SectionTitle>
            <div className="entradas-grid">
              {entradas.map(item => (
                <article className="entrada-card" key={item.count}>
                  <Image className="entrada-photo" src="/reference/menu-entradas.webp" width={230} height={126} alt="" unoptimized />
                  <div className="entrada-copy">
                    <h3>{item.name}</h3>
                    <ul><li>({item.count}) Quesadillas</li><li>({item.count}) Flautas</li><li>({item.count}) Fajitas nachos<br />Guacamole<br />Crema</li></ul>
                    <p className="menu-price">{formatPrice(item.price)}</p>
                    <AddProduct productId={`entrada-${item.count}`} onAdd={onAdd} />
                  </div>
                </article>
              ))}
            </div>
          </section>
          <div className="menu-boards">
            <section id="fajitas" aria-labelledby="fajitas-title">
              <SectionTitle id="fajitas-title">Fajitas</SectionTitle>
              <div className="menu-board">
                <Image className="menu-board-photo" src="/reference/menu-fajitas.webp" width={209} height={177} alt="Imagen conceptual de fajitas de referencia" unoptimized />
                <div className="menu-table-scroll" role="region" aria-label="Opciones de fajitas" tabIndex={0}>
                  <table className="menu-table">
                    <caption className="visually-hidden">Fajitas: precios por media orden y orden completa</caption>
                    <thead><tr><td /><th scope="col"><span className="tag tag-green">1/2 Orden</span></th><th scope="col"><span className="tag tag-red">Full Orden</span></th><th scope="col"><span className="visually-hidden">Porción y cantidad</span></th></tr></thead>
                    <tbody>{fajitas.map((item, index) => <FajitaRow key={item.name} index={index} onAdd={onAdd} />)}</tbody>
                  </table>
                </div>
              </div>
            </section>
            <section id="taquiza" aria-labelledby="taquiza-title">
              <SectionTitle id="taquiza-title">Taquiza</SectionTitle>
              <div className="menu-board">
                <Image className="menu-board-photo" src="/reference/menu-taquiza.webp" width={268} height={135} alt="Imagen conceptual de tacos de referencia" unoptimized />
                <div className="menu-table-scroll" role="region" aria-label="Opciones de taquiza" tabIndex={0}>
                  <table className="menu-table"><caption className="visually-hidden">Taquiza: precios por número de personas y tacos</caption><tbody>{taquiza.map((item, index) => <tr key={item.name}><th scope="row">{item.name}</th><td data-label="Precio">{formatPrice(item.price)}</td><td className="cart-table-actions"><AddProduct productId={`taquiza-${index}`} onAdd={onAdd} /></td></tr>)}</tbody></table>
                </div>
              </div>
            </section>
          </div>
        </div>
        <aside id="tu-pedido" className="cart-panel" aria-labelledby="cart-title" hidden={!cartOpen}>
          <h2 id="cart-title" ref={cartHeading} tabIndex={-1}><CartIcon />Tu pedido</h2>
          <button type="button" className="cart-continue" onClick={addMore}>Agregar más productos</button>
          {cart.length === 0 ? <p className="cart-empty">Tu carrito está vacío. Agrega tus platillos favoritos.</p> : (
            <ul className="cart-lines">
              {cart.map(line => {
                const product = menuProducts.find(item => item.id === line.productId)!;
                return (
                  <li className="cart-line" key={line.productId}>
                    <Image src={`/reference/${product.image}.webp`} width={84} height={84} alt="" unoptimized />
                    <div className="cart-line-copy"><h3>{product.name}</h3><QuantityControl label={`carrito: ${product.name}`} quantity={line.quantity} onChange={quantity => setCart(current => changeQuantity(current, line.productId, quantity))} /><p className="cart-line-total">{formatPrice(product.price * line.quantity)}</p></div>
                    <button className="cart-remove" type="button" aria-label={`Quitar ${product.name}`} onClick={() => { setCart(current => removeFromCart(current, line.productId)); setAnnouncement(`${product.name} eliminado del carrito.`); }}>×</button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="cart-subtotal"><span>Subtotal</span><strong>{formatPrice(cartSubtotal(cart))}</strong></p>
          <WhatsAppLink href={href} className="button cart-checkout" describedBy="cart-status"><ActionIcon kind="whatsapp" />Pedir carrito por WhatsApp</WhatsAppLink>
          <p id="cart-status">{!whatsappNumber ? 'Falta confirmar el número de WhatsApp del restaurante.' : cart.length === 0 ? 'Agrega al menos un producto para preparar tu mensaje.' : 'Se abrirá WhatsApp con el detalle del carrito. Revisa el mensaje antes de enviarlo.'}</p>
          <p className="cart-note">Subtotal de referencia en COP. El restaurante confirma precios y disponibilidad; no se realizan pagos ni se confirma el pedido aquí.</p>
          <p className="cart-note">Máximo 99 unidades por producto. El carrito se conserva solo mientras esta página está abierta; se vacía al recargar.</p>
        </aside>
      </div>
    </div>
  );
}
