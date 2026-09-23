# Apify ve Firecrawl için ücretsiz alternatifler

> Araştırma tarihi: **3 Eylül 2026**. “Ücretsiz”, yazılım/lisans ya da hosted free kota için kullanılır; sunucu, proxy, CAPTCHA çözümü ve bakım maliyeti yine size aittir. Başarı dereceleri ürünün ilanı değil, StartupHunt hedeflerine göre teknik uygunluk değerlendirmesidir.

## Hızlı karar

| İhtiyaç | En iyi ücretsiz seçim | Neden |
| --- | --- | --- |
| API, RSS, statik HTML, sitemap | **Scrapy** | En az kaynak tüketimiyle büyük hacim; AutoThrottle, queue ve spider modeli var. |
| Node/TypeScript ekibi, HTTP + browser karışık crawl | **Crawlee** | Tek kütüphanede HTTP, Playwright/Puppeteer, queue, retry ve veri exportu. |
| JavaScript, login veya “Load more” etkileşimi | **Playwright** | Gerçek tarayıcı kontrolü; ancak crawl altyapısı değildir. |
| Firecrawl benzeri temiz Markdown/JSON | **Crawl4AI** | Playwright tabanlı, LLM-dostu çıktı ve self-host seçenekleri. |
| Cloudflare üzerinde çok küçük pilot | **Cloudflare Browser Run** | Free kotada doğrudan crawl/Markdown; sürekli pipeline için kota çok küçük. |
| Hosted Firecrawl API ile aynı API yüzeyi | **Self-host Firecrawl** | En yakın işlevsel alternatif; ama altyapısı gereksiz derecede ağır olabilir. |

## Karşılaştırma

| Alternatif | Ücretsiz durum / kota | Başarı | Zorluk | İyi olduğu hedef | Nerede başarısız olur |
| --- | --- | --- | --- | --- | --- |
| **Scrapy** | BSD-3-Clause; self-host, araç kotası yok | **Çok yüksek:** API, RSS, server-rendered HTML, sitemap | **Orta** | npm/PyPI benzeri registry, changelog, dokümantasyon, klasik forum/katalog | JS ile sonradan yüklenen içerik, CAPTCHA ve güçlü anti-bot |
| **Crawlee** | Ücretsiz/açık kaynak; self-host, araç kotası yok | **Yüksek:** statik/yarı-dinamik; browser crawler ile JS | **Orta** | TypeScript adapter'ları, per-domain throttle/retry, queue'lu crawl | Proxy/CAPTCHA maliyetini sihirli biçimde çözmez; selector bakımı gerekir |
| **Playwright** | Apache-2.0; self-host, araç kotası yok | **Yüksek:** tekil JS, form, login, scroll akışları | **Orta–yüksek** | Az sayıda zor sayfa, dinamik review/ilan sayfası | Queue, dedup, crawl frontier, per-domain rate limit ve gözlemleme size kalır |
| **Crawl4AI** | Apache-2.0; self-host, araç kotası yok | **Yüksek:** temiz Markdown/JSON, dinamik sayfa | **Düşük–orta** | Firecrawl'ın content extraction tarafı, LLM öncesi içerik alma | LLM tabanlı extraction seçilirse model ücreti; proxy/anti-bot hâlâ ayrı sorun |
| **Cloudflare Browser Run** | Workers Free: **10 browser dakika/gün**, **3 concurrent**; crawl: **5 iş/gün**, iş başına **100 sayfa** | **Orta–yüksek:** küçük dinamik pilot | **Düşük** | 5 küçük crawl/gün, Cloudflare Worker kullanan ekip | Düzenli geniş tarama; CAPTCHA/bot koruması bypass etmez |
| **Self-host Firecrawl** | AGPL-3.0; API anahtarı olmadan lokal çalışabilir | **Yüksek:** hosted Firecrawl'a en yakın API | **Yüksek** | Mevcut Firecrawl entegrasyonunu lokal geliştirmede korumak | Docker Compose ile API + worker + Playwright + Redis + RabbitMQ + PostgreSQL işletmek; ilk MVP için aşırı ağır |
| **Browserless OSS** | Self-host mümkün; **SSPL-1.0** lisans sınırları var | **Yüksek:** merkezi Playwright/Puppeteer servisi | **Orta** | Birden fazla worker'ın ortak tarayıcı servisi kullanması | Kapalı kaynak/ticari dağıtım lisans değerlendirmesi, crawler/discovery/extraction katmanları yok |
| **GitHub Actions** | Public repo sınırsız; private GitHub Free **2.000 dk/ay**; job azami 6 saat | **Orta:** zamanlanmış düşük hacimli job | **Düşük** | Günlük Scrapy/Crawlee job'ı çalıştırmak | Sürekli worker değil; ephemeral ortam/IP, cache ve hedef bloklaması |

## Doğru başarı ölçüsü

Araçların “başarısı”nı tek bir yüzdeyle vermek doğru değil: aynı araç statik HTML'de çok iyi, login/CAPTCHA korumalı hedefte ise bilerek çalışmayabilir. Bu proje için aşağıdaki ayrım daha güvenilir.

| Hedef türü | Başarı beklentisi | En düşük maliyetli yol | Not |
| --- | --- | --- | --- |
| Resmî API / RSS | Çok yüksek | Doğrudan API client | Scraper kullanma. Rate limit/backoff uygula. |
| Statik site, sitemap, docs, changelog | Çok yüksek | Scrapy veya Crawlee HTTP crawler | Tarayıcı açmak gereksiz maliyet ve kırılganlık. |
| SSR + az miktar JS | Yüksek | Crawlee HTTP; gerekirse Playwright | Önce HTTP response içindeki API/veriyi kontrol et. |
| SPA, infinite scroll, form | Orta–yüksek | Playwright veya Crawl4AI | Her site için selector/akış bakımı gerekir. |
| Login, CAPTCHA, anti-bot/WAF | Düşük–orta | İzinli API/veri anlaşması | “Ücretsiz çözüm” yoktur; proxy/izin/operasyon maliyeti başlar. |
| Site sahibi olmayan uygulama yorumları | Düşük | Lisanslı veri veya platform izni | App Store/Google Play örneğinde resmi API genel corpus vermez. |

## Araç bazında gerçek zorluklar

### Scrapy — varsayılan seçim: statik veri

Scrapy, yüksek hacimli HTTP-first crawler'dır; spider, selector, pipeline, export, devam ettirme ve `AutoThrottle` sağlar. Bu yüzden StartupHunt'ın pricing, changelog, docs ve forum benzeri kaynaklarında en düşük maliyetli tabandır. JavaScript render için tek başına doğru araç değildir.

- Başarı: hedef HTML/API ile veriyorsa yüksek; binlerce URL'de de verimli.
- Zorluk: her hedef için CSS/XPath selector yazmak ve değişince güncellemek gerekir.
- Maliyet tavanı: kendi makineniz/sunucunuz ve hedef sitenin limiti; framework kotası yok.

Kaynaklar: [Scrapy docs](https://docs.scrapy.org/en/latest/), [spider modeli](https://docs.scrapy.org/en/latest/topics/spiders.html).

### Crawlee — TypeScript için Apify'ın yerel karşılığı

Crawlee, Apify'nin platformu değil ücretsiz crawler kütüphanesidir. HTTP için `CheerioCrawler`, JS için `PlaywrightCrawler`/`PuppeteerCrawler` sunar; request queue, retry, storage ve concurrency kontrolü verir. HTTP crawler'ın browser crawler'dan yaklaşık 10 kat hızlı olabileceği dokümante edilmiştir.

- Başarı: statik hedefte çok yüksek, JS hedefte Playwright ile yüksek.
- Zorluk: Scrapy ile benzer; hedefe özel extraction, rate limit, kalıcılık ve izleme sizin kodunuzdur.
- Maliyet tavanı: araç kotası yoktur; proxy ve hedefin bot koruması bağımsızdır.

Kaynaklar: [Crawlee](https://crawlee.dev/), [crawler seçimi](https://crawlee.dev/js/docs/3.12/quick-start), [browser vs HTTP farkı](https://crawlee.dev/js/api/browser-crawler).

### Playwright — sadece gerekli sayfada aç

Playwright tarayıcı otomasyonudur; Chromium, Firefox ve WebKit üzerinde JS, form, scroll ve login akışlarını yönetebilir. Ancak crawler işi için queue/dedup/throttle katmanı içermez. Bu nedenle tüm interneti Playwright ile taramak yerine, HTTP-first crawler'ın başaramadığı URL'lere fallback olmalıdır.

- Başarı: dinamik, izinli etkileşimli akışta yüksek.
- Zorluk: session, selector, hata/timeout, browser kaynak tüketimi ve captcha durumları sizin sorumluluğunuzdur.
- Maliyet tavanı: browser RAM/CPU; ücretsiz olması hedef sitenin otomasyonu kabul edeceği anlamına gelmez.

Kaynaklar: [Playwright](https://playwright.dev/), [Apache-2.0 lisansı](https://github.com/microsoft/playwright/blob/main/LICENSE).

### Crawl4AI — Firecrawl'ın hafif, lokal alternatifi

Crawl4AI; async browser, HTML-to-Markdown ve CSS/XPath/opsiyonel LLM extraction ile doğrudan LLM pipeline'ına girebilecek içerik üretir. LLM extraction seçilmedikçe bir API kredi maliyeti yoktur. Self-host için Docker ve en az 4 GB RAM önerilir.

- Başarı: Markdown/JSON ihtiyaçlarında yüksek; dinamik içerikte Playwright temelinden yararlanır.
- Zorluk: düşük–orta; sürüm, Docker ve güvenlik güncellemelerini işletmek gerekir.
- Kritik not: self-host sunucusunu herkese açık bırakma; 0.9.0 güvenli varsayılanlar getirir. Bilinen güvenlik uyarılarını güncel sürümle takip et.

Kaynaklar: [Crawl4AI quickstart](https://docs.crawl4ai.com/core/quickstart/), [self-hosting](https://docs.crawl4ai.com/core/self-hosting/), [security advisory](https://github.com/unclecode/crawl4ai/security/advisories/GHSA-2jq4-q6vv-4cp3).

### Cloudflare Browser Run — kota ölçüsünde kolay pilot

Hosted fakat free kotası küçük bir seçenektir. Günlük 10 browser dakika ve beş adet, her biri 100 sayfaya kadar crawl işi; dinamik küçük pilotlar için yeterlidir. Hızlı üretkenlik sağlar fakat aylık sürekli source ingestion için uygun değildir.

Kaynaklar: [Browser Run limits](https://developers.cloudflare.com/browser-run/limits/), [crawl endpoint](https://developers.cloudflare.com/browser-run/quick-actions/crawl-endpoint/).

### Self-host Firecrawl ve Browserless — yalnız gerçekten gerekirse

Self-host Firecrawl, hosted API'nin en yakın alternatifi olsa da beraberinde API/worker, Playwright, Redis, RabbitMQ ve PostgreSQL getirir; ilk sürümde bu operasyon maliyeti işlevsel kazancı aşar. AGPL-3.0 lisansını da dağıtım modeline göre ayrıca değerlendir.

Browserless ise merkezi tarayıcı servisidir, crawler değildir. Açık kaynak sürümü SSPL-1.0'dır; kapalı kaynak ticari kullanım/dağıtım tasarımı varsa lisans uygunluğunu doğrulamak gerekir.

Kaynaklar: [Firecrawl repo ve lisans](https://github.com/firecrawl/firecrawl), [Firecrawl self-host](https://github.com/firecrawl/firecrawl/blob/main/SELF_HOST.md), [Browserless self-host](https://www.browserless.io/platform/self-hosted), [Browserless OSS koşulları](https://docs.browserless.io/enterprise/open-source).

## Önerilen minimal mimari

```text
Official API / RSS
        │
        ├── doğrudan adapter
        │
Website URL listesi
        │
        ├── Scrapy (Python) veya Crawlee HTTP (TypeScript)
        │        │ başarısız / JS gerekli
        │        └── Playwright veya Crawl4AI
        │
        └── izin/anti-bot engeli → atla, izinli API veya lisanslı veri ara
```

Bu proje TypeScript/Node planladığı için **Crawlee HTTP + gerektiğinde Playwright** en az yeni ekosistem getirir. Python clustering katmanı zaten bulunacağı için Scrapy ikinci makul seçenektir; ikisini birden ilk sürümde kurmak gereksizdir.

## Yapılmaması gerekenler

- Free plan bitti diye CAPTCHA bypass, residential proxy veya oturum çalma yoluna geçme.
- Her URL'yi browser ile açma; önce API/RSS, sonra HTTP, en son browser sırasını koru.
- GitHub Actions'ı sürekli üretim crawler'ı kabul etme.
- Hosted free kota ile açık uçlu discovery ve deep crawl'ı aynı bütçeye koyma.
