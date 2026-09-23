# Free plan toplama kapasitesi: teorik aylık/günlük tahmin

> Hesap tarihi: **3 Eylül 2026**. Bu bir kapasite bütçesidir, garanti değil. Hedef sitenin rate limit'i, robots/ToS, CAPTCHA, başarısız tekrarlar ve çıkarılabilir gerçek içerik sayısı sonuçları düşürür. Günlük sütunlar 30 güne eşit yayılmış aylık bütçedir; aynı anda çalıştırılabilecek iş sayısı değildir.

## Kullanılan güncel free limitler

| Araç | Free bütçe | Hız/eşzamanlılık | Pratik anlamı |
| --- | --- | --- | --- |
| Firecrawl | 1.000 kredi/ay; basit scrape/crawl/map: 1 kredi/sayfa | `/scrape` 10/dk, `/map` 10/dk, `/crawl` 1/dk, `/search` 5/dk; 2 eşzamanlı istek | Ana sınır hız değil kredi: sadece sayfa çekiliyorsa 33 sayfa/gün. |
| Apify | $5/ay kullanım kredisi | Pricing tablosunda 5 eşzamanlı Actor run | Tek bir küresel “sayfa” kotası yok: her Actor'ın ücret modeli, CPU/RAM süresi, proxy ve tekrar denemeleri bütçeyi değiştirir. |

Firecrawl kaynakları: [pricing](https://www.firecrawl.dev/pricing), [rate limits](https://docs.firecrawl.dev/rate-limits). Apify kaynakları: [pricing](https://apify.com/pricing), [limits](https://docs.apify.com/account/limits).

## Firecrawl: yalnızca seçilmiş sayfaları çekme

Bu tablo **1 sayfa = 1 kredi** kabul eder. “Kaynak/site” başına sayı, gerçekten alınacak anlamlı sayfa sayısıdır; ana sayfa + pricing + changelog + feature-request gibi.

| Hedef başına kapsam | Varsayım | Ayda taranabilir site | Günde ortalama site | Ayda sayfa | Günde sayfa |
| --- | --- | ---: | ---: | ---: | ---: |
| Hafif | 5 sayfa/site | 200 | 6–7 | 1.000 | 33 |
| Standart pilot | 20 sayfa/site | 50 | 1–2 | 1.000 | 33 |
| Derin tarama | 50 sayfa/site | 20 | 0–1 | 1.000 | 33 |

`/scrape` hız limiti burada sorun değildir: günlük 33 sayfa, 10 istek/dk üst sınırında yaklaşık 3,3 dakikada gönderilebilir. Sayfaların tamamlanması 2 concurrent sınırı ve hedef sitenin yanıt süresi nedeniyle daha uzun sürer. `/crawl`ın 1/dk limiti ise yeni crawl işi başlatma hızını sınırlar; aylık sayfa bütçesini artırmaz.

## Firecrawl: önce arama, sonra seçili sayfayı doğrulama

`/search` 10 sonuç için 2 kredi, sonradan çekilen her sonuç sayfası için 1 kredi harcar. Aşağıdakiler birbirinden bağımsız çalışma modlarıdır.

| Mod | Aylık bütçe dağılımı | Ayda arama sonucu | Günde arama sonucu | Ayda scrape edilen sayfa | Günde scrape edilen sayfa |
| --- | --- | ---: | ---: | ---: | ---: |
| Sadece discovery | 1.000 kredi search | 5.000 | 167 | 0 | 0 |
| %10 sonucu doğrula | 667 kredi search + 333 kredi scrape | yaklaşık 3.335 | 111 | yaklaşık 333 | 11 |
| %20 sonucu doğrula | 500 kredi search + 500 kredi scrape | 2.500 | 83 | 500 | 17 |
| Sadece seçili URL listesi | 0 kredi search + 1.000 kredi scrape | 0 | 0 | 1.000 | 33 |

İlk sürüm için en verimli mod son satırdır: kaynak listesini API'ler, manuel seed ve sitemap ile kur; Firecrawl kredisini arama sonuçlarına değil içerik sayfalarına harca.

## Apify: kendi/pay-per-usage Actor ile teorik site taraması

Apify kendi Actor'ın veya ek olay ücreti olmayan bir Actor için compute unit (CU) üzerinden ücretlendirir: **$0,20/CU**. Bu varsayımla $5 = **25 CU/ay**. 1 CU, 1 GB RAM'i 1 saat çalıştırmaya eşdeğerdir. Proxy, transfer, storage ve Actor'ın ayrıca ücretlendirdiği event'ler **hariçtir**.

| Bir kaynak/site run'ının compute maliyeti | Yaklaşık çalışma karşılığı (1 GB RAM) | Ayda teorik site | Günde ortalama site | Uygun kapsam |
| --- | ---: | ---: | ---: | --- |
| 0,05 CU | 3 dk | 500 | 16–17 | Tek/az sayfalı, korumasız küçük hedef |
| 0,20 CU | 12 dk | 125 | 4–5 | Sınırlı sayfalı standart crawl |
| 0,50 CU | 30 dk | 50 | 1–2 | Pagination/retry içeren derin hedef |
| 1,00 CU | 60 dk | 25 | 0–1 | Ağır JS veya yavaş hedef; free plan için zayıf seçim |

Bu modelde 5 eşzamanlı run, günlük bütçeyi yükseltmez; yalnızca aynı bütçeyi daha kısa sürede yakar. Örneğin 125 standart run aylık bütçedir; hepsini tek günde başlatmak limit olarak mümkün görünse bile hedef siteleri gereksiz zorlar ve aylık krediyi tüketir.

## Apify: Store Actor event ücreti varsa

Store Actor'lar çoğu zaman compute dışında sonuç, çalıştırma veya başka bir "event" için ücret keser. O zaman gerçek tavan aşağıdaki kadar basittir; compute/proxy de ayrıca tüketilebileceğinden bu iyimser tavandır.

| Actor fiyatı (varsayım) | $5 ile ayda en fazla sonuç/run | Günde ortalama |
| --- | ---: | ---: |
| $0,01/event | 500 | 16–17 |
| $0,05/event | 100 | 3–4 |
| $0,10/event | 50 | 1–2 |

Actor sayfasındaki fiyat ve bir deneme run'ının usage ekranı görülmeden bu tabloyu planlama limiti olarak alma. Aynı isimdeki iki scraper'ın event tanımı ve proxy kullanımı farklı olabilir.

## Nerede tıkanır?

| Durum | İlk tıkanan araç/limit | Sonuç |
| --- | --- | --- |
| 20–50 önceden seçilmiş SaaS sitesi; her birinden 5–20 anlamlı sayfa | Firecrawl kredisi | Free plan tam bir pilot için yeterli. |
| Her gün yeni domain bulup çok sayfa crawl etmek | Firecrawl kredi + 2 concurrent | 1.000 sayfa/ay hızla tükenir; discovery ve extraction aynı bütçeyi paylaşır. |
| Upwork/G2/Trustpilot/Google Play gibi özel scraper isteyen birkaç hedef | Apify Actor fiyatı/proxy | $5 sadece actor uygunluğunu doğrulamaya yeter; düzenli veri boru hattına değil. |
| CAPTCHA, login, Cloudflare veya sık pagination | Hedef sitenin koruması ve retry maliyeti | Teorik sayfa/site rakamları belirgin biçimde düşer; ToS/izin ayrıca değerlendirilir. |
| Binlerce kaynakta sürekli tarama | Her iki free plan | Free katmanlar pilot içindir; önce resmi API'ler ve değişiklik tespitiyle istek sayısını azaltmak gerekir. |

## Önerilen aylık pilot bütçesi

1. **Firecrawl:** 50 site × 20 anlamlı sayfa = 1.000 kredi. Günlük hedef 1–2 site, 33 sayfa.
2. **Apify:** Tek bir yüksek değerli platform için 5–10 küçük deneme run'ı yap; başarısızlık/retry ve gerçek $/kayıt ölçülmeden aylık toplama planı kurma.
3. Aynı sayfayı tekrar çekmek yerine `ETag`/son değişiklik tarihi tut. Bu, free bütçeyi gerçek yeni observation'lara ayırır.
