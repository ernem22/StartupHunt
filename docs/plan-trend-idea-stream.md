# Plan: Trend ürün fikri akışı (Faz 1: araştırma, boşluk analizi, plan)

Tarih: 2026-11-23. Hedef: dünyada yükselen ürünleri yakalayıp her birini veriyle (sayı + kaynak linki) destekleyen ve Türkiye pazarının o ürün için ne kadar dolu olduğunu kanıtlı gösteren bir fikir akışı. Kullanıcı tek kişi, "hızlı takipçi" (fast follower) olarak ürünü kendisi yapar.

Bu belgedeki her "çalışıyor" ifadesi 2026-11-23'te bu makineden yapılan gerçek isteğe dayanır; yapılmayan test açıkça "doğrulanmadı" yazılır. Ham çıktı örnekleri §2 ve §3'tedir.

## 1. Boşluk analizi (repo hedefe karşı)

### Faydalı (kalır)

- `GLOSSARY.md` üst bölümü (Candidate, Momentum, Revenue evidence, TR gap) ve ADR 0003'ün ürün kararı: aday ürün + gelir kanıtı + TR boşluğu, "yok" yerine bulundu/bulunamadı/belirsiz. Hedefle birebir uyumlu.
- `src/radar/github.ts`, `hackernews.ts` içindeki saf fonksiyonlar: haftalık seri, ivme oranı, HN bağlantısından ürün kimliği çıkarma, `NON_PRODUCT_DOMAINS` engel listesi. Kaynak kodu DB'den ayırınca yeniden kullanılır.
- Kaynak-başına "link + tarih + etiket" disiplini (kısaltılmış hâliyle).
- Tamamlanmamış dallar `feat/radar-gelir-kaniti` (TrustMRR `/api/ai`, `src/radar/revenue.ts`) ve `feat/radar-tr-apple` (Apple TR eşleştirme): fikirleri doğru, ama `main`'in eski hâline dayanıyor ve Postgres `store.ts`'e bağlı. Birleştirme yerine küçük, DB'siz olarak yeniden yazmak daha ucuz.

### Yararsız ya da zararlı (hedefe ters)

1. **Postgres + pgvector + TEI + BERTopic + Docker hattı** (`db.py`, `db/`, `docker-compose.yml`, `Dockerfile`, `embedding.py`, `cluster/`, `src/db.ts`, `src/pipeline/embed.ts`, `src/radar/store.ts`'in pg kısmı, `stage_runs`/`metric_snapshots` şeması). Bu makinede çalışmıyor (Docker daemon yok), Cloudflare ücretsiz katmanında çalışmaz, bir "fikir listesi" için gereksiz. Aday listesi birkaç yüz satırdır; JSON dosyası yeter.
2. **Eski fırsat motoru**: `src/opportunities/`, `src/deepen.ts`, `src/review.ts`, `src/orchestrator.ts`, `src/adapters/*` (gharchive, reddit-backfill/incremental, searchive, stackexchange, youtube), `src/counterpart.ts` (SearXNG + pg bağımlı), `collectors/*.py`, `main.py`, `config.py`, `searxng/`, ilgili `test/*` ve fixture'lar, ADR 0001-0002. Hedef "topluluk metninden fırsat çıkarmak" değil "ürün düzeyinde yükselen şeyleri listelemek"; ADR 0003 zaten superseded diyor ama kod "donuk" diye duruyor ve her `pnpm check` içinde yük taşıyor.
3. **"Geliştirici aracı + yapay zekâ" alan sınırı**: `candidatePool`, `topic:developer-tools` sorgusu, HN `developer` / `AI tools` sorguları. Tek kişilik bir yapımcı için mobil uygulama, tüketici ürünü, niş SaaS en az o kadar değerli; mevcut kaynak seti sistematik olarak bu alanı görmüyor.
4. **GitHub / HN / HF tek başına aday kaynağı**: üçü de geliştirici merkezli. Hiçbiri gelir, mobil ya da tüketici sinyali vermiyor. HF "model" listesi ürün fikri değil.
5. **Tören yükü**: `stage_runs` manifesti (seed, commit hash), kanıt etiketi üçlüsü ("doğrulandı/ikincil/doğrulanmadı") her alan için, 60 KB'lık `LOG.md`, `reports/` ve `research_notes/` (eski araştırma metinleri), `docs/archive/`. Hedefe hizmet etmiyor; yeni hat için gürültü. Etiket yerine "kaynak linki + tarih" yeter.
6. **3060 PC bağımlılığı** (AGENTS.md: DB/embed/cluster doğrulaması orada). Yeni hat bu makinede ve ücretsiz bulutta çalışmalı.
7. **Açık issue'lar** (#59-#75, #81-#89 civarı): eski tasarıma (z-skoru, `radar score`, feedback CLI, digest, Cloudflare Radar/YouTube adaptörü) bağlı. M0'da kapatılıp yeni plana göre yeniden açılmalı.

### Eksik

- Aday **üretici** kaynaklar: Product Hunt, BetaList, Uneed, Reddit (Arctic Shift), Show HN, App Store/Play çıkış listeleri. Şu an yok.
- **Gelir kanıtı**: `main`'de yok (yalnız yer tutucu); dalda var.
- **TR doygunluk kontrolü**: `main`'de yok (yalnız yer tutucu). Mevcut tasarım SearXNG'a (3060) bağlı.
- Kaynaklar arası **birleştirme** (aynı ürün PH + Reddit + Apple'da): yok.
- **Çıktı**: okunabilir günlük/haftalık liste ya da sayfa yok; yalnız terminal Markdown'ı.
- **Zamanlayıcı**: yok (3060'ta elle).
- Fikir (kategori + ürün) ayrımı: şu an satır = repo/domain/model.

## 2. Kaynak araştırması (gerçek isteklerle)

Test: 2026-11-23, Windows makineden `curl` (UA: tarayıcı benzeri), anahtarsız. "Hız sınırı" sütununda yalnız gözlemlediğim ya da dokümanda gördüğüm yazılıdır; çoğu için kalıcı sınır **doğrulanmadı** (az sayıda istek attım).

### 2.1 Çalışıyor (kullanılacak)

| Kaynak | İstek | Sonuç | Verdiği sinyal | Not |
| --- | --- | --- | --- | --- |
| Product Hunt Atom | `https://www.producthunt.com/feed` | 200, 43 KB, 50 giriş (ad, yayın tarihi, tek satır açıklama, ürün URL'si) | "Yeni çıkan ürün" listesi (aday üretici) | Oy sayısı yok. Sıralama/oy için API token gerekir (GraphQL anahtarsız 401). |
| Reddit, Arctic Shift | `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=SideProject&after=2026-11-09&before=2026-11-16&limit=100&sort=asc` | 200, 100 gönderi, `score`, `num_comments`, `url`, `created_utc` | Topluluk ilgisi (skor/yorum), ürün tanıtımı | Canlı Reddit JSON 403, `.rss` 404; Arctic Shift tek yol. `sort_type=score` desteklenmiyor (yalnız `created_utc`), skora göre istemcide sıralanır. Taze gönderilerin skoru ~1 (henüz oy almamış): 1 haftalık gecikmeli pencere kullanılmalı. |
| Apple top charts | `https://rss.applemarketingtools.com/api/v2/{tr\|us}/apps/top-free/100/apps.json` | TR 10 → 200, US 100 → 200; `/200/` → 500 | Küresel ve TR kategori çıkışı (sıra); TR listesinde bulunmak = doygunluk kanıtı | Yalnız sıra verir, ivme için günlük snapshot gerekir. Limit 100'e kadar doğrulandı. Sürüm yönlendirmesi 301 (curl `-L`). |
| Apple iTunes Search/Lookup | `https://itunes.apple.com/search?term=...&country=tr&entity=software&limit=8`, `.../lookup?id=...&country=tr` | 200, ad, satıcı, `userRatingCount`, `averageUserRating`, tarihler | **TR doygunluğunun ana aracı**; global ürün için rating sayısı, mağaza tarihi | Dokümante limit ~20 istek/dk (hatırlamadan, **doğrulanmadı**); ~12 istekte sorun çıkmadı. `userRatingCount` `country=tr` ile mağaza bazlı mı, doğrulanmadı. |
| Google Play arama / çıkış sayfası | `https://play.google.com/store/search?q=...&c=apps&hl=tr&gl=TR`, `.../store/apps/top?hl=tr&gl=TR` | 200 (1.2 / 1.9 MB HTML) | 30 / 63 uygulama kimliği + ad (HTML'de `DdYX5` sınıfı) | Resmî API yok, HTML ayrıştırma kırılgan; kullanım koşulları gri. Yalnız TR doygunluk yardımcısı. |
| TrustMRR | `https://trustmrr.com/api/ai` | 200, 73 KB JSON: `recentlyListedStartups` (25) ve `bestDeals` (25); alanlar `revenue.mrr`, `last30Days`, `total`, `growthMRR30d`, `activeSubscriptions`, `category`, `askingPrice`, `website`, App Store/Play bağlantısı | **Gelir kanıtı** (doğrulanmış Stripe/RevenueCat bağlantılı) + aday üretici ("satışta" olanlar) | Anahtarsız. ADR 0003: yazılı izin gelmeden LLM'e verilmemeli; kişisel kullanım. Satışa çıkan ve `growthMRR30d` negatif olan ürün (ör. Landy AI −14%) olumsuz sinyal. |
| Hacker News Algolia (Show HN) | `https://hn.algolia.com/api/v1/search?tags=show_hn&hitsPerPage=3` | 200 | Show HN puanı/yorum = geliştirici ilgisi, ürün URL'si | `numericFilters` değerini URL-kodlamadan yollamak 400 verdi. Zaten repoda adaptörü var. |
| Wikipedia pageviews | `.../per-article/en.wikipedia/all-access/user/ChatGPT/daily/20261101/20261120`, `.../top/en.wikipedia/all-access/2026/11/20` | 200 | Ürün/marka makalesi olan şeyler için günlük ilgi (ivme) | Yalnız Wikipedia makalesi olan şeyler; yeni niş ürünler için işe yaramaz. İsteğe bağlı. |
| BetaList (HTML) | `https://betalist.com/` | 200, 51 `/startups/...` bağlantısı | Erken evre ürün listesi | `/feed` 404, yalnız HTML. Sayı/oy sinyali yok. |
| Uneed (HTML) | `https://www.uneed.best/` | 200, `/tool/...` bağlantıları | Günlük çıkış listesi | HTML ayrıştırma; oy sayısı ayrıştırılmadı (**doğrulanmadı**). |
| GitHub Search | `https://api.github.com/search/repositories?q=...` | 200, `total_count=1279` (örnek sorgu) | Yazılım ürünlerinde ivme (yıldız) | Zaten kodda; anahtarsız 10 istek/dk (Search). Dev-ağırlıklı, ikincil kaynak. |
| npm / PyPI / crates.io / VS Code | `api.npmjs.org/downloads/range/last-month/zod`, `pypistats.org/api/packages/fastapi/recent`, `crates.io/api/v1/crates?sort=recent-downloads`, `marketplace.visualstudio.com/_apis/public/gallery/extensionquery` | hepsi 200 | İndirme ivmesi; VS Code `trendingweekly/monthly` alanları döndü | Yalnız geliştirici araçları. Adayın paket adını bilmek gerekir (kaynak üretici değil, doğrulayıcı). Öncelik düşük. |
| Bluesky / Mastodon trends | `public.api.bsky.app/xrpc/app.bsky.unspecced.getTrends`, `mastodon.social/api/v1/trends/links` | 200 | Genel gündem (haber, olay) | Ürün değil gündem; "frivolous billionaire spending wishes", AP haberi. Düşük değer. |
| Google Trends RSS | `https://trends.google.com/trending/rss?geo=TR` | 200, 20 KB, günlük arama trendleri (`ht:news_item`) | TR'de günlük trend aramalar | Dizi/maç gibi gündem terimleri; ürün için gürültülü. İsteğe bağlı. |

### 2.2 Çalışmıyor ya da kullanışsız (bırak)

| Kaynak | Sonuç |
| --- | --- |
| Reddit canlı JSON / RSS | 403 / 404. Yalnız Arctic Shift kullanılır. |
| Indie Hackers (feed ve ana sayfa) | 403 Cloudflare "Just a moment". |
| Product Hunt leaderboard HTML, Peerlist | 403 Cloudflare. |
| Product Hunt GraphQL | 401 (token gerekli). Ücretsiz token alınabilir ama OAuth uygulaması ister; M1'de gerekirse eklenir, şimdilik Atom yeter. **Token akışı doğrulanmadı.** |
| Google Trends explore API | 429. |
| DuckDuckGo html / lite | 202 bot sayfası; Brave HTML 429; Mojeek JS challenge. Betikle web arama için kullanılamaz. |
| Starter Story | Ana sayfa 200 ama gelir verisi üyelik arkasında (`sitemap.xml` 0 giriş). Kullanılmaz. |
| Open Startups | Aranan adres ilgisiz (pt-BR WordPress sitesi döndü); doğru dizin **bulunamadı/doğrulanmadı**, bırakıldı. |
| BetaList feed | 404 (HTML var, bkz. üstte). |
| YouTube | Kanal RSS 200 ama arama için API anahtarı gerekir; ürün keşfi için değer düşük. X (Twitter) ücretsiz yol yok, test edilmedi. |

### 2.3 Gerçek çıktı örnekleri (kısaltılmış)

TrustMRR (`/api/ai`, `recentlyListedStartups`):

```
Landy AI | Artificial Intelligence | MRR 8328 | growthMRR30d -14 | AI landing page builder... (asking 190000)
prepi    | Health & Fitness         | MRR 18.14| growthMRR30d 100 | weekly meal plans + budget grocery list
Coralflavor | Artificial Intelligence | MRR 4381 | +71  | Private AI chatbot with E2E encryption
AppZoku  | Artificial Intelligence  | MRR 1527 | +1310 | marketing tool for solo iOS developers
Store Stock Checker | Analytics    | MRR 36005| +1205 | Realtime Apple Store stock checking (bestDeals)
```

Reddit r/SideProject, 2026-11-09 → 2026-11-16, skora göre ilk gönderi (Arctic Shift):

```
score 37, 24 yorum: "I built a free app that converts foreign prices with your phone camera"
score 6, 14 yorum: "I made a page that process hours of finance YouTube videos everyday ..."
```

Product Hunt Atom ilk girişleri: `Creavit Studio 4.0 (2026-11-20) https://www.producthunt.com/products/creavit-studio`, `TeaserKit (2026-11-19)`, `Webless Agents (2026-11-06)`. Not: `published` tarihi ürünün ilk tarihi, `updated` yeni; feed "son çıkanlar" sırasında değil ("Daymaker 2026-10-19" arada). Sıralama garantisi yok.

Apple TR top-free (ilk altı): `KadroBul, Threads, Google Gemini, Bubilet, ChatGPT, Claude`. VS Code: `GitByBit` `trendingweekly=1`, `trendingmonthly=4`.

## 3. TR doygunluk araştırması

Yöntem: ürün için 2 sorgu (TR + EN tanım), 3 kanal: Apple TR arama, Google Play TR arama, Bing TR (HTML). 3 örnek ürün TrustMRR'dan alındı (gerçek, güncel adaylar). Aşağıdaki liste gerçek çıktıdır (ad, TR mağaza rating sayısı, satıcı).

### Örnek 1: AI landing page builder (Landy AI, MRR 8,3 bin $)

- Apple TR `yapay zeka ile landing page oluşturucu` → ilgisiz AI video/ses uygulamaları (AI Skin Maker, Runway…).
- Apple TR `AI landing page builder` → `Linkbio` (90 rating), `Livgo - AI Website Builder` (0), `WisyLink` (1), `Regu - AI Website Builder` (2, satıcı *Mehmet Masa*), `AI App Builder - builder77` (0, *Huseyin Can Bayram*).
- Play TR (iki sorgu) → 8 `website builder` uygulaması (`com.douibi.landing.ai`, `website.builder.app`, `com.wisylink.app`...); rating çekilmedi.
- Bing TR → ChatGPT/Gemini/DeepAI sayfaları; landing-page rakibi çıkmadı (Bing sorgu yorumlaması gürültülü).
- **Hüküm: BELİRSİZ.** Mağazada TR kaynaklı küçük rakipler var (rating ≤2) ama ürün bir web SaaS; asıl rakipler (Wix, Framer, Hostinger AI) mağaza aramasında görünmez, Bing çıktısı güvenilmedi. Web SaaS için bu iki mağaza kanalı yetersiz, M3'te TR web araması çözümü şart.

### Örnek 2: AI haftalık yemek planı + market listesi (prepi, MRR 18 $, +100% 30g)

- Apple TR `haftalık yemek planı market listesi` → `Yemekify: Haftalık Yemek Planı` (0 rating, *Tarik Aydin*), `Meal Planner: AI Weekly Menu` (0, *NEXTLINE YAZILIM*), `Budgeat: Meal & Grocery Plan` (2, *Erdenay Karatas*), `Tomati` (870, *Bora Ogunc*), `Mealbird` (283, yabancı).
- Play TR → `meal.planner`, `com.zils.weeklymenu`, `com.purplecover.anylist`, `com.eco.grocerylist`, `shopping.list.organizer`…
- Bing TR → "meal" sorgusu Kur'an meali sonuçlarına kaydı: kullanılamaz.
- **Hüküm: BULUNDU (zayıf).** 3+ TR geliştirici uygulaması var ama rating 0-2: pazarda tanım var, çekiş yok. Fast follower için "alan boş değil, kazanan yok" anlamına gelir.

### Örnek 3: Ev eşyası envanteri / sigorta (ContentsKeeper, MRR 0 $)

- Apple TR `ev eşyası envanteri sigorta` → `Zula: Ev Envanteri` (1, *Taylan Derinbay*), `Roomful - Home Inventory` (0, *Faruk Orman*), `Personal Inventory - mythingss` (0, *Tuna Dag*), `WarrantyNest` (3, *Sitki Tugrul Yuksel*).
- Play TR `ev eşyası envanteri sigorta` → yalnız sigorta/emlak şirketi uygulamaları (`com.fibasigorta`, `net.arox.vakifemeklilik`, `com.emlakjet...`); envanter uygulaması çıkmadı.
- Bing TR → emlak ilanı sonuçları, ilgisiz.
- **Hüküm: BULUNAMADI (güçlü muadil).** Denenen: 2 sorgu × Apple/Play/Bing. 4 küçük iOS uygulaması (rating ≤3), Play'de hiç yok. Not: gelir kanıtı 0 $; boşluk var çünkü talep kanıtı da yok, bu yüzden gelir filtresi birlikte okunmalı.

### Sonuçlar

| Kanal | Çalıştı mı | Sinyal kalitesi |
| --- | --- | --- |
| Apple TR arama (iTunes) | Evet, 12 istek sorunsuz | Yüksek: satıcı adı + TR mağaza rating'i ile "var ama çekiş yok / var ve güçlü" ayrımı |
| Play TR arama (HTML) | Evet | Orta: kimlik + ad alınır, rating/yükleme sayısı ayrıştırılmadı; iyi eşleşme yapar (ilgisiz sonuçta "yok" demeye yarar) |
| Bing TR HTML | Çalışır ama | **Kullanılamaz** otomatik karar için: sorgu yanlış yorumlanıyor (meal → Kur'an meali, "yapay zeka" → ChatGPT). Resmî Bing Search API'nin kapandığını hatırlıyorum, **doğrulanmadı** |
| SearXNG | Test edilemedi (Docker yok) | 3060'ta mümkün; Workers'ta çalışmaz |
| Google/DDG/Brave/Mojeek betikle | Hayır (202/429/JS challenge) | Kullanılamaz |

Karar: TR doygunluğu **mağaza kanalları (Apple+Play) + TR rating** ile ölçülür; web SaaS için ayrıca ücretsiz bir arama kanalı gerekir (açık soru, M3 içinde çözülecek: ya SearXNG self-host (yerel yedek), ya Cloudflare/Google ücretsiz katmanı olan bir arama API'si; hiçbiri bu raporda doğrulanmadı). Çıktı her zaman `found` / `not_found (denenen sorgular + kanallar)` / `uncertain` olacak; "yok" tek başına yazılmaz.

Heuristik uyarı: "TR geliştiricisi mi?" kararı ad/ASCII Türkçe isim tahminine dayanır, yanlış olabilir; çekiş (TR mağaza rating'i) daha güvenilir ölçüdür.

## 4. Mimari önerisi (minimal)

```
GitHub Actions cron (günlük)  ──►  Node/TS betiği (tek komut: pnpm idea-stream)
   (yerel yedek: Windows Task Scheduler, aynı komut)
        │ 1) aday topla (PH, Arctic Shift, Show HN, BetaList/Uneed, TrustMRR, Apple chart)
        │ 2) ürün kimliğiyle birleştir (alan adı / store id)
        │ 3) veri noktaları + gelir kanıtı ekle
        │ 4) TR doygunluk kontrolü (Apple TR + Play TR, ilk N aday)
        ▼
   data/YYYY-MM-DD.json  (+ snapshots/ geçmiş)  ──►  repo'ya commit
        ▼
   Cloudflare Pages: statik sayfa (JSON'u okuyup fikir kartlarını listeler)
   + ideas/latest.md (haftalık, GitHub'da da okunur)
```

Gerekçe:

- **Depolama: git içindeki JSON.** Günlük birkaç yüz satır; ivme için "dünkü ile bugünkü" farkı yeter. Postgres/D1 gereksiz. D1 yalnız sayfa dinamik sorgu ister hâle gelirse (M5 sonrası).
- **Zamanlama: GitHub Actions cron** (genel repo için ücretsiz, özel repoda aylık dakika sınırı var; repo durumu doğrulanmadı). Cloudflare Workers Cron daha "Cloudflare-style" ama (a) Workers'ın çıkış IP'sinin Apple/Play/Reddit-mirror tarafından engellenip engellenmediği **doğrulanmadı**, (b) Play HTML ayrıştırması ve çok sayıda alt istek CPU süre sınırına takılabilir (ücretsiz plan sınırı **doğrulanmadı**). Bu yüzden toplama GitHub Actions/yerelde, **yayın** Cloudflare Pages'te. M5'te Worker egress denemesi yapılır; geçerse toplama oraya taşınabilir.
- **Embedding/GPU yok.** Ürün birleştirme alan adı + store id ile; kategori kuralla (TrustMRR kategorisi, Apple/Play kategorisi). İsteğe bağlı küçük LLM adımı (TR sorgu üretimi) Workers AI ücretsiz kotasıyla yapılabilir; kota **doğrulanmadı**, MVP'de kural tabanlı sorgu (ürün adı + TR açıklama anahtar kelimeleri).
- **Çıktı**: `data/latest.json` ve `ideas/latest.md`; sayfa JSON'u gösterir. Kart alanları: ürün adı, 1 cümle, kategori, veri noktaları (kaynak, değer, tarih, link), gelir kanıtı (varsa: MRR, 30g büyüme, link), TR hükmü (`found/not_found/uncertain` + sorgular + kanıt linkleri).

## 5. Plan (6 kilometre taşı)

Sıra: önce temizle (çalışmayan yükü at), sonra akış, sonra doğrulama. Kilometre taşı yalnızca hedefe hizmet eder; cila/refactor/test sayısı kapsam dışı.

**M0: Temizlik ve sıfırlama.** §1'deki zararlı listesini sil (pg/Python/embedding/cluster/opportunities/eski adaptörler/eski rapor ve arşiv), `pnpm check` yalnız kalan koda göre yeşil, `radar` komutu DB'siz çalışır hâle gelsin (`DATABASE_URL` zorunluluğu kalkar), ADR 0004 "JSON + Actions + Pages mimarisi" yazılır, eski issue'lar kapatılır. *Kabul:* temiz klonda `pnpm install && pnpm check` DB/Docker olmadan geçer; `git ls-files` içinde `.py`, `docker-compose.yml`, `db/` yok; mevcut GitHub/HN/HF `radar` çıktısı JSON'a yazılıyor.

**M1: Aday üretici kaynaklar.** PH Atom, Arctic Shift (r/SideProject, r/startups, r/AppIdeas gibi 3-5 alt reddit, 7 gün gecikmeli), Show HN, BetaList, Uneed, TrustMRR `/api/ai`, Apple top-free (US) kategorileri; hepsi aynı `Candidate` şemasına (ad, URL, kaynak, veri noktaları) dönüşür; alan adı/store id ile birleştirilir. *Kabul:* gerçek bir günde koşu ≥30 birleştirilmiş aday verir; her adayın ≥1 kaynak linki ve ≥1 sayısal veri noktası (skor, MRR, sıra, yorum) var; ≥4 kaynak ≥1'er aday üretti. Gelir/TR alanı henüz boş olabilir.

**M2: Veri noktaları ve ivme.** Günlük snapshot'lar git'te (`data/snapshots/`); Apple chart sıra değişimi, Reddit skor/yorum, HN puanı, TrustMRR `growthMRR30d`. İvme hesabı basit fark/oran (z-skoru yok). *Kabul:* 7 gün sonra ≥10 adayın ≥2 zaman noktası ve işaretli bir değişimi var; kartta "neden yükseliyor" tek satırda sayıyla yazılı.

**M3: TR doygunluk kontrolü.** Apple TR arama + Play TR arama (+ Apple TR top-100'de var mı). Kurallı TR sorgu üretimi (ad + açıklamadan anahtar sözcük, TR+EN), hüküm `found/not_found/uncertain` + sorgular + rating kanıtı. Web SaaS için ücretsiz arama kanalı seçimi (SearXNG yerel yedek ya da başka) bu kilometre taşında kararlaştırılır. *Kabul:* §3'teki 3 örnek aynı hükümleri (found-zayıf / uncertain / not_found) yeniden üretir; 15 aday elle kontrolde ≥12'sinde hüküm doğru (kullanıcı onayı); bir hüküm sorgusuz yazılmaz.

**M4: Fikir kartı ve liste çıktısı.** Aday + gelir + TR hükmü birleşip sıralı `ideas/YYYY-MM-DD.md` ve `data/latest.json` üretir (sıralama: ivme × TR boşluğu × gelir kanıtı, kural tabanlı). *Kabul (nihai test):* gerçek bir günde pipeline çalışır; ≥10 ürün fikri çıkar; her birinde ≥2 veri noktası + kaynak linkleri, gelir kanıtı ya da "aranmadı/yok" ve TR hükmü + kanıt vardır; kullanıcı listeyi 10 dakikada okuyup ≥3 fikri "yapmaya değer" bulur.

**M5: Zamanlama ve yayın.** GitHub Actions günlük cron (yerel yedek: Task Scheduler), çıktıyı commit'ler; Cloudflare Pages statik sayfası `latest.json`'u gösterir; Workers egress denemesi (Apple/Play/Arctic Shift) yapılıp sonuç ADR'ye yazılır. *Kabul:* 3 ardışık gün insansız koşu, 3 yeni günlük dosya; sayfa herkese değil kullanıcıya açık URL'de güncel listeyi gösterir; koşu başarısızsa Actions kırmızı olur (sessiz boş liste yok).

## 6. Doğrulanamayanlar

- Hız sınırları (iTunes ~20/dk dahil) ve toplu çalışmada engellenme: yalnız ~50 isteklik küçük örnek.
- Cloudflare Workers'tan Apple/Play/Arctic Shift/TrustMRR erişimi, Workers CPU/alt-istek sınırları, Workers AI ücretsiz kotası.
- GitHub Actions dakika kotası bu repo için; Cloudflare Pages ücretsiz sınırları (hatırlamadan).
- Apple `userRatingCount`'ın `country=tr` ile TR mağazasına özgü olup olmadığı.
- Play TR sonuçlarının rating/yükleme sayısı (ayrıştırılmadı).
- Product Hunt oy sayısı (token akışı kurulmadı); Uneed/BetaList oy sayıları.
- Web SaaS için güvenilir TR web araması (Bing/DDG/Brave/Mojeek denendi, kullanılamadı; SearXNG test edilemedi).
- TrustMRR verisinin kalıcı erişimi ve kullanım izni (ADR 0003 kaydı: yazılı izin yok).
- Open Startups, Starter Story, Indie Hackers verisine ücretsiz erişim: bulunamadı.
- `feat/radar-gelir-kaniti` ve `feat/radar-tr-apple` dallarının kodu bu işte çalıştırılmadı, yalnız diff boyutu ve komut adlarına bakıldı.
- Bu rapordaki hiçbir kod uçtan uca çalıştırılmadı; yalnız ham HTTP istekleri ve tek seferlik ayrıştırma betikleri vardı.
