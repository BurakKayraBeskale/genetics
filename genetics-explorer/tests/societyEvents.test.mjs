import test from 'node:test';import assert from 'node:assert/strict';
import {generateClinicalEvents,applyCaseNarrative} from '../lib/CaseEventEngine.js';
const state=day=>({day,scenarioConfig:{mechanism:'infectious/viral',contagious:true,publicSpreadApplicable:true},config:{durationDays:14},metrics:{pathogenLoad:20,inflammation:5},symptoms:[],clinicalEvents:[],importantEvents:[],doctorNotes:[],bulletinHistory:[],events:[],interventions:[],publicHealthDecisions:[]});
test('active percentage and observed decision effects emit deterministic bulletin entries once',()=>{
 const before=state(2),next=state(3);const options={previousOutbreak:{population:10000,activeCases:1000,spread:40},nextOutbreak:{contagious:true,population:10000,activeCases:1600,spread:42,decisionFeedback:[{kind:'isolation',day:2,label:'İzolasyon',status:'active',effectStartDay:3,observedImpact:'Kararsız modelle karşılaştırıldığında yayılım baskısı azaldı.'}]}};
 const observed=applyCaseNarrative(before,next,options);
 assert.ok(observed.bulletinHistory.some(e=>e.relatedMetric==='sickPercent'&&e.metricValue===16&&e.delta===6));assert.ok(observed.clinicalEvents.some(e=>e.id.includes('population:effect:isolation:2')&&e.day===3));assert.deepEqual(applyCaseNarrative(before,observed,options),observed);
 const pending={...options,nextOutbreak:{...options.nextOutbreak,decisionFeedback:[{...options.nextOutbreak.decisionFeedback[0],status:'pending',effectStartDay:4}]}};assert.ok(!generateClinicalEvents(before,next,pending).clinicalEvents.some(e=>e.id.includes('population:effect:')));
});
test('a first observed decline produces slowdown and malformed noncontagious flags cannot generate outbreak bulletins',()=>{
 const opts={previousOutbreak:{spread:42,spreadDelta:2,hospitalLoad:79,hospitalCapacity:100},nextOutbreak:{contagious:true,spread:41,hospitalLoad:81,hospitalCapacity:100}};
 const events=generateClinicalEvents(state(2),state(3),opts).clinicalEvents;assert.ok(events.some(e=>e.type==='BULLETIN'&&e.id.includes('slowdown')));assert.ok(events.some(e=>e.type==='BULLETIN'&&e.relatedMetric==='hospitalOccupancy'&&e.metricValue===81));
 for(const category of ['genetic','autoimmune','metabolic','oncology']){const next={...state(3),scenarioConfig:{mechanism:category,contagious:true}};assert.ok(!generateClinicalEvents(state(2),next,opts).clinicalEvents.some(e=>e.id.includes('population:')));}
});
