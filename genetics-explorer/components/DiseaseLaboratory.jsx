'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSimulation } from '../providers/SimulationProvider';
import { SCENARIOS, INTERVENTIONS } from '../lib/simulation';
import { computeOutbreak } from '../lib/outbreak';
import SimulationScene from './SimulationScene';
import ClinicalAdvisor from './ClinicalAdvisor';
import ClinicalEventPanel, { EVENT_ICONS } from './ClinicalEventPanel';
import HealthBulletin from './HealthBulletin';
import ClinicalCaseReport from './ClinicalCaseReport';
import { getCaseAtDay } from '../lib/caseView';
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
  const { state, outbreak, isMystery, studentView, setStudentView, observationRequest, clearObservationRequest } = simulation;
  const hiddenProfile = isMystery && studentView;
  const [mode, setMode] = useState('body');
  const [focusRequest,setFocusRequest]=useState(0);
  const [eventTab,setEventTab]=useState('history');
  const [organSelection,setOrganSelection]=useState(null);
  const [structureSelection,setStructureSelection]=useState(null);
  const [anatomyAsset,setAnatomyAsset]=useState(null);
  const [previewDay, setPreviewDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState(false);
  const hadOutcome = useRef(!!state.finalOutcome);
  useEffect(()=>{ if(state.finalOutcome&&!hadOutcome.current)setReport(true); hadOutcome.current=!!state.finalOutcome; },[state.finalOutcome]);
  useEffect(()=>{ if(!saving&&!report)return; const escape=event=>{if(event.key==='Escape'){setSaving(false);setReport(false);}}; document.addEventListener('keydown',escape); return()=>document.removeEventListener('keydown',escape); },[saving,report]);
  const [bulletinToast, setBulletinToast] = useState(null);
  const bulletinDialog = useRef(null);
  const toastTimer=useRef(null);
  useEffect(()=>()=>clearTimeout(toastTimer.current),[]);
  const seenEvents = useRef(null);
  useEffect(() => {
    const identity = state.seed + ':' + state.diseaseScenarioId;
    const items = state.clinicalEvents || [];
    const prior = seenEvents.current;
    if (!prior || prior.identity !== identity || state.day < prior.day) {
      seenEvents.current = { identity, day: state.day, ids: new Set(items.map(item=>item.id)) };
      clearTimeout(toastTimer.current); setBulletinToast(null); return;
    }
    if (state.day !== prior.day + 1) { seenEvents.current = {identity,day:state.day,ids:new Set(items.map(item=>item.id))}; return; }
    const fresh = items.filter(item=>!prior.ids.has(item.id) && ['IMPORTANT','CRITICAL'].includes(item.severity));
    seenEvents.current = { identity, day: state.day, ids: new Set(items.map(item=>item.id)) };
    if (!fresh.length) return;
    setBulletinToast(fresh.at(-1));
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setBulletinToast(null),6500);
  }, [state.clinicalEvents, state.day, state.seed, state.diseaseScenarioId]);
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
  useEffect(() => { setPreviewDay(null); setDismissed(false); setOrganSelection(null); setStructureSelection(null); setSaving(false); setReport(false); bulletinDialog.current?.close(); }, [state.diseaseScenarioId, state.seed]);
  useEffect(()=>{if(!observationRequest)return;setMode(observationRequest.mode);if(observationRequest.organ){setOrganSelection(observationRequest.organ);setStructureSelection(observationRequest.structure||'all');}if(observationRequest.mode==='body')setFocusRequest(value=>value+1);clearObservationRequest();},[observationRequest,clearObservationRequest]);
  const snapshot = previewDay === null ? null : state.timeline.find((item) => item.day === previewDay);
  const viewed = useMemo(() => snapshot ? getCaseAtDay(state,snapshot.day) : state, [state, snapshot]);
  const preview = !!snapshot && snapshot.day !== state.day;
  const infectious = String(scenario.mechanism || 'infectious/viral').startsWith('infectious/');
  const primaryKey = infectious ? 'pathogenLoad' : ({genetic:'proteinFunction',autoimmune:'autoimmuneActivity',metabolic:'metabolicImbalance',neurological:'neuralFunction',oncology:'tumorBurden'}[scenario.category] || 'tissueDamage');
  const primaryLabel = ({pathogenLoad:'Patojen',proteinFunction:'Protein işlevi',autoimmuneActivity:'Otoimmün etkinlik',metabolicImbalance:'Metabolik dengesizlik',neuralFunction:'Sinir işlevi',tumorBurden:'Hücre yükü',tissueDamage:'Doku stresi'})[primaryKey];
  const secondaryKey = infectious ? 'adaptiveImmunity' : 'tissueDamage';
  const clinicalEvents = viewed.clinicalEvents || [];
  const latestBulletin = clinicalEvents.filter(item=>['BULLETIN','PUBLIC_HEALTH','ALERT'].includes(item.type)).slice(-1);
  const openEvents = tab => { setEventTab(tab); bulletinDialog.current?.showModal(); };
  const focusOrgan = organ => { setMode('body'); chooseOrgan(organ); setStructureSelection('all'); setFocusRequest(value=>value+1); bulletinDialog.current?.close(); };
  const previewAt = day => { simulation.pause(); setBulletinToast(null); setPreviewDay(day); };
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
      {!hiddenProfile && <><Link href="/dna?mode=case" className="simulationArchiveLink">Genetik ilişkisini incele ↗</Link><Link href="/archive" className="simulationArchiveLink">Arşiv ↗</Link></>}{isMystery && <button onClick={()=>{ setStudentView(!studentView); setBulletinToast(null); }}>{studentView?'Öğretmen görünümü':'Öğrenci görünümü'}</button>}
    </header>
    <div className="simulationWorkspace">
      <aside className="simulationAdvisor" aria-label="Eğitim danışmanı">
        <ClinicalAdvisor knowledge={viewed.knowledgeState} events={clinicalEvents} day={viewed.day}/>
        {!hiddenProfile&&<details className="profileSource"><summary>Öğretim profili ve kaynaklar</summary><p>{scenario.cellularMechanism || scenario.description}</p><p>Zaman çizelgesi eğitim adımlarıdır; klinik süre tahmini değildir.</p>{(scenario.sources||[]).map((source,i)=><a key={i} href={source.url} target="_blank" rel="noopener noreferrer">{source.title||'Bilimsel kaynak'} ↗</a>)}</details>}
        <button className="clinicalHistoryButton" onClick={()=>openEvents('history')}>Klinik olay dosyası · {clinicalEvents.length}</button>
        <details className="simulationInterventions"><summary>Model müdahaleleri</summary>{INTERVENTIONS.map((item) => <button key={item.id} disabled={!!state.finalOutcome || preview} title={item.description} onClick={() => run(() => simulation.intervene(item.id))}>{item.label}</button>)}<small>Soyut katsayıları değiştirir.</small></details>
        <p className="simulationDisclaimer">Zaman çizelgesi eğitim adımlarıdır; klinik hastalık süresi değildir. Göreli 0–100 değerleri klinik tahmin veya tedavi önerisi değildir.</p>
      </aside>
      <div className="simulationVisual">
        <div className="simulationSceneCaption"><span>{MODES.find(([id]) => id === mode)?.[1]} ölçeği</span><span>{preview ? 'GEÇMİŞ GÖZLEM' : viewed.finalOutcome ? 'TAMAMLANDI' : state.running ? 'CANLI' : 'DURAKLATILDI'} · Gün {viewed.day}</span></div>
        <SimulationScene focusRequest={focusRequest} assetStatus={anatomyAsset} selectedStructure={structureSelection} onSelectStructure={setStructureSelection} onAssetStatus={setAnatomyAsset} selectedOrgan={selectedOrgan} onOrganSelect={chooseOrgan} state={viewed} mode={mode} outbreak={preview ? computeOutbreak({ ...viewed, timeline: state.timeline.filter((item) => item.day <= viewed.day), publicHealthDecisions: state.publicHealthDecisions.filter((item) => item.day <= viewed.day) }) : outbreak} preview={preview} />
        {mode!=='society'&&<div className="simulationSceneHint">Sürükle: döndür · Tekerlek: yaklaş</div>}
        {preview && <button className="previewReturn" onClick={() => setPreviewDay(null)}>Gün {state.day} canlı duruma dön</button>}
        {mode === 'society' && <Link className="societyRoute" href="/outbreak">Salgın çalışma alanını aç ↗</Link>}
      </div>
      <aside className="simulationVitals" aria-label="Göstergeler ve belirtiler">
        {mode==='body'&&<OrganDetails day={viewed.day} duration={viewed.config.durationDays} organ={selectedOrgan} profile={scenario} metrics={viewed.metrics} hiddenProfile={hiddenProfile}/>}
        {mode==='body'&&<AnatomyHierarchy organ={selectedOrgan} selectedStructure={structureSelection} onSelectStructure={setStructureSelection} availableMeshNames={[...(anatomyAsset?.meshNames||[]),...(anatomyAsset?.supplementNames||[])]}/>}<h2>{preview ? `Gün ${viewed.day} göstergeleri` : "Canlı göstergeler"}</h2><span className="relativeUnits">Göreli model birimleri</span>
        {Object.entries(METRICS).filter(([key])=>infectious || ["inflammation","tissueDamage"].includes(key)).map(([key, label]) => <div className={`vitalMeter vital-${key}`} key={key}><div><span>{label}</span><b>{Number(viewed.metrics[key] || 0).toFixed(1)}</b></div><meter min="0" max="100" value={viewed.metrics[key] || 0} aria-label={label} /></div>)}
        {viewed.metrics.proteinFunction !== undefined && <div className="vitalMeter"><div><span>Protein işlevi (temsili)</span><b>{Number(viewed.metrics.proteinFunction ?? 0).toFixed(1)}</b></div><meter min="0" max="100" value={viewed.metrics.proteinFunction ?? 0} aria-label="Protein işlevi" /></div>}{Object.entries({autoimmuneActivity:'Otoimmün etkinlik',metabolicImbalance:'Metabolik dengesizlik',neuralFunction:'Sinir işlevi',tumorBurden:'Göreli hücre birikimi'}).filter(([key])=>viewed.metrics[key]!==undefined).map(([key,label])=><div className="vitalMeter" key={key}><div><span>{label}</span><b>{Number(viewed.metrics[key]).toFixed(1)}</b></div><meter min="0" max="100" value={viewed.metrics[key]} aria-label={label}/></div>)}<h3>Gözlenen belirtiler</h3><ul className="simulationSymptoms">{viewed.symptoms.map((item, index) => <li key={index}>{typeof item === 'string' ? item : item.name || item.label}</li>)}</ul>
        <div className="simulationBulletin"><span className="simulationEyebrow">SAĞLIK BİLGİ AĞI</span><h3>{latestBulletin[0]?.title || 'Veri temelli bültenler'}</h3><p>{latestBulletin[0]?.text || 'Önemli değişimler ve toplum gözlemleri burada yayımlanacak.'}</p><button onClick={() => openEvents('bulletins')}>Sağlık bültenini aç ↗</button><button onClick={() => openEvents('history')}>Laboratuvar ve olaylar ↗</button></div>
        <button className="simulationSave" onClick={() => openSave()}>Vakayı kaydet</button><button className="simulationReportButton" onClick={() => setReport(true)}>Gözlem raporu ↗</button>
      </aside>
    </div>
    <footer className="simulationTimeline">
      <div className="timelineControls"><button disabled={!!state.finalOutcome} onClick={() => run(state.running ? simulation.pause : simulation.resume)}>{state.running ? 'Ⅱ Duraklat' : '▶ Oynat'}</button><button disabled={!!state.finalOutcome} onClick={() => run(() => { simulation.pause(); simulation.step(); })}>+1 gün</button><label>Hız<select aria-label="Simülasyon hızı" value={state.config.speedMs} onChange={(event) => simulation.setSpeed(Number(event.target.value))}><option value="2800">0.5×</option><option value="1400">1×</option><option value="700">2×</option><option value="500">2.8×</option>{![2800,1400,700,500].includes(state.config.speedMs) && <option value={state.config.speedMs}>Özel</option>}</select></label><button onClick={() => run(() => { simulation.restart(state); setDismissed(false); })}>↺ Sıfırla</button></div>
      <div className="timelineTrack"><div className="timelineLabels"><label htmlFor="simulation-day">Gün {viewed.day} / {state.config.durationDays}</label><span>Geçmiş günler yalnızca önizlenir</span></div><svg viewBox="0 0 300 52" preserveAspectRatio="none" aria-label="Mekanizma ve doku zaman grafiği" role="img"><polyline points={points(viewed.timeline, primaryKey, state.config.durationDays)} className="pathogenLine"/><polyline points={points(viewed.timeline, secondaryKey, state.config.durationDays)} className="immunityLine"/></svg><input id="simulation-day" type="range" min="0" max={state.day} value={viewed.day} disabled={state.day === 0} onChange={(event) => { previewAt(Number(event.target.value)); }} /><div className="timelineLegend"><span>● {primaryLabel}</span><span>● {infectious ? "Kazanılmış yanıt" : "Doku stresi"}</span><span>Gün 0</span><span>Gün {state.day}</span></div></div>
          <div className="clinicalTimelineDays" aria-label="Günlere göre vaka olayları">{state.timeline.map(point=>{ const events=(state.clinicalEvents||[]).filter(item=>item.day===point.day); const types=[...new Set(events.map(item=>item.type))]; return <button key={point.day} aria-pressed={viewed.day===point.day} onClick={()=>previewAt(point.day)} title={events.length ? events.map(item=>item.title).join(' · ') : 'Bu gün önemli olay yok'}><span>Gün {point.day}</span><small aria-label={events.map(item=>item.title).join(', ')}>{types.map(type=>EVENT_ICONS[type]).join(' ') || '·'}</small></button>; })}</div>
    </footer>
    {viewed.finalOutcome && !dismissed && <div className="simulationCompletion" role="status"><div><strong>{state.finalOutcome.label || 'Gözlem tamamlandı'}</strong><span>Bu vakayı laboratuvar arşivine ekleyebilirsin.</span></div><button onClick={() => openSave(true)}>★ Yıldızla ve kaydet</button><button onClick={() => setDismissed(true)} aria-label="Sonuç önerisini kapat">×</button></div>}
    {message && <p className="simulationNotice" role="status">{message} <Link href="/archive">Arşive git</Link></p>}{error && <p className="simulationError" role="alert">{error}</p>}
    {bulletinToast && !preview && <div className="simulationBulletinToast" role="status"><button onClick={() => { setBulletinToast(null); openEvents(['BULLETIN','PUBLIC_HEALTH'].includes(bulletinToast.type)?'bulletins':'history'); }}><span>GÜN {bulletinToast.day} · ÖNEMLİ VAKA OLAYI</span>{noteText(bulletinToast)}</button><button aria-label="Bülten bildirimini kapat" onClick={() => setBulletinToast(null)}>×</button></div>}
    <dialog ref={bulletinDialog} className="simulationBulletinDialog clinicalNarrativeDialog" aria-label="Vaka olayları ve sağlık bülteni"><button className="bulletinDialogClose" onClick={() => bulletinDialog.current?.close()} aria-label="Vaka olaylarını kapat">×</button><nav className="clinicalDialogTabs"><button aria-pressed={eventTab==='history'} onClick={()=>setEventTab('history')}>Vaka olayları</button><button aria-pressed={eventTab==='bulletins'} onClick={()=>setEventTab('bulletins')}>Sağlık bülteni</button></nav>{eventTab==='history'?<ClinicalEventPanel events={clinicalEvents} day={viewed.day} hiddenProfile={hiddenProfile} onFocusOrgan={focusOrgan}/>:<HealthBulletin outbreak={computeOutbreak(viewed)} events={clinicalEvents} day={viewed.day} timeline={viewed.timeline} hiddenProfile={hiddenProfile} onFocusOrgan={focusOrgan}/>}</dialog>
    {(saving || report) && <div className="simulationModalBackdrop" onClick={(event) => { if (event.target === event.currentTarget) { setSaving(false); setReport(false); } }}><div className="simulationModal" role="dialog" aria-modal="true" aria-labelledby="simulation-modal-title"><button className="modalClose" aria-label="Pencereyi kapat" onClick={() => { setSaving(false); setReport(false); }}>×</button>
      {saving ? <form onSubmit={save}><h2 id="simulation-modal-title">Vakayı arşivle · Gün {state.day}</h2><label>Vaka adı<input autoFocus required maxLength="120" value={name} onChange={(event) => setName(event.target.value)}/></label><label>Açıklama<textarea maxLength="1000" value={description} onChange={(event) => setDescription(event.target.value)}/></label><label>Öğretmen notu<textarea maxLength="2000" value={note} onChange={(event) => setNote(event.target.value)}/></label><label className="starCase"><input type="checkbox" checked={starred} onChange={(event) => setStarred(event.target.checked)}/> Yıldızlı vaka</label>{error && <p role="alert">{error}</p>}<button type="submit">Kaydı oluştur</button></form> : <div><h2 id="simulation-modal-title">Klinik vaka raporu · Gün {viewed.day}</h2><ClinicalCaseReport state={viewed} hiddenProfile={hiddenProfile}/></div>}
    </div></div>}
  </section>;
}
