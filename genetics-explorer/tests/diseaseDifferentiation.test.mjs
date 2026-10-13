import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, advanceSimulation, SCENARIOS } from '../lib/simulation.js';
import { createSnapshot, restoreSnapshot } from '../services/savedCases.js';
import { computeOutbreak } from '../lib/outbreak.js';
import { courseActivity, getProfileOrganEffects } from '../lib/diseaseTrajectory.js';
const ids=['influenza','norovirus','pneumonia','meningitis-like','sickle-cell','cystic-fibrosis','huntington','lupus','type2-diabetes','lung-cancer'];
function advance(id,day){let state=createSimulation(id,{seed:812,durationDays:14});for(let i=0;i<day;i++)state=advanceSimulation(state);return state;}
test('ten source-backed profiles produce differentiated bounded courses and deterministic snapshot continuation',()=>{
 const signatures=new Set(),symptomSets=new Set(),noteSets=new Set(),targetSets=new Set();
 for(const id of ids){
  const profile=SCENARIOS.find(p=>p.id===id);assert.ok(profile.trajectory,`${id} trajectory`);
  const mid=advance(id,7),resumed=advanceSimulation(restoreSnapshot(createSnapshot(mid)));
  assert.deepEqual(resumed,advanceSimulation(mid));
  const end=advance(id,14);assert.ok(Object.values(end.metrics).every(v=>Number.isFinite(v)&&v>=0&&v<=100),id);
  signatures.add(JSON.stringify(end.metrics));symptomSets.add(JSON.stringify(end.timeline.map(p=>p.symptoms)));noteSets.add(JSON.stringify(end.doctorNotes.map(n=>n.text)));targetSets.add(JSON.stringify(profile.organEffectTimeline.map(w=>[w.organ,w.structureIds])));
  assert.equal(profile.dnaRelation.kind,profile.category==='genetic'?'direct-genetic':profile.category==='oncology'?'indirect':profile.mechanism.startsWith('infectious')?'response':'indirect');
  if(!profile.mechanism.startsWith('infectious'))assert.equal(computeOutbreak(end).activeCases,0);
  assert.ok(end.doctorNotes.some(n=>n.id),`${id} event-derived observations`);
  const tagged=end.doctorNotes.filter(n=>n.id).map(n=>n.id);assert.equal(new Set(tagged).size,tagged.length,`${id} duplicate observations`);
  if(!profile.mechanism.startsWith('infectious/'))assert.equal(end.metrics.pathogenLoad,0,id);
  assert.deepEqual(advance(id,7),mid,id);
 }
 assert.equal(signatures.size,ids.length,'Representative profiles must not share the same final metric vector');
 assert.ok(symptomSets.size>=8);assert.equal(noteSets.size,ids.length);assert.ok(targetSets.size>=6);
});
test('acute, chronic, progressive and episodic trajectories preserve their distinct educational time shapes',()=>{
 const profile=mode=>({trajectory:{mode,onset:.05,peak:.3,recovery:.8,baseline:.12,progressionRate:.4,relapsePeriod:.3}});
 assert.ok(courseActivity(profile('acute'),5,14)>courseActivity(profile('acute'),14,14));
 assert.ok(courseActivity(profile('progressive'),14,14)>courseActivity(profile('progressive'),2,14));
 assert.ok(courseActivity(profile('chronic'),14,14)>.12,'Chronic course does not auto-clear');
 const episodic=Array.from({length:15},(_,day)=>courseActivity(profile('episodic'),day,14));assert.ok(Math.max(...episodic)-Math.min(...episodic)>.5);
});
test('symptoms and organ effects respect normalized time windows and actual anatomical target IDs',()=>{
 for(const id of ids){
  const profile=SCENARIOS.find(p=>p.id===id);
  for(const day of [0,2,7,12,14]){
   const state=advance(id,day),effects=getProfileOrganEffects(profile,state.metrics,day,14);
   for(const effect of effects){
    assert.ok(effect.severity>=0&&effect.severity<=1,id);assert.ok(Array.isArray(effect.structureIds),id);
    assert.ok(profile.organEffectTimeline.some(w=>w.organ===effect.organ&&day/14>=w.start&&day/14<=w.end),`${id} active organ window`);
   }
   for(const symptom of state.symptoms){
    if(!profile.typicalSymptoms.includes(symptom))continue;
    assert.ok(profile.symptomTimeline.some(w=>w.symptom===symptom&&day/14>=w.start&&day/14<=w.end),`${id} symptom time window`);
   }
  }
 }
});
test('all catalog cases have distinct phenotypes and no identical metric course across different families',()=>{
 const courses=new Map(),phenotypes=new Set();
 for(const profile of SCENARIOS){
  let state=createSimulation(profile.id,{seed:812,durationDays:14});
  const observations=[];
  for(let day=0;day<=14;day++){
   observations.push({metrics:state.metrics,symptoms:state.symptoms,organs:getProfileOrganEffects(profile,state.metrics,day,14)});
   if(day<14)state=advanceSimulation(state);
  }
  const metricCourse=JSON.stringify(observations.map(o=>o.metrics));
  const previous=courses.get(metricCourse);
  assert.ok(!previous||previous.family===profile.family,'Identical courses across families: '+previous?.id+' / '+profile.id);
  courses.set(metricCourse,{id:profile.id,family:profile.family});
  const fingerprint=JSON.stringify({mechanism:profile.mechanism,observations,spread:profile.publicSpreadApplicable,dna:profile.dnaRelation.kind});
  assert.ok(!phenotypes.has(fingerprint),'Duplicated phenotype: '+profile.id);
  phenotypes.add(fingerprint);
 }
 assert.equal(phenotypes.size,SCENARIOS.length);
});
