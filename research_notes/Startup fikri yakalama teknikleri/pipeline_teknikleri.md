# Talep sinyali yakalama — metin akışından fırsat-aday sinyal çıkarma teknikleri

Araştırma notu, Ekim 2026.

## Key Question 1 — Klasik yöntemler (embedding + topic clustering / LDA) bu görevde sinyali neden kaçırıyor, hangi görevlere yakışır?

### Takeaway
Topik modelleme "korpusda ne konuşuluyor"u bulur; talep sinyali ise "kim ne istiyor" sorusudur ve bunu yer kümeleme (word co-occurrence) değil anlam çıkarma çözer. 2024–2026 literatürünün uzlaşması: LDA/BERTopic sınıfı yöntemler hızlı ve ucuz geniş tema haritaları çıkarır ama domain-spesifik ince sinyalleri kaçırır veya aşırı genel topicler üretir; LLM extraction tabanlı hibrit pipeline'lar bu sebeple 2025'ten itibaren standart yaklaşım hâline geldi.

### Cited Findings
- LREC-COLING 2024 çalışması LDA'nın yapısal kusurlarını listeler: semantik anlama yok, örtüşen topicler, konu granülerliği yetersiz, yeni belgeleri modeli yeniden koşturmadan atayamama (dinamik akışa uyumsuz). — https://arxiv.org/html/2403.16248v1
- TopicImpact (2025): "classification, statik ve net tanımlı kategorilerde uygundur ama gelişen trendleri ve niş kaygıları yakalayamaz"; LLM ile ön işleme (opinion unit çıkarma) kümeleme öncesi gürültüyü filtreleyip topic kalitesini yükseltiyor. — https://arxiv.org/abs/2507.13392
- Timoshenko & Hauser 2019 (Marketing Science, 511 atıf): "bags of words" nüanslı müşteri ihtiyacını tarif etmez; CNN ile bilgilendirici cümle filtresi + dense sentence embedding ile çeşitlilik seçimi + insan formülasyonu; UGC, görüşme temelli VoC'nin ulaşamadığı ek ihtiyaçları da yakaladı. — https://pubsonline.informs.org/doi/abs/10.1287/mksc.2018.1123
- NIST (ACL 2025) sosyal-bilim temelli değerlendirme: LLM topic modelleri daha okunabilir ama domain-spesifik veride aşırı genel topicler üretiyor ve belge-atandırmada halüsinasyon yapabiliyor; insan denetimi bunu düzeltiyor; "tek doğru model yok, seçim görev-bağlıdır". — https://nist.gov/publications/traditional-topic-models-llm-topic-models-can-large-language-models-replace-traditional
- Zero-shot LLM vs NTM (Ekim 2025): LLM'ler diversity ve subjektif metriklerde belirgin üstün; yalnız bu sonuç küçük/genel veri setinde — domain uzman işinde NIST çelişik. — https://arxiv.org/abs/2510.03174
- LLM-ITL (ACL 2025): tekil belge odaklı LLM prompting tüm korpusun topic yapısını kapsayamıyor; global yapı hâlâ istatistiksel modele bırakılıyor. — https://arxiv.org/html/2411.08534v1
- 2026 ACL survey alanı üçe ayırıyor: Classical Algorithm-Centric / LLM-Assisted / LLM-Centric; sabit kategoriye sınıflandırma LLM için düşük maliyetli ve "well-suited", tüm korpus keşfi orta maliyetli ve "partial". — https://aclanthology.org/2026.findings-acl.326.pdf

### Inferences
- StartupHunt mimarisi bu ayrımı doğal olarak taşıyor: embedding + centroid/BERTopic katmanı "ne konuşuluyor" (1. görev) için kurumsal tercih; "kim ne istiyor" (2. görev) için ayrı bir LLM extraction katmanı gerekli.
- Hibritlik yönü: TopicImpact ve Timoshenko hatlarının ortak örüntüsü — LLM, kümeleme öncesi yapısal ön işlemede (opinion unit / bilgilendirici cümle çıkarımı) kullanılıyor; korpus-düzeyi global topic yapısı istatistiksel kümelemede kalıyor; kümeleme sonrası etiketleme/özetleme ise "insan review" arayüzüne kanıt üretiyor. StartupHunt'taki review_status ('interesting') adımı birebir bu örüntüye oturuyor.

### Gaps
- "Startup fikri adaylığı" gibi çok spesifik bir sinyal için makale-düzeyde benchmark yok; en yakın kanıt TopicImpact (müşteri yorumu) ve Timoshenko hattı (müşteri ihtiyacı). Bundan sonrası kendi pilot ölçümüne kalmış durumda.

---

## Key Question 2 — LLM pipeline gerçek örnekleri; 1M+ doc maliyet eğrileri (Flash-Lite/Nano sınıfı), batch API, lokal 8B kalite/maliyet

### Takeaway
2026 itibarıyla en ucuz uç (GPT-5-nano, Gemini 2.5 Flash-Lite) standart fiyatta 0.05–0.10 $/1M girdi + ~0.40 $/1M çıktı bandında; Batch API %50 indirimle 1M doküman × (500 girdi + 200 çıktı token) için ~50–65 $ tek geçiş maliyeti çıkarıyor. Öte yandan 8B-sınıfı (lokal portlar dahil) model halüsinasyon oranları ACL 2026 ölçümünde %41–43 bandında, yani kabul edilebilirlik sınırının üstünde; bu yüzden lokal 8B için yaygın çözüm yolu distilasyon + denetimli çıktı yönü.

### Cited Findings
- GPT-5-nano: 0.05 $/1M in, 0.40 $ out; batch 0.025/0.20; cache 0.005; 272K context. — https://www.economize.cloud/resources/open-ai/pricing/gpt-5-nano/ 
- Gemini 2.5 Flash-Lite: 0.10 $/1M in, 0.40 $ out; batch 0.05/0.20; cache 0.01; 1M context. — https://metatext.io/llm/nano-gpt-gemini-2.5-flash-lite ve https://lmmarketcap.com/google-ai-pricing
- Gemini 3.1 Flash-Lite (2026): 0.25 $/1M in, 1.50 $ out; batch 0.125/0.75; structured outputs + function calling + prompt caching. — https://models.litellm.ai/models/gemini-3.1-flash-lite
- Yapılandırılmış çıktı (OpenAI): JSON Schema uyumu "değerlendirme üzerinde %100 şema uyumu" — gpt-4o-2024-08-06 ile Structured Outputs; gpt-4-0613 < %40; hem function-calling strict:true hem response_format.json_schema hem Batch API destekli. — https://openai.com/index/introducing-structured-outputs-in-the-api/
- Anthropic Structured Outputs (Kas 2025 beta): format garanti; içerik doğruluğu garanti değil. — https://towardsdatascience.com/hands-on-with-anthropics-new-structured-output-capabilities
- Lokal 8B/13B kalite sinyali (RAG-hallucination benchmark): üretici modele göre halüsinasyon oranı SOTA %18.4, Gemma %41.2, Mixtral-8x7B %42.6. — https://aclanthology.org/2026.acl-long.680.pdf
- Distilasyon yolu: Distilling Step-by-Step (ACL 2023) — LLM rationale'ları ek supervision olarak kullanarak 11B T5, 540B PaLM'in görev performansını aşabiliyor. — https://aclanthology.org/2023.findings-acl.507.pdf
- LLM-guided Document Selection (2024): büyük LM'in ürettiği kalite etiketlerini küçük LM'e distil edip tüm korpusu küçük modelle puanlayan iki aşamalı pipeline; 100 milyar doküman ölçeğinde filtreleme hedefliyor. — https://arxiv.org/html/2406.04638v1
- Agent Distillation (NeurIPS 2025): retrieval ve code toollarını kullanan agent davranışı 0.5B–3B küçük modellere taşınabiliyor; küçük modeller büyük CoT-distilasyon eşdeğeriyle rekabet ediyor. — https://papers.neurips.cc/paper_files/paper/2025/hash/99263f9bf46874e2b8b7f104b5063864-Abstract-Conference.html

### Inferences
- StartupHunt için maliyet hesabı: (i) pilot (~30–50K observation/yıl artı incremental): GPT-5-nano batch ile ayda ~1–3 $; (ii) 1M dokümanlık backfill: ~50–65 $ tek geçiş + cite-check/audit katmanı. LLM maliyeti engel değil; asıl gider doğrulama ve insan review zamanı. 
- Lokal 8B planı 3060 PC'de (GPU var) mantıklı; ama yukarıdaki halüsinasyon oranları (%41–43) göz önünde tutulursa lokal 8B'ye "sinyal kesme" yetkisi vermek yerine (a) distilasyon ile görev daraltmak, (b) kanıt-alıntı zorunluluğu (citation-backed schema) uygulamak ve (c) yanıt kalitesini belirli aralıklarla küçük insan örneklemiyle denetlemek gerekir.

### Gaps
- 1M+ dokümandan cite-check'e kadar uçtan uca gerçek maliyet grafiği sunan akademik case'e rastlamadım; yukarıdaki hesap, yayınlanmış fiyat tablolarından benim tahminime dayalı.

---

## Key Question 3 — Nadir/anomali sinyal tespiti (embedding + HDBSCAN parametre etkisi, changepoint/frekans patlaması, "nadir ama sistematik" ayrımı)

### Takeaway
Nadir sinyal tespiti iki bağımsız mekanizma ile güçlendirilir: (i) embedding uzaylarında HDBSCAN'ın min_cluster_size/min_samples etkisi ile küçük kümelerin korunması; (ii) zaman serisinde burst/changepoint (MIDAS/Isconna/FOCuS) tabanlı frekans patlaması tespiti. "Nadir ama sistematik" sinyali tek başına embedding yakınlığıyla yakalamak yerine kelime/bi-gram frekans patlaması + küçük semantik kümelerin izlenmesi + içerik-tekrar testlerinin birlikte kullanımı daha güvenilir.

### Cited Findings
- HDBSCAN davranışı (scikit-learn resmi demo): min_cluster_size primary parametre; "daha küçük değerler daha az noise, ama çok küçük değerler sahte alt-kümeleri (false sub-clusters) yakalayabilir; büyük değerler noise'a karşı dayanıklı ama geçerli olabilecek küçük kümeleri yok sayabilir". min_samples default = min_cluster_size; önce min_cluster_size tune edilmeli, sonra min_samples; cluster_selection_epsilon bu eşiğin altında kalan kümeleri birleştiriyor; 'leaf' seçim yöntemi (eom yerine) çok sayıda küçük homojen küme çıkarıyor. — https://scikit-learn.org/1.5/auto_examples/cluster/plot_hdbscan.html ; https://scikit-learn.org/1.8/modules/generated/sklearn.cluster.HDBSCAN.html
- scikit-learn-contrib HDBSCAN* guide pratik uyarı: min_cluster_size 15→30→60 artırıldığında 60'ta "only the really core clusters" kalıyor; önceden >60 üye sahip gibi görünen küçük kümeler noise etiketi alıyor. — https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/parameter_selection.rst
- Burst detection (sosyal metin akışı): BUrST framework (semantik + feature tabanlı keyword sim) vs LDA/G-Feat p/BN gram; US Elections ve Enron stream'de üstün, "event keyword recall 0.76". — https://pmc.ncbi.nlm.nih.gov/articles/PMC7982883
- Isconna (arXiv, güncel v.): burst (anlık frekans, G-test tabanlı deviasyon skoru) + pattern change (tekrar eden substring analizi) birleşik stream anomaly tespiti; öncül MIDAS'ı yalnızca occurrence-count kullandığı ve doğruluğu düştüğü için eleştiriyor. — https://arxiv.org/html/2104.01632v2
- BurstDetector (IEEE 2024): sketch tabanlı, bellek-düşük, "across-period burst" (iki pencere grubu deviasyonu) tanımı. — https://ieeexplore.ieee.org/document/10621114
- Changepoint: FOCuS (Fast Online Changepoint Detection, JMLR 2023): univariate Functional Pruning CUSUM; Amazon CPU verisi üzerinde Numenta HTM'den daha iyi precision/recall; şaşırtıcı heterojenlikte false-positive patlaması için "penalty arttır" önerisi. — https://www.jmlr.org/papers/volume24/21-1230/21-1230.pdf
- Veri-akışı novelty detection alan çalışması (ACM Computing Surveys 2024, SLR): concept evolution / buffer (unknown class) / open-set recognition taksonomisi; metin veri akışında novelty detection hâlâ zayıf çözümlü bir açık problem. — https://dl.acm.org/doi/10.1145/3657286
- Yeni topic evolüsyonu için pratik akış yaklaşımı: k-LLMmeans mini-batch streaming + StackExchange benchmark; LLM tabanlı centroid özetleri akış konu evolüsyonunu takip edebiliyor. — https://arxiv.org/html/2502.09667v2

### Inferences
- StartupHunt için HDBSCAN parametre inferansı: min_cluster_size büyüdükçe küçük kümeler noise'a yutuluyor (60'ta "only the really core clusters" kalıyor) — yani naif büyütme, tam da ilgilendiğimiz nadir kümeleri öldürür. Nadir sinyal avı için düşük min_cluster_size (ör. 5–15) + cluster_selection_epsilon=0 ile koşum, günlük atamada ise mevcut confident-assignment eşiği (0.55) korunmalı; iki mod aynı anda aynı parametre setini paylaşmamalı.
- "Nadir ama sistematik" ayrımı için pratik ölçüm seti: (i) kelime/bi-gram frekans patlaması (burst skoru, MIDAS/Isconna mantığıyla G-test), (ii) aynı niche konulardaki tekrarlayan içerik örüntüsü (Isconna pattern-change skoru mantığı), (iii) küçük ama ilişki-bağlantılı semantik kümelerin büyüme hızı. Bu üç ölçüm belirli bir zaman penceresinde birlikte bakılırsa "tek post" gürültüsü elenip "sistematik" sinyal kalır.
- StartupHunt mimarisindeki recluster tetiği (atanmamış oran) doğal karar kapısı kalıyor; ancak "nadir sinyal yakalandı" durumunda recluster tetiğinden bağımsız olarak küçük yeni kümeler direkt `review_status=unreviewed` birer mini-pattern olarak insan review kuyruğuna girebilir — deterministik kanıt zaten observation düzeyinde mevcut.

### Gaps
- LLM-augmented burst/novelty detection için 2025–2026'da spesifik bir yayın bulamadım; "nadir ama sistematik" sinyalinin dışa vurulmuş bir metrik taksonomisi yok — bu ölçüm seti pratikte proje-içinde elle tasarlanacak.

---

## Key Question 4 — LLM extraction doğrulama metodları: sample audit, citation-checking, spot human review; hata oranları ölçümleri

### Takeaway
2025–2026'da iki kanıt hattı yerleşti: (i) "blind expert study" — Timoshenko/Mao/Hauser (2025): SFT (supervised fine-tuned) LLM, profesyonel analistlerden en az eşit derecede performans gösterdi; (ii) citation/quote-audit pipeline (CrossRef/OpenAlex/Semantic Scholar waterfall + LLM verifier) — format doğru olsa bile içeriğin de bağımsız kaynakla denetlenmesi gerektiği gösterildi. LLM-as-judge tek başına yeterli değil; insan yargısıyla uyum %79–88 bandında ölçülüyor.

### Cited Findings
- Timoshenko, Mao & Hauser (MSI working paper, Şub 2025; arXiv 2503.01870, Nisan 2026 güncel "Transforming the Voice of the Customer"): blind study — Base LLM (prompt engineering sadece), SFT LLM (profesyonel ihtiyaç koleksiyonuyla fine-tune), profesyonel analistler üçgen karşılaştırma; "SFT LLM performs at least as well as professional analysts and substantially better than foundational LLMs"; sonuçlar alternatif base modellerde de generalize; **grounded in source content without hallucination**; "relatively 'small' models" yeterli. — https://arxiv.org/abs/2503.01870v2 ; https://www.msi.org/working-paper/can-large-language-models-extract-customer-needs-as-well-as-professional-analysts
- MIT Sloan popüler özet (Kasım 2025): SFT LLM %100 primary (8) ve secondary (30) customer need yakaladı; profesyonel analistler %87.5 ve %80; klasik referans: Griffin & Hauser 1993'te profesyonellerin abstraksiyon oranı %54. — https://leadership.mit.edu/ideas-made-to-matter/large-language-models-can-help-professionals-identify-customer-needs
- İnsan-insan baseline: 2024 evaluatif analistler, orijinal analistlerle "Is Customer Need / Sufficiently Specific" üzerinde %80 uyum gösterdi; "SFT yoksa Base LLM zayıf" — https://arxiv.org/pdf/2503.01870v1
- Citation hallucination pilot ölçümü (AAAI 2026 student abstract): GPT-4o ~%12, Claude 3.5 Sonnet ~%16, LLaMA-4 Maverick ~%21; tespit pipeline'ı (exact lookup → %65, fuzzy retrieval → %75, +LLM verification → %80 precision) — https://ojs.aaai.org/index.php/AAAI/article/download/42257/46218
- Cross-model citation audit (2026): 69,557 citation üzerinden model-bazlı hallucination oranı %11.4 (GPT-5-mini) – %56.8 (Haiku-4.5); CrossRef/OpenAlex/Semantic Scholar waterfall pipeline. — https://arxiv.org/pdf/2603.03299v1
- CiteCheck (2026): EXACT / minor / major üç sınıf halüsinasyon; retrieval→LLM-verifier waterfall; "CiteME benchmark'ında LLM'ler %4.2–18.5 accuracy (insanlar %69.7)". — https://arxiv.org/pdf/2605.27700
- CiteAudit (2026): ilk büyük ölçek automated citation-audit altyapısı (metadata extraction + memory lookup + web evidence retrieval + judgment). — https://arxiv.org/abs/2602.23452
- KGHaluBench (EACL 2026): otomatik LLM-judge insan yargısıyla %79.18 uyum; tri-stage human-calibrated pipeline %87.74 — "judge tek başına kalibrasyon yeterli değil". — https://aclanthology.org/2026.findings-eacl.206.pdf
- Anthropic Citations API: çıktıdaki her iddia ilgili kaynak-passage ile referanslı (belge + alıntı); metin belgeleri ve uzun içerik üzerinde quote-grounding sağlar. — https://docs.anthropic.com/en/docs/build-with-claude/citations

### Inferences
- StartupHunt için pratik üç adım: (1) **kanıt-pin**: hiçbir LLM çıktısı tek başına "kanıt" sayılmaz; her sinyal kaydında kaynak-alıntı (post id + alıntı-cümle) zorunlu; (2) **sample audit**: her batch'ten %10 (veya ≥50 örnek) rastgele insan spot-check; hata oranı eşiği aşarsa batch reddi; (3) **judge-calibration**: LLM-as-judge insan yargısını yalnızca %79–88 bandında yakalıyor — StartupHunt'ın review ekranında "alıntılar + insan yargıç (LLM sadece asistan)" kombinasyonu güncel literatürle uyumlu.
- Model-pinning: Timoshenko hattı "SFT sonuçları base-model bağımlılığından bağımsız generalize" diyor; yine de üretimde LLM'in sürümü veri imzasının parçası: her extraction kaydına model adı + tam snapshot (ör. "gpt-4o-2024-08-06" tarzı pinned sürüm) + prompt şeması versiyonu JSONB'ye yazılmalı; altı aylık ölçeklerde base model davranışının kaymasına karşı karşılaştırma koşumları (aynı 100 örnek üzerinde eski/yeni sürüm diff'i) tutulmalı.
- Kritik tespit: StartupHunt'ın "sistem kanıt sunar, filtre/skor YOK" ilkesi, doğrulama katmanına (citation-check + sample audit) doğal şekilde oturuyor — LLM çıktısı veri kaynağı değil kanıt süsü olarak ele alınmalı; review_status ancak insan işaretlemesiyle değişmeli, LLM asla otomatik 'interesting' yazmamalı.

### Gaps
- "Extracted claim → kaynak passage" eşleşmesinin kalitesine dair makale-düzeyde (reddit/review metni özelinde) hata oranı ölçümü bulunamadı; yukarıdaki oransal kanıtlar çoğunlukla akademik citation-checking alanından — StartupHunt'ın "alıntı-kaynak eşleşme hata oranı" kendi sample audit'inde ölçülecek açık bir soru.

---

## Key Question 5 — 2025–2026 literatürdeki güncel pozisyonlar (customer-feedback mining: LLM vs topic modeling karşılaştırma makaleleri)

### Takeaway
2025–2026 döneminde müşteri-geri bildirim madenciliğinde LLM-extraction çalışmaları olgunlaştı (TopicImpact, MDPI VPC pipeline, Timoshenko SFT hattı, Beyond Stars BERTopic-LLM hibrit). Genel eğilim: LLM kümelemenin yerine geçmek için değil, üç farklı rolde devreye giriyor — **kümeleme-öncesi yapısal ön işleme**, **topic etiketi/özetleme (post-hoc)** ve **tam-LLM extraction ama domain-spesifik veride insan denetimiyle**.

### Cited Findings
- **TopicImpact (Tem 2025):** müşteri yorumlarını LLM ile opinion unit'lere (metin alıntısı + tutum skoru) ayrıştırıp ünite-bazlı topic modeling yapıyor; topic + tutum düzeyini yıldız-derecelendirme (star-rating) tahminiyle ilişkilendiriyor; "actionable insight" hedefi StartupHunt'ın kanıt-hedefiyle aynı — https://arxiv.org/abs/2507.13392
- **MDPI VPC/value-proposition pipeline (2025):** Samsung Galaxy Watch incelemelerinden LLM ile 6 boyut çıkarır (Customer Jobs, Pains, Gains, Feature Gaps, Emotions, Usage Context), embedding + K-means + LLM etiketleme; "product-market fit" çıkarımı; "model özelliklerinden kaynaklanan sapmaları azaltmak için cross-model validation" önerisi. — https://www.mdpi.com/2079-9292/14/22/4407
- **Beyond Stars (Eyl 2025):** BERTopic + HDBSCAN + all-mpnet-base-v2 + LLM topic etiketleme; aspect–sentiment–recommendation üçlüleri çıkaran prompt zincirleri; VADER'ın güçlü "neutral" yanlılığı (%88 neutral, LLM bazlı %48) LLM-etiketleme ile düzeltilebiliyor — https://arxiv.org/html/2509.20953v1
- **ScienceDirect GPT-3.5 VoC (2024):** müşteri servis sohbet loglarında generatif AI ile "voice of customer" madenciliğinin pratik uygulaması; klasik topic modeling sonrası LLM-özetleme katmanı olarak konumlanıyor — https://www.sciencedirect.com/science/article/abs/pii/S1474034624001101
- **2026 IJPR makalesi (Şub 2026):** "Mining novel customer needs... through LLM-enabled data augmentation and ensemble learning"; LLM tabanlı veri büyütme seyrek (sparse) ihtiyaç cümlelerinin recall'unu yükseltiyor; ensemble sınıflandırıcılar ilgisiz içeriği filtreliyor — nadir-nesne (novel-need) tespiti tarafı için doğrudan ilgili — https://www.tandfonline.com/doi/full/10.1080/00207543.2026.2625971
- **Timoshenko/Mao/Hauser güncel sürüm (Nisan 2026, v2):** "SFT LLM'ler görece küçük modellerle profesyonel analist seviyesine ulaşıyor; çıktılar kaynak-içeriğe dayalı, halüsinasyonsuz" — 2025–2026 döneminde customer-need extraction alanının en doğrudan performans kanıtı — https://arxiv.org/abs/2503.01870v2

### Inferences
- Aktif trend: topic modeling *yerine geçme* değil, üç katmanlı işbölümü — (1) LLM extraction hassas birim çıkarımı ve etiketleme yapar, (2) klasik kümeleme ölçek/çok-çeşitlilik sağlar, (3) insan onayı kesinlik verir. StartupHunt mimarisi (semantik küme + insan 'BU' review + yalnız onaylı TR araması) bu üçüyle aynı mantık çizgisinde.
- Sonuç uygulamaya dair: "market intelligence" sürecinde kümeleme "ne konuşuluyor"u hızlı göstermeli; "customer-need" çıkarımı ancak insan-onayıyla sinyal statüsü kazanmalı; her ikisi birbirinin yerine kullanılmamalı.

---

## Kaynak listesi (doğrulanmış URL'ler)

- https://arxiv.org/html/2403.16248v1
- https://arxiv.org/abs/2507.13392
- https://pubsonline.informs.org/doi/abs/10.1287/mksc.2018.1123
- https://nist.gov/publications/traditional-topic-models-llm-topic-models-can-large-language-models-replace-traditional
- https://arxiv.org/abs/2510.03174
- https://arxiv.org/html/2411.08534v1
- https://aclanthology.org/2026.findings-acl.326.pdf
- https://www.economize.cloud/resources/open-ai/pricing/gpt-5-nano/
- https://metatext.io/llm/nano-gpt-gemini-2.5-flash-lite
- https://lmmarketcap.com/google-ai-pricing
- https://models.litellm.ai/models/gemini-3.1-flash-lite
- https://openai.com/index/introducing-structured-outputs-in-the-api/
- https://towardsdatascience.com/hands-on-with-anthropics-new-structured-output-capabilities
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/partner-models/claude/structured_outputs
- https://aclanthology.org/2026.acl-long.680.pdf
- https://aclanthology.org/2023.findings-acl.507.pdf
- https://arxiv.org/html/2406.04638v1
- https://papers.neurips.cc/paper_files/paper/2025/hash/99263f9bf46874e2b8b7f104b5063864-Abstract-Conference.html
- https://scikit-learn.org/1.5/auto_examples/cluster/plot_hdbscan.html
- https://scikit-learn.org/1.8/modules/generated/sklearn.cluster.HDBSCAN.html
- https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/parameter_selection.rst
- https://pmc.ncbi.nlm.nih.gov/articles/PMC7982883
- https://arxiv.org/html/2104.01632v2
- https://ieeexplore.ieee.org/document/10621114
- https://www.jmlr.org/papers/volume24/21-1230/21-1230.pdf
- https://dl.acm.org/doi/10.1145/3657286
- https://arxiv.org/html/2502.09667v2
- https://arxiv.org/abs/2503.01870v2
- https://www.msi.org/working-paper/can-large-language-models-extract-customer-needs-as-well-as-professional-analysts
- https://leadership.mit.edu/ideas-made-to-matter/large-language-models-can-help-professionals-identify-customer-needs
- https://ojs.aaai.org/index.php/AAAI/article/download/42257/46218
- https://arxiv.org/pdf/2603.03299v1
- https://arxiv.org/pdf/2605.27700
- https://arxiv.org/abs/2602.23452
- https://aclanthology.org/2026.findings-eacl.206.pdf
- https://www.mdpi.com/2079-9292/14/22/4407
- https://arxiv.org/html/2509.20953v1
- https://www.sciencedirect.com/science/article/abs/pii/S1474034624001101
- https://www.tandfonline.com/doi/full/10.1080/00207543.2026.2625971
