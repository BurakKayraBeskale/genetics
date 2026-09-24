import test from 'node:test';
import assert from 'node:assert/strict';
import { dnaToMrna, proteinNamesFromDNA, classifyMutation } from '../lib/genetics.js';

const original = 'ATGGAATTTCCGAAAGCTGACCTGTAA';
const replace = (index, base) => original.slice(0, index) + base + original.slice(index + 1);

test('coding DNA transcribes and translates to the expected teaching sequence', () => {
  assert.equal(dnaToMrna(original), 'AUGGAAUUUCCGAAAGCUGACCUGUAA');
  assert.deepEqual(proteinNamesFromDNA(original), ['Met', 'Glu', 'Phe', 'Pro', 'Lys', 'Ala', 'Asp', 'Leu', 'Stop']);
});
for (const [label, mutated, effect, changed] of [
  ['silent GAA to GAG', replace(5, 'G'), 'Sessiz mutasyon', false],
  ['missense GAA to CAA', replace(3, 'C'), 'Yanlış anlamlı mutasyon', true],
  ['nonsense GAA to TAA', replace(3, 'T'), 'Anlamsız mutasyon', true],
  ['insertion before codon two', original.slice(0, 3) + 'A' + original.slice(3), 'Çerçeve kayması', true],
  ['deletion in codon two', original.slice(0, 3) + original.slice(4), 'Çerçeve kayması', true],
]) {
  test(label, () => {
    const result = classifyMutation(original, mutated);
    assert.equal(result.effect, effect);
    assert.equal(result.proteinChanged, changed);
  });
}
test('reset restores unchanged protein analysis', () => {
  assert.equal(classifyMutation(original, original).proteinChanged, false);
  assert.equal(classifyMutation(original, original).effect, 'Mutasyon yok');
});
