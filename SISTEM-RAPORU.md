# StartupHunt — Tam Sistem Raporu (bitmiş hali)

Amaç: dünyadaki sinyalleri bulmak. Ne popüler, nelerden şikayet ediliyor, neler eksik görülüyor, neler geliştiriliyor, ne tür firmalar kuruluyor, neler geriliyor. Fikir üretmek yok. İkinci yarı: dünya sinyalinin Türkiye karşılığını aramak.

Sistem karar vermez, kanıt sunar. Filtre, skor, ağırlık yoktur. İnsan tüm listeyi görür, karar insandadır.

---

## 1. Uçtan uca akış

Kaynaklar (arşiv + resmî API, scraper yok) → backfill (son 18 ay) + live polling → adapter'lar (normalize) → raw_observations (JSONB, immutable) → observations (normalize + clean + embed) → pgvector → centroid assignment (günlük) → recluster (tetik bazlı) → signal typing → review server (insan) → TR araması (yalnızca onaylı) → UI (ertelendi).

Veri yolu %100 deterministiktir. LLM yalnızca yorum katmanındadır (isim, açıklama, özet). LLM veriyi silmez, cluster üyeliğine karışmaz, merge kararı vermez.

---

## 2. FAZ 1 — Kaynaklar

İki sınıf vardır: metin kaynakları (observation üretir) ve metrik kaynakları (sayı üretir, observation üretmez).

### Metin kaynakları

- Reddit backfill + gap-fill: Arctic Shift (dump + API). Taban son 18 ay. Sayfalama `subreddit+after+limit=auto`. Skor ~36 saat hamdır. 429'da `X-RateLimit-Reset` beklenir.
- Reddit live: Arctic Shift incremental (`after=` catch-up, ~36 saat gecikmeli). Resmî OAuth yolu donduruldu (Responsible Builder Policy onayı ret-ağırlıklı, cevap beklenmiyor). Pilot etkilenmez.
- Hacker News: Firebase (canlı akış) + Algolia (tam metin arama, `search_by_date`, story+comment, sorgu terimi başına imleç). `nbPages=1000` tavanı vardır.
- GitHub live: REST API (`search/issues` şikayet, `search/repositories` launch, `/releases` development). Tokenlı 5.000 req/saat; search ~30 req/dk.
- GitHub backfill + gap-fill: GH Archive (2011'den beri saatlik dump). API kotasına dokunmaz.
- Stack Exchange live: API (key ile 10.000 req/gün, `backoff` zorunlu). Backfill: SE Data Dump (archive.org, üç aylık, CC BY-SA).
- YouTube: `search.list` YASAK (100 unit). `mostPopular regionCode=TR` (1 unit) + `commentThreads` (1 unit) + izlenen playlistler. Günlük tavan 8.000 unit.
- SearXNG: self-host, JSON API (`format=json&language=tr`). Public instance'larda JSON kapalıdır, kendi instance şarttır. Yalnızca onaylı pattern'lar için koşar.
- Firecrawl: seçilmiş URL listesi modu (1.000 kredi/ay ≈ 33 sayfa/gün). ETag ile tekrar çekme azaltılır.
- Apify / G2 / Capterra / Trustpilot / Play / Upwork / LinkedIn / Indeed: düşük öncelik veya kapsam dışı (ToS/ban riski; Apify Free yalnız doğrulama içindir).
- Son çare sırası: Apify → Firecrawl → Playwright/Crawlee.

### Metrik kaynakları (observation üretmez)

npm indirme serisi, PyPI metadata, GitHub stars/pushed_at/forks, HN points/comments, Arctic Shift subreddit büyümesi. Pattern keywords'üyle eşleşen varlığın eğrisi pattern'ı zenginleştirir. Sentetik cümle gömülmez.

### Erişim önceliği

Resmî API → arşiv → Apify → Firecrawl → Playwright/Crawlee. Scraper/proxy yoktur.

### Backfill/live ayrımı

Backfill = arşivden toplu-idempotent. Live = günlük polling. HN/GitHub live sorgu terimli çalışır (API sorgusuz çalışmaz). Bu örtülü bir filtredir ve "seçim kuralı yok" ilkesiyle gerilimlidir. Kabul edilen sınır: sorgu listesi config'tir; kapsam arşivlerin tam metniyle dengelenir.

---

## 3. FAZ 2 — Toplama (adapter'lar)

Her kaynak bir adapter'dır. Hepsi aynı sözleşmeye uyar (`src/types.ts`): `collect(since, opts)` + normalize edilmiş şema + idempotent upsert.

- `reddit-backfill`: Arctic Shift, subreddit bazlı imleç, `sort=asc`, sayfa başına 100, 1sn gecikme. Aynı imleç incremental canlı ucu da sürdürür.
- `reddit-incremental`: OPT_IN'dir, collect-all'da yoktur.
- `hackernews`: 7 sorgu terimi, terim-başı imleç, 700ms gecikme, limit sayfa-sınırında durur (taşma ≤1 sayfa, kayıp yok).
- `github-live`, `github-archive` (GH Archive), `stackexchange` (API) + `searchive` (SE dump, `7z` stream parse, site-başı Id imleci), `youtube`, `searxng`, `firecrawl`.
- Dil tespiti toplama anında yapılır (`franc-min`; <20 karakter null; yalnız eng/tur döner, diğerleri null). `language` kolonuna yazılır.
- Çıktı: raw observation (kaynağın orijinal alanları) + normalize kayıt (`status='new'`).

---

## 4. FAZ 3 — Raw storage

Tablo: `raw_observations (id, source, source_id, raw_data JSONB, collected_at)`, `unique(source, source_id)`. Ham veri değiştirilmez, yeniden işlenebilir.

---

## 5. FAZ 4 — Normalization

Şema: `id, source, source_id, source_url (unique), title (null olabilir), text (zorunlu), author, observed_at, collected_at, language, metadata (JSONB), signal_types (text[], bu fazda boş), content_hash, status, embedding`.

Kurallar: `signal_types` FAZ 9'a kadar boştur. Tip `text[]` dizidir (bir observation hem şikayet hem gap olabilir). HTML entity'ler burada çözülür (`&#x27;`, `&quot;`, `&#x2f;`, `&#xA;`; `&amp;` en son; U+0000 elenir). contentHash FNV-1a'dır.

---

## 6. FAZ 5 — Cleaning + dedup

Worker: `status new → cleaned | discarded`, batch 1000. Kurallar: title+text <40 karakter discard; spam/boilerplate (`[removed]`, link-only, crypto spam) discard. Duplicate URL unique constraint ile gider. Duplicate content exact-match (`content_hash`) ile gider. Near-duplicate embedding ile yakalanır (FAZ 6 sonrası). Reddit `crosspost_parent_id` metadata'da taşınır.

---

## 7. FAZ 6 — Embedding

Model: Qwen3-Embedding-0.6B, self-host, TEI ile lokal GPU'da (RTX 3060'da ~1.5GB VRAM, ~100-300 obs/sn). MTEB çok dilli clustering 66.83. 1024 boyut, 32k context.

Kural: observation başına TEK temsil vektörü (`title\n\ntext`). Chunk'lar cluster'a girmez (chunk yalnızca retrieval/near-dup doğrulamada kullanılır). Batch 64, ilk vektör 1024 değilse hard-fail. TEI down ise oturum durur, status `cleaned` kalır, tekrar koşum devam eder. Yazım: `embedding=$1::halfvec, status='embedded'`, batch başına tek transaction.

TR/EN doğrulama (zorunlu ölçüm, pilot-sonrası FAZ 14-öncesi): ~50 elle çift, centroid benzerliği. Eşik altı → yedek model (Gemini/Cohere).

---

## 8. FAZ 7 — Vektör saklama

PostgreSQL + pgvector, `embedding halfvec(1024)` (2KB/obs). Index HNSW (`halfvec_cosine_ops`), ivfflat değil. Bulk backfill'te index düşürülür, bitince kurulur. Ölçek: 1.5M obs ≈ 30-60GB.

---

## 9. FAZ 8 — UMAP + HDBSCAN (BERTopic)

Motor: BERTopic. UMAP (`n_neighbors=15, n_components=10, min_dist=0.0, cosine, random_state=42`) + HDBSCAN (`min_cluster_size=25, min_samples=10, euclidean, eom`) + CountVectorizer (english stopword, 1-2gram, min_df=1) + c-TF-IDF keywords (top-15). `calculate_probabilities=False`, `low_memory=True`. Preprocessing YOK (stopword'ler vektörleştiricide). `partial_fit`/online mod YOK (noise üretmez, centroid yaklaşımıyla çelişir). Python ortamı Docker'da sabit tutulur (HDBSCAN/UMAP build riski). Risk: dil-bazlı sahte cluster (TR/EN ayrışması) — FAZ 6 testiyle izlenir.

---

## 10. FAZ 9 — Signal typing + pattern discovery

İlke: pain point ifade kalıbında değil anlamdadır; observation seviyesinde değil pattern seviyesinde ortaya çıkar. Sistem kanıt sunar.

Yöntem: prototip vektör. Her signal type için örnek cümle havuzu (veri dosyası, kod değil) → embed'lenir → prototip vektör. Yeni observation en yakın prototip + cosine eşikle etiketlenir. Deterministiktir, insansızdır. Yeni kalıp kaçarsa 3-5 örnek cümle eklenir (kod değişmez). Pilot raw cluster ile koşar; örnek havuzu pilot çıktısındaki "kaçırılmış pain" ile doldurulur. Observation bazında `text[]`; pattern seviyesinde dağılım aggregation'dır. keywords c-TF-IDF'ten gelir.

---

## 11. FAZ 10 — Pattern consolidation

Recluster'ın overlap eşleşmesi + LLM isimlendirme (Gemini Flash-Lite: keywords + temsili observation'lardan ad + açıklama). LLM yorum katmanıdır, veri yolunu etkilemez.

---

## 12. FAZ 11 — Timeline / frequency + metrik

Pattern timeline observation'lardan hesaplanır (`first_seen/last_seen` min/max, `observation_count`, sources view ile). Frekans: haftalık seri + 4 haftalık moving average; uyarı ±2σ kontrol şeridi. Metrik: `metric_snapshots (entity_type, entity_id, metric, value, captured_at)`; pattern↔entity eşleşmesi keywords üzerinden (pilot-sonrası).

---

## 13. FAZ 12 — UI + insan denetimi

Gerçek UI framework kararı pilot-sonrasına ertelidir. Pilot incelemesi minimal review server ile yapılır (`src/review.ts`, `pnpm review` → localhost:3001).

Pattern kartı: ad + açıklama + keywords + 8 temsili observation (centroid'e en yakın 5 + en yeni 3, deterministik) + kaynak/zaman dağılımı + TR durumu.

`review_status`: `unreviewed|seen|interesting|junk`. Buton eşlemesi sabittir: [BU]→`interesting` (="onaylı", TR tetiği), [junk]→`junk` + `status='archived'` (görünürlük kontrolü, silme yok, geri alınabilir), [gördüm]→`seen`. Kart-notu (`review_note`) karışık kartta hangi cümle değerli diye yazılır. Filtre/sıralama, ilerleme çubuğu, sıradaki-kart çapası, arşiv bölümü vardır. Skor/filtre YOK; nötr sıralama (boyut/kronolojik).

---

## 14. FAZ 13 — Güncelleme (iki mod)

SIK (her günlük koşu): yeni observation → normalize → clean → embed → pgvector → mevcut pattern centroid'lerine cosine ile ata (eşik 0.55, HDBSCAN çalışmaz) → sayaç/timeline güncelle (`run_kind='centroid'`).

SEYREK (tetik bazlı, takvim yok): her koşuda atanmamış embedded oranı ölçülür; eşik aşılırsa (örn. >%5) veya güvenlik-ağı günü dolarsa recluster koşar. Tüm embedding'ler → UMAP+HDBSCAN yeniden → eski↔yeni eşleşme observation-overlap ile (SQL kesişim, ≥%50) → `pattern_history` kaydı → eski `review_status` YALNIZCA en yüksek oranlı TEK yeni pattern'a taşınır (split çift-onayı önler) → eskiler `status='merged'` olur (`archived` yalnızca insan junk'udur, karışmaz) → timeline observation'lardan yeniden hesaplanır.

Catch-up: gap yoktur, yalnızca gecikme vardır. Her adapter imleçten devam eder (Reddit `after=`, GitHub GH Archive saat dosyası, SE arşiv dump, diğerleri sayfalama). Tüm yazımlar idempotent upsert'tir. Çalıştırma: Windows Task Scheduler logon tetiği (+kaçırılanı çalıştır) → compose up → sağlık → collect → clean → embed → assign → (tetiklenirse) recluster. Tek komut: `pnpm orchestrate`.

---

## 15. FAZ 14 — TR karşılık araması

Tetik: YALNIZCA insan onaylı (`review_status='interesting'`) pattern. Tek komut çoklu tetik: `pnpm counterpart --pattern <id>` (orchestrator günlük "onaylı + aranmamış" hepsine, review butonu tekine). Kurallı TR sorgu (top-5 keywords + ad) → SearXNG `format=json&language=tr` → ilk 20 sonuç → observations (`source='searxng'`, `language='tr'`, `metadata.parent_pattern_id`) → aynı pipeline. Idempotent (`counterpart_searches` kaydı; done koşmaz). Üç sonuç durumu: karşılık aktif / boşluk (ilgi var çözüm yok — en değerli) / karşılık yok.

---

## 16. Veritabanı (özet)

`raw_observations` (immutable ham), `observations` (normalize+embed), `patterns` (`name, description, centroid, keywords, first/last_seen, observation_count, status: active|merged|archived, review_status, review_note`), `pattern_observations` (`similarity, run_kind: centroid|recluster`), `pattern_history` (old→new, overlap), `counterpart_searches`, `metric_snapshots`, `adapter_state` (imleçler). View'lar: `v_pattern_sources`, `v_pattern_frequency` (haftalık + MA4).

---

## 17. İlkeler (grill, 2026-09-21)

1. Sistem karar vermez, kanıt sunar (filtre/skor/ağırlık yok).
2. plan.md sözleşme değil başlangıç hipotezidir.
3. Hedef insansız self-improving pipeline (iyileşme = veri ekleme).
4. Pain point anlamdadır, pattern seviyesindedir.
5. LLM yalnızca yorum katmanındadır.
6. Tetik bazlı çalışma, keyfi takvim yok.
7. Gap yok, yalnızca gecikme (imleçler + legal kaynaklar).

---

## 18. Altyapı

Tek Windows makine + RTX 3060 (12GB), VPS yok, bulut maliyeti $0. WSL2 + Docker Desktop: postgres(pgvector/pg16, 5432) + TEI (Qwen3-0.6B GPU, 8080) + SearXNG (8888). Kapasite: günlük 50k obs <10dk embed; 1.5M backfill ~2-5 saat; UMAP+HDBSCAN dakikalar-saat. Windows tarafı: TypeScript adapter'lar + review server. TR IP avantajı: SearXNG TR sonuçları lokalden doğru gelir.

---

## 19. Pilot

Ölçek ~50k obs (10 sub + HN, son 18 ay; kural/eşik yok). Derin-geçmiş yalnız geçici `pnpm deepen` modu (`metadata.deep_dive_for`, `prune` ile silinir). Başarı kriteri: insan denetiminde gerçek pain yakalama (sayısal eşik değil; ikili soru "incelemeye değer somut problem/gap mi?", geçersizler: jenerik dert, artefakt, tek anekdot). Sıra: koşum → review → BU → eşik kalibrasyonu → kaçırılmış-kontrol → TR/EN mini testi → SearXNG/metric/live/backfill adapter'ları → UI kararı.

---

## 20. Açık ölçümler

Recluster tetik eşiği (%5 öneri), assign eşiği (0.55), outlier oranı (%40 izleme), TR/EN split testi (FAZ 14 öncesi zorunlu), SearXNG motor toleransı. Hepsi pilot verisiyle kapanır.

---

## 21. Bilinen sapmalar (uygulama, bu raporun yazıldığı an)

- Toplama tek-sub ağırlıklı (limit disiplini ilk sub'da takılıyor; round-robin gerekli).
- Pattern ad/açıklama ham slug (LLM isimlendirme anahtar bekliyor).
- Review UX'i reaktif büyüdü; observation-seviyesi işaret tasarım sorusu olarak duruyor.
