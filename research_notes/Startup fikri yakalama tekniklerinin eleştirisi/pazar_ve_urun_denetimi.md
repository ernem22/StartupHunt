# Pazar, rakip ve indie-vaka kanıtlarının denetimi

Denetim tarihi: 2026-10-21. Yöntem: birincil kaynak (founder yazısı, şirket sayfası, SEC dosyası, founder LinkedIn/X paylaşımı) önceliklidir; ikincil blog/derleme yalnızca birincil yoksa ve açıkça etiketlenerek kullanılmıştır. Tüm fiyat/rakamlar erişim tarihiyle birlikte verilmiştir; fiyatlar hızlı değiştiği için "bugün" = 2026-10-21.

---

## 1. Verdict tablosu

| # | Rapordaki iddia | Verdict | Tek cümlelik gerekçe |
|---|---|---|---|
| 1.1 | GummySearch ilk 2 yıl: 10.000+ kullanıcı / 400 ödeyen / ~$100K kümülatif / ~$3K MRR | **DOĞRULANDI** | Founder'ın Ağustos 2023 Indie Hackers röportajında birebir bu rakamlar var. |
| 1.2 | Kapanışta "~135–140 bin kullanıcı (kaynaklar 135K–140K farklı gösteriyor)" | **KISMEN** | İki rakam da *aynı* founder'ın iki farklı sayfasından (135.000 ve 140.000); "farklı kaynaklar" değil, founder'ın kendi tutarsızlığı. |
| 1.3 | ~$35K MRR "Failory üzerinden ikincil aktarım" | **YANLIŞ (etiketleme)** | Rakam founder'ın kendi X duyurusunda var (5 Kasım 2025); Failory aktarmıyor, aynı birincil kaynağı tekrarlıyor. |
| 1.4 | Takvim: 6 Kas 2025 duyuru / 30 Kas 2025 kayıt kapanışı / LTD 30 Kas 2026 / 1 Ara 2026 tam kapanış + veri silme | **DOĞRULANDI** | Founder sayfası ve yardım merkezi birebir aynı takvimi veriyor; yalnız LTD tarihinde küçük bir iç tutarsızlık var (aşağıda). |
| 1.5 | "Reddit resmî ticari lisans talebiyle karşılaştı, founder lisanssız çalışmayı reddetti" | **KISMEN** | Lisansı *Reddit talep etmedi*; founder kendisi başvurdu ve anlaşamadı. Ayrıca hiçbir yaptırım/erişim kesintisi bildirilmiyor: kapanış ihtiyati bir uyum kararı. |
| 1.6 | Solo, 4 yıl, kârlı | **DOĞRULANDI** (kârlılık founder beyanı) | Solo ve 4 yıl birincil kaynakta net; "kârlı" için denetlenmiş veri yok, founder'ın kendi ifadesi. |
| 2 | GitHub issue madenciliğinin "2026'da hâlâ ticari SaaS'ı yok" | **YANLIŞ** | En az 4 ticari ürün GitHub issue/discussion madenciliğini açıkça satıyor ve fiyat yayınlıyor: Buska $49/ay, SaaSScout $300 tek seferlik, IdeaSaaS $10–22/ay, Trendstr. |
| 3.1 | IdeaBrowser $499 / $1.499 / $2.999 yıllık | **KISMEN** | Mayıs 2026'da doğru; Ekim 2026 itibarıyla fiyat sayfasında yalnız Pro $1.499 var, Starter yalnız yükseltme olarak, Empire fiyat sayfasından kalkmış. |
| 3.2 | FAQ: "illustrative examples", "never rely solely" | **DOĞRULANDI** | İki cümle de FAQ'da birebir mevcut. |
| 3.3 | IdeaBrowser sonuç verisi (kaç kullanıcı launch etti, gelir) açıklıyor mu? | **KAYNAK BULUNAMADI** | Hiçbir outcome metriği yayınlanmıyor; yalnız trafik tahminleri var. |
| 4.1 | Exploding Topics Semrush bünyesinde | **DOĞRULANDI** | SEC 10-Q: 15 Ağustos 2024, varlık alımı, toplam bedel ~$2.95M (holdback $531K dahil). |
| 4.2 | Fiyatlar | **DOĞRULANDI** | $39 / $99 / $249 aylık + API $1.000–4.000/ay (Semrush KB). |
| 4.3 | "Milyonlarca veri noktası / gün", insan analist katmanı, API kanal kırılımı | **KISMEN** | "Millions of data points" ve insan kürasyonu doğrulandı; **"/gün" ifadesi kaynakta yok**. Kanal kırılımı ürün özelliği olarak var, API şemasında doğrulanamadı. |
| 5.1 | PainOnSocial rakamları / bağımsız kanıt | **KISMEN** | "4.000+ founder" self-reported; buna karşılık Stripe-API doğrulamalı MRR ~$1.3K (Eylül 2026) ve tepe $1.72K'dan **düşüş** var. |
| 5.2 | BigIdeasDB "18K→23K dolar/**ay** bandı" | **YANLIŞ** | $18K ve $23K *kümülatif* gelir; aylık gelir ~$2K (Ağu 2025), en iyi ay $4.6K (Eyl 2025). |
| 5.3 | SaasNiche ~$300 MRR + 420 signup, 2.500+ pain point | **DOĞRULANDI (self-reported) + çürütücü ek** | Rakamlar doğru; ama 8 ay sonra Stripe doğrulamalı MRR $267, 13 abone — yani büyüme durmuş. |
| 5.4 | ghscout skor ağırlıkları: Demand 35 / Frequency 30 / Frustration 20 / Market 15 / Gap 15 | **KISMEN (hatalı)** | Tek-repo modunda Market ağırlığı **0**; 15 yalnız cross-repo modunda. Rapor iki modu karıştırmış. |
| 5.5 | DemandRadar ~$0.10/tarama, gpt-4o-mini, anahtarsız heuristik | **DOĞRULANDI** | README birebir. |
| 6.1 | Viable "insan-döngüde CX analitiğinin doğrulandığının kanıtı" | **YANLIŞ** | Viable **Temmuz 2024'te kapandı** (founder'ın kendi LinkedIn duyurusu). Doğrulama örneği olarak kullanılamaz. |
| 6.2 | Thematic ~$25K/yıl "G2 üzerinden, taraflı aktarım" | **KISMEN** | Rakam doğru ama artık **kendi fiyat sayfasında** yayınlanıyor; "G2 ikincil" etiketi modası geçmiş. |
| 6.3 | Chattermill iddiaları | **DOĞRULANDI (kısmi)** | Fiyat yayınlamıyor; Vendr medyanı ~$78.5K **yalnız 2 sözleşmeye** dayanıyor — medyan aslında iki değerin ortalaması. |
| 7 | Rakamın kaçırdığı karşı-kanıt | **DOĞRULANDI (mevcut)** | Sentopic (Nisan 2026, Reddit API anahtarı kapanışı), Viable, GummySearch; founder'ın kendi "research ihtiyacı aylık değil" beyanı; SaasNiche/PainOnSocial düzleşmesi. |
| 8 | Kategori büyüklüğü | **KISMEN** | En büyük doğrulanabilir oyuncu ET ~$996K ARR (bazı kaynaklar $3.2M); IdeaBrowser geliri açıklanmıyor; alt segmentler $0.3–1.7K MRR bandında. Kategori **küçük ve parçalı**. |

---

## 2. Ayrıntı

### 2.1 GummySearch — birincil kaynaklar ne diyor?

**İlk iki yıl (DOĞRULANDI).** Founder Fed'in kendi röportajı, 10 Ağustos 2023:

> "GummySearch has >10k users and 400 active customers. Since I started it 2 years ago, it has brought in ~$100k of revenue. MRR is currently at about $3k, but GummySearch is unique in the sense that it makes a lot of one-off revenue as well"
> — [Indie Hackers, 10 Ağustos 2023](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897) (erişim 2026-10-21)

Raporun "10.000+ / 400 / ~$100K / ~$3K MRR" dörtlüsü birebir doğru. Raporun atıf verdiği ikinci kaynak (Starter Story) aslında ilk yıl için $60K diyor ([Starter Story, 10 Ağustos 2022](https://www.starterstory.com/stories/gummysearch)) — yani ~$100K iki yıllık kümülatif, ilk yıl $60K. Rapor bu ayrımı yapmıyor.

**Kullanıcı sayısı (KISMEN).** İki rakam da founder'ın kendi kaleminden:

> "something over 135,000 founders, marketers, and investors have relied for fast, valuable, and fun market research" — [The Final Chapter, 6 Kasım 2025](https://gummysearch.com/final-chapter/)

> "something over 140,000 founders, marketers, and investors have relied" — [GummySearch is now closed for business, 30 Kasım 2025](https://gummysearch.com/closing-time/)

Yani "kaynaklar 135K–140K farklı gösteriyor" ifadesi yanıltıcı: **tek kaynak (founder) üç hafta arayla iki farklı sayı veriyor.** Muhtemelen biri kayıt, diğeri tekil kullanıcı; founder hangisi olduğunu açıklamıyor. Raporun "135–140 bin" aralığı savunulabilir, ama gerekçesi yanlış yazılmış.

**$35K MRR (etiketleme YANLIŞ).** Founder'ın 5 Kasım 2025'teki X duyurusu:

> "After 4+ years of growing @gummy_search to $35k MRR, I'm closing the doors to new business end of this month"
> — X durumu `1986471339470012822`, [arrfounder aktarımı](https://arrfounder.com/news/gummysearch-reaches-35k-mrr) ve [redditapis.com alıntısı](https://www.redditapis.com/blogs/gummysearch-alternatives-ranked-by-data-depth-2026) üzerinden okundu (erişim 2026-10-21; X doğrudan açılamadı)

Bu, ikincil blog aktarımı değil **founder'ın kendi beyanı**. Failory ([When Reddit Pulls Over, 4 Aralık 2025](https://newsletter.failory.com/p/when-reddit-pulls-over)) ve Startup Obituary ([3 Aralık 2025](https://startupobituary.com/p/gummysearch)) aynı rakamı tekrarlıyor; ama bazı derlemeler (Kaeda) "founder söylemedi" diyerek yanılıyor — X duyurusunu kaçırmışlar. Raporun "$35K = ikincil" etiketi düzeltilmeli; **birincil ama bağımsız doğrulanmamış** demek doğru olur.

Ayrıca dikkat: "$35K MRR" ile "$29–199/ay" fiyatlandırma birlikte okunduğunda ~500–1.000 aktif abone ima edilir. "10.000 ödeyen müşteri" ise **yaşam boyu** toplamdır ([Surferstack](https://surferstack.com/gummysearch), [ai-search-visibility-tools](https://ai-search-visibility-tools.com/gummysearch)). Rapor bu ikisini karıştırmıyor, ama "10K paying" rakamı dolaşımda olduğu için not düşülmeli.

**Takvim (DOĞRULANDI).** Founder sayfası:

> "Nov 6–30, 2025: GummySearch and payments remain fully available... Dec 1, 2025 – Nov 30, 2026: Transition year... Dec 1, 2026: GummySearch shuts down entirely, all user data deleted."

Küçük iç tutarsızlık: aynı sayfanın FAQ'si "I bought a LTD... you'll have access through **December 2026**" derken, 30 Kasım sayfası "LTD holders: You'll have access until **11/30/2026**" diyor. Raporun "LTD 30 Kasım 2026" tercihi savunulabilir (daha spesifik ve daha yeni sayfa).

**Ölüm nedeni (KISMEN — ve raporun en önemli nüans kaybı).** Founder'ın kendi metni:

> "While GummySearch has been working with Reddit to obtain a commercial license for compliant access to Reddit's Data API, we were not able to reach an agreement..."
> "Q: Can't you just ____ to stay operational? Yes, its true there are many products that use the Reddit API without a commercial license. My goal is to build a sustainable business... So I tried to legitimize it by seeking a commercial license, and unfortunately it didn't work out."

Üç nokta:
1. **Reddit bir "talep" göndermedi.** Founder lisans için *başvurdu*. Raporun "resmî ticari lisans talebiyle karşılaştı" ifadesi, Reddit'in kapıya dayandığı izlenimini veriyor; metinler bunu desteklemiyor.
2. **Erişim kesilmedi.** Hiçbir kaynakta API anahtarının iptal edildiğine dair kanıt yok; kapanış, uyum riskini önceden kesme kararı. Founder'ın kendi ifadesiyle "looking over your shoulder every day, wondering if tomorrow you get the axe" — yani *korku*, gerçekleşmiş yaptırım değil.
3. **Rakip ürünler lisanssız çalışmaya devam ediyor** (founder'ın kendi kabulü). Bu, "platform riski kaçınılmaz" tezini zayıflatır: aynı riski almayı seçen onlarca ürün hâlâ satışta. Raporun "pazarın numara bir ölüm nedeni erişim kaybıdır" cümlesi bu yüzden fazla güçlü — GummySearch'ün ölümü *erişim kaybı* değil, *lisans almama* kararıydı.

Rapor ayrıca "2023 fiyat değişiminden de büyüyerek sağ çıktı" diyor; bu, founder'ın 2023 sonrası büyümesiyle uyumlu ama 2023 kesintisinin GummySearch'ü nasıl etkilediğine dair birincil anlatı bulunamadı — **kaynak bulunamadı**, ikincil derleme ([Startup Obituary](https://startupobituary.com/p/gummysearch)) "2023: maliyetler skyrocket, 2024: lisans görüşmesi" diyor ama bu derleme kendi başına kanıt değil.

### 2.2 "GitHub issue madenciliğinin ticari SaaS'ı yok" — YANLIŞ

Raporun conclusion cümlesi: "2026'da hâlâ ticari SaaS'ı olmayan GitHub madenciliğine yönelmesi en ucuz farklılaştırıcı noktayı işaret ediyor."

Bu iddia, ghscout'un kendi README'sindeki pazarlama cümlesinden ("Every idea tool mines Reddit. Nobody mines GitHub issues.") türemiş görünüyor ([ghscout](https://github.com/lucianfialho/ghscout)). Aynı README'nin karşılaştırma tablosu bile **SaasFinder / $29/mo+** diye bir ürünü listeliyor. Üstelik:

| Ürün | Ne yapıyor | Fiyat | Kaynak |
|---|---|---|---|
| **Buska** | "Monitors GitHub issues, discussions, README, and public commits at scale"; buying-intent skoru | **$49/ay**, 7 gün deneme | [buska.io/platforms/github](https://www.buska.io/platforms/github) |
| **SaaSScout** | "We crawl Hacker News, Reddit, Dev.to, StackOverflow, **GitHub**, Lobsters"; 5 boyutlu skor | **$300 tek seferlik** (sonra $19/ay veya $500 lifetime) | [saasscout.io](https://saasscout.io/) |
| **IdeaSaaS** | "Reddit, Hacker News, IndieHackers, Product Hunt, Dev.to & **GitHub** daily" | **$10/ay** (yıllık $120) / **$22/ay** ($264) | [ideasaas.xyz](https://ideasaas.xyz/) |
| **Trendstr** | 5 kaynak, aralarında "**GitHub feature requests**" | Ücretsiz tarama + ücretli katmanlar | [trendstr.io](https://www.trendstr.io/) |
| **SaasFinder** | ghscout'un kendi tablosunda "GitHub issues", $29/ay+ | $29/ay+ | [ghscout README](https://github.com/lucianfialho/ghscout) |

**Doğru versiyonu:** "GitHub issue madenciliğinde *baskın/olgun* bir ticari oyuncu yok" — bu savunulabilir. "Ticari SaaS'ı yok" ise **kanıtla çürütülür**. Fark önemli: pazar boş değil, **parçalı ve küçük**.

Not: yukarıdaki ürünlerin çoğu tek kişilik, doğrulanmamış gelirli, hatta bazıları AI ile üretilmiş "vibe-coded" ürünler. Bu, "boşluk var" tezini kısmen destekler ama "kimse yapmıyor" tezini çürütür. Ayrıca ghscout ve DemandRadar **açık kaynak ve ücretsiz**; yani rakip olarak fiyat baskısı yaratıyorlar.

### 2.3 IdeaBrowser — fiyat KISMEN, disclaimer DOĞRULANDI, outcome YOK

**Fiyat.** 12 Mayıs 2026 doğrulaması üç kademeyi de gösteriyor: Starter $499, Pro $1,499, Empire $2,999/yıl ([1mil.app](https://1mil.app/compare/ideabrowser-alternative/), "Pricing verified at ideabrowser.com on 2026-05-12"). 8 Ekim 2025 duyurusu da $499/$1,499 ikilisini teyit ediyor ([IdeaBrowser Announcements](https://www.ideabrowser.com/announcements/lock-in-launch-pricing)).

Ama 12 Ekim 2026 itibarıyla fiyat sayfası **tek plan** gösteriyor: Pro $1,499/yıl; Starter yalnızca "upgrade from this page" olarak, Empire fiyat sayfasından kalkmış ([preuve.ai karşılaştırması, 12 Ekim 2026](https://preuve.ai/compare/ideabrowser)). FAQ hâlâ üç planı anlatıyor ([FAQ](https://www.ideabrowser.com/frequently-asked-questions)). Yani raporun üçlü fiyatı **yazıldığı anda doğru, bugün bayat**. Bu bir "yanlış" değil, tarih damgası eksikliği.

**Disclaimer (DOĞRULANDI, birebir):**

> "No, all revenue estimates, opportunity scores, and market analysis are illustrative examples for educational purposes only."
> "you should never rely solely on our analysis for business decisions."
> — [IdeaBrowser FAQ — Legal & Disclaimers](https://www.ideabrowser.com/frequently-asked-questions) (erişim 2026-10-21)

**Outcome verisi: KAYNAK BULUNAMADI.** Ne FAQ'da, ne fiyat sayfasında, ne de "About"ta "kaç üye iş kurdu", "kaçı gelir elde etti" tipi bir metrik yok. Yalnızca dolaylı ölçek sinyalleri: ~155K ziyaret (Eylül 2026, Semrush) ile ~227–243K ziyaret (HypeStat/Probedex tahminleri) arasında değişen **tahminler** ([Semrush](https://www.semrush.com/website/ideabrowser.com/overview/), [HypeStat](https://hypestat.com/info/ideabrowser.com), [Probedex](https://probedex.ai/domain/ideabrowser.com)). Bu trafikten gelir çıkarsanamaz — fiyat $499–1,499 ve dönüşüm bilinmiyor.

Raporun "preuve.ai testinde 9/10 ama markanın ödeyeceğini gösteren rakam yok" aktarımı, preuve.ai'nin kendi ürününü pazarlayan bir karşılaştırma sitesi olduğu için **tarafgir** okunmalı; yine de tespit ettiği olgu (kaynak linki yokluğu) doğrulanabilir bir ürün gözlemi.

### 2.4 Exploding Topics — sahiplik ve fiyat DOĞRULANDI; "/gün" KISMEN

**Sahiplik ve bedel (birincil, SEC).** Semrush 10-Q, Acquisitions notu:

> "On August 15, 2024, the Company completed an asset purchase agreement with Backlinko, LLC, doing business as Exploding Topics... The acquisition date fair value of the consideration transferred totaled $2,950 [bin] which includes a holdback of $531..."
> — [SEC EDGAR, Semrush 10-Q (Q3 2024)](https://www.sec.gov/Archives/edgar/data/1831840/000162828024047115/R15.htm)

Bu, raporun "Semrush bünyesinde" ifadesini doğrular ve **ilk kez somut bir exit bedeli** verir: ~$2.95M (ERT'de rapor edilen ~$996K ARR'a karşılık ~3x — tinyempires'in 3–5x tahminiyle uyumlu). Rapor bu bedeli kullanmıyor; kullanmalıydı, çünkü kategori büyüklüğü tartışmasında en sert veri bu.

**Fiyat (DOĞRULANDI).** Entrepreneur $39/ay, Investor $99/ay, Business $249/ay; API: 1K istek $1.000/ay, 5K $2.000, 25K $4.000, custom ([Semrush KB 1490](https://www.semrush.com/kb/1490-exploding-topics)). Rapor fiyat vermiyor ama "API'de kanal kırılımı" diyor; kanal kırılımı (reddit/tiktok/twitter/youtube) ürün özelliği olarak fiyat sayfasında "Channel Breakdown" adıyla var ([explodingtopics.com/pricing](https://explodingtopics.com/pricing)); API şemasında doğrulayamadım.

**Metodoloji (KISMEN).** Semrush KB: "monitors **millions of unstructured data points**", "combining data analytics, machine learning and **human analysis**", 1.1M+ trend veritabanı, günlük güncelleme. Rapordaki "milyonlarca nokta/**gün**" ifadesindeki "/gün" **kaynakta yok**; doğru olan "günlük güncellenen, milyonlarca noktaya bakan" bir sistem. Küçük ama kanıt disiplini açısından düzeltilmeli.

Raporun saymadığı, ama pazar tezi için kritik iki veri:
- **Churn 10.1% → 2.7%** (founder'ın kendi anlatımı, [Marketer's Experiment özeti](https://www.marketersexperiment.com/p/brian-dean-0-73m-saas-business-3-years)). Yani ET'nin aylık ödemeye dayanıklı olması, *sürekli* bir işi (trend izleme) çözmesinden geliyor.
- **~$996K ARR (Şubat 2024, basın)** — [GetLatka](https://getlatka.com/companies/exploding-topics). Bazı kaynaklar $3.2M ARR diyor ([andrew.marketing](https://andrew.marketing/exploding-topics/)) ve $83K+/MRR ≈ $1M ARR ([Marketer's Experiment](https://www.marketersexperiment.com/p/brian-dean-0-73m-saas-business-3-years)); **çelişki var**, $996K en iyi belgelenmiş olan.

### 2.5 Alt segment ürünleri — self-reported vs doğrulanabilir

**PainOnSocial.** Fiyat: Starter **$19/ay**, Professional **$49/ay** ([pricing](https://painonsocial.com/pricing)). Rapor fiyat vermiyor; üçüncü taraf bir site $39/ay yazıyor ([shouldiuse.io](https://shouldiuse.io/r/painonsocial)) — bu **yanlış**, güncel sayfa $19. "Trusted by 4,000+ Founders" **self-reported** ve hiçbir yerde bağımsız doğrulanmıyor.

Bağımsıza en yakın kanıt TrustMRR: ödeme sağlayıcısı API'sinden okunan aylık gelir ([1M.chat/TrustMRR aktarımı, 2 Ekim 2026](https://1m.chat/cases/painonsocial-com/)):

| Ay | Gelir |
|---|---|
| 2025-11 | $19 |
| 2025-12 | $342 |
| 2026-01 | $1.048 |
| 2026-02 | $1.422 |
| 2026-03 | $1.404 |
| 2026-04 | **$1.723 (tepe)** |
| 2026-05 | $1.702 |
| 2026-06 | $1.708 |
| 2026-07 | $1.550 |
| 2026-08 | $1.345 |
| 2026-09 | **$1.161** |

Yani ~$1.3K MRR, tepe $1.72K, **son 5 ayda düşüş**. "4.000+ founder" ile $1.3K MRR birlikte okunduğunda ortalama gelir/founder ≈ $0.33 — bu, "4.000 founder" rakamının ya abartılı ya da neredeyse tamamının ücretsiz olduğunu gösterir. Ayrıca ToS'ta kritik bir itiraf var: "We do **NOT** use Reddit's official API... We do **NOT** scrape Reddit directly" ([ToS](https://painonsocial.com/terms-of-service)) — yani GummySearch'ün öldüğü yerde aynı işi lisanssız yapmanın bir yolunu bulmuşlar. Raporun "lisans zinciri" tartışması için doğrudan kanıt.

**BigIdeasDB.** Rapor: "150.000+ review'dan ~238K pain-point veritabanı ve 18K→23K dolar/**ay** bandı". Bu **YANLIŞ bir okuma**. Founder'ın kendi rakamları:

> "BigIdeasDB has generated over **$23k in revenue**, with $7k coming in the last two months alone and more than 7,000 signups" — [IndieNiche, 3 Eylül 2025](https://indieniche.substack.com/p/meet-the-15-year-old-founder-turning)
> "We just had our best month yet; **$4,600 in revenue**" — aynı röportaj
> "$18,000 in revenue within [7 months]" — [Hacker News, Temmuz 2025](https://news.ycombinator.com/item?id=44663347)
> "$2k per month" — [Indie Hackers, 19 Ağustos 2025](https://www.indiehackers.com/post/my-app-makes-me-2k-this-month-after-8-months-of-growing-steadily-how-i-would-start-again-from-0-as-a-15-year-old-d1ed45b86f)

$18K ve $23K **kümülatif toplam**, aylık değil. Aylık gerçek: ~$2K (Ağu 2025), en iyi ay $4.6K (Eyl 2025), $45/ay fiyatla 160+ ödeyen müşteri. Raporun "aylık bant" ifadesi düzeltilmeli — bu, okuyucuya 10x büyük bir pazar ima ediyor.

**SaasNiche.** Founder'ın kendi anlatımı: 2.500+ pain point, 16.000+ AI çözüm, 420+ signup, ~$300 MRR ilk ay ([MRR Story, 27 Nisan 2026](https://www.mrrstory.com/stories/this-founder-turned-reddit-complaints-into-a-300-mrr-saas-in-30-days)). **Self-reported**, ama Stripe doğrulaması var: TrustMRR'de MRR **$267**, 13 aktif abone, tüm zamanlar $3.122 ([TrustMRR, 21 Ekim 2026](https://trustmrr.com/startup/saasniche)).

Kritik: founder 6 ay sonra hâlâ "$300 MRR, duvara çarptım" diyor ([r/SaaS, 4 Eylül 2026](https://www.reddit.com/r/SaaS/comments/1w72hss/i_have_a_boring_saas_that_makes_300_mrr_how_do_i/)). 420 signup → ~13–15 abone = **~%3 dönüşüm**, 6 ayda büyüme yok. Bu, raporun "doğrulandı" çerçevesine gölge düşüren en somut veri.

**ghscout (KISMEN hatalı).** README tablosu ([ghscout](https://github.com/lucianfialho/ghscout)):

| Sinyal | Tek-repo | Cross-repo |
|---|---|---|
| Demand | 35% | 30% |
| Frequency | 30% | 25% |
| Frustration | 20% | 15% |
| Market size | **0%** | 15% |
| Gap | 15% | 15% |

Rapor "Demand 35, Frequency 30, Frustration 20, **Market 15**, Gap 15" diyerek tek-repo satırına cross-repo değerini koymuş. Sonuç: ağırlıklar %115'e çıkıyor. Küçük bir hata, ama rapor "skorun kanıt doktrinine döküldüğü"nü anlatırken kendi aktardığı tabloyu yanlış okuyor.

**DemandRadar (DOĞRULANDI).** "gpt-4o-mini... ~$0.10 per full scan", anahtar yoksa heuristik ([KovaAgent/demandradar](https://github.com/KovaAgent/demandradar)). Raporun aktarımı birebir.

### 2.6 Viable / Thematic / Chattermill — raporun en ciddi kanıt hatası

**Viable kapandı (YANLIŞ kullanım).** Founder Daniel Erickson'un kendi duyurusu:

> "I recently made the tough decision to **shut down Viable after 4.5 years**."
> — [Daniel Erickson, LinkedIn, 24 Temmuz 2024](https://www.linkedin.com/posts/danielerickson_i-recently-made-the-tough-decision-to-shut-activity-7221921410514837505-tol_)

Bu, "acaba acquire mi edildi, pivot mu etti" sorusunu kapatıyor: **kapandı**. PitchBook da "Out of Business" diyor ([PitchBook profili](https://pitchbook.com/profiles/company/437198-68)); dang.ai 18 Haziran 2024'te inaktif işaretlemiş ([dang.ai](https://dang.ai/tool/ai-qualitative-data-analysis-tool-viable)); 2026 itibarıyla askviable.com ilgisiz bir İsveç kumarhane sayfasına dönüyor ([feedsense, 23 Eylül 2026](https://feedsense.co/blog/viable-askviable-alternatives)).

Rapor Viable'ı şöyle kullanıyor: "insan-öncelikli mimariler kurumsal yeterlilikte **doğrulanmış** konumda" ve Viable'ı dört kampın bir örneği olarak listeliyor. Bu, **kapanmış bir şirketi "doğrulama" saymak** demek. OpenAI case study'sinin hâlâ ayakta olması, ürünün ticari olarak yaşadığını göstermiyor. Raporun bu cümlesi ya silinmeli ya da "Viable 2024'te kapandı; kurumsal segmentte hayatta kalma kanıtı Thematic/Chattermill'den gelmeli" şeklinde düzeltilmeli.

**Thematic (KISMEN).** Rapor: "yaklaşık $25K/yıl (G2 üzerinden, taraflı aktarım)". Artık rakam **vendor'ın kendi sayfasında**:

> "Foundation — **$25,000 per year** — ... Up to 25,000 [comments] ... Up to 3 Datasets"
> — [getthematic.com/product/plan-and-pricing](https://getthematic.com/product/plan-and-pricing) (erişim 2026-10-21)

Yani "G2 ikincil" etiketi gereksiz küçümseyici; rakam birincil. Ayrıca Vendr medyanı $37.750 — raporun bilmediği bir çapa.

**Chattermill (DOĞRULANDI, kısmi).** Fiyat yayınlamıyor; `/pricing` demo formuna 301 ([UserInsight, 14 Ekim 2026](https://userinsight.ai/blog/chattermill-pricing)). Vendr medyanı **$78.500/yıl** — ama bu medyan **yalnızca iki sözleşmenin** ($50K ve $107K) ortalaması, yani istatistiksel olarak medyan değil. Rapor Chattermill için fiyat iddiasında bulunmadığı için yanlış değil; ama "99+ dil", "PII redaction" gibi ürün iddiaları vendor sayfasından alınmış ve bağımsız doğrulanmamış — raporda da böyle etiketlenmeliydi.

### 2.7 Raporun kaçırdığı karşı-kanıt

**(a) Kapanan/başarısız idea araçları.**

- **Sentopic** — founder'ın kendi post-mortem'i, Nisan 2026:

> "A change to Reddit's API policy killed my product overnight. Sentopic is an idea validation software... since Reddit almost never actually gives people permission to commercialize their API, I built a wrapper where users could enter their own API keys... what I did not anticipate is that Reddit would stop letting people create new API keys entirely, drastically limiting any growth potential"
> — [Luca P., LinkedIn, 1 Nisan 2026](https://www.linkedin.com/posts/popesculuca_a-change-to-reddits-api-policy-killed-my-activity-7445223601689141248-0SfV)

Bu, GummySearch'ten **daha kötü** bir senaryo: lisanssız çalışan bir ürün de ayakta kalamıyor. Raporun "lisanssız devam edenler var" gözlemini dengeler.

- **Viable** (yukarıda).
- **GummySearch** (verili).
- Raporun kendi andığı GagCartoons (2017) ve Reddit-DM vakası zaten var; ama bunlar "fikir bulma aracı" değil, "fikirden ürün" vakaları. Kategori-aracı düzeyinde iki ölüm (GummySearch, Sentopic) + bir sessiz kapanış (Viable) var.

**(b) Ödeme istekliliği — founder'ın kendi gözlemi.** Rapor bunu GummySearch bölümünde bir cümleyle geçiyor ama kanıt olarak kullanmıyor. Founder:

> "not everyone needs a research tool every month. For a while I'd lose sleep over this, having stressful dreams of high churn rates. Now, I've found my peace with the fact that it's a part of my unique business"
> — [Indie Hackers, 2023](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897)

Ve çözümü: $1 trial, **$10 day pass**, ağır indirimli yıllık, **LTD** — "LTD promotion brought in $50k in 2 months". Bu dört mekanizmanın üçü **tek seferlik** ödeme. Yani kategorinin en başarılı ürünü bile aylık abonelikte tutunamadı; gelirinin önemli kısmını one-off'tan aldı.

Aynı örüntü bugün de görünür:
- IdeaBrowser **yalnızca yıllık** satıyor (FAQ: "plans are annual-only") — aylık tutmanın zor olduğunun dolaylı itirafı.
- SaaSScout **$300 tek seferlik**, IdeaProof **kredi paketi** ("credits never expire"), BigIdeasDB başlangıçta **LTD $49–199**.
- PainOnSocial ve SaasNiche aylık, ama ikisi de $1–1.7K MRR bandında **düzleşmiş/düşmüş**.

**(c) Şikâyet madenciliğinden doğmayan başarılar (selection bias).** Bu turda sistematik veri bulamadım — **GAP**. Raporun seçilme yanlılığı testi için gereken karşı-örnek kümesi (ör. Stripe, Figma, Notion gibi kullanıcı-şikâyetiyle değil, kurucu içgörüsüyle doğan ürünler) bu notta yok. Raporun "en güçlü sinyal yapılmış olandır" iddiası bu yüzden hâlâ tek yönlü.

**(d) Alıcı kim?** Founder'ın kendi strateji değişikliği doğrudan kanıt:

> "Now I'm targeting **more established businesses that can afford to pay for a research tool continuously**."
> — [Indie Hackers, 2023](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897)

Raporun "audience research" müşterisini indie founder olarak konumlaması, kategorinin en deneyimli satıcısının **tersine döndüğü** bir varsayım. PainOnSocial'ın ToS'unda "teams and agencies" için ayrı plan olması, IdeaBrowser'ın $1,499'a çıkması, Thematic/Chattermill'in $25K+ bandı — hepsi aynı yöne işaret ediyor: **para kurumsal/ajans tarafında, indie tarafta değil.**

### 2.8 Pazar büyüklüğü — gerçekçi tablo

| Oyuncu | Gelir (doğrulanabilir en iyi rakam) | Kaynak türü |
|---|---|---|
| Exploding Topics | **~$996K ARR** (Şubat 2024); exit ~$2.95M | Basın + SEC |
| IdeaBrowser | **Açıklanmıyor.** ~155K–243K ziyaret/ay (tahmin) | Tahmin |
| GummySearch (kapanmış) | ~$35K MRR ≈ **$420K ARR** (tepe) | Founder |
| PainOnSocial | **~$1.3K MRR** (Stripe doğrulamalı) | TrustMRR |
| SaasNiche | **$267 MRR**, 13 abone | TrustMRR/Stripe |
| BigIdeasDB | ~$4.6K/en iyi ay; ~$23K kümülatif | Founder (self-reported) |

Kategori "startup idea research" olarak bakıldığında **toplam doğrulanabilir gelir tek haneli milyon doların altında**. En büyük oyuncu bile (ET) $1M ARR civarında ve o da "trend izleme" işi — "fikir doğrulama" değil. Fikir-doğrulama alt segmenti ise **$0.3K–5K MRR** bandında, tek kişilik ürünlerden oluşuyor.

Rapordaki "$2 milyar review", "%93 doğruluk" gibi iddiaların kanıtsızlığına dair uyarı doğru; ama rapor **kendi pazar büyüklüğü iddiasını hiç yapmıyor** — ve yapmadığı için "en ucuz farklılaştırıcı nokta" ifadesi ölçüsüz kalıyor. Bu tabloya göre doğru ifade: "küçük, parçalı, düşük ARPU'lu bir niş."

---

## 3. Raporun argümanı için ne anlama geliyor

1. **GummySearch vakası raporun en sağlam kanıtı, ama yanlış çerçevelenmiş.** Rakamlar (10K/400/$100K/$3K, sonra 135–140K, $35K MRR) büyük ölçüde doğru; hata *yorumda*: Reddit lisans **talep etmedi**, founder **başvurdu** ve anlaşamadı; erişim **kesilmedi**; lisanssız devam eden rakipler var. Bu, "platform riski kaçınılmaz" determinizmini zayıflatır ama "lisanslı yol economically viable değil" tezini güçlendirir — ki StartupHunt için daha kullanışlı olan budur.

2. **"GitHub'da ticari SaaS yok" iddiası kaldırılmalı.** Bu, raporun conclusion'ındaki tek "farklılaştırıcı nokta" iddiası ve **yanlış**. Yerine konabilecek doğru iddia: "GitHub issue madenciliğinde olgun/baskın oyuncu yok; mevcutlar tek kişilik, doğrulanmamış gelirli ve çoğu ücretsiz/açık kaynak." Bu hâlâ bir fırsat argümanı, ama "kimse yapmıyor" değil.

3. **Viable cümlesi silinmeli.** "İnsan-döngüde CX analitiği doğrulandı" tezi, doğrulama örneği olarak gösterilen şirketin 2024'te kapanmasıyla çürür. Thematic ve Chattermill hayatta ve $25K+ fiyatlı — yani kurumsal segmentte para var — ama Viable o kanıtın parçası değil. Bu düzeltme raporu **zayıflatmaz**, güçlendirir: "insan katmanı kurumsalda para ediyor, indie'de etmiyor" ayrımı daha keskin bir tez.

4. **BigIdeasDB rakamı 10x şişirilmiş.** "$18K→$23K/ay" ifadesi kümülatif geliri aylık gelir sanıyor. Gerçek: en iyi ay $4.6K. Bu, raporun "indie vaka kanıtı" olarak sunduğu örneklerin **hepsinin** self-reported ve küçük olduğunu gösteren bir örüntünün parçası — SaasNiche $267 MRR, PainOnSocial $1.3K MRR, BigIdeasDB ~$2–4.6K/ay.

5. **Raporun "kanıt-permalink standardı yerleşti" tezi, ödeme tarafında karşılıksız.** Ürünler permalink gösteriyor (doğru), ama hiçbiri **ödemeyi** kanıtlamıyor; tersine, en olgun ürünün founder'ı "research ihtiyacı aylık değil" diyor ve gelirini day pass/LTD ile yamalıyor. Raporun kendi ana tezi ("ödeme kanıtını yalnız ask üretir") pazar verisiyle **destekleniyor** — ama rapor bu veriyi kullanmıyor, sadece teorik olarak söylüyor. Bu, raporun en güçlü ama en az kullanılmış kanıtı.

6. **Fiyatlama/segment stratejisi için doğrudan çıkarım.** Kategori hem küçük hem de alıcısı indie değil. StartupHunt'ın "insan onayı (BU)" mimarisi, $19–49/ay indie ürünlerinden çok Thematic/Chattermill'in $25K–78K bandına yakın duruyor. Rapor bunu "kurumsal CX-analitik pazarı aynı teknik çekirdeği daha olgun ama farklı hedefle kurar" diye geçiştiriyor; aslında bu, ürünün **hangi müşteriye** satılacağı sorusunun cevabını değiştirir.

---

## 4. Gaps (doğrulanamayanlar)

- **IdeaBrowser geliri/outcome verisi:** hiçbir yerde yok. Ne ARR, ne müşteri sayısı, ne "kaçı iş kurdu". Yalnız trafik tahminleri.
- **GummySearch 2023 API değişiminin somut etkisi:** founder'ın o dönemde ne kadar API maliyeti ödediği/kesinti yaşadığına dair birincil anlatı bulunamadı. Startup Obituary'nin "costs skyrocket" ifadesi ikincil.
- **GummySearch "kârlı" iddiasının denetimi:** founder "made plenty of money" diyor; P&L yok.
- **BigIdeasDB'nin 238K pain-point rakamı:** founder'ın kendi röportajlarında 10K, 150K review, 238K gibi farklı sayılar dolaşıyor; hangisinin güncel olduğu belirsiz.
- **Şikâyet madenciliğiyle kurulmamış başarılı ürünlerin sistematik listesi:** bu turda toplanmadı; seçilme yanlılığı testi için ayrı bir araştırma gerekir.
- **Kategori toplam büyüklüğü:** hiçbir araştırma kuruluşu "startup idea research" için ayrı pazar büyüklüğü yayınlamıyor; yukarıdaki tablo parça parça verilerden bir araya getirildi, toplam bir TAM değildir.
- **IdeaBrowser'ın "2.000+ fikir" vs FAQ "800+ fikir" vs eski "1.000+" tutarsızlığı:** hangi rakamın doğru olduğu doğrulanamadı; sayfa içi pazarlama metinleri çelişiyor.
