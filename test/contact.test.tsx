import assert from 'node:assert/strict';
import test from 'node:test';
import { whatsappUrl } from '../src/shared/config/contact';

test('whatsappUrl keeps only digits and encodes the prefilled message', () => {
  assert.equal(whatsappUrl('+57 (300) 123-4567', 'Hola, ¿hay mesa?'), 'https://wa.me/573001234567?text=Hola%2C%20%C2%BFhay%20mesa%3F');
});

test('whatsappUrl returns null when no number is configured', () => {
  assert.equal(whatsappUrl('', 'Hola'), null);
  assert.equal(whatsappUrl('  ', 'Hola'), null);
});
