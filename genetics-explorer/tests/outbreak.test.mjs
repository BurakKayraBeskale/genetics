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

test('adaptive response bulletin follows actual profile threshold crossing exactly once', () => {
  let state = createSimulation();
  let crossingDay = null;
  for (let step = 0; step < state.config.durationDays && !state.finalOutcome; step++) {
    const previous = state;
    state = enrichObservations(previous, advanceSimulation(previous));
    if ((previous.metrics.adaptiveImmunity || 0) < 1 && state.metrics.adaptiveImmunity >= 1) crossingDay = state.day;
  }
  assert.notEqual(crossingDay, null);
  const responses = state.bulletinHistory.filter(item => item.id?.endsWith('metric:adaptiveImmunity:rise'));
  assert.equal(responses.length, 1);
  assert.equal(responses[0].day, crossingDay);
  assert.ok(responses[0].text.includes('Kazanılmış bağışıklık'));
});
