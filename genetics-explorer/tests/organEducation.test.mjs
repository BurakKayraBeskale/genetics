import test from 'node:test';
import assert from 'node:assert/strict';
import { affectedOrgansFor, getOrganEffect, ORGAN_EDUCATION } from '../lib/organEducation.js';
test('specific systems precede broad systemic effects; influenza airway nuance', () => {
 const p = {id:'influenza', affectedSystems:['systemic','respiratory']};
 assert.deepEqual(affectedOrgansFor(p),['lungs','blood']);
 assert.match(getOrganEffect(p,{inflammation:5,tissueDamage:0},'lungs').explanation,/üst hava yolları/);
 assert.equal(Object.keys(ORGAN_EDUCATION).length,8);
});
test('digestive and neurological maps never default to lungs', () => {
 assert.deepEqual(affectedOrgansFor({affectedSystems:['digestive']}),['digestive']);
 assert.deepEqual(affectedOrgansFor({affectedSystems:['neurological']}),['brain']);
 assert.deepEqual(affectedOrgansFor({affectedSystems:[]}),[]);
});
test('visual severity stays bounded and monotonic; unrelated organs stay neutral', () => {
 const p={affectedSystems:['respiratory']};
 const initial=getOrganEffect(p,{inflammation:5,tissueDamage:0},'lungs');
 const later=getOrganEffect(p,{inflammation:80,tissueDamage:70},'lungs');
 assert.ok(initial.severity<later.severity);
 assert.ok(initial.severity<5);
 assert.equal(getOrganEffect(p,{inflammation:100,tissueDamage:100},'brain').severity,0);
 assert.equal(getOrganEffect(p,{inflammation:Infinity,tissueDamage:NaN},'lungs').severity,0);
 assert.equal(getOrganEffect(p,{inflammation:1000,tissueDamage:1000},'lungs').severity,100);
 assert.equal(getOrganEffect(p,{proteinFunction:20},'lungs').tissueStress,80);
 assert.equal(getOrganEffect(p,{},'brain').affected,false);
});
