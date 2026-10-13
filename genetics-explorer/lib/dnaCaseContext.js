import { enrichDNARelation } from '../data/dnaRelations.js';
export function getDNACaseContext(state,{hiddenProfile=false}={}) {
 if(!state?.scenarioConfig)return null;
 const p=state.scenarioConfig;const relation=enrichDNARelation(p,p.dnaRelation);
 if(hiddenProfile)return {name:'Gizemli vaka',day:state.day,diseaseScenarioId:null,relation:{type:'NONE',humanGenomeAffected:null,pathogenGenomeType:null,answer:'GİZLİ VAKA',qualification:'Genetik bağlam öğretmen görünümünde açılır.',explanation:'Yalnız gözlemlerden hipotez kurun; profil, gen/protein adı ve kaynaklar gizlenmiştir.',sources:[],pathway:[],organTarget:null,cellSummary:'Günlük hücresel gözlemler.'},molecularPathway:[],organTarget:null,cellSummary:'Günlük hücresel gözlemler.',genomeAnswer:'GİZLİ VAKA',genomeQualification:'Genetik bağlam öğretmen görünümünde açılır.',presetId:null,sources:[]};
 return {name:p.name || 'Aktif vaka',day:state.day,diseaseScenarioId:state.diseaseScenarioId || p.id,relation,molecularPathway:relation.pathway || [],organTarget:relation.organTarget,cellSummary:relation.cellSummary,genomeAnswer:relation.answer,genomeQualification:relation.qualification,presetId:relation.type==='DIRECT_GENETIC'?relation.presetId || relation.educationalVariant?.presetId || null:null,sources:relation.sources};
}
export const getCaseDNARelation=(profile)=>enrichDNARelation(profile,profile?.dnaRelation);
