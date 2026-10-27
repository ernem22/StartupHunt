# Çapraz Denetim Metni — Fakt Doğrulama Notları

**Denetlenen metin:** `capraz_denetim_metni.md` ("Final Çapraz Denetim Raporu")
**Erişim tarihi:** 21 Ekim 2026
**Kapsam:** Metnin yük taşıyan 15 sayısal/hukuki iddiası. Metin yeniden yazılmadı; yalnızca iddia ↔ birincil kaynak karşılaştırması yapıldı.
**Yöntem notu:** Reddit'in kendi sayfaları bu oturumda doğrudan çekilemedi (bot engeli). Reddit'e atfedilen cümleler, Reddit'in 30 Eylül 2026 postlarının arama snippet'leri ve dört bağımsız aktarımla (TechCrunch, Mashable, TechRepublic, Decrypt) çaprazlandı. Mahkeme kararı için CourtListener PDF'i doğrudan okundu.

---

## Hüküm Tablosu

| # | İddia | Hüküm | Kısa gerekçe |
|---|---|---|---|
| 1 | Reddit: RSS 13 Kas 2026; yeni API başvurusu 31 Eki 2026; kayıtsız erişim 12 Oca 2027; kalan public API Mart 2027 | **DOĞRULANDI** (kapsam nüansıyla) | Dört tarih de Reddit'in 30 Eyl 2026 duyurusunda var. Ancak kapanan şey "public Data API"; lisanslı/ticari erişim ve Devvit yolu devam ediyor. |
| 2 | Reddit v. Anthropic: dava gerçek; browsewrap reddedildi; contract/UCL iddiaları ayakta | **DOĞRULANDI** | SF Superior CGC-25-625892; federal 3:25-cv-05643-TLT; 17-18 Eyl 2026 demurrer kararı: 5 iddianın 3'ü ayakta, browsewrap savunması reddedildi. |
| 3 | Powa: 1.200 "müşteri taahhüdü" çoğunlukla bağlayıcı olmayan LOI; $220M'a rağmen administration | **DOĞRULANDI** | Business Insider 25 Şub 2016: "majority of the 1,200 companies... had simply signed non-binding letters of interest." |
| 4 | GummySearch: $35K MRR "ikincil kaynak" etiketi YANLIŞ, birincil founder duyurusu | **KISMEN — etiket iddiası YANLIŞ** | $35K MRR founder'ın kapanış yazısında **yok**; Failory/Startup Obituary aktarımı. Çapraz denetim, doğru etiketi yanlış diye düzeltmiş. Kapanış gerekçesi (lisans anlaşmazlığı, erişim kesilmedi) ise doğru. |
| 5 | BigIdeasDB "$18–23K/ay" aslında kümülatif; aylık ~$2K, en iyi ay $4,6K | **DOĞRULANDI** | IndieNiche 3 Eyl 2025: "over $23k in revenue"; aylık "$2k"; "best month yet; $4,600". |
| 6 | MicroConf örneklemi 469 mu, 700 mü? | **KISMEN** | 2024 raporunun yayımlanan n'si **469**; Rob Walling podcast'te "just under 700 usable responses" diyor. İkisi de MicroConf kaynaklı, farklı sayım. |
| 7 | scikit-learn: 750 nokta, mcs=3 → 90 küme, mcs=5 → 4 küme | **KISMEN** (sayılar doğru, analogi yanıltıcı) | Sayılar birebir doğru; ama 90 küme dokümanın "yanlış ayar" örneği ve veri 2 boyutlu sentetik blob, metin embedding'i değil. |
| 8 | BERTopic ~1M belge için min_topic_size 100–500 öneriyor | **DOĞRULANDI** | "If it nears a million documents, then it is advised to set it much higher than the default of 10, for example, 100 or even 500." |
| 9 | TopicGPT: purity 0,74 vs 0,64; ~$100/dataset; Mistral-7B atama yapar üretemez; "1–2K yüksek değerli belge" kapsamı | **KISMEN** | İlk üçü doğru (Bills $88 / Wiki $155; 32.661 / 14.290 belge). "1–2K toplam kapsam" iddiası kaynaklarda yok; 1.000–1.100 yalnızca *topic generation* alt örneklemi. |
| 10 | `BERTopic.transform` + `approximate_predict` doğru reçete | **KISMEN** | `transform` zaten içinde `approximate_predict` çağırıyor; ikisini ayrı iki adım gibi yazmak gereksiz/yanıltıcı. Mekanizma UMAP uzayında çalışır, ham embedding centroid'i değil. |
| 11 | FSEK m.68 3 kata kadar; TDM istisnası yok | **DOĞRULANDI** (çapraz denetim gereğinden temkinli) | m.68/1 "en çok üç kat fazlasını" diyor; Türk hukukunda TDM istisnası yok, Aralık 2025 teklifinde de yok. |
| 12 | The Mom Test 250.000 kopya | **KISMEN** | 250K, üç kitabın toplamı için 2024'te söylenmiş bir rakam; yazarın resmî sitesi bugün *The Mom Test* için "300,000+ copies sold" diyor. |
| 13 | AR-Miner %35,1 informative; 0,70 hit-rate | **DOĞRULANDI** (bağlam nüansıyla) | %35,1 dört uygulamanın ortalaması; 0,70 tek uygulama (SwiftKey) vaka çalışması, K=22, top-10 konu. |
| 14 | TH2019: 115.099 review, 12.000 cümle, 3 analist, 91/94 ihtiyaç | **DOĞRULANDI** | Tüm sayılar makalenin metninde birebir. |
| 15 | SFT-LLM: 1.549 etiketli CN-verbatim çifti | **DOĞRULANDI** (nüans) | 10 VOC çalışmasından 1.549 çift; ancak makale 600 örnekte performansın platoya girdiğini söylüyor. |

**Genel sonuç:** 15 kalemin 9'u tam doğrulandı, 6'sı kısmen doğrulandı. Kısmenlerin en ciddisi GummySearch: kalemin bir alt iddiası (kapanış gerekçesi) doğru, ama çapraz denetimin "$35K MRR birincil founder duyurusu" düzeltmesi yanlış. Çapraz denetimin en ciddi hatası, bir "ikincil kaynak" etiketini kanıtsız biçimde "birincil founder duyurusu"na yükseltmesi; en ciddi fazla temkinliliği ise doğrulanabilir FSEK/TDM iddiasını "KISMEN / DOĞRULANAMADI"da bırakması.

---

## 1. Reddit API zaman çizelgesi

### Hüküm: DOĞRULANDI (kapsam nüansıyla)

Dört tarih de gerçek. Çapraz denetimin bu maddesi, metnin en sağlam maddelerinden biri. Ancak "public API kapanıyor" ifadesi, "Reddit verisine tüm erişim bitiyor" diye okunmamalı.

### Alıntılar

Reddit'in 30 Eylül 2026 r/redditdev duyurusundan (arama snippet'i):

> "We're sharing the timeline for moving public API apps and bots to the Developer Platform. Register now, apply for migration funding by **November 30**, and start planning and testing your move. Starting **January 12, 2027**, we'll begin removing API access for apps and users that haven't registered or engaged with us. **Remaining public API access will end in March 2027.**"

Reddit'in aynı günkü r/modnews duyurusundan:

> "We're moving public data API apps and bots to the Developer Platform... **If you maintain an app or a bot, register it here before January 12, 2027** to avoid disruption."

TechCrunch (30 Eyl 2026):

> "Public API access will also end by March 2027, which will impact any tools that used it for programmatic access to Reddit conversations, including social listening products, those used by researchers, and AI products, such as AI assistants."

Mashable (30 Eyl 2026) — kullanıcının atıf yaptığı makale:

> "The company is shutting down its RSS feeds on Nov. 13, 2026, and ending public API access in March 2027... The company will stop accepting new requests for access on Oct. 31. Starting Jan. 12, 2027, it will begin removing access for apps and users that haven't registered or engaged with its outreach. Remaining public access ends in March."

TechRepublic (2 Eki 2026) dört tarihi de listeliyor:

> "Oct. 31, 2026: Reddit stops accepting new requests for public API access. Nov. 13, 2026: Reddit stops supporting RSS feeds. Jan. 12, 2027: Reddit begins removing API access for apps and users that have not registered or engaged with the Developer Platform team. March 2027: Remaining public Data API access ends."

### Kaynaklar
- https://www.reddit.com/r/redditdev/comments/1wubcvf/moving_data_api_apps_to_the_developer_platform/ (7 Eki 2026)
- https://www.reddit.com/r/modnews/comments/1wubgvt/continuing_our_infrastructure_updates_whats/ (30 Eyl 2026)
- https://techcrunch.com/2026/09/30/reddit-is-killing-rss-feeds-ending-public-api-access-because-of-ai-bots/ (30 Eyl 2026)
- https://me.mashable.com/tech/76712/reddit-is-ending-rss-feeds-with-no-replacement-you-can-blame-ai-bots (30 Eyl 2026)
- https://www.techrepublic.com/article/news-reddit-rss-public-api-shutdown/ (2 Eki 2026)

### Düzeltme / nüans
1. **"Free tier" değil, "public Data API".** Kapanan şey 2023'teki 100 sorgu/dk ücretsiz katman değil; kayıtlı public Data API uygulamalarının kalan erişimi. Ticari lisans anlaşmaları (Google/OpenAI tipi) ve Devvit yolu devam ediyor.
2. **"Tüm Reddit erişimi Mart 2027'de bitiyor" değil.** Reddit'in kendi cümlesi "remaining public API access". Lisanslı erişim ve Devvit uygulamaları bundan muaf.
3. **Python operasyonel riski.** Devvit'in Python desteği yok (bkz. ppc.land 4 Eki 2026; Beyond the News 23 Ağu 2026). StartupHunt'un Python tabanlı hattı için "kaydol, Devvit'e taşı, devam et" gerçekçi değil; bu, çapraz denetimin atladığı maddi bir sonuç.
4. **31 Ekim cümlesi** Reddit sayfasından birebir alıntılanamadı; ancak Mashable, TechRepublic, Decrypt ve ChatterAPI dört bağımsız kaynak olarak aynı tarihi Reddit'in postuna atfediyor. Tarih güvenilir.
5. Mart 2027 için **gün** verilmemiş ("March 2027"); chatterapi bunu "treat March 1 as the safe deadline" diye yorumluyor. Bu bir yorum, Reddit'in metni değil.

---

## 2. Reddit v. Anthropic

### Hüküm: DOĞRULANDI

Dava gerçek, docket doğru, Eylül 2026 itibarıyla durum çapraz denetimin anlattığı gibi: browsewrap savunması reddedildi, sözleşme ve UCL iddiaları ayakta.

### Docket ve durum
- **Eyalet mahkemesi:** Reddit, Inc. v. Anthropic PBC, San Francisco County Superior Court, **CGC-25-625892** (Haziran 2025'te açıldı).
- **Federal:** Reddit, Inc. v. Anthropic PBC, N.D. Cal., **No. 3:25-cv-05643-TLT** (Judge Trina L. Thompson). Anthropic davayı federal mahkemeye taşıdı; Reddit'in remand talebi **28 Mart 2026**'da kabul edildi.
- **Eyalet mahkemesi demurrer kararı:** Judge Harold E. Kahn; karar **17 Eylül 2026**, dosyaya **18 Eylül 2026**'da girdi.
- **Ayakta kalan 3 iddia:** breach of contract, interference with contract, California UCL (§17200).
- **Düşen 2 iddia:** unjust enrichment ve trespass to chattels; **16 Ekim 2026**'ya kadar düzeltme izni.
- Dava **derdest**; Eylül 2026 kararı sorumluluk tespiti değil, sadece iddiaların yeterliliği.

### Alıntılar

Federal remand kararından (CourtListener PDF, 28 Mart 2026):

> "While this may be characterized as a 'browsewrap agreement,' Anthropic engaged in conduct sufficient to infer actual knowledge of the terms of the User Agreement and to form an implied-in fact contract with Reddit."

> "The Court finds that Anthropic and Reddit are contractually bound by Reddit's User Agreement from Reddit's showing of Anthropic's constructive and actual knowledge."

Eyalet mahkemesi kararından (The Inference, 29 Eyl 2026 aktarımı):

> "conduct sufficient to infer actual knowledge of the terms of the User Agreement and to form an implied-in-fact contract with Reddit"

Bloomberg Law (21 Eyl 2026):

> "Reddit's breach of contract and unfair competition claims brought under California state law are exempt from preemption by federal copyright law because they contain extra elements, Judge Harold E. Kahn said Friday."

### Kaynaklar
- https://storage.courtlistener.com/recap/gov.uscourts.cand.452341/gov.uscourts.cand.452341.60.0.pdf
- https://theinference.org/article/reddit-s-user-agreement-can-bind-anthropic-a-judge-rules-and-the-meter-is-running (29 Eyl 2026)
- https://news.bloomberglaw.com/ip-law/anthropic-loses-bid-to-dismiss-reddit-ai-scraping-privacy-suit (21 Eyl 2026)
- https://me.mashable.com/tech/76280/judge-allows-most-of-reddits-lawsuit-against-anthropic-to-proceed (19 Eyl 2026)

### Not
Çapraz denetim "sonucun dump kullanan üçüncü ürünler için doğrudan emsal olduğu söylenemez" diyor; bu doğru ve önemli. Karar yalnızca Reddit–Anthropic arasındaki sözleşme ilişkisini ve preemption sorusunu bağlar; üçüncü taraf dump kullanıcısına karşı bir içtihat değildir.

---

## 3. Powa LOI örneği

### Hüküm: DOĞRULANDI

### Alıntılar

Business Insider (25 Şubat 2016):

> "Business Insider has been told that the majority of the 1,200 companies that Powa claimed to have signed up to its mobile payment app had simply signed non-binding letters of interest in the technology."

> "Companies had signed what's called a 'letter of intent' — a non-binding signal of interest in a product or service. While they may result in a deal, they are not a contract and neither side agrees to exchange any money..."

BBC (21 Mart 2016):

> "It seems likely they were told the same story that was peddled to journalists... But what's emerged since the collapse of the business is that none of those companies had signed contracts, merely 'letters of intent', which did not commit them to anything."

Business Insider (19 Şubat 2016):

> "Powa Technologies... has collapsed into administration, putting over 300 jobs at risk."

Business Insider (9 Mart 2016):

> "Powa Technologies was once reportedly valued at $2.7 billion and raised at least $220 million in funding since 2013. But last month it collapsed into administration with just $250,000 in the bank."

### Kaynaklar
- https://www.businessinsider.com/powa-technologies-most-1200-powatag-deals-were-letters-of-intent-2016-2
- https://www.bbc.com/news/technology-35860814
- https://www.businessinsider.com/powa-technologies-lines-up-deloitte-as-administrators-2016-2
- https://www.businessinsider.com/powa-technologies-greenlight-digital-ceo-says-peter-was-robbed-to-pay-paul-2016-3

### Nüans
- **"1.200"** doğru; **"çoğunlukla"** doğru (BI "majority"; BBC "none of those companies" diyor ama BBC yalnızca adı geçen markaları kastediyor).
- **"$220M"** üst rakam. BI "at least $220 million", BBC "more than $200m", Deloitte raporu "just over $200 million" diyor. $220M yanlış değil; aralığın üst ucu.
- "Customer commitments" ifadesi Powa'nın kendi pazarlama diline ait; bağlayıcı sözleşme değil. Çapraz denetimin kullanımı savunulabilir.

---

## 4. GummySearch

### Hüküm: KISMEN — çapraz denetimin $35K MRR düzeltmesi YANLIŞ

Bu, çapraz denetimin en ciddi hatası. Metin, "$35K MRR 'ikincil kaynak' etiketi YANLIŞ (etiket hatası); birincil founder duyurusu" diyor. Kanıt bunun tersini gösteriyor: **$35K MRR founder'ın kendi kapanış yazısında yok.**

### Founder'ın kendi yazısı (birincil)

"The Final Chapter for GummySearch", 6 Kasım 2025:

> "GummySearch relies on Reddit's API to generate its real-time audience insights. While GummySearch has been working with Reddit to obtain a commercial license for compliant access to Reddit's Data API, **we were not able to reach an agreement that aligns with Reddit's Data API Usage policies**. As a result, GummySearch must become a non-commercial product by the end of November or shut down."

> "You helped turn a small solo indie project into something **over 135,000 founders, marketers, and investors** have relied for fast, valuable, and fun market research."

Yazıda **MRR, ARR veya gelir rakamı yok**. Yalnızca 135.000 kullanıcı var.

Kapanış sayfası, 30 Kasım 2025:

> "we're shutting down to comply with Reddit's API policies, which forbid commercial applications."

> "Accepting payments after November runs the risk of losing API access entirely, and making it a scenario where all current customers lose product access."

### $35K rakamının kaynağı (ikincil)

Failory, "When Reddit Pulls Over", 4 Aralık 2025:

> "Failory reported $35K MRR at closure."

Kaeda vaka sayfası bu noktayı açıkça işaretliyor:

> "The headline $35K/mo peak MRR is reported consistently by Failory and Startup Obituary but is **NOT stated in the founder's own shutdown post** (which confirmed 135,000 users), so it is marked EST and not independently confirmed."

### Kaynaklar
- https://gummysearch.com/final-chapter/ (6 Kas 2025)
- https://gummysearch.com/closing-time/ (30 Kas 2025)
- https://newsletter.failory.com/p/when-reddit-pulls-over (4 Ara 2025)
- https://kaeda.co/cases/gummysearch
- https://small-start.com/en/cases/global-gummysearch-reddit-closure/ (27 Ağu 2026)

### Değerlendirme
| Alt iddia | Hüküm |
|---|---|
| $35K MRR birincil founder duyurusu | **YANLIŞ** — founder yazısında yok; ikincil kaynak (Failory/Startup Obituary). Orijinal "ikincil kaynak" etiketi **doğruydu**. |
| Ölüm nedeni "Reddit erişimi kesildi" | **YANLIŞ** — erişim kesilmedi; founder lisans için görüştü, anlaşamadı, ihtiyaten kapattı. |
| Founder lisans başvurusu yaptı, anlaşamadı | **DOĞRU** — "working with Reddit to obtain a commercial license... not able to reach an agreement". |
| Erişim kesilmedi | **DOĞRU (kamuya açık kayıtla)** — founder "risks losing API access entirely" diyor; yani kapanış anında erişim hâlâ vardı. |

**Sonuç:** Çapraz denetim, doğru bir etiketi ("ikincil kaynak") yanlış diye düzeltmiş ve bunu yaparken yeni bir birincil kaynak göstermemiş. Bu, metnin kendi "atıf hijyeni" standardına aykırı.

---

## 5. BigIdeasDB geliri

### Hüküm: DOĞRULANDI

"$18–23K/ay" ifadesi kümülatif gelirin aylık sanılmasıdır. Çapraz denetimin düzeltmesi doğru.

### Alıntılar

IndieNiche, 3 Eylül 2025 (Om Patel röportajı):

> "So far, BigIdeasDB has generated **over $23k in revenue**, with **$7k coming in the last two months alone** and more than 7,000 signups."

> "We just had our best month yet; **$4,600 in revenue**, and traffic is at an all time high."

> "Right now, BigIdeasDB gets around 11,000 visitors a month and has **160+ paying customers**... **$45/month**."

Indie Hackers, 19 Ağustos 2025:

> "My app makes me **$2k this month** after 8 months of growing steadily."

Hacker News / Reddit, 2025:

> "My project made me **$18,000 in 7 months**." / "My project made **$15,800 in the first 4 months**."

### Kaynaklar
- https://indieniche.substack.com/p/meet-the-15-year-old-founder-turning (3 Eyl 2025)
- https://www.indiehackers.com/post/my-app-makes-me-2k-this-month-after-8-months-of-growing-steadily-how-i-would-start-again-from-0-as-a-15-year-old-d1ed45b86f (19 Ağu 2025)
- https://news.ycombinator.com/item?id=44663347
- https://www.reddit.com/r/indiehackers/comments/1kuh6kg/

### Nüans
- "$18–23K" iki farklı kümülatif rakam (7 ay $18K; Eylül 2025 itibarıyla $23K+). İkisi de **toplam**, aylık değil.
- "En iyi ay $4,6K" Eylül 2025 röportajına ait. Reddit postunda "$4,500+ **CAD**" yazıyor; para birimi farkı var. Çapraz denetim "$4,6K" derken USD'yi kastediyor; IndieNiche bağlamında USD makul ama CAD postu ayrı bir veri noktası.
- Indie Hackers profilinde "scaling bigideasdb to 25k/month" ifadesi var; bunun MRR mı, aylık gelir hedefi mi olduğu belirsiz ve bağımsız doğrulanamadı. **Bu bir gap.**

---

## 6. MicroConf örneklem büyüklüğü

### Hüküm: KISMEN — "469 mu 700 mü?" yanlış bir ikilem

İki sayı da MicroConf'un kendi materyalinde var; farklı şeyleri sayıyorlar.

### Alıntılar

MicroConf, "$0–10K ARR" sayfası (2024 raporuna atıfla):

> "These are benchmarks from **469 surveyed independent SaaS founders** across all stages, not just the $0–10K band. **Data collected late 2023**; refresh when the next report is released."

Startups for the Rest of Us, bölüm 721 (9 Temmuz 2024), Rob Walling:

> "And this year we got, I believe you were just telling me it's **just under 700 usable responses**, and that's statistically significant."

Aynı bölümde Rob Walling:

> "at least for our bootstrappers, the **700 or so folks** who responded"

### Kaynaklar
- https://microconf.com/founders/0-10k-arr
- https://www.startupsfortherestofus.com/episodes/episode-721-7-key-takeaways-from-the-2024-state-of-independent-saas-report (9 Tem 2024)
- https://microconf.com/state-of-indie-saas

### Değerlendirme
- **469**, 2024 raporunun yayımlanan örneklem büyüklüğü. Rapor sayfalarında (p.25, p.34, p.39, p.45) bu n kullanılıyor.
- **~700**, anketin "usable responses" sayısı; muhtemelen eleme/filtreleme öncesi tamamlanmış yanıt sayısı.
- Çapraz denetim bunu "doğrulanamayanlar" listesine koymuş. Doğru davranış: **2024 raporu için 469'u kullanmak**, ~700'ü ayrı bir "usable responses" rakamı olarak not etmek. Çelişki değil, iki aşamalı sayım.
- Rapor PDF'inin iç kapağını açıp n'yi birebir görmedim; bu yüzden "KISMEN"de bırakıyorum.

---

## 7. scikit-learn HDBSCAN demosu

### Hüküm: KISMEN — sayılar birebir doğru, analogi yanıltıcı

### Alıntılar

scikit-learn 1.9, "Demo of HDBSCAN clustering algorithm":

> "For example, below we generate a dataset from a mixture of three bi-dimensional and isotropic Gaussian distributions."

> `centers = [[1, 1], [-1, -1], [1.5, -1.5]]`
> `X, labels_true = make_blobs(n_samples=750, centers=centers, cluster_std=[0.4, 0.1, 0.75], random_state=0)`

Görsel alt yazısı:

> "Estimated number of clusters: **4** | min_cluster_size=5, Estimated number of clusters: **90** | min_cluster_size=3, Estimated number of clusters: **4** | min_cluster_size=25"

Dokümanın kendi yorumu:

> "`min_cluster_size` is the minimum number of samples in a group for that group to be considered a cluster. Clusters smaller than the ones of this size will be left as noise. The default value is 5. This parameter is generally tuned to larger values as needed. Smaller values will likely to lead to results with fewer points labeled as noise. However **values which too small will lead to false sub-clusters being picked up and preferred**."

### Kaynaklar
- https://scikit-learn.org/stable/auto_examples/cluster/plot_hdbscan.html
- https://scikit-learn.org/stable/_sources/auto_examples/cluster/plot_hdbscan.rst.txt

### Değerlendirme
- **750 nokta:** doğru.
- **mcs=5 → 4 küme:** doğru.
- **mcs=3 → 90 küme:** doğru.
- **"parametre duyarlılığı aşırı yüksek"**: sayılar bunu destekliyor, ama dokümanın çerçevesi tam tersi: bu demo HDBSCAN'in *robustluğunu* göstermek için var; 90 küme, mcs=3'ün **yanlış** olduğunun kanıtı. Yani "mcs=3 kullanmayın" dersinin illüstrasyonu.
- **Analoji zayıf:** veri 2 boyutlu, 3 izotropik Gaussian blob, `cluster_std=[0.4, 0.1, 0.75]`. Metin embedding'leri ~384–1024 boyutlu, heterojen, gürültülü ve yoğunluk yapısı tamamen farklı. 2D blobda mcs duyarlılığı, 768D embedding uzayında aynı şekilde davranmaz.
- **Doğru çıkarım:** "mcs tek başına sabit bir varsayılan olmamalı, veri ölçeğine göre ayarlanmalı" — bu BERTopic docs ve HDBSCAN docs ile de uyumlu. **Yanlış çıkarım:** "bu demo metin kümelemesi için parametre duyarlılığının kanıtı."

---

## 8. BERTopic min_topic_size rehberi

### Hüküm: DOĞRULANDI

### Alıntı

BERTopic, "Parameter tuning":

> "`min_topic_size` is an important parameter! It is used to specify what the minimum size of a topic can be. The lower this value the more topics are created. If you set this value too high, then it is possible that simply no topics will be created! Set this value too low and you will get many microclusters."

> "It is advised to play around with this value depending on the size of your dataset. **If it nears a million documents, then it is advised to set it much higher than the default of 10, for example, 100 or even 500.**"

### Kaynak
- https://maartengr.github.io/BERTopic/getting_started/parameter%20tuning/parametertuning.html

### Nüans
- Metin "öneriyor" diyor; doğru. Ama bu bir **örnek aralık** ("for example"), sert bir kural değil. BERTopic FAQ ayrıca "e.g., 300" diyor ve `n_neighbors` artırma alternatifini de veriyor.
- 1M belge için 100–500 aralığı, BERTopic'in kendi metniyle birebir uyumlu.

---

## 9. TopicGPT

### Hüküm: KISMEN — ana sayılar doğru; "1–2K kapsam" iddiası kaynaklarda yok

### Alıntılar

arXiv 2311.01449 / NAACL 2024:

> "TopicGPT produces topics that align better with human categorizations compared to competing methods: it achieves a **harmonic mean purity of 0.74** against human-annotated Wikipedia topics compared to **0.64** for the strongest baseline."

> "TopicGPT achieves post-refinement harmonic purity scores P1 of **0.74 and 0.57 on Wiki and Bills**, respectively, compared to **0.64 and 0.52 for LDA**, 0.58 and 0.39 for BERTopic, and 0.62 and 0.52 for SeededLDA."

> "Most of our experiments implement topic generation with GPT-4 and topic assignment with GPT-3.5-turbo, which **costs around $100 per dataset**."

> "We also experiment with the open-source **Mistral-7B-Instruct** model, which **assigns topics well but cannot competently follow instructions for generating topics**."

Tablo 11 (maliyet):

| Aşama | Bills | Wiki |
|---|---|---|
| Topic generation | $30 | $90 |
| Topic refinement | $10 | $5 |
| Assignment + self-correction | $48 | $60 |
| **Toplam** | **$88** | **$155** |

Tablo 12 (veri boyutu):

| | Bills | Wiki |
|---|---|---|
| # docs | **32,661** | **14,290** |
| avg tokens/doc | 261 | 3,412 |
| # test examples | 15,242 | 8,024 |
| # topic generation docs | **1,000** | **1,100** |

### Kaynaklar
- https://arxiv.org/abs/2311.01449
- https://aclanthology.org/2024.naacl-long.164/
- https://arxiv.org/html/2311.01449

### "1–2K yüksek değerli belge" kapsamı üzerine
Bu sayı **tamamen uydurma değil**, ama çapraz denetimin sunduğu biçimde **kaynaklı da değil**:

1. TopicGPT'de 1.000/1.100 sayısı **topic generation** için kullanılan alt örneklem. Atama (assignment) 15.242/8.024 test belgesinde yapılıyor; toplam korpus 32.661/14.290.
2. Timoshenko–Mao–Hauser (2025) SFT-VOC makalesinde ayrı bir 1.000 rakamı var: "The original VOC study used a machine-learning approach to screen 14,341 online-review sentences and identify **1,000 informative and non-repetitive sentences**... The 1,000 number was selected as a typical cost-versus-quality tradeoff for client based VOC applications."
3. Yani "1–2K" rakamının iki ayağı var: TopicGPT'nin generation örneklemi ve VOC çalışmasının 1.000 bilgilendirici cümlesi. Ama **hiçbir kaynak "toplam korpusu 1–2K belgeyle sınırla" demiyor.** TopicGPT tam tersine, 14K–33K belgeye ölçekleniyor.

**Doğru ifade:** "Topic generation için 1.000–1.100 örnek yeterli olabilir; assignment ve tarama tüm korpusta yapılır." Çapraz denetimin tablosundaki "1–2K yüksek değerli belge" satırı, keşif örneklemi ile korpus kapsamını karıştırıyor.

---

## 10. `BERTopic.transform` + `approximate_predict`

### Hüküm: KISMEN — mekanizma doğru, ifade yanıltıcı

### Gerçek mekanizma (BERTopic kaynak kodu)

`BERTopic.transform` içinde:

```python
if is_supported_hdbscan(self.hdbscan_model):
    predictions, probabilities = hdbscan_delegator(
        self.hdbscan_model, "approximate_predict", umap_embeddings
    )
    if self.calculate_probabilities:
        probabilities = hdbscan_delegator(
            self.hdbscan_model, "membership_vector", umap_embeddings
        )
else:
    predictions = self.hdbscan_model.predict(umap_embeddings)
    probabilities = None
```

Yani:

1. Yeni belge önce **eğitilmiş UMAP** ile aynı düşük boyutlu uzaya indirilir.
2. HDBSCAN uyumlu bir model varsa, `transform` **zaten** `approximate_predict` çağırır.
3. `approximate_predict`, `hdbscan` kütüphanesinin bir metodudur ve modelin `prediction_data=True` ile eğitilmiş olmasını gerektirir. BERTopic'in varsayılan HDBSCAN'i bunu `True` yapar.
4. HDBSCAN yoksa `hdbscan_model.predict(...)` çağrılır.

### Değerlendirme
- **"BERTopic.transform + approximate_predict"** teknik olarak *yanlış değil*, ama **iki ayrı adım değil**: `transform` public API'dir, `approximate_predict` onun içinde çağırdığı HDBSCAN metodudur. Kullanıcı `approximate_predict`'i ayrıca çağırmaz.
- **"Centroid ataması yanlış"** kısmı kısmen doğru: BERTopic'in `topic_embeddings_` değeri dokümanda "calculated by taking the centroid embedding of each cluster" olarak tanımlı. Yani centroid tanımlı; ama centroid vektörü bir *belge* değildir ve ham embedding uzayında cosine argmax yapmak, `transform`'un UMAP + HDBSCAN mekanizmasıyla **eşdeğer değildir**. Asıl itiraz "centroid temsilci değil" değil, "atama UMAP uzayında ve yoğunluk tabanlı yapılır; ham uzayda centroid argmax farklı bir algoritmadır" olmalıydı.
- **Kalibre sınıflandırıcı alternatifi** geçerli ve literatürde yaygın; bu kısım doğru.
- **Düşük margin → unassigned + insan jürisi** önerisi makul; HDBSCAN'in `-1` outlier davranışıyla da uyumlu.

### Kaynaklar
- https://github.com/MaartenGr/BERTopic/blob/master/bertopic/_bertopic.py (`transform`)
- https://maartengr.github.io/BERTopic/api/bertopic.html
- https://maartengr.github.io/BERTopic/getting_started/clustering/clustering.html

---

## 11. FSEK m.68 ve TDM istisnası

### Hüküm: DOĞRULANDI — çapraz denetim gereğinden temkinli

### m.68 metni

5846 sayılı FSEK m.68/1 (değişik: 23/1/2008-5728/137):

> "Eseri, icrayı, fonogramı veya yapımları hak sahiplerinden bu Kanuna uygun yazılı izni almadan, işleyen, çoğaltan, çoğaltılmış nüshaları yayan, temsil eden veya her türlü işaret, ses veya görüntü nakline yarayan araçlarla umuma iletenlerden, izni alınmamış hak sahipleri sözleşme yapılmış olması halinde isteyebileceği bedelin veya bu Kanun hükümleri uyarınca tespit edilecek rayiç bedelin **en çok üç kat fazlasını** isteyebilir."

### Nüanslar
- **"Üç kat" bir üst sınırdır**, otomatik değil. Yargıtay uygulamasında hâkimin takdir yetkisi tartışmalı; birçok kararda doğrudan 3x'e hükmediliyor (Y. 11. HD, 17.06.2025, E. 2024/6596, K. 2025/4186).
- **"Tazminat" değil, "bedel" talebi.** Doktrin ve Yargıtay bunu "farazi sözleşme bedeli" / "medeni ceza" olarak nitelendiriyor; kusur ve zarar ispatı gerekmiyor. Bu, klasik maddi tazminattan farklı.
- **m.70/2 tazminatıyla kümülatif değil.** YHGK 30.06.2020, E. 2017/71, K. 2020/483: 3x bedel ile m.70/2 tazminatı birlikte istenemez; tazminat ancak 3x'i aşan zarar için.
- **"En çok üç kat fazlası"** lafzen "3 kat fazla" (yani 4x) gibi okunabilir; Türk uygulaması bunu "rayiç bedelin üç katı" (3x toplam) olarak uyguluyor. Çapraz denetimin "3x" ifadesi pratikle uyumlu.

### TDM istisnası

Serkan Dalkıran, TAAD 66 (2026):

> "FSEK'te TDM'ye özgü açık bir sınırlamaya yer verilmemiştir."

> "Aralık 2025'te TBMM'ye sunulan 'Dijital Telif Hakları Kanun Teklifi'... CDSM Direktifi'ne paralel olarak **TDM'ye özgü bir sınırlama öngörmeyerek**, tartışmaya açık bir şekilde ABD telif hukukunda kabul edilen adil kullanım kavramına yer vermektedir."

Av. Şerafettin Kaya (30 Temmuz 2026):

> "Türk hukukunda, korunan eserlerin ticari model eğitiminde kullanılmasını meşrulaştıran **açık bir istisna hükmü yoktur**."

Av. Zeki Demirci (25 Nisan 2026):

> "Türkiye'de DSM Direktifi'ne paralel bir düzenleme bulunmamaktadır... Maddi tazminat FSEK m. 68 kapsamında üç katına kadar artırılabilir."

### Kaynaklar
- https://justlaw.com.tr/mevzuat/5846-sayili-fikir-ve-sanat-eserleri-kanunu/madde-68
- https://taad.taa.gov.tr/yuklenenler/dosyalar/dergiler/taad/taad-66/17.pdf
- https://www.serafettinkaya.av.tr/uretken-yapay-zeka-ve-fikri-mulkiyet/ (30 Tem 2026)
- https://zekidemirci.av.tr/makaleler/yapay-zeka-egitim-verisi-telif (25 Nis 2026)

### Değerlendirme
Çapraz denetim "FSEK'te TDM istisnası yok" iddiasına **KISMEN / DOĞRULANAMADI** demiş. Bu fazla temkinli: iki bağımsız 2026 tarihli Türk hukuk kaynağı ve Aralık 2025 kanun teklifinin analizi, istisnanın **olmadığını** açıkça söylüyor. Doğru hüküm **DOĞRULANDI**, şu şerhle: Aralık 2025'te TBMM'ye bir "Dijital Telif Hakları Kanun Teklifi" sunuldu; teklif TDM istisnası içermiyor, ancak "adil kullanım" kavramına yer veriyor. Yani hukuk değişebilir; bu bir "şu an yok" tespiti.

---

## 12. The Mom Test kopya sayısı

### Hüküm: KISMEN

### Alıntılar

Rob Fitzpatrick'ın resmî sitesi (2026):

> "I'm mainly known for my approach to doing custdev and sales as an introverted techie (**The Mom Test, 300,000+ copies sold**)."

> "The Mom Test... (**300,000+ copies sold**)."

Safi Media / Eleanor Beaton (30 Ocak 2024):

> "Rob Fitzpatrick... has authored **three books** about his learnings along the way, **which have sold over 250K copies**."

A Letter a Day (21 Ekim 2025):

> "Today, The Mom Test has sold over **250K copies**."

IndieMakerList:

> "Published in 2013, it has sold more than **300,000 copies**."

### Kaynaklar
- https://robfitz.com/about/
- https://safimedia.co/fierce-insights/sell-books-miniscule-marketing-budget-rob-fitzpatrick/ (30 Oca 2024)
- https://aletteraday.substack.com/p/f5-the-startup-founders-toolkit (21 Eki 2025)
- https://indiemakerlist.com/p/rob-fitzpatrick/

### Değerlendirme
- "250.000" **yanlış değil**, ama **eski ve kategori hatası riski taşıyor**: 2024 kaynağı bu sayıyı **üç kitabın toplamı** için kullanıyor; 2025 kaynağı The Mom Test'e atfediyor.
- Yazarın güncel resmî rakamı **The Mom Test için 300.000+**. 250K bir alt sınır olarak savunulabilir; "güncel doğru rakam" olarak sunulursa yanıltıcı.
- Çapraz denetim bu kalemi "doğrulanamayanlar" listesine koymuş; aslında **kısmen doğrulanabilir** ve düzeltilebilir.

---

## 13. AR-Miner sayıları

### Hüküm: DOĞRULANDI (bağlam nüansıyla)

### Alıntılar

Chen, Lin, Hoi, Xiao & Zhang, ICSE 2014, "AR-Miner: Mining informative reviews for developers from mobile app marketplace":

> "First of all, the proportion of 'informative' user reviews is relatively low. In our study (see Section 5.1), we found that **only 35.1% of app reviews contain information that can directly help developers improve their apps**."

Tablo 4:

| App | SwiftKey | Facebook | TempleRun2 | TapFish |
|---|---|---|---|---|
| % Info. | 29.3% | 55.4% | 31.1% | 24.6% |

> "The row '% Info.' in Table 4 shows the proportion of 'informative' reviews... **On average, 35.1% reviews are 'informative'.**"

Tablo 8:

> "AR-Miner (LDA) Hit-rate **0.70**; NDCG@10 0.552"

> "AR-Miner (LDA) achieves **0.70 in terms of Hit-rate**, which indicates that AR-Miner is able to automatically discover the most 'informative' information effectively."

### Kaynaklar
- https://ink.library.smu.edu.sg/cgi/viewcontent.cgi?article=3323&context=sis_research
- https://ink.library.smu.edu.sg/sis_research/2323/
- https://doi.org/10.1145/2568225.2568263

### Nüans
- **%35,1** dört uygulamanın **ortalaması**; tek tek oranlar %24,6–%55,4 arasında değişiyor. "Evrensel informative oranı" gibi okunmamalı.
- **0,70 hit-rate** tek bir vaka çalışmasına ait: SwiftKey, K=22, top-10 konu, geliştirici forumu ground truth'u. Dört uygulamanın genel performansı değil.
- Çapraz denetim bu iki sayıyı "DOĞRU" diye tekrarlıyor; sayılar doğru, ama bağlam metinde kaybolmuş.

---

## 14. TH2019 sayıları

### Hüküm: DOĞRULANDI

### Alıntılar

Timoshenko & Hauser, "Identifying Customer Needs from User-Generated Content", Marketing Science 2019:

> "From the **115,099 oral-care reviews** on Amazon spanning the period from 1996 to 2014, we randomly sampled **12,000 sentences** split into an initial set of **8,000** sentences and a second set of **4,000** sentences."

> "To maintain a common level of training and experience for reviewing UGC and experiential interview transcripts, the sentences were reviewed by a group of **three experienced analysts** from the same firm that provided the interview-based VOC."

> "With 12,000 sentences, that brings the total to 83 of the 86 experiential-interview-based customer needs and **91 of the 94 total needs (97%)**."

> "Overall, analysts identified 91 customer needs from UGC and 86 customer needs from experiential interviews."

### Kaynaklar
- https://pubsonline.informs.org/doi/10.1287/mksc.2018.1123
- https://dspace.mit.edu/bitstream/handle/1721.1/124203/Timoshenko_Hauser%20Customer%20Needs%20from%20UGC%20June%202018.pdf
- https://thearf-org-unified-admin.s3.amazonaws.com/MSI/2020/06/MSI_Report_18-124-1.pdf

### Not
- 115.099 **review**, 12.000 **cümle**. İkisi karıştırılmamalı.
- 91/94 = %97; 83/86 = %96,5. Çapraz denetim "91/94" diyor, doğru.
- Üç analistin yanı sıra güvenilirlik için **dördüncü bir kör analist** 200 cümleyi yeniden kodluyor; bu, "üç analist" ifadesini çürütmez, tamamlar.

---

## 15. SFT-LLM eğitim verisi

### Hüküm: DOĞRULANDI (nüans)

### Alıntılar

Timoshenko, Mao & Hauser, "Transforming the Voice of the Customer: Large Language Models for Identifying Customer Needs" (arXiv 2503.01870, Şubat 2025):

> "The ten professional VOC studies provided **1,549 CN-verbatim pairs**. We randomly split the 'positive' examples into two subsamples for model training (80%) and validation (20%). Additionally, the data contained **11,975 uninformative sentences**."

> "We selected the number of randomly-chosen negative examples (**47**) by observing the model performance on the validation data."

> "Fine-tuning was facilitated by the DeepSeek Library and required approximately **eight hours using four Nvidia A100 GPUs**."

> "We find that performance improves steadily as the training set grows from 75 to 600 examples. **However, marginal gains diminish beyond this point. Increasing the training set size above 600 examples does not further enhance the SFT LLM's performance.**"

> "these results suggest that an SFT LLM can achieve high performance with **substantially fewer than 1,549 training pairs**."

### Kaynaklar
- https://arxiv.org/abs/2503.01870
- https://arxiv.org/pdf/2503.01870v1
- https://artemtimoshenko.com/assets/papers/GPT%20VOC%20Jan%202026%20SSRN.pdf

### Değerlendirme
- **1.549 CN-verbatim çifti:** doğru.
- Çapraz denetimin "bu eğitim verisi yoksa analist düzeyi genellenebilir kanıt değildir" uyarısı **yön olarak** makul; ama makale, **600 örnekte** performansın platoya girdiğini ve 1.549'un tamamına ihtiyaç olmadığını açıkça söylüyor. Yani "1.549 olmadan olmaz" biçimindeki bir okuma fazla katı.
- Ayrıca 11.975 negatif cümle ve 47 seçilmiş negatif örnek, veri setinin yalnızca "1.549 pozitif çift"ten ibaret olmadığını gösteriyor.
- Not: AI-TA paper'ında da tesadüfen "1,549 pairs" geçiyor (Piazza preference pairs); bu farklı bir veri seti. Karıştırılmamalı.

---

## Çapraz Denetimin Kendi Hataları (özet)

| Hata | Ne oldu | Kaynak |
|---|---|---|
| **GummySearch $35K MRR** | "İkincil kaynak" etiketi doğruyken "YANLIŞ (etiket hatası), birincil founder duyurusu" denmiş. Founder yazısında MRR yok. | gummysearch.com/final-chapter; Kaeda; Failory |
| **FSEK/TDM fazla temkinli** | Doğrulanabilir "TDM istisnası yok" iddiası "KISMEN / DOĞRULANAMADI"da bırakılmış. | TAAD 66; Kaya 2026; Demirci 2026 |
| **MicroConf yanlış ikilem** | "469 mu 700 mü?" çelişki gibi sunulmuş; 469 yayımlanan n, ~700 "usable responses". | microconf.com; SFTROU 721 |
| **TopicGPT kapsam genişletmesi** | 1.000–1.100 *generation* örneklemi, "1–2K toplam korpus" önerisine dönüşmüş. | arXiv 2311.01449 Tablo 12 |
| **scikit-learn analogisi** | Sayılar doğru ama 90 küme dokümanın "yanlış ayar" örneği; 2D blob → metin embedding analogisi geçersiz. | sklearn demo |
| **BERTopic mekanizması** | `transform` + `approximate_predict` iki ayrı adım gibi yazılmış; aslında `transform` içinde çağrılıyor. | BERTopic kaynak kodu |
| **Mom Test 250K** | Güncel resmî rakam 300.000+; 250K üç kitap toplamı olabilir. | robfitz.com/about |

---

## Doğrulanamayanlar / Gap'ler

1. **GummySearch ilk 2 yıl: 400 ödeyen müşteri.** Çapraz denetim "DOĞRU" diyor; 10.000+ kullanıcı, ~$100K kümülatif ve ~$3K MRR rakamlarını ikincil kaynaklarda gördüm, ancak **400 ödeyen** rakamını birincil founder postunda teyit edemedim.
2. **BigIdeasDB "25k/month".** Indie Hackers profilindeki bu ifadenin MRR mı, aylık gelir mi, hedef mi olduğu belirsiz; bağımsız doğrulama yok.
3. **Reddit'in 31 Ekim cümlesinin birebir metni.** Reddit sayfası doğrudan çekilemedi; dört bağımsız kaynak aynı tarihi aktarıyor, ancak cümle cümle alıntı yapılamadı.
4. **MicroConf 2024 raporu PDF'inin iç n'si.** Yayın sayfası 469 diyor; PDF iç kapağını açıp teyit etmedim.
5. **Mashable'ın kendi kaynağı.** Mashable makalesi TechCrunch'a atıf yapıyor; bağımsız birincil kaynak değil. Bu, Reddit tarihleri için sorun değil (TechCrunch + Reddit postu var), ama Mashable'ı "birincil" saymak yanlış olur.
6. **FSEK m.68'de "üç kat fazlası"nın lafzi 4x mi 3x mi olduğu.** Uygulama 3x; doktrinde tartışma var. Çapraz denetimin 3x kullanımı pratikle uyumlu ama metin lafzen belirsiz.
7. **The Mom Test 250K'nın hangi tarihte The Mom Test'e mi üç kitaba mı ait olduğu.** Kaynaklar çelişiyor; kesin ayrım yapılamadı.

---

## Kısa sonuç

Çapraz denetim, sayısal omurgada büyük ölçüde güvenilir: Reddit takvimi, Reddit v. Anthropic, Powa, BigIdeasDB, BERTopic rehberi, AR-Miner, TH2019 ve SFT-LLM rakamları birincil kaynaklarla uyuşuyor. Ancak üç yerde kendi kanıt disiplinini bozuyor:

1. **GummySearch $35K MRR** — doğru etiketi yanlış diye düzeltmiş, yeni birincil kaynak göstermeden.
2. **TopicGPT "1–2K kapsam"** — alt örneklem rakamını ürün kapsamı önerisine dönüştürmüş.
3. **scikit-learn ve BERTopic mekanizması** — sayıları doğru, yorumları fazla geniş.

Buna karşılık FSEK/TDM ve MicroConf kalemlerinde gereğinden temkinli; ikisi de mevcut kaynakla daha net kapanabilirdi.
