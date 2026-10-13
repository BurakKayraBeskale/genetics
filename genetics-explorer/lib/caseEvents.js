import { getProfileOrganEffects } from './diseaseTrajectory.js';
/** State-derived educational observations; no diagnosis or invented laboratory values. */
const ORGAN_NAMES = { lungs: 'Akciğer', respiratory: 'Solunum', brain: 'Beyin', heart: 'Kalp', blood: 'Dolaşım', digestive: 'Sindirim', intestine: 'Bağırsak', liver: 'Karaciğer', renal: 'Böbrek', kidney: 'Böbrek', pancreas: 'Pankreas', endocrine: 'Endokrin', muscle: 'Kas', skin: 'Deri' };
const FAMILIES = { genetic: 'protein işlevi', autoimmune: 'öz-dokuya yönelen bağışıklık yanıtı', metabolic: 'metabolik denge', neurological: 'sinir sistemi işlevi', oncology: 'hücresel büyüme dengesi', 'infectious/viral': 'viral etken ve bağışıklık yanıtı', 'infectious/bacterial': 'bakteriyel etken ve doku yanıtı', 'infectious/mixed': 'karma etken ve bağışıklık yanıtı' };
const activity = value => Number(typeof value === 'object' ? value?.activity ?? value?.severity ?? value?.stress ?? 0 : value) || 0;
export function generateCaseEvents(previous, next, { previousOutbreak, nextOutbreak } = {}) {
  const result = { doctorNotes: [], bulletins: [], events: [] };
  if (next.day <= previous.day) return result;
  const day = next.day;
  const add = (kind, doctor, bulletin) => {
    const id = `${day}:${kind}`;
    if (doctor) result.doctorNotes.push({ day, id, text: doctor });
    if (bulletin) result.bulletins.push({ day, id, text: bulletin });
    result.events.push({ day, id, text: doctor || bulletin });
  };
  const profile = next.scenarioConfig || {};
  const mechanism = profile.mechanism || profile.family || profile.category;
  const response = FAMILIES[mechanism] || 'hastalığa özgü doku işlevi';
  const placeholder=value=>/başlangıç gözlemi|belirgin semptom gözlenmiyor|hafif bulgular|toparlanma eğilimi/i.test(value);
  const added = (next.symptoms || []).filter(value => !placeholder(value)&&!(previous.symptoms || []).includes(value));
  const resolved = (previous.symptoms || []).filter(value => !(next.symptoms || []).includes(value) && !placeholder(value));
  if (added.length) add('symptom:new', `Yeni belirtiler: ${added.join(', ')}. ${response} ve etkilenen sistemlerle birlikte izleniyor.`, `Yeni vaka gözlemi: ${added.join(', ')}.`);
  if (resolved.length) add('symptom:resolved', `İzlemde artık gösterilmeyen belirtiler: ${resolved.join(', ')}. Bu değişim tek başına tam iyileşme anlamına gelmez.`, `Belirti seyri: ${resolved.join(', ')} bu adımda geriledi.`);
  if (day === 1) add('mechanism:baseline', `Başlangıç izlemi: ${response}. Hedef sistemler: ${(profile.affectedSystems || []).join(', ') || 'genel doku'}.`, `İlk takip adımı kaydedildi; belirtiler ve organ yanıtı birlikte değerlendiriliyor.`);
  const effectsOf = state => {
    const effects = state.organEffects || getProfileOrganEffects(state.scenarioConfig || {}, state.metrics || {}, state.day, state.config?.durationDays || 14);
    return Array.isArray(effects) ? effects.reduce((map,effect)=>{if(!map[effect.organ]||activity(effect)>activity(map[effect.organ]))map[effect.organ]=effect;return map;},{}) : effects;
  };
  const beforeEffects = effectsOf(previous), afterEffects = effectsOf(next);
  if((previous.metrics?.tissueDamage||0)<20&&(next.metrics?.tissueDamage||0)>=20&&profile.complicationFlags?.length)add('complication:discussion','Doku stresi artışı, bu profilin olası komplikasyon başlıklarını tartışmayı gerektirir. Bu olay bir komplikasyonun gerçekleştiğini veya klinik riskini göstermez.','Eğitim izlemi: doku etkisi ve olası komplikasyon kavramları birlikte inceleniyor.');
  for (const [organ, value] of Object.entries(afterEffects)) {
    const current = activity(value), before = activity(beforeEffects[organ]);
    const label = ORGAN_NAMES[organ] || organ;
    const normalized = Math.max(current, before) <= 1;
    const onset = normalized ? .05 : 5, significant = normalized ? .6 : 60;
    if (before < onset && current >= onset) add(`organ:${organ}:onset`, `${label} görünümünde hedef doku yanıtı başladı. Renk ve yoğunluk eğitim modelinin göreli değeridir.`, `${label} hedefi izlem görünümüne eklendi.`);
    else if (before < significant && current >= significant) add(`organ:${organ}:stress`, `${label} hedefinde göreli doku etkisi belirginleşti. Bu eşik klinik hasar ölçümü veya kesin komplikasyon değildir.`, `${label} doku yanıtı eğitim modelinde belirgin düzeye ulaştı.`);
    else if (before >= significant && current < significant) add(`organ:${organ}:easing`, `${label} hedefinde göreli doku etkisi azaldı; işlev takibi sürüyor.`, `${label} görünümünde doku etkisi gerilemeye başladı.`);
  }
  for (const organ of Object.keys(beforeEffects)) {
    if (!(organ in afterEffects) && activity(beforeEffects[organ]) > .05) add(`organ:${organ}:inactive`, `${ORGAN_NAMES[organ] || organ} hedefinin görsel etki penceresi bu eğitim adımında kapandı; bu, klinik iyileşme ölçümü değildir.`, `${ORGAN_NAMES[organ] || organ} görünümünün takip aşaması değişti.`);
  }
  for (const [key, threshold, text] of [
    ['adaptiveImmunity', 1, 'Kazanılmış bağışıklık yanıtı belirginleşmeye başladı.'],
    ['tissueDamage', 20, 'Göreli doku stresi eğitim eşiğini geçti.'],
    ['antibodyLevel', 40, 'Modelde antikor yanıtı belirginleşti.'],
  ]) {
    if ((previous.metrics?.[key] || 0) < threshold && (next.metrics?.[key] || 0) >= threshold) add(`metric:${key}:rise`, `${text} ${response} ile birlikte değerlendiriliyor.`, text);
  }
  if (!previous.finalOutcome && next.finalOutcome) add('outcome', 'Eğitim zaman çizelgesi tamamlandı. Sonuç, modeldeki işlev ve doku göstergelerinin özetidir; klinik prognoz değildir.', 'Vaka izlem dönemi tamamlandı; sonuç analizi hazır.');
  if (nextOutbreak?.contagious && !nextOutbreak.populationSpreadUnsupported && profile.publicSpreadApplicable !== false && profile.spreadMode !== 'route-specific') {
    if ((previousOutbreak?.spread || 0) < 30 && nextOutbreak.spread >= 30) add('population:spread', null, 'Toplum modelinde yayılım orta düzey eşiğini geçti. Bu soyut sınıf nüfusunun göstergesidir.');
    if ((previousOutbreak?.hospitalPressure || 0) < 65 && nextOutbreak.hospitalPressure >= 65) add('population:hospital', null, 'Toplum modelinde hastane baskısı yüksek düzey eşiğini geçti.');
  }
  return result;
}




