import { createSimulation } from '../lib/simulation.js';

export const STORAGE_KEY = 'genetik-kesif.saved-cases.v1';
export const SCHEMA_VERSION = 1;
const prefixes = ['FLU', 'GEN', 'VIR', 'BAC', 'MIX', 'AUT', 'MET', 'NEU', 'ONC'];
const categories = ['viral', 'genetic', 'bacterial', 'mixed', 'autoimmune', 'metabolic', 'neurological', 'oncology'];
const metricKeys = ['pathogenLoad', 'infectedCells', 'innateImmunity', 'adaptiveImmunity', 'antibodyLevel', 'inflammation', 'tissueDamage'];
const fail = (message) => { throw new Error(message); };
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
function text(value, limit = 2000) {
  if (typeof value !== 'string' || value.length > limit) fail('Vaka metni geçersiz veya çok uzun.');
  return value;
}
function number(value, max = 100, integer = false) {
  if (!Number.isFinite(value) || value < 0 || value > max || (integer && !Number.isInteger(value))) fail('Vaka sayısal değeri geçersiz.');
  return value;
}
function json(value, depth = 0) {
  if (depth > 12) fail('Vaka verisi fazla iç içe.');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') { if (!Number.isFinite(value)) fail('Vaka verisinde geçersiz sayı.'); return value; }
  if (typeof value === 'string') return text(value, 10000);
  if (Array.isArray(value)) { if (value.length > 5000) fail('Vaka geçmişi çok uzun.'); return value.map((item) => json(item, depth + 1)); }
  if (object(value) && Object.getPrototypeOf(value) === Object.prototype) {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) fail('Geçersiz vaka alanı.');
      result[key] = json(item, depth + 1);
    }
    return result;
  }
  fail('Vaka verisi yalnızca JSON değerleri içerebilir.');
}
function metrics(input) {
  if (!object(input)) fail('Vaka ölçümleri eksik.');
  const result = Object.fromEntries(metricKeys.map((key) => [key, number(input[key])]));
  for (const key of ['proteinFunction','autoimmuneActivity','metabolicImbalance','neuralFunction','tumorBurden']) if (input[key] !== undefined) result[key] = number(input[key]);
  return result;
}
function list(value, mapper) {
  if (!Array.isArray(value) || value.length > 5000) fail('Vaka geçmişi geçersiz.');
  return value.map(mapper);
}
function record(item, day, intervention = false) {
  if (!object(item)) fail('Vaka geçmiş kaydı geçersiz.');
  const result = { day: number(item.day, day, true) };
  return intervention ? { ...result, kind: text(item.kind, 100), label: text(item.label, 200) } : { ...result, text: text(item.text), ...(item.id===undefined?{}:{id:text(item.id,200)}) };
}
function initial(input) {
  if (!object(input) || !object(input.scenarioConfig) || !object(input.config)) fail('Başlangıç ayarları eksik.');
  const scenarioConfig = json(input.scenarioConfig);
  const config = json(input.config);
  number(scenarioConfig.growth, 10); number(scenarioConfig.immuneRate, 10);
  number(config.seed, 4294967295, true); number(config.durationDays, 30, true); number(config.speedMs, 10000);
  if (config.durationDays < 7 || config.speedMs < 500) fail('Simülasyon ayarları geçersiz.');
  const diseaseScenarioId = text(input.diseaseScenarioId, 100);
  if (scenarioConfig.id !== diseaseScenarioId) fail('Senaryo kimliği tutarsız.');
  return { diseaseScenarioId, scenarioConfig, config };
}

const eventTypes=['CLINICAL','LAB','ANATOMY','IMMUNE','PUBLIC_HEALTH','BULLETIN','ALERT'];
const severities=['INFO','NOTICE','IMPORTANT','CRITICAL'];
function knowledge(input) {
 if(input == null) return null;
 if(!object(input)) fail('Vaka hipotez durumu geçersiz.');
 return {currentHypothesis:text(input.currentHypothesis,500),confidence:number(input.confidence),
 supportingEvidence:list(input.supportingEvidence,v=>text(v,2000)),conflictingEvidence:list(input.conflictingEvidence,v=>text(v,2000)),unknowns:list(input.unknowns,v=>text(v,2000))};
}
function clinicalEvent(item,day) {
 if(!object(item)||!eventTypes.includes(item.type)||!severities.includes(item.severity)) fail('Vaka olay türü veya önceliği geçersiz.');
 const result={...json(item),id:text(item.id,200),day:number(item.day,day,true),type:item.type,severity:item.severity,title:text(item.title,500),text:text(item.text),educationalNote:text(item.educationalNote || '',2000)};
 if(!result.id) fail('Vaka olay kimliği eksik.');
 for(const key of ['relatedMetric','relatedOrgan']) if(item[key]!==undefined) result[key]=text(item[key],100);
 if(item.source!==undefined) result.source=json(item.source);
 for(const key of ['metricValue','previousValue','delta']) if(item[key]!==undefined){if(!Number.isFinite(item[key])||Math.abs(item[key])>1000000)fail('Vaka olay ölçümü geçersiz.');result[key]=item[key];}
 return result;
}
function narrativeEvents(input,day,important=false) {
 const ids=new Set();return list(input || [],item=>{const valid=clinicalEvent(item,day);if(ids.has(valid.id))fail('Yinelenen vaka olay kimliği.');ids.add(valid.id);if(important&&!['IMPORTANT','CRITICAL'].includes(valid.severity))fail('Önemli olay önceliği tutarsız.');return valid;});
}
function bulletin(item,day) {
 if(item.type!==undefined)return clinicalEvent(item,day);
 const valid=record(item,day);
 return {...json(item),...valid};
}

/** Explicit, detached JSON snapshot; React/runtime fields are never copied. */
export function createSnapshot(state) {
  if (!object(state)) fail('Simülasyon durumu eksik.');
  if (state.schemaVersion !== undefined && state.schemaVersion !== 1) fail('Desteklenmeyen simülasyon sürümü.');
  const day = number(state.day, 30, true);
  const settings = initial(state);
  const status = state.status;
  if (!['paused', 'running', 'completed'].includes(status) || state.running !== (status === 'running') || state.paused !== (status === 'paused')) fail('Simülasyon çalışma durumu tutarsız.');
  if (state.seed !== settings.config.seed || day > settings.config.durationDays) fail('Simülasyon günü veya tohumu tutarsız.');
  if (!Array.isArray(state.timeline) || state.timeline.length === 0 || state.timeline.at(-1)?.day !== day || state.timeline.some((item, index) => index > 0 && item.day <= state.timeline[index - 1].day)) fail('Vaka zaman çizelgesi tutarsız.');
  const outcome = state.finalOutcome === null ? null : { day: number(state.finalOutcome?.day, day, true), label: text(state.finalOutcome?.label, 200), summary: text(state.finalOutcome?.summary) };
  if ((status === 'completed') !== Boolean(outcome)) fail('Simülasyon sonucu tutarsız.');
  return {
    schemaVersion: 1, ...settings, initialScenarioConfig: initial({ ...settings, scenarioConfig: state.initialScenarioConfig || settings.scenarioConfig }).scenarioConfig, seed: number(state.seed, 4294967295, true),
    day, status, running: state.running, paused: state.paused, metrics: metrics(state.metrics),
    symptoms: list(state.symptoms, (item) => text(item, 200)), currentDiagnosis: text(state.currentDiagnosis, 500), preliminaryDiagnosis: text(state.preliminaryDiagnosis, 500), diagnosisConfidence: number(state.diagnosisConfidence),
    doctorNotes: list(state.doctorNotes, (item) => bulletin(item, day)), events: list(state.events, (item) => bulletin(item, day)), bulletinHistory: list(state.bulletinHistory, (item) => bulletin(item, day)),
    clinicalEvents:narrativeEvents(state.clinicalEvents,day),importantEvents:narrativeEvents(state.importantEvents ?? (state.clinicalEvents || []).filter(e=>['IMPORTANT','CRITICAL'].includes(e.severity)),day,true),knowledgeState:knowledge(state.knowledgeState),hypothesisHistory:list(state.hypothesisHistory || [],item=>({day:number(item.day,day,true),...knowledge(item)})),
    interventions: list(state.interventions, (item) => record(item, day, true)), publicHealthDecisions: list(state.publicHealthDecisions, (item) => record(item, day, true)),
    timeline: list(state.timeline, (item) => ({ day: number(item.day, day, true), metrics: metrics(item.metrics), symptoms: list(item.symptoms, (symptom) => text(symptom, 200)), currentDiagnosis: text(item.currentDiagnosis, 500), diagnosisConfidence: number(item.diagnosisConfidence), knowledgeState:knowledge(item.knowledgeState) })), finalOutcome: outcome,
  };
}
export function restoreSnapshot(snapshot) {
  if (snapshot?.schemaVersion !== 1) fail('Bu vaka sürümü desteklenmiyor.');
  return createSnapshot(snapshot);
}
function storageOrDefault(storage) {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  try { return window.localStorage; } catch { fail('Tarayıcı vaka arşivine erişime izin vermiyor.'); }
}
function empty() { return { schemaVersion: 1, counters: Object.fromEntries(prefixes.map((key) => [key, 0])), cases: [] }; }
function normalizeCase(input) {
  if (!object(input) || input.schemaVersion !== 1 || !categories.includes(input.category)) fail('Vaka kaydı geçersiz.');
  if (!/^(FLU|GEN|VIR|BAC|MIX|AUT|MET|NEU|ONC)-\d{3,}$/.test(input.code)) fail('Vaka kodu geçersiz.');
  number(Number(input.code.split('-')[1]), Number.MAX_SAFE_INTEGER - 2, true);
  if (!input.id || !input.name) fail('Vaka adı veya kimliği eksik.');
  if (typeof input.isStarred !== 'boolean') fail('Vaka yıldız durumu geçersiz.');
  const snapshot = restoreSnapshot(input.snapshot);
  if (input.diseaseScenarioId !== snapshot.diseaseScenarioId) fail('Vaka senaryosu tutarsız.');
  if (![input.createdAt, input.updatedAt].every((date) => typeof date === 'string' && Number.isFinite(Date.parse(date)))) fail('Vaka tarihi geçersiz.');
  return { schemaVersion: 1, id: text(input.id, 150), code: input.code, name: text(input.name, 120), description: text(input.description), category: input.category, diseaseScenarioId: input.diseaseScenarioId, createdAt: input.createdAt, updatedAt: input.updatedAt, isStarred: input.isStarred, teacherNote: text(input.teacherNote), snapshot };
}
function read(storage, strict = false) {
  if (!storage) { if (strict) fail('Vaka kaydetmek için tarayıcı depolaması gerekli.'); return empty(); }
  let raw;
  try { raw = storage.getItem(STORAGE_KEY); } catch { fail('Vaka arşivi okunamadı. Tarayıcı depolama izinlerini kontrol edin.'); }
  if (raw === null) return empty();
  try {
    const data = JSON.parse(raw);
    if (!object(data) || data.schemaVersion !== 1 || !object(data.counters) || !Array.isArray(data.cases)) fail('Arşiv sürümü geçersiz.');
    const counters = Object.fromEntries(prefixes.map((key) => [key, number(data.counters[key] ?? 0, Number.MAX_SAFE_INTEGER - 1, true)]));
    const cases = []; const ids = new Set(); const codes = new Set(); let corrupt = false;
    for (const item of data.cases) {
      try {
        const valid = normalizeCase(item);
        if (ids.has(valid.id) || codes.has(valid.code)) fail('Yinelenen vaka.');
        ids.add(valid.id); codes.add(valid.code); cases.push(valid);
        const [prefix, suffix] = valid.code.split('-'); counters[prefix] = Math.max(counters[prefix], Number(suffix));
      } catch { corrupt = true; }
    }
    if (strict && corrupt) fail('Arşivde bozuk kayıt var.');
    return { schemaVersion: 1, counters, cases };
  } catch {
    if (strict) fail('Arşiv bozuk veya eski sürümde. Mevcut veriler korunuyor; arşivi dışa aktarın veya tarayıcı depolamasını inceleyin.');
    return empty();
  }
}
function write(storage, data) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { fail('Vaka kaydedilemedi. Depolama izni veya boş alanı kontrol edin.'); }
}
export function getAllCases(storage) { return read(storageOrDefault(storage)).cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export function getCase(id, storage) { return getAllCases(storage).find((item) => item.id === id) || null; }
export function saveCase(input, storage) {
  const target = storageOrDefault(storage); const data = read(target, true); const snapshot = createSnapshot(input.state);
  const category = input.category || snapshot.scenarioConfig.category;
  const prefix = snapshot.diseaseScenarioId === 'influenza' ? 'FLU' : ({ genetic: 'GEN', viral: 'VIR', bacterial: 'BAC', mixed: 'MIX', autoimmune: 'AUT', metabolic: 'MET', neurological: 'NEU', oncology: 'ONC' }[category]);
  if (!prefix) fail('Vaka kategorisi geçersiz.');
  const count = ++data.counters[prefix]; const now = new Date().toISOString();
  const id = globalThis.crypto?.randomUUID?.() || `${prefix}-${count}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const saved = normalizeCase({ schemaVersion: 1, id, code: `${prefix}-${String(count).padStart(3, '0')}`, name: input.name?.trim() || snapshot.scenarioConfig.name, description: input.description || snapshot.scenarioConfig.description || '', category, diseaseScenarioId: snapshot.diseaseScenarioId, createdAt: now, updatedAt: now, isStarred: input.isStarred ?? false, teacherNote: input.teacherNote || '', snapshot });
  data.cases.push(saved); write(target, data); return saved;
}
export function updateCase(id, changes, storage) {
  const target = storageOrDefault(storage); const data = read(target, true); const index = data.cases.findIndex((item) => item.id === id);
  if (index < 0) fail('Vaka bulunamadı.');
  const patch = {};
  for (const key of ['name', 'description', 'teacherNote', 'isStarred']) if (Object.hasOwn(changes, key)) patch[key] = changes[key];
  const updated = normalizeCase({ ...data.cases[index], ...patch, updatedAt: new Date().toISOString() });
  data.cases[index] = updated; write(target, data); return updated;
}
export function toggleStar(id, storage) {
  const saved = getCase(id, storage); if (!saved) fail('Vaka bulunamadı.');
  return updateCase(id, { isStarred: !saved.isStarred }, storage);
}
export function deleteCase(id, storage) {
  const target = storageOrDefault(storage); const data = read(target, true); const exists = data.cases.some((item) => item.id === id);
  data.cases = data.cases.filter((item) => item.id !== id); write(target, data); return exists;
}
export function restartSavedCase(savedOrId, storage) {
  const saved = typeof savedOrId === 'string' ? getCase(savedOrId, storage) : savedOrId;
  if (!saved) fail('Vaka bulunamadı.');
  const { initialScenarioConfig: initialConfig } = restoreSnapshot(saved.snapshot);
  const snapshot = restoreSnapshot(saved.snapshot);
  return createSimulation(snapshot.diseaseScenarioId, snapshot.config, initialConfig);
}


