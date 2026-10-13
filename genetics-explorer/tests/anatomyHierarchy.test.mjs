import test from 'node:test';
import assert from 'node:assert/strict';
import { getStructureRepresentation, getStructure, structureMatchesMesh, getAffectedStructures } from '../lib/anatomyHierarchy.js';
test('loaded anatomical parts, microstructures and information views resolve distinctly',()=>{
 assert.equal(getStructureRepresentation('lungs','left-lung',['VH_F_left_lung']),'mesh');
 assert.equal(getStructureRepresentation('endocrine','thyroid',['VH_F_pancreas']),'information');
 assert.equal(getStructureRepresentation('lungs','trachea',[]),'information');
 assert.equal(getStructureRepresentation('lungs','alveoli',[]),'schematic');
 for(const [organ,id] of [['lungs','upper-airway'],['brain','peripheral-nerves'],['blood','arteries'],['blood','veins']]) assert.equal(getStructureRepresentation(organ,id,[id]),'information');
 assert.equal(getStructureRepresentation('brain','neuron',[]),'schematic');
 assert.equal(getStructureRepresentation('lungs','all',[]),'mesh');
 assert.equal(structureMatchesMesh(getStructure('lungs','left-lung'),'VH_F_right_lung'),false);
});
test('legacy affected-system profile maps to matching educational structures',()=>{
 const respiratory=getAffectedStructures({affectedSystems:['respiratory']});
 assert.ok(respiratory.includes('trachea')&&respiratory.includes('alveoli'));
 assert.ok(!respiratory.includes('neuron'));
 const digestive=getAffectedStructures({affectedSystems:['digestive']});
 assert.ok(digestive.includes('stomach')&&digestive.includes('intestinal-epithelium'));
 assert.ok(!digestive.includes('left-lung'));
 assert.deepEqual(getAffectedStructures({affectedSystems:[]}),[]);
});
