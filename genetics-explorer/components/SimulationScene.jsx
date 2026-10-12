'use client';
import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './SimulationScene.css';

const INFO = {
 pathogen: ['Etken yükü', 'Parçacık sayısı ve yoğunluğu, modeldeki etken yükünü temsil eder. Boyutlar gerçek moleküler ölçek değildir.'],
 immune: ['Bağışıklık yanıtı', 'Cyan hücreler doğuştan ve kazanılmış bağışıklık düzeylerine bağlıdır.'],
 tissue: ['Doku yanıtı', 'Akciğer rengi göreli inflamasyon ve doku stresini gösterir; anatomik veya klinik ölçüm değildir.'],
 population: ['Toplum yayılımı', 'Şehirdeki renkli düğümler soyut nüfus paylarını gösterir; gerçek kişileri veya coğrafi veriyi temsil etmez.'],
 rna: ['Genetik materyal', 'İç sarmal, etkenin genetik materyalinin şematik görünümüdür; bir sekans analizi değildir.'],
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
function Cell({metrics,onSelect}){return <group>
 <mesh onClick={e=>{e.stopPropagation();onSelect('pathogen');}}><sphereGeometry args={[1.8,40,28]}/><meshPhysicalMaterial color="#58cde8" transparent opacity={.12} roughness={.35} metalness={.12} depthWrite={false}/></mesh>
 <mesh><sphereGeometry args={[1.82,20,14]}/><meshBasicMaterial color="#29adc9" wireframe transparent opacity={.16}/></mesh>
 <mesh scale={[.52,.58,.52]}><sphereGeometry args={[1,20,14]}/><meshStandardMaterial color="#5e61ba" roughness={.5}/></mesh>
 <Particles count={Math.round(metrics.infectedCells*.6)+2} radius={1.35} color="#ff648a" size={.08} onClick={()=>onSelect('pathogen')}/>
 <Particles count={Math.round((metrics.innateImmunity+metrics.adaptiveImmunity)*.15)+3} radius={2.05} color="#5ce5ff" size={.13} seed={2} onClick={()=>onSelect('immune')}/>
 <Marker position={[0,1.95,0]} color="#ff648a" onClick={()=>onSelect('pathogen')}/></group>;}
function Body({metrics,onSelect}){
 const tissueColor=new THREE.Color('#38bdd7').lerp(new THREE.Color('#fa6b85'),metrics.inflammation/100);
 return <group position={[0,-.1,0]}>
 <mesh position={[0,1.55,0]} scale={[.36,.43,.36]} geometry={sphere} dispose={null}><meshStandardMaterial color="#448ca5" transparent opacity={.35}/></mesh>
 <mesh position={[0,.15,0]} scale={[.82,1.02,.4]} geometry={sphere} dispose={null}><meshStandardMaterial color="#258eae" transparent opacity={.14} depthWrite={false}/></mesh>
 {[-1,1].map(side=><group key={side}><mesh position={[side*.9,.1,0]} rotation={[0,0,side*.17]} scale={[.18,.92,.18]} geometry={sphere} dispose={null}><meshStandardMaterial color="#258eae" transparent opacity={.23}/></mesh><mesh position={[side*.28,-1.25,0]} scale={[.24,.62,.23]} geometry={sphere} dispose={null}><meshStandardMaterial color="#258eae" transparent opacity={.23}/></mesh><mesh position={[side*.28,.46,.16]} scale={[.24,.46,.2]} geometry={sphere} dispose={null} onClick={e=>{e.stopPropagation();onSelect('tissue');}}><meshStandardMaterial color={tissueColor} emissive={tissueColor} emissiveIntensity={.25} roughness={.45}/></mesh></group>)}
 <Marker position={[.35,.5,.5]} onClick={()=>onSelect('tissue')}/></group>;
}
function Society({outbreak,onSelect}){
 const ref=useRef();const nodes=useRef();const dummy=useMemo(()=>new THREE.Object3D(),[]);const cyan=useMemo(()=>new THREE.Color('#56d8ee'),[]);const red=useMemo(()=>new THREE.Color('#ff648a'),[]);const data=useMemo(()=>Array.from({length:64},(_,i)=>({x:(i%8-3.5)*.49,z:(Math.floor(i/8)-3.5)*.49,h:.15+((i*17)%9)*.065})),[]);
 const share=(outbreak?.activeCases??0)/Math.max(1,outbreak?.population??10000);
 useFrame(()=>{if(!ref.current||!nodes.current)return;data.forEach((p,i)=>{dummy.position.set(p.x,p.h/2-.75,p.z);dummy.scale.set(.23,p.h,.23);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);dummy.position.set(p.x,p.h-.67,p.z);dummy.scale.setScalar(.055);dummy.updateMatrix();nodes.current.setMatrixAt(i,dummy.matrix);nodes.current.setColorAt(i,i<Math.round(Math.min(1,share)*64)?red:cyan);});ref.current.instanceMatrix.needsUpdate=true;nodes.current.instanceMatrix.needsUpdate=true;if(nodes.current.instanceColor)nodes.current.instanceColor.needsUpdate=true;});
 return <group rotation={[.18,0,0]}><gridHelper args={[4.4,9,'#287b91','#174957']} position={[0,-.75,0]}/><instancedMesh ref={ref} args={[box,undefined,64]} dispose={null}><meshStandardMaterial color="#276078" roughness={.4} metalness={.4}/></instancedMesh><instancedMesh ref={nodes} args={[sphere,undefined,64]} dispose={null} onClick={e=>{e.stopPropagation();onSelect('population');}}><meshStandardMaterial roughness={.3}/></instancedMesh><Marker position={[0,.65,0]} onClick={()=>onSelect('population')}/></group>;
}
export default function SimulationScene({state,mode='cell',outbreak}){
 const [selected,setSelected]=useState(null);const metrics=state?.metrics??{pathogenLoad:18,infectedCells:8,innateImmunity:12,adaptiveImmunity:0,inflammation:5};
 const titles={molecular:'Moleküler görünüm',cell:'Hücre görünümü',body:'Vücut görünümü',society:'Toplum görünümü'};
 return <div className="biomedicalScene"><div className="sceneCaption"><span>{titles[mode]}</span><small>Gün {state?.day??0} · Etkileşimli 3B</small></div><Canvas dpr={[1,1.4]} camera={{position:[0,1.2,6.6],fov:42}} gl={{antialias:true,alpha:true}}><ambientLight intensity={.7}/><directionalLight position={[3,5,4]} intensity={2}/><pointLight position={[-3,1,2]} color="#35cfff" intensity={12}/>{mode==='molecular'?<Molecular metrics={metrics} onSelect={setSelected}/>:mode==='body'?<Body metrics={metrics} onSelect={setSelected}/>:mode==='society'?<Society outbreak={outbreak} onSelect={setSelected}/>:<Cell metrics={metrics} onSelect={setSelected}/>}<OrbitControls enablePan={false} minDistance={4} maxDistance={10} enableDamping dampingFactor={.08}/></Canvas><div className="sceneGesture">Sürükle: döndür · Kaydır: yakınlaş · İşaretçiye tıkla: bilgi</div>{selected&&<div className="sceneExplanation" role="status"><button aria-label="Bilgiyi kapat" onClick={()=>setSelected(null)}>×</button><strong>{INFO[selected][0]}</strong><p>{INFO[selected][1]}</p></div>}<span className="sceneScale">Şematik eğitim modeli · Ölçekler temsilidir</span></div>;
}


