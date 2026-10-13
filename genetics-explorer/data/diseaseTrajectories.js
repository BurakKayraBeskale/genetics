/** Hand-curated teaching trajectories. All fractions/rates are classroom design, NOT clinical duration/prognosis. */
const row=(family,subtype,mode,onset,peak,recovery,primary,secondary=[],flags=[])=>({family,subtype,mode,onset,peak,recovery,primary,secondary,flags});
export const PROFILE_TRAJECTORIES = {
 influenza:row('respiratory-viral','Akut solunum epiteli yanıtı','acute',.07,.32,.68,['lungs','upper-airway','trachea','bronchus'],['lungs'],['İkincil solunum komplikasyonları olasıdır']),
 chickenpox:row('viral-exanthem','Yaygın veziküler deri bulguları','acute',.15,.44,.78,['skin','epidermis'],[],['Deri lezyonlarında ikincil enfeksiyon olasılığı']),
 measles:row('viral-exanthem','Solunum ön bulguları ve döküntü','acute',.12,.48,.82,['lungs','upper-airway'],['skin'],['Solunum veya nörolojik komplikasyonlar olasıdır']),
 mumps:row('glandular-virus','Tükürük bezi tutulumu','acute',.18,.5,.8,null,[],['Tükürük bezleri mevcut atlas kapsamı dışındadır']),
 rubella:row('viral-exanthem','Hafif döküntülü viral yanıt','acute',.2,.42,.7,['skin','epidermis'],[],['Gebelik bağlamı bu soyut modelde hesaplanmaz']),
 'hepatitis-a':row('hepatic-virus','Akut karaciğer inflamasyonu','acute',.22,.55,.88,['digestive','liver'],[],['Karaciğer işlev bozukluğu olasıdır']),
 'hepatitis-b':row('hepatic-virus','Kronik enfeksiyon öğretim dalı','chronic',.2,.65,1,['digestive','liver'],[],['Akut ve kronik seyir farklıdır; bu profil kronik dalı gösterir']),
 'hepatitis-c':row('hepatic-virus','Persistan karaciğer yanıtı','chronic',.25,.76,1,['digestive','liver'],[],['Kronik karaciğer komplikasyonları olasıdır']),
 hiv:row('immune-targeting-virus','Bağışıklık hücresi işlevi','progressive',.08,.86,1,['blood','blood-cells'],[],['Fırsatçı enfeksiyon olasılığı; model klinik AIDS evresi üretmez']),
 norovirus:row('acute-enteric','Akut gastrointestinal bulgular','acute',.04,.2,.52,['digestive','intestinal-epithelium'],[],['Sıvı kaybı olasıdır']),
 rabies:row('neuroinvasive-infection','Belirti sonrası nörolojik seyir','progressive',.35,.95,1,['brain','neuron'],[],['Semptomatik kuduz son derece ağırdır; model otomatik iyileşme varsaymaz']),
 shingles:row('viral-reactivation','Bölgesel sinir ve deri bulguları','acute',.16,.4,.87,['skin','epidermis'],[],['Kalıcı sinir ağrısı olasıdır; periferik sinirler beyin hasarı değildir']),
 tuberculosis:row('persistent-respiratory','Uzamış solunum enfeksiyonu','chronic',.25,.72,1,['lungs','left-lung','right-lung'],[],['Aktif/latent hastalık ayrımı; bu profil aktif kavramsal daldır']),
 cholera:row('acute-enteric','Sıvı kaybı odaklı gastrointestinal seyir','acute',.03,.18,.6,['digestive','intestinal-epithelium'],[],['Dehidratasyon olasıdır']),
 pertussis:row('persistent-respiratory','Uzamış öksürük örüntüsü','acute',.18,.53,.95,['lungs','trachea','bronchus'],[],['Bebeklerde ağır solunum etkileri olasıdır']),
 lyme:row('vector-infection','Deri ve olası geç sistem bulguları','chronic',.13,.7,1,['skin','epidermis'],['brain'],['Nörolojik veya eklem tutulumu olasıdır; zorunlu değildir']),
 tetanus:row('toxin-neuromuscular','Toksin ilişkili kas spazmları','progressive',.22,.9,1,['muscle','skeletal-muscle'],['lungs'],['Toksin etkisi; bakteri sayısı ile kas hasarı birebir değildir']),
 diphtheria:row('toxin-respiratory','Hava yolu ve toksin yanıtı','acute',.1,.47,.88,['lungs','upper-airway','trachea'],['blood'],['Toksin ilişkili komplikasyonlar olasıdır']),
 salmonellosis:row('acute-enteric','Bakteriyel bağırsak yanıtı','acute',.09,.34,.73,['digestive','intestinal-epithelium'],[],['Bazı vakalarda sistemik tutulum olasıdır']),
 gonorrhea:row('mucosal-infection','Ürogenital mukoza tutulumu','chronic',.12,.59,1,null,[],['Ürogenital hedef doku mevcut sekiz organ atlasında bulunmuyor']),
 syphilis:row('staged-infection','Evreli deri ve sistem bulguları','relapsing',.15,.55,1,['skin','epidermis'],['blood'],['Gerçek hastalık evreleri eğitim adımlarına eşitlenmez']),
 'sickle-cell':row('hemoglobin-disorder','Krizli kalıtsal kan hastalığı','relapsing',0,.45,1,['blood','blood-cells'],['lungs','renal'],['Vazo-oklüzif kriz olasıdır; organ komplikasyonları zorunlu değildir']),
 'cystic-fibrosis':row('channel-protein','Kalıtsal epitel taşıma bozukluğu','chronic',0,.7,1,['lungs','bronchus'],['digestive'],['Solunum ve sindirim etkileri farklı düzeylerde olabilir']),
 huntington:row('neurodegeneration','Kalıtsal ilerleyici sinir işlevi','progressive',.1,.94,1,['brain','neuron'],[],['İşlev kaybı klinik süreye çevrilmez']),
 dmd:row('muscle-protein','Kalıtsal kas lifi işlevi','progressive',0,.9,1,['muscle','muscle-fiber'],['lungs'],['Solunum kası tutulumu olasıdır']),
 hemophilia:row('coagulation-disorder','Kalıtsal pıhtılaşma işlevi','episodic',0,.38,1,['blood','blood-cells'],[],['Kanama atakları kavramsaldır; faktör düzeyi ölçümü değildir']),
 pku:row('inherited-metabolism','Aminoasit metabolizması','chronic',0,.66,1,null,['brain'],['Metabolik enzim işlevi mevcut organ atlasında ayrı gösterilmiyor; pankreas hasarı varsayılmaz']),
 marfan:row('connective-tissue','Kalıtsal bağ dokusu işlevi','chronic',0,.78,1,['blood','aorta'],[],['Bağ dokusu sistemleri; aort komplikasyonu kesin değildir']),
 'tay-sachs':row('neurodegeneration','Kalıtsal hücresel birikim','progressive',.04,.98,1,['brain','neuron'],[],['Gerçek yaşa bağlı seyir bu modelde verilmez']),
 rheumatoid:row('joint-autoimmune','Eklemlerde otoimmün aktivite','relapsing',.03,.5,1,null,[],['Eklem dokusu atlas dışında; kas lifi hasarı şeklinde gösterilmez']),
 lupus:row('systemic-autoimmune','Çok sistemli dalgalanan aktivite','relapsing',.06,.53,1,['skin','dermis'],['renal','blood'],['Böbrek tutulumu olasıdır; tüm lupus vakalarında bulunmaz']),
 ms:row('neural-autoimmune','Sinir sistemi otoimmün aktivitesi','relapsing',.05,.46,1,['brain','neuron'],[],['Relapslı öğretim dalı; ilerleyici alt tipleri de vardır']),
 celiac:row('intestinal-autoimmune','Bağırsak yüzeyi otoimmün yanıtı','chronic',.1,.61,1,['digestive','intestinal-epithelium'],[],['Emilim etkileri kavramsal olarak değerlendirilir']),
 sjogren:row('glandular-autoimmune','Salgı bezi işlevi','chronic',.12,.67,1,null,[],['Gözyaşı/tükürük bezleri atlas kapsamı dışındadır']),
 'type1-diabetes':row('pancreatic-autoimmune','İnsülin üretimi ve otoimmün bağlam','chronic',.04,.69,1,['endocrine','pancreas'],['renal'],['Uzun dönem komplikasyonlar olası; adımlar gerçek süre değildir']),
 'type2-diabetes':row('metabolic-regulation','İnsülin direnci ve metabolik denge','chronic',.18,.74,1,['endocrine','pancreas'],['blood'],['Pankreas görseli metabolik temsil; tek neden değildir']),
 gout:row('crystal-inflammatory','Ataklı eklem inflamasyonu','episodic',.02,.24,.66,null,['renal'],['Eklem atlas dışında; böbrek etkileri olası ve ikincildir']),
 hypothyroidism:row('thyroid-regulation','Düşük tiroid işlevi','chronic',.2,.72,1,['endocrine','thyroid'],[],['Antikor artışı her hipotiroidi nedenini açıklamaz']),
 hyperthyroidism:row('thyroid-regulation','Artmış tiroid işlevi','chronic',.12,.64,1,['endocrine','thyroid'],['blood'],['Tiroid işlevi ve otoimmün nedenler ayrı kavramlardır']),
 alzheimer:row('neurodegeneration','Yavaş ilerleyici bilişsel işlev','progressive',.22,.99,1,['brain','cerebrum','neuron'],[],['Model gerçek bilişsel test skoru veya prognoz vermez']),
 parkinson:row('movement-neurology','İlerleyici hareket düzenleme işlevi','progressive',.18,.9,1,['brain','neuron'],['muscle'],['Kas rengi sinir-kas işlev bağlamıdır; doğrudan kas hasarı değildir']),
 epilepsy:row('episodic-neurology','Tekrarlayan nöbet örüntüsü','episodic',.04,.28,.6,['brain','neuron'],[],['Her eğitim adımı nöbet değildir; tanı veya EEG üretmez']),
 als:row('motor-neurodegeneration','Motor sinir ve kas işlevi','progressive',.11,.96,1,['brain','peripheral-nerves'],['muscle','lungs'],['Motor nöron işlevi; görsel dağılım klinik tutulum ölçümü değildir']),
 migraine:row('episodic-neurology','Ataklı baş ağrısı örüntüsü','episodic',.03,.21,.57,['brain'],[],['Baş ağrısı beyin dokusu hasarı olarak yorumlanmaz']),
 'breast-cancer':row('solid-tumor','Meme dokusunda hücresel çoğalma','progressive',.28,.94,1,null,[],['Meme dokusu mevcut atlas kapsamı dışında; metastaz varsayılmaz']),
 'lung-cancer':row('solid-tumor','Akciğerde hücresel çoğalma','progressive',.25,.92,1,['lungs','left-lung','right-lung'],[],['Tümör konumu/evresi bu modelde belirlenmez']),
 'colorectal-cancer':row('solid-tumor','Kolorektal epitel çoğalması','progressive',.24,.95,1,['digestive','colon'],[],['Gerçek evre veya sağkalım üretilmez']),
 'prostate-cancer':row('solid-tumor','Prostat dokusunda hücresel çoğalma','progressive',.32,.97,1,null,[],['Prostat atlas kapsamı dışında; böbrek hasarı varsayılmaz']),
 leukemia:row('hematologic-tumor','Kan yapıcı hücre çoğalması','progressive',.07,.84,1,['blood','blood-cells'],[],['Lösemi alt tipleri farklıdır; bu temsil ortak öğretim dalıdır']),
 lymphoma:row('lymphoid-tumor','Lenfoid hücre çoğalması','progressive',.2,.88,1,['blood','blood-cells'],[],['Lenf düğümleri atlas dışında; kan hücreleri sistem bağlamıdır']),
 melanoma:row('solid-tumor','Melanosit kökenli hücresel çoğalma','progressive',.23,.91,1,['skin','epidermis'],[],['Yayılım veya metastaz otomatik olarak çıkarılmaz']),
 'pancreatic-cancer':row('solid-tumor','Pankreas hücresel çoğalma','progressive',.29,.96,1,['digestive','digestive-pancreas'],['endocrine'],['Endokrin etkiler olasıdır; kesin insülin kaybı varsayılmaz']),
 bacterial:row('educational-infection','Soyut bakteriyel vaka','acute',.1,.4,.78,['blood'],[],['Gerçek hastalık adı değildir']),
 mixed:row('mixed-education','Soyut karma enfeksiyon hipotezi','acute',.12,.59,.9,['lungs'],['blood'],['Gerçek ko-enfeksiyon tanısı değildir']),
 'covid-like':row('respiratory-viral','COVID-benzeri eğitim profili','acute',.1,.44,.8,['lungs','upper-airway'],['blood'],['COVID-19 klinik modeli değildir']),
 gastroenteritis:row('acute-enteric','Norovirüs-benzeri eğitim profili','acute',.06,.26,.61,['digestive','intestinal-epithelium'],[],['Gerçek etkeni belirlemez']),
 'avian-flu-like':row('respiratory-viral','Kuş gribi benzeri eğitim profili','acute',.13,.62,.94,['lungs','bronchus'],['blood'],['Zoonotik etken veya insandan insana yayılım tahmini değildir']),
 pneumonia:row('persistent-respiratory','Bakteriyel pnömoni eğitim profili','acute',.11,.52,.88,['lungs','alveoli'],[],['Etken türü veya tedavi seçimi belirlenmez']),
 foodborne:row('acute-enteric','Gıda ilişkili bakteriyel eğitim profili','acute',.08,.31,.7,['digestive','intestinal-epithelium'],['blood'],['Maruziyet kaynağı klinik olarak saptanmaz']),
 'meningitis-like':row('neuroinvasive-infection','Menenjit benzeri eğitim profili','acute',.08,.55,.9,['brain'],['blood'],['Meninksler atlas dışında; gerçek menenjit tanısı değildir']),
 'atypical-influenza':row('mixed-education','Atipik karma belirtiler','acute',.09,.47,.84,['lungs','upper-airway'],['digestive'],['Karma belirtiler birden fazla etkenin kanıtı değildir']),
 'flu-gi':row('mixed-education','Solunum ve bağırsak gözlemleri','acute',.07,.39,.76,['lungs','upper-airway'],['digestive'],['Gastrointestinal gözlem etken türünü belirlemez']),
 immunosuppressed:row('immune-modified-infection','Azalmış bağışıklık yanıtıyla eğitim profili','chronic',.09,.82,1,['lungs'],['blood'],['Bağışıklık baskılanması kişiye özel sonuç tahmini değildir']),
};
const pattern={acute:['Hızlı başlangıç','Tek tepe ve izlem','Göreli toparlanma'],chronic:['Yavaş veya başlangıçtan süren bulgular','Süren aktivite','Tam düzelme varsayılmaz'],progressive:['Gecikmeli veya başlangıçtan süren bulgular','İlerleyici işlev yükü','Kendiliğinden düzelme varsayılmaz'],relapsing:['Dalgalanan başlangıç','Alevlenme ve yatışma','Yatışma tam iyileşme değildir'],episodic:['Atak başlangıcı','Tekrarlayan kısa aktivite','Ataklar arası yatışma']};
const symptomOverrides={
 influenza:['Ateş','Öksürük','Halsizlik','Kas ağrısı'],
 bacterial:['Ateş','Halsizlik'],
 mixed:['Ateş','Öksürük','Halsizlik'],
 'covid-like':['Öksürük','Ateş','Halsizlik'],
 gastroenteritis:['Bulantı','Kusma','İshal'],
 'avian-flu-like':['Ateş','Öksürük','Solunum güçlüğü'],
 pneumonia:['Öksürük','Ateş','Solunum güçlüğü'],
 foodborne:['İshal','Karın ağrısı','Bulantı'],
 'meningitis-like':['Baş ağrısı','Ateş','Ense sertliği','Bulantı'],
 'atypical-influenza':['Öksürük','Ateş','Halsizlik','Gastrointestinal belirtiler'],
 'flu-gi':['Öksürük','Ateş','Bulantı','İshal'],
 immunosuppressed:['Halsizlik','Öksürük','Solunum güçlüğü'],
};
const symptomSources={
 mixed:['flu','norovirusinfections'],'covid-like':['flu'],gastroenteritis:['norovirusinfections'],
 'avian-flu-like':['flu'],pneumonia:['pneumonia'],foodborne:['salmonellainfections'],
 'meningitis-like':['meningitis'],'atypical-influenza':['flu','norovirusinfections'],
 'flu-gi':['flu','norovirusinfections'],immunosuppressed:['pneumonia'],
};
const transmissionSources={rabies:'https://www.cdc.gov/rabies/hcp/clinical-overview/index.html',tetanus:'https://www.cdc.gov/tetanus/about/index.html'};
const geneticDetails={
 'sickle-cell':{gene:'HBB',protein:'Beta-globin / hemoglobin',sourceUrl:'https://medlineplus.gov/genetics/condition/sickle-cell-disease/'},
 'cystic-fibrosis':{gene:'CFTR',protein:'CFTR iyon kanalı',sourceUrl:'https://medlineplus.gov/genetics/condition/cystic-fibrosis/'},
 huntington:{gene:'HTT',protein:'Huntingtin',sourceUrl:'https://medlineplus.gov/genetics/condition/huntingtons-disease/'},
 dmd:{gene:'DMD',protein:'Distrofin',sourceUrl:'https://medlineplus.gov/genetics/condition/duchenne-and-becker-muscular-dystrophy/'},
};

/** Deliberate classroom contrasts; these are not fitted clinical coefficients. */
const trajectoryOverrides={
 'breast-cancer':{baseline:.12,progressionRate:.52},
 'lung-cancer':{baseline:.15,progressionRate:.66},
 'colorectal-cancer':{baseline:.11,progressionRate:.58},
 'prostate-cancer':{baseline:.09,progressionRate:.37},
 leukemia:{baseline:.24,progressionRate:.88},
 lymphoma:{baseline:.18,progressionRate:.61},
 melanoma:{baseline:.10,progressionRate:.55},
 'pancreatic-cancer':{baseline:.14,progressionRate:.76},
 pku:{baseline:.22,progressionRate:.36},
 marfan:{baseline:.17,progressionRate:.28},
 'hepatitis-b':{baseline:.20,progressionRate:.24},
 'hepatitis-c':{baseline:.23,progressionRate:.29},
 tuberculosis:{baseline:.12,progressionRate:.40},
 'cystic-fibrosis':{baseline:.26,progressionRate:.34},
 sjogren:{baseline:.13,progressionRate:.21},
 celiac:{baseline:.16,progressionRate:.27},
 'type1-diabetes':{baseline:.25,progressionRate:.33},
 'type2-diabetes':{baseline:.21,progressionRate:.26},
 hypothyroidism:{baseline:.14,progressionRate:.20},
 hyperthyroidism:{baseline:.17,progressionRate:.30},
 huntington:{baseline:.13,progressionRate:.68},
 'tay-sachs':{baseline:.21,progressionRate:.82},
 alzheimer:{baseline:.12,progressionRate:.57},
 parkinson:{baseline:.16,progressionRate:.54},
 als:{baseline:.19,progressionRate:.79},
 dmd:{baseline:.24,progressionRate:.72},
 hiv:{baseline:.15,progressionRate:.62},
 rabies:{baseline:.02,progressionRate:.96},
 tetanus:{baseline:.07,progressionRate:.85},
};

export function enrichDiseaseProfile(profile) {
 const data=PROFILE_TRAJECTORIES[profile.id];
 if(!data) throw new Error(`Missing curated trajectory: ${profile.id}`);
 const [onsetPattern,progressionPattern,recoveryPattern]=pattern[data.mode];
 const persistent=data.mode!=='acute';
 const trajectory={mode:data.mode,onset:data.onset,peak:data.peak,recovery:data.recovery,baseline:persistent?.18:.04,progressionRate:data.mode==='progressive'?.7:data.mode==='chronic'?.32:.5,immuneDelay:data.onset+.12,...trajectoryOverrides[profile.id],relapsePeriod:data.mode==='relapsing'?.34:data.mode==='episodic'?.26:0};
 const duration=Math.max(7,Math.min(30,Math.trunc(profile.educationalParameters?.durationSteps || 14)));
 const onsetStep=Math.min(duration,Math.max(0,Math.round(data.onset*duration)));
 const peakStep=Math.min(duration,Math.max(onsetStep,Math.round(data.peak*duration)));
 const educationalTimeline=[
 {phase:'baseline',label:'Başlangıç ve mekanizma',start:0,end:onsetStep},
 {phase:'response',label:data.mode==='progressive'?'İlerleyici işlev gözlemi':data.mode==='relapsing'||data.mode==='episodic'?'Atak ve dalgalanan yanıt':'Belirti ve sistem yanıtı',start:onsetStep,end:peakStep},
 {phase:'observation',label:persistent?'Süren aktivite ve izlem; iyileşme varsayılmaz':'Göreli toparlanma ve izlem',start:peakStep,end:duration},
 ];
 const organEffectTimeline=[];
 if(data.primary) organEffectTimeline.push({organ:data.primary[0],structureIds:data.primary.slice(1),role:'primary',start:data.onset,end:1,weight:.85});
 data.secondary.forEach((organ,index)=>organEffectTimeline.push({organ,structureIds:[],role:index===0?'secondary':'optional',start:Math.min(.95,data.peak+.08+index*.05),end:1,weight:index===0?.32:.18}));
 const symptoms=symptomOverrides[profile.id] || (profile.typicalSymptoms?.length?profile.typicalSymptoms:['Mekanizma gözlemi']);
 const symptomTimeline=symptoms.map((symptom,index)=>({symptom,start:Math.min(.95,data.onset+index*.08),end:persistent?1:Math.min(1,data.recovery+index*.04),minActivity:.12+Math.min(index,4)*.07}));
 const kind=profile.mechanism==='genetic'?'direct-genetic':profile.mechanism==='oncology'?'indirect':profile.mechanism?.startsWith('infectious')?'response':'indirect';
 const denySpread=['rabies','tetanus','lyme','shingles','avian-flu-like'].includes(profile.id);
 const restricted=['hepatitis-b','hepatitis-c','hiv','gonorrhea','syphilis'].includes(profile.id);
 const contagious=profile.contagious ?? profile.mechanism?.startsWith('infectious') ?? false;
 const verifiedSources=[...(profile.sources||[])];
 for(const topic of symptomSources[profile.id] || [])verifiedSources.push({title:'MedlinePlus: Belirti karşılaştırması (eğitim hipotezi)',url:`https://medlineplus.gov/${topic}.html`,accessedAt:'2026-10-13'});
 if(transmissionSources[profile.id]) verifiedSources.push({title:'CDC: Yayılım ve mekanizma bağlamı',url:transmissionSources[profile.id],accessedAt:'2026-10-13'});
 if(geneticDetails[profile.id]) verifiedSources.push({title:'MedlinePlus Genetics: Gen ve protein ilişkisi',url:geneticDetails[profile.id].sourceUrl,accessedAt:'2026-10-13'});
 const notes=['Seyir kesirleri ve katsayıları eğitim tasarımıdır; klinik süre, organ hasarı, komplikasyon olasılığı veya tedavi başarısı değildir.',...data.flags];
 if(restricted) notes.push('Yayılım yalnız belirli maruziyet yollarıyla ilişkilidir; sıradan şehir teması veya solunum bulaşı gibi yorumlanmaz.');
 if(profile.profileType==='legacy-educational') notes.push('Belirtiler kaynaklı karşılaştırma ipuçlarıdır; gerçek etken veya hastalık tanısı doğrulanmaz.');
 if(!data.primary) notes.push('Birincil hedef doku mevcut atlas kapsamı dışında; görsel motor başka organda birincil hasar uydurmaz.');
 return {...profile,family:data.family,subtype:data.subtype,onsetPattern,progressionPattern,recoveryPattern,trajectory,
 affectedSystems:profile.affectedSystems || (data.primary ? [({lungs:'respiratory',blood:'systemic',brain:'neurological',muscle:'muscular',digestive:'digestive',renal:'renal',endocrine:'metabolic',skin:'skin'})[data.primary[0]]] : []),
 typicalSymptoms:symptoms,symptomTimeline,organEffectTimeline,
 immunePattern:profile.immuneResponseType || 'Mekanizmaya özgü soyut konak yanıtı',complicationFlags:data.flags,
 dnaRelation:{...(profile.dnaRelation||{}),kind,...(geneticDetails[profile.id]||{}),explanation:profile.dnaRelation?.explanation || 'Hücresel konak yanıtı kavramsaldır; hastaya ait DNA dizisi veya gerçek genom düzenlemesi hesaplanmaz.'},
 publicSpreadApplicable:!denySpread && contagious===true,contagious:denySpread?false:contagious===true,spreadMode:denySpread?'not-modeled':restricted?'route-specific':contagious?'abstract-exposure':'not-applicable',
 educationalTimeline,affectedTissues:profile.id==='pku'?['Metabolik enzim işlevi']:data.primary?.slice(1).length?data.primary.slice(1):[data.subtype],educationNotes:notes,sources:verifiedSources,temporalSources:verifiedSources};
}
