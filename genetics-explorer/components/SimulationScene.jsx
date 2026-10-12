'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './SimulationScene.css';

const INFO = {
 protein: ['Protein işlevi', 'Genetik senaryoda renk yoğunluğu göreli protein işlevini gösterir. Moleküller şematik olup hastalığa özel yapı veya klinik tahmin değildir.'],
 pathogen: ['Etken yükü', 'Parçacık sayısı ve yoğunluğu, modeldeki etken yükünü temsil eder. Boyutlar gerçek moleküler ölçek değildir.'],
 immune: ['Bağışıklık yanıtı', 'Cyan hücreler doğuştan ve kazanılmış bağışıklık düzeylerine bağlıdır.'],
 tissue: ['Doku yanıtı', 'Akciğer rengi göreli inflamasyon ve doku stresini gösterir; anatomik veya klinik ölçüm değildir.'],
 population: ['Toplum yayılımı', 'Şehirdeki renkli düğümler soyut nüfus paylarını gösterir; gerçek kişileri veya coğrafi veriyi temsil etmez.'],
 rna: ['Genetik materyal', 'Sarmal, genetik materyalin şematik görünümüdür; hastalığa özel bir sekans analizi değildir.'],
};
const sphere = new THREE.SphereGeometry(1, 16, 12);
const box = new THREE.BoxGeometry(1, 1, 1);
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
const limbGeometry = new THREE.CapsuleGeometry(1, 1, 4, 12);
const ORGAN_INFO = {
 lungs: ['Akciğerler', 'Solunum dokusunun şematik görünümü. Renk yoğunluğu modeldeki inflamasyon ve doku stresine bağlıdır.'],
 digestive: ['Sindirim sistemi', 'Mide ve bağırsakların temsilî görünümü. Görüntü gerçek anatomi veya klinik ölçüm değildir.'],
 brain: ['Beyin', 'Sinir sistemi için şematik hedef. Renkler simülasyonun göreli doku stresini gösterir.'],
 muscle: ['Kas dokusu', 'İskelet kaslarını temsil eden hedef doku. Genetik senaryolarda işlev göstergesi protein işlevine bağlıdır.'],
 renal: ['Böbrekler', 'Böbrek hedefinin temsili görünümü; renkler soyut doku stresini gösterir.'],
 endocrine: ['Endokrin sistem', 'Pankreas bölgesindeki sembol metabolik ve hormonal işlev göstergesidir; bütün endokrin organları temsil etmez.'],
 skin: ['Deri', 'Deri hedefi için şematik yüzey göstergesi.'],
 blood: ['Dolaşım sistemi', 'Kalp ve damarların sadeleştirilmiş görünümü. Genetik senaryolarda protein işlevi eğitim amaçlı temsil edilir.'],
};
function primaryOrgan(systems) {
 for (const value of Array.isArray(systems)?systems:[]) {
  const name=String(value).toLowerCase();
  if (/respir|lung/.test(name)) return 'lungs';
  if (/digest|gastro/.test(name)) return 'digestive';
  if (/neuro|brain/.test(name)) return 'brain';
  if (/muscul/.test(name)) return 'muscle';
  if (/renal|kidney|urinary/.test(name)) return 'renal';
  if (/endocrin|metabol/.test(name)) return 'endocrine';
  if (/skin|derma/.test(name)) return 'skin';
  if (/cardio|blood|circul|systemic|immune/.test(name)) return 'blood';
 }
 return 'lungs';
}
function SmoothPart({position,scale,rotation,material,geometry=sphere,onClick}) {
 return <mesh geometry={geometry} material={material} position={position} scale={scale} rotation={rotation} dispose={null} onClick={onClick}/>;
}
function HumanSilhouette() {
 const skin=useMemo(()=>new THREE.MeshPhysicalMaterial({color:'#52b6ca',transparent:true,opacity:.27,roughness:.42,metalness:.12,depthWrite:false}),[]);
 useEffect(()=>()=>skin.dispose(),[skin]);
 return <group>
 <SmoothPart position={[0,2.35,0]} scale={[.32,.43,.29]} material={skin}/>
 <SmoothPart position={[0,1.83,0]} scale={[.15,.14,.15]} geometry={limbGeometry} material={skin}/>
 <SmoothPart position={[0,1.16,0]} scale={[.62,.65,.29]} material={skin}/>
 <SmoothPart position={[0,.47,0]} scale={[.43,.44,.25]} material={skin}/>
 <SmoothPart position={[0,.02,0]} scale={[.49,.35,.29]} material={skin}/>
 {[-1,1].map(side=><group key={side}>
 <SmoothPart position={[side*.62,1.49,0]} scale={[.24,.23,.25]} material={skin}/>
 <SmoothPart position={[side*.84,1.02,0]} scale={[.15,.36,.15]} rotation={[0,0,side*.24]} geometry={limbGeometry} material={skin}/>
 <SmoothPart position={[side*.99,.48,0]} scale={[.145,.15,.145]} material={skin}/>
 <SmoothPart position={[side*1.09,.07,0]} scale={[.12,.3,.12]} rotation={[0,0,side*.13]} geometry={limbGeometry} material={skin}/>
 <SmoothPart position={[side*1.16,-.42,.025]} scale={[.13,.22,.085]} material={skin}/>
 <SmoothPart position={[side*1.02,-.4,.065]} scale={[.065,.12,.06]} rotation={[0,0,-side*.4]} material={skin}/>
 <SmoothPart position={[side*.28,-.65,0]} scale={[.22,.47,.22]} rotation={[0,0,-side*.035]} geometry={limbGeometry} material={skin}/>
 <SmoothPart position={[side*.31,-1.37,0]} scale={[.18,.18,.18]} material={skin}/>
 <SmoothPart position={[side*.32,-1.94,-.015]} scale={[.15,.43,.15]} geometry={limbGeometry} material={skin}/>
 <SmoothPart position={[side*.32,-2.59,.14]} scale={[.18,.14,.34]} material={skin}/>
 </group>)}
 </group>;
}
const ORGAN_POSITIONS={lungs:[0,1.13,.12],digestive:[0,.37,.12],brain:[0,2.38,.06],muscle:[-.28,-.65,.1],blood:[0,1.12,.17],renal:[0,.4,-.04],endocrine:[0,.56,.17],skin:[.55,.8,.27]};
function OrganShape({kind,material,onClick}) {
 const gut=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({length:42},(_,i)=>new THREE.Vector3(Math.sin(i*.56)*.27,-.12-i*.011,.06))),96,.055,8,false),[]);
 const vessel=useMemo(()=>new THREE.CylinderGeometry(.035,.035,1,8),[]);
 useEffect(()=>()=>{gut.dispose();vessel.dispose();},[gut,vessel]);
 const hit=e=>{e.stopPropagation();onClick?.(kind);};
 return <group onClick={hit}>
 {kind==='renal'&&[-1,1].map(side=><SmoothPart key={side} position={[side*.31,0,0]} scale={[.12,.2,.1]} rotation={[0,0,side*.2]} material={material}/>)}
 {kind==='endocrine'&&<SmoothPart scale={[.22,.09,.08]} rotation={[0,0,.2]} material={material}/>}
 {kind==='skin'&&<SmoothPart scale={[.08,.2,.045]} material={material}/>}
 {kind==='lungs'&&[-1,1].map(side=><SmoothPart key={side} position={[side*.24,0,0]} scale={[.205,.4,.16]} rotation={[0,0,-side*.13]} material={material}/>)}
 {kind==='lungs'&&<SmoothPart position={[0,.32,0]} scale={[.055,.18,.055]} material={material} geometry={limbGeometry}/>}
 {kind==='digestive'&&<><SmoothPart position={[-.08,.17,0]} scale={[.23,.19,.13]} rotation={[0,0,.6]} material={material}/><mesh geometry={gut} material={material}/></>}
 {kind==='brain'&&[-1,1].map(side=><SmoothPart key={side} position={[side*.115,0,0]} scale={[.16,.24,.22]} material={material}/>)}
 {kind==='muscle'&&<SmoothPart scale={[.16,.39,.16]} geometry={limbGeometry} material={material}/>}
 {kind==='blood'&&<><SmoothPart scale={[.16,.2,.15]} rotation={[0,0,-.3]} material={material}/><mesh position={[0,-.46,0]} scale={[1,1.3,1]} geometry={vessel} material={material}/>{[-1,1].map(side=><mesh key={side} position={[side*.19,-.99,0]} rotation={[0,0,-side*.3]} scale={[1,.7,1]} geometry={vessel} material={material}/>)}</>}
 </group>;
}
function TargetTissue({stress,kind,onSelect}) {
 const ref=useRef();const dummy=useMemo(()=>new THREE.Object3D(),[]);
 const healthy=useMemo(()=>new THREE.Color('#40cdd7'),[]); const damaged=useMemo(()=>new THREE.Color('#ff6579'),[]);
 useLayoutEffect(()=>{if(!ref.current)return;for(let i=0;i<49;i++){dummy.position.set((i%7-3)*.43,(Math.floor(i/7)-3)*.43,Math.sin(i*2.4)*.06);dummy.scale.set(.19,.19,.12);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);ref.current.setColorAt(i,healthy.clone().lerp(damaged,Math.min(1,stress*(.6+(i%5)*.1))));}ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;},[stress,dummy,healthy,damaged]);
 return <instancedMesh ref={ref} args={[sphere,undefined,49]} dispose={null} onClick={e=>{e.stopPropagation();onSelect(kind);}}><meshStandardMaterial roughness={.38} metalness={.15}/></instancedMesh>;
}
function Body({metrics,systems,view,target,onSelect,genetic}) {
 const stress= Math.min(1,Math.max(0,(Number(metrics.inflammation??0)+Number(metrics.tissueDamage??0)+Number(metrics.autoimmuneActivity??0)+Number(metrics.metabolicImbalance??0)+Number(metrics.tumorBurden??0)+(metrics.neuralFunction!==undefined?100-Number(metrics.neuralFunction):0)+(genetic?100-Number(metrics.proteinFunction??100):0))/(genetic?300:200)));
 const color=new THREE.Color('#39c9d7').lerp(new THREE.Color('#ff6579'),stress);
 const active=useMemo(()=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.2+stress*.35,roughness:.38,metalness:.15}),[color.getHex(),stress]);
 const quiet=useMemo(()=>new THREE.MeshStandardMaterial({color:'#42687b',transparent:true,opacity:.45,roughness:.5}),[]);
 useEffect(()=>()=>active.dispose(),[active]);
 useEffect(()=>()=>quiet.dispose(),[quiet]);
 const primary=primaryOrgan(systems);
 const activeOrgans=new Set((systems||[]).map(system=>primaryOrgan([system])));
 if(view==='tissue')return <TargetTissue stress={stress} kind={target} onSelect={onSelect}/>;
 if(view==='organ')return <group scale={target==='blood'?1.8:2.8}><OrganShape kind={target} material={active} onClick={onSelect}/></group>;
 return <group><HumanSilhouette/>{Object.keys(ORGAN_INFO).map(kind=><group key={kind} position={ORGAN_POSITIONS[kind]}><OrganShape kind={kind} material={activeOrgans.has(kind)||kind===target?active:quiet} onClick={onSelect}/></group>)}<mesh position={[0,-2.78,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.85,1.04,48]}/><meshBasicMaterial color="#29bcd3" transparent opacity={.45} side={THREE.DoubleSide}/></mesh></group>;
}
function Society({outbreak,onSelect}){
 const ref=useRef();const nodes=useRef();const dummy=useMemo(()=>new THREE.Object3D(),[]);const cyan=useMemo(()=>new THREE.Color('#56d8ee'),[]);const red=useMemo(()=>new THREE.Color('#ff648a'),[]);const green=useMemo(()=>new THREE.Color('#5ce0bd'),[]);const data=useMemo(()=>Array.from({length:64},(_,i)=>({x:(i%8-3.5)*.49,z:(Math.floor(i/8)-3.5)*.49,h:.15+((i*17)%9)*.065})),[]);
 const share=Math.max(0,Math.min(1,(outbreak?.activeCases??0)/Math.max(1,outbreak?.population??10000)));
 const recovered=Math.max(0,Math.min(1-share,(outbreak?.recovered??0)/Math.max(1,outbreak?.population??10000)));
 useFrame(()=>{if(!ref.current||!nodes.current)return;data.forEach((p,i)=>{dummy.position.set(p.x,p.h/2-.75,p.z);dummy.scale.set(.23,p.h,.23);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);dummy.position.set(p.x,p.h-.67,p.z);dummy.scale.setScalar(.055);dummy.updateMatrix();nodes.current.setMatrixAt(i,dummy.matrix);nodes.current.setColorAt(i,i<Math.round(share*64)?red:i<Math.round((share+recovered)*64)?green:cyan);});ref.current.instanceMatrix.needsUpdate=true;nodes.current.instanceMatrix.needsUpdate=true;if(nodes.current.instanceColor)nodes.current.instanceColor.needsUpdate=true;});
 return <group rotation={[.18,0,0]}><gridHelper args={[4.4,9,'#287b91','#174957']} position={[0,-.75,0]}/><instancedMesh ref={ref} args={[box,undefined,64]} dispose={null}><meshStandardMaterial color="#276078" roughness={.4} metalness={.4}/></instancedMesh><instancedMesh ref={nodes} args={[sphere,undefined,64]} dispose={null} onClick={e=>{e.stopPropagation();onSelect('population');}}><meshStandardMaterial roughness={.3}/></instancedMesh><Marker position={[0,.65,0]} onClick={()=>onSelect('population')}/></group>;
}
function SceneCamera({mode,view}) {
 const {camera}=useThree();
 useEffect(()=>{camera.position.set(0,mode==='body'?0:1.2,mode==='body'?(view==='body'?9.2:6.6):6.6);camera.lookAt(0,0,0);camera.updateProjectionMatrix();},[camera,mode,view]);
 return null;
}
export default function SimulationScene({state,mode='cell',outbreak}){
 const [selected,setSelected]=useState(null);const [bodyView,setBodyView]=useState('body');const [organ,setOrgan]=useState(null);
 const metrics=state?.metrics??{pathogenLoad:18,infectedCells:8,innateImmunity:12,adaptiveImmunity:0,inflammation:5,tissueDamage:0};
 const systems=state?.scenarioConfig?.affectedSystems;
 const noninfectious=!String(state?.scenarioConfig?.mechanism || 'infectious/viral').startsWith('infectious/');
 const genetic=state?.scenarioConfig?.category==='genetic';
 useEffect(()=>{setOrgan(null);setSelected(null);},[state?.diseaseScenarioId]);
 const target=organ??primaryOrgan(systems);
 const titles={molecular:'Moleküler görünüm',cell:'Hücre görünümü',body:'İnsan vücudu',society:'Toplum görünümü'};
 const select=key=>{setSelected(key);if(ORGAN_INFO[key])setOrgan(key);};
 const info=ORGAN_INFO[selected]??INFO[selected];
 const wholeBody=mode==='body'&&bodyView==='body';
 return <div className="biomedicalScene"><div className="sceneCaption"><span>{titles[mode]}</span><small>Gün {state?.day??0} · Etkileşimli 3B</small></div>
 {mode==='body'&&<div className="bodyViewSwitcher" aria-label="Anatomi ölçeği">{[['body','Vücut'],['organ','Organ'],['tissue','Hedef Doku']].map(([value,label])=><button key={value} aria-pressed={bodyView===value} onClick={()=>setBodyView(value)}>{label}</button>)}</div>}
 <Canvas dpr={[1,1.4]} camera={{position:[0,0,9.2],fov:42}} gl={{antialias:true,alpha:true}}><SceneCamera mode={mode} view={bodyView}/><ambientLight intensity={.7}/><directionalLight position={[3,5,4]} intensity={2}/><pointLight position={[-3,1,2]} color="#35cfff" intensity={12}/>{mode==='molecular'?(genetic?<GeneticMolecular metrics={metrics} onSelect={select}/>:<>{noninfectious?<GeneticCell metrics={metrics} onSelect={select}/>:<Molecular metrics={metrics} onSelect={select}/>}</>):mode==='body'?<Body genetic={genetic} metrics={metrics} systems={systems} view={bodyView} target={target} onSelect={select}/>:mode==='society'?<Society outbreak={outbreak} onSelect={select}/>:(noninfectious?<GeneticCell metrics={metrics} onSelect={select}/>:<Cell metrics={metrics} onSelect={select}/>)}<OrbitControls key={`${mode}-${bodyView}`} enablePan={false} minDistance={wholeBody?5.6:3.5} maxDistance={12} enableDamping dampingFactor={.08}/></Canvas>
 {mode==='body'&&<div className="organTargets" aria-label="Hedef organ seçimi">{Object.entries(ORGAN_INFO).map(([key,[label]])=><button key={key} aria-pressed={target===key} onClick={()=>select(key)}>{label}</button>)}</div>}
 <div className="sceneGesture">Sürükle: döndür · Kaydır: yakınlaş · Modele tıkla: bilgi</div>{selected&&info&&<div className="sceneExplanation" role="status"><button aria-label="Bilgiyi kapat" onClick={()=>setSelected(null)}>×</button><strong>{info[0]}</strong><p>{info[1]}</p>{ORGAN_INFO[selected]&&<p>İnflamasyon: %{Math.round(metrics.inflammation??0)} · Doku stresi: %{Math.round(metrics.tissueDamage??0)}{genetic&&<> · Protein işlevi: %{Math.round(metrics.proteinFunction??100)}</>}</p>}</div>}<span className="sceneScale">Şematik eğitim modeli · Ölçekler temsilidir</span></div>;
}
