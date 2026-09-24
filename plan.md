# StartupHunt — Proje Planı (v3.2)

## AMAÇ

Fikir üretmek değil; **dünyadaki sinyalleri bulmak**:

* Ne popüler / trend
* Nelerden şikayet ediliyor
* Neler eksik görülüyor (gap)
* Neler geliştiriliyor (development activity)
* Ne tür firmalar kuruluyor (launch)
* Neler geriliyor (decline)

Bunlarla sınırlı değiliz; sinyal tipleri kapalı liste değil, genişleyebilir.

İkinci yarısı: **dünya sinyalinin Türkiye karşılığını aramak** (SearXNG ile; yetersiz kalırsa başka arama katmanı eklenir). Bir sinyalin TR'de karşılığı olup olmadığı, varsa ne kadar aktif olduğu, yoksa "boşluk" sinyali olarak kendi başına değer taşır.

## TAM AKIŞ (v3.2)

```text
KAYNAKLAR (arşiv + resmî API · scraper yok)
   ↓
BACKFILL (arşivler: Arctic Shift, GH Archive, SE Dump — son 18 ay)  +  LIVE (resmî API polling)
   ↓
DATA COLLECTION (adapters — iki katman: backfill/live, ortak normalize)
   ↓
RAW STORAGE (PostgreSQL JSONB)
   ↓
NORMALIZATION (ortak format + language detection)
   ↓
CLEANING + DEDUP (exact)
   ↓
EMBEDDING (Qwen3-0.6B, TEI, lokal GPU; observation başına 1 temsil vektörü)
   ↓
PGVECTOR (HNSW, halfvec(1024))
   ↓
CENTROID ASSIGNMENT (sık: her günlük koşuda yeniler mevcut pattern'lara atanır)
   ↓
RECLUSTER (tetik bazlı: atanmamış oran eşiği; BERTopic UMAP+HDBSCAN+c-TF-IDF
           → overlaps eşleşme → pattern_history + review_status taşınması)
   ↓
SIGNAL TYPING (prototip vektör — pilot sonrası; kanıt etiketi, filtre değil)
   ↓
REVIEW SERVER (insan denetimi: [BU]/[junk]/[seen] → patterns.review_status)
   ↓
TR KARŞILIK ARAMASI (yalnızca insan onaylı pattern'lar; SearXNG → observations'a girer)
   ↓
(Geri: UI / metrik snapshot'lar — pilot sonrası kademeli)
```

---

# FAZ 1 — Kaynaklar

Kaynaklar iki sınıftır: **metin kaynakları** (observation üretir) ve **metrik kaynakları** (sayısal zenginleştirme; kendi başına observation üretmez).

## Metin kaynakları

| Kaynak | Yöntem | Not |
| --- | --- | --- |
| Reddit (backfill + gap-fill) | [Arctic Shift](https://github.com/ArthurHeitmann/arctic_shift) API/dump | Taban **son 18 ay** (v3.2 karar: orta-yakın güncellik; "yıl" ölçeğinde bayat data gerekmez). Roller: backfill + uzun kapalı kalma dönemlerinin gap doldurması + istisnai "olasılık destek sorgusu" (bkz. PILOT / Geçmiş destek modu). `subreddit+after+limit=auto` sayfalama. `title`/`selftext` keyword araması yalnız `subreddit`/`author` filtresiyle çalışır. `score` ~36 saat sonraya hamlıdır — popülerlik için sonradan enrich. 429'da `X-RateLimit-Reset`'e uy; büyük hacimde dump indir. |
| Reddit (live) | **Resmî Reddit API (OAuth)** — karar 2026-09-21 | Reddit-universal-scraper **iptal edildi** (proxy/ban/CSV karmaşası, ikinci dış bağımlılık). Canlı uç resmî OAuth API ile: `/r/<sub>/new` listing, istek başına ~100 post. **Ücretsiz katman: 100 istek/dk (OAuth)** — bizim iş yükü (~30-50 istek/gün, 10 sub listing) kotanın çok altında. KOŞUL: Reddit'in Haziran 2026 Responsible Builder Policy gereği **access talebi onayı** gerekmektedir; onay 2-4 hafta sürebilir → app kaydı pilotla paralel şimdi başlatılır. Kayıttan sonra OAuth token akışı + özel User-Agent formatı zorunlu. |
| Hacker News | Firebase API + Algolia | Firebase: canlı akış, limit yok. Algolia (`hn.algolia.com/api/v1/search`): tam metin arama story+comment, `numericFilters=created_at_i` ile tarih; Show HN = launch, Ask HN = gap sinyali. `nbPages=1000` tavanı → derin geçmişte sayfalama sınırı. |
| GitHub (live) | REST API | `search/issues` (şikâyet), `search/repositories` (launch: yeni repo, `created:` filtresi), `/releases` (changelog = development), issue comments. Tokenlı 5.000 req/saat; search secondary limit ~30 req/dk. |
| GitHub (backfill + gap-fill) | **GH Archive** ([gharchive.org](https://www.gharchive.org)) — karar 2026-09-21 | 2011'den beri tüm public GitHub event'leri (issues, PR, CreateEvent=launch, star) saatlik `.json.gz` dump'lar; BigQuery'de de sorgulanabilir. Free, legal. Backfill adapter'ın arşiv katmanı — API kotası hiç baskı altına girmez. |
| Stack Exchange (live) | API | Key ile 10.000 req/gün; `backoff` zorunlu; 30 req/sn üstü engellenir. |
| Stack Exchange (backfill) | **SE Data Dump** (archive.org, üç aylık) — karar 2026-09-21 | Tüm siteler, tüm geçmiş, CC BY-SA. Free, legal; incremental canlı API ile. |
| YouTube | Data API | `search.list` KULLANMA (100 unit). `videos.list?chart=mostPopular&regionCode=TR` = 1 unit → TR trend doğrudan. `commentThreads.list` (1 unit), sabit kanal listesi `playlistItems` (1 unit). 10.000 unit/gün ≈ 10k ucuz çağrı. |
| SearXNG | Self-host, JSON API | `GET/POST /search?q=&language=tr&format=json`. Public instance'ların çoğunda JSON formatı **kapalı** → kendi instance şart. TR karşılık araması + keşif (bkz. FAZ 14). |
| SaaS siteleri / pricing / changelog / feature request / startup dizinleri / niş forumlar | Firecrawl | 1.000 kredi/ay ≈ 33 sayfa/gün → sadece seçilmiş URL listesi modu; arama sonuçlarına kredi harcama. ETag/son değişiklik ile tekrar çekmeyi azalt. |
| G2 / Capterra / Trustpilot / Google Play / Upwork / Indie Hackers / LinkedIn / Indeed | Apify veya düşük öncelik | ToS/ban riskli; Apify Free $5/ay sadece doğrulama içindir, düzenli boru hattı değil. LinkedIn/Indeed düşük öncelik veya kapsam dışı. |

## Metrik kaynakları (observation üretmez; pattern zenginleştirme)

| Kaynak | Metrik | Kullanım |
| --- | --- | --- |
| npm | `api.npmjs.org/downloads` indirme zaman serisi | Pattern keywords'üyle eşleşen paketin büyüme eğrisi |
| PyPI | JSON metadata + RSS (yeni paket) | Aynı |
| GitHub | stars, `pushed_at` delta, forks | Gelişme/gerilme sinyali |
| HN | points, num_comments | Dikkat sinyali |
| Arctic Shift time_series | `r/<sub>/subscribers`, `posts/count` | Subreddit büyüme/gerilme |

Metrik kaynaklarından "observation" üretilmez (sentetik cümle gömmek yapay olur). Bir pattern'ın keywords'üyle eşleşen varlığın metrik eğrisi, pattern'ı zenginleştirir (FAZ 11).

## Erişim önceliği

```text
Official API (live/incremental uç)
    ↓ geçmiş/gap için
Archive (Arctic Shift, GH Archive, SE Data Dump)
    ↓ yoksa
Apify
    ↓ yoksa
Firecrawl
    ↓ yine yetmiyorsa
Playwright / Crawlee
```

## Mimari karar (2026-09-21): iki katmanlı adapter yapısı

```text
BACKFILL katmanı  = arşiv kaynakları: Arctic Shift, GH Archive, SE Data Dump
LIVE katmanı      = resmî API'ler: Reddit OAuth, HN Algolia/Firebase, SE API, YouTube Data API
```

* Scraper (reddit-universal-scraper) ve proxy yaklaşımı **terk edildi** — tüm toplama legal API/arşiv üzerinden.
* Tek ücretli/anahtarlı kaynak: YouTube (ücretsiz key, kişisel kota). GitHub backfill ve SE backfill arşivden; API key'ler yalnızca canlı ucu hızlandırır, zorunlu değildir.

---

# FAZ 2 — Data Collection

**Kullanılacaklar:** TypeScript, API client'ları, arşiv parser'ları; SearXNG client. Apify/Firecrawl yalnızca fallback (bkz. FAZ 1 erişim önceliği).

Her kaynak için adapter:

```text
RedditBackfillAdapter    (Arctic Shift → son 18 ay + gap-fill; subreddit bazlı)
RedditLiveAdapter        (resmî OAuth API → günlük; scraper iptal edildi)
HNAdapter, GitHubLiveAdapter, GitHubArchiveAdapter (GH Archive),
StackExchangeAdapter (API) + SE Archive Dump backfill,
YouTubeAdapter, SearXNGAdapter, FirecrawlAdapter, ...
```

**Backfill/live ayrımı:** Tüm adapter'lar aynı normalize edilmiş şemaya yazar; backfill arşivden toplu-idempotent, live daily polling. **Bilinen sınırlama (ilke gerilimi):** HN/GitHub live adapter'lar **sorgu terimiyle** çalışır (SaaS, missing feature vs.) — search API'leri sorgusuz çalışmadığından bu bir **örtülü filtre**dir ve "seçim kuralı yok" ilkesiyle gerilimlidir. Kabul edilen sınır: sorgu listesi elle genişletilebilir config'tir (sub listesi gibi); kapsam büyütme yolu arşiv kaynaklarının tam metnidir (GH Archive tüm event'ler, SE dump tüm geçmiş — sorgu gerektirmez). Pilot'ta gözlemlenir.

**Backfill/incremental ayrımı:** Her Reddit adapter'ı aynı normalize edilmiş şemaya yazar; backfill tek seferlik (idempotent upsert), incremental günlük çalışır. Diğer kaynaklarda backfill = `after=`/`created:` filtreli ilk çekme, incremental = polling.

**Toplama anında dil tespiti** (hızlı, ucuz — örn. franc/CLD tarzı): `language` kolonuna yazılır; TR karşılık eşleştirmesinin temeli.

**Çıktı:** Raw observation (kaynağın orijinal alanları).

---

# FAZ 3 — Raw Storage

**Kullanılacaklar:** PostgreSQL + JSONB

```sql
create table raw_observations (
  id           bigserial primary key,
  source       text not null,
  source_id    text not null,
  raw_data     jsonb not null,
  collected_at timestamptz not null default now(),
  unique (source, source_id)
);
```

Ham veri değiştirilmez; sonradan yeniden işlenebilir. Raw'dan normalize'a geçiş kaybı olmamalıdır.

---

# FAZ 4 — Normalization

**Kullanılacak:** TypeScript

```text
id, source, source_id, source_url, title, text, author,
observed_at, language, metadata
```

Notlar:

* `language` burada yazılır (FAZ 2'deki tespit).
* `signal_types` bu fazda boş bırakılır (`{}`); FAZ 9'da prototip vektörle dolar — **pilot sonrası** (signal typing pilot'tan önce yazılmaz).
* Aynı observation hem şikâyet hem trend olabilir → tip `text[]`, tek değer değil.

---

# FAZ 5 — Cleaning + Dedup

**Kullanılacaklar:** TypeScript + PostgreSQL

* Boş/çok kısa içerik, spam, boilerplate temizliği
* Duplicate URL (unique constraint)
* Duplicate content — exact match (`content_hash`)

Near-duplicate (aynı sinyalin farklı platform/ifade tekrarı) FAZ 6'da embedding ile yakalanır. Reddit repostlar için `crosspost_parent_id` metadata'da taşınır.

---

# FAZ 6 — Embedding

**Model (karar verildi):** **Qwen3-Embedding-0.6B** — self-host, Apache 2.0, TEI (Text Embeddings Inference) ile lokal GPU'da çalışır.

**Neden (MTEB çok dilli benchmark, Mayıs 2025):**

| Model | Mean | Clustering (bizim iş) |
| --- | --- | --- |
| Qwen3-Embedding-0.6B | 64.33 | **66.83** |
| Cohere embed-multilingual-v3 | 61.12 | 62.95 |
| text-embedding-3-large | 58.93 | 60.27 |
| text-embedding-3-small | (listede yok) | (listede yok) |

* `text-embedding-3-small` çok dilli/clustering benchmark'larında kanıtlanmamış; TR↔EN centroid eşleştirmesi projenin kritik bağımlılığı olduğu için elendi.
* 100+ dil, 32k context, 1024 boyut (MRL ile 32-1024 arası ayarlanabilir), 0.6B parametre → RTX 3060'da ~1.5GB VRAM, ~100-300 obs/sn.
* Instruction-aware: query taraflı görevlerde (TR karşılık araması sorgusu vs. corpus) instruct kullanımı +1-5% getirir.
* Yedek plan: pilot test başarısız olursa Gemini Embedding (MTEB 68.37, en iyi) veya Cohere embed-v4 — API maliyeti karşılığında.

**Kritik tasarım kararı — clustering için observation başına TEK temsil vektörü:**

```text
observation (title + text)
   ↓ temsil metni: "title" + ilk N karakter / gerekiyorsa LLM özeti
   ↓ 1 embedding = clustering/dedup/pattern eşleme birimi
```

Chunking **yalnızca** şu amaçlarla kullanılır: uzun GitHub issue içinde arama (retrieval), near-duplicate doğrulama. Cluster'a giren vektör observation'ı temsil eden tek vektördür — chunk vektörleri clusterlamaya girmez (yoksa bir issue 15 "observation" gibi davranır ve cluster istatistiklerini bozar).

* 32k token context → temsil metni için bolca sığa; sessiz kırpma yine yasak.
* Toplu embedding TEI üzerinden batch halinde lokal GPU'da (cloud maliyeti yok).
* Near-duplicate: cosine similarity eşiği.

**TR/EN doğrulama — zamanlaması v3.2'de netleşti:** bu test pilot ana akışından ÇIKARILDI (pilot verisi TR barındırmaz, ölçülemez). **Ayrı mini test: pilot'tan SONRA, FAZ 14'ten ÖNCE** koşulur — prosedür: ~50 elle seçilmiş çift (aynı şikâyetin iki dilde ifade edilişi) → Qwen3 TR↔EN centroid benzerlik ölçümü. Zorunlu ölçüm; eşik altı → yedek modeller (bkz. Açık Soru 3).

---

# FAZ 7 — Vector Storage

**Kullanılacak:** PostgreSQL + `pgvector`, HNSW index

```sql
embedding halfvec(1024)  -- Qwen3-0.6B çıkışı 1024d; halfvec = 2KB/obs (float32'nin yarısı)
```

* Index: `hnsw (embedding halfvec_cosine_ops)`; `ivfflat` değil.
* **Bulk backfill sırasında index'i düşür, insert bitince oluştur** (HNSW'ye insert pahalıdır).
* `m`, `ef_construction`, `ef_search` veri hacmine göre ayarlanır.
* Ölçek kontrolü: 1.5M obs × 2KB ≈ 3GB vektör + metin/index ≈ 30-60GB toplam; lokal disk için sorun değil.

---

# FAZ 8 — UMAP + HDBSCAN

**Kullanılacak:** **BERTopic** (karar verildi — elle UMAP+HDBSCAN+c-TF-IDF kurmak yerine)

BERTopic bizim pipeline'ın tamamını paketler: UMAP + HDBSCAN + c-TF-IDF keywords + LLM representation + `merge_models` (cluster birleştirme) + `reduce_outliers` (noise azaltma) + serialization (safetensors, <20MB). İki modlu güncelleme (FAZ 13) bizde kalıyor: BERTopic **seyrek recluster'ı** çalıştırır; sık güncelleme bizim centroid assignment katmanımız.

```text
Embeddings (1024D)
  ↓ UMAP (5–15D)  (random_state sabitlenir → tekrarlanabilirlik, perf. bedeli kabul)
  ↓ HDBSCAN (min_cluster_size / min_samples hacme göre kalibre)
  ↓ Cluster'lar + noise
```

BERTopic'ten gelen kanıtlanmış pratikler:

* **Preprocessing YOK** — embedding modeli bağlama ihtiyaç duyar; stopword temizliği CountVectorizer'da (`stop_words` + `ClassTfidfTransformer(reduce_frequent_words=True)`).
* `calculate_probabilities=False` (pahalı), `low_memory=True` büyük veri için.
* Fazla topic → `min_topic_size` artır / `n_neighbors` (UMAP) yükselt; az topic → tersi.
* Outlier'lar: `min_samples` düşürme dengesizliği + `.reduce_outliers` stratejileri; noise tamamen yok edilmemeli.
* `partial_fit` (online topic modeling, IncrementalPCA+MiniBatchKMeans) **kullanılmıyor** — k-Means noise üretmez, FAZ 13 centroid yaklaşımıyla çelişir; BERTopic'in kendisi de eski UMAP/HDBSCAN'ı koruyan `merge_models`'i öneriyor.
* Teknik borç: HDBSCAN/UMAP numpy build sorunları bilinir → Python ortamı Docker'da versiyon sabitlenmiş tutulur (bkz. Altyapı).
* **Çok dilli risk:** TR ve EN içerik embedding uzayında dile göre ayrışabilir → dil bazlı sahte cluster'lar. Ölçüm zamanlaması: pilot sonrası ayrı mini test (bkz. FAZ 6 + Açık Soru 3 — pilot ana akışı TR barındırmaz).

---

# FAZ 9 — Signal Typing + Pattern Discovery

```text
Cluster → observation'lar → keywords (c-TF-IDF) → signal_types → Pattern
```

## Temel ilke (grill kararları, 2026-09-21)

* **Pain point ifade kalıbında değil, anlamdadır.** "I wish" tarayıcısı yalnızca açık istekleri yakalar; örtük şikâyet/workaround ("Notion on a plane is useless") hiçbir kalıba uymaz. Anlamı yakalayan şey cluster'ın kendisidir: aynı eksikliğin farklı insanlarca farklı cümlelerle tekrarı embedding uzayında kümeleşir. **Observation seviyesinde pain point yoktur; pain point pattern seviyesinde ortaya çıkar.** Signal typing bu yapının üstüne konan yardımcı etikettir, aracın kendisi değil.
* **Sistem karar vermez, kanıt sunar.** Filtre yok, skor yok, ağırlık yok. Signal_types, kaynak sayısı, frekans eğimi, recency, metrik delta, TR karşılığı → pattern kartında **gösterilen kanıttır**; eleme araçları değil. İnsan denetimi tüm pattern listesini görür, karar insandadır.
* **LLM'in sınırı:** LLM yalnızca insanın okuyacağı yorum katmanında çalışır (isim/açıklama, TR anahtar kelime türetimi, özet). Veri yolunda asla: observation silme/değiştirme, cluster üyeliği, signal_types, pattern merge — hepsi deterministik.

## signal_types ataması — prototip vektör yöntemi (karar 2026-09-21)

Kurallı lexicon (kırılgan, recall düşük) ve LLM etiketleme (determinizm kaybı, maliyet) **elendi**. Yöntem:

```text
Her signal type için örnek cümle havuzu (veri dosyasında yaşar, kod değil)
   → örnek cümleler embed'lenir → prototip vektör (ortalama/merkez)
Yeni observation → en yakın prototip + cosine eşik → etiket
```

* **Deterministik** (vektör matematiği), **insansız** (pipeline içinde), tekrar çalıştırılabilir (sadece etiket katmanı).
* **Self-improvement:** yeni bir ifade kalıbı kaçarsa tek yapılacak o kalıba 3-5 örnek cümle eklemek — kod değişikliği değil, veri ekleme; mevcut etiketler ucuzca yeniden koşulur.
* **Zamanlama:** pilot **raw cluster ile** koşar; signal typing pilot'tan ÖNCE yazılmaz. Pilot çıktısındaki "kaçırılmış pain point" kontrolüyle örnek cümle havuzu gerçek veriden doldurulur.
* **Recall kaybı tolere edilir:** etiket eksik olsa bile pain point cluster'ı; isim + keywords + temsili cümlelerle insan gözüne çarpar. Etiket hız konforu, doğruluğun kaynağı değil.
* Observation bazında `text[]` yazılır; pattern seviyesinde tip dağılımı aggregation'dan gelir.

* **keywords:** cluster'ın en ayırt edici terimleri (c-TF-IDF) → `patterns.keywords`. TR karşılık sorgusu bu liste + pattern adından türetilir.

Pattern örneği:

```text
Pattern: "Export özelliği eksikliği"
  23 observations, 4 sources
  signal_types: [complaint, gap]
  keywords: [export, csv, "bulk export", ...]
```

---

# FAZ 10 — Pattern Consolidation

**Kullanılacak:** recluster'ın overlap eşleşmesi (bkz. FAZ 13 — centroid match yerine SQL kesişim) + LLM isimlendirme

* Benzer/bölünen cluster'ların eşleşesi overlap üzerinden `pattern_history`'ye yazılır; eski review_status taşınır.
* Pattern adı/kısa açıklama: **Gemini 3.1 Flash-Lite** (keywords + temsili observation'lar verilir) — yorum katmanı, veri yolunu etkilemez (ilke 5).

---

# FAZ 11 — Timeline / Frequency + Metric Snapshots

**Pattern timeline** (PostgreSQL):

```text
first_seen, last_seen, observation_count, sources  (pattern_observations join'ı)
```

**Trend/gelişme/gerilme iki katmandan gelir:**

1. **Frekans** (view): pattern'a düşen observation sayısının `date_trunc('week', observed_at)` serisi + **4 haftalık moving average** (gürültü bastırma).
2. **Metrik delta** (entity seviyesi) — **pilot sonrasına ertelendi (v3.2):** `metric_snapshots` tablosu — bir varlığın (repo, paket, subreddit, kanal) ölçülebilir değerinin periyodik kaydı:

```sql
create table metric_snapshots (
  id          bigserial primary key,
  entity_type text not null,   -- 'repo' | 'npm_package' | 'subreddit' | 'channel' | ...
  entity_id   text not null,   -- 'vercel/next.js' | 'react' | 'r/SaaS' | ...
  metric      text not null,   -- 'stars' | 'downloads' | 'subscribers' | 'pushed_at' | ...
  value       double precision not null,
  captured_at timestamptz not null default now()
);
create index on metric_snapshots (entity_type, entity_id, metric, captured_at);
```

Pattern ↔ entity eşleşmesi keywords üzerinden; delta sorgusu SQL. "Fışkırma" tespiti: frekansın son haftası moving average'ın **±2σ kontrol şeridini** aşması (basit, parametrik olmayan uyarı).

Not: `first_seen/last_seen` observation'lardan hesaplanır (obs kendi `observed_at`'ini taşır); pattern ID sürekliliği `pattern_history` (FAZ 13 overlap eşleşmesi) ile korunur — timeline recluster'da bozulmaz.

---

# FAZ 12 — UI

**Kullanılacak:** pilot sonrası karar verilecek framework (ertelendi) — pilot incelemesi **review server ile** (`src/review.ts`, bkz. PILOT/Sıra; FAZ 12 framework kararını etkilemez)

Pattern kartı:

```text
Pattern adı + açıklama
signal_types    [complaint, gap]
38 observations | Sources: Reddit, GitHub, HN
First seen May 2026 · Last seen Aug 2026
Trend: ▲ hafif artış (frekans) · npm paketi ↓ geriliyor (metrik)
TR karşılık: ● aktif tartışma / ◐ boşluk (ilgi var, çözüm yok) / ○ yok
```

TR karşılık durumu pattern bazında hesaplanır (FAZ 14 çıktısından).

## İnsan denetimi (kararlar 2026-09-21)

* Sistem kanıt sunar, karar vermez — UI'da filtre/skor yok; tüm pattern'lar listelenir, nötr sıralama (observation_count / kronolojik). Kanıt alanları kartta bilgi olarak durur; eleme aracı değildir.
* Pattern'lere `review_status` kolonu (**değer→anlam eşlemesi sabittir:** review server butonu [BU]→`interesting`, [junk]→`junk`, [seen]→`seen`; başlangıç `unreviewed`). **"Onaylı" = review_status='interesting'.** FAZ 14 tetikleyicinin veri kaynağı budur (TR araması yalnızca onaylıya). v1'de modele geri beslenen feedback loop YOK (pilot verisi olmadan feedback tasarımı spekülasyon).
* **Junk = silme değil, görünürlük kontrolü (v3.2 karar):** junk işaretlenen pattern `status='archived'` olur — DB'de kalır, inceleme listesinde gizlenir, observation'lara dokunulmaz. **Durum ayrımı şarttır:** 'archived' yalnızca **insan junk kararı**dır; recluster'da yerini alan eski pattern'lar 'merged' olur (bkz. FAZ 13) — aksi halde senin onayların recluster çöpüyle karışır. Görünürlük: review server işaretlenmiş pattern'ları rozetle ayrıştırır ("daha önce gördüm / karar verildi")— veri değişmez, geri alınabilir.
* **Temsili observation seçimi — deterministik kural:** centroid'e cosine en yakın 5 + en yeni 3. Kartta gösterilecekler: pattern adı (LLM isimlendirme), keywords, 8 temsili cümle, kaynak/zaman dağılımı. Amaç: insanın "ana fikri ve eksiği" saniyeler içinde görmesi.
* Pilot incelemesi FAZ 12'den BAĞIMSIZDIR: minimal review server (`src/review.ts`) kullanılır (bkz. PILOT/Sıra).

---

# FAZ 13 — Güncelleme

İki modlu strateji (HDBSCAN deterministik değildir; her yeni veride tam reclustering pattern ID'lerini kaydırır):

```text
1) SIK (her günlük koşuda)
   yeni observation → normalize → clean → embed → pgvector
   → mevcut pattern centroid'lerine cosine ile ata (eşik üstü)
   → sayaç/timeline güncelle (HDBSCAN ÇALIŞTIRILMAZ)

2) SEYREK — takvim değil, TETİK bazlı (karar 2026-09-21)
   her günlük koşuda ölç: atanmamış embedded observation oranı
   → oran eşiği aşarsa (örn. > %5) recluster koş; aşmıyorsa koşma
   + güvenlik ağı: X gündür recluster olmadıysa yine de koş
   → tüm embedding'ler → UMAP + HDBSCAN yeniden
   → eski↔yeni eşleşme: OVERLAP (SQL kesişim, ≥%50) — centroid match değil
   → pattern_history'ye kaydet (old→new); eski review_status yeniye taşınır
   → koru / yeni oluştur; eski pattern 'merged' olur (JUNK ≠ bunu — bkz. FAZ 12)
```

Gerekçe: recluster'ın geciktirdiği tek şey **yeni pattern'ın doğması**; mevcut pattern'lara düşen yeni obs günlük centroid assignment ile gecikmesiz eklenir. Haftalık sabit takvim keyfi bekleme demektir → yerine yoğunluk eşiği: sakin dönemde recluster çalışmaz, yeni tema fışkırıp atanmamış havuz şiştiği **o gün** tetiklenir. Eşik pilotla kalibre edilir. HDBSCAN artımlı çalışamadığı için (cluster bölünmesi/birleşmesi ancak tüm veri birlikte görülür) tam recluster gerektiğinde koşan bir bakım işlemidir.

**Pattern ID sürekliliği (karar 2026-09-21):** recluster sonrası eski↔yeni eşleşme **observation-overlap** ile yapılır (SQL kesişim; centroid cosine değil — daha ucuz, debug edilebilir): `pattern_history` tablosu (old→new, oran, tarih). **review_status taşınma kuralı — deterministik ve tek-yönlü:** eşik üstü eşleşen **tek en yüksek oranlı** yeni pattern'a eski `review_status` kopyalanır; diğer eşleşenler (split yan kolları) `pattern_history`'ye kaydedilir ama `unreviewed` kalır (yoksa bölünen cluster'ın iki yarısı da "onaylı" olurdu → aynı onayın iki TR araması). Böylece "BU" onayları recluster'da **kaybolmaz** (FAZ 14 tetiği sağlam kalır) ve timeline observation'lardan hesaplandığından bozulmaz. Eski pattern'ların status'ü **'merged'** olur — 'archived' yalnızca insan junk kararı içindir (bkz. FAZ 12; iki durum karışmasın diye).

TR karşılık araması incremental çalışır ama **yalnızca insan onaylı** pattern'lar için (onaylı = review_status='interesting', bkz. FAZ 12): günlük koşu "onaylı + arama edilmemiş" (counterpart_searches kaydı yok) olanları alır, koşular idempotent (FAZ 14).

**Offline/catch-up semantiği (VPS yok, lokal makine):** Cron yerine resume — her adapter kaldığı imleçten devam eder. Makinenin kapalı olduğu dönemler: Reddit kısa kopuklukları resmî API listing (~1000 post/sub), uzun kopukluk + geçmiş Arctic Shift `after=` ile; GitHub gap-fill GH Archive, SE gap-fill arşiv dump; diğer kaynaklar kendi `after`/sayfalama filtreleriyle doldurulur. **Gap yoktur, yalnızca gecikme vardır** — veri kaybı imleçlerin varlığıyla korunur, tetikleyiciyle değil. Tüm yazımlar idempotent upsert'tir (bkz. Altyapı).

## Çalıştırma modeli (karar 2026-09-21)

```text
Tetik: Windows Task Scheduler "at log on" (+ missed task çalıştır)
  → compose up -d (zaten ayaktaysa no-op)
  → sağlık kontrolü (pg + TEI ayakta mı)
  → collect all → clean → embed → assign
  → recluster: tetik bazlı (atanmamış oran eşiği + güvenlik ağı)
```

* PC kullanımı değişken olduğu için hem logon hem günlük tetik; "kaçırılan görevi çalıştır" açık.
* Verimsiz alternatifler elendi: manuel komut (unutulursa gecikme), long-running worker (PC kapalıyken boşa).

---

# FAZ 14 — TR Karşılık Araması

**Kullanılacak:** Self-host SearXNG (JSON API), Firecrawl (seçili URL zenginleştirme)

## Tetik koşulu (karar 2026-09-21)

TR karşılık araması yalnızca **insan onaylı (kanıtlanmış) pattern'lar** için koşar. Gerekçe: kanıtlanmamış pattern'da arama güvenilmez ve doğrulanamaz — pattern kalitesi (isim, keywords) kalibre edilmeden üretilen TR sorguları düşük kaliteli olur ve yanıltıcı "boşluk" sonuçları üretir.

**Tek komut, çoklu tetik:** hazır komut `pnpm counterpart --pattern <id>`; orchestrator günlük koşusu "onaylı (review_status='interesting') + arama edilmemiş (counterpart_searches kaydı yok)" tüm pattern'lar için bunu sırayla çağırır, review server butonu tek pattern için anında çağırır. Aynı iş, iki tetik noktası — mimari ayrım yok. Koşu idempotent (`counterpart_searches` kaydı). Akış:

```text
pattern oluştu → DEĞİL
insan "BU" onayı verdi → SearXNG sorgusu tetiklenir (hemen veya günlük koşuda)
```

```text
Pattern (name + keywords)
   ↓ sorgu üretimi (kurallı + gerektiğinde LLM çevirisiyle TR anahtar kelimeler)
   ↓ SearXNG /search?q=...&language=tr&format=json  (counterpart_searches'e kaydet)
   ↓ sonuç snippet'leri → observations (source='searxng', language='tr',
                                    metadata.parent_pattern_id=...)
   ↓ aynı normalize → clean → embed → pipeline
   ↓ seçilmiş sonuç URL'leri Firecrawl ile tam sayfa olarak zenginleştirilir
```

**Üç sonuç durumu** (pattern bazında):

| Durum | Anlamı | Sinyal |
| --- | --- | --- |
| TR observation'ları pattern centroid'ine yakın düşüyor | Karşılık **var ve aktif** | Doğrulama |
| TR sonuçlar var ama centroid'e yakın cluster'a düşmüyor | İlgileniliyor ama ürün/çözüm **boşluğu** | En değerli sinyal |
| SearXNG anlamlı sonuç döndürmüyor | TR'de bu sinyalin **karşılığı yok** | Erken/boş alan |

```sql
create table counterpart_searches (
  id           bigserial primary key,
  pattern_id   bigint not null references patterns(id) on delete cascade,
  query        text not null,
  engine       text not null default 'searxng',
  ran_at       timestamptz not null default now(),
  result_count integer not null default 0,
  status       text not null default 'done'
);
create index on counterpart_searches (pattern_id);
```

---

# VERİTABANI ŞEMASI (özet)

```text
raw_observations      ham veri, immutable
observations          normalize + clean + embed (+ signal_types, language, status)
patterns              name, description, centroid, keywords, timeline
pattern_observations  atama geçmişi (run_kind: centroid | recluster)
counterpart_searches  TR arama kaydı (idempotentlik)
metric_snapshots      entity metrikleri (stars, downloads, subscribers, ...)
```

```sql
-- observations (normalize edilmiş)
create table observations (
  id             bigserial primary key,
  source         text not null,
  source_id      text not null,
  source_url     text not null unique,
  title          text,
  text           text not null,
  author         text,
  observed_at    timestamptz,
  collected_at   timestamptz not null default now(),
  language       text,
  metadata       jsonb not null default '{}',
  signal_types   text[] not null default '{}',
  content_hash   text,
  status         text not null default 'new',  -- new|cleaned|embedded|classified|discarded
  embedding      halfvec(1024),                -- Qwen3-Embedding-0.6B
  unique (source, source_id)
);
create index on observations (status);
create index on observations (content_hash);
create index on observations using hnsw (embedding halfvec_cosine_ops);

-- patterns
create table patterns (
  id                bigserial primary key,
  name              text,
  description       text,
  centroid          halfvec(1024),
  keywords          text[] not null default '{}',
  first_seen        timestamptz,
  last_seen         timestamptz,
  observation_count integer not null default 0,
  status            text not null default 'active', -- active|merged|archived
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on patterns using hnsw (centroid halfvec_cosine_ops);

-- pattern atamaları
create table pattern_observations (
  pattern_id     bigint not null references patterns(id) on delete cascade,
  observation_id bigint not null references observations(id) on delete cascade,
  similarity     real,
  assigned_at    timestamptz not null default now(),
  run_kind       text not null,               -- 'centroid' | 'recluster'
  primary key (pattern_id, observation_id)
);
create index on pattern_observations (observation_id);
```

`patterns.sources` kolonu yok — view: `pattern_observations ⋈ observations` distinct source. HDBSCAN ara sonuçları saklanmaz; sonuç pattern'lere yazılır. Not: `observations` HNSW index'i içeride gösterilir fakat **db/schema.sql'de bulk backfill bitene kadar yorum satırındadır** (insert pahalı).

---

# AÇIK TEKNİK SORULAR (v3.1'de kapatılanlar ✓ / kalanlar)

1. ~~**Embedding modeli**~~ **✓ KAPATILDI → Qwen3-Embedding-0.6B** (FAZ 6). MTEB çok dilli clustering 66.83; 3-small elendi. Kalan tek koşul: TR/EN çift pilot testi (FAZ 6 sonundaki prosedür).
2. ~~**Clustering motoru**~~ **✓ KAPATILDI → BERTopic** (FAZ 8). `partial_fit`/online mod elendi (noise üretmez + centroid yaklaşımıyla çelişir); seyrek recluster + bizim centroid katmanı.
3. **Dil ayrışması — GÜVENİLMEZ, ölçülmeden üretime geçilmez (v3.2 netleşme):** Pilot ana akışı TR içerik barındırmaz (Reddit/HN ~tam EN); bu sorunun cevabı pilot probe'undan ÇIKMAZ. **TR/EN çift pilot testi ayrı mini test olarak FAZ 14 ÖNCESİ koşulur:** ~50 elle seçilmiş çift (aynı şikâyetin iki dilde ifade edilişi) → Qwen3 embedding centroid benzerlik ölçümü (~1 saat iş). Bu bir hipotez doğrulaması değil, **zorunlu ölçüm** — sonucu bilinmiyor ve Qwen3'ün MTEB skoru burada kanıt değildir (benchmark ≠ bizim corpus). Eşik altı çıkarsa: dil bazlı sahte cluster riski gerçektir → yedek model (Gemini Embedding 68.37 / Cohere embed-v4) kararı o ölçüme dayanır. Cluster içi dil dağılımı kontrolü FAZ 14 koşularında sürekli izlenir.
4. ~~**Trend frekansı gürültüsü**~~ **✓ KAPATILDI** → 4 haftalık moving average + ±2σ kontrol şeridi (FAZ 11).
5. **SearXNG self-host verimliliği:** Upstream motor bot korumaları uzun koşuda block riski. Önlem: önce DDG/Brave/Qwant motorları (Google/Bing'e göre toleranslı), nazik hız, motor çeşitliliği.
6. ~~**Arctic Shift bağımlılığı**~~ **✓ KAPATILDI** → backfill dump dosyasıyla (tek seferlik, lokal), API yalnızca incremental/enrich. Ek: API "no uptime guarantee" + makine offline dönemlerinde Arctic Shift `after=` catch-up olarak kullanılır (bkz. FAZ 13).
7. **BERTopic outlier oranı:** Backfill sonrası ilk recluster'da noise oranı ölçülecek; >%40 ise `min_samples`/`reduce_outliers` kalibrasyonu gerekir. (Pilot çıktısıyla kapanacak.)
8. **Recluster tetik eşiği:** atanmamış embedded observation oranı eşiği (başlangıç önerisi %5) + güvenlik ağı gün sayısı — pilot verisiyle kalibre edilir (bkz. FAZ 13).

---

# PROJE İLKELERİ (grill oturumu, 2026-09-21 — kararların tek adresi)

1. **Sistem karar vermez, kanıt sunar.** Filtre, skor, ağırlık yok — bunlar sinyalleri sessizce kaybeder. İnsan denetimi tam listeyi görür; doğruluk kaybının tek kaynağı veri işleme hatalarıdır (dup, yanlış embed, bozuk normalize) ve orada %100 deterministik gidilir.
2. **plan.md sözleşme değil, başlangıç hipotezidir.** Her karar kendi başına başarı oranına göre tartışılır; doküman çelişirse doküman değişir, karar değil.
3. **Hedef insansız, self-improving pipeline.** Rutin insan müdahalesi (elle doğrulama, lexicon güncellemesi kod olarak) tasarım hatasıdır. Self-improvement = veri ekleme (örn. signal typing örnek cümleleri), kod değişikliği değil.
4. **Pain point ifade kalıbında değil, anlamdadır; pattern seviyesinde ortaya çıkar.** (bkz. FAZ 9)
5. **LLM yalnızca yorum katmanında** (isim, açıklama, TR keyword, özet); veri yolunda (silme, cluster üyeliği, merge kararı) asla.
6. **Tetik bazlı çalışma, keyfi takvim yok** (recluster eşiği; çalıştırma logon+catch-up).
7. **Gap yoktur, yalnızca gecikme vardır** — veri bütünlüğü imleçlerle (catch-up) korunur; legal API/arşiv kaynakları üzerinden, scraper/proxy yok.

---

# PILOT (karar 2026-09-21)

## Ölçek ve kaynaklar

* **~50k obs**: config'teki 10 subreddit + HN (kural/eşik yok — seçim kuralı kendisi filtre olur ve sinyal kaybettirir; liste elle genişletilebilir config'dir). Bütçe eşit bölünmez: küçük sub'lar tümünü verir, 50k dolana kadar zaman sırasıyla doldurulur.
* **Güncellik — orta-yakın pencere (v3.2 karar):** backfill tabanı **son 18 ay**. "Yıl" ölçeğinde bayat data gerekmez; trend tespiti için de 18 ay taban çizgisi yeterli (±2σ şeridi kalibrasyonu).
* **Geçmiş destek modu (istisnai):** yakın zamanda bir "olasılık" bulunup "yeterlilik" eksik görülürse, ek bir yapı ile daha derin geçmişten data toplanır — bu data **geçici** tutulur (olasılığı desteklemek amaçlı, kalıcı corpus'a karışmaz). Uygulama: hazır komut `pnpm deepen --pattern <id> --months N` (tetikleme: elle veya review server butonundan — ikisi de aynı komutu çağırır). Depolama: aynı `observations` tablosu + `metadata.deep_dive_for=pattern_id`; temizlik: `pnpm deepen prune`. Sorgu: Arctic Shift keyword araması pattern keywords'ü üzerinden.
* Tek kaynağa inmemek için: "aynı pain point'in farklı kaynaklarda tekrarı" davranışı projenin merkezi iddiasıdır.

## Başarı kriteri: gerçek pain point yakalama (insan denetimi)

Sayısal eşik değil — **inceleme protokolü**, kullanıcı tek hakem:

* **Birim:** pattern kartı (isim + keywords + signal_types + 8 temsili observation + kaynak/zaman dağılımı) — pilot aynı zamanda insan denetim ekranının prototip testi.
* **Karar:** pattern başına ikili soru: "Bu, incelemeye değer somut bir problem/gap mi?" ("BU" işaretlemeleri LOG'a yazılır.)
* **Geçersiz sayılanlar:** jenerik dert yanma (aksiyonsuz), cluster artefaktı (keyword çorbası, meme/mod postu), tek kişilik anekdot (sistematiksiz tek ürün bug'ı).
* **Tanı tablosu:** 0-2 değerli → signal typing/clustering kalitesi; cluster'lar subreddit artefaktıysa → cleaning; değerliler tek kaynaktaysa → cross-source normalizasyon.
* Eşik sayıları (örn. "ilk 20 pattern'den kaçını işaretledim") pilot çıktısıyla konuşulur; kriter güncel veri değil geçmiş backtest'tir — **güncellik pilot için önemli değildir**.

## Sıra (pilot koşumu ve sonrası)

1. **Pilot koşumu:** 3060 kurulumu → collect (10 sub + HN, 18 ay) → clean → embed → recluster. Signal typing pilot'tan ÖNCE yazılmaz.
2. **Review server devreye al** (`src/review.ts`) — inceleme aracı pilot koşumundan sonra hemen gerekir.
3. **İnsan denetimi ("BU" işaretlemeleri)** → LOG'a kaydedilir.
4. **Eşik kalibrasyonları** (recluster tetik, centroid similarity, outlier oranı) pilot çıktısıyla elle yapılır.
5. **"Kaçırılmış pain point" kontrolü** → signal typing örnek cümle havuzu gerçek veriden doldurulur.
6. **TR/EN çift mini testi** — pilot'tan sonra, FAZ 14'ten önce ayrı koşulur (bkz. FAZ 6 + Açık Soru 3). Eşik altı → yedek embedding modeli kararı. bu test geçilmeden FAZ 14 yazılmaz.
7. **Sonraki katmanlar:** SearXNG adapter (yalnızca onaylı pattern'larla) → metrik kaynakları → Reddit live adapter (OAuth onay geldiyse) → GH Archive/SE dump backfill adapter'ları → UI (framework kararı bu noktada).

---

# ALTYAPI VE DONANIM (lokal, tek makine)

**Karar: VPS yok. Tek Windows makine + RTX 3060 (12GB VRAM).** Sürekli bulut maliyeti $0.

## Kapasite (3060 üzerinde)

| İş | Kaynak | Süre |
| --- | --- | --- |
| Qwen3-0.6B embedding | ~1.5GB VRAM, ~100-300 obs/sn | günlük 50k obs < 10 dk; 1.5M post backfill ~2-5 saat |
| Yorumlar dahil ~10M obs (opsiyonel) | aynı | ~1-2 gün arka plan |
| UMAP + HDBSCAN (BERTopic) | CPU (çekirdek sayısı) | 100k-1M nokta: dakikalar-saat |
| PostgreSQL + pgvector | RAM 16GB ideal | 1.5-2M obs ≈ 30-60GB disk (18 ay tabanıyla tipik olarak daha küçük) |
| SearXNG + poller'lar | önemsiz | — |

Yorum katmanı notu: post'lar observation olur; yorumlar pattern zenginleştirme/retrieval olarak tutulursa backfill ~10x küçülür (önerilen ilk yol).

## Kurulum şeması

```text
Windows
└── WSL2 + Docker Desktop (GPU destekli)
    ├── postgres:pgvector          (port 5432)
    ├── TEI (text-embeddings-inference) + Qwen3-Embedding-0.6B  (GPU, port 8080)
    ├── searxng                    (JSON format açık, limiter ayarlı)
    └── python (BERTopic env — versiyon sabit, UMAP/HDBSCAN build sorunlarına karşı)
└── Windows tarafı
    ├── TypeScript adapter'lar (toplama)
    ├── minimal review server (`src/review.ts` — pilot inceleme aracı)
    └── UI (framework kararı pilot sonrası)
```

## Uptime semantiği: catch-up, cron değil

Makine sürekli açık olmayacak → her adapter **resume/catch-up** tasarlanır:

* Reddit: kısa kopukluklar resmî API listing (~1000 post/sub), uzun kopukluk + geçmiş Arctic Shift `after=` ile (36 saat gecikmeli arşiv = bedava catch-up kaynağı).
* GitHub gap-fill: GH Archive saatlik dump'ları (`after` yerine tarih-saat dosyası seçimi).
* HN/Stack Exchange/YouTube: `after` / `created:` / sayfalama imleci ile son bırakılan yerden devam (SE derin gap için arşiv dump).
* Her şey idempotent upsert (unique source+source_id) → tekrar çalıştırma güvenli.
* TR coğrafi avantajı: SearXNG TR sonuçları lokal TR IP'sinden doğal doğru alınır (VPS'te yurt dışı IP sorunu olurdu).

---

# Teknoloji Özeti

| Alan | Teknoloji |
| --- | --- |
| Backend | TypeScript / Node.js |
| Frontend | Pilot incelemesi: review server (`src/review.ts`, frameworksüz); gerçek UI framework kararı pilot sonrası (ertelendi) |
| Database | PostgreSQL + pgvector |
| Vector | halfvec(1024), HNSW |
| Embedding | Qwen3-Embedding-0.6B (self-host, TEI, RTX 3060) |
| Clustering | BERTopic (UMAP + HDBSCAN + c-TF-IDF) |
| Pattern naming | Gemini 3.1 Flash-Lite |
| Reddit backfill + gap-fill | Arctic Shift (dump + API) |
| Reddit live | Resmî Reddit API (OAuth) — scraper iptal |
| GitHub backfill | GH Archive (gharchive.org) |
| Stack Exchange backfill | SE Data Dump (archive.org) |
| Signal typing | Prototip vektör (örnek cümle embedding'leri + cosine eşik) |
| Tetikleme | Task Scheduler logon + catch-up imleçleri; recluster tetik bazlı |
| TR arama | SearXNG (self-host, JSON) |
| Scraping | Apify |
| Web fallback | Firecrawl |
| Son çare | Playwright / Crawlee |
| Çalıştırma | Lokal tek makine, WSL2 + Docker (GPU) |

## Kapsam Dışı

* Scoring, opportunity engine, market analysis
* Startup idea generation, market size, willingness-to-pay, founder-fit
* Fikir üretme (amaç sinyal bulmak; yorum kullanıcıya kalıyor)

## v3.1'de Değişenler (v3'e göre — araştırma sonuçları)

1. **Embedding modeli kesinleşti:** `text-embedding-3-small` → **Qwen3-Embedding-0.6B** (self-host). Gerekçe: MTEB çok dilli clustering 66.83 vs OpenAI-3-large 60.27; TR kritik dil, 3-small çok dilli benchmark'ta kanıtsız. Vektör boyutu 1536 → **halfvec(1024)**.
2. **Clustering motoru kesinleşti:** elle kurulum → **BERTopic**. `partial_fit` online mod değerlendirildi ve elendi (k-Means noise üretmez, centroid yaklaşımıyla çelişir; BERTopic'in önerisi de `merge_models` yönünde).
3. **Donanım/altyapı kesinleşti:** VPS yok; **tek Windows makine + RTX 3060**, WSL2 + Docker (GPU), TEI ile lokal embedding. Catch-up semantiği (cron değil resume) tanımlandı; Arctic Shift `after=` offline dönem doldurucusu.
4. **Trend gürültüsü çözüldü:** 4 haftalık moving average + ±2σ kontrol şeridi (FAZ 11).
5. **BERTopic pratikleri plana gömüldü:** preprocessing yok, stopword'ler CountVectorizer'da, `calculate_probabilities=False`, outlier stratejisi, Python ortamı Docker'da sabit (HDBSCAN/UMAP build riski).
6. Yeni açık soru: **BERTopic outlier oranı** (pilot çıktısıyla kapanacak); geri kalanlar ölçülebilir pilot koşullarına bağlandı.

## v3.2'de Değişenler (v3.1'e göre — grill oturumu kararları, 2026-09-21)

Detaylı gerekçeler "Proje İlkeleri" bölümünde; FAZ metinlerine gömüldü:

1. **Reddit scraper iptal** → canlı uç resmî Reddit API (OAuth); gap + geçmiş Arctic Shift. Proxy/ban/CSV karmaşası ortadan kalktı, tek Reddit bağımlılık ailesi.
2. **Backfill arşivlere taşındı:** GitHub → GH Archive; Stack Exchange → SE Data Dump. Backfill = arşiv, live = resmî API iki katmanlı adapter mimarisi. Tek key'li kaynak: YouTube (ücretsiz).
3. **Signal typing yeniden tasarlandı:** kurallı lexicon elendi → **prototip vektör** yöntemi (deterministik, insansız, veri-ekleyerek self-improvement). Pilot'tan önce yazılmaz.
4. **Filtre/skor/ağırlık yok** — sistem kanıt sunar, karar VERMEZ (ilke 1); FAZ 12'ye review_status + deterministik temsili seçim (en yakın 5 + en yeni 3) eklendi.
5. **Recluster tetik bazlı:** haftalık takvim → atanmamış observation oranı eşiği + güvenlik ağı.
6. **Çalıştırma modeli:** Task Scheduler logon tetiği + catch-up imleçleri; compose up + sağlık kontrolü içeren orchestrator script.
7. **Pilot bölümü eklendi:** 50k obs (10 sub + HN, 18 ay taban), başarı kriteri = insan denetiminde gerçek pain point yakalama; pilot raw cluster ile koşar; inceleme minimal review server ile.
8. **LLM sınırı:** yalnızca yorum katmanı; veri yolunda determinizm zorunlu.
9. **Sıralamalar netleşti:** UI framework kararı pilot sonrasına; metrik kaynakları pilot sonrasına; SearXNG adapter yalnızca insan onaylı pattern'lar için.
10. **Pattern ID sürekliliği:** `pattern_history` + observation-overlap eşleşme (SQL kesişim, ≥%50); review_status yalnızca en yüksek oranlı yeni pattern'a taşınır (split çift-onay sorununu önler). Durum ayrımı: recluster üstlenilen = 'merged', insan junk = 'archived'.
11. **TR/EN test zamanlaması tekelleşti:** pilot ana akışından çıkarıldı → pilot sonrası, FAZ 14 öncesi ayrı mini test; güvenilmez-ölçülmemiş statüsüyle belgelendi.
12. **Reddit OAuth onay şartı dokümante** (Responsible Builder Policy, 2-4 hafta) — app kaydı pilotla paralel.
13. **Review server tek komut çoklu tetik** (`pnpm counterpart --pattern <id>`; orchestrator + buton aynı komutu çağırır).
14. **Backfill tabanı son 18 ay** (`BACKFILL_SINCE` config'te çekildi); derin geçmiş yalnızca `pnpm deepen` geçici modu.
15. **Bilinen sınırlama FAZ 2'ye eklendi:** HN/GitHub live sorgu-seeded toplama = örtülü filtre; kabul edilen sınır, arşiv kaynaklarıyla dengelemek.
