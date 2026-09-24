# StartupHunt — Geliştirme Logu

> Kural: her anlamlı adım buraya yazılır — tarih, ne yapıldı, sonuç, sonraki adım.

---
---

## 2026-09-23 — Oturum 13: CodeRabbit bulguları (mevcut PR'ler güncellendi; yeni PR AÇILMADI)

### Ortak taban (PR #3 orchestrator'ına işlendi — collect zincirinin çalıştırıcısı)
- config 18 takvim ayı · cli `--` · HN search_by_date + terim-başı imleç · GH sorgu/topic-imleçleri · reddit-backfill sub-imleç + sayfa boyutu · incremental dry-run guard · compose loopback + TEI 86-1.8.2 · searxng default_lang · env URL'ler · KURULUM/API-RAPOR/AGENTS/plan dok düzeltmeleri
- Round2: schema MA4 range-28-gün penceresi; KURULUM çift cp; reddit-backfill `after+1s` iptali; (PR#6) recluster embedded_noise yeniden değerlendirme + min_df sabit 1; (PR#7) LOG garbled fix

### Süreç notu
- **Yeni PR açmak yerine mevcut PR'ler güncellendi** (geçici 8. PR kapatılıp silindi); PR-özel fiksler kendi branchlarına işlendi (#4 #5 #6 #7)
- Merge akışı: main push + remote'taki eski Python "phase2" baseline merge (legacy korundu) → PR #3, #2 birleşti → kalan PR'ler sırayla rebase+merge

### SKIP + gerekçe
1. embed.ts 4xx terminal status (`embed_failed`) — status kontratına değer ekler; pilot-sonrası
2. SearXNG unresponsive_engines parsiyelliği — v0.1 için overengineering
3. settings.yml secret_key değişimi — loopback bind yeterli

---

## 2026-09-23 — Oturum 12: assign.py — psycopg placeholder fix (fix/assign-psycopg-placeholders branch, PR)

### 22) `cluster/assign.py` — `$1`-tarzı placeholder'lar psycopg3'te çalışmıyor → `%s`
- Değiştirilen noktalar: pattern_observations insert ($1,$2,$3) ve observation_count/last_seen update ($1 ×3)
- python -m py_compile temiz; DB davranışı 3060'a bekleme
- Aynı hata sınıfının numaralandırıcısı: recluster.py PR #6'da giderildi; assign.py bu PR'da — artık $placeholder kalmadı (grep doğrulandı)

---

## 2026-09-23 — Oturum 11: recluster.py — pattern ID sürekliliği (fix/recluster-pattern-history branch, PR)

### 21) `cluster/recluster.py` v0.2 — v3.2 karar işleme (py_compile ✓; DB testi 3060'ta)
- **Düzeltme (kritik eski davranış):** `update patterns set status='archived'` → `'merged'` — insan junk ile recluster üstlenilmesi artık karışmaz (FAZ 12/13 durum ayrımı)
- **pattern_history yazımı:** her eski aktif pattern için en yüksek ortak-obs oranlı yeni pattern'a eşleşme kaydı (SQL kesişim yerine bellekte set kesişimi — aynı matematik, ücretsiz debug); eşik OVERLAP_MIN=0.50
- **review_status taşınma:** yalnızca matched (≥%50) + hedef halen `unreviewed` ise; `status='active'` birlikte set edilir. Deterministik: sabit old-id sırası, tek yönlü
- timeline doldurma sorgusu korundu (obs'tan min/max) — FAZ 11 notuyla uyumlu
- Fark edildi ve giderildi: eski koddaki `values ($1,...)` placeholder kullanımı psycopg3'te çalışmazdı (%s gerekir) — ilk gerçek run öncesi vitese kondu
- 3060'a bekleme: gerçek DB'de çalışma, overlap sayıları, transfer davranışı

---

## 2026-09-23 — Oturum 10: deepen — geçmiş destek modu (feat/deepen branch, PR)

### 20) `src/deepen.ts` — `pnpm deepen --pattern <id> --months N [--dry-run]` + `pnpm deepen prune`
- Amaç (plan PILOT / Geçmiş destek modu): "olasılık / yeterlilik eksik" pattern için BACKFILL_SINCE'ten **N ay geriye** geçici toplanma
- Sub kapsamı deterministik: pattern'in kendi observation'larında görülen subreddit'ler; hiç yoksa config'teki 10 sub
- Sorgu: Arctic Shift `title=` araması, top-3 keywords; pencere `[BACKFILL_SINCE-months → BACKFILL_SINCE)` — kalıcı corpus dışı
- **Geçicilik garantisi:** obs'ler `metadata.deep_dive_for=pattern_id` işaretli; `pnpm deepen prune` obs+raw'ı çift siler
- İmleç/sayfalama: asc + cursor=son created_utc; oturum güvenlik tavanı MAX 2000 obs; idempotent upsert
- typecheck ✓; smoke: arg parse→pipeline'a kadar akış, DB yok ECONNREFUSED düzgün duruş — DB/Arctic Shift zinciri 3060'ta

---

## 2026-09-21 — Oturum 5: grill oturumu — plan v3.2 kararları

Grill oturumuyla v3.1'in hipotezleri tek tek sınandı; **plan.md → v3.2** güncellendi
("Proje İlkeleri" ve "Pilot" bölümleri eklendi). Kararlar:

### Felsefe
- Sistem karar vermez, **kanıt sunar** — filtre/skor/ağırlık yok; insan tam listeyi görür, karar insanda
- plan.md sözleşme değil hipotez; her karar bağımsız başarı oranına göre tartışılır
- Hedef **insansız, self-improving pipeline**; self-improvement = veri ekleme (kod değişikliği değil)

### Kaynak mimarisi
- **Reddit-universal-scraper İPTAL** → canlı uç resmî Reddit API (OAuth, ~1000 post listing) + Arctic Shift (backfill + uzun gap)
- **GitHub backfill → GH Archive** (gharchive.org, saatlik event dump, 2011+)
- **SE backfill → SE Data Dump** (archive.org, üç aylık)
- İki katman: backfill = arşiv, live = resmî API. Tek key'li kaynak: YouTube (ücretsiz)
- İlke: **gap yok, sadece gecikme** — veri bütünlüğü imleçlerle korunur; scraper/proxy yok

### Pipeline davranışı
- **Signal typing:** kurallı lexicon elendi (kırılgan, düşük recall) → **prototip vektör** yöntemi (örnek cümle embedding'leri + cosine eşik; deterministik, insansız). Pilot'tan ÖNCE yazılmaz; pilot raw cluster ile koşar
- Temel bulgu: pain point **ifade kalıbında değil anlamdadır**; observation seviyesinde değil **pattern seviyesinde** ortaya çıkar
- **Recluster tetik bazlı:** haftalık takvim → atanmamış embedded obs oranı eşiği (örn. >%5) + güvenlik ağı; HDBSCAN artımlı çalışamadığı için tam recluster bakım işlemidir
- **Çalıştırma:** Task Scheduler logon tetiği + catch-up imleçleri; orchestrator script (compose up → sağlık → collect → clean → embed → assign)
- LLM yalnızca yorum katmanında (isim/açıklama/TR keyword/özet); veri yolunda asla

### İnsan denetimi / UI
- FAZ 12'ye `review_status` (seen/interesting/junk) — v1'de feedback loop yok
- Temsili observation seçimi deterministik: centroid'e en yakın 5 + en yeni 3
- **UI framework kararı (Next.js dahil) pilot sonrasına ertelendi**
- Pilot inceleme aracı: **minimal review server** (`src/review.ts`, ~150 satır, frameworksüz) — statik rapor + TSV roundtrip fikri İPTAL (3 artefakt senkron yükü); `pnpm review` → localhost kartlar + [BU]/[junk]/[seen] → doğrudan DB'ye UPDATE. Bu UI değil, inceleme aracıdır
- **Recluster ID sürekliliği (grill kararı 2026-09-21):** recluster sonrası `pattern_history` tablosuna overlap eşleşme (SQL kesişim, ≥%50) yazılır; eski pattern'ın `review_status`'ü yeniye taşınır; "BU" onayları ve TR arama sürekliliği korunur. Centroid match yerine observation-overlap — deterministik, SQL-only. Şemaya `pattern_history` eklendi; `recluster.py` v0.2 implementasyonu
- `review_status` kolonu `db/schema.sql`'e eklendi — varlık gerekçesi **FAZ 14 tetikleyicisi** (TR araması yalnızca onaylı pattern'lara); pilot verdict kaydı yan fayda, v1'de pipeline'a etkisi yok

### Pilot
- **Ölçek:** ~50k obs — config'teki 10 sub + HN (sub seçim kuralı/eşiği YOK — kural kendisi filtre olur, sinyal kaybettirir; feedback gerçek veriyle yapılır: "BU"lar hangi sub'dan geldiyse zenginleştir)
- **Güncellik kararı:** backfill tabanı 2020+ → **son 18 ay** (orta-yakın pencere; ±2σ taban çizgisi için yeterli). Geçmiş destek modu: olasılık bulunup yeterlilik eksikse derin geçmiş **geçici** toplanır
- **Başarı kriteri:** insan denetiminde gerçek pain point yakalama (sayısal eşik değil); güncellik önemli değil (backtest)
- **Metrik kaynakları (FAZ 11) pilot sonrasına ertelendi** — pattern keywords bağımlılığı
- **SearXNG pilot'ta sadece altyapı doğrulaması** (compose + JSON test); adapter pilot sonrası
- **TR karşılık araması YALNIZCA insan onaylı ("BU") pattern'lar için koşar** — kanıtlanmamış pattern'da arama güvenilmez ve doğrulanamaz. Tek komut çoklu tetik: `pnpm counterpart --pattern <id>`; orchestrator günlük sıra halinde çağırır, review server butonu anında çağırır; idempotent
- **Junk = archived, silme değil:** görünürlük kontrolü; review server'da rozetle ayrıştırma ("daha önce gördüm / karar verildi") — veri değişmez, geri alınabilir
- `BACKFILL_SINCE` config'i 18 ay penceresine çekildi (`src/config.ts`)
- **Geçmiş destek modu somutlaştı:** `pnpm deepen --pattern <id> --months N` hazır komutu (tetik: elle veya review server butonu — aynı komut); depolama `observations.metadata.deep_dive_for`, temizlik `pnpm prune-deep-dive`

### Sonraki adım önerisi
1. **Reddit OAuth şimdi başlat** (pilotla paralel): app kaydı + access talebi — Haziran 2026 Responsible Builder Policy gereği onay 2-4 hafta sürebilir; kota (100 QPM OAuth) iş yükümüz için fazlasıyla yeterli, ücretsiz
2. 3060'ta Docker + compose up → 3 doğrulama (KURULUM.md) → pilot: `collect reddit-backfill --limit 50000` + HN → clean → embed → recluster → review server ile inceleme (recluster artık tetik bazlı — haftalık takvim yok)
3. YouTube key `.env` (tek seferlik kayıt); GitHub/SE backfill arşivden (token şart değil)
4. Pilot çıktısı: "BU" işaretlemeleri + kalibrasyon ölçümleri LOG'a yazılır
5. Pilot sonrası sıra: Reddit live adapter (onay geldiyse) → GH Archive/SE dump backfill adapter'ları → signal typing prototip havuzu → statik işler

### Dil ayrışması statüsü (grill kararı)
- **TR/EN centroid benzerliği GÜVENİLMEZ** — pilot ana akışı TR içerik barındırmaz (Reddit/HN ~tam EN); ölçüm pilot'tan çıkamaz
- **Ayrı mini test FAZ 14 ÖNCESİ koşulur:** ~50 elle seçilmiş TR/EN çift → Qwen3 benzerlik ölçümü (~1 saat). Hipotez doğrulama değil, zorunlu ölçüm — MTEB skoru kanıt değildir (benchmark ≠ bizim corpus)
- FAZ 14 (TR karşılık araması) bu test geçilmeden yazılmaz; eşik altı → yedek embedding modeli değerlendirilir (Gemini/Cohere)

## 2026-09-21 — Oturum 5b: bütünlük denetimi (grill kapanışı)

Doküman uçtan uca okundu; 9 yapısal çelişki saptanıp giderildi (plan.md v3.2):

1. Başlık v3.1→v3.2; **TAM AKIŞ şeması yeniden yazıldı** (scraper çıkarıldı; centroid assignment + tetik recluster + signal typing (pilot sonrası) + review server + onay-yalnız-TR katmanları eklendi; metrik pilot sonrası etiketi)
2. FAZ 2 adapter listesi "2020+" → **son 18 ay** (BACKFILL_SINCE ile uyum)
3. **TR/EN test zamanlaması tekelleşti:** FAZ 6 "FAZ 8'e girişte" ifadesi ve FAZ 8 referansı güncellendi → tek konum: pilot sonrası, FAZ 14 öncesi ayrı mini test
4. FAZ 12 + Teknoloji Özeti'nde kalan **eski "statik raporla" notları kaldırıldı** (review server ile değiştirildi)
5. **FAZ 13/FAZ 10 eşleşme mantığı:** "centroid eşikli eşleştir" → **overlap eşleşme (SQL kesişim ≥%50) + pattern_history + review_status taşınması**
6. FAZ 13 TR incremental satırı: "yeni/güncellenen pattern'lar" → **"yalnızca insan onaylı"**
7. **'archived' durum çatışması çözüldü:** recluster üstlenilen eski pattern = **'merged'**; insan junk = **'archived'** (schema + FAZ 12/13 senkronlandı) — yoksa recluster her koşunda insan onayları/junk'lar aynı durumda kaybolurdu
8. PILOT/Sıra numaralandırması düzeltildi (çift "3." item; review server doğru konuma: koşum→inceleme→kalibrasyon→TR/EN test→sonraki katmanlar)
9. FAZ 11 metrik bölümüne **"pilot sonrasına ertelendi"** etiketi işlendi; şema özet notu HNSW index'in backfill'e kadar kapalı olduğunu açıkça belirtiyor

Ek sınırlama belgelendi: HN/GitHub live adapter'lar **sorgu-seeded** (örtülü filtre) — "seçim kuralı yok" ilkesiyle bilinen gerilim; sorgu listesi config'tir, arşiv kaynaklarıyla dengelenir. Pilot'ta izlenir.

### Kullanılabilirlik / kırılganlık düzeltmeleri (aynı oturum)
- `src/cli.ts`: `reddit-incremental` **OPT_IN** (collect all'a dahil değil) — scrapere-dayalı adapter'ın orchestrator'da sessizce koşmasına karşı
- `.env.example`: scraper CSV var silindi → `REDDIT_CLIENT_ID/SECRET` (v3.2 live) eklendi
- `KURULUM.md`: "haftalık/aylık tekrar" kalıntısı kaldırıldı → tetik bazlı recluster
- `src/adapters/reddit-backfill.ts` yorumu "2020+" → "son 18 ay"

Sonuç: çelişki kalmadı; sistem bir bütün olarak tutarlı. Sıradaki gerçek adım: pilot koşumu (3060 kurulumu).

---

## 2026-09-11 — Oturum 1: plan v3.1 + altyapı + adapter başlangıcı

### 1) Plan ve araştırma (tamamlandı)
- plan.md → **v3.1** yazıldı (sinyal radarı yeniden çerçeveleme, Arctic Shift, BERTopic, Qwen3-0.6B, halfvec(1024), altyapı bölümü, catch-up semantiği)
- API-ERISIM-RAPORU.md güncellendi: Reddit artık scraper/Arctic Shift kararıyla; ayrıca doğrulama yapıldı (tüm limitler birincil kaynaklardan teyitli).

### 2) Altyapı dosyaları (tamamlandı — 3060 cihazında çalışacak)
- `docker-compose.yml` — postgres(pgvector/pg16) + TEI 1.8.0 (Qwen3-Embedding-0.6B, GPU) + SearXNG
- `db/schema.sql` — 5 tablo (raw_observations, observations, patterns, pattern_observations, metric_snapshots, counterpart_searches) + 2 view (v_pattern_sources, v_pattern_frequency MA4)
  - Karar: HNSW index'leri bulk backfill bitene kadar yorum satırında
- `searxng/settings.yml` — JSON format açık, language=tr, limiter kapalı, toleranslı motorlar (ddg/brave/qwant önce)
- `.env.example`, `.gitignore` düzeltildi (md'ler artık dahil; .env/data/cache'ler hariç), `KURULUM.md`

### 3) Donanım keşfi (sonuç)
- Geliştirme makinesi: HUAWEI laptop, Ryzen 5 5500U, 8GB RAM, AMD iGPU, WSL distro yok, Docker yok
- Çalıştırma cihazı: NVIDIA 3060'lı PC (kullanıcı kuruyor) → docker-compose orada ayağa kalkacak

### 4) FAZ 2 başlangıcı — TypeScript toplama katmanı (TAMAMLANDI)

- [x] package.json + tsconfig + `pnpm install` (node 22.23.2, pnpm 11.5.2; tsx, pg, csv-parse, dotenv)
- [x] `src/types.ts` — Adapter kontratı (collect(since, opts)), Raw/Normalized tipler
- [x] `src/config.ts` — env + subreddit listesi (10 sub) + BACKFILL_SINCE=2020 + Arctic Shift disiplin parametreleri (1s sayfa gecikmesi, 429'da X-RateLimit-Reset'e uyma, 3 retry)
- [x] `src/db.ts` — pg pool; idempotent upsert'ler (raw: on conflict do nothing; normalized: aynı) + FNV-1a contentHash (pilot için; SHA-256 sonra gerekirse)
- [x] `src/adapters/reddit-backfill.ts` — Arctic Shift `/api/posts/search` sayfalama (`sort=asc`, imleç=son postun created_utc+1s), nsfw/removed flag'leme, crosspost source_url çakışması toleransı, oturum limiti
- [x] `src/adapters/reddit-incremental.ts` — scraper CSV (data/r_*posts.csv) → imleç state dosyası (data/.processed.json: dosya→satır sayısı; append-only CSV varsayımı) → upsert. Yorum CSV'si bilinçli olarak sonra (plan: post önce, yorum zenginleştirme)
- [x] `src/cli.ts` — `npm run collect [adapter] [-- --dry-run] [-- --limit N]`
- [x] `pnpm typecheck` — temiz (TS strict + noUncheckedIndexedAccess)
- [x] **Canlı dry-run testi:** `--dry-run --limit 1000` → r/SaaS 2020'den itibaren 1000 post sorunsuz çekildi; 429/timeout yok; sayfa başına 100 post imleci doğru ilerledi

Bilinen eksikler / bilinçli erteleme:
- contentHash FNV-1a → çakışma riski düşük ama istenirse SHA-256'e geçilir
- backfill adapter'da `since` parametresi dışarıdan verilmiyor (BACKFILL_SINCE sabit) — CLI'a `--since` eklenmeli (catch-up için, v0.2)
- incremental adapter yorum CSV'lerini okumuyor (plan gereği)
- DB'ye gerçek yazma testi 3060 cihazı Postgres ayağa kalkınca yapılacak (upsert + unique çakışma davranışı)

---

## 2026-09-11 — Oturum 2: adapter'lar 4/6 + dil tespiti + adapter_state

### 5) Şema: adapter_state tablosu (plan FAZ 13 catch-up semantiği için)
- `db/schema.sql` → `adapter_state (name pk, last_run_at, last_success_at, last_cursor jsonb, counters jsonb)`
- `src/db.ts` → `loadAdapterState/saveAdapterState` — imleç DB'de yaşar, adapter bunu okur/yazar

### 6) Adapter 3: HackerNewsAdapter (`src/adapters/hackernews.ts`) — CANLI TEST ✓
- Algolia `/api/v1/search`, `tags=(story,comment)`, `numericFilters=created_at_i>imleç`, 100/sayfa, 700ms gecikme
- 7 sorgu terimi (SaaS, startup, Show HN, Ask HN...), story→title / comment→comment_text normalize
- `--dry-run --limit 300` → "SaaS" terimi 2020'den itibaren sorunsuz çekildi, limitte düzgün durdu
- Dry-run state: DB yokken bellek içi (makeStateStore) — her adapter'da aynı desen

### 7) Adapter 4: GitHubAdapter (`src/adapters/github.ts`) — CANLI TEST ✓
- `search/issues` (4 şikâyet/gap sorgusu) + `search/repositories` (5 topic, `created:>imleç` → launch sinyali)
- Rate disiplini: 2.2s/sayfa (search secondary ~30/dk), 403/429'da `retry-after`/`x-ratelimit-reset`'e uyma
- Anonim çağrı (GITHUB_TOKEN boşken 10 req/dk search — backfill token şart, loglandı)
- `--dry-run --limit 400` → "missing feature in:title" sorunsuz çekildi
- DERS ALINDI: PowerShell `-replace`+`Set-Content` UTF-8 mojibake yaptı → dosya yeniden yazıldı; bundan sonra Türkçe içerikli dosyalarda PowerShell string manipülasyonu YASAK, sadece edit aracı

### 8) Dil tespiti (plan FAZ 4) — `src/language.ts` — ADAPTERLARA BAĞLANDI ✓
- `franc-min` (82 dil, istatistiksel 3-gram) eklendi
- `detectLanguage(title, text)`: <20 karakter → null; sadece eng/tur döner, diğerleri null
- **Bağlantı noktası:** `upsertNormalized` içinde — adapter null verdiyse otomatik tespit; tüm adapterlar tek satır değişiklikle kapsandı, `language` kolonu artık DB yazımında dolu geliyor

### 9) Adapter 5: StackExchangeAdapter — CANLI TEST ✓
- `/search/advanced` + `filter=withbody` (body html-strip → temiz metin), 4 sorgu (stackoverflow export/missing-feature, softwarerecs alternative/saas)
- `backoff` alanı zorunlu uygulanıyor (docs throttle kuralı), 429'da 60s, sayfa gecikmesi 1.2s
- `--dry-run --limit 200` → sorunsuz

### 10) Adapter 6: YouTubeAdapter — KEY YOK TESTİ ✓
- KOTA STRATEJİSİ kodda: `search.list` YASAK; `mostPopular regionCode=TR` (4 kategori × 1 unit) + trend başına `commentThreads` (1 unit) + izlenen playlist referansları
- Günlük unit tavanı 8000 (10.000 resmi kotada güvenlik marjı), `YOUTUBE_PLAYLISTS` env'i ile takip listesi
- Key yokken adapter **nazik pas geçiyor** (test edildi) — key `.env`'e girilince çalışır

### Durum: FAZ 2 (Data Collection) — 6 adapter tamam
| Adapter | Kaynak | Test |
| --- | --- | --- |
| reddit-backfill | Arctic Shift API | ✓ canlı (1000 post) |
| reddit-incremental | scraper CSV | tip-check (DB'li test 3060'da) |
| hackernews | Algolia | ✓ canlı |
| github | REST search | ✓ canlı (token'sız) |
| stackexchange | API v2.3 | ✓ canlı (key'siz) |
| youtube | Data API v3 | ✓ pas-davranışı |

### Bilinen eksikler (bilinçli sıra)
- [ ] GITHUB_TOKEN / STACK_EXCHANGE_KEY / YOUTUBE_API_KEY `.env`'e girilecek (kotalar backfill'i ciddi hızlandırır)
- [ ] DB'li gerçek test — 3060 cihazında Postgres ayağa kalkınca: `docker compose up -d` → `pnpm collect reddit-backfill -- --limit 50000`
- [ ] SearXNG adapter (FAZ 14 — pattern'lar oluşmaya başlayınca; şimdi yazılsa sorgu üretecek pattern yok)
- [ ] FAZ 5 cleaning worker (status new→cleaned) + FAZ 6 embedding client (TEI) — adapterlar doldukça anlamlı

---

## 2026-09-11 — Oturum 3: FAZ 5 + FAZ 6 pipeline (cleaning, embedding)

### 11) FAZ 5 — `src/pipeline/clean.ts`
- status `new → cleaned | discarded` worker; batch 1000
- Kurallar: title+text < 40 karakter → discard; spam/boilerplate desenleri (`[removed]`, link-only, crypto spam) → discard
- Exact-dup bilinçli olarak burada YOK (content_hash index'li; near-dup FAZ 6 sonrası embedding ile)
- `npm run pipeline clean`

### 12) FAZ 6 — `src/pipeline/embed.ts`
- TEI `POST /embed` client (Qwen3-Embedding-0.6B), batch 64, `cleaned` + `embedding is null` seçer
- **Boyut kontrolü:** ilk vektör 1024 değilse hard-fail (model/şema uyumu — halfvec(1024))
- `embedding = $1::halfvec, status='embedded'` — batch başına tek transaction
- TEI down → oturum durur, status 'cleaned' kalır → tekrar çalıştırılınca devam (catch-up)
- Temsil metni: `title\n\ntext` (tek vektör kararı — plan FAZ 6)
- `npm run pipeline embed` / `all`

### Uçtan uca akış (komutlar)
```
pnpm collect [adapter]        # FAZ 2-4: fetch → normalize(+dil) → upsert
pnpm pipeline clean           # FAZ 5: new → cleaned/discarded
pnpm pipeline embed           # FAZ 6: cleaned → embedded (TEI/GPU)
# sıradaki: FAZ 8-9 BERTopic (Python tarafı, embedding'ler hazır olunca)
```

### Bilinen eksikler (bilinçli sıra)
- [ ] 3060: compose up → 3 doğrulama (KURULUM.md) → `collect reddit-backfill --limit 50000` → `pipeline clean` → `pipeline embed` — uçtan uca ilk gerçek veri
- [ ] FAZ 8-9: Python BERTopic worker (embedding'leri DB'den okuyup cluster → patterns tablosuna yaz)
- [ ] API key'ler (.env): GITHUB_TOKEN, STACK_EXCHANGE_KEY, YOUTUBE_API_KEY
- [ ] SearXNG adapter (FAZ 14 — pattern'lar oluşunca)

---

## 2026-09-11 — Oturum 4: FAZ 8/9/10/13 — BERTopic cluster worker'ları (Python)

### 13) `cluster/recluster.py` — SEYREK güncelleme (FAZ 13 katman 2)
- `status='embedded'` + vektör dolu observation'ları DB'den çeker (`halfvec::text` → numpy)
- BERTopic: UMAP(10D, cosine, random_state=42) + HDBSCAN(min_cluster=25, min_samples=10, eom) + CountVectorizer(stop_words english, ngram 1-2, min_df 5) + KeyBERTInspired representation
- `calculate_probabilities=False`, `low_memory=True` (BERTopic FAQ pratikleri — plan FAZ 8)
- Yazım: eski `active` pattern'lar `archived`; yeni pattern'ler `active` + centroid (normalize edilmiş ortalama) + keywords (c-TF-IDF top-15) + BERTopic ismi
- `pattern_observations` (run_kind='recluster') + tek toplu `first_seen/last_seen` sorgusu
- `py_compile` temiz; çalıştırma `python -m cluster.recluster` (3060'da, cluster/requirements.txt)
- Bilinçli basitleştirme: eski↔yeni pattern eşleştirme (merge koruma) v0.2'ye ertelendi — ilk pilot arch/yeniden yazma yeterli; pattern ID kararlılığı tam isteniyorsa eklenecek

### 14) `cluster/assign.py` — SIK güncelleme (FAZ 13 katman 1)
- Atanmamış yeni `embedded`'ları mevcut aktif centroid'lere cosine ile atar (eşik 0.55 — pilot ile kalibre edilecek)
- HDBSCAN ÇALIŞTIRILMAZ (plan kararı); `run_kind='centroid'`, similarity kaydı
- Pattern sayaç + `last_seen` toplu update
- `py_compile` temiz

### 15) KURULUM.md — uçtan uca ilk akış bölümü eklendi
- `pnpm collect → pipeline clean → pipeline embed → python -m cluster.recluster/assign` sırası + notlar

### Durum: kod tarafı uçtan uca hazır (FAZ 2-3-4-5-6-8-9-10-13)
Eksik: FAZ 11 signal typing worker (classified status), FAZ 14 SearXNG adapter (pattern'lar oluşunca), FAZ 12 UI — hepsi veri akmadan önce yazılabilir ama öncelik 3060'da ilk gerçek veri.

### Sonraki oturum önerisi
1. **3060'da:** Docker kurulumu → compose up → KURULUM.md akışını uçtan uca çalıştır (collect 50k → clean → embed → recluster) → LOG'a sonuçları yaz
2. GITHUB_TOKEN al (backfill hızını 10/dk → 5000/saat'e çıkarır)
3. İlk veri gelince: TR/EN çift pilot testi (plan FAZ 6, Açık Soru 3) + outlier oranı ölçümü (Açık Soru 7)
