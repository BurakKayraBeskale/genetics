import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, advanceSimulation, applyIntervention } from '../lib/simulation.js';
import { STORAGE_KEY, saveCase, updateCase, deleteCase, getAllCases, getCase, toggleStar, createSnapshot, restoreSnapshot, restartSavedCase } from '../services/savedCases.js';
function storage() { const entries = new Map(); return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) }; }
function dayFour() { let state = createSimulation('influenza', { seed: 987 }); for (let i = 0; i < 4; i++) state = advanceSimulation(state); return applyIntervention(state, 'containment'); }

test('day four starred case preserves full state, persists refresh and continues deterministically', () => {
  const db = storage(); const state = dayFour();
  const saved = saveCase({ state, name: 'Gün 4 gözlemi', teacherNote: 'Sınıfta tartış', isStarred: true }, db);
  assert.equal(saved.code, 'FLU-001'); assert.equal(saved.snapshot.day, 4); assert.equal(saved.isStarred, true);
  const refreshed = getAllCases(db)[0]; assert.deepEqual(refreshed, saved);
  const restored = restoreSnapshot(refreshed.snapshot);
  assert.deepEqual(restored, createSnapshot(state));
  assert.deepEqual(advanceSimulation(restored), advanceSimulation(state));
  assert.equal(advanceSimulation(restored).day, 5);
  state.metrics.pathogenLoad = 99; state.doctorNotes[0].text = 'Changed';
  assert.notEqual(saved.snapshot.metrics.pathogenLoad, 99); assert.notEqual(saved.snapshot.doctorNotes[0].text, 'Changed');
});
test('restart uses same seed and initial coefficients, clears intervention and previous history', () => {
  const db = storage(); const state = dayFour(); state.initialScenarioConfig.growth = 1.18;
  const saved = saveCase({ state }, db); const fresh = restartSavedCase(saved);
  assert.equal(fresh.day, 0); assert.equal(fresh.seed, state.seed);
  assert.equal(fresh.scenarioConfig.growth, 1.18);
  assert.deepEqual(fresh.interventions, []); assert.deepEqual(fresh.publicHealthDecisions, []);
  assert.equal(fresh.timeline.length, 1); assert.equal(fresh.timeline[0].day, 0);
  const expected=createSimulation(saved.diseaseScenarioId,saved.snapshot.config,saved.snapshot.initialScenarioConfig);
  assert.deepEqual(fresh.symptoms,expected.symptoms);assert.deepEqual(fresh.metrics,expected.metrics);
});
test('teacher edits, remove star, delete and refresh retain stable codes and counters', () => {
  const db = storage(); const saved = saveCase({ state: dayFour(), isStarred: true }, db);
  assert.equal(toggleStar(saved.id, db).isStarred, false);
  assert.equal(getAllCases(db).filter((item) => item.isStarred).length, 0);
  const updated = updateCase(saved.id, { teacherNote: 'Yeni not', code: 'MIX-001' }, db);
  assert.equal(updated.code, saved.code); assert.equal(getCase(saved.id, db).teacherNote, 'Yeni not');
  assert.equal(deleteCase(saved.id, db), true); assert.equal(getCase(saved.id, db), null);
  assert.deepEqual(getAllCases(db), []);
  const next = saveCase({ state: dayFour() }, db); assert.equal(next.code, 'FLU-002'); assert.notEqual(next.id, saved.id);
});
test('per-category counters avoid collisions and stale counters recover from stored records', () => {
  const db = storage(); const a = saveCase({ state: dayFour() }, db);
  const b = saveCase({ state: createSimulation('bacterial') }, db); assert.equal(b.code, 'BAC-001');
  const data = JSON.parse(db.getItem(STORAGE_KEY)); data.counters.FLU = 0; db.setItem(STORAGE_KEY, JSON.stringify(data));
  assert.equal(saveCase({ state: dayFour() }, db).code, 'FLU-002');
  assert.equal(getCase(a.id, db).code, 'FLU-001');
});
test('corrupt, old or malformed data never crashes reads or silently overwrites evidence', () => {
  const db = storage();
  for (const raw of ['broken JSON', JSON.stringify({ schemaVersion: 9, cases: [] })]) {
    db.setItem(STORAGE_KEY, raw); assert.deepEqual(getAllCases(db), []);
    assert.throws(() => saveCase({ state: dayFour() }, db), /bozuk|eski/); assert.equal(db.getItem(STORAGE_KEY), raw);
  }
  db.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, counters: { FLU: 1, GEN: 0, VIR: 0, BAC: 0, MIX: 0 }, cases: [{ bad: true }] }));
  const before = db.getItem(STORAGE_KEY); assert.deepEqual(getAllCases(db), []);
  assert.throws(() => deleteCase('bad', db), /bozuk|eski/); assert.equal(db.getItem(STORAGE_KEY), before);
});
test('snapshot rejects invalid metrics/timeline/config and localStorage errors are surfaced', () => {
  const state = dayFour();
  assert.throws(() => createSnapshot({ ...state, metrics: { ...state.metrics, pathogenLoad: NaN } }));
  assert.throws(() => createSnapshot({ ...state, timeline: [{ ...state.timeline[0], day: 100 }] }));
  assert.throws(() => createSnapshot({ ...state, config: { ...state.config, runtime: () => null } }));
  assert.throws(() => saveCase({ state }, { getItem: () => null, setItem: () => { throw new Error('quota'); } }), /kaydedilemedi/);
  assert.throws(() => getAllCases({ getItem: () => { throw new Error('denied'); } }), /okunamadı/);
  const snapshot = createSnapshot({ ...state, callback: () => null, runtime: new Map() });
  assert.equal(Object.hasOwn(snapshot, 'callback'), false); assert.equal(Object.hasOwn(snapshot, 'runtime'), false);
});

test('genetic protein function and mechanism metadata survive archive and resume', () => {
  const db = storage(); let state = createSimulation('cystic-fibrosis', {seed: 123});
  for (let day = 0; day < 4; day++) state = advanceSimulation(state);
  const saved = saveCase({state, name:'CFTR eğitim vakası'}, db);
  assert.equal(saved.category, 'genetic');
  const restored = restoreSnapshot(getCase(saved.id, db).snapshot);
  assert.equal(restored.metrics.proteinFunction, state.metrics.proteinFunction);
  assert.deepEqual(restored.scenarioConfig.dnaRelation, state.scenarioConfig.dnaRelation);
  assert.deepEqual(advanceSimulation(restored), advanceSimulation(state));
  assert.equal(restartSavedCase(saved).scenarioConfig.contagious, false);
});
