import test from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,advanceSimulation} from '../lib/simulation.js';
import {buildCaseReport} from '../lib/caseReport.js';
test('report derives bounded historical peaks and event-linked explanation, excluding future data',()=>{
 let state=createSimulation('influenza');for(let i=0;i<5;i++)state=advanceSimulation(state);
 state.clinicalEvents=[{id:'immune-2',day:2,type:'IMMUNE',severity:'IMPORTANT',title:'Yanıt değişimi',text:'Bağışıklık göstergesi arttı.'},{id:'future',day:5,type:'LAB',severity:'IMPORTANT',title:'Gelecek',text:'Gelecek veri'}];
 state.hypothesisHistory=[{day:1,currentHypothesis:'Solunum hipotezi',confidence:50},{day:4,currentHypothesis:'Karma bulgular',confidence:35}];
 state.metrics.neuralFunction=35;state.finalOutcome={day:5,label:'Tamam',summary:'Yalnız son güne ait sonuç'};
 const report=buildCaseReport(state,{day:3});assert.equal(report.peakDiseaseMetric.key,'pathogenLoad');assert.ok(!report.educationalOutcome.includes('Yalnız son güne')); assert.equal(report.day,3);assert.equal(report.milestones.length,1);assert.ok(report.causalExplanation.every(e=>e.day<=3));assert.equal(report.hypothesisChanges.length,1);
 assert.equal(report.peakInflammation.value,Math.max(...state.timeline.filter(p=>p.day<=3).map(p=>p.metrics.inflammation)));assert.match(report.causalDisclaimer,/kanıtı değildir/);
});
test('mystery report omits ground truth names and noninfectious population impact',()=>{
 const state=createSimulation('cystic-fibrosis');state.hypothesisHistory=[{day:0,currentHypothesis:'Kistik fibrozis gözlemi',confidence:20}];state.clinicalEvents=[{id:'x',day:0,type:'CLINICAL',severity:'IMPORTANT',title:'Kistik fibrozis',text:'cystic-fibrosis'}];
 const report=buildCaseReport(state,{hiddenProfile:true});assert.ok(!JSON.stringify(report).includes('Kistik fibrozis'));assert.ok(!JSON.stringify(report).includes('cystic-fibrosis'));assert.equal(report.maxPopulationImpact.applicable,false);
});
