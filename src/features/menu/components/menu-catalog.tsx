'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ActionIcon } from '@/features/presentation/components/action-icon';
import { Flourish } from '@/features/presentation/components/flourish';
import { WhatsAppLink } from '@/features/presentation/components/whatsapp-link';
import { menuCategories, starItems, formatPrice, hasOptions, startingPrice, itemOptions, requiredPicks, type MenuChoiceOption, type MenuItem } from '../menu-data';
import { MenuSidebar } from './menu-sidebar';
import { addToCart, changeQuantity, removeFromCart, cartHasPendingPrices, cartSubtotal, cartWhatsAppUrl, lineTotalLabel, menuProducts, productId, type CartLine } from '../cart';

type AddHandler = (productId: string, quantity: number) => void;

const sidebarSections = [{ id: 'platos-estrella', label: 'Estrella' }, ...menuCategories.map(category => ({ id: category.id, label: category.title }))];

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

function AddProduct({ productId, onAdd, compact = false }: { productId: string; onAdd: AddHandler; compact?: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const product = menuProducts.find(item => item.id === productId)!;
  return (
    <div className="product-actions">
      <QuantityControl label={product.name} quantity={quantity} onChange={setQuantity} />
      <button className={compact ? 'cart-add cart-add-icon' : 'cart-add'} type="button" aria-label={`Agregar ${product.name}`} title={compact ? `Agregar ${product.name}` : undefined} onClick={() => onAdd(productId, quantity)}><CartIcon />{!compact && 'Agregar'}</button>
    </div>
  );
}

function SectionTitle({ id, children }: { id: string; children: string }) {
  return <h2 id={id} className="menu-title"><Flourish /><span>{children}</span></h2>;
}

const priceLabel = (price: number | null) => price === null ? 'Precio por confirmar' : formatPrice(price);

function StarBadge() {
  return <span className="star-badge"><span aria-hidden="true">★ </span>Plato estrella</span>;
}

function ItemHeading({ item }: { item: MenuItem }) {
  return <h3>{item.name}{item.unit && <span className="dish-unit">{` (${item.unit})`}</span>}</h3>;
}

function DishPhoto({ src, alt, className = 'dish-photo' }: { src?: string; alt: string; className?: string }) {
  return <Image className={`${className}${src ? '' : ' dish-logo'}`} src={src ?? '/brand/la-lupe.png'} width={960} height={720} sizes="(max-width: 700px) 50vw, (max-width: 1150px) 33vw, 25vw" alt={src ? alt : 'Logo de La Lupe · foto del plato próximamente'} />;
}

// The same product-card structure is used for simple dishes and dishes with options.
function VariationSummary({ item }: { item: MenuItem }) {
  if (!hasOptions(item)) return null;
  const labels = [...new Set([
    ...item.variants.map(variant => variant.label),
    ...(item.choice?.options ?? item.picks?.options ?? []).map(option => option.label),
  ].filter(Boolean))];
  return <ul className="card-variations" aria-label={`Variedades de ${item.name}`}>
    {labels.map(label => <li key={label}>{label}</li>)}
  </ul>;
}

function OptionsButton({ item, onOptions, showPhoto }: { item: MenuItem; onOptions: OpenOptions; showPhoto: boolean }) {
  return <button type="button" className="cart-add dish-options" aria-label={`Elegir opciones de ${item.name}`} aria-haspopup="dialog" aria-controls="opciones-producto" onClick={event => onOptions(item, showPhoto, event.currentTarget)}><CartIcon />Agregar</button>;
}

function DishCard({ item, onAdd, onOptions, showPhoto = true }: { item: MenuItem; onAdd: AddHandler; onOptions: OpenOptions; showPhoto?: boolean }) {
  const options = hasOptions(item);
  const price = startingPrice(item);
  return (
    <article className={`dish-card${item.image ? '' : ' dish-card-text'}${item.star ? ' is-star' : ''}`} id={`plato-${item.id}`}>
      {showPhoto && <DishPhoto src={item.image} alt={`${item.name}, foto real de La Lupe`} />}
      <div className="dish-copy">
        {item.star && <StarBadge />}
        <ItemHeading item={item} />
        {item.description && <p className="dish-description">{item.description}</p>}
        <p className={price === null ? 'dish-price dish-price-pending' : 'dish-price'}>{price === null ? priceLabel(price) : `${options ? 'Desde ' : ''}${formatPrice(price)}`}</p>
        {item.note && <p className="dish-note">{item.note}</p>}
        <VariationSummary item={item} />
        {options
          ? <OptionsButton item={item} onOptions={onOptions} showPhoto={showPhoto} />
          : <AddProduct productId={productId(item, item.variants[0])} onAdd={onAdd} />}
      </div>
    </article>
  );
}

// Star showcase card: photo (or decorated panel), name, description and price; items with options link to their board.
function StarCard({ item, onAdd, onOptions }: { item: MenuItem; onAdd: AddHandler; onOptions: OpenOptions }) {
  const price = startingPrice(item);
  return (
    <article className={`star-card${item.image ? '' : ' star-card-text'}`}>
      <DishPhoto src={item.image} alt={`${item.name}, foto real de La Lupe`} />
      <div className="dish-copy">
        <StarBadge />
        <ItemHeading item={item} />
        {item.description && <p className="dish-description">{item.description}</p>}
        <p className="dish-price">{hasOptions(item) && price !== null ? `Desde ${formatPrice(price)}` : priceLabel(price)}</p>
        <VariationSummary item={item} />
        {hasOptions(item)
          ? <OptionsButton item={item} onOptions={onOptions} showPhoto />
          : <AddProduct productId={productId(item, item.variants[0])} onAdd={onAdd} />}
      </div>
    </article>
  );
}

type OpenOptions = (item: MenuItem, showPhoto: boolean, trigger: HTMLButtonElement, variantId?: string) => void;

function PlusIcon() {
  return <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}

// Phone carousel card: complete photo, name, clamped description with Ver más, price and a direct + button.
function MobileCard({ item, scope, showPhoto, onAdd, onOptions }: { item: MenuItem; scope: string; showPhoto: boolean; onAdd: AddHandler; onOptions: OpenOptions }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(true);
  const description = useRef<HTMLParagraphElement>(null);
  // Show Ver más only while the two-line clamp actually hides text (wide phones may fit it all).
  useEffect(() => {
    const element = description.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const measure = () => { if (element.dataset.expanded !== 'true') setClamped(element.scrollHeight > element.clientHeight + 1); };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // Web fonts change line wrapping without resizing the clamped box, so measure again once they load.
    let active = true;
    document.fonts?.ready.then(() => { if (active) measure(); });
    return () => { active = false; observer.disconnect(); };
  }, []);
  const price = startingPrice(item);
  const options = hasOptions(item);
  const descriptionId = `m-desc-${scope}-${item.id}`;
  const single = options ? undefined : menuProducts.find(product => product.id === productId(item, item.variants[0]))!;
  return (
    <li className={`m-card${showPhoto ? '' : ' m-card-no-photo'}${item.star ? ' is-star' : ''}`} data-item={item.id}>
      {showPhoto && <DishPhoto className="m-photo" src={item.image} alt={`${item.name}, foto real de La Lupe`} />}
      <div className="m-body">
        {item.star && <StarBadge />}
        <ItemHeading item={item} />
        {item.description && <p className="m-desc" id={descriptionId} ref={description} data-expanded={expanded}>{item.description}</p>}
        {(item.description?.length ?? 0) > 70 && (clamped || expanded) && <button type="button" className="m-more" aria-controls={descriptionId} aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Ver menos' : 'Ver más'}</button>}
        {item.note && <p className="m-note">{item.note}</p>}
        <VariationSummary item={item} />
        <div className="m-foot">
          <p className={price === null ? 'm-price m-price-pending' : 'm-price'}>{price === null ? 'Precio por confirmar' : `${options ? 'Desde ' : ''}${formatPrice(price)}`}</p>
          {single
            ? <button type="button" className="m-add" aria-label={`Agregar ${single.name}`} onClick={() => onAdd(single.id, 1)}><PlusIcon /></button>
            : <button type="button" className="m-add" aria-label={`Elegir opciones de ${item.name}`} aria-haspopup="dialog" aria-controls="opciones-producto" onClick={event => onOptions(item, showPhoto, event.currentTarget)}><PlusIcon /></button>}
        </div>
      </div>
    </li>
  );
}

function MobileCarousel({ title, items, scope, showPhoto, onAdd, onOptions }: { title: string; items: readonly MenuItem[]; scope: string; showPhoto: boolean; onAdd: AddHandler; onOptions: OpenOptions }) {
  return (
    <ul className="m-carousel" aria-label={`${title}: desliza para ver más`}>
      {items.map(item => <MobileCard key={item.id} item={item} scope={scope} showPhoto={showPhoto} onAdd={onAdd} onOptions={onOptions} />)}
    </ul>
  );
}

// Bottom sheet for dishes with variations: choose sabor/proteína and porción, quantity, then add.
function OptionsSheet({ item, showPhoto, variantId, onAdd, onClose }: { item: MenuItem; showPhoto: boolean; variantId?: string; onAdd: AddHandler; onClose: () => void }) {
  const [option, setOption] = useState(item.choice?.options[0]);
  const [variant, setVariant] = useState(item.variants.find(entry => entry.id === variantId) ?? item.variants[0]);
  const [picked, setPicked] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const count = requiredPicks(item, variant);
  const canonical = item.picks?.options.filter(entry => picked.includes(entry.value)).map(entry => entry.value).join('+');
  const combination = item.picks ? itemOptions(item, variant).find(entry => entry?.value === canonical) : option;
  const id = productId(item, variant, combination);
  const product = menuProducts.find(entry => entry.id === id);
  const valid = Boolean(product) && (!item.picks || picked.length === count);
  const label = product?.name ?? `${item.name} (${variant.label})`;
  return (
    <>
      <button type="button" className="cart-close" aria-label="Cerrar opciones" onClick={onClose}>×</button>
      <div className="sheet-head">
        {showPhoto && <DishPhoto className="sheet-photo" src={item.image} alt="" />}
        <h2 id="opciones-title" tabIndex={-1}>{item.name}{item.unit && <span className="dish-unit">{` (${item.unit})`}</span>}</h2>
      </div>
      {item.picks && <fieldset className="sheet-group">
        <legend>{item.picks.label} · Elige {count}</legend>
        {item.picks.options.map(entry => <label key={entry.value}>
          <input type="checkbox" checked={picked.includes(entry.value)} disabled={!picked.includes(entry.value) && picked.length >= count} onChange={event => setPicked(current => event.target.checked ? [...current, entry.value] : current.filter(value => value !== entry.value))} />{entry.label}
        </label>)}
        <p className="sheet-pick-status" role="status">{picked.length} de {count} seleccionados</p>
      </fieldset>}
      {item.choice && (
        <fieldset className="sheet-group">
          <legend>{item.choice.label}</legend>
          {item.choice.options.map(entry => (
            <label key={entry.value}><input type="radio" name="sheet-choice" checked={entry.value === option?.value} onChange={() => setOption(entry)} />{entry.label}</label>
          ))}
        </fieldset>
      )}
      {item.variants.length > 1 && (
        <fieldset className="sheet-group">
          <legend>Tamaño</legend>
          {item.variants.map(entry => (
            <label key={entry.id}><input type="radio" name="sheet-variant" checked={entry.id === variant.id} onChange={() => { setVariant(entry); setPicked(current => current.slice(0, requiredPicks(item, entry))); }} />{entry.label}<span className="sheet-price">{priceLabel(entry.price)}</span></label>
          ))}
        </fieldset>
      )}
      <div className="sheet-actions">
        <QuantityControl label={label} quantity={quantity} onChange={setQuantity} />
        <button type="button" className="cart-add" disabled={!valid} aria-label={`Agregar ${label}`} onClick={() => { if (!valid) return; onAdd(id, quantity); onClose(); }}>
          <CartIcon />Agregar{variant.price !== null && ` · ${formatPrice(variant.price * quantity)}`}
        </button>
      </div>
    </>
  );
}

export function MenuCatalog({ whatsappNumber }: { whatsappNumber: string }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [feedback, setFeedback] = useState(0);
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(0), 2600);
    return () => clearTimeout(timer);
  }, [feedback]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartDialog = useRef<HTMLDialogElement>(null);
  const cartButton = useRef<HTMLButtonElement>(null);
  const cartHeading = useRef<HTMLHeadingElement>(null);
  const catalog = useRef<HTMLDivElement>(null);
  const closeCart = () => cartDialog.current?.close();
  const showCart = () => {
    cartDialog.current?.showModal();
    setCartOpen(true);
    cartHeading.current?.focus({ preventScroll: true });
  };
  // `open` counts openings so a quick reopen after Escape always shows a fresh sheet, independent of the async close event.
  const [sheet, setSheet] = useState<{ item: MenuItem; showPhoto: boolean; open: number; variantId?: string } | null>(null);
  const sheetDialog = useRef<HTMLDialogElement>(null);
  const sheetTrigger = useRef<HTMLButtonElement | null>(null);
  const openOptions: OpenOptions = (item, showPhoto, trigger, variantId) => {
    sheetTrigger.current = trigger;
    setSheet(current => ({ item, showPhoto, variantId, open: (current?.open ?? 0) + 1 }));
  };
  useEffect(() => {
    if (!sheet || sheetDialog.current?.open) return;
    sheetDialog.current?.showModal();
    sheetDialog.current?.querySelector<HTMLElement>('#opciones-title')?.focus({ preventScroll: true });
  }, [sheet]);
  const closeSheet = () => sheetDialog.current?.close();
  // Home links target /menu#plato-<id>; on phones the dish lives in its category carousel.
  useEffect(() => {
    const match = location.hash.match(/^#plato-(.+)$/);
    if (!match || !matchMedia('(max-width: 760px)').matches) return;
    const card = document.querySelector(`.menu-section:not(#platos-estrella) .m-card[data-item="${CSS.escape(match[1])}"]`);
    card?.scrollIntoView({ block: 'center', inline: 'start', behavior: 'instant' });
  }, []);
  const href = cartWhatsAppUrl(cart, whatsappNumber);
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const onAdd: AddHandler = (productId, quantity) => {
    setCart(current => addToCart(current, productId, quantity));
    setFeedback(current => current + 1);
  };

  return (
    <div className="container menu-catalog menu-catalog-compact">
      {!whatsappNumber && <p id="menu-status" className="menu-status">Número de WhatsApp pendiente de confirmación.</p>}
      <nav className="menu-category-nav" aria-label="Categorías del menú">
        <a href="#platos-estrella"><span aria-hidden="true">★ </span>Estrella</a>
        {menuCategories.map(category => <a key={category.id} href={`#${category.id}`}>{category.title}</a>)}
      </nav>
      <button ref={cartButton} type="button" className="cart-jump" aria-haspopup="dialog" aria-controls="tu-pedido" aria-expanded={cartOpen} onClick={showCart}><CartIcon /><span className="cart-count" aria-hidden="true">{itemCount}</span><span className="visually-hidden">Ver carrito ({itemCount})</span></button>
      <p className="visually-hidden" role="status">{announcement}</p>
      <p className={`cart-feedback${feedback ? ' is-visible' : ''}`} role="status" aria-atomic="true">{feedback ? 'Agregado al carrito con éxito' : ''}</p>
      <div className="menu-with-cart" data-cart-open={cartOpen}>
        <MenuSidebar sections={sidebarSections} />
        <div className="menu-products" ref={catalog} tabIndex={-1}>
          <section id="platos-estrella" className="menu-section star-showcase" aria-labelledby="platos-estrella-title">
            <SectionTitle id="platos-estrella-title">Platos estrella</SectionTitle>
            <p className="menu-section-note">Los favoritos de la casa.</p>
            <div className="star-grid product-grid">{starItems.map(item => <StarCard key={item.id} item={item} onAdd={onAdd} onOptions={openOptions} />)}</div>
            <MobileCarousel title="Platos estrella" items={starItems} scope="platos-estrella" showPhoto onAdd={onAdd} onOptions={openOptions} />
          </section>
          {menuCategories.map(category => (
            <section id={category.id} key={category.id} className="menu-section" aria-labelledby={`${category.id}-title`}>
              <SectionTitle id={`${category.id}-title`}>{category.title}</SectionTitle>
              {category.note && <p className="menu-section-note">{category.note}</p>}
              <div className="dish-grid product-grid">
                {[...category.items.filter(hasOptions), ...category.items.filter(item => !hasOptions(item))].map(item =>
                  <DishCard key={item.id} item={item} onAdd={onAdd} onOptions={openOptions} showPhoto={category.id !== 'bebidas' && category.id !== 'cocteles-y-chelas'} />)}
              </div>
              <MobileCarousel title={category.title} items={category.items} scope={category.id} showPhoto={category.id !== 'bebidas' && category.id !== 'cocteles-y-chelas'} onAdd={onAdd} onOptions={openOptions} />
            </section>
          ))}
        </div>
        <dialog id="opciones-producto" className="options-sheet" ref={sheetDialog} aria-labelledby="opciones-title" onClose={() => sheetTrigger.current?.focus({ preventScroll: true })} onClick={event => { if (event.target !== event.currentTarget) return; const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSheet(); }}>
          {sheet && <OptionsSheet key={sheet.open} item={sheet.item} variantId={sheet.variantId} showPhoto={sheet.showPhoto} onAdd={onAdd} onClose={closeSheet} />}
        </dialog>
        <dialog id="tu-pedido" className="cart-panel" ref={cartDialog} aria-labelledby="cart-title" onClose={() => { setCartOpen(false); cartButton.current?.focus({ preventScroll: true }); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeCart(); } }}>
          <button type="button" className="cart-close" aria-label="Cerrar carrito" onClick={closeCart}>×</button>
          <h2 id="cart-title" ref={cartHeading} tabIndex={-1}><CartIcon />Tu pedido</h2>
          <button type="button" className="cart-continue" onClick={closeCart}>Agregar más productos</button>
          {cart.length === 0 ? <p className="cart-empty">Tu carrito está vacío. Agrega tus platillos favoritos.</p> : (
            <ul className="cart-lines">
              {cart.map(line => {
                const product = menuProducts.find(item => item.id === line.productId)!;
                return (
                  <li className={`cart-line${product.isBeverage ? ' cart-line-no-photo' : ''}`} key={line.productId}>
                    {!product.isBeverage && <Image src={product.image} width={84} height={84} alt="" unoptimized />}
                    <div className="cart-line-copy"><h3>{product.name}</h3><QuantityControl label={`carrito: ${product.name}`} quantity={line.quantity} onChange={quantity => setCart(current => changeQuantity(current, line.productId, quantity))} /><p className={product.price === null ? 'cart-line-total cart-line-pending' : 'cart-line-total'}>{product.price === null ? 'Precio por confirmar' : lineTotalLabel(product, line.quantity)}</p></div>
                    <button className="cart-remove" type="button" aria-label={`Quitar ${product.name}`} onClick={() => { setCart(current => removeFromCart(current, line.productId)); setAnnouncement(`${product.name} eliminado del carrito.`); }}>×</button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="cart-subtotal"><span>Subtotal</span><strong>{formatPrice(cartSubtotal(cart))}</strong></p>
          {cartHasPendingPrices(cart) && <p className="cart-note cart-pending-note">El subtotal no incluye los platos con precio por confirmar; el restaurante te los cotiza por WhatsApp.</p>}
          <WhatsAppLink href={href} className="button cart-checkout" describedBy="cart-status"><ActionIcon kind="whatsapp" />Pedir carrito por WhatsApp</WhatsAppLink>
          <p id="cart-status">{!whatsappNumber ? 'Falta confirmar el número de WhatsApp del restaurante.' : cart.length === 0 ? 'Agrega al menos un producto para preparar tu mensaje.' : 'Se abrirá WhatsApp con el detalle del carrito. Revisa el mensaje antes de enviarlo.'}</p>
          <p className="cart-note">Precios de la carta en COP. El restaurante confirma disponibilidad, domicilio y total; no se realizan pagos ni se confirma el pedido aquí.</p>
          <p className="cart-note">Máximo 99 unidades por producto. El carrito se conserva solo mientras esta página está abierta; se vacía al recargar.</p>
        </dialog>
      </div>
    </div>
  );
}
