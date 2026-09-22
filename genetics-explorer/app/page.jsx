'use client';

import { useMemo, useState } from 'react';
import DNAViewer from '../components/DNAViewer';
import HologramPanel from '../components/HologramPanel';
import GenomeRegion from '../components/GenomeRegion';
import MutationLab from '../components/MutationLab';
import SequenceViewer from '../components/SequenceViewer';
import ProteinSimulator from '../components/ProteinSimulator';
import MutationAnalysis from '../components/MutationAnalysis';
import Toolbar from '../components/Toolbar';
import { BASE_INFO, COMPLEMENT, classifyMutation, codonAt } from '../lib/genetics';

const START = 'ATGGAATTTCCGAAAGCTGACCTGTAA';

const REGIONS = [
  {
    id: 'promoter', label: 'Promotör', shortLabel: 'PROM', kind: 'promoter', from: 0, to: 4,
    info: 'Transkripsiyonun başlaması için RNA polimeraz ve yardımcı proteinlerin bağlandığı düzenleyici DNA bölgesidir.'
  },
  {
    id: 'exon-1', label: 'Ekzon 1', shortLabel: 'EKZ1', kind: 'exon', from: 5, to: 11,
    info: 'RNA işlenmesinden sonra olgun mRNA içinde kalan ve proteine bilgi taşıyabilen dizidir.'
  },
  {
    id: 'intron', label: 'İntron', shortLabel: 'İNT', kind: 'intron', from: 12, to: 17,
    info: 'Ön-mRNA içinde bulunur; RNA kesilip birleştirilirken çıkarılan araya giren dizidir.'
  },
  {
    id: 'exon-2', label: 'Ekzon 2', shortLabel: 'EKZ2', kind: 'exon', from: 18, to: 26,
    info: 'RNA işlenmesinden sonra olgun mRNA içinde kalan ikinci ekzon bölgesidir.'
  },
  {
    id: 'gene', label: 'Gen', shortLabel: 'GEN', kind: 'gene', from: 5, to: 26,
    info: 'Bir RNA veya protein ürününün oluşumunda kullanılan bilgiyi taşıyan işlevsel DNA birimidir.'
  }
];

function PairInfo({ base, index, dna }) {
  const info = BASE_INFO[base] || BASE_INFO.A;
  const codon = codonAt(dna, index);
  return (
    <div className="pairInfo">
      <div className="pairVisual">
        <span className={`baseTile base-${base}`}>{base}</span>
        <div className="bondDots">{Array.from({ length: info.bonds }).map((_, i) => <i key={i} />)}</div>
        <span className={`baseTile base-${info.pair}`}>{info.pair}</span>
      </div>
      <div className="pairFacts">
        <div><span>Adı</span><b>{info.name}</b></div>
        <div><span>Eşleştiği baz</span><b>{info.pair} · {BASE_INFO[info.pair].name}</b></div>
        <div><span>Hidrojen bağı</span><b>{info.bonds}</b></div>
        <div><span>Baz ailesi</span><b>{info.family}</b></div>
      </div>
      <p>{info.description}</p>
      <div className="codonInspector">
        <span className="microLabel">Bulunduğu kodon</span>
        <strong>{codon.codon || '—'}</strong>
        <i>→</i>
        <b>{codon.aminoAcid === 'Stop' ? 'Dur' : codon.aminoAcid}</b>
      </div>
    </div>
  );
}

export default function Home() {
  const [history, setHistory] = useState([START]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(3);
  const [separated, setSeparated] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [activeRegion, setActiveRegion] = useState(null);
  const [mutationMode, setMutationMode] = useState('substitution');

  const mutated = history[historyIndex];
  const original = START;
  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, mutated.length - 1));
  const selectedBase = mutated[safeSelectedIndex] || 'A';
  const pair = COMPLEMENT[selectedBase];
  const mutation = useMemo(() => classifyMutation(original, mutated), [original, mutated]);

  const commit = (nextSequence, nextIndex = safeSelectedIndex) => {
    if (!nextSequence || nextSequence === mutated) return;
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextSequence);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setSelectedIndex(Math.max(0, Math.min(nextIndex, nextSequence.length - 1)));
  };

  const substitute = (base) => {
    if (!mutated[safeSelectedIndex] || base === mutated[safeSelectedIndex]) return;
    commit(mutated.slice(0, safeSelectedIndex) + base + mutated.slice(safeSelectedIndex + 1));
  };

  const insert = (base) => {
    if (mutated.length >= 60) return;
    commit(mutated.slice(0, safeSelectedIndex) + base + mutated.slice(safeSelectedIndex), safeSelectedIndex);
  };

  const remove = () => {
    if (mutated.length <= 3) return;
    commit(mutated.slice(0, safeSelectedIndex) + mutated.slice(safeSelectedIndex + 1), Math.max(0, safeSelectedIndex - 1));
  };

  const resetMutations = () => {
    setHistory([original]);
    setHistoryIndex(0);
    setSelectedIndex(3);
  };

  const selectRegion = (region) => {
    setActiveRegion(region);
    setSelectedIndex(Math.min(region.from, mutated.length - 1));
  };

  return (
    <main className="appShell">
      <header className="topbar">
        <div className="brandBlock">
          <div className="brandMark"><i /><i /><i /></div>
          <div>
            <div className="brand">GENETİK <span>KEŞİF</span></div>
            <div className="subtitle">ETKİLEŞİMLİ MOLEKÜLER ÖĞRENME SİSTEMİ</div>
          </div>
        </div>
        <nav>
          <a href="#yapi">DNA Yapısı</a>
          <a href="#bolgeler">DNA Bölgeleri</a>
          <a href="#mutasyon">Mutasyon Laboratuvarı</a>
          <a href="#protein">Protein</a>
        </nav>
        <div className="systemStatus"><i /> SİSTEM AKTİF</div>
      </header>

      <section className="hero" id="yapi">
        <div className="heroBackdrop" />

        <aside className="heroIntro">
          <span className="introKicker">ETKİLEŞİMLİ 3B GENETİK</span>
          <h1>DNA'YI<br /><em>KEŞFET.</em><br />KODU DEĞİŞTİR.</h1>
          <p>Çift sarmalı çevir, baz çiftlerine dokun, zincirleri ayır ve yaptığın mutasyonun proteine kadar uzanan etkisini anında gör.</p>
          <a className="startButton" href="#mutasyon">Keşfetmeye Başla <span>→</span></a>

          <div className="interactionGuide">
            <div><b>Sol sürükle</b><span>DNA'yı döndür</span></div>
            <div><b>Tekerlek</b><span>Yakınlaştır / uzaklaştır</span></div>
            <div className="rightClickGuide"><b>Sağ tık</b><span>DNA'yı sök / yeniden topla</span></div>
          </div>
          <div className="scienceNote">
            <span>ÖĞRENME NOTU</span>
            <p>Söküm görünümü molekülün katmanlarını anlamak için tasarlanmış bir eğitim görselleştirmesidir.</p>
          </div>
        </aside>

        <section className="centerStage">
          <div className="dnaFrame">
            <DNAViewer
              sequence={mutated}
              selectedIndex={safeSelectedIndex}
              onSelect={setSelectedIndex}
              separated={separated}
              exploded={exploded}
              onToggleExplode={() => setExploded(v => !v)}
              autoRotate={autoRotate}
              resetSignal={resetSignal}
              activeRegion={activeRegion}
              regions={REGIONS}
            />
            <div className="selectedBadge">
              <span>SEÇİLİ BAZ</span>
              <b>{selectedBase}</b>
              <small>{BASE_INFO[selectedBase]?.name} · {selectedBase}–{pair} çifti · {safeSelectedIndex + 1}. konum</small>
            </div>
          </div>

          <Toolbar
            separated={separated}
            exploded={exploded}
            autoRotate={autoRotate}
            onSeparate={() => setSeparated(v => !v)}
            onExplode={() => setExploded(v => !v)}
            onAutoRotate={() => setAutoRotate(v => !v)}
            onResetCamera={() => setResetSignal(v => v + 1)}
          />
        </section>

        <aside className="sideStack rightStack">
          <HologramPanel eyebrow="BAZ ÇİFTİ // 01" title="Baz Çifti Bilgisi">
            <PairInfo base={selectedBase} index={safeSelectedIndex} dna={mutated} />
          </HologramPanel>

          <HologramPanel eyebrow="ANLIK ETKİ // 02" title="Mutasyon Önizlemesi">
            <div className="quickImpact">
              <div className={`impactPill effect-${mutation.effect.toLowerCase().replaceAll(' ', '-')}`}>{mutation.effect}</div>
              <dl>
                <div><dt>Mutasyon</dt><dd>{mutation.type}</dd></div>
                <div><dt>Protein değişti mi?</dt><dd>{mutation.proteinChanged ? 'EVET' : 'HAYIR'}</dd></div>
                <div><dt>DNA uzunluğu</dt><dd>{mutated.length} bp</dd></div>
                <div><dt>Yapı görünümü</dt><dd>{exploded ? 'SÖKÜLMÜŞ' : separated ? 'ZİNCİRLER AYRI' : 'BÜTÜN'}</dd></div>
              </dl>
              <p>{mutation.explanation}</p>
            </div>
          </HologramPanel>

          <div className={`structureResult ${exploded ? 'active' : ''}`}>
            <span>{exploded ? 'DNA SÖKÜLDÜĞÜNDE NE OLUR?' : 'SAĞ TIK İLE SÖK'}</span>
            <p>{exploded
              ? 'Hidrojen bağlarının kopması iki zincirin ayrılmasına yol açabilir. Ancak şeker-fosfat omurgasının gerçekten kopması DNA hasarıdır; hücre bunu onarmaya çalışır, onarılamazsa mutasyon veya hücresel işlev kaybı görülebilir.'
              : 'Model üzerinde sağ tıkla. Baz çiftleri ve omurga katmanları açılarak yapıyı parça parça inceleyebilirsin.'}</p>
          </div>
        </aside>
      </section>

      <section className="labDeck">
        <HologramPanel id="bolgeler" eyebrow="GENOM HARİTASI // 03" title="DNA Bölgeleri" className="widePanel">
          <GenomeRegion regions={REGIONS} activeRegion={activeRegion || REGIONS[0]} onSelect={selectRegion} sequenceLength={mutated.length} />
          {activeRegion && <button className="clearRegion" onClick={() => setActiveRegion(null)}>Bölge odağını temizle</button>}
        </HologramPanel>

        <HologramPanel id="mutasyon" eyebrow="DÜZENLEYİCİ // 04" title="Mutasyon Laboratuvarı" className="widePanel">
          <MutationLab
            selectedBase={selectedBase}
            selectedIndex={safeSelectedIndex}
            mode={mutationMode}
            setMode={setMutationMode}
            onSubstitute={substitute}
            onInsert={insert}
            onDelete={remove}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={() => setHistoryIndex(i => Math.max(0, i - 1))}
            onRedo={() => setHistoryIndex(i => Math.min(history.length - 1, i + 1))}
            onReset={resetMutations}
          />
        </HologramPanel>

        <HologramPanel eyebrow="KARŞILAŞTIR // 05" title="Orijinal ve Değişmiş DNA" className="widePanel">
          <SequenceViewer original={original} mutated={mutated} />
        </HologramPanel>

        <HologramPanel id="protein" eyebrow="MERKEZİ DOGMA // 06" title="DNA → mRNA → Protein" className="widePanel">
          <ProteinSimulator dna={mutated} />
        </HologramPanel>

        <HologramPanel eyebrow="SONUÇ // 07" title="Protein Etki Analizi" className="fullPanel">
          <MutationAnalysis mutation={mutation} original={original} mutated={mutated} />
        </HologramPanel>
      </section>

      <footer>
        <span>GENETİK KEŞİF // EĞİTİM SİMÜLASYONU</span>
        <span>Bu uygulama moleküler genetik kavramlarını öğretmek amacıyla hazırlanmıştır.</span>
      </footer>
    </main>
  );
}
