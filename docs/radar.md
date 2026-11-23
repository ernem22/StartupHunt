# Trend radar

`pnpm radar` veritabanı olmadan çalışır: üç kaynağı (GitHub, HN Algolia, Hugging Face) gerçek API'lerden çeker, Markdown'ı stdout'a yazar ve JSON'u `data/latest.json` ile `data/YYYY-MM-DD.json` dosyalarına yazar (bkz. ADR 0004). Bir kaynak başarısız olursa JSON yazılmaz ve komut hata ile biter. İsteğe bağlı `GITHUB_TOKEN` süreç ortamından verilir; radar `.env` yüklemez.

JSON biçimi: `{ generatedAt, commit, sources: [{ manifest, status, entityType, metric, candidates: [{ name, description, url, historyUrl, weeks, score?, momentum }] }] }`. `momentum` ham ivmedir (haftalık oran ya da HF `trendingScore`); `null` sıfır tabanlı, sıralanamayan adaydır.

## Kaynaklar (M0 hâli; yenileri M1)

- **GitHub:** `topic:developer-tools` sorgusunun ilk 30 reposu, `stargazers/history` ile son dört tamamlanmış UTC haftası; ivme = (son hafta − önceki hafta) / önceki hafta. Eksik geçmişli repo dışlanır, sıfır tabanlı aday sıralanmaz.
- **HN Algolia:** `developer` ve `AI tools` sorguları, son dört tamamlanmış hafta; ürün kimliği bağlantı alan adı (ya da GitHub repo). İçerik siteleri `NON_PRODUCT_DOMAINS` ile elenir.
- **Hugging Face:** `trendingScore` sıralı ilk 30 model; tek noktalık ölçü.

Bunlar küresel ilk 20 iddiası değil, keşif örneklemidir. Gelir kanıtı ve TR durumu henüz aranmaz (yer tutucu satırlar); bunlar M3-M4 işidir.
