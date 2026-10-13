import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, DISEASE_PROFILES, LEGACY_SCENARIOS } from '../data/diseaseProfiles.js';
import { getStructure } from '../lib/anatomyHierarchy.js';
test('all 63 unchanged cases have source-linked coherent classroom trajectories',()=>{
 assert.equal(SCENARIOS.length,63);assert.equal(DISEASE_PROFILES.length,52);assert.equal(LEGACY_SCENARIOS.length,11);
 assert.equal(new Set(SCENARIOS.map(p=>p.id)).size,63);
 assert.ok(new Set(SCENARIOS.map(p=>p.family)).size>=30);
 assert.notEqual(SCENARIOS.find(p=>p.id==='pku').family,SCENARIOS.find(p=>p.id==='marfan').family);
 const tumors=SCENARIOS.filter(p=>p.mechanism==='oncology');assert.equal(new Set(tumors.map(p=>p.trajectory.progressionRate)).size,tumors.length);
 for(const p of SCENARIOS){
  assert.ok(p.family&&p.subtype&&p.onsetPattern&&p.progressionPattern&&p.recoveryPattern);
  assert.ok(p.sources.length&&p.immunePattern&&p.affectedTissues.length&&p.educationNotes.length);
  assert.ok(['direct-genetic','response','indirect','none'].includes(p.dnaRelation.kind));
  const t=p.trajectory;assert.ok(t.onset>=0&&t.onset<=t.peak&&t.peak<=t.recovery&&t.recovery<=1,p.id);
  for(const event of p.symptomTimeline)assert.ok(event.start>=0&&event.start<=event.end&&event.end<=1,p.id);
  for(const effect of p.organEffectTimeline){assert.ok(effect.start>=0&&effect.start<=effect.end&&effect.end<=1,p.id);for(const id of effect.structureIds)assert.ok(getStructure(effect.organ,id),`${p.id}:${id}`);}
 }
});
test('specific courses and DNA links avoid generic recovery or casual spread assumptions',()=>{
 const find=id=>SCENARIOS.find(p=>p.id===id);
 assert.deepEqual(find('influenza').typicalSymptoms,['Ateş','Öksürük','Halsizlik','Kas ağrısı']);
 assert.ok(LEGACY_SCENARIOS.every(p=>!p.typicalSymptoms.includes('Soyut organ yanıtı')));
 assert.ok(find('meningitis-like').sources.some(s=>s.url==='https://medlineplus.gov/meningitis.html'));
 assert.notDeepEqual(find('influenza').trajectory,find('norovirus').trajectory);
 assert.equal(find('hiv').trajectory.mode,'progressive');assert.equal(find('epilepsy').trajectory.mode,'episodic');
 for(const id of ['rabies','tetanus','lyme'])assert.equal(find(id).publicSpreadApplicable,false);
 assert.equal(find('hepatitis-b').spreadMode,'route-specific');
 assert.equal(find('cystic-fibrosis').dnaRelation.gene,'CFTR');assert.equal(find('cystic-fibrosis').dnaRelation.presetId,'cystic-fibrosis');
 assert.equal(find('prostate-cancer').organEffectTimeline.length,0);
 assert.ok(!find('pku').organEffectTimeline.some(e=>e.organ==='endocrine'));
 assert.ok(find('pku').organEffectTimeline.some(e=>e.organ==='brain'));
 assert.notDeepEqual(find('influenza').educationalTimeline,find('norovirus').educationalTimeline);
 assert.match(find('hiv').educationalTimeline[2].label,/iyileşme varsayılmaz/);
});
