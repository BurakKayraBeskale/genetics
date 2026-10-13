import { getProfileOrganEffects } from './diseaseTrajectory.js';
import { computeOutbreak } from './outbreak.js';
import { ORGAN_EDUCATION } from './organEducation.js';
const metricLabels={pathogenLoad:'Etken yükü',proteinFunction:'Protein işlev kaybı',autoimmuneActivity:'Otoimmün aktivite',metabolicImbalance:'Metabolik dengesizlik',neuralFunction:'Sinir işlev kaybı',tumorBurden:'Anormal hücre yükü'};
const primaryMetric=state=>{const mechanism=state.scenarioConfig?.mechanism||state.scenarioConfig?.category;return ({genetic:'proteinFunction',autoimmune:'autoimmuneActivity',metabolic:'metabolicImbalance',neurological:'neuralFunction',oncology:'tumorBurden'})[mechanism]||'pathogenLoad';};
const value=(metrics,key)=>Number.isFinite(metrics?.[key])?(['proteinFunction','neuralFunction'].includes(key)?100-metrics[key]:metrics[key]):0;
const clean=(text,state,hidden)=>{let output=String(text||'');if(hidden)for(const token of [state.scenarioConfig?.name,state.scenarioConfig?.id])if(token)output=output.split(token).join('Gizli vaka');return output;};
/** History-backed educational summary. Event sequences are associations, not proof of clinical causation. */
export function buildCaseReport(state,{outbreak,day=state.day,hiddenProfile=false}={}) {
 const points=(state.timeline||[]).filter(p=>p.day<=day);const events=(state.clinicalEvents||[]).filter(e=>e.day<=day);
 const first=points[0]||{day:0,symptoms:[],metrics:{}};const key=primaryMetric(state);
 const peak=k=>points.reduce((best,p)=>value(p.metrics,k)>best.value?{day:p.day,value:value(p.metrics,k)}:best,{day:first.day,value:value(first.metrics,k)});
 const milestones=events.filter(e=>['IMPORTANT','CRITICAL'].includes(e.severity)).map(e=>({id:clean(e.id,state,hiddenProfile),day:e.day,type:e.type,title:clean(e.title,state,hiddenProfile),text:clean(e.text,state,hiddenProfile),relatedOrgan:e.relatedOrgan}));
 const hypotheses=(state.hypothesisHistory||[]).filter(h=>h.day<=day);
 const hypothesisChanges=hypotheses.filter((h,i)=>i===0||h.currentHypothesis!==hypotheses[i-1].currentHypothesis||h.confidence!==hypotheses[i-1].confidence).map(h=>({day:h.day,currentHypothesis:clean(h.currentHypothesis,state,hiddenProfile),confidence:h.confidence,conflictingEvidence:(h.conflictingEvidence||[]).map(t=>clean(t,state,hiddenProfile))}));
 let mostAffectedOrgan=null;
 for(const point of points)for(const effect of getProfileOrganEffects(state.scenarioConfig,point.metrics,point.day,state.config.durationDays))if(!mostAffectedOrgan||effect.severity>mostAffectedOrgan.severity)mostAffectedOrgan={organ:effect.organ,name:ORGAN_EDUCATION[effect.organ]?.name||effect.organ,day:point.day,severity:Math.round(effect.severity*1000)/10};
 const population=outbreak||computeOutbreak(state);const history=(population.history||[]).filter(p=>p.day<=day);
 const maximum=k=>history.reduce((best,p)=>(p[k]||0)>best.value?{day:p.day,value:p[k]}:best,{day:0,value:0});
 const interventions=[...(state.interventions||[]),...(state.publicHealthDecisions||[])].filter(i=>i.day<=day).filter((item,index,list)=>list.findIndex(other=>other.day===item.day&&other.kind===item.kind)===index).map(i=>({day:i.day,kind:i.kind,label:clean(i.label,state,hiddenProfile)}));
 const causalExplanation=events.filter(e=>['LAB','ANATOMY','IMMUNE','PUBLIC_HEALTH','CLINICAL'].includes(e.type)).slice(-6).map(e=>({eventId:clean(e.id,state,hiddenProfile),day:e.day,text:`Gün ${e.day}: ${clean(e.text,state,hiddenProfile)}`}));
 return {day,complete:Boolean(state.finalOutcome&&day>=state.finalOutcome.day),initialFindings:{day:first.day,symptoms:(first.symptoms||[]).map(t=>clean(t,state,hiddenProfile)),metrics:{...first.metrics}},milestones,hypothesisChanges,peakInflammation:{...peak('inflammation'),label:'Genel inflamasyon'},peakDiseaseMetric:{...peak(key),key,label:metricLabels[key]},mostAffectedOrgan,maxPopulationImpact:population.contagious?{applicable:true,spread:maximum('spread'),hospitalPressure:maximum('hospitalPressure')}:{applicable:false,explanation:population.disclaimer},interventions,educationalOutcome:clean((state.finalOutcome && day>=state.finalOutcome.day ? state.finalOutcome.summary : null) || 'Vaka gözlemi sürüyor; son eğitim değerlendirmesi henüz oluşmadı.',state,hiddenProfile),causalExplanation,causalDisclaimer:'Olay sırası modeldeki değişimlerin nasıl birlikte geliştiğini açıklar; klinik nedensellik, kesin tanı veya müdahalenin gerçek tedavi etkisi kanıtı değildir.'};
}
