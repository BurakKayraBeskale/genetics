'use client';
import { Component, Suspense, memo, useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import AnatomyModel from './AnatomyModel';
import { getStructures, structureMatchesMesh } from '../../lib/anatomyHierarchy';

// Cached immutable geometry follows loader-cache lifetime. Source geometry is never mutated.
const referenceCache=new WeakMap();
const supplementCache=new WeakMap();
function referenceParts(scene){
 if(referenceCache.has(scene))return referenceCache.get(scene);
 scene.updateMatrixWorld(true);const entries=[];
 scene.traverse(node=>{if(node.isMesh){const geometry=node.geometry.clone().applyMatrix4(node.matrixWorld);geometry.computeBoundingBox();entries.push({name:node.name,organ:node.userData.organ||node.parent?.userData.organ,geometry,box:geometry.boundingBox});}});
 referenceCache.set(scene,entries);return entries;
}
function supplementGeometry(source){
 if(supplementCache.has(source))return supplementCache.get(source);
 const geometry=source.clone();geometry.rotateX(-Math.PI/2);geometry.computeVertexNormals();geometry.computeBoundingBox();supplementCache.set(source,geometry);return geometry;
}
function SmoothLayout({layout,reducedMotion,children}){
 const group=useRef();const initial=useRef(layout);
 const destination=useMemo(()=>new THREE.Vector3(...layout.offset),[layout]);
 useFrame((_,delta)=>{
  const object=group.current;if(!object)return;
  const alpha=reducedMotion?1:1-Math.exp(-Math.min(delta,.1)*7);
  object.position.lerp(destination,alpha);
  const scale=THREE.MathUtils.lerp(object.scale.x,layout.scale,alpha);
  object.scale.setScalar(Math.abs(scale-layout.scale)<.0001?layout.scale:scale);
  if(object.position.distanceToSquared(destination)<.00000001)object.position.copy(destination);
 });
 return <group ref={group} position={initial.current.offset} scale={initial.current.scale}>{children}</group>;
}
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
function LoadedReference({view,target,selectedStructure,affectedOrgans,severity,onSelect,onSelectStructure,reducedMotion,onStatus,organSeverities,meshSeverities}){
 const {scene}=useGLTF('/models/anatomy/anatomy.glb');
 const parts=useMemo(()=>referenceParts(scene),[scene]);
 const definition=getStructures(target).find(s=>s.id===selectedStructure);
 const isSchematic=view==='tissue'&&definition?.representation==='schematic';
 const matching=parts.filter(p=>matches(p.name,definition));
 const visible=useMemo(()=>parts.filter(p=>view==='body'||(matching.length?matches(p.name,definition):p.organ===target)),[parts,view,target,selectedStructure]);
 const layout=useMemo(()=>{const bounds=new THREE.Box3();visible.forEach(p=>bounds.union(p.box));const size=bounds.getSize(new THREE.Vector3());const center=bounds.getCenter(new THREE.Vector3());const scale=(view==='body'?5.5:2.6)/Math.max(view==='body'?size.y:Math.max(size.x,size.y,size.z),.001);return {scale,offset:center.multiplyScalar(-scale).toArray()};},[visible,view]);
 const activeMeshes=meshSeverities?Object.keys(meshSeverities).filter(name=>meshSeverities[name]>0).join(','):null;
 const mats=useMemo(()=>new Map(visible.map(p=>[p.name,makeHologram(meshSeverities?meshSeverities[p.name]>0:affectedOrgans.includes(p.organ),view==='body'&&p.organ==='skin',p.organ===target&&(!definition||matches(p.name,definition)),p.box)])),[visible,affectedOrgans.join(','),activeMeshes,view,target,selectedStructure]);
 useEffect(()=>()=>mats.forEach(m=>m.dispose()),[mats]);
 useEffect(()=>{onStatus?.(previous=>({...previous,error:false,loading:false,ready:true,count:parts.length,meshNames:parts.map(p=>p.name),schematic:isSchematic}));},[parts,isSchematic,onStatus]);
 useEffect(()=>{mats.forEach((m,name)=>{const organ=visible.find(p=>p.name===name)?.organ;const localSeverity=meshSeverities?.[name]??organSeverities?.[organ]??severity;m.userData.uniforms.uAnatomyStrength.value=localSeverity;m.emissiveIntensity=m.userData.affected?.2+localSeverity*.35:.08;if(reducedMotion)m.userData.uniforms.uAnatomyTime.value=0;});},[mats,severity,reducedMotion,organSeverities,meshSeverities]);
 useFrame(({clock})=>{if(!reducedMotion)mats.forEach(m=>{m.userData.uniforms.uAnatomyTime.value=clock.elapsedTime;});});
 if(isSchematic)return <AnatomyModel view="tissue" target={target} affectedOrgans={affectedOrgans} severity={severity} onSelect={onSelect} reducedMotion={reducedMotion}/>;
 if(!visible.length)return null;
 return <SmoothLayout layout={layout} reducedMotion={reducedMotion}>{visible.map(p=><mesh key={p.name} geometry={p.geometry} material={mats.get(p.name)} dispose={null} raycast={view==='body'&&p.organ==='skin'?()=>null:undefined} onClick={e=>{e.stopPropagation();onSelect?.(p.organ);const sub=getStructures(p.organ).find(s=>s.representation!=='schematic'&&matches(p.name,s));onSelectStructure?.(sub?.id||null);}}/>)}</SmoothLayout>;
}
class AssetBoundary extends Component{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.clearAsset?.();this.props.onStatus?.(previous=>({...previous,ready:false,loading:false,error:true}));}
 componentDidUpdate(previous){if(this.state.failed&&previous.retryKey!==this.props.retryKey)this.setState({failed:false});}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}
function Supplement({target,affectedOrgans,severity,reducedMotion,onStatus,organSeverities,meshSeverities}){
 const ids=target==='muscle'?['34682','34683','37686','37687']:['7148'];
 const originals=useLoader(STLLoader,ids.map(id=>'/models/anatomy/supplemental/FMA'+id+'.stl'));
 const parts=useMemo(()=>originals.map(supplementGeometry),[originals]);
 const layout=useMemo(()=>{const b=new THREE.Box3();parts.forEach(g=>b.union(g.boundingBox));const size=b.getSize(new THREE.Vector3());const scale=2.6/Math.max(size.x,size.y,size.z);return {scale,offset:b.getCenter(new THREE.Vector3()).multiplyScalar(-scale).toArray()};},[parts]);
 const supplementSeverity=meshSeverities?.[target==='muscle'?'BodyParts3D_muscle':'BodyParts3D_stomach']??organSeverities?.[target]??severity;
 const supplementAffected=meshSeverities?supplementSeverity>0:affectedOrgans.includes(target);
 const mat=useMemo(()=>{const bounds=new THREE.Box3();parts.forEach(g=>bounds.union(g.boundingBox));return makeHologram(supplementAffected,false,true,bounds);},[target,supplementAffected]);
 useEffect(()=>()=>mat.dispose(),[mat]);
 useEffect(()=>{onStatus?.(previous=>({...previous,error:false,loading:false,ready:true,schematic:false,supplementNames:[...new Set([...(previous?.supplementNames||[]),target==='muscle'?'skeletal_muscle':'stomach'])],supplement:true}));},[target,onStatus]);
 useEffect(()=>{const localSeverity=supplementSeverity;mat.userData.uniforms.uAnatomyStrength.value=localSeverity;mat.emissiveIntensity=mat.userData.affected?.2+localSeverity*.35:.08;if(reducedMotion)mat.userData.uniforms.uAnatomyTime.value=0;},[mat,supplementSeverity,reducedMotion]);
 useFrame(({clock})=>{if(!reducedMotion)mat.userData.uniforms.uAnatomyTime.value=clock.elapsedTime;});
 return <SmoothLayout layout={layout} reducedMotion={reducedMotion}>{parts.map((g,i)=><mesh key={i} geometry={g} material={mat} dispose={null}/>)}</SmoothLayout>;
}
function LoadingAnatomy(props){
 useEffect(()=>{props.onStatus?.(previous=>({...previous,ready:false,loading:true,error:false}));},[props.onStatus]);
 return <AnatomyModel {...props}/>;
}
function ReferenceAnatomy(props){const supplement=props.view!=='body'&&(props.target==='muscle'&&props.selectedStructure!=='muscle-fiber'||props.target==='digestive'&&props.selectedStructure==='stomach');const asset=supplement?'supplement-'+props.target:'reference';const boundaryKey=[asset,props.view,props.target,props.selectedStructure].join(':');const clearAsset=()=>{if(supplement){const ids=props.target==='muscle'?['34682','34683','37686','37687']:['7148'];useLoader.clear(STLLoader,ids.map(id=>'/models/anatomy/supplemental/FMA'+id+'.stl'));}else useGLTF.clear('/models/anatomy/anatomy.glb');};return <AssetBoundary key={asset} retryKey={boundaryKey} clearAsset={clearAsset} onStatus={props.onStatus} fallback={<AnatomyModel {...props}/>}><Suspense fallback={<LoadingAnatomy {...props}/>}>{supplement?<Supplement {...props}/>:<LoadedReference {...props}/>}</Suspense></AssetBoundary>;}
export default memo(ReferenceAnatomy);
