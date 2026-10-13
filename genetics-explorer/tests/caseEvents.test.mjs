import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCaseEvents } from '../lib/caseEvents.js';
import { computeOutbreak, enrichObservations, applyPublicHealthDecision } from '../lib/outbreak.js';
const state = (day, extra = {}) => ({ day, scenarioConfig: { mechanism: 'infectious/viral', affectedSystems: ['respiratory'], contagious: true }, metrics: { pathogenLoad: 40, antibodyLevel: 0, tissueDamage: 0, adaptiveImmunity: 0 }, symptoms: [], timeline: [], doctorNotes: [], events: [], bulletinHistory: [], publicHealthDecisions: [], ...extra });
test('actual symptom changes and target organ crossings produce distinct physician and bulletin copy', () => {
  const delta = generateCaseEvents(state(0), state(1, { symptoms: ['Öksürük'], organEffects: { lungs: .7 } }));
  assert.ok(delta.doctorNotes.some(item => item.text.includes('Öksürük')));
  assert.ok(delta.doctorNotes.some(item => item.text.includes('Akciğer')));
  assert.notEqual(delta.doctorNotes[0].text, delta.bulletins[0].text);
  const resolved = generateCaseEvents(state(1, { symptoms: ['Öksürük'] }), state(2));
  assert.ok(resolved.doctorNotes.some(item => item.text.includes('artık gösterilmeyen')));
});
test('UI enrichment does not duplicate engine events on same transition', () => {
  const before = state(0), next = state(1, { symptoms: ['Ateş'] });
  const enriched = enrichObservations(before, next);
  assert.deepEqual(enrichObservations(before, enriched), enriched);
});
test('non-spreading infections generate no population messages or synthetic outbreak', () => {
  const before = state(0), next = state(1, { scenarioConfig: { contagious: true, publicSpreadApplicable: false } });
  assert.equal(computeOutbreak(next).activeCases, 0);
  const delta = generateCaseEvents(before, next, { previousOutbreak: { spread: 0 }, nextOutbreak: { contagious: true, spread: 80, hospitalPressure: 90 } });
  assert.ok(delta.bulletins.every(item => !item.id.includes('population')));
});
test('profile transmission parameter affects spread without changing biological metrics', () => {
  const timeline = [{ day: 1, metrics: { pathogenLoad: 40, antibodyLevel: 0, tissueDamage: 0 } }];
  const low = state(1, { timeline, scenarioConfig: { educationalParameters: { transmissionTendency: 10 } } });
  const high = state(1, { timeline, scenarioConfig: { educationalParameters: { transmissionTendency: 80 } } });
  assert.ok(computeOutbreak(high).spread > computeOutbreak(low).spread);
  assert.deepEqual(low.metrics, high.metrics);
});
test('route-specific infection disables casual-contact forecast but remains an infection', () => {
  const next = state(1, { scenarioConfig: { contagious: true, publicSpreadApplicable: true, spreadMode: 'route-specific' } });
  const result = computeOutbreak(next);
  assert.equal(result.contagious, false); assert.equal(result.diseaseContagious, true);
  assert.equal(result.populationSpreadUnsupported, true); assert.equal(result.activeCases, 0);
  assert.notEqual(result.risk, 'Bulaşıcı değil');
  assert.equal(applyPublicHealthDecision(next, 'isolation'), next);
  const delta = generateCaseEvents(state(0), next, { previousOutbreak: { spread: 0 }, nextOutbreak: { contagious: true, spread: 90, hospitalPressure: 90 } });
  assert.ok(delta.bulletins.every(item => !item.id.includes('population')));
});
test('virtual transmission fallback alters community curve', () => {
  const timeline = [{ day: 1, metrics: { pathogenLoad: 40, antibodyLevel: 0, tissueDamage: 0 } }];
  const make = transmission => state(1, { timeline, scenarioConfig: { contagious: true, educationalParameters: { transmission } } });
  assert.ok(computeOutbreak(make(80)).spread > computeOutbreak(make(10)).spread);
});

