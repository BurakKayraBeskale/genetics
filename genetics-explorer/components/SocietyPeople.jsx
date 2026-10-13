'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { deriveSocietyView } from '../lib/societyView.js';
import './SocietyPeople.css';
const STATUS={
 healthy:{label:'Sağlıklı',icon:'○',risk:'Düşük',note:'Aktif vaka veya temsili risk grubunda gösterilmeyen nüfus payı; bireysel sağlık tanısı değildir.'},
 risk:{label:'Temaslı / riskli',icon:'◇',risk:'Orta',note:'Soyut maruziyet grubunu temsil eder; gerçek temas kaydı veya kişisel risk tahmini değildir.'},
 sick:{label:'Hasta',icon:'+',risk:'Orta',note:'Aktif vaka payının temsili birimi; bu figür gerçek bir hastayı izlemez.'},
 severe:{label:'Ağır hasta',icon:'!',risk:'Yüksek',note:'Aktif vakaların içindeki ağır durum payıdır. Hasta toplamına ayrıca eklenmez.'},
 recovered:{label:'İyileşmiş',icon:'✓',risk:'Düşük',note:'Modeldeki iyileşmiş nüfus payı; kişisel bağışıklık veya klinik sonuç garantisi değildir.'},
};
const statusOf=value=>{const s=String(value||'healthy').toLowerCase();return s==='exposed'?'risk':STATUS[s]?s:'healthy';};
const percent=value=>Number(value||0).toLocaleString('tr-TR',{maximumFractionDigits:2});
const signed=value=>`${Number(value||0)>0?'+':''}${Number(value||0).toLocaleString('tr-TR',{maximumFractionDigits:1})}`;
function HumanFigure(){return <svg viewBox="0 0 64 164" aria-hidden="true"><ellipse className="society-floor" cx="32" cy="160" rx="23" ry="3"/><circle cx="32" cy="15" r="10"/><path d="M22 31Q32 27 42 31L49 39Q51 41 52 47L59 81Q61 89 55 91Q49 92 47 85L41 62V97L43 149Q43 158 36 158Q30 158 29 150L27 107H26L24 150Q24 158 18 158Q11 158 12 149L15 97V62L9 85Q7 93 1 91Q-4 89-2 81L5 47Q6 41 12 38Z" transform="translate(5 0) scale(.85 1)"/><path className="society-scan" d="M20 47H44M22 61H42M25 75H39M28 90H36"/></svg>;}
export default function SocietyPeople({outbreak,day,caseKey,animate=true}){
 const shownDay=day??outbreak?.day??0;
 const shown=useMemo(()=>{const history=(outbreak?.history||[]).filter(p=>p.day<=shownDay);const point=history.find(p=>p.day===shownDay);return shownDay<(outbreak?.day??shownDay)&&point?{...outbreak,...point,history}:outbreak;},[outbreak,shownDay]);
 const view=useMemo(()=>deriveSocietyView(shown),[shown]);
 const targets=useMemo(()=>Array.from({length:10},(_,i)=>statusOf(view.personStates?.[i]?.status??view.people?.[i])),[view]);
 const identity=String(caseKey??outbreak?.caseKey??'current');
 const [selected,setSelected]=useState(null);const [display,setDisplay]=useState(targets);const [changing,setChanging]=useState([]);const [reduced,setReduced]=useState(false);
 const previous=useRef(null);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');setReduced(media.matches);const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{setSelected(null);},[identity]);
 const signature=targets.join('|');
 useEffect(()=>{
  const old=previous.current;previous.current={identity,day:shownDay,targets};
  if(!animate||reduced||!view.contagious||!old||old.identity!==identity||shownDay!==old.day+1){setDisplay(targets);setChanging([]);return;}
  const changes=targets.flatMap((s,i)=>s!==old.targets[i]?[i]:[]);setDisplay(old.targets);setChanging(changes);
  const intermediates=targets.map((s,i)=>{const path=view.personStates?.[i]?.path;if(path?.length>2)return statusOf(path[1]);if(old.targets[i]==='healthy'&&['sick','severe'].includes(s))return'risk';if(s==='severe'&&old.targets[i]==='risk')return'sick';return s;});
  const first=setTimeout(()=>setDisplay(intermediates),180);const finish=setTimeout(()=>setDisplay(targets),520);const settle=setTimeout(()=>setChanging([]),1000);
  return()=>{clearTimeout(first);clearTimeout(finish);clearTimeout(settle);};
 },[identity,shownDay,signature,animate,reduced,view.contagious]);
 const history=shown?.history||[];const prior=history.filter(p=>p.day<shownDay).at(-1);
 const previousView=prior?deriveSocietyView({...shown,...prior,history:history.filter(p=>p.day<=prior.day)}):null;
 const change=shown?.dailyChange||view.dailyChange||{};const counts={healthy:0,risk:0,sick:0,severe:0,recovered:0,...view.counts};
 const before=change.sickPercentBefore??previousView?.actualSickPercent??view.actualSickPercent;
 const after=change.sickPercentAfter??view.actualSickPercent;
 const detail=selected===null?null:view.personStates?.[selected];const selectedStatus=selected===null?null:targets[selected];
 return <section className="society-people" aria-label="On kişilik toplum modeli">
  <header><div><span className="society-eyebrow">TOPLUM ÖLÇEĞİ · GÜN {shownDay}</span><h2>10 kişide toplum görünümü</h2></div><span className="society-scale">1 figür = %10</span></header>
  {!view.contagious&&<div className="society-inactive"><strong>{outbreak?.populationSpreadUnsupported?'Bu yayılım modeli bu profile uygulanmaz.':'Bu hastalık kişiler arasında bulaşıcı olarak modellenmez.'}</strong><p>{outbreak?.disclaimer||'Bu görünüm enfeksiyon yayılımı üretmez; figürler nötr gösterilir.'}</p></div>}
  <div className="society-ratio"><strong>%{view.contagious?view.sickPercent:0}</strong><div><span>Gösterilen aktif hasta oranı</span><small>{counts.sick+counts.severe} / 10 figür · ağır hastalar aktif toplamın içindedir</small></div></div>
  <div className="society-figures">{targets.map((status,index)=>{const shownStatus=view.contagious?statusOf(display[index]):'healthy';const info=STATUS[shownStatus];return <button type="button" key={view.personStates?.[index]?.id||`person-${index}`} className={`society-person society-person--${shownStatus} ${changing.includes(index)?'is-changing':''}`} aria-label={`Kişi ${String(index+1).padStart(2,'0')}: ${info.label}, toplumun yüzde onu`} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span className="society-person-id">{String(index+1).padStart(2,'0')}</span><HumanFigure/><span className="society-person-state"><i aria-hidden="true">{info.icon}</i>{info.label}</span>{changing.includes(index)&&<small className="society-transition-label">Temsili geçiş</small>}</button>;})}</div>
  <div className="society-legend">{Object.entries(STATUS).map(([status,info])=><span key={status}><i className={`society-dot society-dot--${status}`}/>{info.label} <b>{counts[status]}</b></span>)}</div>
  <div className="society-selection" role="status">{selectedStatus?<><strong>KİŞİ {String(selected+1).padStart(2,'0')} · {STATUS[selectedStatus].label}</strong><div className="society-person-meta"><span>Vaka günü: {shownDay}</span><span>Temsili risk: {detail?.riskLevel||STATUS[selectedStatus].risk}</span></div><p>{STATUS[selectedStatus].note} Bir figür toplumun %10’unu temsil eder.</p></>:<p>Durum ve risk açıklamasını görmek için bir figüre dokunun.</p>}</div>
  {view.contagious&&<div className="society-daily-change"><header><span>BUGÜN NE DEĞİŞTİ?</span><small>{prior?`Gün ${prior.day} → ${shownDay}`:'Başlangıç gözlemi'}</small></header><div className="society-change-grid"><div><b>{signed(change.newCases??view.newCases)}</b><span>Yeni vaka · model</span></div><div><b>{signed(change.exposed??0)}</b><span>Riskli grup değişimi</span></div><div><b>{signed(change.recovered??0)}</b><span>İyileşen grup değişimi</span></div><div><b>{signed(change.severe??0)}</b><span>Ağır grup değişimi</span></div></div><div className="society-day-comparison"><span>Model hasta payı <b>%{percent(before)} → %{percent(after)}</b></span><span>Yayılım baskısı <b>{percent(prior?.spread??shown?.spread)} → {percent(shown?.spread)}</b></span></div><small className="society-change-scope">Grup değişimleri model nüfusunda hesaplanır; 10 figürün yuvarlanmış sayısı değildir.</small>{(shown?.explanations?.sick||shown?.explanations?.spread)&&<details><summary>Neden değişti?</summary><p>{[].concat(shown.explanations.sick||[],shown.explanations.spread||[]).join(' ')}</p></details>}</div>}
  <div className="society-stats"><div><span>Model nüfusunda aktif hasta</span><strong>%{percent(view.actualSickPercent)}</strong><small>{Number(shown?.activeCases||0).toLocaleString('tr-TR')} / {Number(view.population||0).toLocaleString('tr-TR')}</small></div><div><span>Model nüfusunda iyileşmiş</span><strong>%{percent(view.actualRecoveredPercent)}</strong><small>Görsel: {counts.recovered} /10 · %{view.recoveredPercent||0}</small></div></div>
  <p className="society-caption">Figürler sabit temsili birimlerdir; gerçek birey veya temas ağı değildir. Renk geçişi yalnız görsel anlatımdır. Küçük nüfus payları yuvarlanınca 0 figür olabilir.</p>
 </section>;
}
