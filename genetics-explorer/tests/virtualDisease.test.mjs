import test from 'node:test';
import assert from 'node:assert/strict';
import { createVirtualProfile, validateVirtualProfile } from '../lib/virtualDisease.js';
import { MECHANISMS } from '../lib/DiseaseEngine.js';
import { createSimulation, advanceSimulation, applyIntervention } from '../lib/simulation.js';
test('virtual inputs whitelist abstract controls, bound values and retain deterministic replay', () => {
  const profile = createVirtualProfile({ severity: 400, transmission: -9, durationSteps: 200, genome: 'ATCG', mutationTarget: 'real target', teaching: { mystery: true } });
  assert.ok(validateVirtualProfile(profile));
  assert.equal(profile.educationalParameters.severity, 100);
  assert.equal(profile.educationalParameters.transmission, 0);
  assert.equal(profile.educationalParameters.durationSteps, 30);
  assert.equal(profile.genome, undefined);
  assert.equal(profile.mutationTarget, undefined);
  let state = createSimulation(profile.id, { seed: 44 }, profile);
  for (let i = 0; i < 4; i++) state = advanceSimulation(state);
  assert.deepEqual(advanceSimulation(JSON.parse(JSON.stringify(state))), advanceSimulation(state));
  const restart = createSimulation(state.diseaseScenarioId, state.config, state.initialScenarioConfig);
  assert.equal(restart.day, 0);
  assert.deepEqual(restart.scenarioConfig, profile);
});
test('eight mechanisms have differentiated states and noninfectious cases cannot spread', () => {
  const results = MECHANISMS.map((mechanism) => {
    const profile = createVirtualProfile({ mechanism, severity: 52 });
    let state = createSimulation(profile.id, { seed: 21 }, profile);
    for (let i = 0; i < 8; i++) state = advanceSimulation(state);
    assert.ok(Object.values(state.metrics).every((v) => Number.isFinite(v) && v >= 0 && v <= 100));
    if (!mechanism.startsWith('infectious/')) {
      assert.equal(state.metrics.pathogenLoad, 0);
      assert.equal(profile.contagious, false);
      assert.equal(applyIntervention(state, 'containment'), state);
    }
    return JSON.stringify(state.metrics);
  });
  assert.ok(new Set(results).size >= 6);
});
