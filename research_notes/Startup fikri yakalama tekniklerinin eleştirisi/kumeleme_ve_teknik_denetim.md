# Kümeleme ve teknik denetim — “Startup fikri yakalama teknikleri” raporunun ML önerileri

**Denetim kapsamı:** Raporun “StartupHunt mimarisinde yeniden tasarlanacak beş nokta” bölümündeki (a)–(e) maddelerinden ML/kümeleme ile ilgili olanlar: (a) LLM opinion-unit ön-işleme, (b) HDBSCAN keşif/atama çift rejimi ve 0.55 centroid eşiği, (c) burst/frekans kanalı, (d) kanıt taksonomisi + LLM’in review_status yazmaması, (e) çok kaynak + lisans zinciri. Rapor **yeniden yazılmadı**; yalnızca iddialar birincil kaynaklarla karşılaştırıldı.

**Yöntem notu:** Kaynak erişim tarihi **2026-10-21**. Öncelik sırası: resmî dokümantasyon ve algoritma kaynak kodu → hakemli makale → yazar/maintainer tarafından yazılmış issue/tartışma → ön baskı. Ön baskılar “ön baskı” olarak işaretlendi. Sayısal iddialar yalnızca kaynakta yazdığı haliyle aktarıldı; türetilmiş sayılar “Inference” olarak etiketlendi.

**Runtime notu:** Bu cihazda DB/embedding/cluster çalıştırılamadı (WSL2/Docker yok); kod satır referansları statik okumaya dayanır. HDBSCAN/UMAP parametre deneyleri 3060’ta tekrarlanmalı; bu not “çalışıyor” iddiası değil, kaynak denetimidir.

**Kısa hüküm:** Raporun sezgisel yönü doğru — HDBSCAN transdüktiftir, keşif ile günlük atama ayrılmalıdır; frekans patlaması embedding yakınlığından bağımsız bir sinyaldir; LLM review_status yazmamalıdır. Ancak **parametre reçetesi (5–15 / epsilon≈0 / leaf) HDBSCAN’ın kendi dokümanlarıyla çelişiyor**, **0.55 evrensel bir eşik olarak savunulamaz**, **merkez (centroid) ataması BERTopic’in kendi `transform` mantığıyla uyuşmuyor**, ve **burst kanalının kanıt zinciri (BUrST 0.76, Isconna’nın “pattern-change”ı) yanlış etiketlenmiş**. Ayrıca (e)’de ekşi sözlük `ai-input=no` sinyali, raporun iddia ettiği gibi LLM’li işlemeyle uyumlu değil.

---

## Verdict tablosu

| # | Raporun iddiası | Karar | Kısa gerekçe | Operasyonel sonuç |
|---|---|---|---|---|
| 1 | (a) Temizleme→embedding arasına LLM opinion-unit + informative screening katmanı | **KISMEN** (doğru ama eksik) | Timoshenko & Hauser 2019 ve TopicImpact hattı ön-süzmeyi destekliyor; ancak birim kısalır, LLM veri yoluna girer, determinizm ve maliyet ölçülmemiş | Opinion unit’ler tek başına kümelenirse short-text sorunu büyür; thread/user bazında toplama veya taksonomi ataması gerekir |
| 2 | (b) HDBSCAN’ı keşif ve günlük atama olarak iki rejime ayır | **DOĞRULANDI** | HDBSCAN transdüktiftir; yeni noktalar kümeyi bölebilir/birleştirebilir; `approximate_predict` sabit küme varsayımıdır | Doğru mimari karar; ama atama yöntemi ayrıca düzeltilmeli |
| 3 | (b) Keşifte `min_cluster_size` 5–15 | **KISMEN** | Pilot ölçeğinde savunulabilir; tam korpusta çok düşük. BERTopic 1M belge için 100–500 öneriyor; sklearn demo’sunda mcs=3, 750 noktada 90 küme üretiyor | Ölçeğe bağlı mcs (n’nin yüzdesi veya stabilite seçimi) gerekir; 5 sabit sayı değil |
| 4 | (b) `epsilon≈0` + `leaf` seçimi | **YANLIŞ** (bu kombinasyon) | HDBSCAN dokümanı: küçük mcs + yoğun bölgeler = çok sayıda micro-cluster; epsilon tam da bunları birleştirmek için var. `leaf` zaten fine-grained üretir | mcs=5 + eps=0 + leaf = maksimum parçalanma; nadir kümeler değil, gürültü mikro-kümeleri |
| 5 | (b) Günlük atamada cosine 0.55 | **YANLIŞ** (evrensel eşik olarak) | Cosine kalibre bir olasılık değil; model, dil, normalizasyon ve eğitim hedefine göre dağılım değişir; repo’nun kendi notu TR/EN centroid benzerliğini “GÜVENİLMEZ” sayıyor | Model/dil başına kalibrasyon + margin/abstention şart; 0.55 model değişince taşınmaz |
| 6 | (b) Centroid-atama günlük iş için doğru operasyon | **YANLIŞ** (varsayılan olarak) | BERTopic `transform` UMAP + `approximate_predict` kullanır; BERTopic dokümanı centroid’in küme temsili olmadığını söyler; c-TF-IDF ve sınıflandırıcı alternatifleri var | Ham embedding ortalaması ile UMAP uzayında bulunan küme üyeliği farklı geometrilerdir; stale centroid riski |
| 7 | (c) Bağımsız burst/frekans kanalı, “filtre değil tetik” | **DOĞRULANDI** (ilke) / **KISMEN** (uygulama) | Frekans + pattern gerçekten bağımsız sinyal; ancak çoklu test, seyreklik ve Türkçe morfoloji raporun kapsamı dışında | Kanal kurulabilir; ama FDR/min-count ve normalize lemma olmadan gürültü üretir |
| 8 | (c) BUrST “event keyword recall 0.76” | **YANLIŞ** (sosyal metin olarak) | 0.76 Enron mail stream’e ait; FA Cup 0.68, US Election 0.59. Ayrıca bu “event keyword recall”, ürün şikâyeti recall’ı değil | Rakam gerçek ama raporun atfettiği veri kümesi ve görev yanlış |
| 9 | (c) Isconna: G-test + “tekrarlayan substring pattern-change” | **KISMEN / YANLIŞ** | G-test var; ama Isconna “pattern snippet” tutmuyor, ardışık varlık/yokluk ölçüyor; edge-stream anomalisi, metin değil; arXiv dışında hakemli venue bilgisi yok | Metin burst’ü için doğrudan transfer edilemez; “substring” iddiası düzeltilmeli |
| 10 | (c) BurstDetector (IEEE 2024) + FOCuS (JMLR 2023) | **KISMEN** | BurstDetector ağ paket akışları için sketch; FOCuS tek değişkenli ortalama değişimi. İkisi de metin n-gram burst’ü değil | StartupHunt ölçeğinde sketch gereksiz; FOCuS ancak pattern-başına günlük seride anlamlı |
| 11 | (d) Kanıt taksonomisi + LLM asla review_status yazmaz | **KISMEN** (taksonomi) / **DOĞRULANDI** (yasak) | Taksonomi pratik bir heuristic, hakemli validasyonu yok; LLM’i otomatik “interesting” yazmaktan menetmek sağlam mühendislik kararı, ama atıf yapılan %79–88 uyum başka bir görevden | Taksonomi “hipotez” olarak etiketlenmeli; LLM yalnız ön-sıralama/etiketleme asistanı |
| 12 | (e) Çok kaynak + lisans zinciri; ekşi LLM ile uyumlu | **KISMEN / YANLIŞ** (ekşi kısmı) | Çok kaynak doğru; ama `ai-input=no` “AI çıkarımına girdi yok” demek, sadece training değil. Ayrıca robots.txt lisans değil, tercih sinyali | Ekşi içeriğini LLM’e vermek sinyalle çelişir; hukukçu onayı olmadan üretime alınmamalı |
| 13 | MARC multilingual Amazon corpus Türkçe içermiyor | **DOĞRULANDI** | `_LANGUAGES`: de, en, es, fr, ja, zh | Doğru; ama “TR’de hazır corpus yok” sonucu ayrıca yanlış |
| 14 | “TR kanalının hazır maddesi yoktur” | **KISMEN / YANLIŞ** | MARC’ta Türkçe yok (doğru), ama Türkçe benchmark ve review veri kümeleri var (TR-TEB, TR-MTEB, SS-LDA smartphone reviews) | “MARC yok” ≠ “hiç yok”; TR veri stratejisi bu ayrımı yapmalı |
| 15 | “Deterministik veri yolu” | **KISMEN / YANLIŞ** (pipeline iddiası) | HDBSCAN’ın kendisi rastgele başlangıç kullanmaz; BERTopic hattı UMAP yüzünden stokastiktir. UMAP `random_state` ile aynı ortamda tekrarlanabilir, çok iş parçacıklı çalışmada değil | “Deterministik” değil “pinned ortamda replayable” denmeli; run manifest şart |
| 16 | “Literatürde sinyal-sınıfı→ödeme dönüşümü ölçümü yok” | **KISMEN / YANLIŞ** | ICWSM 2020, sosyal medyadaki satın alma niyeti ifadelerinden tüketici harcaması tahmini yapıyor; ama raporun kastettiği sınıf-taksonomisi→bireysel dönüşüm kontrol deneyi yok | “Hiç ölçüm yok” fazla mutlak; “bizim taksonomiyle kontrol deneyi yok” doğru |
| 17 | “Nadir-ama-sistematik metrik taksonomisi yok” | **YANLIŞ / KISMEN** | Weak-signal literatürü (Ansoff 1975; Holopainen & Toivonen 2012; ETH review 2020) ve raporun kendi atıf yaptığı ACM CSUR novelty-detection survey’i taksonomi sunuyor | Kavramsal taksonomi var; StartupHunt’a özgü operasyonel metrik seti yok — bu daha dar ve doğru bir iddia |

---

## 1. HDBSCAN, UMAP ve `min_cluster_size`: raporun atladığı katman

### Takeaway
HDBSCAN 384–1024 boyutlu ham sentence embedding’ler üzerinde doğrudan kullanılmak için tasarlanmış bir algoritma değil; HDBSCAN’ın kendi FAQ’si 50–100 boyuttan sonra performansın belirgin düştüğünü söylüyor. BERTopic de bu yüzden UMAP’i araya koyuyor. Raporun beş maddesinde UMAP’in **hiç anılmaması** ciddi bir eksiklik: mevcut kod UMAP(15 komşu, 10 boyut, cosine, random_state=42) + HDBSCAN(25, 10, eom) çalıştırıyor (`cluster/recluster.py:35-38`, `120-133`); raporun 5–15 / epsilon≈0 / leaf reçetesi bu hattın üzerine oturtulmadan değerlendirilemez.

### Cited findings
- “**Q: I am not getting the claimed performance. Why not?** … the most likely explanation is to do with the dimensionality of your input data. While HDBSCAN can perform well on low to medium dimensional data the performance tends to decrease significantly as dimension increases. In general HDBSCAN can do well on up to around **50 or 100** dimensional data, but performance can see significant decreases beyond that.” — [hdbscan FAQ](https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/faq.rst) (erişim 2026-10-21).
- “Cluster models typically have difficulty handling high dimensional data due to the **curse of dimensionality**.” — [BERTopic, The Algorithm](https://maartengr.github.io/BERTopic/algorithm/algorithm.html) (erişim 2026-10-21).
- BERTopic’in UMAP’i “document embedding’i HDBSCAN ile iyi kümeleme yapılabilecek hale indirmek” için kullandığı resmî olarak yazılı: “In BERTopic, it is used to reduce the dimensionality of document embedding into something easier to use with HDBSCAN to create good clusters.” — [BERTopic parameter tuning](https://maartengr.github.io/BERTopic/getting_started/parameter%20tuning/parametertuning.html) (erişim 2026-10-21).
- UMAP’in kendi FAQ’si, UMAP’in yoğunluğu korumadığını kabul ediyor: “The catch here is that UMAP, with its uniform density assumption, **does not preserve density well**.” — [UMAP FAQ](https://umap-learn.readthedocs.io/en/latest/faq.html) (erişim 2026-10-21). Bu, UMAP üzerinde HDBSCAN’ın bulduğu “yoğunluk kümeleri”nin orijinal embedding uzayındaki yoğunluk kümeleri olmadığı anlamına gelir.
- HDBSCAN “tek büyük küme”yi bilinen bir başarısızlık olarak listeliyor: “**Q: I mostly just get one large cluster; I want smaller clusters.** If you are getting a single large cluster and a few small outlying clusters that means your data is essentially a large glob…” — [hdbscan FAQ](https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/faq.rst). Yani “ham embedding’de tek kümeye çöker” iddiasının *bir* belgelenmiş karşılığı var; ama tek belgelenmiş mod bu değil.
- Kısa metinlerde HDBSCAN’ın asıl belgelenmiş başarısızlığı “tek küme” değil, **kitlesel outlier**’dır: BERTopic’in çok-domainli kısa metin deneyinde “HDBSCAN … **discards 74% of the documents** by labeling them as outliers” ve “topic coherence … declines when applied to shorter documents” — [arXiv 2212.08459](https://arxiv.org/html/2212.08459v1) (ön baskı/çalışma notu; erişim 2026-10-21).

### `min_cluster_size` 5–15 ve `epsilon≈0` neden riskli?
- HDBSCAN dokümanı küçük `min_cluster_size` + yoğun bölge kombinasyonunu açıkça uyarıyor: “In some cases, we want to choose a small `min_cluster_size` because even groups of few points might be of interest to us. However, if our data set also contains partitions with high concentrations of objects, this parameter setting can result in **a large number of micro-clusters**. Selecting a value for `cluster_selection_epsilon` helps us to merge clusters in these regions.” — [HDBSCAN parameter selection](https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/parameter_selection.rst) (erişim 2026-10-21).
- Aynı doküman `leaf` için: “This will select leaf nodes from the tree, producing **many small homogeneous clusters** … there will be a tendency to produce a **more fine grained clustering** than Excess of Mass can provide.” — aynı kaynak. Yani `leaf` + düşük mcs zaten fine-grained; üstüne `epsilon=0` koymak, dokümanın “micro-cluster’ları birleştir” tavsiyesinin tam tersi.
- scikit-learn demo’su küçük mcs’nin sahte alt-kümeler ürettiğini gösteriyor: “Smaller values will likely to lead to results with fewer points labeled as noise. However **values which too small will lead to false sub-clusters being picked up and preferred**.” Örnekte 750 nokta, `min_cluster_size=3` → **90 küme**; `min_cluster_size=5` → 4 küme; `min_cluster_size=25` → 4 küme. — [scikit-learn HDBSCAN demo](https://scikit-learn.org/stable/auto_examples/cluster/plot_hdbscan.html) (erişim 2026-10-21). Bu 2B sentetik bir örnek; metin embedding’ine birebir taşınamaz, ama “5 çok küçük” sinyali güçlü.
- BERTopic’in kendi `min_topic_size` tavsiyesi ölçek duyarlı (BERTopic’te bu, HDBSCAN’ın `min_cluster_size`’ı ile aynı parametredir): “If it nears a million documents, then it is advised to set it much higher than the default of 10, for example, **100 or even 500**.” — [BERTopic parameter tuning](https://maartengr.github.io/BERTopic/getting_started/parameter%20tuning/parametertuning.html); eşleme için [BERTopic `_bertopic.py`](https://github.com/MaartenGr/BERTopic/blob/master/bertopic/_bertopic.py). StartupHunt’ın arşiv hedefi milyonlarca gözlemse 5–15 bandı ölçekle uyumsuz.
- Raporun kendi atıfı olan “60’ta yalnızca gerçek çekirdek kümeler kalıyor” cümlesi **`min_samples` ile karışmış** durumda. HDBSCAN dokümanı aynı yerde şöyle diyor: “Doubling the `min_cluster_size` again to 60 gives us just two clusters -- the really core clusters… The answer is that HDBSCAN* has a second parameter `min_samples`. The implementation defaults this value … to whatever `min_cluster_size` is set to. We can recover some of our original clusters by explicitly providing `min_samples` at the original value of 15.” — [HDBSCAN parameter selection](https://github.com/scikit-learn-contrib/hdbscan/blob/master/docs/parameter_selection.rst). Yani “mcs büyütmek nadir kümeleri öldürür” iddiası, `min_samples` sabit tutulmadığı için **confounded**; rapor bu uyarıyı atlıyor.
- `cluster_selection_epsilon` mutlak bir mesafe eşiği; “0” demek “birleştirme yok” demek. Doküman: “The choice of `cluster_selection_epsilon` depends on the given distances between your data points.” — aynı kaynak. UMAP çıktısının mesafe ölçeği embedding modeline/UMAP parametrelerine göre değiştiği için “epsilon≈0” taşınabilir bir parametre değil.

### Inferences
- Raporun (b) maddesi **mimari olarak doğru, parametrik olarak eksik/riskli**: keşif ve atama ayrılmalı, ama keşif reçetesi “5–15 + eps 0 + leaf” değil, **ölçeğe bağlı mcs + sabit/min_samples ayrımı + epsilon ile micro-cluster birleştirme + stabilite seçimi** olmalı.
- Rapor UMAP’i anmadığı için, okuyucu “HDBSCAN’ı ham embedding’e uygula” sanabilir. Mevcut kod UMAP kullanıyor; asıl risk ham boyut değil, **UMAP(10D) üzerinde mcs=5/leaf/eps=0** kombinasyonunun aşırı parçalanması.
- `min_samples` raporun hiçbir yerinde yok. Mevcut kodda `min_samples=10`, `min_cluster_size=25`; keşif için mcs=5’e düşülürse `min_samples=10` daha muhafazakâr kalır ve noise artar; mcs=15’te ise min_samples 10 biraz altında kalır. Bu, “küçük kümeleri koru” hedefiyle çelişen bir yan etki.

---

## 2. Determinizm ve stabilite: HDBSCAN mı, UMAP mı?

### Takeaway
HDBSCAN’ın referans uygulamasında rastgele başlangıç yok; sabit girdi ve parametreyle aynı etiketleri üretir (kayan nokta/eşitlik istisnaları hariç). BERTopic hattı ise **UMAP yüzünden stokastik**. Raporun “deterministik veri yolu” çerçevesi bu nedenle yanlış adlandırılmış; doğru ifade “pinned ortamda replayable”. `random_state=42` aynı makinede/aynı iş parçacığı sayısında tekrarlanabilirlik verir; çok iş parçacıklı UMAP’te veremez.

### Cited findings
- “UMAP is a stochastic algorithm -- it makes use of randomness both to speed up approximation steps, and to aid in solving hard optimization problems. This means that **different runs of UMAP can produce different results**… To ensure that results can be reproduced exactly UMAP allows the user to set a random seed state.” — [UMAP reproducibility](https://raw.githubusercontent.com/lmcinnes/umap/master/doc/reproducibility.rst) (erişim 2026-10-21).
- Aynı doküman: “**multi-threaded UMAP results cannot be explicitly reproduced**” çünkü “the randomness in UMAP outputs … depends not only on the random seed input, but also on race conditions between threads during optimization.” `random_state` verildiğinde “we are effectively turning off any of the multi-threading that does not support explicit reproducibility” ve aynı seed ile iki koşu “almost identical” / `np.all(...) == True` oluyor. — aynı kaynak.
- `random_state` farklı OS/Numba sürümlerinde aynı sonucu vermeyebilir: “The random_state parameter produces deterministic results on a specific OS, but does not produce the same results on different OSes… also seem to be dependent on the version of Numba.” — [UMAP issue #153](https://github.com/lmcinnes/umap/issues/153) (2018; erişim 2026-10-21).
- BERTopic kaynak kodu bunu kabul ediyor: “**Due to the stochastic nature of UMAP, the results from BERTopic might differ** and the quality can degrade.” — [BERTopic `_bertopic.py`](https://github.com/MaartenGr/BERTopic/blob/master/bertopic/_bertopic.py) (erişim 2026-10-21).
- UMAP’in `n_neighbors` ve `n_components` seçimi de kümeleri değiştirir: “Increasing this value [n_neighbors] often results in larger clusters being created”; “Increasing this value [n_components] too much and HDBSCAN will have a hard time clustering the high-dimensional embeddings.” — [BERTopic parameter tuning](https://maartengr.github.io/BERTopic/getting_started/parameter%20tuning/parametertuning.html) (erişim 2026-10-21). Yani seed sabitlense bile `n_neighbors`/`n_components`/`metric` ve yaklaşık komşuluk kurgusu sonucu değiştirir; reproducibility yalnız “aynı parametre seti” için geçerlidir.
- Topic-model stabilitesi genel olarak random initialization’a duyarlı: “The term ‘stability’ refers to a topic model’s ability to produce solutions that are partially or completely identical across multiple runs with different random initializations.” — [ACM Computing Surveys 2023, “A Review of Stability in Topic Modeling”](https://dl.acm.org/doi/full/10.1145/3623269) (erişim 2026-10-21).
- HDBSCAN’ın kendi API’sinde `random_state` yok; algoritma tek-linkage minimum spanning tree + condensed tree + EOM/leaf seçimi üzerinden çalışır. — [scikit-learn HDBSCAN API](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.HDBSCAN.html) (erişim 2026-10-21). Bu, rastgele başlangıç olmadığının API düzeyinde göstergesi; bit-bazında garanti için ayrıca kayan nokta/eşitlik (tie) testi gerekir.

### Inferences
- `plan.md:369` “HDBSCAN deterministik değildir” diyor; bu **yanlış adres**. Determinist olmayan bileşen UMAP’tir. HDBSCAN, yeni veri geldiğinde *transdüktif* olduğu için etiketler değişir; bu “algoritma stokastik” demek değil.
- StartupHunt “deterministik veri yolu” iddiasını koruyacaksa: UMAP sürümü + Numba sürümü + `NUMBA_NUM_THREADS=1` + `random_state` + embedding model revizyonu + HDBSCAN parametreleri run manifest’ine yazılmalı. Aksi halde aynı kod farklı makinede farklı pattern ID’leri üretir.
- Raporun (b) maddesi bu manifesti önermiyor; “deterministik kanıt observation düzeyinde” diyerek pipeline determinizmini karıştırıyor. Observation kaydı deterministik olabilir; **küme kimliği değil**.

---

## 3. Cosine 0.55 ve centroid ataması: eşik değil, kalibrasyon problemi

### Takeaway
0.55, modelden ve dilden bağımsız bir “benzer” eşiği değil. Cosine skoru kalibre bir olasılık değildir; eğitim hedefi, normalizasyon ve dil dağılımı değişince aynı skor farklı anlama gelir. Daha önemlisi, **centroid-atama** BERTopic’in kendi `transform` operasyonu değil: BERTopic yeni belgeyi UMAP ile indirip HDBSCAN’ın `approximate_predict`’i ile mevcut kümelere atar. Ham embedding ortalaması ile UMAP uzayındaki küme üyeliği farklı geometrilerdir.

### Cited findings
- Cosine’ın “semantic similarity” olarak kör kullanımına karşı analitik uyarı: “We derive analytically how cosine-similarity can yield **arbitrary and therefore meaningless ‘similarities’**… we caution against blindly using cosine-similarity and outline alternatives.” — [Steck, Ekanadham & Kallus, WWW 2024 Companion](https://arxiv.org/abs/2403.05440) (erişim 2026-10-21). Not: Bu sonuç özellikle regularized linear modeller için türetilmiş; bir cevap yazısı normalizasyonla “gauge freedom”ın kalktığını savunuyor ([arXiv 2602.19393](https://arxiv.org/html/2602.19393v1), ön baskı). Yine de “0.55 her modelde aynı anlama gelir” iddiasını desteklemez.
- Contextual temsiller izotropik değil: “the contextualized representations of all words are **not isotropic** in any layer of the contextualizing model.” — [Ethayarajh, EMNLP 2019](https://arxiv.org/abs/1909.00512) (erişim 2026-10-21). Bu, farklı model ailelerinin benzerlik dağılımlarının aynı olmayacağının geometrik gerekçesi.
- MMTEB, mesafenin model tarafından belirlendiğini söylüyor: “computing the distance either using a **model-specified metric**, cosine, euclidean, dot product, or Manhattan.” — [MMTEB, ICLR 2025](https://arxiv.org/abs/2502.13595) (erişim 2026-10-21). Yani metrik seçimi bile modelin sözleşmesinin parçası; eşik de öyle olmalı.
- Türkçe benchmark’ta model sıralaması görev/ölçekle değişiyor; TR-TEB 2026 tablosunda Qwen3-Embedding-8B 64.58, Qwen3-Embedding-4B 63.72, GTE-multilingual-base 62.87, Multilingual-E5-Large 62.61 (genel ortalama). — [TR-TEB, LREC 2026](https://aclanthology.org/2026.lrec-1.862.pdf) (erişim 2026-10-21). TR-MTEB ise “best performing multilingual models (e5-large, gte) still lead in overall performance” diyor. — [TR-MTEB, Findings EMNLP 2025](https://aclanthology.org/2025.findings-emnlp.471.pdf) (erişim 2026-10-21). “Türkçe için tek en iyi model” yok; benchmark ve tarih değişince sıra değişiyor.
- BERTopic’in yeni belge ataması: “Dimensionality - Reducing dimensionality of input embeddings … Clustering - Approximating new points with `hdbscan_model` … `approximate_predict`.” — [BERTopic `_bertopic.py`, `transform`](https://github.com/MaartenGr/BERTopic/blob/master/bertopic/_bertopic.py) (erişim 2026-10-21).
- HDBSCAN’ın kendi prediction tutorial’ı: “This is hard for HDBSCAN* as it is a **transductive method** – new data points can (and should!) be able to alter the underlying clustering. That is, given new information it might make sense to create a new cluster, split an existing cluster, or merge two previously separate clusters.” — [hdbscan prediction tutorial](https://hdbscan.readthedocs.io/en/latest/prediction_tutorial.html) (erişim 2026-10-21).
- BERTopic dokümanı centroid’in küme temsili olmadığını açıkça söylüyor: “Models like HDBSCAN assume that clusters can have different shapes and forms. As a result, using a **centroid-based technique to model the topic representations would not be beneficial since the centroid is not always representative of these types of clusters**.” — [BERTopic, The Algorithm](https://maartengr.github.io/BERTopic/algorithm/algorithm.html) (erişim 2026-10-21).
- BERTopic’in varsayılan outlier reduction’ı c-TF-IDF: “The default method for reducing outliers is by calculating the c-TF-IDF representations of outlier documents and assigning them to the best matching c-TF-IDF representations of non-outlier topics.” Embedding stratejisi opsiyonel. — [BERTopic outlier reduction](https://maartengr.github.io/BERTopic/getting_started/outlier_reduction/outlier_reduction.html) (erişim 2026-10-21).

### Inferences
- 0.55 “yanlış” değil, **kalibre edilmemiş**; ama rapor onu “mevcut atama işini sürdürürken” diye operasyonel bir sabit gibi sunuyor. Repo’nun kendi `plan.md:215` ve `LOG.md:259` notları TR/EN centroid benzerliğinin güvenilmez olduğunu, ölçümün pilot sonrasına kaldığını söylüyor. Yani rapor, kod tabanının kendi uyarısını görmezden geliyor.
- `assign.py:95-102` yalnızca `argmax` alıyor; ikinci en iyi skor, margin, belirsizlik veya dil bazlı eşik yok. 0.551 ile 0.549 arasındaki farkla bir gözlem kalıcı olarak bir pattern’a yazılıyor. Bu, “kanıt” ilkesiyle de çelişir: belirsiz atama, kanıt gibi görünen ama aslında keyfi bir etiket üretir.
- `assign.py:115-131` centroid’i güncellemiyor; yalnız sayaç/timeline güncelliyor. Yeni gözlemler eklendikçe centroid kayıyor ama sabit kalıyor; yüksek hacimde “stale centroid” oluşur. Bu, raporun (b) maddesinde hiç yok.
- Ham embedding ortalaması ile UMAP uzayında bulunan küme üyeliği iki farklı uzay. BERTopic’in `transform`’u UMAP’e de aynı dönüşümü uygular; raporun önerisi bu tutarlılığı atlıyor. Alternatifler: (i) `BERTopic.transform` / `approximate_predict`, (ii) c-TF-IDF temsiline atama, (iii) insan onaylı kümelerden eğitilmiş sınıflandırıcı. Hangisinin seçileceği ölçülmeli; “centroid cosine” varsayılan değil.

---

## 4. Kısa metin: Reddit yorumu tek başına kümelemek neden zor?

### Takeaway
Kısa metin topic modeling’in bilinen zayıf noktası: tek tweet/yorum tek başına yeterli terim birlikteliği üretmiyor; pooling (thread/user/hashtag/conversation) tutarlılığı artırıyor. BERTopic/HDBSCAN kısa metinde %74’e varan outlier üretebiliyor. Raporun (a) maddesi opinion-unit’leri **daha da kısaltırsa**, aynı sorunu büyütür; bu yüzden opinion-unit’lerin thread/gözlem bazında toplanması veya taksonomi ataması gerekir.

### Cited findings
- “Twitter … poses serious challenges to the efficacy of topic models on short, messy text… individual tweets are very short (≤140 characters) and hence **treating each tweet as an individual document does not present adequate term co-occurrence data** within documents. Aggregating tweets … enriches the content present in a single document.” — [Mehrotra et al., SIGIR 2013](http://users.cecs.anu.edu.au/~xlx/papers/sigir13.pdf) (erişim 2026-10-21).
- “When applied directly on posts from microblogging platforms, which are usually short and often noisy, these methods result in **topics that are uninformative and hard to interpret**.” — [Alvarez-Melis & Saveski, ICWSM 2016](https://ojs.aaai.org/index.php/ICWSM/article/view/14817) (erişim 2026-10-21).
- Türkçe kısa metin/ABSA çalışması: “LDA cannot be directly applied on user reviews and on other short texts because of **data sparsity problem and lack of co-occurrence patterns**.” — [SS-LDA, Expert Systems with Applications 2021](https://www.sciencedirect.com/science/article/abs/pii/S0957417420309519) (erişim 2026-10-21).
- BERTopic’in kısa metin deneyi: “the HDBSCAN clustering utilized in BERTopic **discards 74% of the documents** by labeling them as outliers, leading to results with little value in practice.” — [arXiv 2212.08459](https://arxiv.org/html/2212.08459v1) (erişim 2026-10-21). Aynı çalışma k-Means’in daha az outlier ürettiğini, ama topic coherence’ın düştüğünü de gösteriyor; yani “k-Means’e geç” de tek başına çözüm değil.
- BERTopic dokümanı kısa/uzun belge ayrımını yalnız “uzun belgeyi böl” tarafında ele alıyor; kısa belge için özel bir reçete vermiyor: “the embedding model works best for either sentences or paragraphs… splitting up longer documents into either sentences or paragraphs before embedding them.” — [BERTopic Tips & Tricks](https://maartengr.github.io/BERTopic/getting_started/tips_and_tricks/tips_and_tricks.html) (erişim 2026-10-21). Bu, kısa metnin “doğal” olduğu varsayımını desteklemez; yalnız uzun metnin bölünmesini söyler.

### Inferences
- Reddit yorumları için doğrudan bir HDBSCAN `min_cluster_size=5` benchmark’ı bulamadım; kanıt Twitter/mikroblog ve çok-domainli kısa metin çalışmalarından. Bu bir **kanıt boşluğu**, ama yön net: kısa metin + düşük mcs = gürültü/micro-cluster.
- Opinion-unit çıkarımı (cümle + tutum) genellikle **daha kısa** birimler üretir. Bu, embedding’i iyileştirse bile HDBSCAN’ın yoğunluk tahminini zorlaştırır. Çözüm: opinion-unit’leri observation/thread/user bazında havuzla; ya da HDBSCAN yerine taksonomi/sınıflandırıcı ile ata.
- Raporun “küçük kümeler review kuyruğuna mini-pattern olarak akabilir” önerisi mevcut kodda karşılıksız: `recluster.py:174` noise’u `embedded_noise` yapıyor; `assign.py:66-67` bu kayıtları yeniden atamıyor; mini-pattern üreten bir yol yok. Bu, (b)’nin operasyonel olarak eksik olduğunu gösteriyor.

---

## 5. Türkçe: morfoloji, yazım ve benchmark

### Takeaway
Türkçe agglutinatif; tek kökten onlarca çekim türeyebiliyor. Kelime/bi-gram frekans patlaması, aynı olayın “zam / zamlar / zamma / zamdan” gibi yüzey formlarına bölünmesiyle zayıflar; bi-gramlar serbest kelime dizilişi yüzünden daha da seyrek. Zemberek/iki-seviyeli morfoloji analizi bu yüzey formlarını normalize etmek için var; ama analiz belirsizliği ve yavaşlık maliyeti var. Yazım varyasyonu (özellikle ASCII yazım) belgeli; ekşi’ye özgü nicel bir çalışma bulamadım.

### Cited findings
- “Because of the fundamental differences of **agglutinative languages i.e. extreme usage of affixes**, making NLP research based on those languages is much more difficult.” — [Zemberek paper, Akın & Akın 2007](https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/zemberek/zemberek_makale.pdf) (erişim 2026-10-21).
- “Turkish is an agglutinative language with word structures formed by **productive affixations of derivational and inflectional suffixes** to root words. Turkish has finite-state but nevertheless rather complex morphotactics.” — [Oflazer, two-level Turkish morphology](https://aclanthology.org/E93-1066.pdf) (erişim 2026-10-21).
- “Turkish is an agglutinative language. Turkish words are formed by adding many suffixes to the root words… it is quite ordinary that a sentence in English can be expressed by a single word in Turkish.” — [SS-LDA, 2021](https://www.sciencedirect.com/science/article/abs/pii/S0957417420309519) (erişim 2026-10-21).
- “Due to the complexity of the Turkish Morphology, it is possible to derive **over a hundred of words from one verb**.” — [MUKAYESE, Findings ACL 2022](https://aclanthology.org/2022.findings-acl.69.pdf) (erişim 2026-10-21).
- Zemberek’in kapsamı: “spell checking, morphological parsing, stemming, word construction, word suggestion, converting words written only using ASCII characters (so called ‘**deasciifier**’)”. — [Zemberek paper](https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/zemberek/zemberek_makale.pdf). Bu, yazım varyasyonunun (en azından ASCII/aksansız yazım) gerçek bir sorun olduğunu gösteriyor; ekşi’ye özgü oran yok.
- Türkçe embedding benchmark: TR-TEB 45 modeli karşılaştırıyor ve “**No single model dominates across all tasks**” diyor; tabloda Qwen3-Embedding-8B 64.58 ile başta, ama bu genel ortalama ve benchmark 2026. — [TR-TEB, LREC 2026](https://aclanthology.org/2026.lrec-1.862.pdf) (erişim 2026-10-21). TR-MTEB ise 2025’te e5-large/gte’yi öne çıkarıyor. — [TR-MTEB, Findings EMNLP 2025](https://aclanthology.org/2025.findings-emnlp.471.pdf).
- MARC’ın dil listesi: `de, en, es, fr, ja, zh`; Türkçe yok. — [mteb/amazon_reviews_multi script](https://huggingface.co/datasets/mteb/amazon_reviews_multi/blob/main/amazon_reviews_multi.py) (erişim 2026-10-21). Raporun bu iddiası **doğru**.
- Ama “TR kanalının hazır maddesi yoktur” fazla geniş: Türkçe benchmark (TR-TEB/TR-MTEB) ve Türkçe smartphone review ABSA verisi (SS-LDA) var. — yukarıdaki kaynaklar.

### Inferences
- Burst kanalı Türkçe için **lemma/stem bazlı** olmalı; yüzey formu bazlı G-test, aynı olayı farklı suffix’lere böler. Zemberek ile lemma üretip saymak, ardından belirsizlik için “tek analiz” yerine olası köklerin en sık olanını kullanmak gerekir; bu da deterministik bir kural değil, seçim kuralıdır.
- Mevcut `recluster.py:138` `CountVectorizer(stop_words="english")` kullanıyor. Türkçe metinde bu, Türkçe stopword’leri temizlemez; c-TF-IDF keyword’leri “bir, bu, ve, için” gibi kelimelerle kirlenebilir. Rapor Türkçe adapter’dan söz ediyor ama bu somut hatayı anmıyor.
- 0.55’in Türkçe’ye taşınması ayrıca riskli: TR/EN paralel çiftlerde aynı anlamın cosine’i, aynı dildeki iki farklı cümlenin cosine’inden sistematik olarak düşük olabilir. Repo’nun kendi notu da bunu “GÜVENİLMEZ” olarak işaretliyor (`LOG.md:259`, `plan.md:215`). Raporun 0.55’i bu ölçüm yapılmadan “mevcut iş” sayması doğru değil.
- Ekşi’ye özgü yazım varyasyonu iddiası **DESTEKLENMİYOR**: elimde ekşi entry’leri üzerine nicel bir spelling-variation çalışması yok. Genel Türkçe kullanıcı metni için deasciifier ihtiyacı belgeli; bu, iddiayı makul ama kanıtsız bırakıyor. Notlarda bu ayrım korunmalı.

---

## 6. Burst tespiti: kanıt zinciri ve ölçek sorunu

### Takeaway
Burst’ü ayrı bir kanal olarak kurmak doğru; ama raporun kanıt zinciri karışık: BUrST’ın 0.76’sı Enron e-posta verisine ait, Isconna “substring pattern” tutmuyor ve edge-stream anomalisi, BurstDetector ağ paketi için, FOCuS tek değişkenli ortalama değişimi için. Metin n-gram burst’ünde çoklu test ve seyreklik raporun hiç değinmediği iki teknik zorunluluk.

### Cited findings
- BUrST (J Supercomput 2021) hakemli; sosyal metin akışında online clustering + feature similarity + eşik ile burst arıyor. Sonuç: “in event keyword recall … **0.68, 0.59, and 0.76** in the FA CUP, US election and **Enron mail stream**.” — [Burst: real-time events burst detection in social text stream](https://pmc.ncbi.nlm.nih.gov/articles/PMC7982883/) (erişim 2026-10-21). Yani **0.76 Enron**; raporun “sosyal metin” atfı yanlış.
- BUrST’ın karşılaştırma kümesi LDA, Doc-p, G-Feat, BN-gram; “semantic+feature keyword sim” ifadesi rapordaki kadar net değil; makale “feature based similarity and semantic based similarity” diyor, ama ana katkı online clustering + burst threshold. — aynı kaynak.
- Isconna (arXiv 2104.01632) G-test kullanıyor: “For simplicity, we derive the formula of anomalousness from the **G-test**.” — [Isconna](https://arxiv.org/html/2104.01632v2) (erişim 2026-10-21). Ama pattern kısmı: “It does **not actively explore or maintain pattern snippets**; it instead measures the **consecutive presence and absence** of edge records.” — [Isconna abstract](https://arxiv.org/abs/2104.01632). Yani “tekrarlayan substring pattern-change” yanlış; “consecutive presence/absence” doğru.
- Isconna edge stream (dinamik ağ) anomalisi; altı gerçek veri kümesi, 20M edge record; beş baseline’ı geçtiğini iddia ediyor. — aynı abstract. Metin/Reddit verisi değil.
- Isconna arXiv sayfasında hakemli dergi/konferans bilgisi yok; DBLP araması (2026-10-21) boş döndü. Bu, “hakemli” iddiasının **DESTEKLENMEDİĞİ** anlamına gelir; “kesinlikle hakemsiz” demek değil.
- BurstDetector: “Real-Time and Accurate Across-Period Burst Detection in **High-Speed Networks**”, INFOCOM 2024; “Burst is a common phenomenon in high-speed network streams, which manifests as a surge in the number of incoming packets in a flow… a novel sketch named BurstDetector.” — [IEEE Xplore 10621114](https://ieeexplore.ieee.org/document/10621114) (erişim 2026-10-21); venue bilgisi için [Computer Society referansı](https://www.computer.org/csdl/journal/tc/2026/09/11594903/2hPax3z9EHK) (INFOCOM 2024, pp. 2338–2347). Metin değil, paket akışı.
- FOCuS: “Functional Online CuSUM (FOCuS), which is equivalent to running these earlier methods simultaneously for all sizes of windows, or all possible values for the size of change… detecting anomalous behaviour in computer server data.” — [JMLR 2023](https://www.jmlr.org/papers/v24/21-1230/21-1230.html) (erişim 2026-10-21). Tek değişkenli ortalama değişimi; metin n-gram’ı değil.

### Inferences
- **Çoklu test:** V n-gram × W pencere için her hücreye α=0.05 G-testi uygulanırsa, düzeltmesiz beklenen yanlış pozitif sayısı 0.05·V·W olur. V=100k, W=90 için bu 450k’dır (örnek; gerçek V veriye bağlı). BH-FDR veya Bonferroni olmadan “burst” listesi neredeyse tamamen nadir n-gram’lardan oluşur. Rapor çoklu testten hiç söz etmiyor. — **Inference (matematiksel)**.
- **Seyreklik:** G-test’in asimptotik ki-kare dağılımı, beklenen hücre sayıları küçükken güvenilir değil; 1 günlük pencerede nadir bir bi-gram için E<5 sık görülür. Isconna bunu count-min sketch + adjusted G ile yönetiyor; metin tarafında minimum count eşiği, Poisson/binomial exact test veya smoothing gerekir. — **Inference**; Isconna’nın G-test formülü için yukarıdaki kaynak.
- **“Tetik, filtre değil”:** İnceleme kuyruğuna öne alma da bir sıralama/filtredir; kayda “skor yazmamak” onu filtre olmaktan çıkarmaz. Daha önemlisi, tetik istatistiği (hangi n-gram, hangi pencere, hangi düzeltme, hangi sürüm) saklanmazsa tetik **denetlenemez**. Raporun “kaydın kendisine ağırlık/skor yazılmaz” ilkesi kayıt için doğru; ama run-level trigger log’u için değil.
- StartupHunt ölçeğinde (günlük binler-on binler, milyonluk arşiv) sketch tabanlı BurstDetector gereksiz: tam sayım tablosu daha ucuz ve daha doğru. FOCuS ancak pattern başına günlük gözlem sayısı gibi tek değişkenli bir seride anlamlı; n-gram metninde değil.

---

## 7. Raporun kaçırdığı alternatifler: önce taksonomi, sonra atama

### Takeaway
Rapor “önce kümele, sonra LLM ile etiketle” hattını sorgulamadan kabul ediyor. Oysa 2024 literatürü “önce LLM ile taksonomi/koncept üret, sonra belgeyi bu taksonomiye ata” (TopicGPT, LLooM) diye bir alternatif sunuyor; bu, her atamaya gerekçe/alıntı ekleyebildiği için “kanıt, skor değil” ilkesine daha yakın. Maliyet ve determinizm farklı; ölçülmesi gerekir.

### Cited findings
- Raporun (a) maddesinin dayanağı olan Timoshenko & Hauser 2019, CNN ile “informative” cümleleri süzüp insan analiste sunan hibrit hattın UGC-tabanlı VOC’u daha ucuz ve eşdeğer kıldığını gösteriyor; ön-süzme insan inceleme kapasitesini büyütüyor. — [MIT Sloan çalışma özeti](https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=5084) (erişim 2026-10-21). TopicImpact (arXiv 2507.13392, **ön baskı**) ise LLM ile opinion-unit çıkarımının kümeleme öncesi gürültüyü azalttığını iddia ediyor; bağımsız replikasyonu yok. — [TopicImpact](https://arxiv.org/abs/2507.13392) (erişim 2026-10-21).
- TopicGPT (NAACL 2024): LLM ile taksonomi üretir, sonra her belgeyi bir konuya atar ve **atamayı destekleyen alıntıyı** verir: “given a new document, an LLM assigns it to one or more of the generated topics, also **providing a quotation from the document to support its assignment**. These quotations make the method easily verifiable.” — [TopicGPT, arXiv 2311.01449](https://arxiv.org/abs/2311.01449) (erişim 2026-10-21). İnsan-annotated Wikipedia topic’lerine karşı harmonic mean purity **0.74 vs 0.64** (en güçlü baseline); LDA/SeededLDA/BERTopic’ten daha iyi hizalama iddiası var. — aynı kaynak.
- TopicGPT maliyeti: “Most of our experiments implement topic generation with GPT-4 and topic assignment with GPT-3.5-turbo, which costs around **$100 per dataset**.” — aynı kaynak. Bu, veri kümesi başına; 1M belgeye doğrusal ekstrapolasyon yapılamaz, ama büyüklük mertebesi verir.
- TopicGPT’nin sınırı: topic generation için GPT-4 sınıfı gerekiyor; açık kaynak Mistral-7B “assigns topics well but cannot competently follow instructions for generating topics.” — aynı kaynak. Yani “ucuz model + taksonomi” şu an zayıf.
- LLooM (CHI 2024): “concept induction … produces high-level concepts, **defined by explicit inclusion criteria**, from unstructured text.” Örnek: BERTopic “women, power, female” üretirken LLooM “Criticism of traditional gender roles”, “Dismissal of women’s concerns” üretiyor; “concepts improve upon the prior art of topic models in terms of quality and data coverage.” — [LLooM, CHI 2024](https://dl.acm.org/doi/fullHtml/10.1145/3613904.3642830) (erişim 2026-10-21). İnsan-in-the-loop workbench var.
- Kısa metin için BTM/SS-LDA gibi modeller var; SS-LDA Türkçe smartphone review’larında BTM ve Sentence-LDA ile karşılaştırılmış. — [SS-LDA, 2021](https://www.sciencedirect.com/science/article/abs/pii/S0957417420309519). Rapor bunları anmıyor. Grafik/co-occurrence ailesi (keyword co-occurrence + community detection; BUrST’ın G-Feat/SCAN baseline’ları) kısa metinde daha dayanıklı olabilir, ama “kim ne istiyor” ayrımını vermez; yalnız “ne konuşuluyor”u verir. — [BUrST](https://pmc.ncbi.nlm.nih.gov/articles/PMC7982883/) (erişim 2026-10-21).
- Sınıflandırıcı alternatifi: İnsan onaylı pattern’lar birer etiket gibi kullanılabilir; embedding üzerinde lojistik regresyon (kalibre olasılık) veya linear SVM + kalibrasyon eğitmek, sabit cosine eşiğinden daha denetlenebilir bir atama sağlar. Bu, HDBSCAN’ın `approximate_predict`’i ile benzer işi yapar ama etiketli veri gerektirir. — **Inference** (standart supervised learning; raporun “BU” onayı bu etiketleri üretir).
- Üçüncü yol: HDBSCAN’ı günlük atamada tamamen bırakıp **onaylı pattern’ların temsilci alıntılarına retrieval (kNN) + LLM taksonomi** kullanmak. Bu, her yeni gözlemi bir küme merkezine değil, insan onaylı bir kanıt setine bağlar; “kanıt, skor değil” ilkesine daha yakındır. Kümeleme yalnız keşifte kalır. — **Inference** (mimari öneri; maliyet/doğruluk pilotta ölçülmeli).

### Karşılaştırma (rapordaki (a)+(b) vs alternatifler)

| Ölçüt | HDBSCAN + centroid 0.55 (rapor) | BERTopic `transform`/`approximate_predict` | İnsan onaylı kümeden sınıflandırıcı | TopicGPT / LLooM taksonomi |
|---|---|---|---|---|
| Maliyet | CPU; düşük | CPU; düşük | Eğitim+çıkarım; orta | LLM çağrısı; veri kümesi başına ~$100 (TopicGPT) + atama |
| Determinizm | HDBSCAN deterministic; UMAP stokastik; 0.55 sabit | UMAP+approx; pinned ortamda replayable | Seed’e bağlı ama genelde deterministik | LLM stokastik; pinned model + cache ile replayable |
| Denetlenebilirlik | Skor var, gerekçe yok; centroid stale | Küme geometrisiyle tutarlı; yine skor | Olasılık + özellik katkısı; etiketli doğrulama | Her atamada alıntı/gerekçe; taksonomi insan tarafından düzenlenebilir |
| “Kanıt, skor değil” uyumu | Zayıf (belirsiz atama) | Orta | Orta | Yüksek (alıntı zorunlu) |
| Kısa metin | Zayıf (74% outlier riski) | Orta | İyi (etiket varsa) | İyi (taksonomi belge düzeyinde) |
| Türkçe | Model/dil kalibrasyonu yok | Aynı | Etiketli Türkçe veri gerekir | LLM Türkçe’de de çalışır; maliyet/doğruluk ölçülmeli |

### Inferences
- Raporun (a) maddesi “LLM’i kümeleme öncesine koy” diyor; bu, LLM’i “yorum katmanı”ndan çıkarıp **veri yolunun parçası** yapar. Rapordaki “LLM yalnız yorum katmanı” ilkesiyle çelişir. LLM çıktısı önbelleklenmezse her koşuda farklı opinion-unit’ler → farklı embedding → farklı kümeler; “deterministik” iddiası tamamen düşer.
- TopicGPT/LLooM’un cazip yanı: atama gerekçesi (alıntı) ve taksonomi insan kontrolü. Zayıf yanı: LLM maliyeti, model sürümü bağımlılığı ve taksonomi kalitesinin insan emeğine bağlı olması. StartupHunt’ın “insan onayı” ilkesiyle uyumlu; ama “LLM asla review_status yazmaz” kuralı korunmalı.
- HDBSCAN’ı tamamen bırakmak gerekmiyor: keşif için hâlâ iyi bir “bilinmeyeni bulma” aracı; ama günlük atama için sınıflandırıcı veya `approximate_predict` daha doğru. “Keşif HDBSCAN, atama sınıflandırıcı” melezi, raporun iki-rejim sezgisinin daha sağlam hali.

---

## 8. “Literatürde yok” iddiaları: fazla mutlak

### Takeaway
“Sinyal-sınıfı→ödeme dönüşümü ölçen kontrol deneyi yok” ve “nadir-ama-sistematik metrik taksonomisi yok” iddiaları, dar anlamda kısmen doğru; geniş anlamda yanlış. Komşu literatür var: satın alma niyeti ifadelerinden tüketici harcaması tahmini (ICWSM 2020), lead scoring, weak-signal taksonomileri. Raporun kendi atıf yaptığı ACM CSUR survey’i de novelty-detection taksonomisi sunuyor.

### Cited findings
- “We derive predictors from **explicit expressions of purchase intentions** found in social media posts… both word embeddings and word clusters help to **reduce forecasting errors** in comparison to purely macroeconomic models… comparable to error reduction achieved with search traffic variables.” — [Pekar, ICWSM 2020, “Purchase Intentions on Social Media as Predictors of Consumer Spending”](https://aaai.org/papers/00545-7322-purchase-intentions-on-social-media-as-predictors-of-consumer-spending/) (erişim 2026-10-21). Bu, bireysel “hangi sinyal sınıfı ödemeye dönüştü?” kontrol deneyi değil; ama “sinyal→harcama” ölçümü var.
- Weak-signal literatürü: “Management science dubs these signs weak signals, seemingly insignificant pieces of information that are hard to detect and to interpret — but catalytic to our understanding (Ansoff 1975).” — [ETH, “An interdisciplinary review on weak signal detection”, 2020](https://ethz.ch/content/dam/ethz/special-interest/dual/frs-dam/documents/201125_Weak-signal-detection.pdf) (erişim 2026-10-21). Holopainen & Toivonen 2012 “Weak signals: Ansoff today” de kavramı ve türlerini sistematize ediyor. — [Futures 44(3), 2012](https://www.sciencedirect.com/science/article/abs/pii/S0016328711002540) (erişim 2026-10-21).
- Raporun kendi atıfı: ACM Computing Surveys 2024 SLR, metin veri akışında novelty detection’ı “hâlâ zayıf çözümlü açık problem” diye nitelendirirken concept evolution / buffer / open-set recognition taksonomisi sunuyor. — [ACM CSUR](https://dl.acm.org/doi/10.1145/3657286) (erişim 2026-10-21). Yani “taksonomi yok” iddiası, kendi kaynağıyla çelişiyor.

### Inferences
- Doğru iddia şu olmalı: “StartupHunt’ın sinyal sınıfları (workaround/para/tekrar/sayı) ile gerçek ödeme arasındaki **nedensel/kontrollü** dönüşümü ölçen bir çalışma bulamadık; komşu ölçümler var.” Bu, “literatürde hiç yok”dan daha dürüst ve daha kullanışlı.
- “Nadir-ama-sistematik metrik taksonomisi” için de doğru iddia: “Kavramsal weak-signal taksonomileri var; bizim operasyonel metrik setimiz (G-burst, pattern-change, küme büyümesi) için doğrulanmış bir taksonomi yok.” Raporun mevcut mutlak ifadesi, literatürü olduğundan boş gösteriyor.

---

## 9. (e) Çok kaynak + lisans zinciri: kısa teknik not

### Takeaway
Çok kaynaklı adapter mimarisi doğru; ama “lisans zinciri” iddiası operasyonel değil. En somut hata ekşi sözlük: `Content-Signal: ai-input=no`, “AI çıkarımına girdi olarak kullanma” demek; raporun “LLM yalnız yorum katmanı” yorumu bu sinyalle uyumlu değil. Ayrıca robots.txt bir lisans değil, tercih sinyali; Amazon Reviews 2023 kartında lisans alanı yok.

### Cited findings
- “ai-input covers use as input to an AI system **at inference time**” / “ai-input — whether the content may be fetched as **live input to an AI system (retrieval-augmented generation, summarisation at query time)**.” — [InfoQ, 2026-03-05](https://www.infoq.com/news/2026/03/cloudflare-crawler) ve [Content Signals specification](https://specification.website/okf/agent-readiness/content-signals.md) (erişim 2026-10-21). “No” bu kullanımı yasaklıyor.
- Cloudflare “signals are merely **preferences, not enforceable rules**” diyor. — [InfoQ](https://www.infoq.com/news/2026/03/cloudflare-crawler). Yani robots.txt “izin” değil; lisans/attribution zinciri ayrıca gerekir.
- Amazon Reviews 2023 HF kartında `license` alanı yok; yalnız veri tanımı ve kullanım örnekleri var. — [McAuley-Lab/Amazon-Reviews-2023](https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023) (erişim 2026-10-21). Ticari kullanım için açık bir lisans görünmüyor.
- MARC lisansı yalnız akademik araştırma; “You may not resell, republish, or make any **commercial use** of the Reviews Corpus.” — [mteb/amazon_reviews_multi script](https://huggingface.co/datasets/mteb/amazon_reviews_multi/blob/main/amazon_reviews_multi.py) (erişim 2026-10-21). Rapor MARC’ı kaynak olarak önermiyor, ama “lisans zinciri” konuşulurken bu ayrım önemli.
- Ekşi robots profili: `Content-Signal: ai-train=no, ai-input=no, search=yes` — raporun kendi atfı. — [ekşi robots.txt](https://eksisozluk.com/robots.txt) (erişim 2026-10-21).

### Inferences
- Trustpilot’un dışlanması, raporun kendi ToS/dava kanıtıyla tutarlı; bu kısma itirazım yok. İtiraz, “açık” sanılan ekşi ve Amazon tarafına.
- “Normal crawler’a Allow: /” erişim izni gibi görünse de, `ai-input=no` LLM’e vermeyi yasaklıyor. Raporun “LLM’i yalnız yorum katmanı ilkesiyle uyumlu sınırda işletmeyi zorunlu kılar” cümlesi, sinyalin anlamını tersine çeviriyor.
- Çok kaynak adapter’da her kayıt için `license_id`, `attribution_required`, `ai_use_allowed`, `retention_policy` alanları taşınmalı; yoksa “lisans zinciri” denetlenemez. Bu, ML değil veri sözleşmesi konusu; ama raporun (e) maddesiyle doğrudan ilgili.

---

## Kanıt boşlukları (dürüstçe)

1. **BERTopic’in seed-stabilitesi üzerine hakemli, sayısal bir benchmark bulamadım.** UMAP dokümanı + BERTopic kaynak kodu + genel topic-model stabilite survey’i var; “şu kadar NMI düşüyor” gibi bir rakam yok. Bu yüzden “topic instability” iddiasını niteliksel tuttum.
2. **Reddit yorumlarına özgü HDBSCAN `min_cluster_size` benchmark’ı yok.** Kısa metin kanıtı Twitter/mikroblog ve çok-domainli veri kümelerinden; Reddit’e birebir genelleme yapılmamalı.
3. **Ekşi’ye özgü spelling-variation oranı yok.** Genel Türkçe deasciifier ihtiyacı belgeli; ekşi’ye özel nicel çalışma bulamadım.
4. **0.55’in Qwen3/E5/GTE arasında Türkçe’de nasıl dağıldığına dair yayınlanmış bir ölçüm yok.** Repo’nun kendi 50 çiftlik testi doğru yaklaşım; rapor bunu önkoşul yapmıyor.
5. **Türkçe burst detection için doğrudan bir benchmark yok.** Morfoloji argümanı Zemberek/Oflazer’a dayanıyor; ampirik burst sonucu değil.
6. **“Sinyal sınıfı→bireysel ödeme” kontrollü deneyi bulamadım.** ICWSM 2020 toplam harcama tahmini; lead scoring endüstri pratiği. Raporun “hiç yok” iddiası bu yüzden fazla mutlak.
7. **Isconna’nın hakemli yayını doğrulanamadı.** arXiv sayfasında venue yok; DBLP boş. “Hakemsiz” demiyorum; “hakemli olduğuna dair kanıt yok” diyorum.
8. **BUrST’ın 0.76’sı Enron; Reddit/forum replikasyonu yok.** Raporun “sosyal metin” etiketi bu yüzden yanlış.

---

## Ne yapardım (kanıta dayalı, kısa)

**P0 — Önce ölçüm sözleşmesini düzelt:**
1. **“Deterministik” yerine “replayable” de.** `run_manifest`: embedding model revizyonu, UMAP/Numba/HDBSCAN/BERTopic sürümleri, `random_state`, `NUMBA_NUM_THREADS`, tüm parametreler, veri snapshot hash’i. Aynı manifest + aynı ortam = aynı pattern ID’leri; farklı ortam = yeni run.
2. **0.55’i evrensel eşik olarak kullanma.** Model/dil başına kalibrasyon: insan etiketli ~200–500 çift (aynı/benzer/farklı) üzerinde precision-recall eğrisi; her atamada `best_sim`, `second_sim`, `margin` sakla; margin düşükse `unassigned` bırak. TR/EN için ayrı eşik.
3. **Centroid atamasını bırak veya düzelt.** Öncelik: `BERTopic.transform` (UMAP.transform + `approximate_predict`) veya insan onaylı kümelerden eğitilmiş sınıflandırıcı. Centroid’de ısrar edilecekse: ham embedding yerine UMAP uzayında medoid kullan; centroid’i her N atamada güncelle; ikinci en iyi skoru kontrol et.

**P1 — Keşif ve kısa metin:**
4. **`min_cluster_size=5 + epsilon=0 + leaf` reçetesini bırak.** Stabilite seçimi: mcs ∈ {15, 25, 40, 60} (n’ye göre ölçekle), `min_samples` sabit (ör. 10), `epsilon` grid (0.05–0.3), `eom` ve `leaf` karşılaştır. Bir küme ancak en az iki komşu parametrede stabilse ve yeterli persistence/outlier oranına sahipse “aday pattern” olsun. Pilot veride insan spot-check’i ile precision ölç.
5. **Kısa metni havuza al.** Opinion-unit’leri observation/thread/user bazında birleştir; tek cümlelik unit’leri doğrudan global HDBSCAN’a verme. Alternatif: BTM/SS-LDA veya taksonomi ataması. Reddit için thread bazlı pooling, yorum tekrarını azaltır.
6. **Türkçe hattını ayrı kur.** `CountVectorizer(stop_words="english")` yerine Türkçe stopword listesi; burst için Zemberek lemma/stem normalizasyonu + deasciifier; embedding seçimini TR-TEB/TR-MTEB üzerinden yap; 0.55’i TR/EN çift testiyle ayrı kalibre et.

**P2 — Burst ve alternatifler:**
7. **Burst’ü ölçülebilir yap.** Normalize lemma/bi-gram sayıları; pencere başına minimum gözlem; BH-FDR ile çoklu test düzeltmesi; tetik istatistiğini (n-gram, pencere, beklenen/gözlenen, düzeltilmiş p) run log’una yaz. FOCuS’u yalnız pattern-başına günlük sayı serisinde kullan; BurstDetector’ı (paket akışı) metne taşıma.
8. **Taksonomi alternatifini pilotla.** 1–2k belgede TopicGPT/LLooM tarzı taksonomi + alıntılı atama ile mevcut BERTopic hattını karşılaştır: purity/coverage, insan inceleme süresi, belge başına maliyet, tekrar üretilebilirlik. LLM’i yalnız aday/taksonomi üretiminde kullan; `review_status` yalnız insan işaretiyle değişsin.
9. **Kanıt taksonomisini “hipotez” olarak etiketle.** Workaround/para/tekrar/sayı testleri pratikte faydalı ama hakemli validasyonu yok; UI’da “kanıt türü” olarak göster, “ölçülmüş dönüşüm” gibi sunma. Her sinyalde permalink + verbatim + bağımsız kaynak sayısı + LLM model/prompt sürümü sakla.

**Kısa hüküm:** Raporun yönü doğru, ama kanıtı taşıyan üç yerde (HDBSCAN parametreleri, 0.55 centroid, BUrST/Isconna atıfları) teknik olarak zayıf. Bu üçü düzeltilmeden “beş nokta” üretim planı olarak kullanılmamalı; pilotta ölçülmesi gereken açık parametreler olarak kalmalı.
