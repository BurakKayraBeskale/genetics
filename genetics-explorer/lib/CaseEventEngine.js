import { getProfileOrganEffects } from './diseaseTrajectory.js';
/** Pure narrative layer. Confidence is a reasoning score, never diagnostic probability. */
export const EVENT_TYPES=['CLINICAL','LAB','ANATOMY','IMMUNE','PUBLIC_HEALTH','BULLETIN','ALERT'];
export const EVENT_SEVERITIES=['INFO','NOTICE','IMPORTANT','CRITICAL'];
const NOTE='Soyut eğitim gözlemidir; klinik test sonucu, tanı, prognoz veya tedavi önerisi değildir.';
const ORGANS={lungs:'Akciğer',digestive:'Sindirim',brain:'Beyin',muscle:'Kas',renal:'Böbrek',endocrine:'Endokrin',skin:'Deri',blood:'Dolaşım'};
const METRICS={pathogenLoad:'Etken yükü',inflammation:'İnflamasyon',tissueDamage:'Doku stresi',adaptiveImmunity:'Adaptif bağışıklık',innateImmunity:'Doğal bağışıklık',antibodyLevel:'Antikor yanıtı',proteinFunction:'Protein işlevi',autoimmuneActivity:'Öz-doku bağışıklık aktivitesi',metabolicImbalance:'Metabolik dengesizlik',neuralFunction:'Sinir dokusu işlevi',tumorBurden:'Anormal hücre yükü'};
const placeholder=s=>/başlangıç gözlemi|belirgin semptom gözlenmiyor|hafif bulgular|toparlanma eğilimi|başlangıç izlemi/i.test(s);
const actualSymptoms=s=>(s.symptoms||[]).filter(x=>!placeholder(x));
const respiratory=s=>/öksür|solunum|boğaz|nefes|burun/i.test(s);
const gastrointestinal=s=>/gastrointestinal|ishal|kusma|bulantı|karın|sindirim/i.test(s);
const neurological=s=>/nöbet|biliş|bellek|sinir|baş ağr|denge|titreme|spazm/i.test(s);
const round=v=>Math.round(v*10)/10;
const bound=v=>Math.round(Math.max(0,Math.min(75,v)));
const activity=value=>Number(typeof value==='object'?value?.severity??value?.activity??value?.stress??0:value)||0;
function effects(state){const list=state.organEffects||getProfileOrganEffects(state.scenarioConfig||{},state.metrics||{},state.day,state.config?.durationDays||14);return Array.isArray(list)?list.reduce((map,e)=>{map[e.organ]=Math.max(map[e.organ]||0,activity(e));return map;},{}):Object.fromEntries(Object.entries(list||{}).map(([key,v])=>[key,activity(v)]));}
function specialist(state,organ,type){
 if(type==='PUBLIC_HEALTH'||type==='BULLETIN')return 'Dr. E. Kaya · Halk Sağlığı · Kurgusal eğitim danışmanı';
 if(organ==='brain')return 'Dr. N. Aras · Nöroloji · Kurgusal eğitim danışmanı';
 if(Number.isFinite(state.metrics?.proteinFunction))return 'Dr. G. Aydın · Genetik · Kurgusal eğitim danışmanı';
 if(Number.isFinite(state.metrics?.pathogenLoad)&&state.metrics.pathogenLoad>0)return 'Dr. A. Demir · Enfeksiyon Hastalıkları · Kurgusal eğitim danışmanı';
 return 'Dr. D. Yılmaz · Dahiliye · Kurgusal eğitim danışmanı';
}
export function initialKnowledgeState(){return {currentHypothesis:'Gözlem verisi birikmesi bekleniyor',confidence:0,supportingEvidence:[],conflictingEvidence:[],unknowns:['Belirtilerin zaman içindeki seyri','Temel sürecin nedeni','Yeni sistem bulgusu gelişip gelişmeyeceği']};}
function deriveKnowledge(previous,next){
 const old=previous.knowledgeState||initialKnowledgeState(),before=actualSymptoms(previous),now=actualSymptoms(next);
 const added=now.filter(s=>!before.includes(s)),resolved=before.filter(s=>!now.includes(s));
 const hasResp=now.some(respiratory),hadResp=before.some(respiratory)||old.supportingEvidence.some(respiratory);
 const infectionSignal=(next.metrics?.pathogenLoad||0)>0,proteinSignal=Number.isFinite(next.metrics?.proteinFunction);
 const respiratoryHypothesis=infectionSignal?'Solunum ağırlıklı süreç hipotezi; etken doğrulanmadı':proteinSignal?'Solunum dokusu işlevi–protein bağlantısı izleniyor; neden doğrulanmadı':'Solunum dokusu işlev bulguları izleniyor; neden doğrulanmadı';
 const newGI=added.some(gastrointestinal)&&hadResp;
 let hypothesis=old.currentHypothesis,confidence=old.confidence;
 const conflicts=[...old.conflictingEvidence];
 let supports=now.map(s=>'Gözlenen belirti: '+s);
 if(hasResp){
  if(!hadResp){hypothesis=infectionSignal?'Solunum ağırlıklı başlangıç hipotezi':respiratoryHypothesis;confidence=35;}
  else if(!conflicts.length){hypothesis=respiratoryHypothesis;confidence=Math.max(55,Math.min(70,confidence+(added.length?3:0)));}
 }else if(now.length&&!hadResp){
  hypothesis=now.some(gastrointestinal)?'Sindirim ağırlıklı süreç hipotezi; neden doğrulanmadı':now.some(neurological)?'Sinir sistemi işlev bulguları ön planda; neden belirsiz':'Gözlenen belirtiler ve doku işlevi birlikte değerlendiriliyor';
  confidence=bound(confidence+(added.length?12:0));
 }
 if(newGI){
  conflicts.push('Yeni gastrointestinal bulgular ilk solunum ağırlıklı değerlendirmeyle tam örtüşmüyor');
  hypothesis='Atipik seyir veya eşlik eden bir süreç olasılığı; ek veri gerekli';confidence=bound(Math.max(0,old.confidence)-18);
 }
 if(resolved.length&&confidence>0)confidence=bound(confidence-3);
 const m=next.metrics||{},prior=previous.metrics||{};
 if(!hasResp&&!newGI){
  if(Number.isFinite(m.metabolicImbalance)){hypothesis='Metabolik denge ve hedef doku işlevi karşılaştırılıyor; temel neden belirsiz';supports.push('Modelde metabolik dengesizlik göstergesi mevcut');}
  else if(Number.isFinite(m.tumorBurden)){hypothesis='Anormal hücre yükü ile doku etkisi ilişkisi izleniyor; neden doğrulanmadı';supports.push('Anormal hücre yükü modelde izleniyor');}
  else if(Number.isFinite(m.autoimmuneActivity)){hypothesis='Öz-doku bağışıklık aktivitesi ve belirtiler karşılaştırılıyor; neden belirsiz';supports.push('Modelde öz-doku yanıtı göstergesi mevcut');}
  else if(Number.isFinite(m.neuralFunction)){hypothesis='Sinir dokusu işlevi ve belirtiler birlikte izleniyor; temel neden belirsiz';supports.push('Sinir işlevi göstergesi takip ediliyor');}
  else if(Number.isFinite(m.proteinFunction)){hypothesis='Protein işlevi ve doku bulguları birlikte izleniyor; temel neden belirsiz';supports.push('Protein işlevi göstergesi takip ediliyor');}
 }
 if((m.adaptiveImmunity||0)>(prior.adaptiveImmunity||0)+4)supports.push('Modelde adaptif yanıtın arttığı gözlendi');
 if((m.pathogenLoad||0)<(prior.pathogenLoad||0)-5){supports.push('Model etken yükü önceki adıma göre azaldı');if(!newGI)confidence=bound(confidence+2);}
 if((m.tissueDamage||0)>(prior.tissueDamage||0)+3){conflicts.push('Doku stresi artışı tek başına görünen belirtilerle açıklanamıyor');if(!newGI)confidence=bound(confidence-4);}
 if(!supports.length&&old.supportingEvidence.length)supports=['Önceki bulguların seyri izleniyor'];
 return {currentHypothesis:hypothesis,confidence:bound(confidence),supportingEvidence:[...new Set(supports)].slice(-12),conflictingEvidence:[...new Set(conflicts)].slice(-12),unknowns:['Etken veya temel neden doğrulanmadı','Bu model klinik test ve hasta verisi içermez',...(newGI||conflicts.length?['Ek bulguların aynı sürece mi ait olduğu']:['Sonraki gözlemler hipotezi destekleyecek mi?'])]};
}
export function generateClinicalEvents(previous,next,{previousOutbreak,nextOutbreak}={}){
 const events=[],day=next.day;
 const actionChanged=['interventions','publicHealthDecisions'].some(key=>(next[key]||[]).some(i=>!(previous[key]||[]).some(p=>p.day===i.day&&p.kind===i.kind)));
 if(day<previous.day||day===previous.day&&!actionChanged)return {clinicalEvents:[],knowledgeState:next.knowledgeState||previous.knowledgeState||initialKnowledgeState()};
 const knowledgeState=day===previous.day?(previous.knowledgeState||initialKnowledgeState()):deriveKnowledge(previous,next);
 const add=(key,type,severity,title,text,extra={})=>events.push({id:day+':'+key,day,type,severity,title,text,source:type==='LAB'?'Soyut model göstergesi':specialist(next,extra.relatedOrgan,type),educationalNote:NOTE,...Object.fromEntries(Object.entries(extra).filter(([,value])=>value!==undefined))});
 const bulletin=(key,severity,title,text,extra)=>add(key+':bulletin','BULLETIN',severity,title,text,extra);
 const before=actualSymptoms(previous),now=actualSymptoms(next),added=now.filter(s=>!before.includes(s)),resolved=before.filter(s=>!now.includes(s));
 const conflictingGI=added.some(gastrointestinal)&&(before.some(respiratory)||(previous.knowledgeState?.supportingEvidence||[]).some(respiratory));
 if(added.length){
  add('symptom:new','CLINICAL',conflictingGI?'IMPORTANT':'NOTICE','Yeni klinik gözlem',conflictingGI?'Yeni gastrointestinal bulgular başlangıçtaki solunum yolu hipoteziyle tam uyuşmuyor. Atipik seyir veya eşlik eden süreç için ek gözlem gerekir.':'Yeni belirtiler: '+added.join(', ')+'. Bulguların birlikteliği ve zaman içindeki değişimi izleniyor.',{relatedOrgan:added.some(gastrointestinal)?'digestive':added.some(respiratory)?'lungs':added.some(neurological)?'brain':undefined});
  bulletin('symptom:new',conflictingGI?'IMPORTANT':'INFO','Belirti profili güncellendi','Uzmanlar yeni vaka gözlemlerini karşılaştırıyor: '+added.join(', ')+'. Tek bir yeni bulgu etkeni belirlemez.');
 }
 if(resolved.length)add('symptom:resolved','CLINICAL','INFO','Belirti seyri değişti','İzlemde artık gösterilmeyen belirtiler: '+resolved.join(', ')+'. Bu tek başına tam iyileşme değildir.');
 const oldEffects=effects(previous),newEffects=effects(next);
 for(const organ of new Set([...Object.keys(oldEffects),...Object.keys(newEffects)])){
  const old=oldEffects[organ]||0,current=newEffects[organ]||0,label=ORGANS[organ]||organ,unit=Math.max(old,current)<=1?1:100;
  let key,title,severity='NOTICE';
  if(old<.05*unit&&current>=.05*unit){key='onset';title=label+' hedefinde yeni doku yanıtı';}
  else if(old<.6*unit&&current>=.6*unit){key='stress';title=label+' hedefinde etki belirginleşti';severity='IMPORTANT';}
  else if(old>=.6*unit&&current<.6*unit){key='easing';title=label+' hedefinde göreli etki azaldı';}
  else if(organ in oldEffects&&!(organ in newEffects)&&old>=.05*unit){key='inactive';title=label+' görsel etki penceresi kapandı';}
  if(key){add('organ:'+organ+':'+key,'ANATOMY',severity,title,label+' görünümündeki değişim hedef doku izlemini gerektiriyor; renkler modelin göreli etkisini gösterir.',{relatedOrgan:organ,relatedMetric:'organSeverity',previousValue:round(old),metricValue:round(current),delta:round(current-old)});bulletin('organ:'+organ+':'+key,severity,'Sistem izlemi güncellendi',label+' hedefinin eğitim gözlem aşaması değişti. Bu, klinik organ hasarı tanısı değildir.',{relatedOrgan:organ});}
 }
 for(const [key,label] of Object.entries(METRICS)){
  const old=previous.metrics?.[key],current=next.metrics?.[key];if(!Number.isFinite(old)||!Number.isFinite(current))continue;const delta=round(current-old);
  const threshold=['proteinFunction','neuralFunction','tumorBurden','metabolicImbalance','autoimmuneActivity'].includes(key)?.25:2;
  if(Math.abs(delta)>=threshold)add('lab:'+key,'LAB',Math.abs(delta)>=15?'IMPORTANT':'INFO',label+' · model ölçümü',label+': '+round(current)+' model birimi; önceki adım '+round(old)+', değişim '+(delta>0?'+':'')+delta+'. Bu değer gerçek klinik test ölçümü değildir.',{relatedMetric:key,metricValue:round(current),previousValue:round(old),delta});
 }
 for(const [key,threshold,label] of [['adaptiveImmunity',1,'Adaptif yanıt belirmeye başladı'],['antibodyLevel',40,'Antikor yanıtı model eşiğini geçti'],['autoimmuneActivity',40,'Öz-doku yanıtı belirginleşti']]){
  if((previous.metrics?.[key]||0)<threshold&&(next.metrics?.[key]||0)>=threshold){
   const extra={relatedMetric:key,metricValue:next.metrics[key],previousValue:previous.metrics?.[key]||0,delta:round(next.metrics[key]-(previous.metrics?.[key]||0))};
   add('metric:'+key+':rise','IMMUNE',key==='autoimmuneActivity'?'IMPORTANT':'NOTICE',label,'Bağışıklık göstergesi değişti; mekanizma ve gözlenen belirtiler birlikte karşılaştırılmalı.',extra);
   bulletin('metric:'+key+':rise',key==='autoimmuneActivity'?'IMPORTANT':'NOTICE',label,key==='adaptiveImmunity'?'Kazanılmış bağışıklık yanıtı modelde belirginleşmeye başladı. Bu bir klinik bağışıklık testi değildir.':'Bağışıklık model göstergesi eğitim eşiğini geçti; gözlem ve doku yanıtıyla birlikte karşılaştırılıyor.',extra);
  }
 }
 if((previous.metrics?.tissueDamage||0)<20&&(next.metrics?.tissueDamage||0)>=20){add('metric:tissueDamage:rise','ALERT','IMPORTANT','Doku stresinde önemli model değişimi','Göreli doku stresi eğitim eşiğini geçti; bu klinik hasar veya komplikasyonun gerçekleştiği anlamına gelmez.',{relatedMetric:'tissueDamage',metricValue:next.metrics.tissueDamage});bulletin('tissue:stress','IMPORTANT','Doku izlemi öncelik kazandı','Vaka dosyasında doku yanıtı ve işlev göstergeleri birlikte değerlendiriliyor.');}
 const newInterventions=(next.interventions||[]).filter(i=>!(previous.interventions||[]).some(p=>p.day===i.day&&p.kind===i.kind));
 const newPolicies=(next.publicHealthDecisions||[]).filter(i=>!(previous.publicHealthDecisions||[]).some(p=>p.day===i.day&&p.kind===i.kind));
 for(const i of newInterventions)add('intervention:'+i.kind+':'+i.day,'CLINICAL','NOTICE','Soyut müdahale kaydedildi',i.label+'. Sonraki model adımları önceki gözlemlerle karşılaştırılacak; bu bir klinik tedavi değildir.');
 const profile=next.scenarioConfig||{};
 const spreading=nextOutbreak?.contagious&&!nextOutbreak.populationSpreadUnsupported&&profile.contagious!==false&&profile.publicSpreadApplicable!==false&&profile.spreadMode!=='route-specific'&&profile.spreadMode!=='not-modeled'&&!['genetic','autoimmune','metabolic','neurological','oncology'].includes(profile.mechanism||profile.category);
 if(spreading){
  const old=previousOutbreak||{},spread=nextOutbreak.spread||0,diff=round(spread-(old.spread||0));
  const report=(key,severity,title,text,metric,value,beforeValue)=>{const extra={relatedMetric:metric,metricValue:value,previousValue:beforeValue,delta:round(value-beforeValue)};add('population:'+key,'PUBLIC_HEALTH',severity,title,text,extra);bulletin('population:'+key,severity,title,text+' Göstergeler soyut sınıf nüfusuna aittir.',extra);};
  if(diff>=5)report('rapid','IMPORTANT','Yeni vaka kümeleri hızlanıyor','Model yayılım göstergesi önceki adıma göre '+diff+' birim arttı.','spread',spread,old.spread||0);
  else if(diff<=-3)report('slowdown','NOTICE','Yeni vaka artışında yavaşlama','Yayılım göstergesi '+Math.abs(diff)+' model birimi azaldı; bu gerçek toplum salgını tahmini değildir.','spread',spread,old.spread||0);
  if((old.spread||0)<30&&spread>=30)report('spread','NOTICE','Toplum izlemi genişledi','Yayılım göstergesi orta düzey eğitim eşiğini geçti.','spread',spread,old.spread||0);
  const hasOccupancy=Number.isFinite(nextOutbreak.hospitalLoad)&&Number.isFinite(nextOutbreak.hospitalCapacity)&&nextOutbreak.hospitalCapacity>0;
  const occupancy=hasOccupancy?round(nextOutbreak.hospitalLoad/nextOutbreak.hospitalCapacity*100):(nextOutbreak.hospitalPressure||0);
  const priorOccupancy=hasOccupancy&&old.hospitalCapacity>0?round((old.hospitalLoad||0)/old.hospitalCapacity*100):(old.hospitalPressure||0);
  if(priorOccupancy<=80&&occupancy>80)report('hospital','CRITICAL','Hastane kapasitesi üzerinde model baskısı',hasOccupancy?'Sentetik hastane doluluğu kapasitenin %80 üzerine çıktı; bakım kapasitesi kararlarını karşılaştırın.':'Hastane baskısı göstergesi 80 model biriminin üzerine çıktı; bakım kapasitesi kararlarını karşılaştırın.',hasOccupancy?'hospitalOccupancy':'hospitalPressure',occupancy,priorOccupancy);
  for(const i of newPolicies)add('population:decision:'+i.kind+':'+i.day,'PUBLIC_HEALTH','NOTICE','Kamu sağlığı kararı kaydedildi',i.label+'. Etki sonraki eğitim adımlarında izlenecek.');
 }
 const oldKnowledge=previous.knowledgeState||initialKnowledgeState();
 if(knowledgeState.currentHypothesis!==oldKnowledge.currentHypothesis||Math.abs(knowledgeState.confidence-oldKnowledge.confidence)>=5)add('hypothesis:change','CLINICAL',conflictingGI?'IMPORTANT':'NOTICE','Danışman görüşü güncellendi',conflictingGI?'Yeni gastrointestinal bulgular ilk solunum hipoteziyle tam örtüşmüyor; güven puanı '+knowledgeState.confidence+' düzeyine indirildi.':'Geçici değerlendirme: '+knowledgeState.currentHypothesis+'. Güven puanı '+knowledgeState.confidence+'; bu tanı olasılığı değildir.');
 if(!previous.finalOutcome&&next.finalOutcome){add('outcome','CLINICAL','NOTICE','Eğitim izlemi tamamlandı','Önemli bulgular, hipotez değişimleri ve müdahaleler sonuç dosyasında karşılaştırılabilir. Son adım iyileşme anlamına gelmez.');bulletin('outcome','INFO','Vaka izlem özeti hazır','Eğitim zaman çizelgesi tamamlandı; sonuçlar klinik prognoz değildir.');}
 return {clinicalEvents:events,knowledgeState};
}
export function mergeCaseEvents(existing=[],incoming=[]){const keys=new Set(existing.map(e=>e.id||e.day+':'+e.text));return [...existing,...incoming.filter(e=>{const key=e.id||e.day+':'+e.text;if(keys.has(key))return false;keys.add(key);return true;})];}
export function initializeCaseNarrative(state){
 const knowledgeState=initialKnowledgeState();
 const event={id:'0:case:baseline',day:0,type:'CLINICAL',severity:'INFO',title:'Vaka gözlemi başladı',text:'Belirti, doku ve model laboratuvar verileri zaman içinde karşılaştırılacak. Başlangıçta neden doğrulanmış değildir.',source:'Kurgusal eğitim danışmanı',educationalNote:NOTE};
 return {...state,doctorNotes:[event],events:[event],bulletinHistory:[],clinicalEvents:[event],importantEvents:[],knowledgeState,hypothesisHistory:[{day:0,...knowledgeState}],currentDiagnosis:knowledgeState.currentHypothesis,preliminaryDiagnosis:knowledgeState.currentHypothesis,diagnosisConfidence:0};
}
export function applyCaseNarrative(previous,next,options={}){
 const generated=generateClinicalEvents(previous,next,options);
 const clinicalEvents=mergeCaseEvents(next.clinicalEvents||previous.clinicalEvents||[],generated.clinicalEvents);
 const changes=JSON.stringify(generated.knowledgeState)!==JSON.stringify(previous.knowledgeState||initialKnowledgeState());
 const history=next.hypothesisHistory||previous.hypothesisHistory||[];
 const hypothesisHistory=changes&&next.day>previous.day&&!history.some(e=>e.day===next.day)?[...history,{day:next.day,...generated.knowledgeState}]:history;
 const notes=generated.clinicalEvents.filter(e=>['CLINICAL','ANATOMY','IMMUNE','ALERT'].includes(e.type));
 const bulletins=generated.clinicalEvents.filter(e=>['BULLETIN','PUBLIC_HEALTH'].includes(e.type));
 const result={...next,clinicalEvents,importantEvents:clinicalEvents.filter(e=>['IMPORTANT','CRITICAL'].includes(e.severity)),knowledgeState:generated.knowledgeState,hypothesisHistory,currentDiagnosis:generated.knowledgeState.currentHypothesis,diagnosisConfidence:generated.knowledgeState.confidence,doctorNotes:mergeCaseEvents(next.doctorNotes||[],notes),bulletinHistory:mergeCaseEvents(next.bulletinHistory||[],bulletins),events:mergeCaseEvents(next.events||[],generated.clinicalEvents)};
 if(result.timeline?.length)result.timeline=result.timeline.map(point=>point.day===result.day?{...point,knowledgeState:generated.knowledgeState}:point);
 return result;
}
export const CaseEventEngine=Object.freeze({generate:generateClinicalEvents,initialize:initializeCaseNarrative,apply:applyCaseNarrative});