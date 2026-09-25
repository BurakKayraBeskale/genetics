import { COMPLEMENT, classifyMutation } from './genetics.js';

// A 27-bp teaching mini-gene: the short regions illustrate structure, not a real gene.
export const REGION_DEFINITIONS = [
  { id: 'promoter', kind: 'promoter', label: 'Promotör', shortLabel: 'PROM', sequence: 'TAT', info: 'RNA polimerazın bağlanmasını ve gen ekspresyonunu etkileyebilen düzenleyici bölge. Protein koduna katılmaz.' },
  { id: 'exon-1', kind: 'exon', label: 'Ekzon 1', shortLabel: 'EKZ1', sequence: 'ATGGAATTTCCG', info: 'Bu eğitim modelinde kodlayan ekzon. Olgun mRNA ve protein hesabına katılır.' },
  { id: 'intron', kind: 'intron', label: 'İntron', shortLabel: 'İNT', sequence: 'GTCCAG', info: 'RNA işlenmesinde çıkarılır. Değişiklikler splicing sinyallerini etkileyebilir; doğrudan frameshift varsayılmaz.' },
  { id: 'exon-2', kind: 'exon', label: 'Ekzon 2', shortLabel: 'EKZ2', sequence: 'GACTAA', info: 'Kodlayan ikinci ekzon; ilk ekzonla birleşerek olgun mRNA dizisini oluşturur.' },
];
export const ORIGINAL = REGION_DEFINITIONS.flatMap(region => [...region.sequence].map((base, offset) => ({ id: region.id + ':' + offset, base, regionId: region.id, kind: region.kind, ap: [false, false] })));
export const initialExperiment = () => ({ tokens: ORIGINAL, events: [] });
export const sequenceOf = tokens => tokens.map(t => t.base).join('');
export const codingSequence = tokens => sequenceOf(tokens.filter(t => t.kind === 'exon'));
export const transcribedSequence = tokens => sequenceOf(tokens.filter(t => t.kind !== 'promoter'));
export const displayedBase = (token, side = 0) => side ? COMPLEMENT[token.base] : token.base;
export const AP_EXPLANATION = 'Bir azotlu baz DNA’dan kaybolduğunda şeker-fosfat omurgası korunabilir ancak abazik/AP bölge oluşur. Bu bir DNA hasarıdır. Hücre genellikle baz eksizyon onarımı mekanizmalarıyla bu bölgeyi onarmaya çalışır. Onarılmazsa replikasyon sırasında yanlış baz eklenmesine veya replikasyonun durmasına neden olabilir.';
export function regionMap(tokens) {
  const regions = REGION_DEFINITIONS.map(region => {
    const indices = tokens.flatMap((t, i) => t.regionId === region.id ? [i] : []);
    return { ...region, from: indices[0] ?? -1, to: indices.at(-1) ?? -1, empty: !indices.length };
  });
  const geneIndices = tokens.flatMap((t, i) => t.kind !== 'promoter' ? [i] : []);
  return [...regions, { id: 'gene', kind: 'gene', label: 'Gen', shortLabel: 'GEN', from: geneIndices[0] ?? -1, to: geneIndices.at(-1) ?? -1, empty: !geneIndices.length, info: 'Ekzon ve intronları kapsar. Protein, kodlayan ekzonların birleştirilmiş dizisinden hesaplanır.' }];
}
export function editExperiment(state, { kind, id, side = 0, base, newId }) {
  const index = state.tokens.findIndex(t => t.id === id);
  if (index < 0) return state;
  const token = state.tokens[index];
  if (kind === 'damage' && token.ap[side]) return state;
  if (kind === 'delete' && state.tokens.length <= 3) return state;
  if (kind === 'insert' && state.tokens.length >= 60) return state;
  if (['substitute', 'insert'].includes(kind) && !COMPLEMENT[base]) return state;
  if (kind === 'substitute' && (token.ap[side] || displayedBase(token, side) === base)) return state;
  const tokens = state.tokens.slice();
  if (kind === 'damage') {
    const ap = [...token.ap]; ap[side] = true;
    tokens[index] = { ...token, ap };
  } else if (kind === 'delete') tokens.splice(index, 1);
  else if (kind === 'substitute') tokens[index] = { ...token, base: side ? COMPLEMENT[base] : base };
  else if (kind === 'insert') tokens.splice(index, 0, { ...token, id: newId, base: side ? COMPLEMENT[base] : base, ap: [false, false] });
  else return state;
  return { tokens, events: [...state.events, { kind, id, side, base: displayedBase(token, side), region: token.kind, regionId: token.regionId, index, target: base }] };
}
export function analyzeExperiment(state) {
  const coding = codingSequence(state.tokens);
  const originalCoding = codingSequence(ORIGINAL);
  const result = classifyMutation(originalCoding, coding);
  const oldById = new Map(ORIGINAL.map(t => [t.id, t]));
  const nowById = new Map(state.tokens.map(t => [t.id, t]));
  const changed = [...ORIGINAL.filter(t => !nowById.has(t.id)), ...state.tokens.filter(t => !oldById.has(t.id) || oldById.get(t.id).base !== t.base)];
  const intron = changed.some(t => t.kind === 'intron');
  const promoter = changed.some(t => t.kind === 'promoter');
  const damage = state.tokens.some(t => t.ap.some(Boolean));
  const codingDamage = state.tokens.some(t => t.kind === 'exon' && t.ap.some(Boolean));
  const notes = [];
  if (intron) notes.push('İntron değişimi olgun mRNA’nın kodlayan dizisine doğrudan katılmaz. Splicing sinyallerini etkileyebilir; ekzon atlanması veya intron tutulması olasılığı bu modelde tahmin edilmez. Bu nedenle doğrudan frameshift sonucu verilmez.');
  if (promoter) notes.push('Promotör değişimi protein kodunu doğrudan değiştirmeyebilir; gen ekspresyonunun miktarını veya başlama zamanını etkileyebilir. Bu model ekspresyon düzeyini hesaplamaz.');
  if (damage) notes.push('AP hasarı dizi delesyonu değildir. Kayıtlı baz dizisi korunur; hasarlı DNA’nın transkripsiyon/replikasyon sonucu bu modelde öngörülmez.');
  if (result.effect === 'Mutasyon yok' && (intron || promoter)) {
    result.effect = intron ? 'Olası splicing etkisi' : 'Olası ekspresyon etkisi';
    result.type = 'Kodlamayan bölge değişimi';
    result.explanation = 'Normal splicing varsayımıyla kodlayan ekzon dizisi ve hesaplanan aminoasit dizisi korunmuştur.';
  }
  if (damage && !changed.length) { result.type = 'DNA hasarı'; result.effect = 'Abazik (AP) bölge'; result.explanation = 'Şeker-fosfat omurgası ve dizi uzunluğu korunur. Baz kaybı, nükleotid silinmesi olarak sayılmaz.'; }
  return { ...result, proteinChanged: codingDamage ? null : result.proteinChanged, notes, coding, originalCoding, damage, codingDamage, intron, promoter };
}
