import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, advanceSimulation, applyIntervention } from '../lib/simulation.js';

test('day four JSON restore resumes exactly and restart retains seed but clears history', () => {
  let state = createSimulation('influenza', { seed: 812 });
  state = applyIntervention(state, 'immune');
  for (let day = 0; day < 4; day++) state = advanceSimulation(state);
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(restored.day, 4);
  assert.deepEqual(advanceSimulation(restored), advanceSimulation(state));
  assert.equal(advanceSimulation(restored).day, 5);
  const restart = createSimulation(state.diseaseScenarioId, state.config, state.initialScenarioConfig);
  assert.equal(restart.seed, 812);
  assert.equal(restart.day, 0);
  assert.equal(restart.interventions.length, 0);
  assert.equal(restart.timeline.length, 1);
});

test('classroom model stops at configured final day and keeps bounded metrics', () => {
  let state = createSimulation('mixed');
  for (let day = 0; day < 30; day++) state = advanceSimulation(state);
  assert.equal(state.day, 14);
  assert.equal(state.status, 'completed');
  assert.equal(state.running, false);
  assert.ok(state.finalOutcome);
  assert.ok(Object.values(state.metrics).every((value) => value >= 0 && value <= 100));
  assert.equal(state.timeline.length, 15);
});
