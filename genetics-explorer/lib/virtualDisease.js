import { MECHANISMS } from './DiseaseEngine.js';
const SYSTEMS = ['respiratory', 'digestive', 'neurological', 'muscular', 'cardiovascular', 'endocrine', 'renal', 'skin', 'systemic'];
const bounded = (value, fallback, min = 0, max = 100) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Math.round(Number(value)))) : fallback;
/** Accept only abstract controls. No sequence, molecular target or production instructions are stored. */
export function createVirtualProfile(input = {}) {
  const mechanism = MECHANISMS.includes(input.mechanism) ? input.mechanism : 'infectious/viral';
  const infectious = mechanism.startsWith('infectious/');
  const targetSystem = SYSTEMS.includes(input.targetSystem) ? input.targetSystem : 'respiratory';
  const secondarySystem = SYSTEMS.includes(input.secondarySystem) && input.secondarySystem !== targetSystem ? input.secondarySystem : null;
  const educationalParameters = {
    transmission: infectious ? bounded(input.transmission, 40) : 0,
    incubationSteps: bounded(input.incubationSteps, 3, 0, 14), severity: bounded(input.severity, 45),
    inflammation: bounded(input.inflammation, 35), immuneEscape: infectious ? bounded(input.immuneEscape, 25) : 0,
    tissueDamage: bounded(input.tissueDamage, 35), durationSteps: bounded(input.durationSteps, 14, 7, 30), targetSystem, secondarySystem,
  };
  const id = `virtual:${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
  return {
    id, name: typeof input.name === 'string' && input.name.trim() ? input.name.replace(/[<>]/g, '').trim().slice(0, 80) : 'Kurgu vaka', synthetic: true, mechanism, category: infectious ? mechanism.split('/')[1] : mechanism,
    codePrefix: 'VIR', contagious: infectious && educationalParameters.transmission > 0,
    growth: ({ 'infectious/viral': 1.08, 'infectious/bacterial': 1.12, 'infectious/mixed': 1.17 }[mechanism] || 1) + educationalParameters.severity * .002 + educationalParameters.transmission * .0005,
    immuneRate: infectious ? 1.2 - educationalParameters.immuneEscape * .007 : 0,
    proteinBaseline: 80 - educationalParameters.severity * .5, tissueRate: .5 + educationalParameters.tissueDamage * .035,
    affectedSystems: [targetSystem, ...(secondarySystem ? [secondarySystem] : [])],
    symptomProfile: { [targetSystem]: 14, ...(secondarySystem ? { [secondarySystem]: 24 } : {}), onsetDay: educationalParameters.incubationSteps },
    typicalSymptoms: ['Hedef sistemde soyut işlev değişikliği', 'Modelde doku stresi'],
    description: 'Kurgu eğitim vakası: gerçek bir hastalık veya patojen tasarımı değildir.',
    initialDiagnosis: 'Kurgu vaka: mekanizma gözlemi', immuneResponseType: infectious ? 'Soyut doğal ve adaptif yanıt' : 'Mekanizmaya özgü soyut yanıt',
    cellularMechanism: 'Soyut sınıf, doku ve işlev katsayılarının eğitim amaçlı karşılaştırması.',
    educationalTimeline: '7–30 öğrenme adımı; gerçek klinik zaman değildir.',
    dnaRelation: { kind: 'abstract', explanation: 'Yalnızca genetik etki kavramları tartışılır; gerçek genom, mutasyon hedefi veya üretim talimatı içermez.' },
    sources: [], educationalParameters, teaching: { mystery: input.teaching?.mystery === true },
  };
}
export function validateVirtualProfile(profile) {
  if (!profile || profile.synthetic !== true || !/^virtual:[a-zA-Z0-9-]+$/.test(profile.id) || !MECHANISMS.includes(profile.mechanism)) return false;
  const p = profile.educationalParameters;
  if (!p || !SYSTEMS.includes(p.targetSystem) || !Number.isFinite(profile.growth) || !Number.isFinite(profile.immuneRate)) return false;
  return ['transmission', 'severity', 'inflammation', 'immuneEscape', 'tissueDamage'].every((k) => Number.isFinite(p[k]) && p[k] >= 0 && p[k] <= 100) && Number.isInteger(p.incubationSteps) && p.incubationSteps >= 0 && p.incubationSteps <= 14 && Number.isInteger(p.durationSteps) && p.durationSteps >= 7 && p.durationSteps <= 30;
}
