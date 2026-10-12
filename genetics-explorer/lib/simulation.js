import { SCENARIOS } from '../data/diseaseProfiles.js';
import { mechanismOf, initialMechanismMetrics, advanceMechanism } from './DiseaseEngine.js';
import { validateVirtualProfile } from './virtualDisease.js';
export { SCENARIOS };
export const INTERVENTIONS = [
  { id: 'support', label: 'Destek yanıtını artır', description: 'Soyut modelde doku toparlanmasını destekler.' },
  { id: 'immune', label: 'Bağışıklık yanıtını destekle', description: 'Soyut modelde bağışıklık yanıtı katsayısını artırır.' },
  { id: 'containment', label: 'Yayılımı sınırla', description: 'Sınıf modelindeki yeni maruziyet katsayısını azaltır.' },
];
const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const entry = (state) => ({ day: state.day, metrics: { ...state.metrics }, symptoms: [...state.symptoms], currentDiagnosis: state.currentDiagnosis, diagnosisConfidence: state.diagnosisConfidence });
export function createSimulation(scenarioId = 'influenza', input = {}, initialScenarioConfig) {
  const preset = SCENARIOS.find((item) => item.id === scenarioId) || (validateVirtualProfile(initialScenarioConfig) && initialScenarioConfig.id === scenarioId ? clone(initialScenarioConfig) : undefined);
  const scenario = preset && initialScenarioConfig?.id === scenarioId && Number.isFinite(initialScenarioConfig.growth) && Number.isFinite(initialScenarioConfig.immuneRate) ? { ...preset, ...clone(initialScenarioConfig), category: preset.category, contagious: preset.contagious, dnaRelation: clone(preset.dnaRelation), affectedSystems: clone(preset.affectedSystems) } : preset;
  if (!scenario) throw new Error('Bilinmeyen hastalık senaryosu.');
  const config = { seed: Number.isFinite(input.seed) ? Math.trunc(input.seed) >>> 0 : 42, durationDays: Math.max(7, Math.min(30, Math.trunc(input.durationDays || scenario.educationalParameters?.durationSteps || 14))), speedMs: Math.max(500, Math.min(10000, Number(input.speedMs) || 1400)) };
  const state = {
    schemaVersion: 1, diseaseScenarioId: scenario.id, scenarioConfig: clone(scenario), initialScenarioConfig: clone(scenario), config, seed: config.seed,
    day: 0, status: 'paused', running: false, paused: true,
    metrics: { pathogenLoad: 18, infectedCells: 8, innateImmunity: 12, adaptiveImmunity: 0, antibodyLevel: 0, inflammation: 5, tissueDamage: 0 },
    symptoms: ['Başlangıç gözlemi'], currentDiagnosis: 'İzlem sürüyor', preliminaryDiagnosis: scenario.teaching?.mystery ? 'Gizemli vaka: gözlemleri karşılaştırın' : scenario.initialDiagnosis, diagnosisConfidence: 15,
    doctorNotes: [{ day: 0, text: 'Bu soyut eğitim modeli klinik tanı veya tedavi önerisi üretmez.' }],
    events: [{ day: 0, text: 'Simülasyon başlangıç durumuna hazır.' }], bulletinHistory: [], interventions: [], publicHealthDecisions: [], timeline: [], finalOutcome: null,
  };
  if (mechanismOf(scenario) === 'genetic') {
    state.metrics = { pathogenLoad: 0, infectedCells: 0, innateImmunity: 0, adaptiveImmunity: 0, antibodyLevel: 0, inflammation: 5, tissueDamage: 4, proteinFunction: scenario.proteinBaseline };
    state.symptoms = ['Kalıtsal protein işlevi başlangıç gözlemi'];
    state.doctorNotes.push({ day: 0, text: 'Zaman çizelgesi soyut öğrenme adımlarını gösterir; gerçek klinik süre değildir. Bu senaryo bulaşıcı değildir.' });
  }
  state.metrics = initialMechanismMetrics(scenario, state.metrics);
  state.timeline = [entry(state)];
  return state;
}
export function setSimulationStatus(state, status) {
  if (state.finalOutcome) return { ...state, status: 'completed', running: false, paused: false };
  return { ...state, status, running: status === 'running', paused: status === 'paused' };
}
export function applyIntervention(state, kind) {
  const intervention = INTERVENTIONS.find((item) => item.id === kind);
  if (!intervention || state.finalOutcome || (kind === 'containment' && state.scenarioConfig.contagious === false)) return state;
  const record = { day: state.day, kind, label: intervention.label };
  return { ...state, interventions: [...state.interventions, record], publicHealthDecisions: kind === 'containment' ? [...state.publicHealthDecisions, record] : state.publicHealthDecisions, events: [...state.events, { day: state.day, text: intervention.label }] };
}
export function advanceSimulation(state) {
  if (state.finalOutcome) return state;
  const next = advanceMechanism(state, state.day + 1);
  next.timeline = [...state.timeline, entry(next)];
  return next.finalOutcome ? setSimulationStatus(next, 'completed') : next;
}
