# Final Çapraz Denetim Raporu (kullanıcı tarafından sağlanan metin)

**Konu:** "Startup Fikri Yakalama Teknikleri" raporunun sinyal teorisi, NLP mimarisi, üretim parametreleri, pazar kanıtı ve hukuki erişim iddialarının birincil kaynak çapraz doğrulaması
**Denetim tarihi:** 21 Ekim 2026
**Hüküm özeti:** Raporun yönü büyük ölçüde doğru, ölçüsü ve kanıt disiplini kırık. En güçlü kısımlar akademik NLP omurgası, keşif/atama ayrımı ve "LLM karar statüsü yazmamalı" ilkesi; en kritik kırılmalar HDBSCAN parametre reçetesi, evrensel benzerlik eşiği, yanlış atıflar, gelir birimi hataları ve Reddit/ekşi hukuk planı.

## 1. Merkez tez: sinyal hiyerarşisi

| İddia | Hüküm | Çapraz değerlendirme |
|---|---|---|
| Davranış, beyandan daha güçlü sinyaldir | DOĞRU (yön) | Niyet–davranış ilişkisi gerçek ama mükemmel değil; niyet beyanı ödemeye veya harekete geçişe güçlü ama eksik bir öncül. |
| "I wish" ≈ sıfır sinyal | YANLIŞ (kanıt yok) | Doğru formülasyon: beyan gürültülü ve yukarı yanlı bir vektördür; sıfır değerli değildir. Raporun kendi UGC-VOC kabulüyle de çelişiyor. |
| Workaround en güçlü sinyaldir | KISMEN (aşırı genelleme) | Workaround değerli bir araştırma tetikleyicisidir, ancak kullanıcı inovasyonunun ticarileşme taban oranı çok düşük; workaround görmek ödeme kanıtı üretmez. |
| Para/sayı/tekrar hiyerarşisi | DOĞRU (sinyal kalitesi) | Preorder, ücretli pilot, tekrar eden şikâyet ve sayı içeren ihtiyaç ifadeleri metin sinyalleri içinde daha yüksek kalitededir; fakat bunların "ödeme" ile nedensel bağlantısı ölçülmemiş. |
| LOI güçlü taahhüt | KISMEN (riskli) | LOI bağlayıcılığı bağlama göre değişir; Powa örneği, yüksek sayıda LOI'nin ödemeye dönüşmediğini gösteriyor. |

Net düzeltme: sinyal hiyerarşisi şu şekilde revize edilmeli:

```text
Gerçek para / imzalı sözleşme / tekrar eden ücretli kullanım
> Ücretli pilot, preorder, bağlayıcı taahhüt
> Aktif workaround + spesifik workflow pain + tekrar
> Sayı içeren, zamana bağlı, kaynakça taşınan şikâyet
> Genel şikâyet / beğeni / lansman ilgisi
> Beyan, istek, beklenti, "I wish"
```

Ancak hiçbir katman tek başına "ödeme kanıtı" değildir; yalnızca ask hunisi ödeme kanıtını üretebilir.

## 2. Akademik NLP omurgası

| İddia | Hüküm | Not |
|---|---|---|
| Timoshenko & Hauser 2019 tasarımı | DOĞRU | 115.099 review, 12.000 cümle, üç analist ve 91/94 ihtiyaç yakalama yapısı kaynakla uyumlu. |
| UGC-VOC görüşme VOC'u kadar değerli olabilir | KISMEN | Makale "at least as valuable, likely more valuable" diyor; "eşdeğer" ifadesi kabul edilebilir ama kesin eşitlik değil. |
| "%40'tan %80'e çıkar, katlar halinde büyütür" | KISMEN | Alıntı hipotetik; ölçülebilir kazanç daha dar, yaklaşık %15–22 aralığında. |
| AR-Miner | DOĞRU | %35,1 informative oran ve 0,70 hit-rate kaynakla uyumlu. |
| SFT-LLM "analist düzeyi" | KISMEN | Alıntı doğru; ancak sonuç 1.549 etiketli CN-verbatim çiftine dayanıyor. Bu eğitim verisi yoksa "analist düzeyi" genellenebilir kanıt değildir. |
| TopicImpact, NIST, LLM-ITL | DOĞRU | Kaynaklar ve temel bulgular doğrulanmış görünüyor. |
| CiteCheck %69,7 / LLM %4,2–18,5 | YANLIŞ | Bu sayılar CiteME'ye ait; CiteCheck'in kendi sonucu yaklaşık %88,9 doğruluk. Atıf hijyeni raporunda atıf hatası, güvenilirliği ciddi biçimde zedeler. |

Karar: Akademik omurga korunmalı; ancak her LLM çıktısı "çıkarım" değil, kaynak bağlantılı kanıt çıkarımı olarak etiketlenmeli. LLM'in rolü: metinden `problem`, `actor`, `workaround`, `frequency`, `money_signal`, `source_quote`, `confidence` alanlarını ayıklamak. Nihai "fırsat" kararı LLM'e değil, insan denetimli kural + istatistik + ask sonucuna bırakılmalı.

## 3. Üretim parametreleri: en kritik teknik kırılma

| İddia | Hüküm | Düzeltme |
|---|---|---|
| `min_cluster_size=5 + epsilon≈0 + leaf` | YANLIŞ (kombinasyon) | Bu ayar kısa metinde mikro-kümeleri çoğaltır. `epsilon` tam da yakın mikro-kümeleri birleştirmek içindir; `epsilon≈0` ile kullanmak dokümantasyon mantığına aykırı. |
| Cosine 0,55 evrensel eşik | YANLIŞ | Bu bir kalibre olasılık değil; embedding modeli, dil, domain ve metin uzunluğuna göre dağılım değişir. |
| Centroid ataması varsayılan doğru yöntem | YANLIŞ | BERTopic'te centroid, kümenin temsilcisi olarak garanti edilmez. Doğru yol: `BERTopic.transform` + `approximate_predict`; alternatif olarak insan onaylı küme örneklerinden kalibre sınıflandırıcı. |
| UMAP eksik | EKSİK ANLATIM | HDBSCAN yüksek boyutta zayıflar; UMAP bu nedenle gerekli. Ancak UMAP uzayındaki yoğunluk, orijinal embedding uzayındaki yoğunlukla birebir örtüşmez. |
| "Deterministik veri yolu" | YANLIŞ ADLANDIRMA | UMAP ve LLM non-determinizm nedeniyle tam determinizm yok. Doğru hedef: pinned environment ile replayable run. |

Savunulabilir reçete:

```text
Embedding
  → model + dil bazlı ayrı hat
  → UMAP(n_neighbors=15, n_components=10, metric=cosine, random_state=42)
  → HDBSCAN(
      min_cluster_size: 15–60, veri ölçeğine göre grid,
      min_samples: sabit ve loglanır,
      cluster_selection_epsilon: 0.05–0.30 grid,
      cluster_selection_method: eom ve leaf ayrı test
    )
  → Aday pattern en az 2 komşu parametre setinde stabil olmalı
  → Yeni kayıt: BERTopic.transform + approximate_predict
  → Düşük margin: "unassigned" + insan/LLM jüri kuyruğu
```

`mcs=5` varsayılan olmamalı; 750 noktalık scikit-learn örneğinde `mcs=3` 90 küme üretirken `mcs=5` yalnızca 4 küme üretiyor; yani parametre duyarlılığı aşırı yüksek. BERTopic, büyük korpuslar için `min_topic_size=100–500` aralığını öneriyor. Kısa metinlerde tek cümleyi doğrudan global HDBSCAN'a vermek yerine thread / user / observation bazında havuzlama yapılmalı; aksi halde outlier oranı ve mikro-küme gürültüsü artar.

Kabul kriterleri:
- Aynı `run_manifest` + aynı ortamda iki koşu, aynı pattern ID setini üretmeli.
- Farklı ortamda sonuç "aynı" beklenmez; yeni `run_id` ile sürümlenmeli.
- Her pattern için en az 3–5 temsilci alıntı, kaynak URL, tarih, dil ve güven notu bulunmalı.
- Atama yöntemi, centroid argmax taban çizgisini insan etiketli örneklemde geçmeli.
- Türkçe ve İngilizce için ayrı kalibrasyon eğrileri tutulmalı.

## 4. Türkçe hattı

| İddia | Hüküm | Düzeltme |
|---|---|---|
| Türkçe için hazır madde yok | KISMEN (fazla mutlak) | Türkçe kaynak yok değil; TR-TEB, TR-MTEB ve Türkçe review veri setleri mevcut. Doğru ifade: "Türkçe için tek dominant model ve hazır kalibre eşik yok." |
| CountVectorizer `stop_words="english"` | YANLIŞ | Türkçe metinde fiilen etkisiz; c-TF-IDF etiketleri "bir, bu, ve, için" gibi tokenlarla kirlenir. |
| Yüzey formu bazlı G-test | YANLIŞ (riskli) | Türkçe agglutinatif olduğu için `zam / zamlar / zamma / zamdan` ayrı sinyal gibi sayılır. Lemma/stem normalizasyonu şart. |
| Burst testinde düzeltmesiz α=0,05 | YANLIŞ | 100K n-gram × 90 pencerede beklenen yanlış pozitif sayısı çok yüksek; BH-FDR zorunlu. |
| G-test'in ki-kare yaklaşımı | KISMEN | Düşük beklenen frekansta güvenilmez; minimum count, exact test veya smoothing gerekir. |

Türkçe hattı için minimum teknik set: ayrı Türkçe stopword listesi; Zemberek tabanlı lemma/stem normalizasyonu ve deasciifier; TR-TEB/TR-MTEB sonuçlarına göre embedding seçimi; 0,55 eşiğinin yeniden kalibre edilmesi; burst sinyalinin lemma/bi-gram bazında hesaplanması; her tetik için n-gram, pencere, gözlenen/beklenen oran, ham p, BH-FDR q-değeri ve run log kaydı.

## 5. LLM'in pipeline'daki yeri

Raporun "LLM'i kümelemeden önce koy" önerisi tehlikeli bir tasarım tercihi. LLM preprocessing'i belirlerse, kümeleme girdisi modelin öznelliğine ve non-determinizmine bağlanır; ayrıca LLM fikir üretimi ölçeklendiğinde çeşitliliği düşürme riski var.

Daha iyi iki alternatif:

| Yöntem | Ne zaman kullan | Avantaj | Sınır |
|---|---|---|---|
| Embedding + HDBSCAN + LLM etiketleme | Büyük, heterojen UGC | Ucuz keşif, ölçeklenebilir | Kısa metinde mikro-küme ve outlier riski |
| TopicGPT / LLooM tarzı taksonomi + alıntılı atama | 1–2K yüksek değerli belge, insan denetimli keşif | Yorumlanabilir kavramlar, atama başına alıntı | Topic generation için güçlü model gerekir; maliyet daha yüksek |

TopicGPT, insan etiketli konularla harmonik ortalama purity 0,74'e karşı en güçlü baseline'da 0,64 rapor ediyor; Mistral-7B atama yapabiliyor ama konu üretmede yetersiz kalıyor. Bu, "LLM önce keşfetsin, sonra her şeyi belirlesin" değil, "LLM taksonomi/etiket üretsin, atama alıntıyla desteklensin" tasarımını destekliyor.

StartupHunt için önerilen ayrım:

```text
Ham UGC
→ ucuz embedding + clustering: aday pattern keşfi
→ istatistiksel filtre: tekrar, kaynak çeşitliliği, zaman, burst
→ Jev / dar LLM: yalnız belirsiz ve yüksek değerli kümelerde jüri
→ güçlü LLM: hipotez, wedge, ICP ve rekabet araştırması
→ insan: pattern onayı, ask tasarımı, pilot kararı
```

LLM asla `review_status = interesting/approved` yazmamalı. Bu, denetimin en sağlam mimari ilkelerinden biri.

## 6. Pazar kanıtı ve başarı vakaları

| İddia | Hüküm | Çapraz değerlendirme |
|---|---|---|
| GummySearch ilk 2 yıl: 10.000+ kullanıcı, 400 ödeyen, $100K, ~$3K MRR | DOĞRU | Founder beyanına dayalı ama tutarlı ve tekrarlanabilir biçimde raporlanmış. |
| $35K MRR "ikincil kaynak" | YANLIŞ (etiket hatası) | Birincil founder duyurusu; bağımsız finansal doğrulama yok. |
| GummySearch ölüm nedeni "Reddit erişimi kesildi" | YANLIŞ | Founder lisans başvurusu yaptı, anlaşamadı ve ihtiyaten kapattı; erişim kesilmedi. |
| BigIdeasDB "$18–23K/ay" | YANLIŞ | Kümülatif gelir aylık gelir sanılmış; aylık yaklaşık $2K, en iyi ay $4,6K. Bu, segment kararını tersine çevirecek 10× hata. |
| Viable "doğrulanmış vaka" | YANLIŞ | 24 Temmuz 2024'te kapanmış. |
| GitHub issue madenciliğinde ticari SaaS yok | YANLIŞ | Buska, SaaSScout, IdeaSaaS, Trendstr gibi ürünler mevcut. Doğru iddia: "baskın/olgun oyuncu yok." |
| Fikir özetleri startup başarısını öngörür | KISMEN | Scott, Shu & Lubynsky'nin 652 girişimlik çalışması, fikir değerlendirmesinin R&D-yoğun sektörlerde öngörücü olduğunu; enterprise software gibi R&D-yoğun olmayan sektörlerde bu örüntünün geçerli olmadığını buluyor. |

Karar: Fikir madenciliği darboğaz değil, filtre. Metin hattı "hangi hipotezler incelenmeye değer?" sorusunu ucuzlatır; "hangi fikir para getirir?" sorusunu cevaplamaz. Para tarafı daha çok kurumsal/ajans VOC, CX ve research bütçelerinde görünüyor; indie tarafta medyan gelirler düşük.

## 7. Ask hunisi: asıl kaldıraç

Raporun en doğru cümlesi: "Only an ask can produce payment evidence." Ancak plan bunu bütçelemiyor.

Örnek dönüşüm aritmetiği:

```text
Soğuk e-posta → booked demo ≈ %0,35
Demo → pilot ≈ %30
10 ücretli pilot için ≈ 9.500 e-posta

Soğuk e-posta → pozitif reply ≈ %0,6
Pozitif reply → pilot ≈ %20
10 pilot için ≈ 8.300 e-posta
```

Bu, "birkaç yüz DM ile validation" ölçeği değil; ICP tanımı, teklif, fiyat, satış zamanı ve takip disiplini gerektiren bir GTM bütçesidir. Metin hattının çıktısı şu forma dönüşmeli:

```yaml
hypothesis_id: H-123
problem: "..."
segment: "..."
existing_workaround: "..."
evidence:
  - source_url
  - verbatim
  - date
  - author_type
  - recurrence_count
ask:
  channel: "DM / email / community"
  offer: "paid pilot / LOI / preorder"
  target_n: 10
  required_outreach: 8500
  success_metric: "paid pilot"
  kill_criteria: "0 paid pilot after X outreach"
```

Böylece metin çıktısı "fikir listesi" değil, ölçülebilir doğrulama deneyi olur.

## 8. Hukuk ve veri erişimi

| İddia | Hüküm | Çapraz doğrulama |
|---|---|---|
| Reddit arşivi teknik olarak erişilebilir | DOĞRU | Arctic Shift gibi arşivler teknik olarak mevcut olabilir. |
| "Arşiv yolu hayatta" | KISMEN | Teknik olarak kısa vadede doğru; ticari ve operasyonel olarak değil. |
| Reddit public API Mart 2027'de kapanıyor | DOĞRU | Reddit, 13 Kasım 2026'da RSS'i kapatacağını; 31 Ekim 2026'da yeni API başvurularını durduracağını; 12 Ocak 2027'den itibaren kayıt dışı uygulamaların erişimini azaltmaya başlayacağını ve Mart 2027'de kalan public API erişimini kapatacağını açıkladı. |
| Reddit dump'ları ticari üründe güvenle kullanılabilir | YANLIŞ / DOĞRULANAMADI | Reddit UA ticari exploit ve izinsiz toplamayı yasaklıyor; dump'lar için net lisans yok. Hukuki risk yüksek. |
| Stack Exchange atıfı BY-SA'yı tamamlar | YANLIŞ | Atıf yalnızca attribution (BY) ayağını karşılar; ShareAlike (SA), uyarlamanın aynı lisansla paylaşılmasını gerektirir. |
| ekşi robots profili uyumlu | YANLIŞ | `ai-input=no` LLM inference girdisini yasaklıyor; robots.txt lisans değildir. |
| FSEK'te TDM istisnası yok | KISMEN / DOĞRULANAMADI | Bu, Türkiye hukuku açısından kritik ve uzman görüşü gerektiren nokta; raporun temkinli yaklaşımı doğru. |
| Trustpilot v. SellCell | YANLIŞ (caption hatası) | Doğru dava: GlobalGuru Tech, LLC d/b/a SellLocked.com v. Trustpilot, Inc.; SellCell taraf değil. |
| Reddit v. Anthropic | DOĞRU | Dava gerçek; ancak sonucun dump kullanan üçüncü ürünler için doğrudan emsal olduğu söylenemez. |

Üretim kararı:
- Çekirdek veri hattı lisansı net kaynaklara kurulmalı: HN, kendi toplanan birinci el görüşmeler, açık lisanslı veri setleri, resmi API'ler.
- Reddit, Mart 2027 öncesinde "değeri azalan, lisansı belirsiz varlık" olarak sınıflandırılmalı; ürüne kritik bağımlılık kurulmamalı.
- Ekşi Sözlük, LLM hattına sokulmamalı.
- Stack Exchange yalnızca SA uyumu netleşmeden verbatim + link düzeyinde kullanılmalı; türetilmiş veri seti veya model eğitimi için ayrı hukuki karar gerekir.
- Her kayıt için şu metadata zorunlu: `license_id`, `ai_use_allowed`, `attribution_required`, `retention_policy`, `deletion_request_supported`, `source_snapshot_hash`.

## 9. Doğrulanamayanlar

- Arctic Shift'in "3,8 TB / 2005-06 → 2025-12" kapsam iddiası.
- Apple App Store review API'sinin ~500 review limiti.
- Google Play review verisinin 7 günlük pencere sınırı.
- Stack Exchange dump taşıma tarihi ve güncel arşiv kapsamı.
- CC FAQ'nin "SA içeren veritabanının tamamı SA mı?" sorusuna verdiği net yanıt; sayfa kesildiği için kesin hüküm kurulamaz.
- Reddit robots.txt'deki AI opt-out sinyalinin hukuki etkisi.
- ekşi'ye açılmış doğrudan dava veya ihtarname kaydı.
- Reddit lisans fiyatlandırması ve araştırmacılar için kalıcı ücretsiz yol.
- 3M vakasındaki gerçekleşen satışların bağımsız doğrulaması.
- Lilien vd. bulgularının modern replikasyonu.
- The Mom Test ve Sales Safari'nin kontrollü etkinlik çalışması.
- "I wish" ifadesinin ödeme/aksiyona öngörü değeri.
- LOI → ücretli müşteri dönüşüm benchmark'ı.
- WhittleOS yazarı ile "Boris" adlı Indie Hackers yazarının aynı kişi olduğu; isim ve argüman örtüşüyor ama kimlik doğrulanmadı.
- MicroConf örneklem büyüklüğü: 469 mu, 700 mü?
- IdeaBrowser'ın outcome verisi.
- İlgili kategorinin gerçek TAM'ı.

## 10. StartupHunt için revize yol haritası

P0 — Ölçüm sözleşmesi:
1. "Deterministik" ifadesini kaldır; "replayable" kullan.
2. Her run için manifest üret: embedding model sürümü, UMAP/Numba/HDBSCAN/BERTopic sürümleri, `random_state`, `NUMBA_NUM_THREADS`, parametreler, veri snapshot hash'i.
3. 0,55'i evrensel eşik olmaktan çıkar; TR/EN için ayrı kalibrasyon yap.
4. Centroid atamasını bırak; `BERTopic.transform` + `approximate_predict` veya kalibre sınıflandırıcı kullan.
5. LLM'in `review_status` yazmasını engelle; LLM yalnızca öneri ve kanıt çıkarımı yapsın.

P1 — Keşif ve Türkçe:
1. `mcs=5 + eps≈0 + leaf` reçetesini bırak; grid dene.
2. Kısa metinleri thread/user/observation bazında havuzla.
3. Türkçe için ayrı stopword, lemma/stem, embedding ve eşik hattı kur.
4. Burst için BH-FDR, minimum count, exact test/smoothing ve null simülasyonu uygula.
5. Her pattern için en az iki komşu parametrede stabilite şartı koy.

P2 — Kanıt, hukuk ve ask:
1. Her sinyali "hipotez" olarak etiketle; permalink, verbatim, bağımsız kaynak sayısı, model/prompt sürümü sakla.
2. Workaround/para/sayı/tekrar testlerini "kanıt türü" olarak göster; "kesin başarı sinyali" olarak sunma.
3. Her yüksek skorlu hipotez için ask planı yaz: ICP, kanal, teklif, fiyat, hedef pilot sayısı, gereken temas hacmi, kill criteria.
4. Lisans metadata'sını veri modelinin birinci sınıf alanı yap.
5. Reddit için Mart 2027 öncesi lisans/kapsam dışı kararını ver; ekşi'yi LLM hattından çıkar.
6. Ürünü "fikir bulucu" değil, "kanıtlı hipotez → ölçülebilir doğrulama deneyi" sistemi olarak konumlandır.

## Nihai hüküm

Raporun en değerli üç mimari sezgisi ayakta:
1. Keşif ve atama ayrılmalı.
2. Burst bağımsız bir kanal olmalı; filtre değil tetik.
3. LLM insan onayı olmadan karar statüsü yazmamalı.

Akademik NLP omurgası da sağlam. Ancak raporun merkezindeki hata şuydu: metin sinyallerini ödeme kanıtına yakınlaştırırken, ask hunisini ve segment kararını yeterince modellemedi. Doğru ürün tezi şu:

> Metin hattı ucuz hipotez üretir; istatistik ve çapraz doğrulama gürültüyü azaltır; Jev/LLM yalnızca belirsiz yüksek değerli kümelerde jüri olur; para kanıtını yalnızca hedefli ask ve ücretli pilot üretir.

Bu haliyle sistem, "daha çok Reddit tarayıp fikir bulan" bir araç değil; lisansı net, tekrarlanabilir, açıklanabilir ve ask hunisine bağlı bir startup hipotezi doğrulama altyapısı olur.
