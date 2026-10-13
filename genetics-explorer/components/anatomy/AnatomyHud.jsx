'use client';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ANATOMY_ANCHORS } from './AnatomyModel';
import manifest from '../../lib/anatomyAssetManifest.json';
const scale=5.5/(manifest.bounds.max[1]-manifest.bounds.min[1]);
const center=manifest.bounds.min.map((v,i)=>(v+manifest.bounds.max[i])/2);
const realAnchors={};
for(const organ of ['lungs','brain','renal','endocrine','digestive','blood','skin']){const nodes=manifest.nodes.filter(n=>n.organ===organ);if(nodes.length){const min=[0,1,2].map(i=>Math.min(...nodes.map(n=>n.bounds.min[i])));const max=[0,1,2].map(i=>Math.max(...nodes.map(n=>n.bounds.max[i])));realAnchors[organ]=min.map((v,i)=>((v+max[i])/2-center[i])*scale);}}


const ringGeometry = new THREE.TorusGeometry(1, .009, 5, 96);
const accent = '#51d5ee';
function ScanRings({ reducedMotion, fullBody }) {
 const scan = useRef();
 useFrame(({ clock }) => {
  if (scan.current) scan.current.position.y = reducedMotion ? -.5 : Math.sin(clock.elapsedTime * .45) * (fullBody ? 2.35 : .8);
 });
 const floor = fullBody ? -2.78 : -1.6;
 return <group>
  {[1.25,1.48,1.7].map((radius,index)=><mesh key={radius} geometry={ringGeometry} dispose={null} scale={radius} position={[0,floor-index*.015,0]} rotation={[Math.PI/2,0,0]}>
   <meshBasicMaterial color={accent} transparent opacity={.23-index*.05} depthWrite={false}/>
  </mesh>)}
  <mesh ref={scan} geometry={ringGeometry} dispose={null} rotation={[Math.PI/2,0,0]} scale={[1.38, .64, 1]}>
   <meshBasicMaterial color={accent} transparent opacity={.1} depthWrite={false}/>
  </mesh>
 </group>;
}
function AnatomyHud({target,view,affected,reducedMotion,labelRef}) {
 const anchor = view==='body' ? (realAnchors[target] || ANATOMY_ANCHORS[target] || [0,1,0]) : [0,.22,0];
 const start = [anchor[0],anchor[1],anchor[2]+.38];
 const end = [view==='body'?1.25:1.55,anchor[1]+.22,.38];
 const points = useMemo(()=>new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...start),new THREE.Vector3(.95,start[1],.38),new THREE.Vector3(...end)]),[target,view]);
 // Own this small connector; pooled rings are retained between scene changes.
 useEffect(()=>()=>points.dispose(),[points]);
 const { camera, size } = useThree();
 const projected=useMemo(()=>new THREE.Vector3(),[]);
 useFrame(()=>{
  if(!labelRef?.current)return;
  projected.set(...end).project(camera);
  const x=(projected.x*.5+.5)*size.width, y=(-projected.y*.5+.5)*size.height;
  labelRef.current.style.transform='translate('+Math.round(x+6)+'px,'+Math.round(y-20)+'px)';
  labelRef.current.style.opacity=projected.z<1&&x<size.width-80&&x>0&&y>90&&y<size.height-80?'1':'0';
 });
 return <group>
  <ScanRings fullBody={view==='body'} reducedMotion={reducedMotion}/>
  <line geometry={points} dispose={null}><lineBasicMaterial color={affected?'#f08083':accent} transparent opacity={.55}/></line>
  <mesh position={start}><sphereGeometry args={[.035,8,6]}/><meshBasicMaterial color={affected?'#f08083':accent}/></mesh>
 </group>;
}
export default memo(AnatomyHud);
