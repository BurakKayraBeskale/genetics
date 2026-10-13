import { applyProfileTrajectory } from './diseaseTrajectory.js';
import { applyCaseNarrative } from './CaseEventEngine.js';
export { getProfileOrganEffects } from './diseaseTrajectory.js';
/** Mechanism strategies use abstract learning units, never clinical predictions. */
export const MECHANISMS = ['infectious/viral', 'infectious/bacterial', 'infectious/mixed', 'genetic', 'autoimmune', 'metabolic', 'neurological', 'oncology'];
export const mechanismOf = (profile) => profile.mechanism || ({ viral: 'infectious/viral', bacterial: 'infectious/bacterial', mixed: 'infectious/mixed' }[profile.category]) || profile.category;
const clamp = (v) => Math.round(Math.max(0, Math.min(100, v)) * 10) / 10;
const base = { pathogenLoad: 0, infectedCells: 0, innateImmunity: 0, adaptiveImmunity: 0, antibodyLevel: 0, inflammation: 5, tissueDamage: 4 };
const parameter = (p, key, fallback) => Number.isFinite(p.educationalParameters?.[key]) ? p.educationalParameters[key] : fallback;
const strategy = {
  autoimmune: {
    metric: 'autoimmuneActivity', initial: 24, label: 'Otoimmün aktivite',
    evolve: (old, p, support, immune) => clamp(old.autoimmuneActivity + parameter(p, 'inflammation', 45) * .035 - (support ? 1.3 : 0) + (immune ? 1 : 0)),
    damage: (value) => value * .024,
    note: 'Öz dokulara yönelen bağışıklık aktivitesi ve inflamasyonu karşılaştırın. Bağışıklık yanıtını artırmak bu modelde aktiviteyi artırabilir.',
  },
  metabolic: {
    metric: 'metabolicImbalance', initial: 30, label: 'Metabolik dengesizlik',
    evolve: (old, p, support) => clamp(old.metabolicImbalance + parameter(p, 'severity', 45) * .025 - (support ? 2 : .25)),
    damage: (value) => value * .022,
    note: 'Metabolik denge ile organ işlevi arasındaki soyut ilişki inceleniyor; antikor düzeyi hastalığın temel göstergesi değildir.',
  },
  neurological: {
    metric: 'neuralFunction', initial: 78, label: 'Sinir dokusu işlevi',
    evolve: (old, p, support) => clamp(old.neuralFunction - parameter(p, 'tissueDamage', 40) * .028 + (support ? .5 : 0)),
    damage: (value) => (100 - value) * .021,
    note: 'Sinir dokusu işlevi ile belirtilerin ilişkisi gösteriliyor. Zaman adımları gerçek hastalık süresi değildir.',
  },
  oncology: {
    metric: 'tumorBurden', initial: 16, label: 'Anormal hücre yükü',
    evolve: (old, p, support) => clamp(old.tumorBurden * (1.02 + parameter(p, 'severity', 50) * .0004) - (support ? .1 : 0)),
    damage: (value) => value * .025,
    note: 'Hücre çoğalması ile doku yükü karşılaştırılıyor. Soyut destek müdahalesi tümörü tedavi etmez; klinik tedavi etkisi modellenmez.',
  },
};
export function initialMechanismMetrics(profile, previous) {
  const mechanism = mechanismOf(profile);
  if (mechanism.startsWith('infectious/')) return previous;
  if (mechanism === 'genetic') return { ...previous, proteinFunction: profile.proteinBaseline ?? 55 };
  const selected = strategy[mechanism];
  return selected ? { ...base, [selected.metric]: selected.initial } : previous;
}
function advanceNonInfectious(state, day) {
  const p = state.scenarioConfig;
  const selected = strategy[mechanismOf(p)];
  if (!selected) return null; // infectious and genetic trajectories retain their existing strategy
  const active = (kind) => state.interventions.some((i) => i.kind === kind && day - i.day <= 3);
  const support = active('support');
  const value = selected.evolve(state.metrics, p, support, active('immune'));
  const tissueDamage = clamp(state.metrics.tissueDamage + selected.damage(value) - (support ? .4 : 0));
  const inflammation = clamp(tissueDamage * .35 + (mechanismOf(p) === 'autoimmune' ? value * .5 : parameter(p, 'inflammation', 15) * .15));
  const systems = p.affectedSystems || ['systemic'];
  const symptoms = day < parameter(p, 'incubationSteps', 1) ? ['Başlangıç gözlemi; belirgin bulgu yok'] : (p.typicalSymptoms?.length ? p.typicalSymptoms.slice(0, Math.min(p.typicalSymptoms.length, 1 + Math.floor(day / 3))) : systems.map((s) => `${s} sistemi işlev gözlemi`));
  const note = { day, text: selected.note };
  const finalOutcome = day >= state.config.durationDays ? { day, label: `${selected.label} öğrenme modeli tamamlandı`, summary: 'Soyut mekanizma karşılaştırmasıdır. Gerçek hastalık süresi, prognoz, tedavi başarısı veya sağkalım olasılığı değildir.' } : null;
  return { ...state, day, metrics: { ...base, [selected.metric]: value, tissueDamage, inflammation }, symptoms, currentDiagnosis: `${selected.label} mekanizması inceleniyor`, diagnosisConfidence: 0, doctorNotes: [...state.doctorNotes, note], events: [...state.events, { day, text: `${selected.label} öğrenme adımı tamamlandı.` }], bulletinHistory: [...state.bulletinHistory, ...(day % 3 === 0 ? [{ day, text: 'Bulaşıcı olmayan mekanizma: toplumda enfeksiyon yayılımı hesaplanmaz.' }] : [])], finalOutcome };
}
const noise = (seed, day) => { let value = (seed ^ Math.imul(day + 1, 2654435761)) >>> 0; value = Math.imul(value ^ (value >>> 16), 2246822507) >>> 0; return (value % 1000) / 1000; };
function advanceInfectious(state, day) {
  const scenario = state.scenarioConfig;
  const old = state.metrics;
const active = (kind) => state.interventions.some((item) => item.kind === kind && day - item.day <= 3);
  const jitter = noise(state.seed, day) - 0.5;
  const innate = clamp(old.innateImmunity + (old.pathogenLoad > 10 ? 6 : -3) * scenario.immuneRate + (active('immune') ? 3 : 0));
  const adaptive = clamp(old.adaptiveImmunity + (day > 3 ? 9 * scenario.immuneRate : 0) + (active('immune') ? 2 : 0));
  const antibodies = clamp(old.antibodyLevel + (day > 5 ? 8 : 0));
  const pathogen = clamp(old.pathogenLoad * scenario.growth - innate * 0.09 - adaptive * 0.13 - antibodies * 0.07 + jitter * 3 - (active('containment') ? 4 : 0));
  const infected = clamp(old.infectedCells * 0.65 + pathogen * 0.32);
  const inflammation = clamp(old.inflammation * 0.58 + infected * 0.2 + innate * 0.15 + (scenario.synthetic ? (scenario.educationalParameters.inflammation - 35) * .05 : 0));
  const damage = clamp(old.tissueDamage + Math.max(0, inflammation - 30) * 0.12 - (pathogen < 15 ? 3 : 0) - (active('support') ? 2 : 0) + (scenario.synthetic ? scenario.educationalParameters.tissueDamage * .01 : 0));
  const symptoms = [];
  const visibleOnset = scenario.synthetic ? day >= scenario.educationalParameters.incubationSteps : true;
  const profile = scenario.symptomProfile || { respiratory: 20 };
  if (visibleOnset && pathogen > (profile.respiratory ?? 101)) symptoms.push('Solunum yolu belirtileri');
  if (visibleOnset && pathogen > (profile.digestive ?? 101) && day >= (profile.onsetDay || 1)) symptoms.push('Gastrointestinal belirtiler');
  if (visibleOnset && inflammation > (profile.neurological ?? 101)) symptoms.push('Nörolojik bölgede etki gözlemi');
  if (visibleOnset && inflammation > (profile.systemic ?? 20)) symptoms.push('İnflamatuvar yanıt');
  if (visibleOnset && infected > 15) symptoms.push('Halsizlik');
  if (visibleOnset && damage > 20) symptoms.push('Doku stresi');
  if (scenario.synthetic && visibleOnset && !symptoms.length) symptoms.push(...scenario.affectedSystems.map((system) => `${system} sistemi işlev gözlemi`));
  if (!symptoms.length) symptoms.push(day > 5 ? 'Toparlanma eğilimi' : 'Hafif bulgular');
  const confidence = Math.min(70, 15 + day * 4);
  const currentDiagnosis = day < 3 ? 'İzlem sürüyor' : symptoms.includes('Gastrointestinal belirtiler') ? 'Sindirim sistemi tutulumu hipotezi; etken ayrımı için ek veri gerekli' : symptoms.includes('Nörolojik bölgede etki gözlemi') ? 'Nörolojik tutulum hipotezi; ek gözlem gerekli' : 'Enfeksiyöz süreç hipotezi; etken kesinleşmedi';
  const note = { day, text: symptoms.includes('Gastrointestinal belirtiler') && !state.symptoms.includes('Gastrointestinal belirtiler') ? 'Yeni gastrointestinal bulgular gözlendi. Solunum ağırlıklı başlangıç hipotezini yeniden değerlendirin; bu bulgu tek başına etkeni belirlemez.' : pathogen > old.pathogenLoad ? 'Etken yükü yükseliyor; bağışıklık yanıtını karşılaştırın.' : 'Etken yükü azalıyor; adaptif yanıt ve antikor düzeyini karşılaştırın.' };
  const bulletin = day % 3 === 0 ? [{ day, text: `Gün ${day}: ${pathogen > 40 ? 'Modelde yüksek etken yükü gözlendi.' : 'Günlük bağışıklık gözlemleri güncellendi.'}` }] : [];
  const finalOutcome = day >= state.config.durationDays ? { day, label: pathogen < 15 ? 'Toparlanma eğilimi' : 'İzlem gerektiren model sonucu', summary: 'Sonuç; seçilen eğitim katsayıları, tohum ve soyut müdahalelerin model içindeki etkisini gösterir.' } : null;
  const next = { ...state, day, metrics: { pathogenLoad: pathogen, infectedCells: infected, innateImmunity: innate, adaptiveImmunity: adaptive, antibodyLevel: antibodies, inflammation, tissueDamage: damage }, symptoms, currentDiagnosis, diagnosisConfidence: confidence, doctorNotes: [...state.doctorNotes, note], events: [...state.events, { day, text: `Gün ${day} gözlemi tamamlandı.` }], bulletinHistory: [...state.bulletinHistory, ...bulletin], finalOutcome };
  return next;
}
function advanceGenetic(state, day) {
  const scenario = state.scenarioConfig;
  const supported = state.interventions.some((item) => item.kind === 'support' && day - item.day <= 3);
  const proteinFunction = clamp(state.metrics.proteinFunction - (scenario.tissueRate ?? 1.5) * 0.35 + (supported ? 0.4 : 0));
  const tissueDamage = clamp(state.metrics.tissueDamage + (scenario.tissueRate ?? 1.5) * (1 - proteinFunction / 100) + (noise(state.seed, day) - 0.5) * 0.4 - (supported ? 0.6 : 0));
  const symptoms = scenario.affectedSystems.map((system) => ({ systemic: 'Oksijen taşınması / sistemik doku etkisi', respiratory: 'Solunum dokusu işlev etkisi', digestive: 'Sindirim dokusu işlev etkisi', neurological: 'Sinir dokusu işlev etkisi', muscular: 'Kas dokusu işlev etkisi' }[system] || `${system} dokusu işlev etkisi`));
  const finalOutcome = day >= state.config.durationDays ? { day, label: 'Protein–doku ilişkisi gözlemi tamamlandı', summary: 'Soyut işlev modelidir; gerçek klinik seyir veya tedavi sonucu öngörmez.' } : null;
  const note = { day, text: 'Protein işlevi ile doku stresini karşılaştırın. Bağışıklık ve yayılım müdahaleleri kalıtsal varyantı değiştirmez.' };
  const next = { ...state, day, metrics: { pathogenLoad: 0, infectedCells: 0, innateImmunity: 0, adaptiveImmunity: 0, antibodyLevel: 0, proteinFunction, tissueDamage, inflammation: clamp(tissueDamage * 0.5) }, symptoms, currentDiagnosis: 'Protein işlevi–doku etkisi ilişkisi inceleniyor', diagnosisConfidence: 0, doctorNotes: [...state.doctorNotes, note], events: [...state.events, { day, text: 'Kalıtsal işlev modeli öğrenme adımı tamamlandı.' }], bulletinHistory: [...state.bulletinHistory, ...(day % 3 === 0 ? [note] : [])], finalOutcome };
  return next;
}
const strategies = Object.freeze({
  'infectious/viral': advanceInfectious,
  'infectious/bacterial': advanceInfectious,
  'infectious/mixed': advanceInfectious,
  genetic: advanceGenetic,
  autoimmune: advanceNonInfectious,
  metabolic: advanceNonInfectious,
  neurological: advanceNonInfectious,
  oncology: advanceNonInfectious,
});
export function advanceMechanism(state, day) {
  const run = strategies[mechanismOf(state.scenarioConfig)];
  if (!run) throw new Error('Desteklenmeyen hastalık mekanizması.');
  const biological = applyProfileTrajectory(state, run(state, day));
  // Compatibility histories now come from observations, never daily flavor text.
  const next={...biological,doctorNotes:state.doctorNotes||[],events:state.events||[],bulletinHistory:state.bulletinHistory||[]};
  return applyCaseNarrative(state,next);
}
export const DiseaseEngine = Object.freeze({ mechanisms: MECHANISMS, strategies, mechanismOf, initialMetrics: initialMechanismMetrics, advance: advanceMechanism });
