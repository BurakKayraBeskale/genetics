'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DNAViewer from '../../components/DNAViewer';
import { useSimulation } from '../../providers/SimulationProvider';
import DNACasePanel from '../../components/DNACasePanel';
import { getDNACaseContext } from '../../lib/dnaCaseContext';
import { useDNAWorkspace } from '../../providers/DNAWorkspaceProvider';
import { dnaWorkspaceMode, supportedCaseDNAPreset } from '../../lib/dnaWorkspace';
import HologramPanel from '../../components/HologramPanel';
import GenomeRegion from '../../components/GenomeRegion';
import MutationLab from '../../components/MutationLab';
import SequenceViewer from '../../components/SequenceViewer';
import ProteinSimulator from '../../components/ProteinSimulator';
import MutationAnalysis from '../../components/MutationAnalysis';
import Toolbar from '../../components/Toolbar';
import BaseNavigator from '../../components/BaseNavigator';
import ExperimentReport from '../../components/ExperimentReport';
import DamagePanel from '../../components/DamagePanel';
import DiseaseScenarios from '../../components/DiseaseScenarios';
import { ORIGINAL, sequenceOf, displayedBase, regionMap, analyzeExperiment, transcribedSequence } from '../../lib/experiment';
import { BASE_INFO, COMPLEMENT, codonAt } from '../../lib/genetics';

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

function DNAWorkspacePage({mode}) {
  const router=useRouter();
  const {state:diseaseState,previewState,studentView,isMystery,requestObservation}=useSimulation();
  const viewedCase=previewState||diseaseState;
  const context=useMemo(()=>getDNACaseContext(viewedCase,{hiddenProfile:studentView&&isMystery}),[viewedCase,studentView,isMystery]);
  const [genomeTab,setGenomeTab]=useState('human');
  const experiment=useDNAWorkspace(mode);
  const {activeDiseaseId,diseaseQueue,applyDisease,revertDisease,clearDisease}=experiment;
  const linkedPreset=useMemo(()=>mode==='case'&&context?.presetId?supportedCaseDNAPreset(diseaseState.scenarioConfig):null,[mode,context?.presetId,diseaseState.scenarioConfig]);
  const showObservation=useCallback((view,organ)=>{const target=organ||context?.organTarget;requestObservation?.({mode:view,organ:target||null,structure:'all'});router.push('/simulation');},[requestObservation,router,context?.organTarget]);
  const showBody=useCallback(organ=>showObservation('body',organ),[showObservation]);
  const showCell=useCallback(organ=>showObservation('cell',organ),[showObservation]);
  const { current, token, index: safeSelectedIndex, selection, pending, act, reset, undo, redo, select } = experiment;
  const [separated, setSeparated] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [activeRegionId, setActiveRegionId] = useState(null);
  const [mutationMode, setMutationMode] = useState('substitution');
  const [menuRequest, setMenuRequest] = useState(null);
  const clearedUndo = useCallback(() => { clearDisease(); undo(); }, [clearDisease, undo]);
  const clearedRedo = useCallback(() => { clearDisease(); redo(); }, [clearDisease, redo]);
  const clearedReset = useCallback(() => { clearDisease(); reset(); }, [clearDisease, reset]);
  const manualAction = useCallback((...args) => { clearDisease(); act(...args); }, [clearDisease, act]);
  const substitute = useCallback(base => manualAction('substitute', base), [manualAction]);
  const insert = useCallback(base => manualAction('insert', base), [manualAction]);
  const deleteBase = useCallback(() => manualAction('delete'), [manualAction]);
  const toggleExplode = useCallback(() => setExploded(value => !value), []);
  const toggleSeparate = useCallback(() => setSeparated(value => !value), []);
  const toggleAutoRotate = useCallback(() => setAutoRotate(value => !value), []);
  const resetCamera = useCallback(() => setResetSignal(value => value + 1), []);

  const regions = useMemo(() => regionMap(current.tokens), [current.tokens]);
  const activeRegion = regions.find(r => r.id === activeRegionId) || null;
  const mutated = sequenceOf(current.tokens);
  const original = sequenceOf(ORIGINAL);
  const selectedBase = displayedBase(token, selection.side);
  const pair = COMPLEMENT[selectedBase];
  const mutation = useMemo(() => analyzeExperiment(current), [current]);
  const selectedRegion = regions.find(r => r.id === token.regionId);
  const codingIndex = current.tokens.slice(0, safeSelectedIndex).filter(t => t.kind === 'exon').length;
  const selectRegion = useCallback(region => { setActiveRegionId(region.id); if (!region.empty) select(region.from); }, [select]);
  const actionMenu = useCallback(event => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuRequest({ x: rect.left, y: rect.bottom + 6, serial: Date.now() });
  }, []);

  return (
    <main className="appShell">
      <div className="moduleHeading"><span className="introKicker">MOLEKÜLER DENEY ALANI · {mode==='case'?'VAKA MODU':'SERBEST DNA LAB'}</span><h1>DNA Laboratuvarı</h1><nav className="dnaCaseGenomeTabs" aria-label="DNA çalışma alanı"><button aria-pressed={mode==='free'} onClick={()=>router.push('/dna?mode=free')}>Serbest DNA Lab</button><button aria-pressed={mode==='case'} onClick={()=>router.push('/dna?mode=case')}>Aktif vaka</button></nav>{mode==='free'&&<p className="microNote">Bağımsız kısa eğitim dizisi. Serbest deneylerin aktif hastalık vakasını değiştirmez.</p>}</div>
      {mode==='case'&&<DNACasePanel context={context} state={viewedCase} onShowBody={showBody} onShowCell={showCell} onTabChange={setGenomeTab}/>}
      {linkedPreset&&<div className="dnaCaseActions" aria-label="Vaka DNA eğitim örneği"><span className="microNote" role="status">Vaka eğitim örneği · {pending||diseaseQueue.length?'Hazırlanıyor':activeDiseaseId===linkedPreset.id?'Modelde yüklü':'Manuel eğitim deneyi'}</span><button disabled={!!pending||diseaseQueue.length>0} onClick={()=>applyDisease(linkedPreset)}>Vaka örneğini yeniden uygula</button></div>}
      {(mode==='free'||genomeTab==='human')&&<>
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
              onSelect={select}
              tokens={current.tokens}
              selectedSide={selection.side}
              pending={pending}
              arrivals={experiment.arrivals}
              onAction={manualAction}
              menuRequest={menuRequest}
              separated={separated}
              exploded={exploded}
              onToggleExplode={toggleExplode}
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

          <BaseNavigator index={safeSelectedIndex} total={current.tokens.length} side={selection.side} base={selectedBase} missing={token.ap[selection.side]} region={selectedRegion} busy={!!pending} onSelect={select} onMenu={actionMenu} />
          <Toolbar
            separated={separated}
            exploded={exploded}
            autoRotate={autoRotate}
            onSeparate={toggleSeparate}
            onExplode={toggleExplode}
            onAutoRotate={toggleAutoRotate}
            onResetCamera={resetCamera}
          />
        </section>

        <aside className="sideStack rightStack">
          <HologramPanel eyebrow="BAZ ÇİFTİ // 01" title="Baz Çifti Bilgisi">
            <PairInfo base={selectedBase} index={codingIndex} dna={mutation.coding} token={token} side={selection.side} region={selectedRegion} />
            <button className="baseActionsTrigger" aria-haspopup="menu" onClick={actionMenu}>Baz işlemleri</button>
            <DamagePanel tokens={current.tokens} pending={pending} onUndo={clearedUndo} canUndo={experiment.canUndo} />
            <div className="historyControls"><button onClick={clearedUndo} disabled={!experiment.canUndo}>Geri al</button><button onClick={clearedRedo} disabled={!experiment.canRedo}>Yinele</button></div>
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
            onSubstitute={substitute}
            onInsert={insert}
            onDelete={deleteBase}
            canUndo={experiment.canUndo}
            canRedo={experiment.canRedo}
            onUndo={clearedUndo}
            onRedo={clearedRedo}
            onReset={clearedReset}
            busy={!!pending}
            missing={token.ap[selection.side]}
          />
        </HologramPanel>

        {mode==='free'&&(<HologramPanel id="hastalik" eyebrow="HASTALIK SENARYOSU // 05" title="Hastalık Senaryo Modu" className="widePanel">
          <DiseaseScenarios
            activeDiseaseId={activeDiseaseId}
            busy={!!pending}
            onApply={applyDisease}
            onRevert={revertDisease}
            modelEffect={mutation.effect}
          />
        </HologramPanel>)}        <HologramPanel eyebrow="KARŞILAŞTIR // 06" title="Orijinal ve Değişmiş DNA" className="widePanel">
          <SequenceViewer original={original} mutated={mutated} tokens={current.tokens} selectedIndex={safeSelectedIndex} onSelect={select} />
          <div className="codingComparison"><small>KODLAYAN EKZONLAR · İNTRONLAR ÇIKARILDIKTAN SONRA</small><SequenceViewer original={mutation.originalCoding} mutated={mutation.coding} compact /></div>
          {mutation.effect === 'Çerçeve kayması' && <p className="frameshiftFlow">{mutation.type === 'Silme' ? 'Nükleotid silinmesi (Deletion)' : 'Nükleotid eklenmesi (Insertion)'} → Okuma çerçevesi değişti → Frameshift mutasyonu</p>}
          <p className="microNote">27 bazlık kısa bir eğitim modeli. Promotör protein koduna katılmaz; intron normal splicing varsayımıyla çıkarılır. Ekzonlar burada kodlayan bölgeleri temsil eder.</p>
        </HologramPanel>

        <HologramPanel id="protein" eyebrow="MERKEZİ DOGMA // 07" title="DNA → mRNA → Protein" className="widePanel">
          <ProteinSimulator dna={mutation.coding} preDna={transcribedSequence(current.tokens)} damaged={mutation.damage} />
        </HologramPanel>

        <HologramPanel eyebrow="SONUÇ // 08" title="Protein Etki Analizi" className="fullPanel">
          <MutationAnalysis mutation={mutation} original={mutation.originalCoding} mutated={mutation.coding} />
          <ExperimentReport current={current} mutation={mutation} busy={!!pending || diseaseQueue.length > 0} />
        </HologramPanel>
      </section>


      </>}
    </main>
  );
}

function DNAModeRoute(){const params=useSearchParams();const mode=dnaWorkspaceMode(params.get('mode'));return <DNAWorkspacePage key={mode} mode={mode}/>;}
export default function DNAPage(){return <Suspense fallback={<main className="appShell"><p className="microNote">DNA çalışma alanı açılıyor…</p></main>}><DNAModeRoute/></Suspense>;}
