# Sinyal hiyerarşisi ayakta kalıyor, kanıt zinciri kırılıyor

Denetimin ana bulgusu: "Startup fikri yakalama teknikleri" raporunun **yönü** kanıtla uyumlu, **ölçüsü** değil. "Davranış beyandan daha güçlü bir sinyaldir" iddiası destekleniyor — niyet-davranış korelasyonu 422 çalışmada r=0,53, beyan edilen ödeme isteği gerçek ödemeye göre medyan 1,35× şişiyor ([Sheeran 2002](https://doi.org/10.1080/14792772143000003); [Murphy vd. 2005](https://doi.org/10.1007/s10640-004-3332-z)) — ama "I wish ≈ sıfır sinyal" cümlesi ölçülmemiş bir pratisyen sezgisidir ve raporun kendi üçüncü bölümüyle çelişir. Buna karşılık **akademik NLP omurgası şaşırtıcı derecede sağlam**: Timoshenko & Hauser 2019, AR-Miner, 2503.01870, TopicImpact, NIST ve LLM-ITL atıfları gerçek, ana sayılar ve alıntılar birebir doğru. Kırılma noktası uydurma kaynak değil, **yanlış atıflar ve sistematik aşırı yorum**: CiteCheck'e atfedilen sayılar CiteME'nin, commitment merdiveni Fitzpatrick'in değil bir AI-skill dosyasının, %82 von Hippel'in 1986 makalesinde hiç yok. Daha da önemlisi, üretim kararlarını doğrudan etkileyen üç teknik öneri — `min_cluster_size=5 + epsilon≈0 + leaf`, evrensel cosine 0,55 ve centroid ataması — kaynak dokümanlarıyla çelişiyor ve raporda UMAP hiç anılmıyor. Hukuk tarafında "arşiv yolu hayatta" cümlesi teknik olarak doğru, ticari olarak değil: Reddit'in public API'si Mart 2027'de kapanıyor, Stack Exchange'de atıf share-alike'ı karşılamıyor, ekşi'nin `ai-input=no` sinyali LLM'i yasaklıyor ve FSEK'te TDM istisnası yok. Pazar kanıtı ise raporun kendi sonucunu zayıflatıyor: BigIdeasDB'nin "18–23 bin dolar/ay" rakamı kümülatif gelirin aylık sanılmasıyla **10× şişmiş**, Viable 2024'te kapanmış, GitHub issue madenciliğinde en az dört ticari ürün var. Bu denetim her iddiayı birincil kaynağa (DOI, yayıncı PDF'i, resmî dokümantasyon, SEC dosyası, mahkeme kaydı, founder beyanı) karşı okur; erişim tarihi 21.10.2026'dır. Hükümler üç kategoriye ayrılır: raporun hatası, literatürün zayıflığı ve ikisinin karışması — çünkü bunlar okuyucu için farklı şeyler ifade eder.

## Yönetici özeti

- **Yön doğru, ölçü yanlış.** Davranışsal kanıt beyandan güçlü bir vekildir; ama "I wish ≈ sıfır" hiçbir çalışmada ölçülmedi, üstelik raporun §3'te kabul ettiği UGC-VOC eşdeğerliğiyle çelişiyor ([Sheeran](https://doi.org/10.1080/14792772143000003); [TH2019](https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=5084)). Doğru formülasyon: *beyan gürültülü ve yukarı yanlı bir vekildir, sıfır değerli değildir.*

- **Akademik NLP omurgası geçti.** TH2019'un tasarımı (115.099 review, 12.000 cümle, 3 analist, 91/94 ihtiyaç), AR-Miner (%35,1 informative, hit-rate 0,70), SFT-LLM alıntısı, TopicImpact, NIST ve LLM-ITL birebir doğrulandı. Hatalar uydurma kaynak değil, aşırı yorum ve iki yanlış atıf.

- **Üretim parametreleri kırıldı.** `mcs=5 + eps≈0 + leaf` maksimum parçalanma üretir; 750 noktada `mcs=3` **90 küme**, `mcs=5` dört ([demo](https://scikit-learn.org/stable/auto_examples/cluster/plot_hdbscan.html)). Cosine 0,55 kalibre olasılık değil; repo'nun kendi notu TR/EN centroid benzerliğini "GÜVENİLMEZ" sayıyor.

- **İki hata tezi daraltıyor, biri bozuyor.** %82'nin düzeltilmesi iddiayı "major improvement, bilimsel enstrüman"a daraltıyor; 3M'in düzeltilmesi raporun argümanını güçlendiriyor (5/5 vs 1/42); BigIdeasDB'nin 10× şişmesi segment kararını bozuyor ([IndieNiche](https://indieniche.substack.com/p/meet-the-15-year-old-founder-turning); [IH](https://www.indiehackers.com/post/my-app-makes-me-2k-this-month-after-8-months-of-growing-steadily-how-i-would-start-again-from-0-as-a-15-year-old-d1ed45b86f)).

- **En ciddi atıf hatası, atıf hijyeni raporunda.** CiteCheck'e atfedilen %69,7 / %4,2–18,5 sayıları CiteME'nin; CiteCheck'in kendi sonucu **%88,9 doğruluk** ([CiteCheck](https://arxiv.org/abs/2605.27700); [CiteME](https://arxiv.org/abs/2407.12861)).

- **Kaynak kalitesi asimetrisi ölçüldü.** §1–§2'deki ~13 atfın **~10'u katman 5–6**; üç operasyonel test tek WhittleOS sayfasına, merdiven tek GitHub `SKILL.md` dosyasına dayanıyor. "Bağımsız post-mortem" yazarı "Boris" ile WhittleOS'un yazarı Boris Binyaminov'un aynı kişi olması yüksek olasılıklı — doğrulanmadı; doğrulanırsa teyit tek kaynağa iner.

- **Hukuk planı değiştiriyor.** SE'de atıf yalnız BY'yi karşılar; SA uyarlamanın aynı lisansla paylaşılmasını gerektirir ([CC FAQ](https://creativecommons.org/faq/)). ekşi'de `ai-input=no` LLM'i yasaklıyor; FSEK'te TDM istisnası yok, tazminat m.68 ile üç katına çıkabilir ([Dalkıran](https://dergipark.org.tr/tr/download/article-file/5626014)).

- **Arşiv beş ayda donuyor.** Reddit public API Mart 2027'de kapanıyor; Arctic Shift'in canlı ingest'i buna bağlı ([r/redditdev](https://www.reddit.com/r/redditdev/comments/1wubcvf/moving_data_api_apps_to_the_developer_platform/)). "2005'ten bugüne tam kapsama", Mart 2027'den sonra "2005 → Mart 2027" olur.

- **Raporun en güçlü cümlesi kendi mimarisini yönetmiyor.** "Only an ask can" doğru; ama beş maddenin dördü metin hattı. Booked demo **%0,35**; 10 pilot için ~8–10 bin e-posta gerekir ([GROU](https://grouglobal.com/blog/cold-email-benchmarks)).

- **Darboğaz fikir madenciliği değil.** Medyan **$145/ay**, yalnızca **%23,6** $1k'ya ulaşıyor ([BigIdeasDB](https://bigideasdb.com/state-of-indie-saas-revenue-2026)); Scott vd. fikir özetlerinin **yazılımda ticarileşmeyi öngörmediğini** buluyor ([HBS](https://www.hbs.edu/ris/Publication%20Files/16-013_41f3750a-9d54-49be-a8f4-51a6489d514e.pdf)). Fikir madenciliği bir filtre; kaldıraç ask ve segment.

- **Revize plan üç eksende.** "Replayable" + run manifest; 0,55'i model/dil başına kalibre et ve atamayı `BERTopic.transform`/sınıflandırıcıya taşı; lisans metadatası ve ask hunisini bütçele. Parametre deneyleri 3060'ta tekrarlanmalı.

## Denetim tablosu

### Sinyal teorisi

| İddia | Hüküm | Tek satır kanıt |
|---|---|---|
| Ölçü birimi "yapılmış" olandır | **DOĞRULANDI** (yön) | Niyet-davranış r=0,53; WTP 1,35× şişiyor ([Sheeran](https://doi.org/10.1080/14792772143000003); [Murphy](https://doi.org/10.1007/s10640-004-3332-z)) |
| "I wish" ≈ sıfır sinyal | **KANIT YOK** | Öngörü değerini ölçen tek çalışma yok; rapor §3 UGC-VOC'yi kabul ediyor |
| Commitment ladder (4 kademe) | **KISMEN** | Gradyan kitapta var (time/reputation/money); kademeler AI-skill dosyasından ([SKILL.md](https://github.com/guia-matthieu/clawfu-skills/blob/main/skills/validation/mom-test/SKILL.md)) |
| Workaround = en güçlü sinyal | **KISMEN → aşırı** | Kullanıcı inovasyonlarının ~%1–2'si ticarileşiyor ([NESTA](https://media.nesta.org.uk/documents/measuring_user_innovation_in_the_uk.pdf)) |
| von Hippel %82 (1986) | **YANLIŞ** | 1986'da "82" yok; 1976 major improvement 36/44 ([SofI](https://www.mit.edu/evhippel/www-old/books/sources/SofI.pdf)) |
| 3M "benzer sayıda" ürün hattı | **YANLIŞ** | 5/5 vs 1/42; tahmini 5. yıl satışı 8× ([DI Ch10](https://web.mit.edu/evhippel/www/books/DI/Chapter10.pdf)) |

### Akademik NLP

| İddia | Hüküm | Tek satır kanıt |
|---|---|---|
| TH2019 mimarisi ve UGC-VOC eşdeğerliği | **DOĞRULANDI** (tasarım) | 115.099 review, 12.000 cümle, 91/94 ihtiyaç; makale "likely more valuable" diyor |
| "40%→80%, katlarıyla büyütür" | **KISMEN** | Alıntı hipotetik; ampirik kazanç %15–22, aynı ihtiyaç için %20 daha az cümle |
| SFT-LLM "analist düzeyi" | **DOĞRULANDI** (alıntı) / **KISMEN** (tarih) | v1 25.02.2025; 1.549 etiketli CN-verbatim çifti gerekiyor ([arXiv](https://arxiv.org/abs/2503.01870)) |
| CiteCheck %69,7 vs %4,2–18,5 | **YANLIŞ** | Sayılar CiteME'nin; CiteCheck %88,9 |
| Fiyat ve batch aritmetiği | **DOĞRULANDI** | $52,50 batch; 272K "short context" eşiği; Gemini 2.5 Flash-Lite 20.10.2026'da emekli |

### Kümeleme tekniği

| İddia | Hüküm | Tek satır kanıt |
|---|---|---|
| Keşif/atama çift rejimi | **DOĞRULANDI** | HDBSCAN transdüktif; `approximate_predict` sabit küme varsayar ([tutorial](https://hdbscan.readthedocs.io/en/latest/prediction_tutorial.html)) |
| `mcs 5–15 + eps≈0 + leaf` | **YANLIŞ** (kombinasyon) | Doküman mikro-küme uyarıyor; eps tam bunları birleştirmek için var ([param](https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/parameter_selection.rst)) |
| Cosine 0,55 evrensel eşik | **YANLIŞ** (evrensel) | Kalibre olasılık değil; model/dil başına dağılım değişir |
| Centroid atama varsayılan doğru | **YANLIŞ** | BERTopic centroid'i küme temsilcisi saymıyor ([algorithm](https://maartengr.github.io/BERTopic/algorithm/algorithm.html)) |
| UMAP'in yokluğu | **EKSİK** | HDBSCAN 50–100 boyuttan sonra düşüyor ([FAQ](https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/faq.rst)); kod UMAP(15,10,cos42) kullanıyor |
| "Deterministik veri yolu" | **YANLIŞ** (adlandırma) | UMAP stokastik; çok iş parçacıklı koşu tekrarlanamaz ([UMAP](https://raw.githubusercontent.com/lmcinnes/umap/master/doc/reproducibility.rst)) |

### Pazar kanıtı

| İddia | Hüküm | Tek satır kanıt |
|---|---|---|
| GummySearch ilk 2 yıl | **DOĞRULANDI** | 10.000+/400/$100K/~$3K birebir ([IH](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897)) |
| $35K MRR "ikincil aktarım" | **YANLIŞ** (etiket) | Founder'ın X duyurusu; birincil ama bağımsız doğrulanmamış ([arrfounder](https://arrfounder.com/news/gummysearch-reaches-35k-mrr)) |
| Ölüm nedeni "lisans talebiyle karşılaşmak" | **KISMEN** | Reddit talep etmedi; founder başvurdu; erişim kesilmedi ([Closing](https://gummysearch.com/closing-time/)) |
| GitHub'da ticari SaaS yok | **YANLIŞ** | Buska $49/ay, SaaSScout $300, IdeaSaaS $10–22/ay, Trendstr ([Buska](https://www.buska.io/platforms/github)) |
| BigIdeasDB "18–23K/ay" | **YANLIŞ** | Kümülatif; aylık ~$2K, en iyi ay $4,6K |
| Viable "doğrulanmış" | **YANLIŞ** | 24.07.2024'te kapandı ([LinkedIn](https://www.linkedin.com/posts/danielerickson_i-recently-made-the-tough-decision-to-shut-activity-7221921410514837505-tol_)) |

### Hukuki erişim

| İddia | Hüküm | Tek satır kanıt |
|---|---|---|
| "Arşiv yolu hayatta" | **KISMEN** | Teknik canlı; ingest Mart 2027'de durur ([r/redditdev](https://www.reddit.com/r/redditdev/comments/1wubcvf/moving_data_api_apps_to_the_developer_platform/)) |
| Dump'ları ticari kullanmak uygun (ima) | **HUKUKEN RİSKLİ** | UA ticari exploit'i yasaklıyor; dump lisansı yok ([UA](https://www.redditinc.com/policies/user-agreement)) |
| Reddit v. Anthropic | **DOĞRULANDI** | Remanded; sözleşme/UCL ayakta ([CourtListener](https://www.courtlistener.com/docket/70704683/reddit-inc-v-anthropic-pbc/)) |
| SE'de atıf zinciri BY-SA'yı tamamlar | **YANLIŞ** | BY ≠ SA; uyarlama riski ([CC FAQ](https://creativecommons.org/faq/)) |
| ekşi robots profili "uyumlu" | **YANLIŞ** | `ai-input=no`; robots lisans değil; FSEK'te TDM yok; KVKK |
| "Trustpilot v. SellCell" | **YANLIŞ** | `GlobalGuru Tech v. Trustpilot`; SellCell nonparty; PI reddedildi ([ECF 34](https://app.midpage.ai/document/globalguru-tech-llc-v-trustpilot--b5011e65-01ce-4c05-958f-ed1d1c43da7b)) |

### Sonuç kanıtı

| İddia | Hüküm | Tek satır kanıt |
|---|---|---|
| Metin sinyali ödemenin güvenilir öncüsü | **DESTEKLENMİYOR** | Doğrudan çalışma yok; raporun kendi vakası 400 DM → 6 ziyaret ([IH](https://www.indiehackers.com/post/how-i-validated-my-idea-with-reddit-57209ffc2c)) |
| Yöntem daha iyi startup sonucu üretir | **KANIT YOK** | Kohort, kontrol grubu, sonuç takibi yok |
| Anılan başarı vakaları tipik | **DESTEKLENMİYOR** | n=3, self-report; $300 < $1k eşiği; $18–23K top %2–4 |
| Workaround/para/sayı/tekrar hiyerarşisi | **DOĞRULANDI** (sinyal kalitesi) | En güçlü ölçülmüş sinyal preorder ([Welter](https://www.emerald.com/neje/article-pdf/24/1/21/2033557/neje-08-2020-0031.pdf)) |
| Ask hattı operasyonel | **DESTEKLENMİYOR** | %0,35 booked demo; 10 pilot ≈ 8–10 bin e-posta |
| "Sinyal-sınıfı→ödeme ölçümü yok" | **KISMEN** | ICWSM 2020 toplam harcama tahmini var ([Pekar](https://aaai.org/papers/00545-7322-purchase-intentions-on-social-media-as-predictors-of-consumer-spending/)) |
| "Nadir-sistematik taksonomi yok" | **YANLIŞ** | Weak-signal literatürü ve raporun kendi ACM CSUR atfı ([CSUR](https://dl.acm.org/doi/10.1145/3657286)) |

## Kanıtı geçenler

Akademik NLP omurgası denetimin en az tartışmalı kısmı. TH2019'un tasarımı rapordaki gibi: **115.099 review** içinden rastgele **12.000 cümle**, üç analist, 86 deneyim-temelli ihtiyacın 12.000 cümlede 91/94'ü; maliyet görüşmenin **%40–55'i**, kazanç **%46–52** ([çalışma metni](https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=5084)). Raporun "eşdeğer"i makalenin "at least as valuable, likely more valuable" cümlesinden *daha zayıf* — hata raporun lehine. 2503.01870'in abstract'ı ve kapsam iddiası (154 CN, tertiary'lerin %84,6'sı) birebir; AR-Miner (%35,1; 0,70 hit-rate), TopicImpact, NIST'in "aşırı genel topic + belge-atandırma halüsinasyonu", LLM-ITL'in "global yapı istatistiksel modelde kalmalı" cümlesi ve ACL 2026 survey tablosu kaynakta karşılığını buluyor ([AR-Miner](https://dl.acm.org/doi/10.1145/2568225.2568263); [TopicImpact](https://arxiv.org/abs/2507.13392); [NIST](https://nist.gov/publications/traditional-topic-models-llm-topic-models-can-large-language-models-replace-traditional); [LLM-ITL](https://aclanthology.org/2025.acl-long.70/); [Survey](https://aclanthology.org/2026.findings-acl.326/)). Atıf kümesinde de AAAI 42257'nin %12/%16/%21 ve %65→%80'i, 2603.03299'un 69.557 citation'ı, EACL 206'nın %79,18/%87,74'ü doğru ([AAAI](https://doi.org/10.1609/aaai.v40i48.42257); [2603.03299](https://arxiv.org/abs/2603.03299); [EACL](https://aclanthology.org/2026.findings-eacl.206/)).

Fiyat aritmetiği geçti: 1M doküman × 500 + 200 token, GPT-5-nano batch **$52,50**, Gemini **$65**; "$50–65" doğru ([OpenAI](https://platform.openai.com/docs/pricing)). Structured Outputs'un %100'ü `strict: true` ile doğru, semantik garanti değil ([OpenAI](https://openai.com/index/introducing-structured-outputs-in-the-api/)).

Kümeleme mimarisi geçti: HDBSCAN transdüktif, keşif/atama ayrımı doğru ([tutorial](https://hdbscan.readthedocs.io/en/latest/prediction_tutorial.html)); "burst bağımsız kanal, filtre değil tetik" doğru; "LLM asla `review_status` yazmamalı" en sağlam karar, çünkü judge insanla %79–88 uyumda ve otomatik "interesting" kanıt standardını düşürür ([EACL](https://aclanthology.org/2026.findings-eacl.206/)).

Pazar ve hukukta GummySearch'ün ilk iki yılı, kapanış takvimi, IdeaBrowser uyarıları, ET'nin ~$2,95M SEC kaydı ([IH](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897); [Closing](https://gummysearch.com/closing-time/); [FAQ](https://www.ideabrowser.com/frequently-asked-questions); [SEC](https://www.sec.gov/Archives/edgar/data/1831840/000162828024047115/R15.htm)); Trustpilot alıntıları, Apple/Play own-app yönü, SE dump yolu, Pushshift kesintisi ve Reddit v. Anthropic doğru ([ToS](https://corporate.trustpilot.com/legal/for-reviewers/terms-of-use-for-consumers/feb-2025); [modnews](https://www.reddit.com/r/modnews/comments/134tjpe/reddit_data_api_update_changes_to_pushshift_access/); [CourtListener](https://www.courtlistener.com/docket/70704683/reddit-inc-v-anthropic-pbc/)). "Yaptırım riski teorik değil" maddeten doğru — ihtarname 27.11.2025, içerik kaldırma 10.02.2026, mahkeme ihtarnameyi haklı buldu — yalnız gösterilen dava yanlış.

Falsifikasyon: keşif/atama ayrımı, `approximate_predict` ile tam recluster uyumu çok yüksekse gevşer; LLM-status kuralı kalibre judge ön-kayıtlı precision'ı tutturursa tartışılır, ama "interesting" bir taahhüttür; burst kanalı, tetiklenen kümelerin isabeti taban orana yakınsa gereksizleşir.

## Kırılan iddialar

Etki etiketleri: **karar** (parametre, segment, hukuk veya mimari değişir), **itibar** (atıf güvenilirliği zedelenir, sonuç değişmez), **düzyazı** (sayı/cümle yanlış ama karar aynı kalır).

### (i) Sayı ve aritmetik hataları

**von Hippel %82.** Rapor "1986 çalışması… ticari yeniliklerin %82'sini kullanıcı firmaların geliştirdiğini gösterir" diyor. 1986 metninde "82" yok; yalnız "users have developed most of the commercially successful product innovations" deniyor ([1986 PDF](https://evhippel.mit.edu/wp-content/uploads/2013/08/lead-users-paper-1986.pdf)). %82'nin kaynağı 1976 *Research Policy* makalesi ve oran "tüm ticari yenilikler" değil, **"major improvement" hücresi: 36/44**; toplam 111 yenilik, kaynağı bilinen 94 üzerinden %77; özet "approximately 80%" diyor ([Research Policy](https://www.sciencedirect.com/science/article/pii/0048733376900287); [SofI Tablo 2-3](https://www.mit.edu/evhippel/www-old/books/sources/SofI.pdf)). Aynı literatür karşı kanıt da veriyor: ticari önemi yüksek yeniliklerde üreticiler baskın ([Riggs & von Hippel 1994](https://web.mit.edu/evhippel/www-old/papers/evh-01.htm)). **Etki: düzyazı + itibar.** Yön ayakta, ama "kullanıcı = en güvenilir alıcı" sıçraması bu kaynaktan çıkmıyor.

**3M "benzer sayıda".** Rapor kaynağı tersine çeviriyor. Gerçek: fonlanan **5/5** lead-user projesi major ürün hattı üretti; lead-user dışı **42 projeden yalnızca 1'i** (χ², p<0,005); tahmini 5. yıl satışı **$146M vs $18M, 8×**; pazar payı %68 vs %33 ([DI Ch10](https://web.mit.edu/evhippel/www/books/DI/Chapter10.pdf)). "Benzer" olan şey ürün hattı *sayısı* değil, hatların *profili*: 3M'in 1950–2000 geçmişiyle novelty 9,6 vs 8,0 (p=0,21), satış $146M vs $62M (p=0,04), pay %68 vs %61 (p=0,76). **Etki: düzyazı; düzeltme raporun tezini *güçlendiriyor*.** Abartmamak gerek: doğal deney, RCT değil; satışlar forecast; tek firma.

**BigIdeasDB 10×.** "18K→23K dolar/**ay**" kümülatif geliri aylık sanıyor. Founder'ın rakamları: "$23k in revenue", "$7k in the last two months", "best month $4,600", "$2k per month" ([IndieNiche](https://indieniche.substack.com/p/meet-the-15-year-old-founder-turning); [IH](https://www.indiehackers.com/post/my-app-makes-me-2k-this-month-after-8-months-of-growing-steadily-how-i-would-start-again-from-0-as-a-15-year-old-d1ed45b86f)). **Etki:** karar düzeyinde; okuyucuya 10× büyük bir pazar ima ediyor ve "küçük, parçalı, düşük ARPU'lu niş" sonucunu tersine çeviriyor.

**Diğer sayılar.** ghscout ağırlıkları tek-repo satırında Market **0**, rapordaki toplam %115 ([ghscout](https://github.com/lucianfialho/ghscout)). TH2019 "500+" ve AR-Miner "780+" veritabanına göre değişiyor (S2 451/554). "Katlarıyla" ölçülen %15–22 kazancın üstünde; "272K context" aslında "short context" eşiği; Gemini 2.5 Flash-Lite modeli **20 Ekim 2026'da emekliye ayrıldı** ([Google](https://ai.google.dev/gemini-api/docs/pricing)).

### (ii) Atıf yanlışları

**CiteCheck.** Rapor "CiteCheck, insanların %69,7 doğruluğuna karşılık LLM'lerin %4,2–18,5'te kaldığını gösteriyor" diyor. Sayılar **CiteME**'nin; CiteCheck'in kendi sonucu "88.7 macro-F1 and 88.9% accuracy, outperforming GPT, Claude, and Gemini baselines" ([CiteCheck](https://arxiv.org/abs/2605.27700); [CiteME](https://arxiv.org/abs/2407.12861)). **Etki: itibar.** Genel tez değişmez, ama atıf halüsinasyonunu denetleyen bir raporda tam o hata sınıfının yapılması güvenilirliği zedeler.

**Commitment merdiveni.** Dört kademeli taksonomi Fitzpatrick'e ait değil; kaynak bir AI-agent skill tanımı: `author: ClawFu`, `created: 2026-01-25`, `estimated_value: $1,500` ve şablon hatası olarak "Structuring **audio production** workflows" içeriyor ([SKILL.md](https://github.com/guia-matthieu/clawfu-skills/blob/main/skills/validation/mom-test/SKILL.md)). Kitabın kendi formülasyonu bir **gradyan**: "The more time (or reputation, risk and cash) interviewees are giving up, the more seriously you can take their kind words" ([Goodreads](https://www.goodreads.com/author/quotes/19494457.Rob_Fitzpatrick)). **Etki: karar.** İnceleme ekranının çerçevesi (madde 4) buna dayanıyor; merdiven "hipotez" etiketiyle kullanılmalı.

**Trustpilot davası.** Doğru caption `GlobalGuru Tech, LLC d/b/a SellLocked.com v. Trustpilot, Inc.`, `1:26-cv-04478 (NRB)`, 28 Mayıs 2026; davacı Trustpilot değil, Trustpilot'a karşı bir müşteri; SellCell **taraf değil**; 23 Temmuz 2026'da preliminary injunction reddedildi ([ECF 34](https://app.midpage.ai/document/globalguru-tech-llc-v-trustpilot--b5011e65-01ce-4c05-958f-ed1d1c43da7b)). **Etki:** sonuç ayakta, gerekçe yanlış; yanlış caption doğru sonucu zayıflatıyor.

**Diğerleri.** "Reddit v. Perplexity" caption'ı `Reddit, Inc. v. SerpApi LLC et al.`, `1:25-cv-08736` ([docket](https://www.courtlistener.com/docket/71720563/reddit-inc-v-serpapi-llc/)). The Mom Test "literatürün temel referansı" değil, kendi yayımladığı 123 sayfalık kitap. Viable "doğrulanmış" değil, 24 Temmuz 2024'te kapanmış. $35K MRR "ikincil" değil, founder'ın X duyurusu. BUrST'ın 0,76'sı Enron'a ait; Isconna "substring" değil, ardışık varlık/yokluk ölçüyor. 135K–140K "farklı kaynaklar" değil, aynı founder'ın üç hafta arayla iki sayfası.

**Stack Exchange.** "Atıf zincirinin çıktıda taşınması CC BY-SA uyumunu tamamlar" hukuken yanlış. Atıf **BY** ayağını karşılar; **SA**, uyarlamanın aynı lisansla paylaşılmasını gerektirir. StartupHunt'ın fiili işi — cümle çıkarma, normalize etme, embedding, kümeleme, LLM ile özetleme — uyarlama tetikleme ihtimali yüksek ([CC FAQ](https://creativecommons.org/faq/)). **Etki:** ürünün lisans mimarisini etkiler; "kaynak göster" meselesi değil.

### (iii) Kanıttan sonuca sıçramalar

**"I wish ≈ sıfır."** Bunu ölçen tek çalışma yok; literatür "beyan şişirir ama sıfır değildir" diyor: niyet edenlerin %54'ü harekete geçmiyor ama niyet etmeyenlerin yalnızca %3'ü geçiyor ([Sheeran](https://doi.org/10.1080/14792772143000003); [PMC 9386038](https://pmc.ncbi.nlm.nih.gov/articles/PMC9386038/)). Raporun kendisi §3'te UGC-VOC'nin görüşme VOC'u ile eşdeğer olduğunu söylüyor. **Etki:** bu bir *literatür boşluğu*; raporun hatası boşluğu yasa gibi sunması.

**"Workaround en güçlü sinyal."** Alıntı gerçek, sıçrama kanıtsız. Kullanıcı inovasyonlarının ~%2'si benimsenmiş veya ticarileştirilmiş ([NESTA](https://media.nesta.org.uk/documents/measuring_user_innovation_in_the_uk.pdf)); ABD'de inovasyon sahiplerinin %1'i ticarileştirmiş ([NCSES](https://ncses.nsf.gov/pubs/ncses22201/table/5)); hanehalkı inovatörlerinin yalnızca %4'ü ticari saikle hareket ediyor ([UAE](https://evhippel.mit.edu/wp-content/uploads/2019/01/uae-final-report-as-pub-copy.pdf)). von Hippel'in kendi uyarısı: kullanıcı "typically does not consider whether other users have similar needs" ([SofI](https://www.mit.edu/evhippel/www-old/books/sources/SofI.pdf)). **Etki:** taban oranı %1–2 olan bir olayı "en güçlü" ilan etmek posterior'u taşımaz.

**"Her sistem… en değerli fırsatları eler."** TH2019 **frekans** filtresini test ediyor, "her sistem"i değil; hidden opportunity'yi "successful new products'a yol açabilir" diye tanımlıyor, "en değerli" diye sıralamıyor. **Etki:** yön doğru, mutlaklık fazla.

**Küçük ama karar etkisi olan mutlaklıklar.** "2026'da analist düzeyine ulaştı" yanıltıcı: sonuç Şubat 2025'te var, v2 revizyon; yay "2019 → 2025" olmalı. "GitHub'da ticari SaaS yok" yanlış: Buska $49/ay, SaaSScout $300, IdeaSaaS $10–22/ay, Trendstr var; doğru versiyon "olgun/baskın oyuncu yok". "TR kanalının hazır maddesi yok" fazla geniş: MARC'ta Türkçe yok (doğru), ama TR-TEB, TR-MTEB ve SS-LDA smartphone review verisi var ([MARC](https://huggingface.co/datasets/mteb/amazon_reviews_multi/blob/main/amazon_reviews_multi.py); [TR-TEB](https://aclanthology.org/2026.lrec-1.862.pdf); [SS-LDA](https://www.sciencedirect.com/science/article/abs/pii/S0957417420309519)).

**"Literatürde yok" iddiaları.** "Sinyal-sınıfı→ödeme ölçümü yok" fazla mutlak: ICWSM 2020 satın alma niyeti ifadelerinden tüketici harcaması tahmini yapıyor ([Pekar](https://aaai.org/papers/00545-7322-purchase-intentions-on-social-media-as-predictors-of-consumer-spending/)). "Nadir-sistematik metrik taksonomisi yok" ise raporun kendi ACM CSUR atfıyla çelişiyor ([CSUR](https://dl.acm.org/doi/10.1145/3657286)). **Etki:** dar iddia doğru, geniş iddia yanlış.

**"Deterministik veri yolu."** HDBSCAN'ın kendisi rastgele başlangıç kullanmaz; BERTopic hattı UMAP yüzünden stokastiktir; çok iş parçacıklı UMAP açıkça tekrarlanamaz ([UMAP](https://raw.githubusercontent.com/lmcinnes/umap/master/doc/reproducibility.rst)). `plan.md:369` yanlış adresi gösteriyor. **Etki:** doğru kelime "pinned ortamda replayable"; observation deterministik olabilir, **küme kimliği değil**.

**"Pazarın numara bir ölüm nedeni erişim kaybı."** GummySearch'te erişim kesilmedi; founder lisans başvurusu yapıp anlaşamadı ve ihtiyaten kapattı ([Closing](https://gummysearch.com/closing-time/)). Sentopic ise lisanssız çalışırken Reddit'in yeni API anahtarı vermeyi bırakmasıyla öldü ([LinkedIn](https://www.linkedin.com/posts/popesculuca_a-change-to-reddits-api-policy-killed-my-activity-7445223601689141248-0SfV)). **Etki:** "platform riski kaçınılmaz" determinizmi zayıflar; "lisanslı yol ekonomik değil" tezi güçlenir.

## Zayıf temelli ama yönü doğru olanlar

Sinyal hiyerarşisinin üç operasyonel testi — workaround'un isimlendirilmesi, farklı kelimelerle tekrar, ifadede sayı — **tek bir katman-5 sayfaya** dayanıyor: WhittleOS. Üstelik o sayfanın yazarı Reddit'i kaynak olarak kullanmadığını açıkça söylüyor: "Reddit is not among them, and we do not source it" ([WhittleOS](https://whittleos.com/guides/startup-ideas-from-reddit)). Yani Reddit madenciliği için, Reddit madenciliği yapmayan bir rehber otorite gösteriliyor. Aynı sayfa kendi sınırını doğru çiziyor: "A loud thread is not demand"; "Threads are a complaint sample, not a market sample"; "Complaining is free; paying is not". Raporun en iyi cümlesi buradan geliyor ve kanıtla uyumlu — ama merkez tez yapılmıyor, §1'de süs olarak kalıyor.

**Kaynak-katmanı asimetrisi nicel:** §1–§2'deki ~13 atfın ~10'u katman 5–6 (%77). Merkez tezin iki ayağından biri tek katman-5 sayfaya, diğeri tek katman-6 dosyaya dayanıyor. Görünürdeki "bağımsız post-mortem" (Indie Hackers, "Boris") ile WhittleOS'un yazarı (Boris Binyaminov) muhtemelen aynı kişi; doğrulanmadı, ama doğrulanırsa bağımsız teyit görüntüsü çöker. Rapor ayrıca akademik kaynakları *sayı ve kesinlik*, practitioner kaynakları *normatif reçete* için kullanıyor; oysa akademik literatür "kullanıcı yeniliği gerçek ama ticarileşmesi nadir ve bağlama bağlı" derken practitioner katman "workaround gördüysen ödeme sinyali var" diyor. Rapor bu gerilimi aynı hiyerarşide birleştirerek gizliyor.

**The Mom Test** pedagojik olarak etkili olabilir — yazar 250.000 kopya sattığını söylüyor ([robfitz](https://robfitz.com/c/who-what-and-why/tldr)) — ama hakemli değil ve yöntemin sonucu iyileştirdiğine dair kontrollü çalışma yok. **Sales Safari** betimlemesi doğru (30–50 saat), ama kaynak bir kitap alıntısı; etkinliğe dair karşılaştırmalı çalışma yok ([solvingproduct](https://solvingproduct.com/sales-safari)). Raporun iç tutarsızlığı burada: Sales Safari "sorma, gözle" derken, aynı hiyerarşide sunulan Mom Test "iyi sor" diyor.

**Commitment merdiveni** yön olarak makul, ama kademeler ve dönüşüm oranları doğrulanmış değil; waitlist→ücretli için bulunan oranlar %5–25 arasında tutarsız ([Waitlister](https://waitlister.me/growth-hub/guides/saas-product-launch-waitlist)). LOI "güçlü" katmanda gösteriliyor; Powa'da 1.200 müşteri "kaydı"nın çoğu bağlayıcı olmayan LOI çıktı, şirket $220M yatırıma rağmen administrasyona girdi ([Business Insider](https://www.businessinsider.com/powa-technologies-most-1200-powatag-deals-were-letters-of-intent-2016-2)).

Üç farklı başarısızlığı ayırmak gerekir. **Raporun hatası:** %82, 3M, BigIdeasDB, CiteCheck, Trustpilot caption — düzeltilebilir olgusal hatalar. **Literatürün zayıflığı:** "I wish"in öngörü değeri, LOI→ödeme dönüşümü, Mom Test/Sales Safari etkinliği, "workaround→ödeme" — bunlar ölçülmemiş; boşluk iddiayı desteklemez. **Karışım:** rapor bu boşlukları kesinlik gibi sunuyor; asıl epistemik borç burada. Birincisi raporu düzeltir, ikincisi sahayı.

## Daha iyi bir yol

### UMAP ve HDBSCAN: raporun atladığı katman

Rapor beş maddesinde UMAP'i hiç anmıyor. HDBSCAN'ın kendi FAQ'si 50–100 boyuttan sonra performansın belirgin düştüğünü söylüyor ([FAQ](https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/faq.rst)); BERTopic tam bu yüzden araya UMAP koyuyor ([algorithm](https://maartengr.github.io/BERTopic/algorithm/algorithm.html)). Mevcut kod zaten UMAP(15 komşu, 10 boyut, cosine, random_state=42) + HDBSCAN(25, 10, eom) çalıştırıyor (`cluster/recluster.py:35-38`, `120-133`). Yani tartışma "ham embedding'e HDBSCAN" değil, **UMAP(10D) üzerinde `mcs=5 + eps=0 + leaf`**; bu da dokümanın "mikro-kümeleri epsilon ile birleştir" tavsiyesinin tam tersi. scikit-learn demo'sunda 750 noktada `mcs=3` **90 küme**, `mcs=5` dört küme üretiyor ([demo](https://scikit-learn.org/stable/auto_examples/cluster/plot_hdbscan.html)); BERTopic 1M belge için `min_topic_size` 100–500 öneriyor ([tuning](https://maartengr.github.io/BERTopic/getting_started/parameter%20tuning/parametertuning.html)). Üstelik UMAP kendi FAQ'sinde yoğunluğu iyi korumadığını kabul ediyor ([UMAP FAQ](https://umap-learn.readthedocs.io/en/latest/faq.html)); UMAP uzayındaki "yoğunluk kümesi" orijinal embedding uzayının kümesi değil.

Daha savunulabilir reçete: ölçeğe bağlı `mcs`, `min_samples` sabit (rapordaki "60'ta yalnız çekirdek kümeler" alıntısı `min_samples` varsayılanı yüzünden confounded), `epsilon` grid (0,05–0,3), `eom` vs `leaf` karşılaştırması ve **iki komşu parametrede stabilite** şartı. `min_samples` raporda hiç yok.

Kısa metin ayrı sorun: BERTopic'in çok-domainli deneyinde HDBSCAN belgelerin **%74'ünü outlier** atıyor ([arXiv 2212.08459](https://arxiv.org/html/2212.08459v1)); Twitter literatürü tek gönderiyi belge saymanın yetersiz terim birlikteliği ürettiğini, havuzlamanın tutarlılığı artırdığını gösteriyor ([Mehrotra](http://users.cecs.anu.edu.au/~xlx/papers/sigir13.pdf); [Alvarez-Melis](https://ojs.aaai.org/index.php/ICWSM/article/view/14817)). Opinion-unit çıkarımı birimleri *daha da kısaltır*; unit'leri thread/gözlem bazında havuzlamadan global HDBSCAN'a vermek en riskli kısım.

### Türkçe morfoloji ve burst: ölçülmemiş ama zorunlu

Türkçe agglutinatif; tek kökten yüzden fazla kelime türeyebiliyor ([MUKAYESE](https://aclanthology.org/2022.findings-acl.69.pdf)). Yüzey formu bazlı G-testi "zam/zamlar/zamma/zamdan"ı ayrı olaylara böler; Zemberek'in morfolojik analizi ve deasciifier'ı tam bunun için var ([Zemberek](https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/zemberek/zemberek_makale.pdf); [Oflazer](https://aclanthology.org/E93-1066.pdf)). Burst kanalı **lemma/stem bazlı** olmalı. İki teknik zorunluluk raporda hiç yok: **çoklu test** (V n-gram × W pencere için düzeltmesiz α=0,05, V=100k ve W=90'da beklenen yanlış pozitif **450 bin**; BH-FDR şart) ve **seyreklik** (G-test'in ki-kare asimptotiği E<5'te güvenilmez; minimum count, exact test veya smoothing gerekir). Ayrıca `recluster.py:138` hâlâ `CountVectorizer(stop_words="english")` kullanıyor; Türkçe metinde hiçbir şey temizlemez, c-TF-IDF etiketleri "bir, bu, ve, için" ile kirlenir.

Türkçe embedding seçiminde "tek en iyi model" yok: TR-TEB 45 modeli karşılaştırıp "No single model dominates across all tasks" diyor ([TR-TEB](https://aclanthology.org/2026.lrec-1.862.pdf)); TR-MTEB 2025'te e5-large/gte'yi öne çıkarıyor ([TR-MTEB](https://aclanthology.org/2025.findings-emnlp.471.pdf)). 0,55'in Türkçe'ye taşınması ölçüm gerektirir; repo'nun kendi notu da bunu "GÜVENİLMEZ" işaretliyor (`LOG.md:259`, `plan.md:215`).

### LLM topic modeling: "önce kümele, sonra etiketle" tek yol değil

Rapor "LLM'i kümeleme öncesine koy" diyor; bu, LLM'i "yorum katmanı"ndan çıkarıp veri yolunun parçası yapar. Alternatif literatür **önce taksonomi, sonra atama**: TopicGPT LLM ile konu taksonomisi üretiyor, her belgeyi bir konuya atıyor ve **atamayı destekleyen alıntıyı** veriyor; harmonic mean purity **0,74 vs 0,64**, maliyet veri kümesi başına ~**$100** ([TopicGPT](https://arxiv.org/abs/2311.01449)). LLooM açık kapsama kriterleriyle kavram üretiyor ve BERTopic'in "women, power, female" çıktısına karşı "Criticism of traditional gender roles" gibi yorumlanabilir kavramlar veriyor ([LLooM](https://dl.acm.org/doi/fullHtml/10.1145/3613904.3642830)). Bu, "kanıt, skor değil" ilkesine daha yakın, çünkü her atama alıntı taşıyor. Sınırı: topic generation için GPT-4 sınıfı gerekiyor; Mistral-7B "assigns topics well but cannot competently follow instructions for generating topics." Ayrıca SFT hattının maliyeti raporda yok: 2503.01870 **10 tescilli VOC çalışmasından 1.549 etiketli CN-verbatim çifti** kullanıyor; StartupHunt'ta bu veri yoksa geçerli kanıt "SFT analist düzeyinde" değil, "base LLM yetersiz" bulgusudur.

LLM'i hattın içine koymanın ölçülmüş maliyeti de var: Doshi & Hauser (N=293) LLM fikirlerinin bireysel novelty'yi artırdığını ama içerikleri birbirine benzeştirdiğini buluyor ([Science Advances](https://www.science.org/doi/10.1126/sciadv.adn5290)); Si vd. LLM fikirlerinin daha novelty ama ölçeklenince çeşitliliğinin düştüğünü ve kendi kendini değerlendirmede güvenilmez olduğunu gösteriyor ([arXiv](https://arxiv.org/abs/2409.04109)). "LLM preprocessing kümeleme girdisini belirler" tasarımı için bu gerçek bir risk.

### Ask darboğazı: metin kanıtı ödemeye kaç adım uzak

Raporun kendi vakası en iyi anlatım: **400 DM → 150 geri bildirim (%37,5) → iki haftada 6 site ziyareti** (DM'lerin %1,5'i, geri bildirim verenlerin %4'ü) ([Wilson](https://www.indiehackers.com/post/how-i-validated-my-idea-with-reddit-57209ffc2c)). Soğuk e-postada ortalama reply %3,43, medyan kampanya %1,5 (56.614 kampanya), pozitif reply %0,6, **booked demo %0,35** ([Instantly](https://instantly.ai/cold-email-benchmark-report-2026); [RevenueFlow](https://www.revenueflow.com/blog/b2b-cold-email-benchmarks-2026); [GROU](https://grouglobal.com/blog/cold-email-benchmarks)). Aritmetik: %0,35 booked demo ve %30 demo→pilot ile **10 pilot için ~9.500 e-posta**; %0,6 pozitif reply ve %20 pozitif→pilot ile **~8.300**. Bu, "birkaç yüz DM" ölçeği değil. Pilot→paid oranları yalnız vendor iddiası (%60–70 yapılandırılmış ücretli pilot, %23 gevşek) ([Rework](https://resources.rework.com/fr/libraries/deal-closing/pilot-programs)).

Yani darboğaz fikir madenciliği değil, **ask'in kendisi**. Rapor bunu kabul ediyor ama mimariyi buna göre bütçelemiyor: kaç DM, kaç e-posta, kaç saat satış, hangi ICP, hangi fiyat — hiçbiri yok. Doğru tasarım, metin çıktısını "hipotez" olarak tutup ask hunisini ayrı bir ölçüm birimi olarak kurmak.

### Hukuki maruziyet ve Mart 2027

"Arşiv yolu hayatta" teknik bir olgu, hukuki güvenlik değil. Reddit UA ticari exploit'i ve yazılı izinsiz veri toplamayı yasaklıyor ([UA](https://www.redditinc.com/policies/user-agreement)); dump'lar için lisans yok; Arctic Shift'in LICENSE dosyası yok, yalnız removal formu var ([repo](https://github.com/ArthurHeitmann/arctic_shift)). Reddit v. Anthropic'te UA'nın browsewrap olduğu savunması reddedildi, sözleşme/UCL iddiaları ayakta — ama bu **doğrudan erişen** scraper'lara karşı; dump kullanan ürünün sorumluluğu **test edilmedi** ([CourtListener](https://www.courtlistener.com/docket/70704683/reddit-inc-v-anthropic-pbc/)). Pushshift emsali, platformun arşivi tek taraflı kapatabildiğini gösteriyor ([modnews](https://www.reddit.com/r/modnews/comments/134tjpe/reddit_data_api_update_changes_to_pushshift_access/)).

Takvim kritik: 31.10.2026 yeni başvurular, 13.11.2026 RSS, 12.01.2027 kayıtsız uygulamalar, **Mart 2027'de public API sonu** ([r/redditdev](https://www.reddit.com/r/redditdev/comments/1wubcvf/moving_data_api_apps_to_the_developer_platform/)). Arctic Shift'in ingest'i buna bağlı; arşiv donar. Zaten tek maintainer, SLA yok ("No uptime or performance guarantees :)"), 9–10 Ekim 2026 kesintisi, ID değişimiyle %90–95 tamlık ([API](https://github.com/ArthurHeitmann/arctic_shift/tree/master/api); [status](https://status.arctic-shift.photon-reddit.com/)). "Arşiv + çok kaynak" savunması çürümez, ama "hayatta" zaman sınırlı olur.

ekşi daha sert: `ai-input=no` inference-time girdiyi yasaklıyor ([robots](https://eksisozluk.com/robots.txt); [Content Signals](https://specification.website/okf/agent-readiness/content-signals.md)); robots lisans değil ([Cloudflare](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)). Sözleşme telifi yazara bırakıyor, üçüncü tarafa ticari izin yok ([sözleşme](https://eksisozluk.com/eksi-sozluk-kullanici-sozlesmesi--2602660)); FSEK'te TDM istisnası yok, m.21/22 izin, m.35 dar, m.68'e göre üç katına kadar ([Dalkıran](https://dergipark.org.tr/tr/download/article-file/5626014)); nick+entry KVKK kapsamında ([gizlilik](https://eksisozluk.com/legal/privacypolicy)). DSM Art. 4 Türkiye'de yok; hukuka uygun erişim şartı ToS ihlalinde düşer, opt-out'ta kapanır, umuma iletimi kapsamaz ([DSM4](https://www.copyrightexceptions.eu/exceptions/dsm4/)). hiQ: CFAA'da lehine, sözleşmede aleyhine; $500K + yasak + silme ([9th Cir.](https://cdn.ca9.uscourts.gov/datastore/opinions/2022/04/18/17-16783.pdf); [consent](https://infobytes.orrick.com/wp-content/uploads/pdf/Buckley%20InfoBytes%20-%20hiQ%20Labs%2C%20Inc.%20v.%20LinkedIn%20Corp.%20-%20Stipulation%20and%20%5BProposed%5D%20Consent%20Judgment%20and%20Permanent%20Injunction%202022.12.06.pdf)).

Daha iyi yol: çekirdeği **yerel ve lisansı net** veriye kur (HN, SE dump + SA uyumu, Arctic Shift'ten indirilmiş hash'li kopya), Reddit'i **değeri azalan varlık** say, Mart 2027 öncesi lisans/kapsam dışı kararını ver; ekşi'yi LLM hattına sokma.

### Fikir madenciliği darboğaz mı?

Taban oranlar acımasız: gelir üreten indie SaaS'lerde medyan **$145/ay**, **%23,6** ≥$1k, **%6,1** ≥$10k (n=3.787, self-report) ([BigIdeasDB](https://bigideasdb.com/state-of-indie-saas-revenue-2026)); MicroConf'ta (n=469, en az $1 gelir şartı) katılımcıların **%28'i** $1k altında ([MicroConf](https://microconf.com/founders/0-10k-arr)). Product Hunt'ta 2013–2024'teki 102.582 ürünün **%22,6'sı** kapanmış ([Ricky Spears](https://www.rickyspears.com/scraper/producthunt-cemetery/)); 2023–2025 top launch'ların **%24,4'ü** hard-dead ([RightAIChoice](https://rightaichoice.com/state-of-ai-tools/graveyard)). Bu evrenler bile "launch etmiş ve görünür olmuş" ürünler.

Daha önemlisi, fikir kalitesinin öngörücülüğü **tam da yazılımda zayıf**: Scott, Shu & Lubynsky (n=652) fikir özetlerinin Ar-Ge-yoğun sektörlerde ticarileşmeyi öngördüğünü, **enterprise software'de öngörmediğini** buluyor ([HBS](https://www.hbs.edu/ris/Publication%20Files/16-013_41f3750a-9d54-49be-a8f4-51a6489d514e.pdf)). Gius (67 yarışma) jürilerin bir fikir üzerinde *anlaşmazlığının* başarıyı öngördüğünü gösteriyor ([RePEc](https://ideas.repec.org/a/inm/orstsc/v10y2025i2p93-108.html)) — yani "çok kişi aynı acıyı söylüyor" sinyali kalabalık ve konvansiyonel bir fikri işaret ediyor olabilir; bu, "recurrence > novelty" kuralına doğrudan meydan okuyor.

Hüküm: **fikir madenciliği bir filtre, kaldıraç değil.** Metin hattı "hangi hipotezler incelenmeye değer" sorusunu ucuza cevaplar; "hangisi para getirir" sorusunu cevaplamaz. Pazar kanıtı da aynı yöne işaret ediyor: indie tarafta PainOnSocial ~$1,3K MRR ve düşüşte, SaasNiche $267 MRR/13 abone, BigIdeasDB en iyi ay $4,6K; kurumsal tarafta Thematic $25K/yıl, Chattermill Vendr medyanı $78,5K (yalnız iki sözleşme) ([TrustMRR](https://1m.chat/cases/painonsocial-com/); [TrustMRR](https://trustmrr.com/startup/saasniche); [Thematic](https://getthematic.com/product/plan-and-pricing); [UserInsight](https://userinsight.ai/blog/chattermill-pricing)). GummySearch'ün founder'ı da stratejiyi "more established businesses that can afford to pay for a research tool continuously" diye çevirdi ([IH](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897)). Para kurumsal/ajans tarafında.

## StartupHunt için revize plan

Sıra bağımlılık sırasına göre; her madde bir kabul kriteri taşıyor ve 3060'ta doğrulanmalı. Bu cihazda DB/embedding/cluster çalıştırılamadı, hiçbiri "çalışıyor" sayılmaz.

**P0 — Ölçüm sözleşmesi (kod değişmeden önce).**

1. **"Deterministik" yerine "replayable" de.** `run_manifest`: embedding model revizyonu, UMAP/Numba/HDBSCAN/BERTopic sürümleri, `random_state`, `NUMBA_NUM_THREADS`, parametreler, snapshot hash'i. *Kabul:* aynı manifest + aynı ortam aynı pattern ID'leri; farklı ortam yeni run. *3060:* iki koşu + hash karşılaştırması.

2. **0,55'i evrensel eşik olmaktan çıkar.** Model/dil başına kalibrasyon: insan etiketli 200–500 çiftte precision-recall; `best_sim`, `second_sim`, `margin` sakla; margin düşükse `unassigned`. *Kabul:* held-out TR/EN'de precision/recall, abstention oranı, ayrı eşikler. *3060:* pilot embedding'lerde kalibrasyon eğrisi.

3. **Centroid atamasını bırak veya düzelt.** Öncelik: `BERTopic.transform` (UMAP.transform + `approximate_predict`) ya da insan onaylı kümelerden eğitilmiş kalibre sınıflandırıcı. Centroid'de ısrar: UMAP uzayında medoid, periyodik güncelleme, ikinci en iyi skor kontrolü. *Kabul:* atama uyumu `argmax` taban çizgisini geçer; 30 günlük replay'de stale-centroid kayması yok. *3060:* üç yöntemin yan yana koşumu.

**P1 — Keşif ve kısa metin.**

4. **`mcs=5 + eps≈0 + leaf` reçetesini bırak.** `mcs ∈ {15, 25, 40, 60}` (n'ye göre ölçekle), `min_samples` sabit, `epsilon` grid 0,05–0,3, `eom` vs `leaf`. Aday pattern **en az iki komşu parametrede stabil** olmalı. *Kabul:* spot-check precision'ı ve stabilite tablosu. *3060:* 50–100k gözlemde grid.

5. **Kısa metni havuzla.** Opinion-unit'leri observation/thread/user bazında birleştir; tek cümlelik unit'leri global HDBSCAN'a verme. Alternatif: BTM/SS-LDA veya taksonomi. *Kabul:* outlier oranı hedefe iner, coherence düşmez. *3060:* havuzlu/havuzsuz karşılaştırma.

6. **Türkçe hattını ayrı kur.** Türkçe stopword listesi; burst için Zemberek lemma/stem + deasciifier; embedding seçimini TR-TEB/TR-MTEB üzerinden yap; 0,55'i TR/EN çift testiyle kalibre et. *Kabul:* c-TF-IDF top-20'de stopword kirliliği sıfır; burst top-100 elle denetlenir. *3060:* TR örneklemde etiket kalitesi.

**P2 — Burst, taksonomi, hukuk, ask.**

7. **Burst'ü ölçülebilir yap.** Normalize lemma/bi-gram sayıları; pencere başına minimum gözlem; BH-FDR; tetik istatistiğini (n-gram, pencere, beklenen/gözlenen, düzeltilmiş p) run log'una yaz. FOCuS yalnız pattern-başına günlük seride. *Kabul:* null simülasyonda q=0,05 FDR; top-100 precision.

8. **Taksonomi alternatifini pilotla.** 1–2k belgede TopicGPT/LLooM tarzı taksonomi + alıntılı atamayı mevcut hatla karşılaştır: purity/coverage, inceleme süresi, belge maliyeti, tekrar üretilebilirlik. LLM yalnız aday/taksonomi üretiminde. *Kabul:* pattern başına inceleme süresi düşer, atama alıntısı %100.

9. **Kanıt taksonomisini "hipotez" olarak etiketle.** Workaround/para/tekrar/sayı testleri faydalı ama hakemli validasyonu yok; UI'da "kanıt türü" olarak göster. Her sinyalde permalink + verbatim + bağımsız kaynak sayısı + LLM model/prompt sürümü. *Kabul:* sinyallerin %100'ünde permalink+verbatim; batch başına %10 veya ≥50 örnek denetim; LLM kaynaklı durum değişimi **0**.

10. **Ask hunisini bütçele.** ICP, temas hacmi, beklenen dönüşüm yazılı olsun. %0,35 booked demo ile 10 pilot ≈ 9.500 e-posta; %0,6 pozitif reply ve %20 pozitif→pilot ile ≈ 8.300. *Kabul:* build-out'tan önce yazılı ask planı ve ön-kayıtlı dönüşüm hedefi.

11. **Lisans metadatası ve hukuk kapısı.** Her kayıt için `license_id`, `attribution_required`, `ai_use_allowed`, `retention_policy`. SE'de SA uyumunu uygula ya da verbatim+link ile sınırla; ekşi'yi LLM'e verme; Reddit için Mart 2027 öncesi karar ver; yerel dump'ları hash'le. *Kabul:* üretimde lisanssız kaynak yok; silme talebi akışı çalışıyor; kaynak başına hukukçu onayı kayıtlı.

**İlke çatışmaları.** "Deterministik veri yolu" UMAP ve LLM preprocessing ile çelişir; çözüm: **observation düzeyinde determinizm, pattern düzeyinde replayability**. "Filtre/skor/ağırlık yok" burst tetiğiyle çelişir; çözüm: skoru **kayda** yazmamak, run-level trigger log'unda tutmak — sıralama yine bir filtredir ama denetlenebilir olur.

## Sınırlar ve doğrulanamayanlar

Doğrulanamayanlar: Arctic Shift'in "3,8 TB / 2005-06 → 2025-12 tek torrent" rakamı; Apple'ın ~500 review limiti (yalnız PyPI); Play'in 7 günlük penceresi; SE dump'ının 2024'te taşınması; CC FAQ'nin "SA içeren veritabanının tamamı SA mı?" maddesi (sayfa kesildi) — raporun en kritik hukuki sorusu; Reddit robots.txt'inde AI opt-out; ekşi'ye açılmış dava/ihtarname kaydı; Reddit lisans ücreti; 3M'in gerçekleşen satışları; Lilien vd.'nin replikasyonu; Mom Test/Sales Safari'nin kontrollü değerlendirmesi; "I wish"in öngörü değeri; LOI→ödeme benchmark'ı; WhittleOS yazarı ile "Boris"in aynı kişi olduğu (isim ve argüman örtüşüyor, kimlik doğrulanmadı); MicroConf n (469 vs 700); IdeaBrowser outcome verisi; kategorinin TAM'ı.

İkincil/öz-beyan: BigIdeasDB/TrustMRR taban oranları (self-report, üstelik şirket aynı kategoride ürün satıyor); GummySearch'ün "kârlıydı" ve $35K MRR beyanı (P&L yok); PainOnSocial'ın "4.000+ founder"ı (~$1,3K MRR ile çelişiyor); Thematic/Chattermill fiyatları (vendor; Vendr medyanı iki sözleşme); pilot→paid oranları (vendor); Reddit DM benchmark'ları (vendor birinci-el); Product Hunt ölüm oranları (site açık ≠ işletme ayakta); CB Insights nedenleri (öz-beyan, geriye dönük, yalnız VC-backed); Startup Genome pivot verisi (2011, öz-seçilimli).

Yöntem sınırı: kümeleme/NLP bulguları statik kaynak okuması; HDBSCAN/UMAP deneyleri, TR kalibrasyonu ve burst FDR simülasyonu bu cihazda çalıştırılmadı. "Kabul kriteri" ifadeleri öneri sözleşmesidir, ölçülmüş sonuç değil. "Fikir madenciliği darboğaz değil" de bir **çıkarım**: taban oranlar, Scott vd. ve ask dönüşümü aynı yönü gösteriyor, ama "acı madenciliğiyle kurulan ürünlerin kohort başarısı" veri seti yok — boşluk kapanmadan hüküm kesinleşmez.

## Sonuç

Denetimin en önemli sonucu, raporun yanlış olduğu yer ile literatürün zayıf olduğu yeri ayırmanın karar kalitesini değiştirmesi. Akademik NLP omurgası ve üç mimari sezgi (keşif/atama ayrımı, bağımsız burst kanalı, LLM'in `review_status` yazmaması) sağlam; kırılan yerler daha çok **sayı ve atıf disiplini**. 3M düzeltildiğinde raporun kendi tezi güçleniyor; %82 düzeltildiğinde ise daralıyor — ikisi de tezin aleyhine değil, kanıtın lehine okunmalı.

Asıl değişmesi gereken şey merkez. Rapor "metin kanıt üretir, ödeme kanıtını yalnız ask üretir" diyor ve haklı; ama planın ağırlığı metin hattında. Kanıt, kaldıracın ask ve segment olduğunu söylüyor: %0,35 booked demo, indie tarafta $145 medyan MRR, kurumsal tarafta $25K–78,5K sözleşmeler. Doğru soru "daha çok metin mi madencilenmeli" değil, "hangi 10 hipotez kime, kaç temasla, hangi fiyatla satılacak" olmalı. Metin hattı bu sorunun girdisini üretir; cevabını üretmez.
