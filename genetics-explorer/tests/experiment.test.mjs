import test from 'node:test';
import assert from 'node:assert/strict';
import { initialExperiment, ORIGINAL, editExperiment, sequenceOf, codingSequence, analyzeExperiment, regionMap, displayedBase } from '../lib/experiment.js';
import { dnaToMrna, proteinNamesFromDNA } from '../lib/genetics.js';
const edit = (state, kind, id, rest = {}) => editExperiment(state, { kind, id, side: 0, ...rest });

test('mini-gene has 27 bases and a coherent spliced reading frame', () => {
  assert.equal(ORIGINAL.length, 27);
  assert.equal(codingSequence(ORIGINAL), 'ATGGAATTTCCGGACTAA');
  assert.deepEqual(proteinNamesFromDNA(codingSequence(ORIGINAL)), ['Met','Glu','Phe','Pro','Asp','Stop']);
});
test('AP extraction preserves sequence, opposite base, identity and region', () => {
  const before = initialExperiment();
  const after = edit(before, 'damage', 'exon-1:4');
  assert.equal(sequenceOf(after.tokens), sequenceOf(before.tokens));
  assert.deepEqual(after.tokens[7].ap, [true, false]);
  assert.equal(displayedBase(after.tokens[7], 1), 'T');
  assert.deepEqual(before.tokens[7].ap, [false, false]);
  assert.equal(analyzeExperiment(after).effect, 'Abazik (AP) bölge');
  assert.equal(analyzeExperiment(after).proteinChanged, null);
  assert.equal(edit(after, 'damage', 'exon-1:4'), after);
});
test('complementary strand damage stays on the selected strand', () => {
  const after = edit(initialExperiment(), 'damage', 'exon-1:4', { side: 1 });
  assert.deepEqual(after.tokens[7].ap, [false, true]);
  assert.equal(sequenceOf(after.tokens), sequenceOf(ORIGINAL));
});
test('adenine deletion changes DNA, mature mRNA, downstream codons and protein', () => {
  const before = initialExperiment();
  assert.equal(before.tokens[7].base, 'A');
  const after = edit(before, 'delete', 'exon-1:4');
  assert.equal(after.tokens.length, 26);
  const coding = codingSequence(after.tokens);
  assert.equal(coding, 'ATGGATTTCCGGACTAA');
  assert.equal(dnaToMrna(coding), 'AUGGAUUUCCGGACUAA');
  assert.deepEqual(proteinNamesFromDNA(coding), ['Met','Asp','Phe','Arg','Thr']);
  assert.equal(analyzeExperiment(after).effect, 'Çerçeve kayması');
  assert.equal(analyzeExperiment(after).proteinChanged, true);
  assert.equal(after.tokens[7].id, 'exon-1:5');
  assert.equal(before.tokens.length, 27);
});
for (const kind of ['delete','insert','substitute']) for (const region of ['intron','promoter']) {
  test(region + ' ' + kind + ' is not a direct coding frameshift', () => {
    const id = region + ':0';
    const after = edit(initialExperiment(), kind, id, { base: 'C', newId: 'new' });
    assert.equal(codingSequence(after.tokens), codingSequence(ORIGINAL));
    const analysis = analyzeExperiment(after);
    assert.equal(analysis.proteinChanged, false);
    assert.equal(analysis.effect, region === 'intron' ? 'Olası splicing etkisi' : 'Olası ekspresyon etkisi');
  });
}
for (const [id, base, effect] of [['exon-1:5','G','Sessiz mutasyon'], ['exon-1:3','C','Yanlış anlamlı mutasyon'], ['exon-1:3','T','Anlamsız mutasyon']]) {
  test(effect + ' derives from the spliced coding sequence', () => assert.equal(analyzeExperiment(edit(initialExperiment(), 'substitute', id, { base })).effect, effect));
}
test('complement substitution updates reference strand consistently', () => {
  const after = edit(initialExperiment(), 'substitute', 'exon-1:4', { side: 1, base: 'G' });
  assert.equal(after.tokens[7].base, 'C');
  assert.equal(displayedBase(after.tokens[7], 1), 'G');
});
test('damage remains attached to stable identities after deletion before it', () => {
  let state = edit(initialExperiment(), 'damage', 'exon-2:1');
  state = edit(state, 'delete', 'promoter:0');
  assert.deepEqual(state.tokens.find(t => t.id === 'exon-2:1').ap, [true, false]);
  assert.equal(regionMap(state.tokens).find(r => r.id === 'exon-2').from, 20);
});
test('removing an entire intron retains correct exon annotations and no false frameshift', () => {
  let state = initialExperiment();
  for (let i=0;i<6;i++) state = edit(state, 'delete', 'intron:' + i);
  assert.equal(regionMap(state.tokens).find(r => r.id === 'intron').empty, true);
  assert.equal(analyzeExperiment(state).proteinChanged, false);
});
test('mixed coding and noncoding edits retain coding effect plus region notes', () => {
  let state = edit(initialExperiment(), 'delete', 'intron:0');
  state = edit(state, 'delete', 'exon-1:4');
  const a = analyzeExperiment(state);
  assert.equal(a.effect, 'Çerçeve kayması');
  assert.ok(a.notes.some(n => n.includes('İntron')));
});
