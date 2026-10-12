import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, advanceSimulation } from '../lib/simulation.js';
import { computeOutbreak, applyPublicHealthDecision, enrichObservations } from '../lib/outbreak.js';
import { createSnapshot, restoreSnapshot } from '../services/savedCases.js';
test('outbreak policy survives snapshot, has bounded deterministic effects and cannot stack same day', () => {
  let plain = createSimulation();
  let policy = applyPublicHealthDecision(plain, 'isolation');
  assert.equal(applyPublicHealthDecision(policy, 'isolation'), policy);
  for (let day = 0; day < 10; day++) { plain = advanceSimulation(plain); policy = advanceSimulation(policy); }
  const current = computeOutbreak(policy);
  assert.deepEqual(computeOutbreak(restoreSnapshot(createSnapshot(policy))), current);
  assert.ok(current.spread < computeOutbreak(plain).spread);
  assert.ok(current.economy < computeOutbreak(plain).economy);
  assert.ok(current.social < computeOutbreak(plain).social);
  for (const point of current.history) for (const key of ['spread', 'health', 'economy', 'social', 'hospitalPressure']) assert.ok(point[key] >= 0 && point[key] <= 100);
  assert.deepEqual(policy.metrics, plain.metrics);
});
test('new observations produce archived bulletins without repeated same-day additions', () => {
  const original = createSimulation();
  const next = enrichObservations(original, advanceSimulation(original));
  assert.ok(next.bulletinHistory.length > 0);
  assert.equal(enrichObservations(next, next), next);
  assert.deepEqual(restoreSnapshot(createSnapshot(next)).bulletinHistory, next.bulletinHistory);
});

test('adaptive response crossing creates day-four bulletin from metrics', () => {
  let state = createSimulation();
  for (let day = 0; day < 4; day++) state = enrichObservations(state, advanceSimulation(state));
  assert.ok(state.bulletinHistory.some((item) => item.day === 4 && item.text.includes('Kazanılmış bağışıklık')));
  const next = enrichObservations(state, advanceSimulation(state));
  assert.equal(next.bulletinHistory.filter((item) => item.text.includes('Kazanılmış bağışıklık')).length, 1);
});
