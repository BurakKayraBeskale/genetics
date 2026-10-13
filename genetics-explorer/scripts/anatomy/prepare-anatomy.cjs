/** Rebuild local HRA anatomy. Requires temporary tools: @gltf-transform/core,
 * @gltf-transform/functions and meshoptimizer. No application dependency added.
 * Usage: node scripts/anatomy/prepare-anatomy.cjs <tools-directory> <source.glb>
 * Source geometry: Human Reference Atlas / HuBMAP united female v1.5, CC BY 4.0.
 */
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../..');
async function main(){
 const tools=path.resolve(process.argv[2]);
 const {NodeIO}=await import(pathToFileURL(path.join(tools,'node_modules/@gltf-transform/core/dist/index.js')));
 const {prune,weld,simplify,joinPrimitives,transformPrimitive,getBounds}=await import(pathToFileURL(path.join(tools,'node_modules/@gltf-transform/functions/dist/index.js')));
 const {MeshoptSimplifier}=await import(pathToFileURL(path.join(tools,'node_modules/meshoptimizer/index.js')));
 await MeshoptSimplifier.ready;
 const io=new NodeIO();const doc=await io.read(process.argv[3]);
 const groups=new Map();
 const rawNodes=doc.getRoot().listNodes().slice();
 function classify(name){
  if(name==='VH_F_skin')return ['skin','skin'];
  if(/^Allen_/.test(name)&&/gyrus|gyri|cortex|lobule|hemisphere_of_cerebellum|paravermis|medulla_oblongata|basilar_part_of_pons|midbrain_tegmentum/.test(name))return ['brain',/cerebellum|paravermis/.test(name)?'cerebellum':/medulla|pons|midbrain/.test(name)?'brainstem':name.endsWith('_L')?'cerebrum_left':'cerebrum_right'];
  if(/bronchopulmonary|bronchus|bronchi|trachea|carina/.test(name)&&!name.includes('cartilage'))return ['lungs',/bronchus|bronchi|trachea|carina/.test(name)?'bronchi':/left_|_L/.test(name)?'left_lung':'right_lung'];
  if(/colon|jejenum|ileum|rectum|caecum|duodenum/.test(name)&&!name.includes('impression')&&!name.includes('duct'))return ['digestive',/jejenum|ileum/.test(name)?'small_intestine':/duodenum/.test(name)?'duodenum':'colon'];
  if(/capsule_of_the_liver|bare_area_of_liver|diaphragmatic_surface_of_liver/.test(name))return ['digestive','liver'];
  if(/pancreas|ucinate_process1/.test(name)&&!name.includes('duct'))return ['endocrine','pancreas'];
  if(/kidney_capsule|outer_cortex_of_kidney|hilum_of_kidney|ureter$|renal_pyramid/.test(name))return ['renal',(/renal_pyramid/.test(name)?'renal_medulla':/ureter/.test(name)?'ureter':/hilum/.test(name)?'renal_hilum':'kidney_cortex')+(/_L|left_/.test(name)?'_left':'_right')];
  if(/cardiac_atrium|ventricle$|interventricular_septum/.test(name))return ['blood',/atrium/.test(name)?'heart_atria':'heart_ventricles'];
  if(/aorta|vena_cava|aortic_arch|coronary_artery|carotid_artery|subclavian_artery|pulmonary_artery|pulmonary_trunk|renal_artery|renal_vein|common_iliac_vein/.test(name))return ['blood','vessels'];
  if(/vertebra_|^VH_F_(femur|tibia|fibula|patella|sacrum|coccyx)$|^VH_F_(femur|tibia|fibula|patella)_[LR]$|compact_bone/.test(name))return ['skeleton',/vertebra/.test(name)?'spine':/compact_bone|sacrum|coccyx/.test(name)?'pelvis':'leg_bones'];
  return null;
 }
 for(const node of rawNodes){const mesh=node.getMesh();if(!mesh)continue;const category=classify(node.getName());if(!category)continue;
 const [organ,key]=category;
 if(!groups.has(key))groups.set(key,{organ,key,primitives:[],names:[],material:doc.createMaterial(key).setBaseColorFactor([.3,.72,.82,1]).setRoughnessFactor(.6)});
 const group=groups.get(key);group.names.push(node.getName());
 for(const original of mesh.listPrimitives()){
  // Source mesh primitives have independent buffers. Remove UVs: viewer uses holographic materials.
  for(const semantic of original.listSemantics())if(!['POSITION','NORMAL'].includes(semantic))original.setAttribute(semantic,null);
  original.setMaterial(group.material);
  transformPrimitive(original,node.getWorldMatrix());
  group.primitives.push(original);
 }
 }
 const scene=doc.createScene('Human Reference Atlas educational selection');
 const output=[];
 for(const group of groups.values()){
 const primitive=joinPrimitives(group.primitives);
 const mesh=doc.createMesh('HRA_'+group.key).addPrimitive(primitive);
 const node=doc.createNode('HRA_'+group.key).setMesh(mesh).setExtras({organ:group.organ,structure:group.key,source:'HRA united-female v1.5',sourceStructures:group.names});
 scene.addChild(node);output.push(node);
 }
 // Remove entire original hierarchy after baked-world selections have been assembled.
 for(const node of rawNodes)node.dispose();
 for(const old of doc.getRoot().listScenes().slice())if(old!==scene)old.dispose();
 doc.getRoot().setDefaultScene(scene);
 await doc.transform(prune(),weld(),simplify({simplifier:MeshoptSimplifier,ratio:.16,error:.005}),prune());
 const file=path.join(root,'public/models/anatomy/anatomy.glb');
 await io.write(file,doc);
 const manifest={version:1,source:'https://lod.humanatlas.io/ref-organ/united-female/v1.5',license:'CC BY 4.0',orientation:'Y-up, front +Z, world transforms baked, units meters',limitations:['Female reference anatomy; not complete human anatomy','No stomach, thyroid/adrenal or limb-muscle mesh in source selection','Partial skeletal coverage'],bounds:getBounds(scene),bytes:fs.statSync(file).size,nodes:output.map(node=>({name:node.getName(),...node.getExtras(),triangles:node.getMesh().listPrimitives().reduce((n,p)=>n+(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3,0),bounds:getBounds(node)}))};
 fs.writeFileSync(path.join(root,'lib/anatomyAssetManifest.json'),JSON.stringify(manifest,null,2));
 console.log(JSON.stringify({bytes:manifest.bytes,bounds:manifest.bounds,nodes:manifest.nodes.map(({name,organ,triangles,bounds})=>({name,organ,triangles,bounds}))},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});