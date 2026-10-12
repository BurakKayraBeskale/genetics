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

`SimulationScene` dört procedural R3F görünüm sunar: molekül/RNA şeması, hücre/yanıt, vücut/doku şeması, temsili şehir. OrbitControls, zoom ve tıklanabilir açıklama işaretçileri vardır. Partikül/şehir yapıları instanced geometry kullanır; cihaz DPR'si sınırlandırılır. Modeller anatomik veya klinik doğruluk iddiası taşımaz.

`lib/outbreak.js` altı kamu sağlığı kararının soyut sağlık/toplum/ekonomi etkilerini mevcut timeline'dan deterministik hesaplar. Kararlar mevcut publicHealthDecisions alanında arşivlenir. Hücresel simülasyon hesapları değiştirilmedi. Yeni belirtiler ve bağışıklık/yayılım/bakım eşikleri geçildiğinde kayıtlı danışman/bülten mesajları üretilir; kısa bülten bildirimi geçmiş panelini açar. Timeline geçmiş görünümü yalnız önizler, deney geçmişini geri sarmaz.

## Ölçeklenebilir DiseaseEngine ve Sanal Oluşturucu

`data/diseaseProfiles.js` 52 kaynaklı gerçek profili ve eski eğitim varyantlarıyla toplam 63 senaryoyu içerir. Ad/kategori, sistemler, tipik belirtiler, kaynaklar, DNA ilişkisi, bağışıklık/mekanizma özeti ve eğitimsel timeline veri dosyasındadır; simulation.js içine hastalık listesi gömülmez. Kaynak metinleri ve profil kökenleri MedlinePlus'a bağlıdır. Sayısal katsayılar klinik olarak doğrulanmış prognoz veya süre değildir.

`lib/DiseaseEngine.js` sekiz mekanizma stratejisini yönetir: infectious/viral, infectious/bacterial, infectious/mixed, genetic, autoimmune, metabolic, neurological, oncology. `simulation.js` oluşturma/ilerletme/yeniden başlatma için uyumlu cephedir. Bulaşıcı olmayan modeller patojen yükü ve enfekte hücre üretmez; ayrı işlev/aktivite göstergeleri kullanır. Toplum ekranı bu vakaları salgın gibi saymaz. Enfeksiyonlar doğrudan insan DNA mutasyonu olarak sunulmaz. Dört desteklenen genetik DNA örneği kısa temsili dizide öğretim analoğunu açar; kaynak açıklaması gösterilir.

`/creator` ve `VirtualDiseaseCreator` sınırlı soyut parametrelerle kurgu vaka üretir. `virtualDisease.js` yalnızca izin verilen eğitim alanlarını kopyalar, 0–100 değerlerini ve 7–30 adımlık süreyi sınırlar. Genom, gerçek hedef ve üretim talimatı alanları kabul edilmez. Kurgu kimliği ve başlangıç config'i snapshot'a girer; arşivden aynı seed/config ile devam/yeniden başlatılabilir. Yeni mekanizmaların optional metrics alanları explicit snapshot doğrulamasında korunur. Eski storage sayaçları yeni sınıflar için geriye uyumlu biçimde genişletilir.

Gizemli Vaka'da öğretmen gerçek/kurgu profili yapılandırır; öğrenci görünümü adı, seçim listesini ve kaynak yapılandırmasını gizler. Gözlem, metrik, belirti, model ve bültenler görünür kalır. Bu bir eğitim görünümü ayrımıdır; istemci verilerini gizleyen güvenli sınav veya authentication sistemi değildir.

Tam vücut modeli; vücut, organ ve hedef doku ölçeklerine ayrılır. Etkilenen birincil/ikincil sistemler ve renk yoğunluğu profile/state metriklerine bağlıdır. Yapılar şematiktir; gerçek anatomik ölçüm değildir. Salgın ekranı aynı güne ait kararsız temel modelle karşılaştırma, karar etkisinin başlangıcı, doluluk ve ağır vaka göstergeleri sunar; nüfus 10.000 kişilik temsili eğitim örneğidir.
