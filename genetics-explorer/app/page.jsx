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
import DamagePanel from '../components/DamagePanel';
import useDNAExperiment from '../hooks/useDNAExperiment';
import { ORIGINAL, sequenceOf, displayedBase, regionMap, analyzeExperiment, transcribedSequence } from '../lib/experiment';
import { BASE_INFO, COMPLEMENT, codonAt } from '../lib/genetics';

function PairInfo({ base, index, dna, token, side, region }) {
  const info = BASE_INFO[base] || BASE_INFO.A;
  const codon = codonAt(dna, index);
  const missing = token.ap[side];
  return (
    <div className="pairInfo">
      <div className="pairVisual">
        <span className={`baseTile base-${base}`}>{missing ? "AP" : base}</span>
        <div className="bondDots">{Array.from({ length: token.ap.some(Boolean) ? 0 : info.bonds }).map((_, i) => <i key={i} />)}</div>
        <span className={`baseTile base-${info.pair}`}>{token.ap[1 - side] ? "AP" : info.pair}</span>
      </div>
      <div className="pairFacts">
        <div><span>Adı</span><b>{info.name}</b></div>
        <div><span>Eşleştiği baz</span><b>{info.pair} · {BASE_INFO[info.pair].name}</b></div>
        <div><span>Hidrojen bağı</span><b>{token.ap.some(Boolean) ? "0 (AP hasarı)" : info.bonds}</b></div>
        <div><span>Baz ailesi</span><b>{info.family}</b></div>
      </div>
      <p>{missing ? "Seçilen zincirde bu baz çıkarıldı; omurga korunuyor." : info.description}</p><p>{region?.label} · Zincir {side + 1}</p>
      <div className="codonInspector">
        <span className="microLabel">Bulunduğu kodon</span>
        <strong>{token.kind === "exon" ? codon.codon || "—" : "Kodlamayan bölge"}</strong>
        <i>→</i>
        <b>{token.kind === 'exon' ? codon.aminoAcid === 'Stop' ? 'Dur' : codon.aminoAcid : '—'}</b>
      </div>
    </div>
  );
}

export default function Home() {
  const experiment = useDNAExperiment();
  const { current, token, index: safeSelectedIndex, selection, pending } = experiment;
  const [separated, setSeparated] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [activeRegionId, setActiveRegionId] = useState(null);
  const [mutationMode, setMutationMode] = useState('substitution');
  const [menuRequest, setMenuRequest] = useState(null);
  const regions = useMemo(() => regionMap(current.tokens), [current.tokens]);
  const activeRegion = regions.find(r => r.id === activeRegionId) || null;
  const mutated = sequenceOf(current.tokens);
  const original = sequenceOf(ORIGINAL);
  const selectedBase = displayedBase(token, selection.side);
  const pair = COMPLEMENT[selectedBase];
  const mutation = useMemo(() => analyzeExperiment(current), [current]);
  const selectedRegion = regions.find(r => r.id === token.regionId);
  const codingIndex = current.tokens.slice(0, safeSelectedIndex).filter(t => t.kind === 'exon').length;
  const selectRegion = region => { setActiveRegionId(region.id); if (!region.empty) experiment.select(region.from); };
  const actionMenu = event => setMenuRequest({ x: event.clientX, y: event.clientY, serial: Date.now() });

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
            <div className="rightClickGuide"><b>Sağ tık</b><span>Baz: işlem menüsü · Boş alan: sök/topla</span></div>
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
              onSelect={experiment.select}
              tokens={current.tokens}
              selectedSide={selection.side}
              pending={pending}
              arrivals={experiment.arrivals}
              onAction={experiment.act}
              menuRequest={menuRequest}
              separated={separated}
              exploded={exploded}
              onToggleExplode={() => setExploded(v => !v)}
              autoRotate={autoRotate}
              resetSignal={resetSignal}
              activeRegion={activeRegion}
              regions={regions}
            />
            <div className="selectedBadge">
              <span>SEÇİLİ BAZ</span>
              <b>{token.ap[selection.side] ? "AP" : selectedBase}</b>
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
            <PairInfo base={selectedBase} index={codingIndex} dna={mutation.coding} token={token} side={selection.side} region={selectedRegion} />
            <button className="baseActionsTrigger" onClick={actionMenu}>Baz işlemleri</button>
            <DamagePanel tokens={current.tokens} pending={pending} onUndo={experiment.undo} canUndo={experiment.canUndo} />
            <div className="historyControls"><button onClick={experiment.undo} disabled={!experiment.canUndo}>Geri al</button><button onClick={experiment.redo} disabled={!experiment.canRedo}>Yinele</button></div>
          </HologramPanel>

          <HologramPanel eyebrow="ANLIK ETKİ // 02" title="Mutasyon Önizlemesi">
            <div className="quickImpact">
              <div className={`impactPill effect-${mutation.effect.toLowerCase().replaceAll(' ', '-')}`}>{mutation.effect}</div>
              <dl>
                <div><dt>Mutasyon</dt><dd>{mutation.type}</dd></div>
                <div><dt>Protein değişti mi?</dt><dd>{mutation.proteinChanged === null ? 'ÖNGÖRÜLEMEZ' : mutation.proteinChanged ? 'EVET' : 'HAYIR'}</dd></div>
                <div><dt>DNA uzunluğu</dt><dd>{mutated.length} bp</dd></div>
                <div><dt>Yapı görünümü</dt><dd>{exploded ? 'SÖKÜLMÜŞ' : separated ? 'ZİNCİRLER AYRI' : 'BÜTÜN'}</dd></div>
              </dl>
              <p>{mutation.explanation}</p>{mutation.notes.map(note => <p key={note} className="regionEffectNote">{note}</p>)}
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
          <GenomeRegion regions={regions} activeRegion={activeRegion || regions[0]} onSelect={selectRegion} sequenceLength={mutated.length} />
          {activeRegion && <button className="clearRegion" onClick={() => setActiveRegionId(null)}>Bölge odağını temizle</button>}
        </HologramPanel>

        <HologramPanel id="mutasyon" eyebrow="DÜZENLEYİCİ // 04" title="Mutasyon Laboratuvarı" className="widePanel">
          <MutationLab
            selectedBase={selectedBase}
            selectedIndex={safeSelectedIndex}
            mode={mutationMode}
            setMode={setMutationMode}
            onSubstitute={base => experiment.act("substitute", base)}
            onInsert={base => experiment.act("insert", base)}
            onDelete={() => experiment.act("delete")}
            canUndo={experiment.canUndo}
            canRedo={experiment.canRedo}
            onUndo={experiment.undo}
            onRedo={experiment.redo}
            onReset={experiment.reset}
            busy={!!pending}
            missing={token.ap[selection.side]}
          />
        </HologramPanel>

        <HologramPanel eyebrow="KARŞILAŞTIR // 05" title="Orijinal ve Değişmiş DNA" className="widePanel">
          <SequenceViewer original={original} mutated={mutated} tokens={current.tokens} />
          <div className="codingComparison"><small>KODLAYAN EKZONLAR · İNTRONLAR ÇIKARILDIKTAN SONRA</small><SequenceViewer original={mutation.originalCoding} mutated={mutation.coding} compact /></div>
          {mutation.effect === 'Çerçeve kayması' && <p className="frameshiftFlow">{mutation.type === 'Silme' ? 'Nükleotid silinmesi (Deletion)' : 'Nükleotid eklenmesi (Insertion)'} → Okuma çerçevesi değişti → Frameshift mutasyonu</p>}
          <p className="microNote">27 bazlık kısa bir eğitim modeli. Promotör protein koduna katılmaz; intron normal splicing varsayımıyla çıkarılır. Ekzonlar burada kodlayan bölgeleri temsil eder.</p>
        </HologramPanel>

        <HologramPanel id="protein" eyebrow="MERKEZİ DOGMA // 06" title="DNA → mRNA → Protein" className="widePanel">
          <ProteinSimulator dna={mutation.coding} preDna={transcribedSequence(current.tokens)} damaged={mutation.damage} />
        </HologramPanel>

        <HologramPanel eyebrow="SONUÇ // 07" title="Protein Etki Analizi" className="fullPanel">
          <MutationAnalysis mutation={mutation} original={mutation.originalCoding} mutated={mutation.coding} />
        </HologramPanel>
      </section>

      <footer>
        <span>GENETİK KEŞİF // EĞİTİM SİMÜLASYONU</span>
        <span>Bu uygulama moleküler genetik kavramlarını öğretmek amacıyla hazırlanmıştır.</span>
      </footer>
    </main>
  );
}
