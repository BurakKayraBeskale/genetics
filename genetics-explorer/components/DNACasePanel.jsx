'use client';
import { useEffect, useState } from 'react';
import PathogenGenomeScene from './PathogenGenomeScene';
import './DNACasePanel.css';
const RELATIONS={DIRECT_GENETIC:'Doğrudan genetik ilişki',HOST_RESPONSE:'Konak hücresel yanıtı',PATHOGEN_GENOME:'Etken genetik materyali',INDIRECT:'Dolaylı / çok etkenli ilişki',NONE:'Doğrudan genetik ilişki gösterilmedi'};
export default function DNACasePanel({context,state,onShowBody,onShowCell,onTabChange}) {
  const [tab,setTab]=useState('human');
  const [step,setStep]=useState(0);
  useEffect(()=>{setTab('human');setStep(0);onTabChange?.('human');},[context?.diseaseScenarioId,context?.relation?.type,context?.relation?.pathogenGenomeType]);
  if(!context)return null;
  const relation=context.relation||{};
  const pathway=context.molecularPathway||[];
  const selected=pathway[Math.min(step,pathway.length-1)];
  const hasPathogen=!!relation.pathogenGenomeType && relation.pathogenGenomeType!=='NONE';
  const changeTab=value=>{setTab(value);onTabChange?.(value);};
  return <section className="dnaCasePanel" aria-label="Aktif vakanın DNA bağlamı"><header className="dnaCaseHeader"><div><span>AKTİF VAKA · MOLEKÜLER BAĞLAM</span><h2>{context.name} <small>Gün {context.day ?? state?.day ?? 0}</small></h2></div><p>DNA ile ilişkisi: <strong>{RELATIONS[relation.type]||'Eğitimsel bağlam'}</strong></p></header>
    <div className="dnaCaseAnswer"><div><span>BU HASTALIK DNA’YI ETKİLER Mİ?</span><h3>{context.genomeAnswer || 'İlişki hastalığın mekanizmasına göre değerlendirilir.'}</h3><p>{context.genomeQualification || relation.explanation}</p></div><div className="dnaCaseGeneTags">{relation.gene&&<div><span>GEN</span><strong>{relation.gene}</strong></div>}{relation.protein&&<div><span>PROTEİN</span><strong>{relation.protein}</strong></div>}</div></div>
    {hasPathogen&&<nav className="dnaCaseGenomeTabs" role="tablist" aria-label="Genom bağlamı"><button id="human-genome-tab" role="tab" aria-selected={tab==='human'} aria-controls="human-genome-context" onClick={()=>changeTab('human')}>İnsan Genomu</button><button id="pathogen-genome-tab" role="tab" aria-selected={tab==='pathogen'} aria-controls="pathogen-genome-context" onClick={()=>changeTab('pathogen')}>Etken Genetik Materyali · {relation.pathogenGenomeType}</button></nav>}
    {tab==='pathogen'?<div id="pathogen-genome-context" role="tabpanel" aria-labelledby="pathogen-genome-tab"><PathogenGenomeScene genomeType={relation.pathogenGenomeType} explanation={relation.explanation}/></div>:<div id="human-genome-context" role={hasPathogen?'tabpanel':undefined} aria-labelledby={hasPathogen?'human-genome-tab':undefined}><div className="dnaCasePathwayTitle"><span>MOLEKÜLER ETKİ ZİNCİRİ</span><small>Aşamaya dokunarak bağlantıyı incele</small></div><div className="dnaCasePathway" role="group" aria-label="Moleküler aşamalar">{pathway.map((item,index)=><button key={index} className={`dnaCaseStep dnaCaseStep-${item.type||'neutral'}`} aria-pressed={step===index} onClick={()=>setStep(index)}><i aria-hidden="true">{String(index+1).padStart(2,'0')}</i><span>{item.label}</span>{index<pathway.length-1&&<b aria-hidden="true">→</b>}</button>)}</div>{selected&&<div className="dnaCaseStepDetail" role="status"><strong>{selected.label}</strong><p>{selected.text}</p></div>}<div className="dnaCaseActions"><button onClick={()=>onShowBody?.(context.organTarget)}>Vücutta etkisini göster ↗</button><button onClick={()=>onShowCell?.(context.organTarget)}>Bu değişiklik hücrede ne yapıyor? ↗</button></div><p className="dnaCaseNote">DNA görüntüsü ve mutasyon araçları kısa, sentetik bir eğitim dizisiyle çalışır. Tam insan genomu, doğrulanmış hastalık varyantı veya etken genom dizisi değildir; buradaki deney aktif vakanın biyolojik seyrini değiştirmez.</p></div>}
    {(context.sources||relation.sources||[]).length>0&&<details className="dnaCaseSources"><summary>Genetik bağlamın kaynakları</summary>{(context.sources||relation.sources).map((source,index)=><a key={index} href={typeof source==='string'?source:source.url} target="_blank" rel="noopener noreferrer">{typeof source==='string'?'Bilimsel kaynak':source.title||'Bilimsel kaynak'} ↗</a>)}</details>}
  </section>;
}

