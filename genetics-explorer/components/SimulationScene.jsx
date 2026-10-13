'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './SimulationScene.css';
import ReferenceAnatomy from './anatomy/ReferenceAnatomy';
import { getStructures, getStructure, getStructureRepresentation } from '../lib/anatomyHierarchy';
import AnatomyHud from './anatomy/AnatomyHud';
import SocietyPeople from './SocietyPeople';
import { affectedOrgansFor, getOrganEffect, ORGAN_EDUCATION } from '../lib/organEducation';

const INFO = {
 protein: ['Protein işlevi', 'Genetik senaryoda renk yoğunluğu göreli protein işlevini gösterir. Moleküller şematik olup hastalığa özel yapı veya klinik tahmin değildir.'],
 pathogen: ['Etken yükü', 'Parçacık sayısı ve yoğunluğu, modeldeki etken yükünü temsil eder. Boyutlar gerçek moleküler ölçek değildir.'],
 immune: ['Bağışıklık yanıtı', 'Cyan hücreler doğuştan ve kazanılmış bağışıklık düzeylerine bağlıdır.'],
 tissue: ['Doku yanıtı', 'Akciğer rengi göreli inflamasyon ve doku stresini gösterir; anatomik veya klinik ölçüm değildir.'],
 population: ['Toplum yayılımı', 'On figür toplum modelindeki payların yuvarlanmış gösterimidir; gerçek kişileri temsil etmez.'],
 rna: ['Genetik materyal', 'Sarmal, genetik materyalin şematik görünümüdür; hastalığa özel bir sekans analizi değildir.'],
};
const sphere = new THREE.SphereGeometry(1, 16, 12);
function Particles({ count, color, radius=1.5, size=.08, seed=0, onClick, shell=false }) {
 const ref=useRef(); const dummy=useMemo(()=>new THREE.Object3D(),[]);
 const transforms=useMemo(()=>Array.from({length:count},(_,i)=>{
  const angle=i*2.39996+seed; const y=1-2*(i+.5)/Math.max(1,count); const r=Math.sqrt(1-y*y)*radius;
  return [Math.cos(angle)*r, y*radius, Math.sin(angle)*r];
 }),[count,radius,seed]);
 useFrame(({clock})=>{if(!ref.current)return; const t=clock.elapsedTime;
  transforms.forEach((p,i)=>{dummy.position.set(p[0],p[1]+(shell?0:Math.sin(t*.5+i)*.025),p[2]);dummy.scale.setScalar(size);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);});ref.current.instanceMatrix.needsUpdate=true;
 });
 return <instancedMesh ref={ref} args={[sphere,undefined,count]} dispose={null} onClick={e=>{e.stopPropagation();onClick?.();}}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.25} roughness={.3}/></instancedMesh>;
}
function Marker({position, color='#5ce5ff',onClick}){return <mesh position={position} onClick={e=>{e.stopPropagation();onClick();}}><sphereGeometry args={[.12,12,8]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.8}/></mesh>;}
function Molecular({metrics,onSelect}) {
 const group=useRef();useFrame((_,delta)=>{if(group.current)group.current.rotation.y+=Math.min(delta,.05)*.12;});
 const points=useMemo(()=>Array.from({length:60},(_,i)=>new THREE.Vector3(Math.cos(i*.3)*.4,(i/59-.5)*1.5,Math.sin(i*.3)*.4)),[]);
 const curve=useMemo(()=>new THREE.CatmullRomCurve3(points),[points]);
 return <group ref={group}><mesh onClick={e=>{e.stopPropagation();onSelect('pathogen');}}><sphereGeometry args={[1.22,32,24]}/><meshPhysicalMaterial color="#1684a8" transparent opacity={.22} roughness={.2} metalness={.2} depthWrite={false}/></mesh>
 <Particles count={48} radius={1.24} size={.105} color="#54defc" shell onClick={()=>onSelect('pathogen')}/>
 <mesh onClick={e=>{e.stopPropagation();onSelect('rna');}}><tubeGeometry args={[curve,80,.035,6,false]}/><meshStandardMaterial color="#fbba77" emissive="#e88a39" emissiveIntensity={.4}/></mesh>
 <Particles count={Math.round(metrics.pathogenLoad*.35)+4} radius={1.8} color="#f27e9c" size={.04} onClick={()=>onSelect('pathogen')}/><Marker position={[0,1.6,0]} onClick={()=>onSelect('rna')}/></group>;
}
function GeneticMolecular({metrics,onSelect}) {
 const curves=useMemo(()=>[0,Math.PI].map(phase=>new THREE.CatmullRomCurve3(Array.from({length:64},(_,i)=>new THREE.Vector3(Math.cos(i*.2+phase)*.56,(i/63-.5)*2.8,Math.sin(i*.2+phase)*.56)))),[]);
 const bridgeGeometry=useMemo(()=>new THREE.CylinderGeometry(.04,.04,1.12,8),[]);
 useEffect(()=>()=>bridgeGeometry.dispose(),[bridgeGeometry]);
 const proteinColor=new THREE.Color('#ffb779').lerp(new THREE.Color('#fa5f85'),1-(metrics.proteinFunction??100)/100);
 return <group><group position={[-.6,0,0]}>{curves.map((curve,i)=><mesh key={i} onClick={e=>{e.stopPropagation();onSelect('rna');}}><tubeGeometry args={[curve,96,.065,8,false]}/><meshStandardMaterial color={i?'#5aa7ff':'#59e8db'} roughness={.3} emissiveIntensity={.15}/></mesh>)}{Array.from({length:16},(_,i)=><mesh key={i} position={[0,(i/15-.5)*2.8,0]} rotation={[0,-i*.84,Math.PI/2]} geometry={bridgeGeometry} dispose={null}><meshStandardMaterial color="#e0a4d8" roughness={.4}/></mesh>)}</group><group position={[1.1,0,0]} onClick={e=>{e.stopPropagation();onSelect('protein');}}>{Array.from({length:12},(_,i)=><mesh key={i} geometry={sphere} dispose={null} position={[Math.sin(i*.75)*.3,(i/11-.5)*1.4,Math.cos(i*.75)*.3]} scale={.17}><meshStandardMaterial color={proteinColor} roughness={.3}/></mesh>)}</group></group>;
}
function GeneticCell({metrics,onSelect}) {
 return <group><mesh><sphereGeometry args={[1.8,32,20]}/><meshPhysicalMaterial color="#58cde8" transparent opacity={.12} depthWrite={false} roughness={.35}/></mesh><mesh scale={[.55,.6,.55]} geometry={sphere} dispose={null}><meshStandardMaterial color="#6769a9"/></mesh><Particles count={16} radius={1.2} size={.13} color={new THREE.Color('#5ce5ff').lerp(new THREE.Color('#ff648a'),1-(metrics.proteinFunction??100)/100).getStyle()} onClick={()=>onSelect('protein')}/></group>;
}
function Cell({metrics,onSelect}){return <group>
 <mesh onClick={e=>{e.stopPropagation();onSelect('pathogen');}}><sphereGeometry args={[1.8,40,28]}/><meshPhysicalMaterial color="#58cde8" transparent opacity={.12} roughness={.35} metalness={.12} depthWrite={false}/></mesh>
 <mesh><sphereGeometry args={[1.82,20,14]}/><meshBasicMaterial color="#29adc9" wireframe transparent opacity={.16}/></mesh>
 <mesh scale={[.52,.58,.52]}><sphereGeometry args={[1,20,14]}/><meshStandardMaterial color="#5e61ba" roughness={.5}/></mesh>
 <Particles count={Math.round(metrics.infectedCells*.6)+2} radius={1.35} color="#ff648a" size={.08} onClick={()=>onSelect('pathogen')}/>
 <Particles count={Math.round((metrics.innateImmunity+metrics.adaptiveImmunity)*.15)+3} radius={2.05} color="#5ce5ff" size={.13} seed={2} onClick={()=>onSelect('immune')}/>
 <Marker position={[0,1.95,0]} color="#ff648a" onClick={()=>onSelect('pathogen')}/></group>;}
const ORGAN_INFO = {lungs:['Akciğerler'],digestive:['Sindirim sistemi'],brain:['Beyin'],muscle:['Kas dokusu'],renal:['Böbrekler'],endocrine:['Endokrin sistem'],skin:['Deri'],blood:['Dolaşım sistemi']};
function SceneCamera({mode,view,reducedMotion,controlsRef}) {
 const {camera}=useThree();const moving=useRef(false);const destination=useRef(new THREE.Vector3());
 useEffect(()=>{destination.current.set(0,mode==='body'?0:1.2,mode==='body'?(view==='body'?8.15:5.6):6.6);moving.current=true;},[mode,view]);
 useEffect(()=>{const control=controlsRef.current;const stop=()=>{moving.current=false;};control?.addEventListener('start',stop);return()=>control?.removeEventListener('start',stop);},[controlsRef]);
 useFrame((_,delta)=>{if(!moving.current)return;camera.position.lerp(destination.current,reducedMotion?1:1-Math.exp(-Math.min(delta,.05)*5));camera.lookAt(0,0,0);controlsRef.current?.target.set(0,0,0);if(camera.position.distanceTo(destination.current)<.015)moving.current=false;});return null;
}
export default function SimulationScene({state,mode='cell',outbreak,selectedOrgan,onOrganSelect,selectedStructure,onSelectStructure,onAssetStatus,assetStatus}){
 const hudLabel=useRef(null);const controlsRef=useRef(null);
 const [selected,setSelected]=useState(null);const [bodyView,setBodyView]=useState('body');const [organ,setOrgan]=useState(null);
 const metrics=state?.metrics??{pathogenLoad:18,infectedCells:8,innateImmunity:12,adaptiveImmunity:0,inflammation:5,tissueDamage:0};
 const noninfectious=!String(state?.scenarioConfig?.mechanism || 'infectious/viral').startsWith('infectious/');
 const genetic=state?.scenarioConfig?.category==='genetic';
 useEffect(()=>{setOrgan(null);setSelected(null);},[state?.diseaseScenarioId]);
 const target=selectedOrgan??organ??affectedOrgansFor(state?.scenarioConfig||{})[0]??'lungs';
 const affectedOrgans=affectedOrgansFor(state?.scenarioConfig||{});
 const visualSeverity=getOrganEffect(state?.scenarioConfig||{},metrics,affectedOrgans[0]).severity/100;
 const organEffect=getOrganEffect(state?.scenarioConfig||{},metrics,target);
 const structureDefinition=getStructure(target,selectedStructure);
 const hasSupplementSource=target==='digestive'&&selectedStructure==='stomach'||target==='muscle'&&selectedStructure==='skeletal-muscle';
 const structureRepresentation=hasSupplementSource?'mesh':getStructureRepresentation(target,selectedStructure,[...(assetStatus?.meshNames||[]),...(assetStatus?.supplementNames||[])]);
 const informationOnly=!!structureDefinition&&selectedStructure!=='all'&&structureRepresentation==='information';
 const [reducedMotion,setReducedMotion]=useState(false);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReducedMotion(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{if(selectedStructure&&selectedStructure!=='all')setBodyView(structureRepresentation==='schematic'?'tissue':structureRepresentation==='information'?'body':'organ');},[selectedStructure,structureRepresentation]);
 useEffect(()=>{if(bodyView==='tissue'&&!selectedStructure)onSelectStructure?.(getStructures(target).find(s=>s.representation==='schematic')?.id||'all');},[target,bodyView,selectedStructure,onSelectStructure]);
 const titles={molecular:'Moleküler görünüm',cell:'Hücre görünümü',body:'İnsan vücudu',society:'Toplum görünümü'};
 const select=key=>{setSelected(key);if(ORGAN_INFO[key]){setOrgan(key);onOrganSelect?.(key);}};
 const info=ORGAN_INFO[selected]??INFO[selected];
 const wholeBody=mode==='body'&&bodyView==='body';
 if(mode==='society')return <SocietyPeople outbreak={outbreak} day={state?.day||0}/>;
 return <div className={"biomedicalScene"+(mode==='body'?' holographicAnatomy':'')}><div className="sceneCaption"><span>{titles[mode]}</span><small>Gün {state?.day??0} · Etkileşimli 3B</small></div>
 {mode==='body'&&<div ref={hudLabel} className={'anatomyDataTag anatomyProjectedTag'+(organEffect.affected?' is-affected':'')}><small>SEÇİLİ SİSTEM</small><strong>{structureDefinition&&selectedStructure!=='all'?structureDefinition.name:ORGAN_EDUCATION[target]?.name}</strong><span>{organEffect.affected?'ETKİ VURGUSU · '+Math.round(organEffect.severity)+'/100':'ANATOMİK KEŞİF'}</span></div>}
 {mode==='body'&&!assetStatus?.ready&&<div className={assetStatus?.error?'referenceFallbackNotice':'referenceModelLoading'} role="status">{assetStatus?.error?'Yedek şematik anatomi · Referans yüklenemedi':'Anatomik model yükleniyor…'}</div>}
 {mode==='body'&&informationOnly&&<div className="anatomySelectionNote" role="status"><strong>{structureDefinition.name}</strong><span>Bu referansta ayrı geometri yok. Anatomik bağlam korunur; açıklama sağ paneldedir.</span></div>}
 {mode==='body'&&<div className="anatomyMonitor" aria-hidden="true"><span>ANATOMİ TARAMASI</span><small>Vücut · Organ · Doku</small><i/></div>}
 {mode==='body'&&<div className="bodyViewSwitcher" aria-label="Anatomi ölçeği">{[['body','Vücut'],['organ','Organ'],['tissue','Hedef Doku']].map(([value,label])=><button key={value} aria-pressed={bodyView===value} onClick={()=>{setBodyView(value);if(value==='organ'&&informationOnly)onSelectStructure?.('all');if(value==='tissue'&&getStructures(target).find(s=>s.id===selectedStructure)?.representation!=='schematic')onSelectStructure?.(getStructures(target).find(s=>s.representation==='schematic')?.id||'all');}}>{label}</button>)}</div>}
 <Canvas dpr={[1,1.4]} camera={{position:[0,0,9.2],fov:42}} gl={{antialias:true,alpha:true}}><SceneCamera mode={mode} view={bodyView} controlsRef={controlsRef} reducedMotion={reducedMotion}/><ambientLight intensity={mode==='body'?.55:.7}/><directionalLight position={[3,5,4]} intensity={mode==='body'?1.4:2}/><pointLight position={[-3,1,2]} color="#35cfff" intensity={mode==='body'?6:12}/>{mode==='molecular'?(genetic?<GeneticMolecular metrics={metrics} onSelect={select}/>:<>{noninfectious?<GeneticCell metrics={metrics} onSelect={select}/>:<Molecular metrics={metrics} onSelect={select}/>}</>):mode==='body'?<><ReferenceAnatomy selectedStructure={selectedStructure} onSelectStructure={onSelectStructure} onStatus={onAssetStatus} view={bodyView} target={target} affectedOrgans={affectedOrgans} severity={visualSeverity} onSelect={select} reducedMotion={reducedMotion}/><AnatomyHud target={target} view={bodyView} affected={organEffect.affected} severity={organEffect.severity/100} reducedMotion={reducedMotion} labelRef={hudLabel}/><directionalLight position={[-3,3,-2]} color="#39cef0" intensity={2.5}/></>:(noninfectious?<GeneticCell metrics={metrics} onSelect={select}/>:<Cell metrics={metrics} onSelect={select}/>)}<OrbitControls ref={controlsRef} enablePan={false} minDistance={wholeBody?5.6:3.5} maxDistance={12} enableDamping dampingFactor={.08}/></Canvas>
 {mode==='body'&&<div className="organTargets" aria-label="Hedef organ seçimi">{Object.entries(ORGAN_INFO).map(([key,[label]])=><button key={key} aria-pressed={target===key} onClick={()=>select(key)}>{label}</button>)}</div>}
 <div className="sceneGesture">Sürükle: döndür · Kaydır: yakınlaş · Modele tıkla: bilgi</div>{!ORGAN_INFO[selected]&&selected&&info&&<div className="sceneExplanation" role="status"><button aria-label="Bilgiyi kapat" onClick={()=>setSelected(null)}>×</button><strong>{info[0]}</strong><p>{info[1]}</p>{ORGAN_INFO[selected]&&<p>İnflamasyon: %{Math.round(metrics.inflammation??0)} · Doku stresi: %{Math.round(metrics.tissueDamage??0)}{genetic&&<> · Protein işlevi: %{Math.round(metrics.proteinFunction??100)}</>}</p>}</div>}<span className="sceneScale">{mode==='body'?(assetStatus?.error?'Yedek şematik anatomi':assetStatus?.loading?'Şematik önizleme · Referans model yükleniyor':bodyView==='tissue'&&getStructures(target).find(s=>s.id===selectedStructure)?.representation==='schematic'?'Öğretici mikrodoku şeması · Gerçek organ meshinden türetilmez':bodyView!=='body'&&(target==='muscle'&&selectedStructure!=='muscle-fiber'||target==='digestive'&&selectedStructure==='stomach')?'BodyParts3D · Bağımsız organ referansı':'Human Reference Atlas · Anatomik referans meshleri'):'Şematik eğitim modeli · Ölçekler temsilidir'}</span></div>;
}
