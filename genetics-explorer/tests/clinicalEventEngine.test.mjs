import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,advanceSimulation,applyIntervention} from '../lib/simulation.js';
import {generateClinicalEvents,applyCaseNarrative,EVENT_TYPES,EVENT_SEVERITIES} from '../lib/CaseEventEngine.js';
import {enrichObservations,applyPublicHealthDecision} from '../lib/outbreak.js';
const run=(id,day)=>{let s=createSimulation(id,{seed:812,durationDays:14});for(let i=0;i<day;i++)s=advanceSimulation(s);return s;};
const stub=(day,extra={})=>({day,config:{durationDays:14},scenarioConfig:{mechanism:'infectious/viral',contagious:true,publicSpreadApplicable:true},metrics:{pathogenLoad:12,inflammation:5,tissueDamage:0,adaptiveImmunity:0},symptoms:[],events:[],doctorNotes:[],bulletinHistory:[],clinicalEvents:[],interventions:[],publicHealthDecisions:[],timeline:[],...extra});
test('actual early respiratory evidence establishes a tentative hypothesis and day-four GI contradicts it',()=>{
 const first=run('atypical-influenza',1),second=advanceSimulation(first),third=advanceSimulation(second),fourth=advanceSimulation(third);
 assert.ok(first.symptoms.includes('Öksürük'));assert.ok(first.clinicalEvents.some(e=>e.type==='CLINICAL'&&e.text.includes('Öksürük')));
 assert.ok(second.knowledgeState.currentHypothesis.includes('Solunum'));assert.equal(second.knowledgeState.confidence,55);
 assert.ok(fourth.knowledgeState.confidence<third.knowledgeState.confidence);assert.ok(fourth.knowledgeState.conflictingEvidence.some(s=>/gastrointestinal/i.test(s)));
 assert.ok(fourth.clinicalEvents.some(e=>e.day===4&&e.type==='CLINICAL'&&e.severity==='IMPORTANT'));
 assert.equal(fourth.timeline.find(p=>p.day===2).knowledgeState.confidence,second.knowledgeState.confidence);
 assert.ok(fourth.hypothesisHistory.some(p=>p.day===4));assert.equal(second.knowledgeState.conflictingEvidence.length,0);
});
test('public bulletin triggers use true model deltas, load/capacity crossing and non-spreading guards',()=>{
 const before=stub(2),next=stub(3);
 const opts={previousOutbreak:{spread:20,hospitalLoad:79,hospitalCapacity:100,hospitalPressure:20},nextOutbreak:{contagious:true,spread:28,hospitalLoad:81,hospitalCapacity:100,hospitalPressure:40}};
 const events=generateClinicalEvents(before,next,opts).clinicalEvents;
 assert.ok(events.some(e=>e.type==='BULLETIN'&&e.relatedMetric==='spread'&&e.delta===8));
 assert.ok(events.some(e=>e.type==='BULLETIN'&&e.severity==='CRITICAL'&&e.relatedMetric==='hospitalOccupancy'&&e.metricValue===81));
 const falling=generateClinicalEvents(next,stub(4),{previousOutbreak:{spread:28},nextOutbreak:{contagious:true,spread:23,hospitalPressure:40}}).clinicalEvents;
 assert.ok(falling.some(e=>e.type==='PUBLIC_HEALTH'&&e.id.includes('slowdown')));
 for(const profile of [{mechanism:'genetic',contagious:false},{mechanism:'infectious/viral',contagious:true,spreadMode:'route-specific'},{mechanism:'infectious/bacterial',contagious:true,publicSpreadApplicable:false}]){
  const blocked=generateClinicalEvents(before,stub(3,{scenarioConfig:profile}),opts).clinicalEvents;
  assert.ok(!blocked.some(e=>e.type==='PUBLIC_HEALTH'||e.id.includes('population')));
 }
});
test('laboratory observations report absolute model units and signed deltas, not invented clinical measurements',()=>{
 const before=stub(1),next=stub(2,{metrics:{pathogenLoad:29,inflammation:12,tissueDamage:21,adaptiveImmunity:9}});
 const events=generateClinicalEvents(before,next).clinicalEvents;
 const lab=events.find(e=>e.type==='LAB'&&e.relatedMetric==='pathogenLoad');
 assert.equal(lab.metricValue,29);assert.equal(lab.previousValue,12);assert.equal(lab.delta,17);assert.ok(lab.text.includes('model birimi'));assert.ok(!lab.text.includes('%'));
 assert.ok(events.some(e=>e.type==='IMMUNE'));assert.ok(events.some(e=>e.type==='ALERT'&&e.severity==='IMPORTANT'));
 for(const e of events){assert.ok(EVENT_TYPES.includes(e.type));assert.ok(EVENT_SEVERITIES.includes(e.severity));assert.ok(e.educationalNote);assert.ok(!Object.values(e).includes(undefined));}
});
test('typed narrative, hypotheses and timelines resume deterministically after JSON roundtrip without duplicates',()=>{
 const state=run('atypical-influenza',4),restored=JSON.parse(JSON.stringify(state));
 assert.deepEqual(advanceSimulation(restored),advanceSimulation(state));
 const before=run('atypical-influenza',3),enriched=enrichObservations(before,state);
 assert.deepEqual(enrichObservations(before,enriched),enriched);
 assert.equal(new Set(enriched.clinicalEvents.map(e=>e.id)).size,enriched.clinicalEvents.length);
 assert.ok(enriched.importantEvents.every(e=>['IMPORTANT','CRITICAL'].includes(e.severity)));
 assert.ok(enriched.clinicalEvents.every(e=>!e.text.includes('Atipik influenza')));
});
test('interventions and public decisions generate immediate stable events without altering knowledge confidence',()=>{
 const state=run('influenza',2),changed=applyIntervention(state,'support');
 assert.ok(changed.clinicalEvents.some(e=>e.id.includes('intervention:support')&&e.day===2));
 assert.deepEqual(changed.knowledgeState,state.knowledgeState);
 const next=advanceSimulation(changed);assert.equal(next.clinicalEvents.filter(e=>e.id.includes('intervention:support')).length,1);
 const publicState=applyPublicHealthDecision(state,'care');assert.ok(publicState.clinicalEvents.some(e=>e.type==='PUBLIC_HEALTH'&&e.id.includes('decision:care')));
 assert.deepEqual(applyPublicHealthDecision(publicState,'care'),publicState);
});
test('all mechanism families receive observed metric narratives without hidden profile identity',()=>{
 for(const id of ['influenza','tetanus','cystic-fibrosis','lupus','type2-diabetes','alzheimer','lung-cancer']){
  const state=run(id,7);assert.ok(state.clinicalEvents.some(e=>e.type==='LAB'),id);
  assert.ok(!state.currentDiagnosis.includes(state.scenarioConfig.name),id);
  assert.ok(state.clinicalEvents.every(e=>!JSON.stringify(e).includes('https://')),id);
 }
 const previous=stub(2),next=stub(3,{symptoms:['Öksürük'],organEffects:{lungs:.7}});
 const applied=applyCaseNarrative(previous,next);assert.ok(applied.clinicalEvents.some(e=>e.type==='ANATOMY'&&e.relatedOrgan==='lungs'));
});