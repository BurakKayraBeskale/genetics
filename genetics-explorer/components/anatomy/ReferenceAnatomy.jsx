'use client';
import { Component, Suspense, memo, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import AnatomyModel from './AnatomyModel';
import { getStructures, structureMatchesMesh } from '../../lib/anatomyHierarchy';

function matches(name,structure){return structureMatchesMesh(structure,name);}
function makeHologram(affected,surface,selected,box){
 const color=affected?(selected?'#bb6872':'#9e5864'):selected?'#62cfe4':'#269bb9';
 const mat=new THREE.MeshPhysicalMaterial({color,emissive:color,emissiveIntensity:affected?.28:.08,metalness:.22,roughness:.4,clearcoat:.65,clearcoatRoughness:.3,transparent:surface,opacity:surface?.12:1,depthWrite:!surface,side:THREE.DoubleSide});
 mat.userData.affected=affected;
 mat.userData.uniforms={uAnatomyTime:{value:0},uAnatomyStrength:{value:0},uAnatomyFocus:{value:box?.getCenter(new THREE.Vector3())||new THREE.Vector3()},uAnatomySize:{value:box?.getSize(new THREE.Vector3()).multiplyScalar(.6).max(new THREE.Vector3(.001,.001,.001))||new THREE.Vector3(1,1,1)}};
 mat.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,mat.userData.uniforms);
  shader.vertexShader=['varying vec3 vAnatomyLocal;',shader.vertexShader].join(String.fromCharCode(10)).replace('#include <begin_vertex>','#include <begin_vertex>'+String.fromCharCode(10)+'vAnatomyLocal=position;');
  shader.fragmentShader=['uniform float uAnatomyTime; uniform float uAnatomyStrength; uniform vec3 uAnatomyFocus; uniform vec3 uAnatomySize; varying vec3 vAnatomyLocal;',shader.fragmentShader].join(String.fromCharCode(10));
  shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',
   'float heat=exp(-dot((vAnatomyLocal-uAnatomyFocus)/uAnatomySize,(vAnatomyLocal-uAnatomyFocus)/uAnatomySize)*2.0); float rim=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.8); float pulse=1.0+sin(uAnatomyTime*2.0)*0.12; '+(affected?'gl_FragColor.rgb=mix(gl_FragColor.rgb,mix(vec3(0.9,0.13,0.12),vec3(1.0,0.35,0.08),uAnatomyStrength),heat*(0.48+uAnatomyStrength*0.40));':'')+'gl_FragColor.rgb += vec3('+ (affected?'1.0,0.20,0.10':'0.10,0.65,0.9') +')*rim*(0.12+uAnatomyStrength*0.24)*pulse; \n#include <dithering_fragment>');
 };
 mat.customProgramCacheKey=()=>affected?'anatomy-red':'anatomy-cyan';return mat;
}
function LoadedReference({view,target,selectedStructure,affectedOrgans,severity,onSelect,onSelectStructure,reducedMotion,onStatus}){
 const {scene}=useGLTF('/models/anatomy/anatomy.glb');
 const parts=useMemo(()=>{scene.updateMatrixWorld(true);const entries=[];scene.traverse(node=>{if(node.isMesh){const geometry=node.geometry.clone().applyMatrix4(node.matrixWorld);geometry.computeBoundingBox();entries.push({name:node.name,organ:node.userData.organ||node.parent?.userData.organ,geometry,box:geometry.boundingBox});}});return entries;},[scene]);
 useEffect(()=>()=>parts.forEach(p=>p.geometry.dispose()),[parts]);
 const definition=getStructures(target).find(s=>s.id===selectedStructure);
 const isSchematic=view==='tissue'&&definition?.representation==='schematic';
 const matching=parts.filter(p=>matches(p.name,definition));
 const visible=useMemo(()=>parts.filter(p=>view==='body'||(matching.length?matches(p.name,definition):p.organ===target)),[parts,view,target,selectedStructure]);
 const layout=useMemo(()=>{const bounds=new THREE.Box3();visible.forEach(p=>bounds.union(p.box));const size=bounds.getSize(new THREE.Vector3());const center=bounds.getCenter(new THREE.Vector3());const scale=(view==='body'?5.5:2.6)/Math.max(view==='body'?size.y:Math.max(size.x,size.y,size.z),.001);return {scale,offset:center.multiplyScalar(-scale).toArray()};},[visible,view]);
 const mats=useMemo(()=>new Map(parts.map(p=>[p.name,makeHologram(affectedOrgans.includes(p.organ),view==='body'&&p.organ==='skin',p.organ===target&&(!definition||matches(p.name,definition)),p.box)])),[parts,affectedOrgans.join(','),view,target,selectedStructure]);
 useEffect(()=>()=>mats.forEach(m=>m.dispose()),[mats]);
 useEffect(()=>{onStatus?.(previous=>({...previous,ready:true,count:parts.length,meshNames:parts.map(p=>p.name),schematic:isSchematic}));},[parts,isSchematic,onStatus]);
 useFrame(({clock})=>mats.forEach(m=>{m.userData.uniforms.uAnatomyTime.value=reducedMotion?0:clock.elapsedTime;m.userData.uniforms.uAnatomyStrength.value=severity;m.emissiveIntensity=m.userData.affected? .2+severity*.35:.08;}));
 if(isSchematic)return <AnatomyModel view="tissue" target={target} affectedOrgans={affectedOrgans} severity={severity} onSelect={onSelect} reducedMotion={reducedMotion}/>;
 if(!visible.length)return null;
 return <group position={layout.offset} scale={layout.scale}>{visible.map(p=><mesh key={p.name} geometry={p.geometry} material={mats.get(p.name)} dispose={null} raycast={view==='body'&&p.organ==='skin'?()=>null:undefined} onClick={e=>{e.stopPropagation();onSelect?.(p.organ);const sub=getStructures(p.organ).find(s=>s.representation!=='schematic'&&matches(p.name,s));onSelectStructure?.(sub?.id||null);}}/>)}</group>;
}
class AssetBoundary extends Component{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.onStatus?.({ready:false,error:true});}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}
function Supplement({target,affectedOrgans,severity,reducedMotion,onStatus}){
 const ids=target==='muscle'?['34682','34683','37686','37687']:['7148'];
 const originals=useLoader(STLLoader,ids.map(id=>'/models/anatomy/supplemental/FMA'+id+'.stl'));
 const parts=useMemo(()=>originals.map(g=>{const copy=g.clone();copy.rotateX(-Math.PI/2);copy.computeVertexNormals();copy.computeBoundingBox();return copy;}),[originals]);
 const layout=useMemo(()=>{const b=new THREE.Box3();parts.forEach(g=>b.union(g.boundingBox));const size=b.getSize(new THREE.Vector3());const scale=2.6/Math.max(size.x,size.y,size.z);return {scale,offset:b.getCenter(new THREE.Vector3()).multiplyScalar(-scale).toArray()};},[parts]);
 const mat=useMemo(()=>{const bounds=new THREE.Box3();parts.forEach(g=>bounds.union(g.boundingBox));return makeHologram(affectedOrgans.includes(target),false,true,bounds);},[target,affectedOrgans.join(',')]);
 useEffect(()=>()=>parts.forEach(g=>g.dispose()),[parts]);
 useEffect(()=>()=>mat.dispose(),[mat]);
 useEffect(()=>{onStatus?.(previous=>({...previous,supplementNames:[...(previous?.supplementNames||[]),target==='muscle'?'skeletal_muscle':'stomach'],supplement:true}));},[target,onStatus]);
 useFrame(({clock})=>{mat.userData.uniforms.uAnatomyTime.value=reducedMotion?0:clock.elapsedTime;mat.userData.uniforms.uAnatomyStrength.value=severity;});
 return <group scale={layout.scale} position={layout.offset}>{parts.map((g,i)=><mesh key={i} geometry={g} material={mat} dispose={null}/>)}</group>;
}
function ReferenceAnatomy(props){const supplement=props.view!=='body'&&(props.target==='muscle'&&props.selectedStructure!=='muscle-fiber'||props.target==='digestive'&&props.selectedStructure==='stomach');return <AssetBoundary onStatus={props.onStatus} fallback={<AnatomyModel {...props}/>}><Suspense fallback={null}>{supplement?<Supplement {...props}/>:<LoadedReference {...props}/>}</Suspense></AssetBoundary>;}
export default memo(ReferenceAnatomy);
