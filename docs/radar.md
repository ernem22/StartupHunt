# Trend radar

`pnpm radar` veritabanı olmadan çalışır: üç kaynağı (GitHub, HN Algolia, Hugging Face) gerçek API'lerden çeker, Markdown'ı stdout'a yazar ve JSON'u `data/latest.json` ile `data/YYYY-MM-DD.json` dosyalarına yazar (bkz. ADR 0004). Bir kaynak başarısız olursa JSON yazılmaz ve komut hata ile biter. İsteğe bağlı `GITHUB_TOKEN` süreç ortamından verilir; radar `.env` yüklemez.

JSON biçimi: `{ generatedAt, commit, sources: [{ manifest, status, entityType, metric, candidates: [{ name, description, url, historyUrl, weeks, score?, momentum }] }] }`. `momentum` ham ivmedir (haftalık oran ya da HF `trendingScore`); `null` sıfır tabanlı, sıralanamayan adaydır.

Üst düzey `candidates` alanı: aday üretici kaynakların (Product Hunt, Reddit, Show HN, TrustMRR, Apple) birleştirilmiş listesi. Her aday `{ key, name, url, sources[], dataPoints[] }`; `key` alan adı (`landy-ai.com`) ya da mağaza kimliğidir (`apple:<id>`, `play:<paket>`, `github:<sahip/repo>`, `producthunt:<slug>`, `trustmrr:<slug>`). Her veri noktası `{ source, metric, value, date, url }` taşır; `url` o sayının kaynak linkidir. Aynı `key` farklı kaynaklarda geçerse tek adaya birleşir. Kaynak hatası `errors` listesine yazılır, diğer kaynaklar yine çalışır.

## Kaynaklar (M0 hâli; yenileri M1)

- **GitHub:** `topic:developer-tools` sorgusunun ilk 30 reposu, `stargazers/history` ile son dört tamamlanmış UTC haftası; ivme = (son hafta − önceki hafta) / önceki hafta. Eksik geçmişli repo dışlanır, sıfır tabanlı aday sıralanmaz.
- **HN Algolia:** `developer` ve `AI tools` sorguları, son dört tamamlanmış hafta; ürün kimliği bağlantı alan adı (ya da GitHub repo). İçerik siteleri `NON_PRODUCT_DOMAINS` ile elenir.
- **Hugging Face:** `trendingScore` sıralı ilk 30 model; tek noktalık ölçü.

- **Aday üreticiler (M1):** hepsi anahtarsız; her kaynak birkaç istek atar. Hatası `errors`'a düşer.
  - **Product Hunt:** Atom feed (`producthunt.com/feed`), 50 giriş. Oy sayısı yok; veri noktası feed sırasıdır (`ph_feed_position`), oy ya da popülerlik değildir.
  - **Reddit (Arctic Shift):** r/SideProject, r/startups, r/AppIdeas; 7-8 gün önceki pencere, alt reddit başına en fazla 2 sayfa (×100). Arctic Shift skora göre sıralamayı desteklemez: skor sıralaması yalnız çekilen gönderiler arasındadır. Yalnız dış ürün linki olan gönderiler; `reddit_score`, `reddit_comments`.
  - **Show HN (Algolia):** son 30 gün, `show_hn` etiketi, en fazla 100 hikâye; `hn_points`, `hn_comments`. `numericFilters` URL-kodlu gönderilmelidir.
  - **TrustMRR:** `/api/ai` (`recentlyListedStartups` + `bestDeals`); `mrr_usd`, `growth_mrr_30d_pct`. Ürün web sitesi varsa anahtar alan adıdır.
  - **Apple top-free:** US ve TR, 100'er (`rss.applemarketingtools.com`); `apple_us_top_free_rank`, `apple_tr_top_free_rank`.
  - **Atlanan:** BetaList ve Uneed (HTML; listede sayısal sinyal yok, ürün alan adı için her ürün sayfası ayrıca istenmeli).

Bunlar küresel ilk 20 iddiası değil, keşif örneklemidir. Gelir kanıtı ve TR durumu henüz aranmaz (yer tutucu satırlar); bunlar M3-M4 işidir.
