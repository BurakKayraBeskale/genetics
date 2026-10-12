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

import { SCENARIOS } from '../lib/simulation.js';
import { computeOutbreak } from '../lib/outbreak.js';
test('expanded scenarios have distinct trajectories and genetic states never create infection', () => {
  assert.ok(SCENARIOS.length >= 15);
  const results = SCENARIOS.map((scenario) => {
    let state = createSimulation(scenario.id, { seed: 812 });
    for (let day = 0; day < 5; day++) state = advanceSimulation(state);
    assert.deepEqual(advanceSimulation(JSON.parse(JSON.stringify(state))), advanceSimulation(state));
    assert.deepEqual(createSimulation(state.diseaseScenarioId, state.config, state.initialScenarioConfig).initialScenarioConfig, state.initialScenarioConfig);
    if (scenario.category === 'genetic') {
      assert.equal(state.metrics.pathogenLoad, 0);
      assert.equal(state.metrics.infectedCells, 0);
      assert.ok(state.metrics.proteinFunction > 0);
      const outbreak = computeOutbreak(state);
      assert.equal(outbreak.contagious, false);
      assert.equal(outbreak.activeCases, 0);
      assert.equal(outbreak.severeCases, 0);
      if (['sickle-cell', 'cystic-fibrosis', 'huntington', 'dmd'].includes(scenario.id)) assert.equal(scenario.dnaRelation.presetId, scenario.id);
    } else assert.ok(!state.currentDiagnosis.includes(scenario.name));
    return JSON.stringify(state.metrics);
  });
  assert.ok(new Set(results).size >= 14);
});
test('atypical gastrointestinal event requires day-four observed evidence', () => {
  let state = createSimulation('atypical-influenza');
  for (let day = 0; day < 3; day++) state = advanceSimulation(state);
  assert.ok(!state.symptoms.includes('Gastrointestinal belirtiler'));
  state = advanceSimulation(state);
  assert.ok(state.symptoms.includes('Gastrointestinal belirtiler'));
  assert.ok(state.doctorNotes.at(-1).text.includes('Yeni gastrointestinal'));
});
