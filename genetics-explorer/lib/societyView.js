const clamp=(v,max)=>Math.min(max,Math.max(0,Number(v)||0));
const STATES=['healthy','risk','sick','severe','recovered'];
function quantize(outbreak){
 const population=Math.max(0,Number(outbreak.population)||0),contagious=outbreak.contagious!==false;
 const actual=population?clamp(outbreak.activeCases,population)/population*100:0;
 const active=contagious?Math.round(actual/10):0;
 const severe=contagious&&population?Math.min(active,Math.round(clamp(outbreak.severeCases,population)/population*10)):0;
 const recovered=contagious&&population?Math.min(10-active,Math.round(clamp(outbreak.recovered,population)/population*10)):0;
 const legacyRisk=Number(outbreak.newCases)>0?(Number(outbreak.spread)>=65?3:Number(outbreak.spread)>=30?2:1):0;
 const exposed=Number.isFinite(outbreak.exposedCases)&&population?Math.round(clamp(outbreak.exposedCases,population)/population*10):legacyRisk;
 const risk=contagious?Math.min(10-active-recovered,exposed):0;
 return {healthy:10-active-risk-recovered,risk,sick:active-severe,severe,recovered};
}
function allocate(previous,counts){
 const people=Array(10).fill(null),left={...counts};
 for(let i=0;i<10;i++){const status=previous[i];if(left[status]>0){people[i]=status;left[status]--;}}
 const preference={severe:['sick','risk','healthy','recovered'],sick:['risk','healthy','severe','recovered'],recovered:['severe','sick','risk','healthy'],risk:['healthy','sick','recovered','severe'],healthy:['recovered','risk','sick','severe']};
 for(const status of ['severe','sick','recovered','risk','healthy'])while(left[status]>0){
  let index=-1;for(const from of preference[status]){index=people.findIndex((value,i)=>value===null&&previous[i]===from);if(index>=0)break;}
  if(index<0)index=people.indexOf(null);people[index]=status;left[status]--;
 }
 return people;
}
function transition(from,to){if(from===to)return [to];if(from==='healthy'&&to==='sick')return [from,'risk',to];if(from==='healthy'&&to==='severe')return [from,'risk','sick',to];if(from==='risk'&&to==='severe')return [from,'sick',to];return [from,to];}
/** Stable ten-unit cohort representation reconstructed from aggregate history.
 * IDs identify chart positions, never real persons or patient predictions. */
export function deriveSocietyView(outbreak={}){
 const population=Math.max(0,Number(outbreak.population)||0),contagious=outbreak.contagious!==false;
 const counts=quantize(outbreak),day=Number.isFinite(outbreak.day)?outbreak.day:null;
 const history=(Array.isArray(outbreak.history)?outbreak.history:[]).filter(p=>day===null||!Number.isFinite(p.day)||p.day<=day);
 let people=Array(10).fill('healthy'),previousPeople=[...people],previousCounts={healthy:10,risk:0,sick:0,severe:0,recovered:0};
 const dated=history.filter(p=>Number.isFinite(p.day)).sort((a,b)=>a.day-b.day);
 const replay=dated.length?dated:[];
 for(const point of replay){previousPeople=[...people];previousCounts=Object.fromEntries(STATES.map(status=>[status,people.filter(s=>s===status).length]));people=allocate(people,quantize({...point,contagious}));}
 if(!replay.length||replay.at(-1).day!==day){previousPeople=[...people];previousCounts=quantize({...outbreak,activeCases:0,severeCases:0,recovered:0,exposedCases:0,newCases:0});people=allocate(people,counts);}
 else if(STATES.some(key=>quantize({...replay.at(-1),contagious})[key]!==counts[key]))people=allocate(people,counts);
 const actualSickPercent=contagious&&population?clamp(outbreak.activeCases,population)/population*100:0;
 const actualRecoveredPercent=contagious&&population?clamp(outbreak.recovered,population)/population*100:0;
 const previous=history.length>1?history.at(-2):null;
 const personStates=people.map((status,i)=>({id:'person-'+String(i+1).padStart(2,'0'),status,from:previousPeople[i],path:transition(previousPeople[i],status),riskLevel:['severe','sick'].includes(status)?'Yüksek':status==='risk'?'Orta':'Düşük',day:day??0}));
 return {contagious,population,counts,previousCounts,people,personStates,sickPercent:(counts.sick+counts.severe)*10,recoveredPercent:counts.recovered*10,actualSickPercent,actualRecoveredPercent,newCases:clamp(outbreak.newCases,population),dailyChange:outbreak.dailyChange||null,spreadDelta:previous?(Number(outbreak.spread)||0)-(Number(previous.spread)||0):null};
}