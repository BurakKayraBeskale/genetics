export const COMPLEMENT = { A: 'T', T: 'A', G: 'C', C: 'G' };

export const BASE_INFO = {
  A: {
    name: 'Adenin',
    pair: 'T',
    bonds: 2,
    family: 'Pürin',
    description: 'Adenin, timin ile iki hidrojen bağı kurarak eşleşir.'
  },
  T: {
    name: 'Timin',
    pair: 'A',
    bonds: 2,
    family: 'Pirimidin',
    description: 'Timin, adenin ile iki hidrojen bağı kurarak eşleşir.'
  },
  G: {
    name: 'Guanin',
    pair: 'C',
    bonds: 3,
    family: 'Pürin',
    description: 'Guanin, sitozin ile üç hidrojen bağı kurarak eşleşir.'
  },
  C: {
    name: 'Sitozin',
    pair: 'G',
    bonds: 3,
    family: 'Pirimidin',
    description: 'Sitozin, guanin ile üç hidrojen bağı kurarak eşleşir.'
  }
};

export const CODON_TABLE = {
  UUU:'Phe',UUC:'Phe',UUA:'Leu',UUG:'Leu',
  UCU:'Ser',UCC:'Ser',UCA:'Ser',UCG:'Ser',
  UAU:'Tyr',UAC:'Tyr',UAA:'Stop',UAG:'Stop',
  UGU:'Cys',UGC:'Cys',UGA:'Stop',UGG:'Trp',
  CUU:'Leu',CUC:'Leu',CUA:'Leu',CUG:'Leu',
  CCU:'Pro',CCC:'Pro',CCA:'Pro',CCG:'Pro',
  CAU:'His',CAC:'His',CAA:'Gln',CAG:'Gln',
  CGU:'Arg',CGC:'Arg',CGA:'Arg',CGG:'Arg',
  AUU:'Ile',AUC:'Ile',AUA:'Ile',AUG:'Met',
  ACU:'Thr',ACC:'Thr',ACA:'Thr',ACG:'Thr',
  AAU:'Asn',AAC:'Asn',AAA:'Lys',AAG:'Lys',
  AGU:'Ser',AGC:'Ser',AGA:'Arg',AGG:'Arg',
  GUU:'Val',GUC:'Val',GUA:'Val',GUG:'Val',
  GCU:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',
  GAU:'Asp',GAC:'Asp',GAA:'Glu',GAG:'Glu',
  GGU:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly'
};

export function sanitizeDNA(dna) {
  return (dna || '').toUpperCase().replace(/[^ATGC]/g, '');
}

export function dnaToMrna(dna) {
  return sanitizeDNA(dna).replace(/T/g, 'U');
}

export function translateMrna(mrna, { stopAtStop = true } = {}) {
  const aa = [];
  const clean = (mrna || '').toUpperCase().replace(/[^AUGC]/g, '');
  for (let i = 0; i + 2 < clean.length; i += 3) {
    const codon = clean.slice(i, i + 3);
    const aminoAcid = CODON_TABLE[codon] || '?';
    aa.push({ codon, aminoAcid, index: i / 3 });
    if (stopAtStop && aminoAcid === 'Stop') break;
  }
  return aa;
}

export function proteinNamesFromDNA(dna) {
  return translateMrna(dnaToMrna(dna)).map(x => x.aminoAcid);
}

export function classifyMutation(originalDNA, mutatedDNA) {
  const original = sanitizeDNA(originalDNA);
  const mutated = sanitizeDNA(mutatedDNA);
  const lengthDelta = mutated.length - original.length;
  const oldProtein = proteinNamesFromDNA(original);
  const newProtein = proteinNamesFromDNA(mutated);
  const proteinChanged = oldProtein.join('|') !== newProtein.join('|');

  if (original === mutated) {
    return {
      type: 'Yok',
      effect: 'Mutasyon yok',
      proteinChanged: false,
      explanation: 'DNA dizisi başlangıçtaki diziyle aynıdır; herhangi bir mutasyon uygulanmadı.'
    };
  }

  const mutationType = lengthDelta > 0 ? 'Ekleme' : lengthDelta < 0 ? 'Silme' : 'Baz değişimi';

  if (lengthDelta !== 0 && Math.abs(lengthDelta) % 3 !== 0) {
    return {
      type: mutationType,
      effect: 'Çerçeve kayması',
      proteinChanged: true,
      explanation: 'Eklenen veya silinen baz sayısı üçün katı olmadığı için okuma çerçevesi kayar. Değişiklikten sonraki kodonların büyük bölümü farklı okunabilir.'
    };
  }

  if (!proteinChanged) {
    return {
      type: mutationType,
      effect: 'Sessiz mutasyon',
      proteinChanged: false,
      explanation: 'DNA dizisi değişti ancak genetik kodun eş anlamlı yapısı nedeniyle aminoasit dizisi değişmedi.'
    };
  }

  const oldStop = oldProtein.indexOf('Stop');
  const newStop = newProtein.indexOf('Stop');
  if (newStop !== -1 && (oldStop === -1 || newStop < oldStop)) {
    return {
      type: mutationType,
      effect: 'Anlamsız mutasyon',
      proteinChanged: true,
      explanation: 'Mutasyon daha erken bir dur kodonu oluşturdu. Bu nedenle protein normalden daha kısa üretilebilir.'
    };
  }

  if (lengthDelta !== 0) {
    return {
      type: mutationType,
      effect: 'Çerçeve korunmuş değişim',
      proteinChanged: true,
      explanation: 'Ekleme veya silme üçün katı olduğu için okuma çerçevesi korunur; ancak bir veya daha fazla aminoasit değişebilir.'
    };
  }

  return {
    type: mutationType,
    effect: 'Yanlış anlamlı mutasyon',
    proteinChanged: true,
    explanation: 'Değişen kodon farklı bir aminoasidi kodladığı için protein dizisi değişir.'
  };
}

export function findFirstDifference(a, b) {
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) if (a[i] !== b[i]) return i;
  return -1;
}

export function changedIndices(a, b) {
  const max = Math.max(a.length, b.length);
  const result = new Set();
  for (let i = 0; i < max; i += 1) if (a[i] !== b[i]) result.add(i);
  return result;
}

export function codonAt(dna, baseIndex) {
  const mrna = dnaToMrna(dna);
  const codonIndex = Math.floor(Math.max(0, baseIndex) / 3);
  const start = codonIndex * 3;
  const codon = mrna.slice(start, start + 3);
  return {
    codon,
    codonIndex,
    aminoAcid: codon.length === 3 ? (CODON_TABLE[codon] || '?') : 'Eksik kodon'
  };
}
