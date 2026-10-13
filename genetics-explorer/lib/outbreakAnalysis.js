import {computeOutbreak} from './outbreak.js';
const percent=(cases,population)=>population?Math.round(cases/population*1000)/10:0;
/** Replay the same biological timeline under different classroom policy assumptions. */
export function analyzeOutbreak(state){
 const current=computeOutbreak(state),baseline=computeOutbreak({...state,publicHealthDecisions:[]});
 const records=(state.publicHealthDecisions||[]).filter(i=>i.day<=state.day);
 const marginalDecisions=current.contagious?records.map((record,index)=>{
  const without=computeOutbreak({...state,publicHealthDecisions:records.filter((_,i)=>i!==index)});
  return {...record,activeCasesAvoided:without.activeCases-current.activeCases,exposureCasesAvoided:without.exposedCases-current.exposedCases,hospitalOccupancyAvoided:Math.round((without.hospitalOccupancy-current.hospitalOccupancy)*10)/10,effectStartDay:record.day+1,effectEndDay:record.day+4,criterion:'Aynı biyolojik çizelgede yalnız bu karar kaydı kaldırıldı; etkileşimler nedeniyle katkılar toplanamaz.'};
 }):[];
 const maxAvoided=marginalDecisions.length?Math.max(...marginalDecisions.map(p=>p.activeCasesAvoided)):0;
 const tied=marginalDecisions.filter(p=>p.activeCasesAvoided===maxAvoided&&maxAvoided>0);
 const latest=records.length?Math.max(...records.map(i=>i.day)):null;
 const summary={initialSickPercent:percent(current.history[0]?.activeCases||0,current.population),maxSickPercent:Math.max(...current.history.map(p=>percent(p.activeCases,p.population))),finalSickPercent:percent(current.activeCases,current.population),finalRecoveredPercent:percent(current.recovered,current.population),maxHospitalOccupancy:Math.max(...current.history.map(p=>p.hospitalOccupancy||0)),mostEffectiveDecision:tied.length?{kind:tied[0].kind,label:tied[0].label,impact:maxAvoided,tiedLabels:[...new Set(tied.map(i=>i.label))],criterion:'Final aktif birim azalması; klinik etkinlik sıralaması değildir.'}:null,lastDecision:latest===null?null:{kind:records.find(i=>i.day===latest).kind,day:latest,label:records.find(i=>i.day===latest).label,tiedLabels:[...new Set(records.filter(i=>i.day===latest).map(i=>i.label))]}};
 const comparison={day:current.day,baselineSickPercent:percent(baseline.activeCases,baseline.population),currentSickPercent:percent(current.activeCases,current.population),activeCasesDifference:current.activeCases-baseline.activeCases,spreadDifference:Math.round((current.spread-baseline.spread)*10)/10,hospitalOccupancyDifference:Math.round((current.hospitalOccupancy-baseline.hospitalOccupancy)*10)/10};
 return {baseline,current,comparison,summary,marginalDecisions,disclaimer:'Model içi karşılaştırma: aynı biyolojik seyir ve seed, farklı soyut kamu sağlığı katsayıları. Gerçek hayatta aynı sonuç oluşacağı veya bir kararın klinik etkinliği anlamına gelmez.'};
}