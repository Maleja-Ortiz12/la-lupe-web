import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { menuCategories } from '../src/features/menu/menu-data';

test('Taquiza uses a fresh image URL consistently without changing other dish images', () => {
  const items = menuCategories.flatMap(category => category.items);
  assert.equal(items.find(item => item.id === 'taquiza')?.image, '/dishes/taquiza-e4ea759b.webp');
  assert.equal(items.find(item => item.id === 'guacamole-con-chicharron')?.image, '/dishes/guacamole-con-chicharron.webp');
  for (const file of ['src/features/essence/components/essence-page.tsx', 'src/features/presentation/components/hero-dish-slides.tsx']) {
    const source = readFileSync(file, 'utf8');
    assert.ok(source.includes('/dishes/taquiza-e4ea759b.webp'), file);
    assert.ok(!source.includes('/dishes/taquiza.webp'), file);
  }
});
