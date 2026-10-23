// Real carta from `images/Menu Lupe 2025 Vertical.pdf` (odd/tasks/real-menu.md, S1-S6).
// A `variant` changes the price (media/full, X2/X4/X6, personas, toppings); a `choice` does not (proteína,
// salsa, sabor) and only travels in the cart and the WhatsApp message. `price: null` = precio por confirmar.

export type MenuVariant = { id: string; label: string; price: number | null; pickCount?: number };
export type MenuChoiceOption = { value: string; label: string; image?: string };
export type MenuChoice = { label: string; options: readonly MenuChoiceOption[] };
export type MenuItem = {
  id: string;
  name: string;
  unit?: string;
  description?: string;
  note?: string;
  image?: string;
  star?: boolean;
  // `cards` shows one card per price variant (like the reference "X2/X4/X6" entradas); otherwise items
  // with options render as a photo + rows board and single items as a dish card.
  layout?: 'cards';
  variants: readonly MenuVariant[];
  choice?: MenuChoice;
  picks?: { label: string; options: readonly MenuChoiceOption[]; count?: number };
};
export type MenuCategory = { id: string; title: string; image?: string; note?: string; items: readonly MenuItem[] };

const dish = (slug: string) => `/dishes/${slug}.webp`;
const single = (price: number | null): readonly MenuVariant[] => [{ id: '', label: '', price }];
const options = (...values: string[]) => values.map(value => ({ value, label: value }));
const protein = (...values: string[]): MenuChoice => ({ label: 'Proteína', options: options(...values) });

export const menuCategories: readonly MenuCategory[] = [
  {
    id: 'entradas',
    title: 'Entradas',
    items: [
      { id: 'guacamole-con-chicharron', name: 'Guacamole con chicharrón', image: dish('guacamole-con-chicharron'), variants: single(33900) },
      { id: 'esquite', name: 'Esquite', description: 'Auténtico antojito mexicano de maíz desgranado, hervido; combinado con mayonesa, limón, queso fresco, chili, cilantro y el toque de la lupe.', variants: single(33900) },
      { id: 'chilaquiles', name: 'Chilaquiles', description: 'Nachos bañados en salsa verde, recubiertos de pollo desmenuzado, queso y crema agria.', variants: single(33900) },
      { id: 'nachos-grandes', name: 'Nachos grandes', star: true, description: 'Muchos nachos cubiertos de frijoles, carne molida, queso cheddar derretido, guacamole, crema agria y jalapeños.', variants: single(38900) },
      {
        id: 'entrada-mixta',
        name: 'Entrada mixta',
        description: 'Flautas de pollo, quesadillas mixtas (carne y pollo) y fajita nachos mixtos. Acompañados de guacamole, crema agria y pico de gallo.',
        image: '/reference/menu-entradas.webp',
        layout: 'cards',
        variants: [{ id: 'x2', label: 'X2', price: 40900 }, { id: 'x4', label: 'X4', price: 81900 }, { id: 'x6', label: 'X6', price: 112900 }],
      },
    ],
  },
  {
    id: 'sopas',
    title: 'Sopas',
    items: [
      { id: 'sopa-de-tortilla', name: 'Sopa de tortilla', image: dish('sopa-de-tortillas'), description: 'Sopa a base de vegetales, pollo, aguacate, queso monterey jack, tiritas de tortilla de maíz y decorada con cilantro.', variants: single(35900) },
      { id: 'pozole', name: 'Pozole', image: dish('pozole'), description: 'Sopa tradicional de maíz blanco, carne de cerdo desmechada acompañada de cilantro, lechuga, limón y rábanos.', variants: single(40900) },
    ],
  },
  {
    id: 'fajitas',
    title: 'Fajitas',
    note: 'De pollo, de carne o mixta.',
    items: [
      {
        id: 'fajitas-poblanas',
        name: 'Fajitas Poblanas',
        description: 'Fajitas de pollo, carne, langostinos, rajas de poblano, cebollas moradas, tomate, servidas en su guiso acompañadas de guacamole, pico de gallo y tortillas de maíz.',
        variants: [{ id: 'media', label: '1/2 Orden', price: 65900 }, { id: 'full', label: 'Full Orden', price: 113900 }],
        choice: protein('Pollo', 'Carne', 'Mixta'),
      },
      {
        id: 'fajitas-famosas',
        name: 'Fajitas Famosas',
        image: dish('fajitas'),
        description: 'Fajitas marinadas acompañadas con cebolla a la parrilla, guacamole, pico de gallo, queso cheddar, arroz, frijoles y tortillas hechas en casa.',
        variants: [{ id: 'media', label: '1/2 Orden', price: 85900 }, { id: 'full', label: 'Full Orden', price: 115900 }],
        choice: protein('Pollo', 'Carne', 'Mixta'),
      },
    ],
  },
  {
    id: 'tacos-y-taquiza',
    title: 'Tacos y Taquiza',
    items: [
      {
        id: 'taquiza',
        name: 'Taquiza',
        star: true,
        image: dish('taquiza'),
        note: 'Elige 3 sabores para tu taquiza.',
        picks: { label: 'Sabores', count: 3, options: options('Al Pastor', 'Carnitas', 'Birria', 'Cochinita', 'Arrachera', 'Pescado', 'Camarón') },
        variants: [{ id: '2', label: '2 personas', price: 79900 }, { id: '4', label: '4 personas', price: 155900 }, { id: '6', label: '6 personas', price: 227900 }],
      },
      {
        id: 'tacos',
        name: 'Tacos',
        unit: 'X5',
        star: true,
        image: dish('tacos-de-pastor'),
        description: 'Cinco tacos del sabor que elijas.',
        variants: single(40900),
        choice: {
          label: 'Sabor',
          options: [
            { value: 'Al Pastor', label: 'Al Pastor', image: dish('tacos-de-pastor') },
            { value: 'Carnitas', label: 'Carnitas', image: dish('tacos-de-carnitas') },
            { value: 'Birria', label: 'Birria' },
            { value: 'Cochinita', label: 'Cochinita' },
            { value: 'Arrachera', label: 'Arrachera' },
            { value: 'Pescado', label: 'Pescado' },
            { value: 'Camarón', label: 'Camarón' },
          ],
        },
      },
    ],
  },
  {
    id: 'carnes',
    title: 'Carnes',
    items: [
      { id: 'carne-a-la-tampiquena', name: 'Carne a la tampiqueña', star: true, description: 'Fajita steak marinada acompañada de enchilada verde, queso monterey jack arroz, frijoles, cebolla caramelizada y tortillas.', variants: single(42900) },
      { id: 'steak-lupe', name: 'Steak lupe', image: dish('steak-lupe'), description: 'Fajita steak marinada cubierta de pico de gallo. Recubierta de queso monterey jack, acompañado de arroz, frijoles y tortillas.', variants: single(42900) },
      { id: 'hot-pepper-steak', name: 'Hot pepper steak', image: dish('hot-pepper-steak'), description: 'Fajita steak marinada cubierta de jalapeños frescos y habaneros, recubierto de queso monterey derretido. Acompañado de arroz, frijoles tortillas.', variants: single(42900) },
      { id: 'pollo-lupe', name: 'Pollo lupe', description: '(2) Pechugas de pollo marinadas en la salsa de la casa. Recubiertas con queso derretido monterey jack.', variants: single(42900) },
      { id: 'steak-pimienta', name: 'Steak Pimienta', description: 'Fajita steak salpimentada en nuestra receta de pimientas y picante, acompañada de arroz en salsa de queso y pico de gallo.', variants: single(42900) },
    ],
  },
  {
    id: 'mero-mexico',
    title: 'Mero México',
    items: [
      {
        id: 'burritos',
        name: 'Burritos',
        description: 'Deliciosa tortilla de harina, rellena de la carne de tu elección, frijoles refritos, arroz, guacamole, crema agria y pico de gallo decorado con nuestro famoso chile con queso.',
        variants: single(34900),
        choice: protein('Carne molida', 'Pollo', 'Carne asada', 'Mixto'),
      },
      {
        id: 'enchiladas',
        name: 'Enchiladas',
        image: dish('enchiladas-verdes'),
        description: '(3) Tortillas de maíz rellenas de pollo y queso fresco, cubiertas de la salsa de tu elección. Acompañadas de crema agria, pico de gallo y arroz.',
        variants: single(42900),
        choice: {
          label: 'Salsa',
          options: [
            { value: 'Verde', label: 'Salsa Verde', image: dish('enchiladas-verdes') },
            { value: 'Mole', label: 'Salsa Mole', image: dish('enchiladas-de-mole') },
            { value: 'Roja', label: 'Salsa Roja', image: dish('enchiladas-rojas') },
          ],
        },
      },
      { id: 'flautas', name: 'Flautas', star: true, image: dish('flautas'), description: '(4) Crujientes tortillas en forma de flauta, rellenos de pollo y queso monterey-jack, recubiertas de guacamole, crema agria, lechuga y pico de gallo.', variants: single(35900) },
      {
        id: 'fajitas-quesadillas',
        name: 'Fajitas Quesadillas',
        star: true,
        image: dish('quesadillas'),
        description: 'Tortillas de harina hechas a mano rellenas de carne de su elección acompañadas de pico de gallo, guacamole, crema agria y queso monterey jack derretido.',
        variants: single(35900),
        choice: protein('Carnitas', 'Pastor', 'Birria', 'Cochinita', 'Carne', 'Pollo'),
      },
      { id: 'combo-mero-mero', name: 'Combo "mero mero"', star: true, description: 'Plato mixto de enchilada verde, crispy taco de carne, flauta de pollo, arroz, frijoles refritos y guacamole.', variants: single(42900) },
      { id: 'tinga-de-pollo', name: 'Tinga de pollo', description: 'Delicioso pollo desmenuzado en guiso de tomate y chipotle, sobre una tostada de maíz acompañado de lechuga, aguacate, queso fresco y crema agria.', variants: single(42900) },
      { id: 'alambre-mexicano', name: 'Alambre Mexicano', description: 'Plato tradicional de carnes mixtas de pollo, res, cebollas, pimentones mixtos, portobellos, tocineta, recubiertas de queso blanco derretido. Acompañado de tortillas de maíz.', variants: single(40900) },
      { id: 'tamales-mexicanos', name: 'Tamales mexicanos', image: dish('tamales-mexicanos'), variants: single(null) },
    ],
  },
  {
    id: 'bebidas',
    title: 'Bebidas',
    items: [
      { id: 'aguas-frescas', name: 'Aguas frescas', unit: '16 oz', variants: single(12500), choice: { label: 'Sabor', options: options('Jamaica', 'Horchata', 'Tamarindo') } },
      { id: 'limonadas', name: 'Limonadas', unit: '16 oz', variants: single(12500), choice: { label: 'Sabor', options: options('Limonada de coco', 'Limonada de yerbabuena', 'Mango biche') } },
      { id: 'jugos', name: 'Jugos', unit: '16 oz', variants: single(12500), choice: { label: 'Sabor', options: options('Mango', 'Maracuyá', 'Fresa') } },
      { id: 'soda-saborizada-maracuya', name: 'Soda Saborizada (Maracuyá)', description: 'Bretaña y Maracuyá.', variants: single(15900) },
      { id: 'soda-saborizada-frutos-rojos', name: 'Soda Saborizada (Frutos Rojos)', description: 'Bretaña y Frutos Rojos.', variants: single(15900) },
      { id: 'te-o-soda-hatsu', name: 'Té o Soda Hatsu', variants: single(13900), choice: { label: 'Bebida', options: options('Té', 'Soda') } },
      { id: 'mangonada', name: 'Mangonada', variants: single(15900) },
      { id: 'gaseosas', name: 'Gaseosas', variants: single(8500) },
      { id: 'agua-hatsu', name: 'Agua Hatsu', variants: single(8500) },
    ],
  },
  {
    id: 'cocteles-y-chelas',
    title: 'Cócteles & Chelas',
    image: dish('chelas'),
    items: [
      { id: 'margaritas', name: 'Margaritas', description: 'Tradicional limón.', variants: single(null) },
      { id: 'margarita-rita', name: 'Margarita Rita', variants: single(null) },
      { id: 'tequila-sunrise', name: 'Tequila Sunrise', variants: single(null) },
      { id: 'cantarito-paloma', name: 'Cantarito Paloma', variants: single(null) },
      { id: 'sex-on-the-beach', name: 'Sex on The Beach', variants: single(null) },
      { id: 'mimosa-durazno', name: 'Mimosa Durazno', variants: single(null) },
      { id: 'pina-colada', name: 'Piña Colada', variants: single(null) },
      { id: 'mojito', name: 'Mojito', variants: single(null) },
      { id: 'vinos', name: 'Vinos', unit: 'copa', variants: single(null) },
      { id: 'sol', name: 'Sol', variants: single(12900) },
      { id: 'heineken', name: 'Heineken', variants: single(15900) },
      { id: 'club-colombia', name: 'Club Colombia', unit: 'dorada', variants: single(12900) },
      { id: 'chelas-importadas', name: 'Chelas Importadas', variants: single(16900), choice: { label: 'Cerveza', options: options('Stella Artois', 'Corona') } },
    ],
  },
  {
    id: 'postres',
    title: 'Postres',
    items: [
      { id: 'mexican-bunuelos', name: 'Mexican buñuelos', image: dish('bunuelos-mexicanos'), description: '(2) Tortillas de harina crujientes. Acompañadas de helado cubiertas de canela y miel.', variants: single(20900) },
      { id: 'quesadilla-de-cajeta', name: 'Quesadilla de cajeta', description: '(2) Tortillas de harina rellenas de arequipe y queso, acompañadas de helado.', variants: single(23900) },
      { id: 'helado-frito', name: 'Helado frito', image: dish('helado-frito'), description: 'Helado cubierto de hojuelas, recubierto de chocolate.', variants: single(23900) },
      {
        id: 'churros',
        name: 'Churros',
        image: dish('churros'),
        description: '(6) churros con la salsa de tu elección.',
        note: 'Toppings: chocolate, arequipe, helado.',
        picks: { label: 'Salsas y toppings', options: options('Chocolate', 'Arequipe', 'Helado') },
        variants: [{ id: '1', label: '1 topping', price: 23900, pickCount: 1 }, { id: '2', label: '2 toppings', price: 24900, pickCount: 2 }, { id: '3', label: '3 toppings', price: 25900, pickCount: 3 }],
      },
    ],
  },
];

// Owner's star dishes, in the order given (S3).
export const starItemIds = ['taquiza', 'carne-a-la-tampiquena', 'nachos-grandes', 'combo-mero-mero', 'flautas', 'fajitas-quesadillas', 'tacos'] as const;

const allItems = menuCategories.flatMap(category => category.items);
export const starItems: readonly MenuItem[] = starItemIds.map(id => allItems.find(item => item.id === id)!);

export const hasOptions = (item: MenuItem) => Boolean(item.choice || item.picks) || item.variants.length > 1;

export const requiredPicks = (item: MenuItem, variant: MenuVariant) => variant.pickCount ?? item.picks?.count ?? 0;

// Canonical combinations: choosing the same toppings in a different order still identifies one cart product.
export function itemOptions(item: MenuItem, variant: MenuVariant): readonly (MenuChoiceOption | undefined)[] {
  if (!item.picks) return item.choice?.options ?? [undefined];
  const count = requiredPicks(item, variant);
  if (count < 1 || count > item.picks.options.length) return [];
  const result: MenuChoiceOption[] = [];
  const visit = (start: number, chosen: MenuChoiceOption[]) => {
    if (chosen.length === count) {
      result.push({ value: chosen.map(option => option.value).join('+'), label: chosen.map(option => option.label).join(' + ') });
      return;
    }
    for (let index = start; index < item.picks!.options.length; index++) visit(index + 1, [...chosen, item.picks!.options[index]]);
  };
  visit(0, []);
  return result;
}

// Lowest confirmed price of an item, or null when none of its variants has a price yet.
export function startingPrice(item: MenuItem) {
  const prices = item.variants.map(variant => variant.price).filter((price): price is number => price !== null);
  return prices.length ? Math.min(...prices) : null;
}

export function formatPrice(value: number) {
  return `$${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
