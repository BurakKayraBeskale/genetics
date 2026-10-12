import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { DISEASE_PROFILES, SCENARIOS, DISEASE_MECHANISMS } from '../data/diseaseProfiles.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../public/data/medical-catalog.json', import.meta.url)));
test('52 named real profiles retain source provenance and required educational fields',()=>{
 assert.ok(DISEASE_PROFILES.length>=50);
 assert.equal(new Set(SCENARIOS.map(p=>p.id)).size,SCENARIOS.length);
 for(const p of DISEASE_PROFILES){
  assert.equal(p.profileType,'real'); assert.ok(DISEASE_MECHANISMS.includes(p.mechanism));
  assert.ok(p.name&&p.cellularMechanism&&p.immuneResponseType&&p.dnaRelation.explanation);
  assert.ok(p.affectedSystems.length&&p.typicalSymptoms.length&&p.educationalTimeline.length);
  assert.match(p.timelineDisclaimer,/gerçek kuluçka/);
  assert.ok(p.sources.every(s=>catalog.topics.some(t=>t.url===s.url&&t.summaryPlainText)));
  assert.equal(typeof p.publicSpreadApplicable,'boolean');
  if(!p.mechanism.startsWith('infectious/'))assert.equal(p.publicSpreadApplicable,false);
 }
});
test('only four supported teaching analogues map genetic profiles to DNA presets',()=>{
 const supported=new Set(['sickle-cell','cystic-fibrosis','huntington','dmd']);
 for(const p of DISEASE_PROFILES.filter(p=>p.category==='genetic')){
  assert.ok(Number.isFinite(p.proteinBaseline)&&Number.isFinite(p.tissueRate));
  assert.equal(Boolean(p.dnaRelation.presetId),supported.has(p.id));
 }
 const flu=SCENARIOS.find(p=>p.id==='influenza');assert.equal(flu.growth,1.22);assert.equal(flu.immuneRate,1.1);
 assert.ok(SCENARIOS.some(p=>p.mechanism==='infectious/mixed'));
});
