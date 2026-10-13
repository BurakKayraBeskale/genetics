'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSimulation } from '../providers/SimulationProvider';
import { SCENARIOS, INTERVENTIONS } from '../lib/simulation';
import { computeOutbreak } from '../lib/outbreak';
import SimulationScene from './SimulationScene';
import OrganDetails from './OrganDetails';
import AnatomyHierarchy from './AnatomyHierarchy';
import { affectedOrgansFor } from '../lib/organEducation';
import './DiseaseLaboratory.css';

const METRICS = { pathogenLoad: 'Patojen yükü', infectedCells: 'Enfekte hücreler', innateImmunity: 'Doğuştan yanıt', adaptiveImmunity: 'Kazanılmış yanıt', antibodyLevel: 'Antikor', inflammation: 'İnflamasyon', tissueDamage: 'Doku hasarı' };
const SCENARIO_GROUPS = [["viral","Viral"],["bacterial","Bakteriyel"],["genetic","Genetik"],["mixed","Tanısal / karma"],["autoimmune","Otoimmün"],["metabolic","Metabolik"],["neurological","Nörolojik"],["oncology","Onkoloji"]];
const MODES = [['molecular', 'Molekül'], ['cell', 'Hücre'], ['body', 'Vücut'], ['society', 'Toplum']];
const noteText = (item) => typeof item === 'string' ? item : item.text || item.message || item.title;
const points = (timeline, key, maximum) => timeline.map((item) => `${(item.day / Math.max(1, maximum)) * 300},${48 - Math.min(100, Math.max(0, item.metrics?.[key] || 0)) * .44}`).join(' ');

export default function DiseaseLaboratory() {
  const simulation = useSimulation();
  const { state, outbreak, isMystery, studentView, setStudentView } = simulation;
  const hiddenProfile = isMystery && studentView;
  const [mode, setMode] = useState('body');
  const [organSelection,setOrganSelection]=useState(null);
  const [structureSelection,setStructureSelection]=useState(null);
  const [anatomyAsset,setAnatomyAsset]=useState(null);
  const [previewDay, setPreviewDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState(false);
  const [bulletinToast, setBulletinToast] = useState(null);
  const bulletinDialog = useRef(null);
  const lastBulletin = useRef(null);
  useEffect(() => { const item = state.bulletinHistory.at(-1); if (!item) { lastBulletin.current = null; setBulletinToast(null); return; } const key = state.seed + ':' + state.diseaseScenarioId + ':' + item.day + ':' + noteText(item); if (lastBulletin.current === key) return; lastBulletin.current = key; setBulletinToast(item); const timer = setTimeout(() => setBulletinToast(null), 6500); return () => clearTimeout(timer); }, [state.bulletinHistory.length, state.seed, state.diseaseScenarioId]);
  const [dismissed, setDismissed] = useState(false);
  const [starred, setStarred] = useState(false);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const scenario = state.scenarioConfig;
  const selectedOrgan=organSelection||affectedOrgansFor(scenario)[0]||'lungs';
  const chooseOrgan=key=>{setOrganSelection(key);setStructureSelection(null);};
  useEffect(() => { setPreviewDay(null); setDismissed(false); setOrganSelection(null); setStructureSelection(null); }, [state.diseaseScenarioId, state.seed]);
  const snapshot = previewDay === null ? null : state.timeline.find((item) => item.day === previewDay);
  const viewed = useMemo(() => snapshot ? { ...state, ...snapshot, running: false, paused: true } : state, [state, snapshot]);
  const preview = !!snapshot && snapshot.day !== state.day;
  const previous = state.timeline.find((item) => item.day === Math.max(0, viewed.day - 1));
  const infectious = String(scenario.mechanism || 'infectious/viral').startsWith('infectious/');
  const primaryKey = infectious ? 'pathogenLoad' : ({genetic:'proteinFunction',autoimmune:'autoimmuneActivity',metabolic:'metabolicImbalance',neurological:'neuralFunction',oncology:'tumorBurden'}[scenario.category] || 'tissueDamage');
  const primaryLabel = ({pathogenLoad:'Patojen',proteinFunction:'Protein işlevi',autoimmuneActivity:'Otoimmün etkinlik',metabolicImbalance:'Metabolik dengesizlik',neuralFunction:'Sinir işlevi',tumorBurden:'Hücre yükü',tissueDamage:'Doku stresi'})[primaryKey];
  const secondaryKey = infectious ? 'adaptiveImmunity' : 'tissueDamage';
  const loadDelta = (viewed.metrics[primaryKey]||0) - (previous?.metrics[primaryKey] ?? viewed.metrics[primaryKey] ?? 0);
  const latestNotes = state.doctorNotes.filter((item) => typeof item === 'string' || item.day <= viewed.day).slice(-2);
  const latestBulletin = state.bulletinHistory.filter((item) => typeof item === 'string' || item.day <= viewed.day).slice(-1);
  const run = (action) => { setPreviewDay(null); setError(''); try { action(); } catch (failure) { setError(failure.message); } };
  const openSave = (star = false) => { simulation.pause(); setPreviewDay(null); if (star) setStarred(true); setName(`${isMystery ? "Gizemli vaka" : scenario.name} · Gün ${state.day}`); setSaving(true); };
  const save = (event) => {
    event.preventDefault();
    try { const item = simulation.saveCase({ name: name.trim(), description, teacherNote: note, isStarred: starred }); if (!item) throw new Error('Vaka kaydedilemedi. Lütfen tarayıcı depolama alanını kontrol et.'); setMessage(`${item.code} arşive kaydedildi.`); setSaving(false); setDismissed(true); setError(''); }
    catch (failure) { setError(failure.message); }
  };
  return <section className="simulationScreen" aria-label="Hastalık simülasyonu">
    <header className="simulationScreenHeader">
      <div><span className="simulationEyebrow">{isMystery ? (studentView ? "GİZEMLİ VAKA · ÖĞRENCİ" : "GİZEMLİ VAKA · ÖĞRETMEN") : "CANLI EĞİTİM MODELİ"}</span><h1>{hiddenProfile ? "Gizemli vaka" : scenario.name}</h1></div>
      {!hiddenProfile && <label className="scenarioSelect">Senaryo<select value={state.diseaseScenarioId} onChange={(event) => run(() => { simulation.start(event.target.value); simulation.pause(); setDismissed(false); setStarred(false); })}>{!SCENARIOS.some(item=>item.id===state.diseaseScenarioId)&&<option value={state.diseaseScenarioId}>{scenario.name}</option>}{SCENARIO_GROUPS.map(([id,label])=><optgroup key={id} label={label}>{SCENARIOS.filter(item=>item.category===id).map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}</select></label>}
      <nav className="simulationModeTabs" aria-label="Gözlem ölçeği">{MODES.map(([id, label]) => <button key={id} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>)}</nav>
      {!hiddenProfile && <><Link href="/dna" className="simulationArchiveLink">DNA ↗</Link><Link href="/archive" className="simulationArchiveLink">Arşiv ↗</Link></>}{isMystery && <button onClick={()=>setStudentView(!studentView)}>{studentView?'Öğretmen görünümü':'Öğrenci görünümü'}</button>}
    </header>
    <div className="simulationWorkspace">
      <aside className="simulationAdvisor" aria-label="Eğitim danışmanı">
        <div className="advisorIdentity"><span className="advisorAvatar" aria-hidden="true">✚</span><div><h2>Gözlem danışmanı</h2><span>Kurgusal eğitim rehberi</span></div></div>
        <p className="advisorStatus"><i />Gün {viewed.day} gözlemleri</p>
        {!hiddenProfile&&<details className="profileSource"><summary>Profil mekanizması ve kaynaklar</summary><p>{scenario.cellularMechanism || scenario.description}</p><p>{scenario.immuneResponseType}</p><p>Zaman çizelgesi eğitimsel adımlardır; klinik süre tahmini değildir.</p>{(scenario.sources||[]).map((source,i)=><a key={i} href={source.url} target="_blank" rel="noopener noreferrer">{source.title||'Bilimsel kaynak'} ↗</a>)}{scenario.synthetic&&<p>Bu kurgu vaka gerçek hastalık profili değildir.</p>}</details>}<h3>Model bulgusu</h3><p className="advisorDiagnosis">{viewed.currentDiagnosis || state.preliminaryDiagnosis}</p>
        <div className="advisorConfidence"><span>Model güveni</span><b>%{viewed.diagnosisConfidence}</b></div>
        <h3>Değişimi yorumla</h3><p>{primaryLabel} göstergesi {Math.abs(loadDelta) < .1 ? 'önceki gözlemle aynı.' : loadDelta > 0 ? `${loadDelta.toFixed(1)} birim yükseldi.` : `${Math.abs(loadDelta).toFixed(1)} birim azaldı.`} Doku yanıtıyla birlikte karşılaştır.</p>
        {latestNotes.map((item, index) => <p className="advisorNote" key={index}><span>Gün {typeof item === 'string' ? viewed.day : item.day}</span>{noteText(item)}</p>)}
        <details className="simulationInterventions"><summary>Model müdahaleleri</summary>{INTERVENTIONS.map((item) => <button key={item.id} disabled={!!state.finalOutcome || preview} title={item.description} onClick={() => run(() => simulation.intervene(item.id))}>{item.label}</button>)}<small>Soyut katsayıları değiştirir.</small></details>
        <p className="simulationDisclaimer">Gösterimler şematiktir. Göreli 0–100 değerleri klinik tahmin veya tedavi önerisi değildir.</p>
      </aside>
      <div className="simulationVisual">
        <div className="simulationSceneCaption"><span>{MODES.find(([id]) => id === mode)?.[1]} ölçeği</span><span>{preview ? 'GEÇMİŞ GÖZLEM' : state.finalOutcome ? 'TAMAMLANDI' : state.running ? 'CANLI' : 'DURAKLATILDI'} · Gün {viewed.day}</span></div>
        <SimulationScene assetStatus={anatomyAsset} selectedStructure={structureSelection} onSelectStructure={setStructureSelection} onAssetStatus={setAnatomyAsset} selectedOrgan={selectedOrgan} onOrganSelect={chooseOrgan} state={viewed} mode={mode} outbreak={preview ? computeOutbreak({ ...viewed, timeline: state.timeline.filter((item) => item.day <= viewed.day), publicHealthDecisions: state.publicHealthDecisions.filter((item) => item.day <= viewed.day) }) : outbreak} preview={preview} />
        {mode!=='society'&&<div className="simulationSceneHint">Sürükle: döndür · Tekerlek: yaklaş</div>}
        {preview && <button className="previewReturn" onClick={() => setPreviewDay(null)}>Gün {state.day} canlı duruma dön</button>}
        {mode === 'society' && <Link className="societyRoute" href="/outbreak">Salgın çalışma alanını aç ↗</Link>}
      </div>
      <aside className="simulationVitals" aria-label="Göstergeler ve belirtiler">
        {mode==='body'&&<OrganDetails organ={selectedOrgan} profile={scenario} metrics={viewed.metrics} hiddenProfile={hiddenProfile}/>}
        {mode==='body'&&<AnatomyHierarchy organ={selectedOrgan} selectedStructure={structureSelection} onSelectStructure={setStructureSelection} availableMeshNames={[...(anatomyAsset?.meshNames||[]),...(anatomyAsset?.supplementNames||[])]}/>}<h2>Canlı göstergeler</h2><span className="relativeUnits">Göreli model birimleri</span>
        {Object.entries(METRICS).filter(([key])=>infectious || ["inflammation","tissueDamage"].includes(key)).map(([key, label]) => <div className={`vitalMeter vital-${key}`} key={key}><div><span>{label}</span><b>{Number(viewed.metrics[key] || 0).toFixed(1)}</b></div><meter min="0" max="100" value={viewed.metrics[key] || 0} aria-label={label} /></div>)}
        {viewed.metrics.proteinFunction !== undefined && <div className="vitalMeter"><div><span>Protein işlevi (temsili)</span><b>{Number(viewed.metrics.proteinFunction ?? 0).toFixed(1)}</b></div><meter min="0" max="100" value={viewed.metrics.proteinFunction ?? 0} aria-label="Protein işlevi" /></div>}{Object.entries({autoimmuneActivity:'Otoimmün etkinlik',metabolicImbalance:'Metabolik dengesizlik',neuralFunction:'Sinir işlevi',tumorBurden:'Göreli hücre birikimi'}).filter(([key])=>viewed.metrics[key]!==undefined).map(([key,label])=><div className="vitalMeter" key={key}><div><span>{label}</span><b>{Number(viewed.metrics[key]).toFixed(1)}</b></div><meter min="0" max="100" value={viewed.metrics[key]} aria-label={label}/></div>)}<h3>Gözlenen belirtiler</h3><ul className="simulationSymptoms">{viewed.symptoms.map((item, index) => <li key={index}>{typeof item === 'string' ? item : item.name || item.label}</li>)}</ul>
        {latestBulletin.length > 0 && <div className="simulationBulletin"><h3>Günlük bülten</h3><p>{noteText(latestBulletin[0])}</p><button onClick={() => bulletinDialog.current?.showModal()}>Bülten geçmişi ↗</button></div>}
        <button className="simulationSave" onClick={() => openSave()}>Vakayı kaydet</button><button className="simulationReportButton" onClick={() => setReport(true)}>Gözlem raporu ↗</button>
      </aside>
    </div>
    <footer className="simulationTimeline">
      <div className="timelineControls"><button disabled={!!state.finalOutcome} onClick={() => run(state.running ? simulation.pause : simulation.resume)}>{state.running ? 'Ⅱ Duraklat' : '▶ Oynat'}</button><button disabled={!!state.finalOutcome} onClick={() => run(() => { simulation.pause(); simulation.step(); })}>+1 gün</button><label>Hız<select aria-label="Simülasyon hızı" value={state.config.speedMs} onChange={(event) => simulation.setSpeed(Number(event.target.value))}><option value="2800">0.5×</option><option value="1400">1×</option><option value="700">2×</option><option value="500">2.8×</option>{![2800,1400,700,500].includes(state.config.speedMs) && <option value={state.config.speedMs}>Özel</option>}</select></label><button onClick={() => run(() => { simulation.restart(state); setDismissed(false); })}>↺ Sıfırla</button></div>
      <div className="timelineTrack"><div className="timelineLabels"><label htmlFor="simulation-day">Gün {viewed.day} / {state.config.durationDays}</label><span>Geçmiş günler yalnızca önizlenir</span></div><svg viewBox="0 0 300 52" preserveAspectRatio="none" aria-label="Mekanizma ve doku zaman grafiği" role="img"><polyline points={points(state.timeline, primaryKey, state.config.durationDays)} className="pathogenLine"/><polyline points={points(state.timeline, secondaryKey, state.config.durationDays)} className="immunityLine"/></svg><input id="simulation-day" type="range" min="0" max={state.day} value={viewed.day} disabled={state.day === 0} onChange={(event) => { simulation.pause(); setPreviewDay(Number(event.target.value)); }} /><div className="timelineLegend"><span>● {primaryLabel}</span><span>● {infectious ? "Kazanılmış yanıt" : "Doku stresi"}</span><span>Gün 0</span><span>Gün {state.day}</span></div></div>
    </footer>
    {state.finalOutcome && !dismissed && <div className="simulationCompletion" role="status"><div><strong>{state.finalOutcome.label || 'Gözlem tamamlandı'}</strong><span>Bu vakayı laboratuvar arşivine ekleyebilirsin.</span></div><button onClick={() => openSave(true)}>★ Yıldızla ve kaydet</button><button onClick={() => setDismissed(true)} aria-label="Sonuç önerisini kapat">×</button></div>}
    {message && <p className="simulationNotice" role="status">{message} <Link href="/archive">Arşive git</Link></p>}{error && <p className="simulationError" role="alert">{error}</p>}
    {bulletinToast && <div className="simulationBulletinToast" role="status"><button onClick={() => { setBulletinToast(null); bulletinDialog.current?.showModal(); }}><span>GÜN {bulletinToast.day} · YENİ BÜLTEN</span>{noteText(bulletinToast)}</button><button aria-label="Bülten bildirimini kapat" onClick={() => setBulletinToast(null)}>×</button></div>}
    <dialog ref={bulletinDialog} className="simulationBulletinDialog" aria-labelledby="bulletin-dialog-title"><button className="bulletinDialogClose" onClick={() => bulletinDialog.current?.close()} aria-label="Bülten geçmişini kapat">×</button><h2 id="bulletin-dialog-title">Bülten geçmişi</h2>{state.bulletinHistory.length ? <ol>{state.bulletinHistory.map((item, index) => <li key={index}><strong>Gün {item.day}</strong><p>{noteText(item)}</p></li>)}</ol> : <p>Henüz bülten yayımlanmadı.</p>}</dialog>
    {(saving || report) && <div className="simulationModalBackdrop" onClick={(event) => { if (event.target === event.currentTarget) { setSaving(false); setReport(false); } }}><div className="simulationModal" role="dialog" aria-modal="true" aria-labelledby="simulation-modal-title"><button className="modalClose" aria-label="Pencereyi kapat" onClick={() => { setSaving(false); setReport(false); }}>×</button>
      {saving ? <form onSubmit={save}><h2 id="simulation-modal-title">Vakayı arşivle · Gün {state.day}</h2><label>Vaka adı<input autoFocus required maxLength="120" value={name} onChange={(event) => setName(event.target.value)}/></label><label>Açıklama<textarea maxLength="1000" value={description} onChange={(event) => setDescription(event.target.value)}/></label><label>Öğretmen notu<textarea maxLength="2000" value={note} onChange={(event) => setNote(event.target.value)}/></label><label className="starCase"><input type="checkbox" checked={starred} onChange={(event) => setStarred(event.target.checked)}/> Yıldızlı vaka</label>{error && <p role="alert">{error}</p>}<button type="submit">Kaydı oluştur</button></form> : <div><h2 id="simulation-modal-title">Gözlem raporu</h2><p>{state.finalOutcome?.summary || 'Simülasyon gözlemleri devam ediyor.'}</p><p>{state.interventions.length} müdahale · {state.publicHealthDecisions.length} toplum sağlığı kararı</p><ol className="simulationReportList">{state.timeline.map((item) => <li key={item.day}><b>Gün {item.day}</b><span>{primaryLabel} {Number(item.metrics[primaryKey]||0).toFixed(1)} · Doku hasarı {item.metrics.tissueDamage.toFixed(1)}</span><small>{item.currentDiagnosis}</small></li>)}</ol></div>}
    </div></div>}
  </section>;
}
