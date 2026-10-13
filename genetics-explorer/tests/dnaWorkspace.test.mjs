import test from 'node:test';
import assert from 'node:assert/strict';
import {caseDNAWorkspaceKey,supportedCaseDNAPreset,dnaWorkspaceMode} from '../lib/dnaWorkspace.js';
import {createSimulation} from '../lib/simulation.js';
import {initialExperiment,editExperiment,sequenceOf} from '../lib/experiment.js';
test('case DNA identity ignores day and archive save but changes for a new-case epoch or seed',()=>{
 const state=createSimulation('influenza',{seed:812});const key=caseDNAWorkspaceKey(state,2);
 assert.equal(caseDNAWorkspaceKey({...state,day:7,activeCaseId:'saved-42'},2),key);
 assert.notEqual(caseDNAWorkspaceKey(state,3),key);
 assert.notEqual(caseDNAWorkspaceKey({...state,seed:813},2),key);
 assert.equal(dnaWorkspaceMode(null),'free');assert.equal(dnaWorkspaceMode('case'),'case');
});
test('only supported direct genetic cases receive an automatic preset; infection and virtual genomes remain unchanged',()=>{
 for(const id of ['sickle-cell','cystic-fibrosis','huntington','dmd'])assert.equal(supportedCaseDNAPreset(createSimulation(id).scenarioConfig)?.id,id);
 for(const id of ['influenza','hiv','hepatitis-b','type2-diabetes','lung-cancer','pku'])assert.equal(supportedCaseDNAPreset(createSimulation(id).scenarioConfig),null,id);
 const fake={id:'virtual-x',mechanism:'genetic',synthetic:true,dnaRelation:{kind:'direct-genetic',presetId:'sickle-cell'}};assert.equal(supportedCaseDNAPreset(fake),null);
});
test('independent free and case histories preserve AP damage, deletion and undo references without shared token mutation',()=>{
 const free=[initialExperiment()],caseHistory=[initialExperiment()];const originalCase=JSON.stringify(caseHistory);
 free.push(editExperiment(free.at(-1),{kind:'damage',id:'exon-1:4',side:0}));
 free.push(editExperiment(free.at(-1),{kind:'insert',id:'exon-1:5',side:0,base:'G',newId:'free:insert:1'}));
 assert.equal(JSON.stringify(caseHistory),originalCase);
 const freeBefore=JSON.stringify(free),preset=supportedCaseDNAPreset(createSimulation('cystic-fibrosis').scenarioConfig);
 for(const step of preset.steps)caseHistory.push(editExperiment(caseHistory.at(-1),step));
 assert.equal(caseHistory.at(-1).tokens.length,24);assert.equal(JSON.stringify(free),freeBefore);
 assert.equal(caseHistory.at(-2).tokens.length,25);assert.equal(free[1].tokens.find(t=>t.id==='exon-1:4').ap[0],true);
 assert.equal(caseHistory[0].tokens.find(t=>t.id==='exon-1:4').ap[0],false);
 assert.notEqual(sequenceOf(caseHistory.at(-1).tokens),sequenceOf(free.at(-1).tokens));
});