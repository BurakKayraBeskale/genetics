import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SCENARIOS,createSimulation,advanceSimulation } from '../lib/simulation.js';
import { getAnatomyProfileSeverities } from '../lib/anatomyProfileEffects.js';
const nodes=JSON.parse(fs.readFileSync(new URL('../lib/anatomyAssetManifest.json',import.meta.url))).nodes;
function run(id,day){let s=createSimulation(id,{durationDays:14,seed:812});for(let i=0;i<day;i++)s=advanceSimulation(s);return s;}
test('influenza begins in actual bronchi while lung parenchyma follows its secondary window',()=>{
 const profile=SCENARIOS.find(p=>p.id==='influenza');
 const early=run('influenza',2),initial=getAnatomyProfileSeverities(profile,early.metrics,2,14,nodes);
 assert.ok(initial.HRA_bronchi>0);assert.equal(initial.HRA_left_lung,0);assert.equal(initial.HRA_right_lung,0);
 const late=run('influenza',7),later=getAnatomyProfileSeverities(profile,late.metrics,7,14,nodes);
 assert.ok(later.HRA_left_lung>0);assert.ok(later.HRA_bronchi>=later.HRA_left_lung);
});
test('microscopic intestine context never colors liver and unsupported targets never color another organ',()=>{
 const profile={trajectory:{mode:'chronic',baseline:.4,progressionRate:.2,onset:0,peak:.5},organEffectTimeline:[{organ:'digestive',structureIds:['intestinal-epithelium'],start:0,end:1,weight:.85}]};
 const colors=getAnatomyProfileSeverities(profile,{tissueDamage:10},5,14,nodes);
 assert.ok(colors.HRA_colon>0);assert.ok(colors.HRA_small_intestine>0);assert.ok(colors.HRA_duodenum>0);assert.equal(colors.HRA_liver,0);assert.equal(colors.BodyParts3D_stomach,0);
 const missing={...profile,organEffectTimeline:[{organ:'endocrine',structureIds:['thyroid'],start:0,end:1,weight:.85}]};
 const absent=getAnatomyProfileSeverities(missing,{},5,14,nodes);assert.ok(Object.values(absent).every(value=>value===0));
 const noTargets=getAnatomyProfileSeverities({...profile,organEffectTimeline:[]},{},5,14,nodes);assert.ok(Object.values(noTargets).every(value=>value===0));
 const stomach=getAnatomyProfileSeverities({...profile,organEffectTimeline:[{organ:'digestive',structureIds:['stomach'],start:0,end:1,weight:.85}]},{},5,14,nodes);assert.ok(stomach.BodyParts3D_stomach>0);assert.equal(stomach.HRA_liver,0);
});