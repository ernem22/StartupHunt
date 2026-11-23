# Hedef kontrol listesi

Bir iş bitmiş sayılır yalnızca aşağıdaki kutular gerçek bir koşuda işaretlenebiliyorsa. [x] = gerçek koşuda doğrulandı, [ ] = değil. Sayı eşiği yoktur.

## Amaç
Küresel trendleri yakalayan, veriyle desteklenmiş (sayı + kaynak linki), her fikir için Türkiye pazarındaki doluluğu bağımsız bir metrik olarak gösteren bir ürün fikri akışı.

## Ürün (çıktı) kriterleri
- [ ] Son zamanlardan olmalı: her kartta verinin tarihi var ve yakın (günlük koşuyla tazeleniyor)
- [ ] Trend sinyali gerçek sayıdır (sıra, puan, oy, değişim), uydurma ya da akış sırası değil; her sayının kaynak linki var
- [ ] Para kazandığı olabildiğinde kanıtlanmalı (kesin sonuç olmayabilir); kanıt yoksa "aranmadı/bulunamadı" yazılır
- [ ] Türkiye'de benzerlerinin var olup olmadığı tespit edilmeli; sonuç kanıtlı (kanallar, sorgular, linkler)
- [ ] TR doluluğu bağımsız metrik: sıralamayı ve seçimi etkilemez, "dolu" olanlar listeden düşmez
- [ ] Spesifik bir alan ya da ürün tipi içermez; yazılım olarak geliştirilebilecek her şey dahildir
- [ ] Liste gerçek ürünlerden oluşur; gürültü (espri/oyuncak/klon) sayı tutturmak için eklenmez
- [ ] Liste uzunluğu sinyale bağlıdır, sabit sayı yok
- [ ] Her kart insan tarafından okunup "bu gerçekten bir trend mi" diye doğrulanmıştır

## Maliyet ve barındırma
- [ ] Yalnızca ücretsiz ya da ücretsiz kotalı kaynaklar/araçlar
- [ ] Cloudflare gibi ücretsiz barındırmada yaşar; yedek olarak yerel PC
- [ ] Gizli anahtar kodda ya da repoda yok
- [ ] 3 gün üst üste kimse dokunmadan çalışmıştır

## Mimari / kod tabanı kriterleri
- [x] Veritabanı yok: depolama git içindeki JSON (`data/latest.json`, `data/YYYY-MM-DD.json`)
- [x] Boru hattı aşamaları ayrı: kaynaklar → birleştirme → sıralama → TR kontrolü → çıktı (`src/radar`, `src/candidates`, `src/ideas`, `src/tr`)
- [x] Her kaynak diğerinden bağımsız hata yalıtımına sahip: biri bozulursa diğerleri durmaz, hata çıktıda `errors` içinde
- [x] Yeni kaynak eklemek tek modül eklemektir, mevcut kaynaklara dokunmadan
- [ ] Tüm kaynaklar ortak aday şeklini (anahtar, ad, url, kaynaklar, veri noktaları) kullanır ve birleşme alan adı/mağaza kimliği ile olur
- [ ] Koşu tekrar edilebilir ve idempotent: aynı gün iki kez çalışınca veri bozulmaz
- [ ] Sıralama saf fonksiyon, TR kontrolünden ve ağdan bağımsız; testi gerçek veriyle (fixture sadece birim mantığı için, hedef sonucunun kanıtı olarak sayılmaz)
- [ ] Hız sınırları ve nazik istek kuralları her kaynakta uygulanır, User-Agent açık
- [ ] Ölü kod ve hedefe hizmet etmeyen modül yok (eski Python/Docker/DB temizlendi)
- [x] Her mimari karar kısa bir ADR ile kayıtlı (`docs/adr/`)
- [ ] `main`'e yazan hiçbir şey yok; yalnız `dev`
- [ ] Çıktı şeması belgelenmiş ve sürümlü; site yalnızca bu şemayı okur
