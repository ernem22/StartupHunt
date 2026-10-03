# StartupHunt — Geliştirme Logu

> Kural: her anlamlı adım buraya yazılır — tarih, ne yapıldı, sonuç, sonraki adım.

---
---

---

## 2026-10-03 — Oturum 22: kararlılık probu (pattern'lar gerçek mi?)

- Yöntem: salt-okunur prob, üretim girdisinin aynısı (15.126 vektör, .npy önbellek; koşum ~30sn).
- seed0 vs seed1 ARI=0.703 (SAĞLAM): 101/107 cluster, noise %48/%47 — üretim seed'i (42→109 cluster) artefakt üretmiyor.
- %80 alt-örneklem ARI=0.521 (orta): küçük cluster'lar eriyor — density yöntemin doğası; 50k'da artması beklenir.
- Hüküm: pattern'lar review'e girebilir; kör parametre oynaması YOK (otopsiyle tutarlı — noise seyrekliği yapısal). Noise kalibrasyonu veri büyüyünce yeniden ölçülür.
- Not: prob ilk seferde status filtresini dar tutmuş (7.933/15.126) — recluster.py'nin `embedded_noise`'u da kattığı fark edilip düzeltildi.

## 2026-10-03 — Oturum 21: merge kaybı + kurtarma + pilot chunk 1

- PR #10 + #11 merge edildi (main 7ff231f). Web "Update branch" çözümü 2 kayıp yaratmış (diff ile doğrulandı, başka dosya etkilenmedi): `cluster/assign.py`'da `import time` satırı + LOG Oturum 18/19/20 (31 satır).
- Kurtarma (bu dal): import geri eklendi; retry yolu İLK KEZ gerçekten test edildi (ölü porta 6 deneme → raise, NameError yok); LOG 18/19/20 geri yazıldı.
- Pilot chunk 1: `reddit-backfill --limit 10000` → 10.005 new, sorunsuz ve hızlı (~dakikalar). Sıradaki: chunk 2 (HN) → clean/embed → ilk gerçek recluster.
- Ders: web "Update branch" çakışmayı sessizce main lehine çözmüş — eklemeli dosyalarda (LOG) branch güncellenirken diff kontrolü şart; bundan sonra update-branch sonrası `git diff` bakılacak.

## 2026-10-03 — Oturum 20: CodeRabbit incelemesi (4 yorum — 3 kabul, 1 kısmi)

- #10 minör (LOG ifadesi): HAKLI — "üretim verisinde de doğru" seed testini abartıyordu; PR #10 dalında düzeltildi.
- #11 minör (retry): KISMİ — son-deneme sonrası uyku kaldırıldı; geniş except bilinçli kaldı (psycopg tüm bağlantı hatalarını OperationalError'da birleştirir; kalıcı/geçici ayrımı bu katmanda güvenilmez, deneme sayısı sınırlı).
- #11 majör (pageMax kaybı): HAKLI — sayfa-ortası imleç, timestamp `>` filtresi altında işlenmemiş hit kaybettirirdi (kendi düzeltmem regresyonmuş). Sayfa-hizasına geri alındı; taşma ≤1 sayfa tasarım olarak kodda belgelendi (limit kota değil, oturum disiplini).
- #11 majör (NUL): HAKLI — `&#0;`/`&#x0;` Postgres insert'i patlatırdı; `code()` U+0000'i eliyor + 2 unit test.
- Doğrulama: typecheck/py_compile temiz; entity 9/9; HN dry-run limit 150 → sayfa-sınırında 200 duruyor; assign koştu.

## 2026-10-03 — Oturum 19: chain-hardening (4 fix) + doğrulama

- **F1 localhost→127.0.0.1:** `config.ts` (DATABASE_URL), `embed.ts` (TEI_URL), `counterpart.ts` (SEARXNG_URL) varsayılanları + `.env.example` + KURULUM curl örnekleri. Doğrulama: env'siz `pipeline clean` artık ECONNREFUSED yerine sunucuya ulaşıp auth_hatası veriyor (host çözümü düzeldi; kalan fark örnek kimlik bilgileri).
- **F2 HN limit:** sayfa-içi break + imleç yalnızca işlenen hit'lerden ilerler (limit kesintisinde kayıp yok, tekrarlı limitli koşumlar ilerler) + processed sayılı log. Doğrulama: dry-run `--limit 150` → processed=150 (önce 200 yazıyordu). (Oturum 20 güncellemesi: sayfa-ortası imleç veri kaybı riskiyle geri alındı, sayfa-hizasına dönüldü.)
- **F3 cluster db_connect:** timeout 15sn + 6 deneme; `recluster.py` (3) + `assign.py` (2) tüm bağlantılar taşındı; varsayılan URL'ler 127.0.0.1. Doğrulama: py_compile + assign koşumu (458 tarama, çökme yok). `sys.exit` yolu (patterns boşken) test edilmedi.
- **F4 decodeEntities (`db.ts`, merkezi):** hex/desimal/named entity + `&amp;` en son + geçersiz kod koruması; dil tespiti ve kayıt çözülmüş metinle. 7/7 unit PASS; reddit `--limit 5` gerçek yazımda entity kalıntısı 0. contentHash decode-öncesi hesaplanıyor (girdi başına tutarlı; not). (Oturum 20 güncellemesi: U+0000 elendi, 9/9 test.)
- Ek: main'deki sahipsiz `>>>>>>> origin/main` artığı LOG'dan silindi (eski merge'den kalma).
- Not: assign/recluster'daki import-sys + ASCII baskılar PR #10 ile birebir çakışık — hangi PR önce merge olursa diğeri temiz birleşir (aynı metin).

## 2026-10-03 — Oturum 18: format kontrolü + embedding/clustering sağlık

### Format kararı (types.ts sözleşmesi ↔ gerçek veri)
- 9 alan tüm adapter'larda ortak; reddit 300 + HN 200'de başlık/yazar/tarih %100 dolu; dil boşları tasarım gereği (kısa/üçüncü-dil)
- Asimetri: HN gövdesiz story'de text=title kopyalanıyor (`title\n\ntitle`) → terim ağırlığı iki kat, keywords hafif sapar (küçük kalite notu, düzeltme sonraki PR'a)
- Hüküm: boru hattını tıkayan format farkı YOK; embed/cluster girişi her kaynakta dolu

### Sağlık kontrolü (496 gerçek obs, salt-okunur script — DB'ye yazmaz)
- Embedding SAĞLIKLI: 496x1024, norm 1.000 (TEI normalize ediyor); rastgele-çift cosine 0.30±0.11 (çökme/dağılma yok); en-yakın-komşu ort 0.66, %4.4 >0.90 (makul yakın-tekrar), %0 <0.30; birebir kopya 5 çift (cross-post şüphesi, content_hash exact-dedup kapsamı dışında kalmış olabilir)
- Clustering (recluster.py parametreleriyle bellek-içi, yazmasız): 2 cluster + noise %4 (Açık Soru 7 eşiği %40'ın çok altı ✓)
- BULGU (FAZ 5 açığı): keyword'lerde `x27/x2f/quot` çöpü — `&#x27;`, `&#x2f;`, `&quot;` HTML entity'leri temizlikte çözülmüyor (HN Algolia + Arctic Shift kaçışlı dönüyor). `clean.ts`/normalize'a HTML-unescape gerekli (F4'te kapandı)
- Not: 444 üyelik mega-cluster bu ölçekte normal (veri homojen SaaS; min_cluster 25); pilot ölçeğinde bölünür. UMAP `random_state` uyarısı zararsız (tek-çekirdek dayatması)

## 2026-10-03 — Oturum 17: cluster 3060 testi (recluster + assign, gerçek Qwen3 vektörleri)

### Ortam (bu cihaz = 3060 PC doğrulandı)
- GPU: RTX 3060 12GB (driver 591.86); torch 2.5.1+cu121 CUDA OK; VRAM %95 dolu (masaüstü uygulamaları) — TEI modeli sığdı, sorun yok
- Docker Desktop servisi duruyordu → başlatıldı; `compose up -d postgres tei` → ikisi de healthy/Ready
- `.env`: POSTGRES_USER/DB=startup_hunt (cluster/*.py varsayılanı `startuphunt/startuphunt` ile uyuşmuyor → koşumlarda DATABASE_URL env ile verildi)
- `bertopic 0.17.4 + sentence-transformers 6.1.0` kuruldu (mevcut torch/transformers ile çakışmasız)
- `pnpm install` (node_modules yoktu) → `pnpm typecheck` temiz

### Test 1 — sentetik (DB'siz, recluster.py parametrelerinin aynısı)
- 3 grup x 100 (1024d, grup-içi cosine ~0.94) + 20 noise → UMAP+HDBSCAN: **3 cluster, purity 1.00, noise %0**; deterministik tekrar OK
- Assign eşiği 0.55: grup-içi held-out ~0.97 (atanır), rastgele noise ~0.0-0.13 (atanmaz) — eşik gerçek veride anlamlı

### Test 2 — uçtan uca (TEI Qwen3-Embedding-0.6B → recluster → assign → recluster)
- Seed: 3 konu x 40 (export/dark/slow) + 6 noise → 126 obs `embedded` (TEI batch /embed, ~0.4s/batch)
- recluster: **3 pattern, noise %0**; dağılım export 40/40, dark 40/40, slow 40/40 (noise 3+3 en yakınlara); keywords dosdoğru (export/csv/bulk; dark/dark mode/theme; slow/startup/launch)
- assign (8 yeni: 5 export-benzeri + 3 alakasız): **5/8 atandı, tamamı pattern 1'e sim 0.71-0.83**; 3 alakasız boşta — seed edilmiş uçtan uca testte eşik bu örneklerde beklendiği gibi çalıştı
- Süreklilik: eski pattern'lar `merged` (archived DEĞİL ✓); pattern_history overlap 1.000; `review_status='interesting'` **tek halefe taşındı**, diğerleri unreviewed kaldı

### Bulunan bug'lar (düzeltildi, bu oturumda — commit bekliyor)
- `cluster/assign.py`: `import sys` eksik → aktif pattern yokken `sys.exit(0)` NameError verirdi
- `cluster/recluster.py` + `assign.py`: ▶/✔/✖ baskıları Windows konsolunda (cp1254) UnicodeEncodeError → crash; ASCII'ye çevrildi (üretim Task Scheduler koşumu da çarpardı)

### Altyapı bulguları (kod değişikliği YOK, takip işi)
- Docker Desktop port-forward Windows'tan yeni TCP bağlantıyı arada ~2dk yutuyor (TEI ve postgres'te görüldü; faulthandler ile `psycopg.connect` select()'inde yakalandı). Keep-alive bağlantıda sorun yok (3 batch 0.4s). **Üretim notu:** `embed.ts` Node fetch zaten keep-alive kullanır, muhtemelen etkilenmez; ama `cluster/*.py` her çağrıda yeni `psycopg.connect` açıyor → `connect_timeout` + retry eklenmesi önerilir (ayrı PR).
- TEI model indirme + ilk warmup ~2dk; sonrası batch ~0.3-0.8s (3060'da).
- repo NOTU: `main` üzerinde yarım interactive rebase vardı (eski proto commit'ler); kullanıcı kararıyla abort + `reset --hard origin/main` yapıldı — remote doğru kabul edildi, yerel proto çöpe çıktı (reflog'da duruyor).

### Sonraki adım
- Bu oturumun 2 bugfix'i + LOG girdisi için branch/PR
- Gerçek pilot verisiyle ilk koşum (`collect → clean → embed → recluster`), outlier oranı ölçümü (Açık Soru 7), recluster eşiği kalibrasyonu

---

## 2026-10-02 — Oturum 16: SE dump backfill adapter (feat/searchive-backfill, PR #9)

### 23) `src/adapters/searchive.ts` — archive.org SE dump backfill
- `site.7z` indir → `7z x -so Posts.xml` stream → `<row/>` parse; kapsam: PostTypeId=1 sorular (Title zorunlu, HTML strip); cevaplar v0.1 dışı
- Site başına Id imleci (adapter_state); BACKFILL_SINCE öncesi atlanır; idempotent upsert; stackoverflow bilinçli dışarıda
- **dry-run CANLI TEST ✓ (bu cihazda):** softwarerecs dump (52MB) → 20 obs çıkarıldı, imleç doğru. Ara bulgular: (1) Body newline'ları `&#xA;` encode'lu → satırlar tek satır (multiline buffer yine de korundu); (2) dump snapshot Mar-2024'e kadar → 18-ay penceresinde obs=0 DOĞRU davranış (test SE_MIN_DATE override ile); (3) superuser GB'lerce — bu ağda inmez, 3060'ta
- 7-Zip önkoşul (SEVEN_ZIP_BIN env); test dump'u silindi
- 3060'a bekleme: DB yazımı, büyük site hacmi

---

## 2026-09-23 — Oturum 15: Reddit live kararı — OAuth donduruldu, Arctic Shift incremental

- Responsible Builder Policy (Haz 2026) doğrulandı: API erişimi onay şartlı; ret-ağırlıklı pratik (topluluk raporları 2025-26) → "2-4 hafta onay" ilk tahminim GERİ ÇEKİLDİ (iyimserdi)
- Politika metninden kritik madde: "non-commercial mining" bile onaysız yasak; bizim savunmamız (ticket metni): salt-okunur ~30-50 istek/gün, etkileşim sıfır, model EĞİTMİYORUZ (hazır embedding çıkarımı), Devvit dışı salt-okunur hat olduğu için Devvit kapsama girmez
- **Karar: OAuth yolu donduruldu, cevap beklenmiyor.** Canlı uç = Arctic Shift `after=` incremental (~36 saat gecikme) — `reddit-backfill` imleci bunu zaten yapıyor; pilot etkilenmez
- plan.md FAZ 1 + AGENTS.md güncellendi

---

- Kök neden düzeltildi: local main push edilmemişti + remote'ta eski Python "phase2" proto baseline (7fa5aac) vardı; bu tüm PR'leri unmergeable yapıyordu
- Alias meanings: phase2 proto (main.py/collectors/ vb.) legacy korundu — plan v3.2 mimaride yer tutmaz, bakım almaz; ileride silme kararı için bekler
- Merge sırası: #3, #2, #1 (gh normal) → #7, #6, #4, #5 (her biri git merge origin/main + LOG/package.json deterministik union çözümü; PowerShell-with-raw mojibake kural ihlali iki kez yapıldı — kural yeniden uyarı: LOG gibi Türkçe dosyalarda yalnız edit aracı)
- Tüm merge sonrası pnpm typecheck temiz; branch+PR akışı önde senkron şekilde main sonrası lock'landı

### Birlikte çalışma özet durumu
- `pnpm typecheck` temiz; pilot zinciri kod hazır; `pnpm orchestrate` (collect→clean→embed→assign→recluster→counterpart kuyruğu) artık tek komutla koşum
- Geri kalan tek gereklilik: **3060 PC kurulumu → `pnpm orchestrate` ilk koşum → review server + "BU" işaretlemesi → TR/EN mini testi** — çıktı pilot sonuçları LOG'a yazılır

---

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

## 2026-09-23 — Oturum 9: counterpart — TR karşılık araması komutu

### 19) `src/counterpart.ts` — `pnpm counterpart -- --pattern <id> [-- --dry-run]`
- **Koşul kilitli:** pattern `review_status='interesting'` + `status='active'` değilse sessiz çıkar (FAZ 14 onay-yalnız kuralı)
- Kurallı TR sorgu üretimi (deterministik): top-5 keywords + pattern adı; LLM TR çevirisi v0.1'de YOK (FAZ 14 "kurallı + gerektiğinde" — kurallı yeter)
- SearXNG `format=json&language=tr` → ilk 20 sonuç → observations (`source='searxng'`, `metadata.parent_pattern_id`); <40 karakter atlanır
- **Idempotentlik:** her sorgu `counterpart_searches`'e kaydedilir; done olan koşmaz, error sonraki koşumda yeniden dener; sourceId = URL FNV-1a + pattern kimliği ile (aynı URL başka pattern'da ayrı obs kabul edilir)
- SMOKE (bu cihaz): `--dry-run` → arg parse → pool çağrısına kadar akış; DB yok (ECONNREFUSED) düzgün duruş ✓ — DB/SearXNG zinciri 3060'ta
- Not: pilot sırasında koşmaz (onaylı pattern yok); FAZ 14 ön koşulu TR/EN mini testi geçilmeden pasif kalır

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
