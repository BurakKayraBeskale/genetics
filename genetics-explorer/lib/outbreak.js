import {applyCaseNarrative} from './CaseEventEngine.js';
/** All transition coefficients below are classroom assumptions, not fitted epidemiology. */
export const PUBLIC_HEALTH_DECISIONS=[
 {id:'testing',label:'Test kapasitesini artır',health:.1,economy:-3,social:-1,exposureReduction:.08},
 {id:'tracing',label:'Temas takibi',health:.12,economy:-2,social:-2,exposureReduction:.18},
 {id:'isolation',label:'İzolasyon',health:.22,economy:-5,social:-7,exposureReduction:.32},
 {id:'events',label:'Etkinlikleri sınırla',health:.16,economy:-6,social:-8,exposureReduction:.22},
 {id:'travel',label:'Seyahati sınırla',health:.14,economy:-7,social:-6,exposureReduction:.14},
 {id:'care',label:'Bakım kapasitesini artır',health:.12,economy:-5,social:2,exposureReduction:0},
];
const bound=v=>Math.round(Math.max(0,Math.min(100,Number(v)||0))*10)/10;
const round=v=>Math.round(v*10)/10;
const infectious=p=>p?.mechanism?['infectious/viral','infectious/bacterial','infectious/mixed'].includes(p.mechanism):['viral','bacterial','mixed'].includes(p?.category);
const spreadUnsupported=p=>p?.contagious!==true||!infectious(p)||p?.publicSpreadApplicable===false||['route-specific','not-modeled'].includes(p?.spreadMode);
const noise=(seed,day)=>{let x=(seed^Math.imul(day+1,2654435761))>>>0;x=Math.imul(x^(x>>>16),2246822507)>>>0;return (x%1000)/1000;};
const policiesAt=(records,day)=>records.filter(i=>i.day<day&&day-i.day<=4);
const policyFor=id=>PUBLIC_HEALTH_DECISIONS.find(p=>p.id===id);
function feedback(records,day,observation){return records.map(record=>{
 const status=day<=record.day?'pending':day<=record.day+4?'active':'expired';
 const model=policyFor(record.kind);
 const explanations={testing:'Modelde riskli maruziyetleri belirleme ve temas baskısını azaltma katsayısı uygulanır.',tracing:'Yeni maruziyet akışının temas katsayısı azaltılır.',isolation:'Aktif vaka kaynaklı soyut maruziyet katsayısı azaltılır.',events:'Toplum temas katsayısı azaltılır.',travel:'Toplum dışı soyut temas katkısı azaltılır.',care:'Sentetik bakım kapasitesi artırılır; ağır durumdan toparlanma katsayısı değişir.',containment:'Soyut maruziyet baskısı azaltılır.'};
 return {kind:record.kind,day:record.day,label:record.label||model?.label||'Soyut yayılım sınırı',status,effectStartDay:record.day+1,effectEndDay:record.day+4,observedImpact:status==='pending'?'Karar alındı; henüz sonuç oluşmadı':status==='active'&&observation?(record.kind==='care'?`Bu adımda bakım yükü ${observation.hospitalLoad}/${observation.hospitalCapacity}, doluluk %${observation.hospitalOccupancy}.`:`Bu adımda ${observation.newExposures||0} yeni maruziyet ve ${observation.newCases||0} yeni aktif model birimi gözlendi. Kararın katkısı kararsız çizelgeyle karşılaştırılır.`):status==='active'?'Model katsayısı bu adımda aktif; kararın tek başına klinik sonucu ölçülmez':'Dört adımlık model etki penceresi tamamlandı',explanation:explanations[record.kind]||'Karar model varsayımlarıyla izlenir.'};
});}
function change(before,after){return {newCases:after.newCases,newExposures:after.newExposures||0,exposed:after.exposedCases-before.exposedCases,recovered:after.recovered-before.recovered,severe:after.severeCases-before.severeCases,activeCases:after.activeCases-before.activeCases,sickPercentBefore:round(before.activeCases/before.population*100),sickPercentAfter:round(after.activeCases/after.population*100),spreadBefore:before.spread,spreadAfter:after.spread,hospitalOccupancyBefore:before.hospitalOccupancy,hospitalOccupancyAfter:after.hospitalOccupancy};}
function explain(point,previous,active,tendency){
 const labels=[...new Set(active.map(i=>i.label||policyFor(i.kind)?.label).filter(Boolean))];
 const exposure=point.newExposures||0;
 return {activeCases:[`${point.newCases} temaslı birim aktif duruma geçti; ${point.dailyRecoveries||0} aktif birim toparlandı.`,`Aktif durum: ${previous.activeCases} → ${point.activeCases}; ağır durumlar aktif toplamın içindedir.`],
 newCases:[`${point.newCases} yeni aktif birim önceki temaslı havuzundan oluştu; gerçek kişi veya klinik vaka sayısı değildir.`],
 spread:[`Profilin soyut yayılım eğilimi ${tendency}/100; yeni maruziyet ${exposure} model birimi.`,labels.length?`Aktif karar katsayıları: ${labels.join(', ')}.`:'Bu adımda aktif kamu sağlığı karar katsayısı yok.'],
 recovered:[`${point.dailyRecoveries||0} aktif/ağır birim toparlanma havuzuna geçti; model bağışıklık göstergesi bu akışı etkiler.`],
 severeCases:[`${point.dailySevere||0} aktif birim ağır model durumuna geçti; ${point.severeCases} ağır birim izleniyor. Bu klinik ağır hastalık riski değildir.`],
 hospitalOccupancy:[`${point.hospitalLoad} / ${point.hospitalCapacity} sentetik bakım birimi = %${point.hospitalOccupancy}.`,active.some(i=>i.kind==='care')?'Bakım kapasitesi kararı bu adımda kapasiteyi artırıyor.':'Bu adımda bakım kapasitesi artışı yok.']};
}
export function computeOutbreak(state){
 const profile=state.scenarioConfig||{},day=state.day||0,population=10000;
 const records=(state.publicHealthDecisions||[]).filter(i=>i.day<=day);
 if(spreadUnsupported(profile)){
  const base={population,spread:0,health:100,economy:100,social:100,hospitalPressure:0,hospitalOccupancy:0,activeCases:0,sickCases:0,severeCases:0,exposedCases:0,healthyCases:population,newCases:0,newExposures:0,recovered:0,hospitalCapacity:300,hospitalLoad:0};
  const source=(state.timeline||[]).filter(p=>p.day<=day);const history=(source.length?source:[{day}]).map(p=>({...base,day:p.day}));
  const current=history.at(-1),unsupported=infectious(profile)&&(['route-specific','not-modeled'].includes(profile.spreadMode)||profile.publicSpreadApplicable===false);
  return {...current,contagious:false,diseaseContagious:profile.contagious===true,populationSpreadUnsupported:unsupported,risk:unsupported?'Bu yayılım modeli uygulanmaz':'Bulaşıcı olarak modellenmez',history,decisions:[],decisionFeedback:[],dailyChange:change(current,current),explanations:{activeCases:['Bu hastalık kişiler arasında bulaşıcı olarak modellenmez.'],spread:['Bu vaka için genel toplum temas modeli uygulanmaz.'],hospitalOccupancy:['Bireysel doku etkisi toplum salgınına çevrilmez.']},disclaimer:unsupported?'Bu enfeksiyon bulaşma yoluna özgü maruziyet modeli gerektirir; sıfır toplum göstergesi gerçek riskin sıfır olduğu anlamına gelmez.':'Bulaşıcı olmayan vaka toplum enfeksiyonu olarak modellenmez.'};
 }
 const tendency=bound(profile.educationalParameters?.transmissionTendency??profile.educationalParameters?.transmission??40),factor=tendency/100;
 let sick=tendency>0?1000:0,severe=0,exposed=Math.round(600*tendency/40),recovered=0,healthy=population-sick-exposed;
 let spread=bound(12*tendency/40),economy=100,social=100;
 const initial={day:0,population,sickCases:sick,severeCases:severe,activeCases:sick,healthyCases:healthy,exposedCases:exposed,recovered,newCases:0,newExposures:0,spread,health:100,economy,social,hospitalLoad:0,hospitalCapacity:300,hospitalPressure:0,hospitalOccupancy:0};
 initial.dailyChange=change(initial,initial);initial.decisionFeedback=feedback(records.filter(i=>i.day<=0),0,initial);initial.explanations=explain(initial,initial,[],tendency);initial.explanations.sick=initial.explanations.activeCases;
 const history=[initial];let previousLoad=Number(state.timeline?.find(p=>p.day===0)?.metrics?.pathogenLoad)||0;
 for(const point of (state.timeline||[]).filter(p=>p.day>0&&p.day<=day).sort((a,b)=>a.day-b.day)){
  const active=policiesAt(records,point.day),policies=active.map(i=>policyFor(i.kind)).filter(Boolean),care=active.filter(i=>i.kind==='care').length;
  const protection=Math.min(.82,policies.reduce((n,p)=>n+p.exposureReduction,0)+(active.some(i=>i.kind==='containment')?.16:0));
  const load=bound(point.metrics?.pathogenLoad),antibody=bound(point.metrics?.antibodyLevel),damage=bound(point.metrics?.tissueDamage);
  const target=tendency===0?0:bound(8+factor*40+load*.45-antibody*.22);
  spread=bound(spread*.5+target*.5-protection*15);
  const recoveryRate=Math.min(.3,.018+antibody*.0018+Math.max(0,previousLoad-load)*.0015+care*.008);
  const recoverSick=Math.min(sick,Math.round(sick*recoveryRate)),recoverSevere=Math.min(severe,Math.round(severe*(.012+antibody*.0008+care*.035)));
  const toSevere=Math.min(sick-recoverSick,Math.round(sick*(.012+damage*.0015)*(care? .7:1)));
  const newCases=Math.min(exposed,Math.round(exposed*(.28+load*.001)));
  const force=(.025+(sick+severe)/population*.38+load*.0015)*factor*(1-protection);
  const newExposures=Math.min(healthy,Math.round(healthy*force*(.96+noise(state.seed||0,point.day)*.08)));
  healthy-=newExposures;exposed+=newExposures-newCases;sick+=newCases-recoverSick-toSevere;severe+=toSevere-recoverSevere;recovered+=recoverSick+recoverSevere;
  const hospitalCapacity=300+care*150,hospitalLoad=severe,hospitalOccupancy=round(hospitalLoad/hospitalCapacity*100);
  economy=bound(economy-(sick+severe)/population*1.4+policies.reduce((n,p)=>n+p.economy,0)*.3+(load<15?.7:0));
  social=bound(social-(sick+severe)/population*1.1+policies.reduce((n,p)=>n+p.social,0)*.3+(load<15?.7:0));
  const current={day:point.day,population,sickCases:sick,severeCases:severe,activeCases:sick+severe,healthyCases:healthy,exposedCases:exposed,recovered,newCases,newExposures,dailyRecoveries:recoverSick+recoverSevere,dailySevere:toSevere,spread,economy,social,hospitalCapacity,hospitalLoad,hospitalOccupancy,hospitalPressure:bound(hospitalOccupancy),health:bound(100-hospitalOccupancy*.3-(sick+severe)/population*20)};
  current.dailyChange=change(history.at(-1),current);current.decisionFeedback=feedback(records.filter(i=>i.day<=point.day),point.day,current);current.explanations=explain(current,history.at(-1),active,tendency);current.explanations.sick=current.explanations.activeCases;
  history.push(current);previousLoad=load;
 }
 const current=history.at(-1),before=history.length>1?history.at(-2):current;
 const explanations=current.explanations||explain(current,before,[],tendency);
 return {...current,contagious:true,diseaseContagious:true,populationSpreadUnsupported:false,risk:spread>=65?'Yüksek':spread>=30?'Orta':'Düşük',history,decisions:records,decisionFeedback:feedback(records,day,current),dailyChange:current.dailyChange||change(before,current),explanations:{...explanations,sick:explanations.activeCases},transmissionTendency:tendency,disclaimer:'10000 birimlik sentetik toplum ve geçiş katsayıları sınıf varsayımlarıdır; gerçek kişiler, R0, klinik prognoz veya toplum salgını tahmini değildir.'};
}
export function applyPublicHealthDecision(state,kind){
 const policy=policyFor(kind);if(spreadUnsupported(state.scenarioConfig)||!policy||state.finalOutcome||(state.publicHealthDecisions||[]).some(i=>i.kind===kind&&i.day===state.day))return state;
 const next={...state,publicHealthDecisions:[...(state.publicHealthDecisions||[]),{day:state.day,kind,label:policy.label}]};
 return applyCaseNarrative(state,next,{previousOutbreak:computeOutbreak(state),nextOutbreak:computeOutbreak(next)});
}
export function enrichObservations(previous,next){if(next.day===previous.day)return next;return applyCaseNarrative(previous,next,{previousOutbreak:computeOutbreak(previous),nextOutbreak:computeOutbreak(next)});}