/** Deterministic classroom model. Metrics are abstract 0–100 teaching units. */
export const SCENARIOS = [
  { id: 'influenza', name: 'Influenza', category: 'viral', codePrefix: 'FLU', description: 'Viral yük ve bağışıklık yanıtının günlere göre gelişimi.', initialDiagnosis: 'Influenza olasılığı', growth: 1.22, immuneRate: 1.1 },
  { id: 'bacterial', name: 'Bakteriyel enfeksiyon', category: 'bacterial', codePrefix: 'BAC', description: 'Bakteriyel yük ve doğal bağışıklık yanıtı.', initialDiagnosis: 'Bakteriyel enfeksiyon olasılığı', growth: 1.25, immuneRate: 0.9 },
  { id: 'mixed', name: 'Karma enfeksiyon', category: 'mixed', codePrefix: 'MIX', description: 'Birlikte gelişen etkenlerin soyut karşılaştırması.', initialDiagnosis: 'Karma enfeksiyon olasılığı', growth: 1.31, immuneRate: 0.85 },
];
export const INTERVENTIONS = [
  { id: 'support', label: 'Destek yanıtını artır', description: 'Soyut modelde doku toparlanmasını destekler.' },
  { id: 'immune', label: 'Bağışıklık yanıtını destekle', description: 'Soyut modelde bağışıklık yanıtı katsayısını artırır.' },
  { id: 'containment', label: 'Yayılımı sınırla', description: 'Sınıf modelindeki yeni maruziyet katsayısını azaltır.' },
];
const clamp = (value) => Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
const clone = (value) => JSON.parse(JSON.stringify(value));
const noise = (seed, day) => { let value = (seed ^ Math.imul(day + 1, 2654435761)) >>> 0; value = Math.imul(value ^ (value >>> 16), 2246822507) >>> 0; return (value % 1000) / 1000; };
const entry = (state) => ({ day: state.day, metrics: { ...state.metrics }, symptoms: [...state.symptoms], currentDiagnosis: state.currentDiagnosis, diagnosisConfidence: state.diagnosisConfidence });
export function createSimulation(scenarioId = 'influenza', input = {}, initialScenarioConfig) {
  const preset = SCENARIOS.find((item) => item.id === scenarioId);
  const scenario = preset && initialScenarioConfig?.id === scenarioId && Number.isFinite(initialScenarioConfig.growth) && Number.isFinite(initialScenarioConfig.immuneRate) ? { ...preset, growth: initialScenarioConfig.growth, immuneRate: initialScenarioConfig.immuneRate } : preset;
  if (!scenario) throw new Error('Bilinmeyen hastalık senaryosu.');
  const config = { seed: Number.isFinite(input.seed) ? Math.trunc(input.seed) >>> 0 : 42, durationDays: Math.max(7, Math.min(30, Math.trunc(input.durationDays || 14))), speedMs: Math.max(500, Math.min(10000, Number(input.speedMs) || 1400)) };
  const state = {
    schemaVersion: 1, diseaseScenarioId: scenario.id, scenarioConfig: clone(scenario), initialScenarioConfig: clone(scenario), config, seed: config.seed,
    day: 0, status: 'paused', running: false, paused: true,
    metrics: { pathogenLoad: 18, infectedCells: 8, innateImmunity: 12, adaptiveImmunity: 0, antibodyLevel: 0, inflammation: 5, tissueDamage: 0 },
    symptoms: ['Başlangıç gözlemi'], currentDiagnosis: 'İzlem sürüyor', preliminaryDiagnosis: scenario.initialDiagnosis, diagnosisConfidence: 15,
    doctorNotes: [{ day: 0, text: 'Bu soyut eğitim modeli klinik tanı veya tedavi önerisi üretmez.' }],
    events: [{ day: 0, text: 'Simülasyon başlangıç durumuna hazır.' }], bulletinHistory: [], interventions: [], publicHealthDecisions: [], timeline: [], finalOutcome: null,
  };
  state.timeline = [entry(state)];
  return state;
}
export function setSimulationStatus(state, status) {
  if (state.finalOutcome) return { ...state, status: 'completed', running: false, paused: false };
  return { ...state, status, running: status === 'running', paused: status === 'paused' };
}
export function applyIntervention(state, kind) {
  const intervention = INTERVENTIONS.find((item) => item.id === kind);
  if (!intervention || state.finalOutcome) return state;
  const record = { day: state.day, kind, label: intervention.label };
  return { ...state, interventions: [...state.interventions, record], publicHealthDecisions: kind === 'containment' ? [...state.publicHealthDecisions, record] : state.publicHealthDecisions, events: [...state.events, { day: state.day, text: intervention.label }] };
}
export function advanceSimulation(state) {
  if (state.finalOutcome) return state;
  const day = state.day + 1;
  const scenario = state.scenarioConfig;
  const old = state.metrics;
  const active = (kind) => state.interventions.some((item) => item.kind === kind && day - item.day <= 3);
  const jitter = noise(state.seed, day) - 0.5;
  const innate = clamp(old.innateImmunity + (old.pathogenLoad > 10 ? 6 : -3) * scenario.immuneRate + (active('immune') ? 3 : 0));
  const adaptive = clamp(old.adaptiveImmunity + (day > 3 ? 9 * scenario.immuneRate : 0) + (active('immune') ? 2 : 0));
  const antibodies = clamp(old.antibodyLevel + (day > 5 ? 8 : 0));
  const pathogen = clamp(old.pathogenLoad * scenario.growth - innate * 0.09 - adaptive * 0.13 - antibodies * 0.07 + jitter * 3 - (active('containment') ? 4 : 0));
  const infected = clamp(old.infectedCells * 0.65 + pathogen * 0.32);
  const inflammation = clamp(old.inflammation * 0.58 + infected * 0.2 + innate * 0.15);
  const damage = clamp(old.tissueDamage + Math.max(0, inflammation - 30) * 0.12 - (pathogen < 15 ? 3 : 0) - (active('support') ? 2 : 0));
  const symptoms = [];
  if (pathogen > 20) symptoms.push('Solunum yolu belirtileri');
  if (inflammation > 20) symptoms.push('İnflamatuvar yanıt');
  if (infected > 15) symptoms.push('Halsizlik');
  if (damage > 20) symptoms.push('Doku stresi');
  if (!symptoms.length) symptoms.push(day > 5 ? 'Toparlanma eğilimi' : 'Hafif bulgular');
  const confidence = Math.min(95, 15 + day * 6);
  const currentDiagnosis = day < 3 ? 'İzlem sürüyor' : `${scenario.name} ile uyumlu model bulguları`;
  const note = { day, text: pathogen > old.pathogenLoad ? 'Etken yükü yükseliyor; bağışıklık yanıtını karşılaştırın.' : 'Etken yükü azalıyor; adaptif yanıt ve antikor düzeyini karşılaştırın.' };
  const bulletin = day % 3 === 0 ? [{ day, text: `Gün ${day}: ${pathogen > 40 ? 'Modelde yüksek etken yükü gözlendi.' : 'Günlük bağışıklık gözlemleri güncellendi.'}` }] : [];
  const finalOutcome = day >= state.config.durationDays ? { day, label: pathogen < 15 ? 'Toparlanma eğilimi' : 'İzlem gerektiren model sonucu', summary: 'Sonuç; seçilen eğitim katsayıları, tohum ve soyut müdahalelerin model içindeki etkisini gösterir.' } : null;
  const next = { ...state, day, metrics: { pathogenLoad: pathogen, infectedCells: infected, innateImmunity: innate, adaptiveImmunity: adaptive, antibodyLevel: antibodies, inflammation, tissueDamage: damage }, symptoms, currentDiagnosis, diagnosisConfidence: confidence, doctorNotes: [...state.doctorNotes, note], events: [...state.events, { day, text: `Gün ${day} gözlemi tamamlandı.` }], bulletinHistory: [...state.bulletinHistory, ...bulletin], finalOutcome };
  next.timeline = [...state.timeline, entry(next)];
  return finalOutcome ? setSimulationStatus(next, 'completed') : next;
}
