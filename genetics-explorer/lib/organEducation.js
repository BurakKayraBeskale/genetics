import { getProfileOrganEffects } from './diseaseTrajectory.js';
const organ = (name, functionText, tissue, sourceUrl, sourceTitle) => ({ name, function: functionText, tissue, sourceUrl, sourceTitle });
export const ORGAN_EDUCATION = {
 lungs: organ('Akciğerler ve hava yolları', 'Hava yolları havayı iletir; alveoller oksijen ve karbondioksitin kan ile değişimini sağlar.', 'Hava yolu epiteli ve alveol yüzeyi', 'https://www.nhlbi.nih.gov/health/lungs/breathing-benefits', 'NIH / NHLBI: Solunum ve gaz değişimi'),
 digestive: organ('Sindirim sistemi', 'Besinleri parçalar; bağırsaklar besin ve su emilimine, artıkların uzaklaştırılmasına katkı sağlar.', 'Mide ve bağırsak epiteli', 'https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works', 'NIH / NIDDK: Sindirim sistemi'),
 brain: organ('Beyin ve sinir sistemi', 'Duyusal bilgiyi işler; hareketi, düşünmeyi ve birçok vücut işlevini koordine eder.', 'Nöronlar ve destekleyici glia hücreleri', 'https://www.ninds.nih.gov/health-information/public-education/brain-basics', 'NIH / NINDS: Beyin temelleri'),
 muscle: organ('İskelet kasları', 'Kas liflerinin kasılması hareketi ve duruşu destekler.', 'Kas lifleri ve sinir-kas bağlantısı', 'https://medlineplus.gov/muscledisorders.html', 'NLM / MedlinePlus: Kas dokusu'),
 renal: organ('Böbrekler', 'Kanı süzer; atıkları uzaklaştırır ve sıvı, elektrolit, asit-baz dengesine katkı sağlar.', 'Nefron: glomerül ve böbrek tübülleri', 'https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work', 'NIH / NIDDK: Böbrek işlevi'),
 endocrine: organ('Endokrin ve metabolik sistem', 'Hormonlar organların faaliyetlerini ve metabolizmayı düzenler. Pankreas, birçok endokrin organdan biridir.', 'Hormon üreten hücreler; pankreas temsilî odaktır', 'https://medlineplus.gov/endocrinesystem.html', 'NLM / MedlinePlus: Endokrin sistem'),
 skin: organ('Deri', 'Dış ortam ile bariyer oluşturur; duyuyu ve vücut sıcaklığının düzenlenmesini destekler.', 'Epidermis ve dermis', 'https://medlineplus.gov/skinconditions.html', 'NLM / MedlinePlus: Deri'),
 blood: organ('Kan ve dolaşım', 'Kan oksijen ve besin taşır; bağışıklık hücreleri savunmaya, trombositler pıhtılaşmaya katkı sağlar.', 'Kan hücreleri ve damar ağı; kalp dolaşımın pompasıdır', 'https://medlineplus.gov/blood.html', 'NLM / MedlinePlus: Kan'),
};
const mappings = [
 [/respir|lung|solunum/i, 'lungs'], [/digest|gastro|hepatic|sindirim/i, 'digestive'],
 [/neuro|brain|sinir/i, 'brain'], [/muscul|kas/i, 'muscle'], [/renal|kidney|urinary|böbrek/i, 'renal'],
 [/endocrin|metabol/i, 'endocrine'], [/skin|derma|deri/i, 'skin'], [/cardio|blood|circul|hemat/i, 'blood'],
];
/** Specific systems retain profile order; broad/systemic involvement is placed last. */
export function affectedOrgansFor(profile = {}) {
 if(Array.isArray(profile.organEffectTimeline))return [...new Set([...profile.organEffectTimeline].sort((a,b)=>({primary:0,secondary:1,optional:2}[a.role]??0)-({primary:0,secondary:1,optional:2}[b.role]??0)).map(w=>w.organ))];
 const systems = Array.isArray(profile.affectedSystems) ? profile.affectedSystems : [];
 const keys = systems.flatMap(system => mappings.filter(([pattern]) => pattern.test(String(system))).map(([,key]) => key));
 // Systemic/immune involvement alone does not locate disease in blood vessels.
 return [...new Set(keys)];
}
const bounded = value => Number.isFinite(value) ? Math.round(Math.max(0, Math.min(100, value)) * 10) / 10 : 0;
/** This adapter only reads global classroom indicators. It never estimates clinical organ damage. */
export function getOrganEffect(profile = {}, metrics = {}, key, context) {
 const affected = affectedOrgansFor(profile).includes(key);
 const inflammation = bounded(metrics.inflammation);
 const loss = name => Number.isFinite(metrics[name]) ? bounded(100 - metrics[name]) : 0;
 const tissueStress = bounded(Math.max(bounded(metrics.tissueDamage), loss('proteinFunction'), loss('neuralFunction'), bounded(metrics.metabolicImbalance), bounded(metrics.tumorBurden), bounded(metrics.autoimmuneActivity)));
 const targets=context&&Array.isArray(profile.organEffectTimeline)?getProfileOrganEffects(profile,metrics,context.day,context.duration).filter(effect=>effect.organ===key):null;
 const severity=targets?bounded(Math.max(0,...targets.map(effect=>effect.severity))*100):affected?bounded(inflammation*.35+tissueStress*.65):0;
 const damageLevel = severity === 0 ? 'Belirgin görsel etki yok' : severity < 25 ? 'Düşük görsel etki' : severity < 60 ? 'Orta görsel etki' : 'Yüksek görsel etki';
 const tissueLinks = {
 lungs: 'Hava yolu yüzeyi ve gaz değişimi, solunum belirtilerinin anlaşılmasına yardımcı olur.',
 digestive: 'Sindirim epiteli ve emilim işlevi, gastrointestinal belirtilerle karşılaştırılır.',
 brain: 'Sinir hücrelerinin iletişimi ve destek dokusu, nörolojik işlevin kavramsal odağıdır.',
 muscle: 'Kas lifleri ve sinir-kas iletişimi, hareket ve güç gözlemleriyle ilişkilidir.',
 renal: 'Nefronun süzme ve geri emilim işlevi, sıvı ve atık dengesinin kavramsal odağıdır.',
 endocrine: 'Hormonal sinyaller ve metabolik denge incelenir; pankreas tüm endokrin sistemi temsil etmez.',
 skin: 'Bariyer dokusu ve yerel doku yanıtı, deri bulgularıyla karşılaştırılır.',
 blood: 'Taşıma, bağışıklık ve dolaşım işlevleri sistemik gözlemler için ortak bağlam sağlar.',
 };
 const mechanism = String(profile.mechanism || profile.category || '');
 const mechanismLinks = mechanism.startsWith('infectious') || /viral|bacterial|mixed/.test(mechanism) ? 'Enfeksiyon ve konak yanıtı birlikte değerlendirilir.' : mechanism === 'autoimmune' ? 'Öz dokulara yönelen bağışıklık aktivitesi kavramsal olarak incelenir.' : mechanism === 'genetic' ? 'Kalıtsal protein işlevi ile sistem belirtileri karşılaştırılır.' : mechanism === 'metabolic' ? 'Metabolik denge ile sistem işlevi arasındaki ilişki incelenir.' : mechanism === 'neurological' ? 'Sinir işlevi ile günlük gözlemler karşılaştırılır.' : mechanism === 'oncology' ? 'Anormal hücre çoğalması ve doku işlevi kavramsal olarak karşılaştırılır.' : 'Vaka profilindeki mekanizma günlük gözlemlerle karşılaştırılır.';
 let explanation = affected ? [tissueLinks[key], mechanismLinks].filter(Boolean).join(' ') : 'Bu sistem profilde hedef olarak belirtilmiyor. Genel göstergeler burada hasar olduğu anlamına gelmez.';
 if (affected && key === 'lungs' && /influenza/i.test(profile.id || '')) explanation = 'Influenza solunum epiteliyle ilişkilidir; üst hava yolları, trakea ve bronşlar da bu kapsamdadır. Akciğer gösterimi her vakada akciğer hasarı geliştiği anlamına gelmez.';
 return { affected, active:targets?targets.length>0:affected, targets:targets||[], severity, inflammation, tissueStress, damageLevel, explanation };
}
