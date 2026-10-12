// Gerçek hastalıkların mutasyon türlerini, 27 bazlık eğitim DNA modeli üzerinde
// birebir analog bir işlemle gösterir. `steps` model üzerinde sırayla uygulanır;
// `id` değerleri lib/experiment.js içindeki ORIGINAL dizinin sabit kimlikleridir.
export const DISEASE_PRESETS = [
  {
    id: 'sickle-cell',
    name: 'Orak Hücre Anemisi',
    tag: 'Missense',
    gene: 'HBB (11. kromozom, β-globin geni)',
    realMutation: 'GAG → GTG nokta mutasyonu (Glu6Val); tek bazlık bir değişim (missense mutasyon).',
    modelExplanation: 'Modelde Ekzon 1\'deki GAA (Glu) kodonunun orta bazı A→T yapılır ve GTA (Val) kodonuna dönüşür — gerçek Glu→Val değişiminin birebir analoğudur.',
    proteinEffect: 'β-globin zincirinde tek bir aminoasit değişir (Glutamik asit yerine Valin). Bu küçük değişim proteinin yüzey kimyasını ve katlanma davranışını bozar.',
    diseaseEffect: 'Değişmiş hemoglobin (HbS), düşük oksijen ortamında birbirine yapışıp uzun lifler oluşturur; bu da alyuvarları orak şekline sokar. Sonuç: damar tıkanıklığı, ağrı krizleri ve kronik anemi.',
    steps: [
      { kind: 'substitute', id: 'exon-1:4', side: 0, base: 'T' },
    ],
  },
  {
    id: 'cystic-fibrosis',
    name: 'Kistik Fibrozis',
    tag: 'İn-frame delesyon',
    gene: 'CFTR (7. kromozom)',
    realMutation: 'ΔF508 — 3 bazlık (1 kodonluk) delesyon; 508. konumdaki fenilalanin aminoasidinin tamamen kaybı.',
    modelExplanation: 'Modelde Ekzon 1\'deki TTT (Fenilalanin) kodonunun 3 bazı tek tek silinir. Okuma çerçevesi korunur ve fenilalanin çıkarılır. Bu, gerçek CFTR dizisinin yerine kullanılan kısa bir eğitim benzetimidir.',
    proteinEffect: 'CFTR proteini bir aminoasit eksik üretilir; bu da proteinin yanlış katlanmasına yol açar. Hücre bu hatalı proteini hücre zarına ulaştırmadan parçalar.',
    diseaseEffect: 'Klor iyon kanalı görevini yapamaz; akciğerlerde ve pankreasta koyu, yapışkan mukus birikir. Bu da tekrarlayan solunum yolu enfeksiyonlarına ve sindirim sorunlarına yol açar.',
    steps: [
      { kind: 'delete', id: 'exon-1:6', side: 0 },
      { kind: 'delete', id: 'exon-1:7', side: 0 },
      { kind: 'delete', id: 'exon-1:8', side: 0 },
    ],
  },
  {
    id: 'beta-thalassemia',
    name: 'Beta Talasemi',
    tag: 'Nonsense',
    gene: 'HBB (11. kromozom, β-globin geni)',
    realMutation: 'Çoğunlukla anlamsız (nonsense) veya çerçeve kaydırıcı mutasyonlar; β-globin üretimi azalır veya tamamen durur.',
    modelExplanation: 'Modelde Ekzon 1\'deki TTT (Fenilalanin) kodonu iki baz değişimiyle TAA (Dur) kodonuna çevrilir; bu erken bir dur sinyali oluşturur.',
    proteinEffect: 'Protein sentezi normalden çok daha erken durur; kısa ve işlevsiz bir protein parçası üretilir. Gerçek β0-talasemi mutasyonlarının etkisine benzer.',
    diseaseEffect: 'Yetersiz β-globin üretimi dengesiz hemoglobine, kronik anemiye, büyüme geriliğine ve bazı hastalarda düzenli kan nakli ihtiyacına yol açabilir.',
    steps: [
      { kind: 'substitute', id: 'exon-1:7', side: 0, base: 'A' },
      { kind: 'substitute', id: 'exon-1:8', side: 0, base: 'A' },
    ],
  },
  {
    id: 'dmd',
    name: 'Duchenne Musküler Distrofi',
    tag: 'Frameshift',
    gene: 'DMD (X kromozomu, distrofin geni — insan genomunun en büyük geni)',
    realMutation: 'En sık görülen mutasyon türü, okuma çerçevesini bozan (out-of-frame) delesyonlardır.',
    modelExplanation: 'Modelde Ekzon 1\'den tek bir baz silinir. Silinen uzunluk 3\'ün katı olmadığı için okuma çerçevesi kayar.',
    proteinEffect: 'Silme noktasından sonraki tüm kodonlar yanlış okunur; genellikle beklenmedik bir dur kodonuyla karşılaşılır ve kısa, işlevsiz bir distrofin proteini üretilir.',
    diseaseEffect: 'Distrofin eksikliği kas hücrelerinin zarını yapısal olarak zayıflatır; zamanla ilerleyici kas güçsüzlüğü ve kas dokusu kaybı görülür.',
    steps: [
      { kind: 'delete', id: 'exon-1:9', side: 0 },
    ],
  },
  {
    id: 'huntington',
    name: 'Huntington Hastalığı',
    tag: 'Tekrar genişlemesi',
    gene: 'HTT (4. kromozom)',
    realMutation: 'CAG trinükleotid tekrar dizisinin anormal şekilde uzaması (trinükleotid tekrar hastalığı).',
    modelExplanation: 'Modelde Ekzon 2\'nin başına art arda 3 baz (C, A, G) eklenir; bu, fazladan bir "tekrar" kodonu ekler ve okuma çerçevesi korunur.',
    proteinEffect: 'Proteine fazladan bir glutamin (polyglutamine) aminoasidi eklenir. Bu uzama, proteinin doğru katlanma olasılığını azaltır.',
    diseaseEffect: 'Hatalı katlanan huntingtin proteini sinir hücrelerinde birikerek onlara zarar verir; zamanla ilerleyici hareket, bilişsel ve psikiyatrik bozukluklara yol açar.',
    steps: [
      { kind: 'insert', id: 'exon-2:0', side: 0, base: 'C' },
      { kind: 'insert', id: 'exon-2:0', side: 0, base: 'A' },
      { kind: 'insert', id: 'exon-2:0', side: 0, base: 'G' },
    ],
  },
];
