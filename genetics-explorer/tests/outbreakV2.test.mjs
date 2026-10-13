import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,advanceSimulation} from '../lib/simulation.js';
import {computeOutbreak,applyPublicHealthDecision} from '../lib/outbreak.js';
import {deriveSocietyView} from '../lib/societyView.js';
import {analyzeOutbreak} from '../lib/outbreakAnalysis.js';
import {getCaseAtDay} from '../lib/caseView.js';
const advance=(state,n)=>{for(let i=0;i<n;i++)state=advanceSimulation(state);return state;};
test('five compartments conserve population and active sick shares can exceed the former 25 percent cap',()=>{
 const initial=createSimulation();const profile={...initial.scenarioConfig,educationalParameters:{...initial.scenarioConfig.educationalParameters,transmissionTendency:100}};
 const high=computeOutbreak(advance(createSimulation('influenza',{seed:812},profile),14));
 assert.ok(high.history.some(p=>p.activeCases/high.population>.25));
 for(const point of high.history){assert.equal(point.healthyCases+point.exposedCases+point.sickCases+point.severeCases+point.recovered,point.population);assert.equal(point.activeCases,point.sickCases+point.severeCases);assert.ok(point.severeCases<=point.activeCases);assert.equal(point.hospitalLoad,point.severeCases);}
 assert.ok(high.history.some(p=>p.hospitalOccupancy>100));
 for(const cases of [100,300]){const view=deriveSocietyView({population:1000,activeCases:cases,severeCases:0,exposedCases:0,contagious:true});assert.equal(view.sickPercent,cases/10);assert.equal(Object.values(view.counts).reduce((n,v)=>n+v,0),10);}
});
test('strict eligible infectious flag guards all non-spreading and malformed profiles',()=>{
 for(const profile of [{mechanism:'genetic',category:'viral',contagious:true},{mechanism:'oncology',contagious:true},{mechanism:'infectious/unknown',contagious:true},{mechanism:'infectious/viral',contagious:false},{mechanism:'infectious/viral',contagious:true,spreadMode:'route-specific'}]){
  const outbreak=computeOutbreak({...createSimulation(),scenarioConfig:profile});assert.equal(outbreak.activeCases,0);assert.equal(outbreak.healthyCases,outbreak.population);assert.equal(deriveSocietyView(outbreak).sickPercent,0);
 }
});
test('decisions are pending on their day, active next day and deterministic without altering biological metrics',()=>{
 const before=advance(createSimulation(),3),policy=applyPublicHealthDecision(before,'isolation');
 const original=computeOutbreak(before),pending=computeOutbreak(policy);assert.equal(pending.spread,original.spread);assert.equal(pending.activeCases,original.activeCases);assert.equal(pending.decisionFeedback.at(-1).status,'pending');
 const without=advanceSimulation(before),withPolicy=advanceSimulation(policy),active=computeOutbreak(withPolicy);
 assert.equal(active.decisionFeedback.at(-1).status,'active');assert.ok(active.spread<computeOutbreak(without).spread);assert.ok(active.newExposures<computeOutbreak(without).newExposures);assert.deepEqual(withPolicy.metrics,without.metrics);
 assert.deepEqual(computeOutbreak(JSON.parse(JSON.stringify(withPolicy))),active);
 const expired=computeOutbreak(advance(policy,5));assert.equal(expired.decisionFeedback.at(-1).status,'expired');
});
test('care changes capacity rather than exposure pressure and comparisons expose their model-only criterion',()=>{
 const before=advance(createSimulation(),4),policy=applyPublicHealthDecision(before,'care'),normal=computeOutbreak(advanceSimulation(before)),care=computeOutbreak(advanceSimulation(policy));
 assert.equal(care.spread,normal.spread);assert.equal(care.newExposures,normal.newExposures);assert.equal(care.hospitalCapacity,normal.hospitalCapacity+150);assert.ok(care.hospitalOccupancy<=normal.hospitalOccupancy);
 const analysis=analyzeOutbreak(advance(policy,3));assert.equal(analysis.baseline.day,analysis.current.day);assert.ok(analysis.marginalDecisions[0].criterion.includes('toplanamaz'));assert.ok(analysis.disclaimer.includes('Model içi'));assert.equal(analysis.summary.lastDecision.day,4);
});
test('stable cohort history and past-day replay exclude future policies without mutating the live state',()=>{
 const previous=advance(createSimulation(),2),policy=applyPublicHealthDecision(advance(previous,2),'care'),live=advance(policy,3),snapshot=JSON.stringify(live);
 const past=computeOutbreak(getCaseAtDay(live,2)),expected=computeOutbreak(previous);
 assert.deepEqual(past,expected);assert.equal(JSON.stringify(live),snapshot);
 const view=deriveSocietyView(computeOutbreak(live)),again=deriveSocietyView(computeOutbreak(JSON.parse(snapshot)));
 assert.deepEqual(view.personStates,again.personStates);assert.equal(new Set(view.personStates.map(p=>p.id)).size,10);assert.ok(view.personStates.every(p=>p.path.at(-1)===p.status));
 const old=deriveSocietyView(past);assert.equal(old.sickPercent,deriveSocietyView(expected).sickPercent);assert.ok(past.decisions.length===0);
});