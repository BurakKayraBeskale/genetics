const clamp = (value, max) => Math.min(max, Math.max(0, Number(value) || 0));
/** Ten-person teaching view; counts are quantized, never real contacts. */
export function deriveSocietyView(outbreak = {}) {
  const population = Math.max(0, Number(outbreak.population) || 0);
  const contagious = outbreak.contagious !== false;
  const actualSickPercent = population ? clamp(outbreak.activeCases, population) / population * 100 : 0;
  const actualRecoveredPercent = population ? clamp(outbreak.recovered, population) / population * 100 : 0;
  const sick = contagious ? Math.round(actualSickPercent / 10) : 0;
  const recovered = contagious ? Math.min(10 - sick, Math.round(actualRecoveredPercent / 10)) : 0;
  const riskBucket = Number(outbreak.spread) >= 65 ? 3 : Number(outbreak.spread) >= 30 ? 2 : 1;
  const risk = contagious && Number(outbreak.newCases) > 0 ? Math.min(10 - sick - recovered, riskBucket) : 0;
  const healthy = 10 - sick - recovered - risk;
  const counts = { sick, healthy, risk, recovered };
  const people = Object.entries(counts).flatMap(([status, count]) => Array.from({ length: count }, () => status));
  const history = Array.isArray(outbreak.history) ? outbreak.history : [];
  const previous = history.length > 1 ? history.at(-2) : null;
  return { contagious, population, counts, people, sickPercent: sick * 10, recoveredPercent: recovered * 10,
    actualSickPercent, actualRecoveredPercent, newCases: clamp(outbreak.newCases, population),
    spreadDelta: previous ? (Number(outbreak.spread) || 0) - (Number(previous.spread) || 0) : null };
}
