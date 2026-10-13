import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation } from '../lib/simulation.js';
import { createSnapshot,restoreSnapshot } from '../services/savedCases.js';
const observation={id:'lab-0',day:0,type:'LAB',severity:'IMPORTANT',title:'Model yükü',text:'Başlangıç gözlemi',relatedMetric:'pathogenLoad',metricValue:18,previousValue:15,delta:3,source:{title:'Model gözlemi'},educationalNote:'Klinik test değildir.'};
const hypothesis={currentHypothesis:'Solunum ağırlıklı model hipotezi',confidence:40,supportingEvidence:['Öksürük'],conflictingEvidence:[],unknowns:['Etken bilinmiyor']};
test('typed narrative and hypothesis timelines round-trip without flattening bulletins',()=>{
 const state=createSimulation('influenza');state.clinicalEvents=[observation];state.importantEvents=[observation];state.knowledgeState=hypothesis;state.hypothesisHistory=[{day:0,...hypothesis}];state.bulletinHistory=[{...observation,id:'news-0',type:'BULLETIN'}];state.timeline[0].knowledgeState=hypothesis;state.doctorNotes=[{...observation,type:'CLINICAL',id:'doctor-0'}];state.events=[{...observation,type:'ANATOMY',id:'organ-0'}];
 const saved=createSnapshot(state);assert.deepEqual(restoreSnapshot(JSON.parse(JSON.stringify(saved))),saved);assert.deepEqual(saved.clinicalEvents[0],observation);assert.deepEqual(saved.doctorNotes,state.doctorNotes);assert.deepEqual(saved.events,state.events);assert.deepEqual(saved.timeline[0].knowledgeState,hypothesis);
 state.clinicalEvents[0].text='Mutated';assert.notEqual(saved.clinicalEvents[0].text,'Mutated');
});
test('legacy narrative fields migrate additively and corrupt typed events remain rejected',()=>{
 const legacy=createSimulation('influenza');delete legacy.clinicalEvents;delete legacy.importantEvents;delete legacy.knowledgeState;delete legacy.hypothesisHistory;
 const migrated=createSnapshot(legacy);assert.deepEqual(migrated.clinicalEvents,[]);assert.equal(migrated.knowledgeState,null);assert.deepEqual(restoreSnapshot(migrated),migrated);
 assert.throws(()=>createSnapshot({...legacy,clinicalEvents:[{...observation,type:'DIAGNOSE'}]}));
 assert.throws(()=>createSnapshot({...legacy,clinicalEvents:[{...observation,delta:Infinity}]}));
 assert.throws(()=>createSnapshot({...legacy,clinicalEvents:[observation,observation]}));
 assert.throws(()=>createSnapshot({...legacy,clinicalEvents:[{...observation,day:1}]}));
});
