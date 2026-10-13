'use client';
import { memo } from 'react';
import { getStructures, getStructure, structureHasMesh, structureMatchesMesh } from '../lib/anatomyHierarchy';
import { ORGAN_EDUCATION } from '../lib/organEducation';
import './AnatomyHierarchy.css';
function AnatomyHierarchy({organ,selectedStructure,onSelectStructure,structures=[],availableMeshNames=[]}) {
 const entries=getStructures(organ);
 const selectedId=typeof selectedStructure==='string'?selectedStructure:selectedStructure?.id;
 const selected=getStructure(organ,selectedId);
 const hasMesh=item=>structureHasMesh(item,structures)||availableMeshNames.some(name=>structureMatchesMesh(item,name));
 if (!entries.length) return null;
 return <section className="anatomy-hierarchy" aria-label="Organ ve alt yapı seçimi">
  <header><span>ANATOMİ HİYERARŞİSİ</span><h3>{ORGAN_EDUCATION[organ]?.name}</h3></header>
  <div className="anatomy-structure-list"><button type="button" aria-pressed={!selectedId || selectedId==='all'} onClick={()=>onSelectStructure?.('all')}><span>Organın bütünü</span><small>Genel görünüm</small></button>{entries.map(item=>{const meshAvailable=hasMesh(item);return <button key={item.id} type="button" aria-pressed={selectedId===item.id} onClick={()=>onSelectStructure?.(item.id)}><span>{item.name}</span><small className={meshAvailable?'has-mesh':''}>{meshAvailable?'3B alt yapı':'Doku bilgisi'}</small></button>;})}</div>
  {selected && selected.id!=='all' && <div className="anatomy-selected-structure"><strong>{selected.name}</strong><span>{selected.tissue}</span><p>{selected.description}</p><small>{hasMesh(selected)?'Yüklenen modelde ayrı geometri olarak bulunur.':'Bu seçim öğretici bilgi verir; yüklenen modelde ayrı alt yapı geometrisi doğrulanmadı.'}</small></div>}
  <details className="anatomy-source-info"><summary>Model kapsamı ve lisanslar</summary><p>HRA kadın referans anatomisi sınırlı organ setidir. Mide ve omuz/kol kasları BodyParts3D erkek referansından ayrı gösterilir; iki bedene ortak kayıt yapılmadı. Mikrodokular öğretici şemadır.</p><a href="/models/anatomy/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">HRA · CC BY 4.0 ↗</a><a href="/models/anatomy/supplemental/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">BodyParts3D · CC BY-SA 2.1 JP ↗</a></details><p className="anatomy-hierarchy-scope">Organ → alt yapı → doku. “3B alt yapı” yalnız yüklenen modelde doğrulanan parçalar için gösterilir.</p>
 </section>;
}
export default memo(AnatomyHierarchy);
