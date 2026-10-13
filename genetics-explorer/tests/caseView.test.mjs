import test from 'node:test';import assert from 'node:assert/strict';
import {getCaseAtDay} from '../lib/caseView.js';
test('historical projection shows only then-known evidence and leaves live state untouched',()=>{
 const early={currentHypothesis:'Solunum bulguları',confidence:48,supportingEvidence:['Öksürük'],conflictingEvidence:[],unknowns:['Seyir']};
 const late={...early,confidence:28,conflictingEvidence:['Yeni GI bulgusu']};
 const state={day:4,knowledgeState:late,metrics:{inflammation:25},timeline:[{day:0,metrics:{inflammation:1}},{day:2,metrics:{inflammation:8},symptoms:['Öksürük'],knowledgeState:early},{day:4,metrics:{inflammation:25},symptoms:['Öksürük','İshal'],knowledgeState:late}],clinicalEvents:[{day:2,text:'Öksürük'},{day:4,text:'İshal'}],importantEvents:[{day:4,text:'GI'}],hypothesisHistory:[{day:2,...early},{day:4,...late}],doctorNotes:[{day:2,text:'Solunum'},{day:4,text:'GI'}],bulletinHistory:[{day:4,text:'GI'}],events:[],interventions:[{day:3,kind:'support'}],publicHealthDecisions:[{day:3,kind:'care'}],finalOutcome:{day:4},running:true,paused:false,status:'running'};
 const original=JSON.stringify(state);const viewed=getCaseAtDay(state,2);
 assert.equal(viewed.metrics.inflammation,8);assert.deepEqual(viewed.symptoms,['Öksürük']);assert.equal(viewed.knowledgeState.confidence,48);assert.deepEqual(viewed.knowledgeState.conflictingEvidence,[]);assert.equal(viewed.clinicalEvents.length,1);assert.equal(viewed.bulletinHistory.length,0);assert.equal(viewed.interventions.length,0);assert.equal(viewed.publicHealthDecisions.length,0);assert.equal(viewed.finalOutcome,null);assert.equal(JSON.stringify(state),original);
 assert.equal(getCaseAtDay(state,4),state);assert.equal(getCaseAtDay(state,99),state);
});
test('legacy historical records never fall back to future live hypothesis',()=>{
 const state={day:4,currentDiagnosis:'Yeni GI',diagnosisConfidence:70,knowledgeState:{currentHypothesis:'Gelecek',confidence:70},timeline:[{day:1,currentDiagnosis:'İlk gözlem',diagnosisConfidence:15}],hypothesisHistory:[]};
 const viewed=getCaseAtDay(state,1);assert.equal(viewed.knowledgeState.currentHypothesis,'İlk gözlem');assert.equal(viewed.knowledgeState.confidence,15);
});
