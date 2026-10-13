# Genetik Keşif

Next.js, React Three Fiber ve Three.js ile hazırlanmış etkileşimli 3B genetik öğrenme laboratuvarı.

## Özellikler

- Mouse ile döndürülebilen ve yakınlaştırılabilen 3B DNA çift sarmalı
- A-T / G-C bilgilerini gösteren tıklanabilir nükleotitler
- Promotör, ekzon, intron ve gen bölgesi odaklama
- DNA zincirlerini ayırma ve bağımsız "sökülmüş görünüm"
- Boş alanda sağ tık ile sök / yeniden topla; baz üzerinde sağ tık ile işlem menüsü
- Söküm sırasında biyolojik olarak ne anlama geldiğini açıklayan eğitim paneli
- Baz değişimi, ekleme ve silme mutasyonları
- Geri al / yinele / mutasyonları sıfırla
- Orijinal ve mutasyona uğramış DNA karşılaştırması
- DNA → mRNA → protein simülasyonu
- Sessiz, missense, nonsense ve frameshift mutasyon analizi
- Tamamen Türkçe holografik arayüz

## Çalıştırma

```bash
npm install
npm run dev
```

Ardından tarayıcıda `http://localhost:3000` adresini aç.

## Production kontrolü

```bash
npm run build
```

## Tek baz işlemleri

Baz üzerinde sağ tıkla veya baz bilgisindeki **Baz işlemleri** düğmesini kullan. **Bazı Çıkar**, 1 saniyelik animasyonla yalnızca seçilen zincirde AP hasarı oluşturur; eş baz ve omurga korunur, dizi uzunluğu değişmez. **Nükleotidi Sil** ise animasyondan sonra referans diziden ilgili konumu siler ve tamamlayıcı zinciri yeniden kurar. Geri al / yinele her iki işlemi de kapsar.

27 bazlık mini gen bir eğitim modelidir: 3 baz promotör, 12 baz kodlayan ekzon, 6 baz intron, 6 baz kodlayan ekzon. Olgun mRNA ve protein, ekzonların birleştirilmiş dizisinden hesaplanır. İntron ve promotör değişimleri için doğrudan frameshift varsayılmaz; splicing ve ekspresyon olasılıkları açıklanır. AP hasarlı kodlayan DNA için protein sonucu öngörülmez; gösterilen dizi hasar öncesi referanstır.

## Doğrulama

```bash
npm test
npm run build
npm start
```

Örnek: 8. konumdaki Adenin → sağ tık → Nükleotidi Sil. Toplam DNA 27 → 26 baz, kodlayan DNA 18 → 17 baz olur. Olgun mRNA `AUG | GAU | UUC | CGG | ACU | AA`, protein `Met – Asp – Phe – Arg – Thr` olarak hesaplanır; frameshift ve protein değişimi gösterilir. Son eksik kodon çevrilmez.

## V3 performans

V3 cam görünümü, hastalık senaryoları ve baz etkileşimleri korunur. Hidrojen bağları ve platform işaretleri instanced mesh kullanır; bölge seçimi yalnızca omurga renk tamponlarını günceller. Duran animasyonların hesapları atlanır, ilgisiz React güncellemeleri memoize edilir.

DPR cihaz yüküne göre 0.85–1.5 arasında kademeli ayarlanır. Cam kırılma tamponu 0.75 çözünürlük ölçeğinde çizilir; Composer kenar yumuşatma korunur. Zayıf cihazlarda ince ayrıntılar hafif yumuşayabilir. Kalite değişimleri arasında en az 8 saniye beklenir.

`?perf=1` eklenince yalnızca yerel ölçüm paneli açılır: tarayıcı kare aralığı, p95, bütün çizim geçişlerinin çağrı/üçgen sayısı ve DPR. Bu GPU zamanlayıcısı değildir; sonuç cihaz, sekme görünürlüğü ve yükten etkilenir. V3 ile aynı tarayıcıdaki geliştirme önizlemesinde çizim sayısı yaklaşık 316’dan 206’ya indi; bu bir sabit FPS garantisi değildir.

## Baz gezinme ve deney raporu

Model altındaki oklar önceki/sonraki bazı seçer; zincir düğmesi eş bazı seçer. **Baz işlemleri** dokunmatik ekranda da menüyü açar. Menü ok tuşları, Home/End ve Escape ile kullanılabilir. Değişmiş DNA dizisindeki harfler 3B seçime bağlıdır; sağ/sol ok ile dizide gezinilebilir.

Protein Etki Analizi altındaki **Metin indir** / **JSON indir** düğmeleri orijinal ve güncel DNA, ekzonlar, mRNA, protein, AP hasarı, bölgeye duyarlı açıklamalar ve geçerli işlem geçmişini yerel dosya olarak kaydeder. Animasyon sürerken yarım işlem raporlanmaz. AP hasarında çeviri yalnızca kayıtlı baz dizisinin hesabı olarak etiketlenir. İndirme sunucuya veri göndermez.

3B sahne ekran dışına çıktığında veya sekme gizlendiğinde çizim döngüsü duraklatılır; tekrar görünür olduğunda mevcut model ve kamera korunarak devam eder.

## Hastalık Laboratuvarı ve Laboratuvar Arşivi

`lib/simulation.js` deterministik Influenza, bakteriyel ve karma eğitim senaryolarını ilerletir. `hooks/useDiseaseSimulation.js` tek canlı state'i yönetir. Soyut 0–100 metrikleri klinik tahmin değildir. DNA modülü bağımsız olarak korunur.

`components/DiseaseLaboratory.jsx` gün kontrolleri, gözlemler, müdahaleler ve kayıt akışını; `components/LaboratoryArchive.jsx` cam numune tüplerini, arama/filtreleri, öğretmen notlarını, yıldızı, onaylı silmeyi ve sonuç analizini sunar.

Storage servisi `services/savedCases.js`: `genetik-kesif.saved-cases.v1` anahtarında `{schemaVersion:1,counters,cases}` saklanır. Her vaka sabit kimlik/kod, tarih, kategori, ad/açıklama, öğretmen notu, isStarred ve explicit snapshot içerir. Snapshot gün/durum, seed/config ve başlangıç scenario config, metrikler, belirtiler, tanı/güven, doktor notları, olay/bülten, müdahaleler, toplum sağlığı kararları, timeline ve final outcome alanlarını doğrulayarak kopyalar. Fonksiyon veya runtime referansı kabul edilmez. Bozuk/eski kayıtlar okumada güvenle atlanır; bozuk store yazılarak ezilmez.

Devam etme snapshot'ı doğrular ve aynı gün/değerlerle duraklatılmış açar; Oynat ile devam edilir. Baştan simüle et ayrı fonksiyonla kaydedilmiş seed ve başlangıç katsayılarından Gün 0 üretir, müdahale/geçmişi temizler. Kayıtlar yalnızca kullanılan tarayıcı ve origin'de saklanır; buluta aktarılmaz. JSON raporu arşiv detayından indirilebilir.

Doğrulama: npm install, npm test (40 test), npm run build başarılı. Tarayıcı: Gün 4 kaydet/refresh, devam Gün 4→5, yeniden başlat Gün 0, yıldızı kaldır/filtre kontrolü; konsol hatasız. Silme kalıcılığı ve bozuk kayıt davranışı storage testlerinde doğrulandı.

## Kaynaklı hastalık / sağlık kataloğu

`components/MedicalCatalog.jsx` kaynaklı sağlık başlıklarını arar, kategorilerle filtreler ve sayfalayarak gösterir. Kaynak metinleri İngilizcedir; Türkçe arayüz ve yaygın Türkçe arama eş anlamları kullanılır. Bu koleksiyon tüm bilinen hastalıklar veya tüm tedaviler olarak etiketlenmez.

`public/data/medical-catalog.json` MedlinePlus'un resmi XML dosyasından üretilir; sourceDate, fetchedAt, sourceUrl ve attribution saklanır. `scripts/import-medlineplus.ps1` en yeni veri dosyasını kaynak sayfadan bulup yeniler. Yalnızca kamuya açık sağlık başlığı özetleri ve kaynak bağlantıları alınır; lisanslı ansiklopedi/ilaç içerikleri kopyalanmaz. Özetler HTML olarak değil düz metin olarak gösterilir.

Tedavi ve sonuç/komplikasyon alanları resmi kategori bağlantılarından oluşturulur. Kaynak bölümü bulunmayan konular açıkça belirtilir. Genel bakteriyel/karma modeller tek tek hastalıklarla eşleştirilmez. Sadece Influenza başlığı mevcut soyut eğitim modelini açabilir; kalan konularda simülasyon henüz desteklenmiyor bilgisi görünür.

## Modüler sanal laboratuvar

Next.js route'ları: `/` kontrol merkezi, `/dna` bağımsız DNA deney alanı, `/simulation` dört bölgeli simülatör, `/outbreak` toplum modeli, `/archive` numune koleksiyonu ve `/catalog` kaynak araştırma ekranı. `LabShell` ortak uygulama navigasyonunu sağlar; layout'a bağlı `SimulationProvider` tek `useDiseaseSimulation` instance'ını route değişimleri boyunca korur. Tam sayfa yenilemede aktif deney başlangıca döner; arşiv kayıtları localStorage'da korunur.

`SimulationScene` dört procedural R3F görünüm sunar: molekül/RNA şeması, hücre/yanıt, vücut/organ/doku anatomisi ve 10 kişilik toplum şeması. OrbitControls, zoom ve tıklanabilir açıklama işaretçileri vardır. Partiküller instanced geometry, anatomi paylaşılan geometry/material kullanır; cihaz DPR'si sınırlandırılır. Modeller anatomik veya klinik doğruluk iddiası taşımaz.

`lib/outbreak.js` altı kamu sağlığı kararının soyut sağlık/toplum/ekonomi etkilerini mevcut timeline'dan deterministik hesaplar. Kararlar mevcut publicHealthDecisions alanında arşivlenir. Hücresel simülasyon hesapları değiştirilmedi. Yeni belirtiler ve bağışıklık/yayılım/bakım eşikleri geçildiğinde kayıtlı danışman/bülten mesajları üretilir; kısa bülten bildirimi geçmiş panelini açar. Timeline geçmiş görünümü yalnız önizler, deney geçmişini geri sarmaz.

## Ölçeklenebilir DiseaseEngine ve Sanal Oluşturucu

`data/diseaseProfiles.js` 52 kaynaklı gerçek profili ve eski eğitim varyantlarıyla toplam 63 senaryoyu içerir. Ad/kategori, sistemler, tipik belirtiler, kaynaklar, DNA ilişkisi, bağışıklık/mekanizma özeti ve eğitimsel timeline veri dosyasındadır; simulation.js içine hastalık listesi gömülmez. Kaynak metinleri ve profil kökenleri MedlinePlus'a bağlıdır. Sayısal katsayılar klinik olarak doğrulanmış prognoz veya süre değildir.

`lib/DiseaseEngine.js` sekiz mekanizma stratejisini yönetir: infectious/viral, infectious/bacterial, infectious/mixed, genetic, autoimmune, metabolic, neurological, oncology. `simulation.js` oluşturma/ilerletme/yeniden başlatma için uyumlu cephedir. Bulaşıcı olmayan modeller patojen yükü ve enfekte hücre üretmez; ayrı işlev/aktivite göstergeleri kullanır. Toplum ekranı bu vakaları salgın gibi saymaz. Enfeksiyonlar doğrudan insan DNA mutasyonu olarak sunulmaz. Dört desteklenen genetik DNA örneği kısa temsili dizide öğretim analoğunu açar; kaynak açıklaması gösterilir.

`/creator` ve `VirtualDiseaseCreator` sınırlı soyut parametrelerle kurgu vaka üretir. `virtualDisease.js` yalnızca izin verilen eğitim alanlarını kopyalar, 0–100 değerlerini ve 7–30 adımlık süreyi sınırlar. Genom, gerçek hedef ve üretim talimatı alanları kabul edilmez. Kurgu kimliği ve başlangıç config'i snapshot'a girer; arşivden aynı seed/config ile devam/yeniden başlatılabilir. Yeni mekanizmaların optional metrics alanları explicit snapshot doğrulamasında korunur. Eski storage sayaçları yeni sınıflar için geriye uyumlu biçimde genişletilir.

Gizemli Vaka'da öğretmen gerçek/kurgu profili yapılandırır; öğrenci görünümü adı, seçim listesini ve kaynak yapılandırmasını gizler. Gözlem, metrik, belirti, model ve bültenler görünür kalır. Bu bir eğitim görünümü ayrımıdır; istemci verilerini gizleyen güvenli sınav veya authentication sistemi değildir.

Tam vücut modeli; vücut, organ ve hedef doku ölçeklerine ayrılır. Etkilenen birincil/ikincil sistemler ve renk yoğunluğu profile/state metriklerine bağlıdır. Yapılar şematiktir; gerçek anatomik ölçüm değildir. Salgın ekranı aynı güne ait kararsız temel modelle karşılaştırma, karar etkisinin başlangıcı, doluluk ve ağır vaka göstergeleri sunar; nüfus 10.000 kişilik temsili eğitim örneğidir.


## Anatomi ve toplum görselleştirmesi

`components/anatomy/AnatomyModel.jsx` sekiz sistem için ayrı organ ve hedef doku geometrileri sunar. `OrganDetails` paneli sistemin işlevini, profile bağlı etkilenme nedenini ve kaynakları gösterir; global göstergeler organ hasarı ölçümü olarak sunulmaz. Etkilenen sistem düşük şiddette de kırmızı görünür, yoğunluk arttıkça turuncu-kırmızıya geçer.

`SocietyPeople` tam 10 insan figürü kullanır: hasta kırmızı, ağır durum turuncu, sağlıklı mavi, temaslı/riskli sarı, iyileşen gri. Bir figür %10 temsil eder; yuvarlanmış figür oranı gerçek model yüzdesinden ayrı gösterilir. Risk figürleri gerçek temas sayısı değildir. Bulaşıcı olmayan profillerde salgın gösterimi kapatılır.


Holografik anatomi görünümünde normal yapılar cyan, açıkça hedeflenen sistemler mercan kırmızısı/turuncudur. Sistemik bağışıklık yanıtı tek başına damar hasarı olarak renklendirilmez. Hafif tarama halkaları ve kamera ile konumu güncellenen organ etiketi 3B etkileşimleri engellemez. Organ malzemeleri paylaşılıp şiddet düzeyi kuantize edilir; azaltılmış hareket tercihinde tarama/nabız hareketi durur.


## Gerçek referans anatomi

`ReferenceAnatomy` yerel HRA GLB varlığını (27 semantik mesh, 286.429 üçgen, 5,7 MB) yükler. Seçimler organ/alt yapı hiyerarşisindeki gerçek mesh adlarına bağlanır. Sol/sağ akciğer, bronşlar, böbrek korteksi/medullası ve bağırsak alt bölümleri ayrı yakın görünüme geçer. Holografik clearcoat/emissive ve Fresnel kenar efekti, orijinal geometrilerin yerleşimini değiştirmez.

Mide ve temsilî omuz/kol kasları BodyParts3D STL varlıklarından yalnız ayrı organ görünümünde gösterilir; erkek BodyParts3D ile kadın HRA koordinatları birlikte kayıtlı değildir. Mikroskobik alveol/nefron/deri tabakaları ayrı öğretici şemalardır; gerçek histoloji veya organ meshinden çıkarılan doku değildir. Tam veri atıfları ve lisanslar `public/models/anatomy/` içinde ve hiyerarşi panelinde bulunur. HRA CC BY 4.0, BodyParts3D varlıkları CC BY-SA 2.1 JP koşullarını korur.


Lokal etki maskesi gerçek mesh koordinatlarında eğitimsel Gaussian dağılım kullanır; odak konumu klinik lezyon veya ölçülen inflamasyon alanı değildir. Şiddet genel vaka metriklerinden gelir. Kamera modlar arasında zaman bazlı easing kullanır; elle etkileşim otomatik hareketi keser. GLB/STL yükleme hatası procedural fallback modelini ve açık yedek-model etiketini gösterir.


Bilgi amaçlı yapılar (üst hava yolları, periferik sinirler, ayrı sınıflandırılmamış atardamar/toplardamarlar) yanlış mikrodoku geometrisiyle temsil edilmez. Kullanıcı tam anatomik bağlamda kalır, seçim açıklaması panelde gösterilir. Ayrı geometri ve mikrodoku şeması durumları farklı etiketlenir. Referans yükleme hataları varlık türüne göre sınırlanır; yeni seçimde yeniden deneme yapılır, başarılı varlık hatayı temizler. GLB/STL dönüşmüş geometrileri kaynak nesnesi başına önbelleğe alınır; organ görünümü yalnız görünen meshlerin materyal ve uniformlarını kullanır.


## Profile özgü eğitim seyirleri

63 mevcut senaryo (52 gerçek hastalık profili + 11 eğitim varyantı) `data/diseaseTrajectories.js` içinde 39 anlamlı aile ve özgün alt tip/seyir konfigürasyonu ile zenginleştirilir. Yeni hastalık eklenmedi. Akut, kronik, ilerleyici, alevlenmeli ve ataklı modeller normalize öğrenme zamanını kullanır; belirtiler görünüp azalabilir, organ hedefleri farklı ağırlık ve zaman pencerelerinde etkinleşir. Sayısal katsayılar kaynaklardan alınmış klinik süreler veya prognoz değildir. Kaynaklar mevcut MedlinePlus kayıtları ve gerektiğinde MedlinePlus Genetics/CDC bağlantılarıdır.

`lib/diseaseTrajectory.js` aile/alt tip bileşimini, `DiseaseEngine.js` mekanizma cephesini ve `lib/caseEvents.js` durum değişimlerinden türetilen doktor/bülten olaylarını yönetir. Olay kimlikleri snapshotlarda korunur ve yinelenen UI/motor kayıtları engellenir. `outbreak.js` eğitimsel transmission parametresini kullanır; bulaşıcı olmayan, genel temas modeline uygun olmayan ve belirli maruziyet yolu gerektiren profiller birbirinden açıklamayla ayrılır. DNA kartı doğrudan kalıtsal ilişki ile hücresel yanıtı ayırır; enfeksiyon insan DNA dizisini değiştirmez.

`tests/diseaseDifferentiation.test.mjs` talep edilen 10 temsilî vakayı, gerçek snapshot devamını, belirtileri, notları, organ pencerelerini ve DNA/toplum ilişkisini karşılaştırır. Tüm 63 profilin aynı seed ile 14 eğitim adımındaki metrik seyri ve fenotip imzası ayrıca denetlenir. `docs/disease-profile-audit.json` denetim özeti ve profil kaynaklarını içerir. Anatomi varlıkları, geometri ve holografik shaderlar korunmuştur; mevcut renderer yalnız zaman bazlı etki değerlerini alır.


## Dinamik vaka dosyası

CaseEventEngine biyolojik katsayıları değiştirmeden CLINICAL, LAB, ANATOMY, IMMUNE, PUBLIC_HEALTH, BULLETIN ve ALERT olaylarını gözlem değişimlerinden üretir. Laboratuvar değerleri mutlak model birimleri ve önceki adımla farklarıdır. Doktor hipotezi destekleyen/çatışan kanıtlarla güncellenir; güven puanı tanı olasılığı değildir. Yalnız önemli yeni olaylar bildirim oluşturur.

caseView geçmiş günün tüm kanıtlarını o günle sınırlar; canlı durumu değiştirmez. Anatomi olayları mevcut organ kamerasına bağlanır. Dijital bültenler yayılım değişimi, sistem etkisi ve hastane model eşiğinden türetilir. Bulaşıcı olmayan profiller salgın haberi üretmez. caseReport tarihsel zirveleri, dönüm noktalarını ve olaylara bağlı eğitim açıklamasını simülasyonda ve arşivde gösterir.

Snapshot schemaVersion 1 korunur: clinicalEvents, importantEvents, knowledgeState, hypothesisHistory ve timeline hipotezleri ek alanlardır. Eski kayıtlarda eksik anlatı boş/null yüklenir; yeni gözlemlerle devam edilir. Gizemli öğrenci görünümü profil adını ve yapılandırmayı saklar; rol ayrımı kimlik doğrulamalı sınav güvenliği değildir.


## DNA laboratuvarında aktif vaka

Hastalık Simülatöründeki Genetik ilişkisini incele bağlantısı /dna?mode=case üzerinden Provider içindeki mevcut vaka ve günle açılır. Menü ve ana sayfadaki DNA bağlantıları /dna?mode=free ile bağımsız deney alanını açar. DNAWorkspaceProvider iki ayrı deney geçmişini uygulama açıkken sayfalar arasında korur; vaka günü ilerlemesi veya arşive kaydetme DNA deneyini sıfırlamaz. Yeni vaka/yeniden başlatma yalnız vaka çalışma alanını yeniler. Undo/Redo, AP hasarı ve mutasyon araçları her alanın kendi geçmişini kullanır.

63 profilin dnaRelation verisi DIRECT_GENETIC, HOST_RESPONSE, PATHOGEN_GENOME, INDIRECT veya NONE olarak zenginleşir; legacy kind/presetId alanları korunur. HBB/hemoglobin, CFTR/iyon kanalı, HTT/huntingtin ve DMD/distrofin bağlantıları kısa sentetik model üzerinde ilgili eğitim örneğine bağlanır. Diğer profillerde doğrulanmamış varyant otomatik uygulanmaz. Enfeksiyonda insan DNA dizisiyle etken DNA/RNA materyali farklı sekmelerdir; etken sekmesi gerçek sekans ve mutasyon aracı içermeyen salt okunur şemadır. HIV/HBV entegrasyon ve kanserde somatik/kalıtsal ayrımı koşullu açıklamalarla gösterilir.

Moleküler zincirin organ/hücre düğmeleri tek kullanımlık observationRequest ile mevcut vakayı değiştirmeden ilgili simülasyon ölçeğine geçer. Anatomi ve DiseaseEngine geometri/seyirleri korunur. İnsan DNA görüntüsü tam genom veya gerçek hastalık geni dizisi değildir; laboratuvar deneyi vaka biyolojik metriklerini değiştirmez. Gizemli öğrenci görünümünde profil/gen/protein ayrıntıları önceki görünüm sınırı içinde saklı kalır.


## Toplum / Salgın V2

Toplum modeli beş bölmenin toplamını 10.000 soyut birim olarak korur: healthy, exposed, sick, severe ve recovered. activeCases sıradan hasta ile ağır durumun toplamıdır; ağır grup tekrar sayılmaz. Yayılım eğilimi profile bağlı eğitim katsayısıdır, R0 değildir. Kararlar aynı gün yalnız kaydedilir; sonraki dört adımda aktif olur. Bakım kararı temas azaltmak yerine kapasite/toparlanma üzerinden çalışır. Biyolojik vaka metrikleri toplum kararlarıyla yeniden yazılmaz.

SocietyPeople V2 sabit on temsili figür, beş etiket/ikon/renk, bir saniyelik kontrollü geçiş ve azaltılmış hareket desteği kullanır. Geçmiş günler anında yeniden kurulur. Figür oranı 10 puanlık yuvarlamadır; tam model yüzdesi ayrı gösterilir. Salgın Merkezi toplum, vaka eğrisi ve kararlar olarak üç sütuna ayrılır; Neden açıklamaları, gerçek model yük/kapasite oranı ve kararın bekleyen/aktif durumları aynı tarihsel projeksiyondan gelir.

Kararsız çizelge ve tek karar çıkarma karşılaştırmaları aynı biyolojik geçmiş/seed üzerinde tekrar hesaplanır. En etkili karar ölçütü final aktif birim farkıdır; eşitlikler gösterilir ve katkılar toplanamaz. Yeni vaka maruziyet grubundan aktif gruba geçen akıştır, aktif sayısının pozitif farkı değildir. Olaylar hasta payı artışı, ilk yayılım azalması, sonraki gün karar etkisi ve yüzde 80 kapasite eşiğinde mevcut CaseEventEngine ile üretilir. Yeni snapshot şeması gerekmez; toplum geçmişi kayıtlı biyolojik çizelge ve kararlardan deterministik türetilir.
