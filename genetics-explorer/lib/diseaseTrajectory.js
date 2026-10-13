/** Fractional teaching-time trajectories, not clinical time or prognosis. */
const mechanismOf=p=>p.mechanism||({viral:'infectious/viral',bacterial:'infectious/bacterial',mixed:'infectious/mixed'}[p.category])||p.category;
const bounded=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
const metric=v=>Math.round(Math.max(0,Math.min(100,v))*10)/10;
const smooth=v=>{const t=bounded(v);return t*t*(3-2*t);};
const empty={pathogenLoad:0,infectedCells:0,innateImmunity:0,adaptiveImmunity:0,antibodyLevel:0,inflammation:0,tissueDamage:0};
function fraction(day,duration){return bounded(day/Math.max(1,duration));}
export function courseActivity(profile,day,duration){
 const p=profile.trajectory;if(!p)return null;
 const t=fraction(day,duration),baseline=bounded(p.baseline??.08),onset=bounded(p.onset??.12),peak=Math.max(onset+.02,p.peak??.38),recovery=Math.max(peak+.02,p.recovery??.95),rate=Number.isFinite(p.progressionRate)?p.progressionRate:.3;
 let activity;
 switch(p.mode){
 case 'progressive':{
  // Curated onset delays the acceleration; peak controls its shape, not recovery.
  const elapsed=bounded((t-onset)/Math.max(.05,1-onset));
  activity=baseline+Math.pow(elapsed,1+peak)*rate;break;
 }
 case 'chronic':{
  // Persistent baseline remains; each profile's onset and plateau pace differ.
  const elapsed=Math.max(0,t-onset),pace=Math.max(.05,peak-onset);
  const settled=smooth(elapsed/pace);
  activity=baseline+rate*.38*settled*(.8+.2*t)+Math.sin(elapsed*Math.PI*2/pace)*.035*settled;break;
 }
 case 'relapsing':{const period=Math.max(.12,p.relapsePeriod??.38);const wave=(1-Math.cos((t-onset)*Math.PI*2/period))/2;activity=baseline+wave*.65+t*rate*.12;break;}
 case 'episodic':{const period=Math.max(.12,p.relapsePeriod??.3);const phase=((t-onset)%period+period)%period;const pulse=Math.exp(-Math.pow((phase-period*.25)/(period*.09),2));activity=baseline+pulse*.78;break;}
 default:activity=baseline+(t<=peak?smooth((t-onset)/(peak-onset)):1-smooth((t-peak)/(recovery-peak)))*.86;
 }
 return bounded(activity);
}
export function applyProfileTrajectory(previous,next){
 const profile=next.scenarioConfig;if(!profile.trajectory)return next;
 const p=profile.trajectory,day=next.day,duration=next.config.durationDays,t=fraction(day,duration),a=courseActivity(profile,day,duration),old=previous.metrics;
 const params=profile.educationalParameters||{},severity=bounded((params.severity??50)/100),damageRate=bounded((params.tissueDamage??35)/100),inflammationRate=bounded((params.inflammation??35)/100);
 const family=profile.family||'';
 // Family composition describes mechanisms, never a disease-ID switch or clinical coefficient.
 const toxinDriven=/toxin/.test(family),immuneTargeting=/immune-targeting/.test(family),neurotropic=/neurotropic|neuroinvasive/.test(family);
 const hematologic=/hematologic/.test(family);
 const inheritedMetabolic=/metabol|enzyme/.test(family);
 const connective=/connective/.test(family);
 const channel=/channel/.test(family);
 const neurodegenerative=/neurodegeneration|motor-neuro/.test(family);
 const seedMix=Math.imul((next.seed^Math.imul(day+1,2654435761))>>>0,2246822507)>>>0;
 const variation=(seedMix%1000)/1000-.5;
 const support=previous.interventions.some(i=>i.kind==='support'&&day-i.day<=3);
 const boost=previous.interventions.some(i=>i.kind==='immune'&&day-i.day<=3);
 const containment=previous.interventions.some(i=>i.kind==='containment'&&day-i.day<=3);
 const rate=Number.isFinite(p.progressionRate)?p.progressionRate:.3;
 const m={...empty};const mechanism=mechanismOf(profile);
 if(mechanism.startsWith('infectious/')){
  const delayed=bounded((t-(p.immuneDelay??.16))/.5),immune=Number.isFinite(profile.immuneRate)?profile.immuneRate:1;
  // Chronic courses keep a reservoir-like abstract burden, never automatic acute clearance.
  m.pathogenLoad=metric((old.pathogenLoad||0)*.18+a*(60+severity*25)*(profile.growth??1.2)/1.2-(containment?2:0)-(boost?delayed*1.5:0)+variation*.4);
  m.infectedCells=toxinDriven?0:metric((old.infectedCells||0)*.25+m.pathogenLoad*.5);
  m.innateImmunity=metric(a*45*immune+(boost?4:0));
  m.adaptiveImmunity=metric(delayed*60*immune*(immuneTargeting?1-a*.7:1)+(boost?3:0));
  m.antibodyLevel=metric(smooth((t-(p.immuneDelay??.16)-.1)/.55)*65*immune*(immuneTargeting?1-a*.35:1));
  if(toxinDriven||neurotropic)m.neuralFunction=metric(100-a*(toxinDriven?48:66));
  m.inflammation=metric(a*(22+inflammationRate*48)+m.innateImmunity*.18);
 }else if(mechanism==='autoimmune'){
  m.autoimmuneActivity=metric(a*(45+severity*45)+(boost?3:0));m.inflammation=metric(m.autoimmuneActivity*(.42+inflammationRate*.4));
 }else if(mechanism==='metabolic'){
  m.metabolicImbalance=metric((old.metabolicImbalance||20)*.22+a*(45+severity*45)-(support?1.5:0));m.inflammation=metric(a*inflammationRate*27);
 }else if(mechanism==='neurological'){
  m.neuralFunction=metric(100-a*(30+severity*55));m.inflammation=metric(a*inflammationRate*24);
 }else if(mechanism==='genetic'){
  const proteinBaseline=profile.proteinBaseline??55;
  const functionalLoss=inheritedMetabolic?23:connective?12:channel?16:neurodegenerative?21:18;
  m.proteinFunction=metric(proteinBaseline-rate*t*functionalLoss-a*damageRate*(inheritedMetabolic?9:6));m.inflammation=metric(a*inflammationRate*(connective?16:25));
 }else if(mechanism==='oncology'){
  m.tumorBurden=metric((old.tumorBurden??16)+rate*(.7+severity)*(hematologic?1.9:1.6)+a*(hematologic?.6:.45));m.inflammation=metric(a*inflammationRate*(hematologic?35:28));
 }
 const stress=a*damageRate*(p.mode==='acute'?.6:.8)+(mechanism==='oncology'?m.tumorBurden*.009:0);
 m.tissueDamage=metric((old.tissueDamage||0)+stress-(support?.32:0)-(p.mode==='acute'&&t>(p.recovery??.9)?.6:0));
 const windows=profile.symptomTimeline||[];
 let symptoms=windows.filter(w=>t>=w.start&&t<=w.end&&a>=bounded(w.minActivity??0)).map(w=>w.symptom);
 if(!windows.length){symptoms=t<(p.onset??.1)?[]:(profile.typicalSymptoms||[]).slice(0,1+Math.floor(t*3));}
 // Preserve this deliberately atypical legacy teaching observation exactly.
 if(profile.id==='atypical-influenza'&&next.symptoms.includes('Gastrointestinal belirtiler'))symptoms.push('Gastrointestinal belirtiler');
 symptoms=[...new Set(symptoms)];if(!symptoms.length)symptoms=['Bu adımda belirgin semptom gözlenmiyor'];
 const finalOutcome=next.finalOutcome?{...next.finalOutcome,label:p.mode==='acute'?'Akut yanıt ve toparlanma gözlemi tamamlandı':p.mode==='episodic'?'Ataklar arası ve atak dönemi karşılaştırıldı':p.mode==='relapsing'?'Alevlenme ve sakin dönemler karşılaştırıldı':'Süreğen mekanizma gözlemi tamamlandı',summary:'Son adım hastalığın iyileştiği anlamına gelmez. Süre ve sonuçlar soyut eğitim katsayılarıdır; klinik prognoz veya tedavi başarısı hesaplanmaz.'}:null;
 return {...next,metrics:m,symptoms,finalOutcome,currentDiagnosis:'Profil mekanizması ve güncel gözlem bulguları karşılaştırılıyor',diagnosisConfidence:0,doctorNotes:previous.doctorNotes,events:previous.events,bulletinHistory:previous.bulletinHistory};
}
export function getProfileOrganEffects(profile,metrics,day=0,duration=14){
 const trajectory=profile.organEffectTimeline;if(!trajectory?.length)return [];
 const t=fraction(day,duration),activity=courseActivity(profile,day,duration)??bounded(Math.max(metrics.pathogenLoad||0,metrics.autoimmuneActivity||0,metrics.metabolicImbalance||0,metrics.tumorBurden||0,100-(metrics.neuralFunction??100),metrics.tissueDamage||0)/100);
 return trajectory.filter(w=>t>=w.start&&t<=w.end).map(w=>({organ:w.organ,structureIds:[...(w.structureIds||[])],role:w.role||'primary',severity:bounded(activity*(w.weight??1)+bounded((metrics.tissueDamage||0)/100)*.15),active:true}));
}