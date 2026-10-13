/** Conceptual relationships only: no pathogenic sequences or operational mutation targets. */
export const DNA_RELATION_TYPES=['DIRECT_GENETIC','HOST_RESPONSE','PATHOGEN_GENOME','INDIRECT','NONE'];
const source=(title,url)=>({title,url,accessedAt:'2026-10-13'});
const influenzaSource=source('CDC: Influenza RNA genomu','https://www.cdc.gov/flu/php/viruses/genetic-characterization.html');
const bacterialGenetics=source('NCBI: Bakteriyel DNA','https://www.ncbi.nlm.nih.gov/books/NBK7908/');
const geneticsSources={
 'sickle-cell':'https://medlineplus.gov/genetics/condition/sickle-cell-disease/',
 'cystic-fibrosis':'https://medlineplus.gov/genetics/condition/cystic-fibrosis/',
 huntington:'https://medlineplus.gov/genetics/condition/huntingtons-disease/',
 dmd:'https://medlineplus.gov/genetics/condition/duchenne-and-becker-muscular-dystrophy/',
};
const virusClassification=source('NCBI: Virüslerin genetik materyali','https://www.ncbi.nlm.nih.gov/sites/books/NBK8174/');
const genomes={influenza:'RNA',chickenpox:'DNA',measles:'RNA',mumps:'RNA',rubella:'RNA','hepatitis-a':'RNA','hepatitis-b':'DNA','hepatitis-c':'RNA',hiv:'RNA',norovirus:'RNA',rabies:'RNA',shingles:'DNA'};
const extraSources={
 influenza:influenzaSource,
 measles:source('NLM: Kızamık RNA genomu','https://pubmed.ncbi.nlm.nih.gov/6537820/'),
 mumps:source('NLM: Kabakulak viral RNA','https://pubmed.ncbi.nlm.nih.gov/2789521/'),
 rubella:source('NCBI: Kızamıkçık RNA virüsü','https://www.ncbi.nlm.nih.gov/books/NBK8200/'),
 chickenpox:source('NLM: Varicella-zoster DNA genomu','https://pubmed.ncbi.nlm.nih.gov/3018124/'),
 shingles:source('NLM: Varicella-zoster DNA genomu','https://pubmed.ncbi.nlm.nih.gov/3018124/'),
 'hepatitis-a':source('NCBI: Hepatit virüsleri','https://www.ncbi.nlm.nih.gov/sites/books/NBK7864/'),
 'hepatitis-b':source('NCBI: Hepatit B DNA virüsü','https://www.ncbi.nlm.nih.gov/books/NBK513492/'),
 'hepatitis-c':source('NCBI: Hepatit C RNA virüsü','https://www.ncbi.nlm.nih.gov/sites/books/NBK7864/'),
 hiv:source('NIH: HIV yaşam döngüsü ve entegrasyon','https://hivinfo.nih.gov/understanding-hiv/fact-sheets/hiv-life-cycle'),
 norovirus:source('CDC: Norovirüs RNA materyali','https://www.cdc.gov/norovirus/php/laboratories/index.html'),
 rabies:source('NCBI: Kuduz RNA virüsü','https://www.ncbi.nlm.nih.gov/books/NBK8618/'),
};
const step=(label,text,type='affected')=>({label,text,type});
export const DIRECT_DNA_LINKS={
 'sickle-cell':{gene:'HBB',protein:'Beta-globin / hemoglobin',organTarget:'blood',cellSummary:'Eritrosit şekli ve hemoglobin işlevi doku oksijenlenmesiyle ilişkilidir.',variant:'Beta-globin işlevi için kısa sentetik değişim örneği',pathway:[step('DNA','HBB ile ilişkili kalıtsal varyant'),step('RNA','Gen ifadesinin kavramsal ara basamağı','response'),step('Protein','Beta-globin / hemoglobin işlevi'),step('Hücre','Eritrosit davranışı'),step('Doku','Oksijenlenme bağlamı','response'),step('Organ','Dolaşım sistemi','response'),step('Belirti','Ağrı ve halsizlik gözlemleri','response')]},
 'cystic-fibrosis':{gene:'CFTR',protein:'CFTR iyon kanalı',organTarget:'lungs',cellSummary:'Epitelde iyon ve sıvı dengesi; solunum ve sindirim dokularındaki sonuçlar kavramsal olarak incelenir.',variant:'CFTR işlevi için kısa sentetik, çerçeve koruyan silinme örneği',pathway:[step('DNA','CFTR ile ilişkili kalıtsal varyant'),step('RNA','Gen ifadesi','response'),step('Protein','CFTR kanal işlevi'),step('Hücre','Epitel iyon / sıvı dengesi'),step('Doku','Salgıların özellikleri','response'),step('Organ','Solunum ve sindirim sistemi','response'),step('Belirti','Profil bulguları','response')]},
 huntington:{gene:'HTT',protein:'Huntingtin',organTarget:'brain',cellSummary:'Huntingtin ile ilişkili protein etkisi nöron ve sinir sistemi işleviyle karşılaştırılır.',variant:'Tekrar genişlemesini kavramsal gösteren kısa sentetik örnek',pathway:[step('DNA','HTT ile ilişkili kalıtsal değişiklik'),step('RNA','Gen ifadesi','response'),step('Protein','Huntingtin'),step('Hücre','Nöron işlevi'),step('Doku','Sinir dokusu','response'),step('Organ','Beyin / sinir sistemi','response'),step('Belirti','Hareket ve biliş gözlemleri','response')]},
 dmd:{gene:'DMD',protein:'Distrofin',organTarget:'muscle',cellSummary:'Distrofin işlevi ile kas liflerinin yapısal desteği kavramsal olarak ilişkilendirilir.',variant:'Kas proteini işlevi için kısa sentetik çerçeve kayması örneği',pathway:[step('DNA','DMD ile ilişkili kalıtsal varyant'),step('RNA','Gen ifadesi','response'),step('Protein','Distrofin'),step('Hücre','Kas lifi'),step('Doku','Kas dokusu','response'),step('Organ','İskelet kasları','response'),step('Belirti','Güç ve hareket gözlemleri','response')]},
};
const uniqueSources=items=>items.filter((item,index)=>item?.url&&items.findIndex(other=>other?.url===item.url)===index);
export function enrichDNARelation(profile, legacy=profile.dnaRelation || {}) {
 const mechanism=profile.mechanism || profile.category || '';
 const virtual=profile.synthetic===true || profile.profileType==='virtual' || legacy.kind==='abstract';
 if(virtual)return {...legacy,type:'NONE',humanGenomeAffected:null,pathogenGenomeType:null,explanation:'Kurgu vakada yalnız soyut genetik etki tartışılır; gerçek gen, genom veya mutasyon hedefi tanımlanmamıştır.',answer:'SOYUT BAĞLAM',qualification:'Gerçek genetik değişiklik veya etken genomu modellenmiyor.',sources:[],pathway:[],organTarget:null,cellSummary:'Soyut hücresel yanıt.'};
 const direct=mechanism==='genetic';const infectious=String(mechanism).startsWith('infectious/') || ['viral','bacterial','mixed'].includes(mechanism);
 const oncology=mechanism==='oncology';
 const link=DIRECT_DNA_LINKS[profile.id];
 const pathogenGenomeType=infectious?(genomes[profile.id] || (mechanism==='infectious/bacterial' || mechanism==='bacterial'?'DNA':null)):null;
 let type=direct?'DIRECT_GENETIC':infectious?'HOST_RESPONSE':'INDIRECT';
 let humanGenomeAffected=direct?true:infectious?false:null;
 let answer=direct?'EVET · Kalıtsal genetik temel':infectious?'HAYIR · Bu model insan DNA dizisini değiştirmez':'DOLAYLI / VAKAYA GÖRE';
 let qualification=direct?'Hastalık normal DNA’yı sonradan değiştirdi anlamına gelmez; başlangıçtaki kalıtsal genetik bağlam incelenir.':infectious?'Bu, bireysel genom testi sonucu değildir; konak hücre yanıtı ile etken genomu farklıdır.':'Bu vaka için bir kişinin DNA dizisinde değişiklik olduğu ölçülmedi.';
 let explanation=direct?'Kalıtsal genetik farklılıklarla protein ve doku işlevi arasındaki ilişki gösterilir; gerçek tam gen veya hasta genomu yüklenmez.':infectious?'Etken genetik materyali insan DNA’sından ayrıdır. Konak gen ifadesi ve bağışıklık yanıtı kavramsal olarak incelenir.':'Genetik yatkınlık, gen ifadesi ve hücresel işlev arasındaki dolaylı bağlam tartışılır; tek bir neden olan gen veya mutasyon varsayılmaz.';
 if(profile.id==='influenza')explanation='Influenza RNA genomlu bir virüstür. İnsan DNA dizisi bu modelde doğrudan değiştirilmez; konak hücresinin gen ifadesi ve bağışıklık yanıtı gösterilir.';
 if(profile.id==='hiv'){type='PATHOGEN_GENOME';humanGenomeAffected=true;answer='ÖZEL DURUM · Enfekte hücrede entegrasyon';qualification='HIV RNA genomludur; yaşam döngüsünde oluşan viral DNA enfekte hücrenin DNA’sına entegre olabilir. Bu, tüm insan genomunun değişmesi veya kalıtsal hastalık mutasyonu değildir.';explanation=qualification+' Burada gerçek entegrasyon konumu veya genom dizisi üretilmez.';}
 if(profile.id==='hepatitis-b'){humanGenomeAffected=null;qualification='HBV DNA genomludur; viral DNA entegrasyonu bazı bağlamlarda olabilir. Bireysel entegrasyon veya insan DNA değişikliği bu modelde ölçülmez.';answer='VAKAYA GÖRE · Entegrasyon burada ölçülmez';}
 if(oncology){humanGenomeAffected=null;explanation='Kanserde hücre büyümesini düzenleyen somatik genetik değişiklikler rol oynayabilir; bunlar kalıtsal varyantlarla aynı değildir. Bu vaka bir kişinin gerçek tümör genomunu ölçmez veya tek bir mutasyonun tanısını üretmez.';}
 const bacterial=mechanism==='infectious/bacterial'||mechanism==='bacterial';
 const sources=uniqueSources([...(profile.sources || []),...(legacy.sources || []),...(extraSources[profile.id]?[extraSources[profile.id]]:[]),...(pathogenGenomeType?[bacterial?bacterialGenetics:virusClassification]:[]),...(geneticsSources[profile.id]?[source('MedlinePlus Genetics: Gen ve protein',geneticsSources[profile.id])]:[]),...(oncology?[source('NCI: Kanser genetiği','https://www.cancer.gov/about-cancer/causes-prevention/genetics')]:[])]);
 sources.sort((a,b)=>Number(!/genetics\/condition|genetic-characterization|hiv-life-cycle|NBK|pubmed|laboratories|causes-prevention\/genetics/.test(a.url))-Number(!/genetics\/condition|genetic-characterization|hiv-life-cycle|NBK|pubmed|laboratories|causes-prevention\/genetics/.test(b.url)));
 const organTarget=link?.organTarget || profile.organEffectTimeline?.find(item=>item.role==='primary')?.organ || null;
 const cellSummary=link?.cellSummary || profile.cellularMechanism || 'Soyut hücresel işlev bağlamı.';
 const pathway=link?.pathway || (direct?[step('DNA','Kalıtsal genetik bağlam'),step('RNA','Gen ifadesi','response'),step('Protein','Protein işlevi'),step('Hücre','Hücresel işlev'),step('Organ','Profil hedef sistemi','response')]:infectious?[step('İnsan DNA’sı','Gen ifadesinin konak bağlamı','neutral'),step('Hücresel yanıt','Konak hücre yanıtı','response'),step('Bağışıklık','Konak savunma gözlemleri','response'),step('Organ','Temsili sistem etkisi','response'),step('Belirti','Güncel vaka gözlemleri','response')]:[step('DNA bağlamı',oncology?'Somatik / kalıtsal ayrımı':'Çok etkenli yatkınlık','neutral'),step('Hücre','Hücresel işlev','response'),step('Organ','Profil sistemi','response'),step('Belirti','Model gözlemleri','response')]);
 return {...legacy,type,humanGenomeAffected,pathogenGenomeType,answer,qualification,explanation,sources,...(link?{gene:link.gene,protein:link.protein,educationalVariant:{presetId:legacy.presetId || profile.id,label:link.variant,synthetic:true}}:{}),pathway,organTarget,cellSummary};
}
