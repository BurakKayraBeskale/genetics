import { affectedOrgansFor } from './organEducation.js';
/** Mesh keywords are lookup hints, never evidence that an asset contains a structure. */
const informationOnly = new Set(['upper-airway','peripheral-nerves','arteries','veins']);
const part=(id,name,tissue,description,meshKeywords=[],teachingOnly=false)=>({id,name,tissue,description,meshKeywords,teachingOnly,representation:informationOnly.has(id)?'information':teachingOnly?'schematic':'mesh'});
export const ANATOMY_HIERARCHY = {
 lungs:[part('trachea','Trakea','Silli hava yolu epiteli','Soluk borusu havayı bronşlara iletir; alveol gaz değişim yüzeyi değildir.',['trachea']),part('upper-airway','Üst hava yolları','Solunum epiteli','Burun ve üst hava yolu yüzeyleri solunum hastalıklarında önemlidir; bu seçim ayrı geometri bulunduğunu varsaymaz.',[],true),part('left-lung','Sol akciğer','Solunum epiteli ve alveol dokusu','Sol akciğer, hava yolları üzerinden gelen havanın gaz değişimine katılır.',['left lung','lung_left','left_lung']),part('right-lung','Sağ akciğer','Solunum epiteli ve alveol dokusu','Sağ akciğer üç lobdan oluşur; sol akciğer iki lobludur.',['right lung','lung_right','right_lung']),part('bronchus','Bronşlar','Silli hava yolu epiteli','Bronşlar havayı akciğer içinde taşır; alveollerle aynı yapı değildir.',['bronchus','bronchi']),part('alveoli','Alveoller','Alveol epiteli ve kılcal damar ağı','Mikroskobik gaz değişim yüzeyidir. Bu alt yapı makroskobik organ meshinden çıkarılamaz.',[],true)],
 digestive:[part('liver','Karaciğer','Karaciğer hücreleri ve safra yolları','Besinlerin işlenmesi ve safra üretimiyle sindirime katkı sağlar.',['liver']),part('digestive-pancreas','Pankreas · sindirim','Ekzokrin pankreas dokusu','Sindirim enzimlerini üretir; hormonal adacıklarla aynı işlev değildir.',['pancreas']),part('intestinal-epithelium','Bağırsak epiteli','Emilim ve bariyer yüzeyi','Bağırsak iç yüzeyindeki hücresel katmanı öğretici olarak inceler; makroskobik organ meshinde tek tek hücreler çözülmez.',[],true),part('stomach','Mide','Mide epiteli ve düz kas','Besinleri karıştırır ve sindirim sürecine katkı sağlar.',['stomach']),part('small-intestine','İnce bağırsak','Bağırsak epiteli','Sindirim ve besin emiliminin önemli bölümünün gerçekleştiği yapıdır.',['small intestine','small_intestine','duodenum','jejunum','ileum']),part('colon','Kalın bağırsak','Kolon epiteli','Su emilimine ve dışkının oluşumuna katkı sağlar.',['colon','large intestine','large_intestine'])],
 brain:[part('neuron','Nöron','Sinir hücresi','Elektriksel ve kimyasal sinyalle iletişim sağlayan hücredir; burada mikroskobik doku bilgisi sunulur.',[],true),part('peripheral-nerves','Periferik sinirler','Sinir lifleri ve destek dokusu','Merkezi sinir sistemi ile vücut arasında bağlantı kurar; seçili beyin meshinin bir alt parçası sayılmaz.',[],true),part('cerebrum','Büyük beyin','Sinir ve glia dokusu','Duyusal işlemleme, düşünme ve istemli hareketle ilişkilidir.',['cerebrum','cerebral']),part('cerebellum','Beyincik','Sinir ve glia dokusu','Hareketlerin koordinasyonu ve dengeye katkı sağlar.',['cerebellum']),part('brainstem','Beyin sapı','Sinir dokusu','Beyin ile omurilik bağlantısında ve temel vücut işlevlerinde rol alır.',['brainstem','brain stem','pons','medulla oblongata'])],
 muscle:[part('skeletal-muscle','İskelet kası','Çizgili kas dokusu','Kas demetleri birlikte kasılarak hareketi ve duruşu destekler.',['skeletal muscle','muscle']),part('muscle-fiber','Kas lifi','Kas hücresi','Uzun kas hücresidir; organ düzeyindeki mesh üzerinde tek tek lifler gösterilmiş sayılmaz.',[],true)],
 renal:[part('left-kidney','Sol böbrek','Böbrek parankimi','Süzme ve tübüler işlemlerle sıvı ve atık dengesine katkı sağlar.',['left kidney','kidney_left','left_kidney','kidney cortex left','renal hilum left','renal medulla left']),part('right-kidney','Sağ böbrek','Böbrek parankimi','Sol böbrekle birlikte kanın süzülmesi ve iç dengenin korunmasına katkı sağlar.',['right kidney','kidney_right','right_kidney','kidney cortex right','renal hilum right','renal medulla right']),part('renal-cortex','Böbrek korteksi','Glomerüller ve tübüller','Böbreğin dış bölgesidir; korteks tek başına tüm nefronu temsil etmez.',['renal cortex','kidney cortex']),part('renal-medulla','Böbrek medullası','Tübüller ve toplayıcı kanallar','İç bölgede idrarın yoğunlaştırılmasına katkı sağlayan yapılar bulunur.',['renal medulla','medulla']),part('nephron','Nefron','Glomerül ve tübüller','Böbreğin mikroskobik işlev birimidir; burada öğretici doku bilgisi olarak ele alınır.',[],true)],
 endocrine:[part('pancreas','Pankreas','Endokrin adacıklar ve ekzokrin doku','Pankreas hem hormon hem sindirim enzimi üretimine katılır.',['pancreas']),part('thyroid','Tiroid','Hormon üreten epitel','Tiroid hormonları metabolizma ve birçok vücut işlevine katkı sağlar.',['thyroid']),part('adrenal','Böbreküstü bezleri','Korteks ve medulla','Farklı bölgelerinde farklı hormonlar üreten bezlerdir.',['adrenal','suprarenal'])],
 skin:[part('epidermis','Epidermis','Çok katlı epitel','Dış bariyer katmanıdır; şematik katman seçimi gerçek bir doku kesiti değildir.',[],true),part('dermis','Dermis','Bağ dokusu, damarlar ve duyu yapıları','Epidermisin altında destek ve duyu işlevleriyle ilişkili katmandır.',[],true),part('hypodermis','Deri altı doku','Yağ ve bağ dokusu','Derinin altında bulunur; ısı yalıtımına ve destek işlevine katkı sağlar.',[],true)],
 blood:[part('arteries','Atardamarlar','Damar duvarı ve endotel','Kanı kalpten uzaklaştıran damarlardır. Bu genel sınıf için ayrı geometri doğrulanmadığından öğretici bilgi gösterilir.',[],true),part('veins','Toplardamarlar','Damar duvarı ve endotel','Kanı kalbe geri taşıyan damarlardır; atardamarlarla aynı geometriye farklı ad verilmez.',[],true),part('heart','Kalp','Kalp kası','Dolaşımın pompasıdır; kan hücreleri ile aynı doku değildir.',['heart']),part('aorta','Aort','Damar duvarı ve endotel','Kalpten sistemik dolaşıma kan taşıyan ana atardamardır.',['aorta']),part('blood-cells','Kan hücreleri','Alyuvar, akyuvar ve trombositler','Oksijen taşıma, savunma ve pıhtılaşma işlevleri olan farklı hücresel öğelerdir.',[],true)],
};
export function getStructures(organ) { return ANATOMY_HIERARCHY[organ] || []; }
/** Explicit availability from the loaded asset is required; keywords alone never enable a mesh badge. */
export function structureHasMesh(structure, availableStructures = []) {
 return !structure.teachingOnly && availableStructures.some(item => typeof item === 'string' ? item === structure.id : item?.id === structure.id && item.meshAvailable === true);
}

export function getStructure(organ, id) {
 if (id === 'all') return { id:'all', name:'Organın bütünü', tissue:'Makroskobik organ görünümü', description:'Alt yapı seçmeden organın bütününü inceleyin.', meshKeywords:[], teachingOnly:false, representation:'mesh' };
 return getStructures(organ).find(item => item.id === id) || null;
}
const normalizedMeshName = name => String(name).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function structureMatchesMesh(structure, name) {
 if (!structure || structure.teachingOnly) return false;
 const normalized = ' ' + normalizedMeshName(name) + ' ';
 return structure.meshKeywords.some(keyword => normalized.includes(' ' + normalizedMeshName(keyword) + ' '));
}

/** Profile-level educational targets, not a diagnosis of damage to each listed substructure. */
export function getAffectedStructures(profile = {}) {
 const targets = {
 lungs:['upper-airway','trachea','bronchus','left-lung','right-lung','alveoli'],
 digestive:['stomach','small-intestine','colon','intestinal-epithelium','liver','digestive-pancreas'],
 brain:['cerebrum','cerebellum','brainstem','neuron','peripheral-nerves'],
 muscle:['skeletal-muscle','muscle-fiber'], renal:['left-kidney','right-kidney','renal-cortex','renal-medulla','nephron'],
 endocrine:['pancreas','thyroid','adrenal'], skin:['epidermis','dermis','hypodermis'], blood:['heart','aorta','arteries','veins','blood-cells'],
 };
 return [...new Set(affectedOrgansFor(profile).flatMap(organ=>targets[organ] || []))];
}

/** Resolve actual loaded geometry separately from microscopic teaching and information-only views. */
export function getStructureRepresentation(organ, id, availableMeshNames = []) {
 if (id === 'all') return 'mesh';
 const structure = getStructure(organ,id);
 if (!structure || structure.representation === 'information') return 'information';
 if (structure.representation === 'schematic') return 'schematic';
 return availableMeshNames.some(name => structureMatchesMesh(structure,name)) ? 'mesh' : 'information';
}
