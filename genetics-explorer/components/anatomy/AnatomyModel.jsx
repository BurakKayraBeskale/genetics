'use client';

import { memo, createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shared low-cost geometry/material palette. Procedural anatomy is illustrative,
// not a clinical anatomical atlas. All curves are continuous and smooth.
const sphere = new THREE.SphereGeometry(1, 24, 16);
const box = new THREE.BoxGeometry(1, 1, 1);
const ring = new THREE.TorusGeometry(1, .16, 8, 24);
const kidneyGeometry = sphere.clone();
const kidneyVertices = kidneyGeometry.attributes.position;
for(let i=0;i<kidneyVertices.count;i++) {
 const x=kidneyVertices.getX(i),y=kidneyVertices.getY(i),z=kidneyVertices.getZ(i);
 const hilum=Math.exp(-y*y*9)*Math.max(0,-x)*.62;
 kidneyVertices.setXYZ(i,x+hilum,y,z*(.94+.06*Math.abs(y)));
}
kidneyGeometry.computeVertexNormals();
const palette = {};
const AnatomyTint = createContext(null);
function material(color, ghost = false, intensity = .08) {
 const key = color + ghost + intensity;
 if (!palette[key]) palette[key] = new THREE.MeshStandardMaterial({color, roughness: .32, metalness: .22, emissive: color, emissiveIntensity: ghost ? .16 : intensity, transparent: ghost, opacity: ghost ? .17 : 1, depthWrite: !ghost});
 return palette[key];
}
function useAnatomyMaterial(color, ghost) {
 const tint=useContext(AnatomyTint);
 return useMemo(()=>{
  if(!tint)return material(color,ghost);
  const luminance=new THREE.Color(color).getHSL({h:0,s:0,l:0}).l;
  const shaded=new THREE.Color(tint.affected ? '#fa746b' : '#42bed9');
  shaded.lerp(new THREE.Color(tint.affected ? '#ffb171' : '#b1effa'),Math.max(0,luminance-.24)*.4);
  if(tint.affected) shaded.lerp(new THREE.Color('#ff8e50'),tint.severity*.6);
  return material(shaded.getStyle(),ghost,.1+(tint.affected?tint.severity*.28:0));
 },[color,ghost,tint]);
}
export const ANATOMY_ANCHORS = { lungs: [0,1.2,.16], digestive:[0,.34,.22], brain:[0,2.38,.04], muscle:[-.28,-.72,.12], renal:[0,.46,-.04], endocrine:[0,.64,.22], skin:[.6,.82,.27], blood:[0,1.17,.33] };
const POS = ANATOMY_ANCHORS;
const COLORS = {lungs:'#73bdd0',digestive:'#d4ac92',brain:'#bcaed9',muscle:'#bf8eaa',renal:'#b38fa9',endocrine:'#d0bd88',skin:'#caa690',blood:'#bfa6be'};
const keys = Object.keys(POS);
function Part({ p=[0,0,0], s=1, r=[0,0,0], color, ghost=false, geometry=sphere }) {
 return <mesh geometry={geometry} material={useAnatomyMaterial(color,ghost)} position={p} scale={s} rotation={r} dispose={null}/>;
}
function Tube({points, radius=.045, color, ghost=false}) {
 const geometry=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*6),radius,7,false),[points,radius]);
 // Own tube geometry only; shared primitives and materials remain cached.
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} material={useAnatomyMaterial(color,ghost)} dispose={null}/>;
}
function Taper({profile,position,scale,rotation,color,ghost=false}) {
 const geometry=useMemo(()=>new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),24),[profile]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} material={useAnatomyMaterial(color,ghost)} position={position} scale={scale} rotation={rotation} dispose={null}/>;
}
const torsoProfile=[[0,0],[.29,.02],[.43,.16],[.38,.39],[.35,.65],[.43,.88],[.59,1.18],[.61,1.39],[.47,1.52],[.2,1.6],[0,1.62]];
const headProfile=[[0,0],[.15,.035],[.22,.1],[.27,.23],[.31,.4],[.32,.57],[.27,.71],[.16,.8],[0,.84]];
const limbProfile=[[0,-.5],[.09,-.49],[.12,-.35],[.15,0],[.17,.27],[.12,.48],[0,.5]];
function HumanShell() {
 const c='#45ccec', bone='#82cfda';
 return <group>
 <Taper profile={torsoProfile} position={[0,-.08,0]} scale={[1,1,.5]} color={c} ghost/>
 <Taper profile={headProfile} position={[0,1.93,0]} scale={[1,1,.85]} color={c} ghost/>
 <Part p={[0,2.31,.245]} s={[.068,.1,.073]} color={c} ghost/>
 <Part p={[0,2.02,.075]} s={[.21,.1,.17]} color={c} ghost/>
 {[-1,1].map(side=><Part key={side} p={[side*.31,2.31,0]} s={[.052,.105,.065]} color={c} ghost/>)}
 <Part p={[0,1.83,0]} s={[.16,.22,.16]} color={c} ghost/>
 <Part p={[0,-.03,0]} s={[.48,.32,.29]} color={c} ghost/>
 {[-1,1].map(side=><group key={side}>
 <Part p={[side*.6,1.43,0]} s={[.22,.23,.23]} color={c} ghost/>
 <Taper profile={limbProfile} position={[side*.83,1,0]} scale={[1,.84,1]} rotation={[0,0,side*.25]} color={c} ghost/>
 <Part p={[side*.96,.53,0]} s={[.135,.14,.13]} color={c} ghost/>
 <Taper profile={limbProfile} position={[side*1.04,.14,0]} scale={[.78,.75,.78]} rotation={[0,0,side*.15]} color={c} ghost/>
 <Part p={[side*1.13,-.36,.03]} s={[.13,.21,.07]} color={c} ghost/>
 {[0,1,2,3].map(i=><Part key={i} p={[side*(1.06+i*.045),-.57,.03]} s={[.025,.13-i*.012,.027]} color={c} ghost/>)}
 <Taper profile={limbProfile} position={[side*.27,-.76,0]} scale={[1.48,1.22,1.45]} color={c} ghost/>
 <Part p={[side*.28,-1.43,0]} s={[.16,.16,.16]} color={c} ghost/>
 <Taper profile={limbProfile} position={[side*.29,-1.99,0]} scale={[1,1.05,1]} color={c} ghost/>
 <Part p={[side*.29,-2.61,.14]} s={[.17,.12,.31]} color={c} ghost/>
 <Tube points={[[side*.18,-.17,-.07],[side*.25,-.77,-.04],[side*.28,-1.34,-.025]]} radius={.042} color={bone} ghost/>
 <Tube points={[[side*.28,-1.5,-.02],[side*.3,-2.05,-.025],[side*.29,-2.52,0]]} radius={.029} color={bone} ghost/>
 <Tube points={[[side*.62,1.44,0],[side*.81,1.05,0],[side*.95,.55,0]]} radius={.029} color={bone} ghost/>
 <Tube points={[[side*.97,.45,0],[side*1.05,.05,0],[side*1.12,-.31,0]]} radius={.018} color={bone} ghost/>
 <Tube points={[[0,.16,-.03],[side*.35,.05,-.06],[side*.32,-.23,-.06],[side*.15,-.26,-.03]]} radius={.035} color={bone} ghost/>
 <Tube points={[[side*.08,1.57,.06],[side*.3,1.58,.07],[side*.53,1.5,.06]]} radius={.024} color={bone}/>
 {[0,1,2,3,4].map(i=><Tube key={i} points={[[0,1.43-i*.13,-.05],[side*.36,1.45-i*.13,.08],[side*.5,1.27-i*.11,.04],[side*.24,1.17-i*.1,.14]]} radius={.013} color={bone} ghost/>)}
 </group>)}
 <Tube points={[[0,1.78,-.2],[0,1.1,-.22],[0,.45,-.21],[0,-.16,-.1]]} radius={.045} color={bone}/>
 </group>;
}
function Lungs({color}) {
 return <group>
 {[-1,1].map(side=><group key={side}>
 <Part p={[side*.53,0,0]} s={[.43,.78,.32]} r={[0,0,side*-.14]} color={color}/>
 <Part p={[side*.59,-.38,.04]} s={[.38,.4,.31]} color={color}/>
 <Tube points={[[side*.17,.13,.32],[side*.5,-.12,.33],[side*.83,-.19,.16]]} radius={.018} color='#cedfea'/>
 {[0,1,2,3,4].map(i=><Tube key={i} points={[[0,.55,.29],[side*.24,.24,.3],[side*(.38+i*.08),.32-i*.24,.31],[side*(.47+i*.08),.38-i*.25,.24]]} radius={.031-i*.003} color='#bce7e8'/>)}
 </group>)}
 <Tube points={[[0,1.15,.13],[0,.65,.17],[0,.34,.22]]} radius={.095} color='#b6d3d9'/>
 {[0,1,2,3,4].map(i=><Part key={i} p={[0,1.03-i*.13,.13]} s={[.1,.025,.1]} color='#dfedf0'/>)}
 </group>;
}
function Digestive({color}) {
 const coils=Array.from({length:44},(_,i)=>{const t=i/43;return [Math.sin(t*Math.PI*10)*.42,-.25-t*.68,.11+Math.cos(t*Math.PI*10)*.08];});
 return <group>
 <Tube points={[[-.06,1.08,0],[-.08,.62,0],[.28,.33,.02],[.39,.05,.04],[.26,-.16,.05],[.03,-.13,.06],[-.13,.13,.04]]} radius={.19} color={color}/>
 <Tube points={[[-.13,.13,.04],[-.28,-.08,.04],[-.12,-.29,.05],[.24,-.23,.1]]} radius={.085} color='#dab793'/>
 <Tube points={coils} radius={.063} color='#bda59c'/>
 <Tube points={[[-.5,-1.04,-.04],[-.63,-.68,0],[-.63,-.2,-.03],[-.48,-.1,-.04],[.39,-.11,-.04],[.63,-.28,-.04],[.61,-.82,-.02],[.28,-1.04,0],[0,-1.23,0]]} radius={.11} color='#a5839e'/>
 <Part p={[-.45,.48,-.12]} s={[.49,.24,.2]} r={[0,0,-.2]} color='#a68b85'/>
 </group>;
}
function Brain({color}) {
 return <group>
 {[-1,1].map(side=><group key={side}>
 <Part p={[side*.4,.12,0]} s={[.43,.66,.53]} color={color}/>
 {Array.from({length:12},(_,j)=><Tube key={j} points={Array.from({length:12},(_,i)=>{const t=i/11*Math.PI;return [side*(.11+Math.sin(t)*.63),.64-j*.10+Math.sin(t*6+j)*.045,.37*Math.cos(t*.75)+.1];})} radius={.045} color='#d7c7e7'/>)}
 <Part p={[side*.26,-.58,-.24]} s={[.28,.23,.3]} color='#aabbd3'/>
 </group>)}
 <Tube points={[[0,-.37,-.1],[0,-.73,-.2],[0,-1.04,-.17]]} radius={.12} color='#9cabc4'/>
 </group>;
}
function Muscle({color}) {
 return <group rotation={[0,0,-.18]}>
 <Part s={[.43,1,.3]} color={color}/>
 {Array.from({length:15},(_,i)=><Tube key={i} points={[[Math.sin(i*2.4)*.15,.93,.12],[Math.sin(i*2.4)*.39,0,.18+Math.cos(i*2.4)*.12],[Math.sin(i*2.4)*.12,-.93,.12]]} radius={.026} color='#e1b1b5'/>)}
 {[-1,1].map(s=><Tube key={s} points={[[0,s*.83,0],[0,s*1.13,0],[.05,s*1.34,0]]} radius={.075} color='#d7dfe0'/>)}
 </group>;
}
function Kidneys({color}) {
 return <group>{[-1,1].map(side=><group key={side} position={[side*.56,.15,0]} rotation={[0,0,side*.15]}>
 <Part geometry={kidneyGeometry} p={[side*.1,0,0]} s={[side*.37,.64,.27]} color={color}/>
 <Tube points={[[side*.09,.29,.24],[-side*.06,.13,.27],[-side*.05,-.14,.27],[side*.08,-.32,.21]]} radius={.035} color='#e4c896'/>
 <Tube points={[[0,.18,.06],[-side*.17,.02,.1],[-side*.1,-.28,.09],[-side*.05,-.98,.1]]} radius={.045} color='#e4c896'/>
 <Tube points={[[side*.07,.13,.15],[-side*.18,.11,.17],[-side*.34,.12,.15]]} radius={.035} color='#de7f8d'/>
 </group>)}</group>;
}
function Endocrine({color}) {
 return <group>
 {[-1,1].map(s=><group key={s}><Part p={[s*.24,.68,0]} s={[.2,.32,.17]} r={[0,0,-s*.2]} color={color}/><Part p={[s*.65,-.4,0]} s={[.22,.13,.16]} r={[0,0,s*.3]} color='#d1b983'/></group>)}
 <Part p={[0,.7,0]} s={[.13,.1,.1]} color={color}/>
 <Tube points={[[-.8,-.75,0],[-.35,-.62,.04],[.15,-.65,.04],[.65,-.81,0]]} radius={.13} color='#c8af86'/>
 </group>;
}
function Skin({color}) {
 return <group rotation={[-.24,.2,0]}>
 {['#e0c1ac',color,'#bba276'].map((c,i)=><Part key={c} geometry={box} p={[0,.36-i*.24,0]} s={[1.6,.23,1.03]} color={c}/>)}
 {[0,1,2,3,4].map(i=><Tube key={i} points={[[i*.27-.55,-.09,.1],[i*.27-.5,.35,.12],[i*.27-.6,.77,.1]]} radius={.024} color='#8d8794'/>)}
 <Tube points={[[-.75,0,.53],[-.32,.13,.53],[.05,-.01,.53],[.68,.05,.53]]} radius={.035} color='#d68195'/>
 </group>;
}
function Heart({color}) {
 return <group rotation={[0,0,-.18]}>
 <Part p={[-.18,.04,0]} s={[.36,.51,.3]} color={color}/><Part p={[.2,-.06,0]} s={[.32,.46,.28]} color={color}/>
 <Tube points={[[.07,.25,0],[.05,.71,0],[-.27,.8,0],[-.42,.53,.03]]} radius={.11} color='#d88d9f'/>
 <Tube points={[[.25,.2,.05],[.31,.52,.02],[.59,.69,0]]} radius={.08} color='#81a8c4'/>
 {[-1,1].map(s=><Tube key={s} points={[[s*.08,.36,.31],[s*.27,.03,.32],[s*.12,-.35,.18]]} radius={.019} color='#ecc6ba'/>)}
 </group>;
}
function Circulation({affected,severity,onSelect}) {
 const tint=useMemo(()=>({affected,severity:Math.round(Math.max(0,Math.min(1,severity))*10)/10}),[affected,severity]);
 return <AnatomyTint.Provider value={tint}><group onClick={e=>{e.stopPropagation();onSelect?.('blood');}}>
 <Tube points={[[.035,1.29,.08],[.015,.82,.1],[.015,.24,.11],[0,-.15,.07]]} radius={.027} color='#82c9e7'/>
 {[-1,1].map(side=><group key={side}>
 <Tube points={[[.025,1.32,.06],[side*.18,1.64,.03],[side*.13,2.11,.06]]} radius={.019} color='#a8e4e9'/>
 <Tube points={[[.02,1.29,.06],[side*.49,1.39,.05],[side*.79,1.01,.08],[side*1.01,.49,.08],[side*1.12,-.35,.06]]} radius={.018} color='#aadce4'/>
 <Tube points={[[0,-.12,.07],[side*.21,-.56,.05],[side*.28,-1.36,.06],[side*.29,-2.09,.06],[side*.29,-2.54,.11]]} radius={.021} color='#b2dee9'/>
 <Tube points={[[side*.07,.17,-.09],[side*.3,-.63,-.08],[side*.34,-1.39,-.05],[side*.35,-2.13,-.03]]} radius={.012} color='#75b4d7'/>
 <Tube points={[[0,.76,.12],[side*.32,.85,.12],[side*.41,1.18,.12]]} radius={.014} color='#8bbbd5'/>
 </group>)}
 </group></AnatomyTint.Provider>;
}
const Assemblies={lungs:Lungs,digestive:Digestive,brain:Brain,muscle:Muscle,renal:Kidneys,endocrine:Endocrine,skin:Skin,blood:Heart};
function Tissue({target,color}) {
 if(target==='skin') return <Skin color={color}/>;
 if(target==='brain') return <group>{[-1,0,1].map((n)=><group key={n} position={[n*.65,n*.16,0]}><Part s={[.14,.13,.11]} color={color}/>{Array.from({length:5},(_,i)=><Tube key={i} points={[[0,0,0],[Math.cos(i*1.26)*.3,Math.sin(i*1.26)*.3,0],[Math.cos(i*1.26+.2)*.52,Math.sin(i*1.26+.2)*.52,.03]]} radius={.023} color='#b1cfdf'/>)}<Tube points={[[0,0,0],[.15,-.45,0],[.53,-.78,.05]]} radius={.04} color='#c2b5df'/></group>)}</group>;
 if(target==='muscle') return <group>{Array.from({length:9},(_,i)=><group key={i} position={[(i%3-.9)*.26,0,Math.floor(i/3)*.23]}><Tube points={[[0,-1,0],[.035,0,0],[0,1,0]]} radius={.105} color={color}/>{Array.from({length:11},(_,j)=><Part key={j} geometry={ring} p={[0,j*.17-.85,0]} r={[Math.PI/2,0,0]} s={[.105,.105,.045]} color='#dbc3c5'/>)}</group>)}</group>;
 if(target==='renal') return <group><Part p={[-.53,.55,0]} s={.33} color={color}/>{Array.from({length:9},(_,i)=><Tube key={i} points={[[ -.53,.55,0],[-.53+Math.cos(i)*.25,.55+Math.sin(i)*.25,.18],[-.48,.6,.25]]} radius={.025} color='#dc9baa'/>)}<Tube points={[[-.28,.55,0],[.16,.5,0],[.15,-.75,0],[.45,-.86,0],[.56,.51,0],[.89,.45,0],[.78,-.8,0]]} radius={.065} color='#d8c591'/></group>;
 if(target==='digestive') return <group><Part geometry={box} p={[0,-.52,0]} s={[1.8,.22,.8]} color={color}/>{Array.from({length:11},(_,i)=><Part key={i} p={[i*.15-.75,-.14+Math.sin(i*.8)*.05,0]} s={[.065,.3,.13]} color='#d8bbaa'/>)}<Tube points={[[-.8,-.43,.36],[0,-.45,.36],[.8,-.44,.36]]} radius={.035} color='#de899e'/></group>;
 if(target==='endocrine') return <group>{Array.from({length:16},(_,i)=><Part key={i} p={[Math.cos(i*2.4)*(.28+i*.021),Math.sin(i*2.4)*(.28+i*.021),Math.sin(i)*.12]} s={.15} color={color}/>)}<Tube points={[[-.7,-.5,.1],[0,-.3,.2],[.3,.1,.2],[.7,.6,.1]]} radius={.04} color='#84c5d4'/></group>;
 if(target==='blood') return <group>{Array.from({length:14},(_,i)=><Part key={i} geometry={ring} p={[Math.sin(i*2.4)*.85,Math.cos(i*2.4)*.8,Math.sin(i*.7)*.3]} s={.13} r={[i*.3,i*.2,0]} color={color}/>)}<Part p={[.28,.22,.3]} s={.23} color='#c5c4e2'/><Part p={[.28,.22,.45]} s={.1} color='#9087b0'/></group>;
 return <group><Tube points={[[0,.92,-.06],[0,.38,0],[-.36,.13,0]]} radius={.1} color='#b6d7dd'/>{[-1,1].map(side=><group key={side}><Tube points={[[0,.35,0],[side*.35,.11,0],[side*.51,-.25,0]]} radius={.065} color='#aacbd8'/>{Array.from({length:7},(_,i)=><Part key={i} p={[side*(.34+Math.sin(i*2.4)*.25),-.36+Math.cos(i*2.4)*.27,Math.sin(i)*.17]} s={.17} color={color}/>)}</group>)}</group>;
}
function Organ({kind,affected,severity,onSelect,reducedMotion,context=false}) {
 const ref=useRef(); const Component=Assemblies[kind];
 const tint=useMemo(()=>({affected,severity:Math.round(Math.max(0,Math.min(1,severity))*10)/10}),[affected,severity]);
 useFrame(({clock})=>{if(ref.current){const pulse=affected&&!reducedMotion?1+Math.sin(clock.elapsedTime*1.8)*.006*(.25+severity*.75):1;ref.current.scale.setScalar(pulse);}});
 const color=affected?new THREE.Color('#f0787d').lerp(new THREE.Color('#ef543c'),Math.round(Math.max(0,Math.min(1,severity))*10)/10).getStyle():context?'#7795a6':COLORS[kind];
 return <group ref={ref} onClick={e=>{e.stopPropagation();onSelect?.(kind);}}><AnatomyTint.Provider value={tint}><Component color={color}/></AnatomyTint.Provider></group>;
}
export default memo(function AnatomyModel({view='body',target='lungs',affectedOrgans=[],severity=0,onSelect,reducedMotion=false}) {
 const chosen=keys.includes(target)?target:'lungs'; const isAffected=k=>affectedOrgans.includes(k);
 if(view==='tissue')return <AnatomyTint.Provider value={{affected:isAffected(chosen),severity:Math.round(Math.max(0,Math.min(1,severity))*10)/10}}><Tissue target={chosen} color={isAffected(chosen)?'#f0787d':COLORS[chosen]}/></AnatomyTint.Provider>;
 if(view==='organ')return <group scale={1.1}><Organ kind={chosen} affected={isAffected(chosen)} severity={severity} onSelect={onSelect} reducedMotion={reducedMotion}/></group>;
 return <group><HumanShell/><Circulation affected={isAffected("blood")} severity={severity} onSelect={onSelect}/>{keys.map(kind=><group key={kind} position={POS[kind]} scale={kind==='brain'?.36:kind==='lungs'?.58:kind==='digestive'?.47:kind==='blood'?.33:kind==='muscle'?.43:kind==='skin'?.15:.35}><Organ kind={kind} affected={isAffected(kind)} severity={severity} onSelect={onSelect} reducedMotion={reducedMotion} context={kind!==chosen}/></group>)}</group>;
});