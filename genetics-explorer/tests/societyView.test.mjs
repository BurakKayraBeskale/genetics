import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveSocietyView } from '../lib/societyView.js';
const model = (activeCases, extra = {}) => deriveSocietyView({ population: 1000, activeCases, recovered: 0, newCases: 0, spread: 0, contagious: true, ...extra });
test('ten figures make 1 red = 10% and 4 red = 40%', () => {
  assert.equal(model(100).counts.sick, 1); assert.equal(model(100).sickPercent, 10);
  assert.equal(model(400).counts.sick, 4); assert.equal(model(400).sickPercent, 40);
});
test('zero, full and small shares preserve quantization rather than forcing red', () => {
  assert.equal(model(0).counts.sick, 0); assert.equal(model(1000).counts.sick, 10);
  assert.equal(model(47).counts.sick, 0); assert.equal(model(47).actualSickPercent, 4.7);
  assert.equal(model(51).counts.sick, 1); assert.equal(model(51).actualSickPercent, 5.1);
});
test('status shares always total ten and risk respects remaining space', () => {
  for (const active of [0, 400, 900, 1000, 1500]) {
    const view = model(active, { recovered: 800, newCases: 40, spread: 80 });
    assert.equal(view.people.length, 10);
    assert.equal(Object.values(view.counts).reduce((sum, value) => sum + value, 0), 10);
    assert.ok(view.counts.risk >= 0);
  }
  assert.equal(model(100, { newCases: 1, spread: 80 }).counts.risk, 3);
});
test('noncontagious profiles never imply community transmission', () => {
  const view = model(400, { contagious: false, newCases: 30, spread: 80, recovered: 500 });
  assert.equal(view.contagious, false); assert.equal(view.counts.sick, 0); assert.equal(view.counts.risk, 0);
});
test('history delta and invalid population are bounded', () => {
  assert.equal(model(100, { history: [{ spread: 12 }, { spread: 20 }], spread: 20 }).spreadDelta, 8);
  assert.equal(deriveSocietyView({ population: 0, activeCases: 10 }).actualSickPercent, 0);
});
