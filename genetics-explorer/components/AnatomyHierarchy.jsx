'use client';
import { memo } from 'react';
import { getStructures, getStructure, structureHasMesh, structureMatchesMesh, getStructureRepresentation } from '../lib/anatomyHierarchy';
import { ORGAN_EDUCATION } from '../lib/organEducation';
import './AnatomyHierarchy.css';
function AnatomyHierarchy({organ,selectedStructure,onSelectStructure,structures=[],availableMeshNames=[]}) {
 const entries=getStructures(organ);
 const selectedId=typeof selectedStructure==='string'?selectedStructure:selectedStructure?.id;
 const selected=getStructure(organ,selectedId);
 const hasMesh=item=>structureHasMesh(item,structures)||availableMeshNames.some(name=>structureMatchesMesh(item,name));
 const representation=item=>hasMesh(item)?'mesh':getStructureRepresentation(organ,item.id,availableMeshNames);
 const labels={mesh:'3B alt yapı',schematic:'Mikrodoku şeması',information:'Bilgi'};
 if (!entries.length) return null;
 return <section className="anatomy-hierarchy" aria-label="Organ ve alt yapı seçimi">
  <header><span>ANATOMİ HİYERARŞİSİ</span><h3>{ORGAN_EDUCATION[organ]?.name}</h3></header>
  <div className="anatomy-structure-list"><button type="button" aria-pressed={!selectedId || selectedId==='all'} onClick={()=>onSelectStructure?.('all')}><span>Organın bütünü</span><small>Genel görünüm</small></button>{entries.map(item=>{const meshAvailable=hasMesh(item);return <button key={item.id} type="button" aria-pressed={selectedId===item.id} onClick={()=>onSelectStructure?.(item.id)}><span className="anatomy-structure-name"><span>{item.name}</span><span className="anatomy-tissue-path">↳ {item.tissue}</span></span><small className={meshAvailable?'has-mesh':''}>{labels[representation(item)]}</small></button>;})}</div>
  {selected && selected.id!=='all' && <div className="anatomy-selected-structure"><nav className="anatomy-selected-path" aria-label="Anatomik konum">{ORGAN_EDUCATION[organ]?.name} › {selected.name} › Doku</nav><strong>{selected.name}</strong><span>{selected.tissue}</span><p>{selected.description}</p><small>{representation(selected)==='mesh'?'Yüklenen modelde ayrı geometri olarak bulunur.':representation(selected)==='schematic'?'Büyütülmüş öğretici mikrodoku şemasıdır; atlasın ölçülmüş anatomik geometrisi değildir.':'Yüklenen modelde ayrı geometri doğrulanmadı. Bu seçim yalnız anatomik bilgi sunar; farklı bir dokunun şeması yerine kullanılmaz.'}</small></div>}
  <details className="anatomy-source-info"><summary>Model kapsamı ve lisanslar</summary><p>HRA kadın referans anatomisi sınırlı organ setidir. Mide ve omuz/kol kasları BodyParts3D erkek referansından ayrı gösterilir; iki bedene ortak kayıt yapılmadı. Mikrodokular öğretici şemadır.</p><a href="/models/anatomy/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">HRA · CC BY 4.0 ↗</a><a href="/models/anatomy/supplemental/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">BodyParts3D · CC BY-SA 2.1 JP ↗</a></details><p className="anatomy-hierarchy-scope">Organ → alt yapı → doku. “3B alt yapı” yalnız yüklenen modelde doğrulanan parçalar için gösterilir.</p>
 </section>;
}
export default memo(AnatomyHierarchy);
