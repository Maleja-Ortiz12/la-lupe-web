import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { EssencePage } from '../src/features/essence/components/essence-page';
import { menuCategories } from '../src/features/menu/menu-data';

const markup = renderToStaticMarkup(<EssencePage />);

test('Nuestra esencia adds an original brand story without invented dates, awards or founders', () => {
  assert.match(markup, /La Lupe empieza cada vez que alguien corre una silla/);
  assert.match(markup, /la sobremesa se alarga un taco más/);
  assert.doesNotMatch(markup, /fundad[oa] en|desde 19\d\d|desde 20\d\d|premiad[oa]|historia de ejemplo|historia imaginada/i);
});

test('the carta panels illustrate actual matching dishes and keep descriptions coherent with their options', () => {
  for (const id of ['guacamole-con-chicharron', 'taquiza', 'fajitas-famosas']) {
    const item = menuCategories.flatMap(category => category.items).find(item => item.id === id)!;
    assert.ok(item.image);
    assert.ok(markup.includes(item.image!), `${id}: real menu photo`);
  }
  const taquiza = menuCategories.flatMap(category => category.items).find(item => item.id === 'taquiza')!;
  assert.deepEqual(taquiza.variants.map(variant => variant.label), ['2 personas', '4 personas', '6 personas']);
  assert.match(markup, /taquizas para 2, 4 o 6 personas/);
  const fajitas = menuCategories.find(category => category.id === 'fajitas')!.items;
  for (const item of fajitas) {
    assert.deepEqual(item.choice?.options.map(option => option.label), ['Pollo', 'Carne', 'Mixta']);
    assert.deepEqual(item.variants.map(variant => variant.label), ['1/2 Orden', 'Full Orden']);
  }
  assert.match(markup, /Fajitas de pollo, carne o mixtas, en media orden u orden completa/);
});
