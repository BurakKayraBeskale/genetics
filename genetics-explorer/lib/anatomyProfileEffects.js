/** Local anatomical effect lookup. Microscopic targets highlight a declared macro
 * context only; this never claims that a merged mesh contains separable cells. */
import { getProfileOrganEffects } from './diseaseTrajectory.js';
import { getStructure, structureMatchesMesh } from './anatomyHierarchy.js';
const normalized=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const proxies={
 alveoli:name=>/left lung|right lung/.test(name),
 'intestinal-epithelium':name=>/colon|small intestine|duodenum/.test(name),
 neuron:name=>/cerebrum|cerebellum|brainstem/.test(name),
 nephron:name=>/kidney cortex|renal medulla/.test(name),
 'blood-cells':name=>/vessels/.test(name),
 epidermis:name=>/skin/.test(name),dermis:name=>/skin/.test(name),hypodermis:name=>/skin/.test(name),
 'muscle-fiber':name=>/muscle|fma34682|fma34683|fma37686|fma37687/.test(name),
};
function organOf(node){return node.organ||node.userData?.organ||node.extras?.organ;}
function sourceNames(node){return node.sourceStructures||node.userData?.sourceStructures||node.extras?.sourceStructures||[];}
function matchesTarget(node,effect,id){
 const organ=organOf(node);
 const pancreasCrossContext=effect.organ==='digestive'&&id==='digestive-pancreas'&&organ==='endocrine';
 if(organ!==effect.organ&&!pancreasCrossContext)return false;
 const structure=getStructure(effect.organ,id);
 // Missing/information-only targets never stand in for an unrelated whole organ.
 if(!structure||structure.representation==='information')return false;
 if(id==='all')return true;
 const name=normalized(node.name);
 if(structure.representation==='schematic')return !!proxies[id]?.(name);
 if(structureMatchesMesh(structure,node.name))return true;
 // Real embedded source structures may identify a macro-context mesh (e.g. aorta
 // inside HRA_vessels). They do not imply a separately selectable surface.
 return sourceNames(node).some(source=>structureMatchesMesh(structure,source));
}
export function getAnatomyProfileSeverities(profile,metrics,day,duration,manifestNodes=[]){
 const nodes=Array.isArray(manifestNodes)?manifestNodes:(manifestNodes.nodes||[]);
 const supplements=[{name:'BodyParts3D_stomach',organ:'digestive',sourceStructures:['stomach']},{name:'BodyParts3D_muscle',organ:'muscle',sourceStructures:['skeletal_muscle']}];
 const entries=[...nodes,...supplements.filter(part=>!nodes.some(n=>n.name===part.name))];
 const severities=Object.fromEntries(entries.map(node=>[node.name,0]));
 for(const effect of getProfileOrganEffects(profile,metrics,day,duration)){
  for(const node of entries){
   const matches=effect.structureIds.length?effect.structureIds.some(id=>matchesTarget(node,effect,id)):organOf(node)===effect.organ;
   if(matches)severities[node.name]=Math.max(severities[node.name],effect.severity);
  }
 }
 return severities;
}