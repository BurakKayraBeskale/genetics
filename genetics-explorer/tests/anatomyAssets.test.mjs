import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getStructures, structureMatchesMesh } from '../lib/anatomyHierarchy.js';
const file=new URL('../public/models/anatomy/anatomy.glb',import.meta.url);
const data=fs.readFileSync(file);const model=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
test('local reference package preserves licensed, selectable anatomy within web budget',()=>{
 assert.equal(data.readUInt32LE(0),0x46546c67);assert.ok(data.length<10*1024*1024);
 const nodes=model.nodes.filter(n=>n.mesh!==undefined);assert.equal(nodes.length,27);assert.ok(nodes.every(n=>n.extras?.organ));
 const manifest=JSON.parse(fs.readFileSync(new URL('../lib/anatomyAssetManifest.json',import.meta.url)));assert.equal(manifest.bytes,data.length);assert.equal(manifest.license,'CC BY 4.0');assert.ok(manifest.nodes.reduce((total,n)=>total+n.triangles,0)<350000);
});
test('hierarchy matches real lung and renal submeshes and keeps microscopic tissue separate',()=>{
 const names=model.nodes.map(n=>n.name||'');
 for(const [organ,id] of [['lungs','left-lung'],['lungs','right-lung'],['lungs','bronchus'],['renal','left-kidney'],['renal','renal-cortex'],['digestive','colon']]){
  const part=getStructures(organ).find(p=>p.id===id);assert.ok(names.some(name=>structureMatchesMesh(part,name)),organ+':'+id);
 }
 assert.equal(getStructures('lungs').find(p=>p.id==='alveoli').representation,'schematic');
 const stomach=fs.readFileSync(new URL('../public/models/anatomy/supplemental/FMA7148.stl',import.meta.url));assert.equal(stomach.length,84+stomach.readUInt32LE(80)*50);
});
