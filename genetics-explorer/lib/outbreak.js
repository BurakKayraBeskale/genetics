export const PUBLIC_HEALTH_DECISIONS = [
  { id: 'testing', label: 'Test kapasitesini artır', health: 0.10, economy: -3, social: -1 },
  { id: 'tracing', label: 'Temas takibi', health: 0.12, economy: -2, social: -2 },
  { id: 'isolation', label: 'İzolasyon', health: 0.22, economy: -5, social: -7 },
  { id: 'events', label: 'Etkinlikleri sınırla', health: 0.16, economy: -6, social: -8 },
  { id: 'travel', label: 'Seyahati sınırla', health: 0.14, economy: -7, social: -6 },
  { id: 'care', label: 'Bakım kapasitesini artır', health: 0.12, economy: -5, social: 2 },
];
const bound = (value) => Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
/** Population teaching indicators; not case counts or clinical forecasts. */
export function computeOutbreak(state) {
  if (state.scenarioConfig?.contagious === false || state.scenarioConfig?.category === 'genetic') {
    const current = { day: state.day, population: 10000, spread: 0, health: 100, economy: 100, social: 100, hospitalPressure: 0, activeCases: 0, newCases: 0, recovered: 0, severeCases: 0, hospitalCapacity: 300, hospitalLoad: 0 };
    return { ...current, contagious: false, risk: 'Bulaşıcı değil', history: (state.timeline || []).map((point) => ({ ...current, day: point.day })), decisions: [], disclaimer: 'Bu bulaşıcı olmayan mekanizma enfeksiyon salgını değildir. Bu ekran bireysel doku yükünü toplum yayılımı olarak saymaz.' };
  }
  let spread = 12, health = 88, economy = 100, social = 100;
  const timeline = state.timeline || [];
  const history = [{ day: 0, spread, health, economy, social, hospitalPressure: 0 }];
  for (const point of timeline.filter((item) => item.day > 0 && item.day <= state.day)) {
    const active = (state.publicHealthDecisions || []).filter((item) => item.day < point.day && point.day - item.day <= 4);
    const policies = active.map((item) => PUBLIC_HEALTH_DECISIONS.find((policy) => policy.id === item.kind)).filter(Boolean);
    const protection = Math.min(0.65, policies.reduce((sum, policy) => sum + policy.health, 0) + (active.some((item) => item.kind === 'containment') ? 0.15 : 0));
    const load = point.metrics.pathogenLoad;
    spread = bound(spread + load * 0.1 * (1 - protection) - point.metrics.antibodyLevel * 0.06 - protection * 6);
    const hospitalPressure = bound(spread * 0.55 + point.metrics.tissueDamage * 0.45);
    health = bound(100 - hospitalPressure * 0.7 - spread * 0.18 + policies.filter((item) => item.id === 'care').length * 3);
    economy = bound(economy - spread * 0.025 + policies.reduce((sum, item) => sum + item.economy, 0) * 0.3 + (load < 15 ? 1 : 0));
    social = bound(social - spread * 0.02 + policies.reduce((sum, item) => sum + item.social, 0) * 0.3 + (load < 15 ? 1 : 0));
    history.push({ day: point.day, spread, health, economy, social, hospitalPressure });
  }
    // Synthetic classroom population, explicitly unrelated to clinical case forecasting.
  const population = 10000;
  let recovered = 0, previousActive = 0;
  for (const point of history) {
    point.population = population;
    point.activeCases = Math.round(point.spread / 100 * population * 0.25);
    point.newCases = point.day === 0 ? point.activeCases : Math.max(0, point.activeCases - previousActive);
    recovered = Math.min(population - point.activeCases, recovered + Math.max(0, previousActive - point.activeCases));
    point.recovered = recovered;
    point.hospitalCapacity = 300 + 50 * (state.publicHealthDecisions || []).filter((item) => item.kind === 'care' && item.day < point.day && point.day - item.day <= 4).length;
    point.hospitalLoad = Math.round(point.hospitalPressure / 100 * 350);
    point.severeCases = Math.min(point.activeCases, point.hospitalLoad);
    previousActive = point.activeCases;
  }
  const current = history.at(-1);
  return { ...current, contagious: true, risk: current.spread >= 65 ? 'Yüksek' : current.spread >= 30 ? 'Orta' : 'Düşük', history, decisions: state.publicHealthDecisions || [], disclaimer: 'Toplum göstergeleri 0–100 arası soyut eğitim değerleridir.' };
}
export function applyPublicHealthDecision(state, kind) {
  const policy = PUBLIC_HEALTH_DECISIONS.find((item) => item.id === kind);
  if (state.scenarioConfig?.contagious === false || !policy || state.finalOutcome || state.publicHealthDecisions.some((item) => item.kind === kind && item.day === state.day)) return state;
  const record = { day: state.day, kind, label: policy.label };
  return { ...state, publicHealthDecisions: [...state.publicHealthDecisions, record], events: [...state.events, { day: state.day, text: `Toplum kararı: ${policy.label}. Etki bir sonraki gün başlar.` }] };
}
export function enrichObservations(previous, next) {
  if (next.day === previous.day) return next;
  const newSymptoms = next.symptoms.filter((symptom) => !previous.symptoms.includes(symptom));
  const thresholds = [['adaptiveImmunity', 1, 'Kazanılmış bağışıklık yanıtı belirginleşmeye başladı.'], ['pathogenLoad', 40, 'Etken yükü yüksek düzey eşiğini geçti.'], ['tissueDamage', 20, 'Doku stresi eşiği geçildi.'], ['antibodyLevel', 40, 'Antikor yanıtı belirginleşti.']];
  const messages = thresholds.filter(([key, value]) => previous.metrics[key] < value && next.metrics[key] >= value).map(([, , message]) => message);
  const previousOutbreak = computeOutbreak(previous);
  const nextOutbreak = computeOutbreak(next);
  if (previousOutbreak.spread < 30 && nextOutbreak.spread >= 30) messages.push('Toplum modelinde yayılım orta düzey eşiğini geçti.');
  if (previousOutbreak.hospitalPressure < 65 && nextOutbreak.hospitalPressure >= 65) messages.push('Toplum modelinde hastane baskısı yüksek düzey eşiğini geçti.');
  if (newSymptoms.length) messages.unshift(`Yeni gözlem: ${newSymptoms.join(', ')}.`);
  if (!messages.length) return next;
  const text = messages.join(' ');
  return { ...next, doctorNotes: [...next.doctorNotes, { day: next.day, text }], bulletinHistory: [...next.bulletinHistory, { day: next.day, text }], events: [...next.events, { day: next.day, text }] };
}


