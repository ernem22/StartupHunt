# Trend radar — oturum notu (29 Ekim 2026)

> Bu not, mevcut sistemin denetimini, hedef değişikliğini ve trend radarı için kaynak değerlendirmesini tek yerde toplar. Kod değişikliği yok. Doğrulama durumu her maddede belirtilmiştir: **[doğrulandı]** = birincil kaynak veya repo kodu okundu; **[ikincil]** = yalnız üçüncü taraf kaynak; **[doğrulanmadı]** = kontrol edilmedi.

---

## 1. Mevcut sistemin denetimi (spec #18 ↔ ticket'lar ↔ ADR ↔ kod)

### 1.1 Ana bulgu: ticket'lar spec'i parçalamadı, yeniden tasarladı

- #18 2026-10-21 17:02'de açıldı; #19–#31 on üç dakika sonra 30 saniye içinde açıldı. #18 hiç düzenlenmedi; LOG'da "#18 body'sine dokunulmadı" yazıyor. Yön değişikliğinin gerekçesi hiçbir yerde kayıtlı değil. **[doğrulandı]**
- Kod ve ADR'ler ticket'ları izliyor; spec eski tasarımda kaldı. AGENTS.md okuma sırası "ticket → spec" olduğu için sonraki agent iki çelişkili talimat okur.

| Konu | Spec #18 | Ticket'lar / ADR / kod |
|---|---|---|
| Digest | 20 kart sabit karışım (10 A/B + 5 C + 5 rising) | Kotasız, en fazla 10 kart, 0 geçerli |
| Kademeler | A/B/C/D/rising | Yok |
| Kapı | 4 koşul, her zaman ≥2 bağımsız kaynak | 6 koşul + tek kaynak istisnası + LLM karşı argümanı |
| Geri bildirim | `knew/new/investigate/drop`, açık etiket | `open/investigate/drop/knew`, implicit; `new` yok |
| Etiket | "50 elle etiket olmadan uygulanmış sayılmaz" | #31: "ek etiketleme yoktur" |
| İş sırası | etiket → kaynak/lisans → çıkarım → digest | çıkarım → digest önce; kaynaklar (#25) açık |

### 1.2 Karar bekleyen çelişkiler (ciddiyet sırasıyla)

1. **Tek kaynak istisnası kapıyı deliyor.** `nextStepMinutes <= 15` olan aday tek kaynakla geçiyor. Spec'te yok; story 7–8 ile ve ADR 0001'in kendi sonuç maddesiyle ("Tek bir güçlü thread fırsat gibi görünemez") çelişiyor. Değer extractor'dan geliyor (`src/opportunities/build.ts:131`); #24'ten sonra LLM yazacak → spec §4 "LLM kapıyı tek başına geçemez" ihlali. **[doğrulandı]**
2. **LLM eleme yapıyor.** Karşı argüman `strong` ise kart düşüyor (`build.ts:182`). Spec kapsam dışı listesi: "LLM'in ... eleme yazması". Kanıt arşivde kalıyor, yine de ihlal. **[doğrulandı]**
3. **#25 ve #22 birbirini kilitliyor.** #25: tek kaynak %30'u geçerse veya <3 kaynak varsa digest reddedilir. #22: 1–3 kartlık digest geçerli. 1 kartlık digest her zaman %100 tek kaynak → hep reddedilir. Çok kaynaklı kartta "kaynak payı" tanımsız. Spec içinde de çelişki: story 20 "reddet", §7 "açıkça söyle".
4. **Etiket kimse üretmiyor ama ikisi ona dayanıyor.** #29 "insan etiketli örneklem" ister, #31 "etiket yok" der, spec 50 etiketi ilk adım sayar.
5. **Asıl hedef ölçülmüyor.** `new` verdict'i ve "yeni oranı" metriği kaldırıldı; #31'de karşılığı yok.

### 1.3 Spec'in kendi içindeki çelişkiler

- C kademesi "tek kaynak" ama kapı ≥2 bağımsız kaynak istiyor → C imkânsız.
- İki bağımsızlık tanımı: §2 "farklı yazar + thread/topluluk", §5 "farklı topluluk + yazar + zaman penceresi". Kod: thread + yazar + metin; topluluk/zaman yok.
- Rising'in kapıdan geçip geçmeyeceği yazmıyor (#26 "geçer" diye karar vermiş).

### 1.4 Kapsam boşlukları (spec'te var, ticket'ta yok)

- Incremental build (`--since/--limit/--dry-run`, story 35).
- `digest --week` (kod `--now` eklemiş).
- Kartta mevcut ürünler/fiyatlar, denenip bırakılmış izi, zıt kanıt.
- `time-to-first-insight` metriği.
- Yanlışlama notu şablon: `next_step`'ten üretiliyor (`src/opportunities/digest.ts:93`). **[doğrulandı]**

### 1.5 Doğrulanan, sorunsuz olanlar

- Spec rakamları kaynakla eşleşiyor: 54.579 obs, 252 pattern, %44 noise, 1.024 (cold-email) mega-cluster, SaaS 50.3k + HN 5.2k, 250 aktif + 2 junk (`LOG.md:27-29`, `LOG.md:79`). Not: 50.3k + 5.2k = 55.5k, ham ~50.7k ile tutmuyor. **[doğrulandı]**
- `review_status` yalnız insan ilkesi spec/ADR/standards'ta tutarlı.

### 1.6 Kodda doğrulanan yapısal sorunlar

1. **"≥2 bağımsız kaynak" gerçek veride hiç devreye girmez.** Gruplama `sha256(actor+job+problem)` ile birebir metin eşleşmesi (`src/opportunities/key.ts`, `build.ts:250`). İki farklı LLM çıktısı aynı üç cümleyi yazmaz → her grup tek kanıt → yalnız 15 dk istisnası geçer. Testler, fixture'da aynı metin elle yazıldığı için yakalamıyor. **[doğrulandı — kod okundu, çalıştırılmadı]**
2. **Kümeleme fırsat katmanına bağlı değil.** `src/opportunities/` pattern okumuyor. **[doğrulandı]**
3. **LLM'den tek post'tan bilemeyeceği şeyler isteniyor:** bilinen ürün, neden yetmediği, karşı argüman, 15 dk sonraki adım. Bunlar grup düzeyinde ve aramayla üretilmeli.
4. **Korpus amaca ters:** ~%90 r/SaaS; en büyük kümeler founder problemleri (cold email, UGC, SEO, validation, Stripe, cofounder).
5. **Kanıt eşiği ile yenilik çelişiyor;** wildcard/C yolu kotasız tasarımda kaldırıldı.
6. **#24 engelleri:** `extractor.extract()` senkron (`build.ts:246`), LLM async olmalı; `build` her koşumda tüm observation'ları tek transaction'da tarıyor (`build.ts:217`).

---

## 2. Hedef değişikliği

- İlk yorum (spec #18): kişisel keşif motoru, "neye bakmaya değer".
- Ara öneri (reddedildi): "kim, hangi işinde, hangi workaround'la; onunla konuş" çıktısı.
- **Yeni hedef (kullanıcı, 2026-10-29):** şu an viral olan ürünleri bulup benzerini (birebir değil) yaparak pazardan pay almak — **"same but better"**, fast follower.

### 2.1 Önerilen iki katmanlı yapı

1. **Yükseliş dedektörü:** mutlak popülerlik değil, haftalık ivme. Ortak kimlik (domain / `owner/repo` / app ID / paket adı) + kaynak başına zaman serisi + kendi geçmişine göre sapma. Aynı varlık ≥2 bağımsız kaynakta ivmeleniyorsa aday.
2. **Boşluk çıkarıcı:** yükselen ürün için şikâyetler, "alternative to X", fiyat itirazları, TR muadili var mı (FAZ 14 counterpart). Mevcut acı madenciliği burada yeniden kullanılır.

### 2.2 Riskler

- Viral AI araçlarının haftalar içinde onlarca klonu çıkıyor; fark segment, yerelleştirme (TR) veya fiyattan gelir.
- Viral ≠ para. Fiyat sayfası / ücretli plan / doğrulanmış gelir daha güçlü sinyal.
- Marka, logo, birebir arayüz ve kod kopyalamak ihlal; "benzer" sorun değil.

### 2.3 Mevcut repodan ne kalır

- **Kalır:** collector'lar, embedding, trend altyapısı (`metric_snapshots`, FAZ 11 ±2σ), TR counterpart, kanıt izlenebilirliği, digest + geri bildirim iskeleti.
- **Kökten değişir:** #18, ADR 0001, #25–#31'in çoğu.
- **Önemi azalır:** kümeleme.

---

## 3. Doğrulanan kritik olgular (29 Ekim 2026)

| Olgu | Durum | Kaynak |
|---|---|---|
| GitHub stargazer listesi 30 Haziran 2026'dan beri yalnız admin/collaborator | [ikincil, çok kaynak hemfikir] | [star-history](https://www.star-history.com/blog/github-stargazer-api-restriction/), [discussion #201209](https://github.com/orgs/community/discussions/201209) |
| Yeni endpoint `GET /repos/{owner}/{repo}/stargazers/history`; tek istekte ≤30 hafta günlük sayım; public repoda auth gerekmez; geri alınan star görünmez | [doğrulandı + gerçek istekle test edildi, bkz. §8.1] | [GitHub changelog 2026-09-04](https://github.blog/changelog/2026-09-04-new-api-endpoint-provides-privacy-safe-star-history-data/), [discussion #206104](https://github.com/orgs/community/discussions/206104) |
| Perplexity'nin verdiği `/stats/star_history` yolu **yanlış** | [doğrulandı] | yukarıdaki changelog |
| GH Archive `WatchEvent` yakalama oranı 2025-05-24'ten itibaren düşüyor; 2026-07/08'de ~%1 (~8,5k/gün vs ~190k beklenen). Diğer event türleri normal | [ikincil — iki bağımsız tekrarlanabilir ölçüm, resmî açıklama yok] | [gharchive #320](https://github.com/igrigorik/gharchive.org/issues/320) |
| Repo etkisi: `src/adapters/gharchive.ts:4,74` zaten `WatchEvent`'i atıyor; star sinyali için GH Archive kullanılmamalı | [doğrulandı] | repo kodu |
| Reddit: yeni public Data API erişim talepleri **31 Ekim 2026**'da kapanıyor; RSS 13 Kasım; kalan public erişim Mart 2027 | [ikincil, kaynaklar hemfikir; Reddit duyurusu okunmadı] | [looot.ai](https://looot.ai/blog/reddit-api-shutdown), [beri.net](https://www.beri.net/article/reddit-public-api-shutdown-march-2027-social-listening-ai-data-license-deadlines) |
| Apple Search Ads popülerlik puanı 5–100 (1–5 değil); anahtar kelimelerin ~%90'ı taban 5'te | [ikincil, satıcılar] | [MobileAction](https://www.mobileaction.co/blog/apple-search-popularity-decoded/), [SplitMetrics](https://help.splitmetrics.com/en/articles/3551875-keyword-popularity-and-long-tail-keywords-in-apple-ads) |
| HN Algolia limiti IP başına saatte 10.000 | [ikincil, Algolia API sayfasından alıntı] | [dev.to karşılaştırma](https://dev.to/odeeb/hacker-news-firebase-api-vs-algolia-which-one-to-use-3g2n) |
| Cloudflare Radar `GET /radar/ranking/top?rankingType=` (`TRENDING_RISE` / `TRENDING_STEADY` / `POPULAR`), trending'de `pct_rank_change`; sıralı liste yalnız ilk 100, gerisi bucket; ücretsiz token; lisans CC BY-NC 4.0 | [ikincil + Cloudflare docs araması; resmî metot sayfası açılmadı] | [Cloudflare domain ranking datasets](https://developers.cloudflare.com/radar/investigate/domain-ranking-datasets/), [Windmill script](https://hub.windmill.dev/scripts/cloudflare/6540/get-top-or-trending-domains-cloudflare/5410/versions) |
| Product Hunt API: "must not be used for commercial purposes"; GraphQL 6.250 complexity / 15 dk, diğer 450 istek / 15 dk | [doğrulandı] | [PH API docs](https://api.producthunt.com/v2/docs), [rate limits](https://api.producthunt.com/v2/docs/rate_limits/headers) |
| Google Trends resmî API: Temmuz 2025'te alpha, Ekim 2026'da hâlâ başvuruyla; fiyat/kota yok. pytrends 17 Nisan 2025'te arşivlendi | [ikincil, çok kaynak] | [cite42](https://www.cite42.dev/blog/google-trends-api), [scrapegraphai](https://scrapegraphai.com/blog/google-trends-api) |
| npm downloads: tek istekte ≤18 ay, sessizce kesiyor; bulk ≤128 paket / 365 gün | [doğrulandı + ikincil] | [npm blog](https://blog.npmjs.org/post/164799520460/api-rate-limiting-rolling-out.html), [TanStack](https://tanstack.com/blog/npm-stats-the-right-way) |
| pypistats: günlük güncelleme, ~180 gün saklama; uzun geçmiş için BigQuery | [doğrulandı] | [pypistats API](https://pypistats.org/api/) |
| Hugging Face: `/api/models?sort=trendingScore`; anonim 500 / 5 dk, free kullanıcı 1.000 / 5 dk | [doğrulandı + ikincil] | [HF rate limits](https://huggingface.co/docs/hub/en/rate-limits) |
| Apple yeni RSS (`rss.marketingtools.apple.com`): yalnız top-free/top-paid, kategori filtresi yok, ≤100. Eski `itunes.apple.com/.../rss`: grossing/new + genre + bundle ID. Geçmiş yok, snapshot gerekir | [gerçek istekle test edildi, bkz. §8.1] | [Apify actor açıklaması](https://apify.com/insight.solutions/app-charts-api) |
| Google Play herkese açık top chart sunmuyor | [ikincil] | aynı kaynak |
| Tranco 30 günlük ortalama, ilk 1M → erken tespit için değil, geç doğrulama için | [ikincil] | [Next Gen Nexus](https://thenextgennexus.com/2026/05/14/alexa-rank-is-dead-heres-what-replaces-it-in-2026-free-api/) |
| Google cache 2024'te kaldırıldı (bir rapor hâlâ öneriyordu) | [model bilgisi, bu oturumda aranmadı] | — |

### 3.1 Prior art (aynı işi yapanlar)

- **Fluenta** — 52 kaynak (PH GraphQL, Arctic Shift, HN Algolia, 50+ star GitHub, HF, Fazier). Bulgular: dalga GitHub'da 2 günde zirve, ürünler (PH) çok daha geç ve az; PH listelemelerinin %61'i ≤1 oy. [rapor](https://fluenta.space/resources/reports/state-of-new-business-ideas) [ikincil, tek kaynak]
- **trend-pulse** (MIT) — 37 kaynak, snapshot/history, velocity. Collector katmanı için incelenmeli. [repo](https://github.com/claude-world/trend-pulse) [kod incelenmedi]
- **App Store Radar** — Apple günlük snapshot, review/chart ivmesi, BUILD/WATCH/REJECT. [repo](https://github.com/geekjourneyx/app-store-radar) [kod incelenmedi]
- **trend-monitor** (MIT) — PH, Toolify, TAAFT, Chrome, GitHub Trending, HN. [repo](https://github.com/dongzhang84/trend-monitor)

---

## 4. Dış raporların değerlendirmesi

| Rapor | Güçlü | Hatalar |
|---|---|---|
| Perplexity #1 (alternatif kaynaklar) | Meta Ad Library, Certificate Transparency, newsletter RSS fikirleri | Tablonun ~9 satırı `signals.gitdealflow.com` (kendi ürününü öneren satıcı); AppGazers/AppTweak kendi bloglarından; Apple popülerlik 1–5 (yanlış) |
| Perplexity #2 (birincil kaynaklı) | Genel olarak kullanılabilir | `/stats/star_history` yolu yanlış; HN Algolia limiti kendi içinde çelişkili ("günde" / "saatte") |
| You.com Research | En çok birincil kaynak; GH Archive çöküşünü ayrıntılı buldu; Apple RSS, Tranco gecikmesi, HF trendingScore, Fluenta | `/stargazers/history`'yi kaçırdı, kapanmış stargazers listesini önerdi; Reddit 31 Ekim yok; skor ağırlıkları kaynaksız; Tranco "ticari serbest" satıcı blogundan |
| "Yeniden doğrulanmış" metin | Güven seviyesi ayrımı | "GH Archive kullan, GitHub API ile çapraz doğrula" — çapraz doğrulama artık mümkün değil; `/stargazers/history` yine yok |
| "Gerilla" listesi | Cloudflare Radar trending, küçük lansman siteleri, AI dizinleri, eklenti ivmesi fikirleri | Google cache (yok); Tranco "yeni SaaS için" (tersi); CrUX "erken sinyal" (aylık, eşikli → geç); puan tablosu göz kararı, en yüksek ağırlık bozuk GitHub star'a |

**Genel ders:** dört araç da farklı yerlerde yanıldı. Prototipte her kaynak için ilk iş gerçek istek atıp beklenen alanların geldiğini görmek.

You.com Research API ayrıca değerlendirildi: trend radarı değil, araştırma asistanı. Boşluk çıkarıcı katmanda `output_schema` ile aday başına yapılandırılmış JSON (rakipler, fiyatlar, şikâyetler, TR muadili) için uygun; `deep` ~$0,10/sorgu (doğrulanmadı). Şimdilik bağlanmayacak; ücretli.

---

## 5. Ücretsiz kaynak listesi (karar)

### 5.1 Ana katman — resmî API, ücretsiz, düşük risk

| Kaynak | Rol | Erişim |
|---|---|---|
| HN Algolia + Firebase | Keşif (Show HN, domain) + geçmişe dönük bahis sayısı | Anahtarsız |
| GitHub Search | Keşif (son N gün oluşturulan, star'a göre) | Ücretsiz token (Search için pratikte şart) |
| GitHub `stargazers/history` | İvme, 30 hafta geriye | Public repoda anahtarsız |
| Hugging Face `trendingScore` | Keşif + hazır ivme | Anahtarsız / ücretsiz token |
| npm downloads, pypistats | İvme (dev araçları) | Anahtarsız |
| Apple RSS (yeni + eski) | Mobil; snapshot hemen başlamalı | Anahtarsız |
| Wikipedia Pageviews | Geç doğrulama (büyük ürünler) | Anahtarsız |
| Cloudflare Radar trending | Domain ivmesi (yalnız büyük ölçek) | Ücretsiz token; CC BY-NC |
| Firefox AMO API | Eklenti ivmesi (günlük kullanıcı, haftalık indirme) | Anahtarsız [doğrulanmadı] |
| Product Hunt GraphQL | Keşif; oy eşiğiyle; snapshot hemen başlamalı | Ücretsiz token; yalnız kişisel/ticari olmayan |
| YouTube Data API | Mevcut adapter | Günde 10.000 birim |

### 5.2 İkinci katman — scraping, her site ayrı kontrol (robots/ToS)

Uneed, Microlaunch, Peerlist, Fazier, AlternativeTo, Futurepedia, TAAFT, FutureTools, Chrome Web Store (sayılar yuvarlanmış), IndieHackers (kendi beyanı), Arctic Shift (topluluk, SLA yok).

### 5.3 Yalnız geç doğrulama

Tranco, CrUX.

### 5.4 Çıkarılanlar

- Ücretli: X API, Similarweb, Semrush, Exploding Topics, Glimpse, Apify actor'leri, TrustMRR (fiyat belirsiz), You.com / Perplexity API.
- Yok: Google cache.
- Kırılgan / başvurulu: pytrends, Google Trends alpha, TikTok Research (akademik/kâr amacı gütmeyen).

---

## 6. Açık kararlar

1. **Reddit API başvurusu — son gün 31 Ekim 2026 geçti (1 Kasım itibarıyla).** Başvuru yapılıp yapılmadığı bu notta kayıtlı değil. Yapılmadıysa Reddit yalnız Arctic Shift dump'ları üzerinden tarihsel kaynak olarak kalır (§8.3); canlı sinyal planlanmaz.
2. **#18'in kaderi:** yeni hedef (fast follower) spec'i baştan değiştiriyor. #24–#31 bu hâlleriyle agent'a verilmemeli.
3. **Ürün tipi, hedef pazar (global / TR / global→TR), kurma hızı** — kaynak önceliğini belirler; henüz cevaplanmadı.

---

## 7. Sonraki adım

1. trend-pulse kodunu yarım saat incele → collector'lar kullanılabilir mi kararı.
2. Prototip (maliyet sıfır, bu makinede doğrulanabilir): HN Algolia + GitHub Search + `stargazers/history` + HF trendingScore → son 4 haftada en hızlı yükselen 20 ürün, her biri için kaynak bazında sparkline.
3. Product Hunt ve Apple RSS günlük snapshot'ını hemen başlat (geçmişleri yok).
4. Gerekli: GitHub token (ve isteğe bağlı PH token) `.env`'e; koda gömülmez.

---

## 8. Ek: "Kaynak Fizibilite Raporu (Ekim 2026)" değerlendirmesi

Altıncı dış rapor. Şimdiye kadarkilerin en iyi kurgulanmışı; Reddit kaynakları en güçlüsü, istatistik önerileri en sağlamı. Ama GitHub bölümü yanlış ve önerdiği minimum set buna dayanıyor.

### 8.1 Gerçek istek testleri (29 Ekim 2026, bu makineden)

| Test | Sonuç |
|---|---|
| `rss.marketingtools.apple.com/api/v2/us/apps/top-free/100/apps.json` | HTTP 200, 100 sonuç |
| Aynı akış `/200/` | **HTTP 500** → yeni akışın tavanı 100. Raporun "top-200" iddiası **yanlış** |
| Eski akış `itunes.apple.com/us/rss/topgrossingapplications/limit=200/genre=6000/json` | Çalışıyor, kategori filtresiyle; `limit=200` istense de 100 kayıt dönüyor. Raporun "eski feed ölü" iddiası bu host için **yanlış** (rapor `rss.itunes.apple.com`'dan söz ediyor, o ayrı host; test edilmedi) |
| `api.github.com/repos/astral-sh/uv/stargazers/history` (token yok) | **HTTP 200**; her eleman `{week, total, days[7]}` → haftalık toplam + günlük dağılım. Beş raporun kaçırdığı endpoint çalışıyor |

Not: Rapor `rss.applemarketingtools.com` host'unu veriyor; test edilen `rss.marketingtools.apple.com`. İkisi de çalışıyor olabilir, ikincisi doğrulandı.

### 8.2 Hatalar

- **GitHub:** "REST sadece anlık star verir; GH Archive ile 2011'den beri saatlik star serisi → ±2σ ilk günden çalışır." İki yanlış: `stargazers/history` var (§8.1), GH Archive `WatchEvent` 2026'da ~%1 yakalıyor (§3). Minimum setteki GitHub gerekçesi bu yüzden geçersiz; doğru yol `stargazers/history`.
- **Apple top-200:** yanlış (§8.1).
- **"Hiçbir açık kaynak araç acceleration testi yapmıyor":** trend-pulse velocity/direction alanı taşıyor; Fluenta çok kaynaklı zamanlama analizi yapıyor (§3.1). Rapor bunları bulmamış; iddia fazla güçlü.
- **VS Code Marketplace "resmî public API var":** bildiğim kadarıyla kullanılan `extensionquery` endpoint'i belgelenmemiş bir galeri API'si. [doğrulanmadı]

### 8.3 Yeni ve değerli olanlar

- **Reddit takvimi en iyi kaynakla:** TechCrunch 30.09.2026 ve r/redditdev duyurusu 01.10.2026. Takvim: 31.10.2026 yeni istekler durur → 13.11.2026 RSS kapanır → 12.01.2027 kayıtsız uygulamalar kesilir → Mart 2027 public erişim biter, Devvit'e geçiş. Öneri: Reddit'i canlı sinyal olarak planlama; dump'ları şimdi indir. [ikincil, ama birincil duyuruya atıflı; duyuru açılmadı]
- **HN Algolia tek sorguda en fazla 1.000 hit;** `page` bunu aşamıyor → backfill tarih aralıklarına bölünerek yapılmalı (`numericFilters=created_at_i>…,created_at_i<…`).
- **YouTube:** `search.list` 1 Haziran 2026'dan beri ayrı kovada (~100/gün) → keşif için ölü; bilinen kanalları `videos.list` (1 birim) ile izle. API ToS'un 30 günden uzun saklamayı kısıtladığı iddiası [doğrulanmadı] ama tarihsel YouTube veritabanı planı en kötü varsayımla yapılmalı.
- **Cloudflare Radar (CC BY-NC):** ürün ticarileşince bu veriyi bırakma kuralı mimariye baştan yazılmalı.
- **Ek kaynak adayları:**
  - Bluesky Jetstream — ücretsiz, anahtarsız firehose; X'e göre düşük ToS riski. [doğrulanmadı]
  - WordPress plugin "active installs" — resmî `api.wordpress.org` (sayılar kaba aralıklı). [doğrulanmadı]
  - Shopify App Store — scraping.
  - Steam / SteamSpy — tüketici oyunları; ToS gri.
  - crt.sh — yeni domain'in ilk görülme zamanı (önceden de listede).
  - HN "Who is hiring" — paranın erken kanıtı; elle parse.
- **Prior art (yeni, incelenmedi):** BuilderPulse (açık kaynak, HN + GitHub + PH günlük rapor), product-scout (Claude Code skill), TrendNexus (yalnız GitHub). Rapor "BuilderPulse'ın toplama katmanını fork'la" diyor; trend-pulse ile birlikte değerlendirilecek.
- **Akademik referanslar** [hiçbiri doğrulanmadı]: Kraishan 2025, arXiv:2511.04453 (HN görünürlüğü → GitHub star büyümesi); Aljadaan 2026 (PH lansman sinyalleri); 55 startup'lık "engineering velocity" preprint'i (Research Square). Rapor, star'dan çok commit/release/contributor hızının tahmin edici olduğunu söylüyor.

### 8.4 Yöntem notları (rapordan, mantıklı bulunanlar)

- **±2σ çoğu kaynakta uygun değil.** Rank verisi (App Store, PH sıralaması) ağır kuyruklu; Chrome sayıları yuvarlanmış; Wikipedia/YouTube haftalık serileri gürültülü.
  - Sayım verisi: log dönüşümü + robust z-score (median/MAD), en az 8–12 haftalık geçmiş, "≥3 ardışık hafta MAD üstü" gibi kalıcılık kuralı.
  - Rank verisi: σ yerine rank deltası (ör. "listeye giriş + 5 günde 40+ sıra tırmanış").
  - Düşük hacimli sayımlarda shrinkage (You.com raporu da aynı uyarıyı yapmıştı).
- **Kaynak aileleri:** "≥2 bağımsız kaynak" ancak farklı ailelerden gelirse anlamlı. HN + PH + X çoğu zaman aynı hype'ı üç kez ölçer.
  - Hype / aday üreteci: PH, HN, (X, TikTok).
  - Adoption / doğrulayıcı: GitHub `stargazers/history`, npm/PyPI, Wikipedia, App Store kalıcılığı, Firefox AMO.
  - Değer, doğrulayıcının aday üreteciyi onayladığı yerde; tersi değil.
- **Entity resolution en zor iş.** Kanonik anahtar = domain; GitHub `homepage`, PH `website`, npm `repository`, App Store satıcı URL'inden türet. Rapor bütçenin ~%40'ını öneriyor (sezgisel).
- **Snapshot'a bugün başla:** HF trending, App Store, PH oyları, Chrome/Firefox sayıları geçmiş tutmuyor.
- **Sürdürülebilirlik sıralaması (raporun kendi sentezi, kanıtlanmamış):** contributor/kurulum artışı > release ritmi > tekrar eden organik bahis > app listesinde 5+ gün kalma > Wikipedia'da lansman sonrası sığ düşüş > PH oyu / X impression.
