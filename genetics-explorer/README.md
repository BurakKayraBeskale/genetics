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
