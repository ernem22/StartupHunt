# StartupHunt kaynakları: API ve ücretsiz erişim raporu

> Araştırma tarihi: **3 Eylül 2026**. Yalnızca birincil (platformun kendi) dokümantasyon ve fiyatlandırma kaynakları kullanıldı. “Ücretsiz” bir API anahtarının parasız olmasıdır; veri kullanım izni, ticari kullanım ve kota bundan ayrı değerlendirilir.
> **Durum notu (2026-09-23):** Bu rapor **tarihsel araştırma anlık görüntüsüdür** — kararlar plan.md v3.2'deki güncel kararlara bağlanmıştır. Reddit için güncel karar: **resmî OAuth API** (live) + Arctic Shift (backfill); `reddit-universal-scraper` yalnızca İPTAL EDİLMİŞ bir geçmiştir (bkz. plan.md Proje İlkeler — scraper/proxy yok).

## Karar özeti (tarihsel — satırlardaki "proje kararı" kutuları v3.2'de geçersiz kılınmıştır)

| Kaynak | Ücretsiz, proje için doğrudan alınabilir veri API'si? | Güncel limit | Karar |
| --- | --- | --- | --- |
| Reddit | Kısmen. Data API ücretsiz; ticari kullanım/standart dışı hacim için ayrı anlaşma gerekir. ~~Proje kararı: reddit-universal-scraper~~ **PAS GEÇİLMİŞ (v3.2): resmî OAuth API + Arctic Shift.** | OAuth: **100 istek/dk/client**; OAuth'suz: **10 istek/dk** | ~~Scraper'ı self-hosted kullan~~ → Resmî OAuth API "Responsible Builder Policy" access onayı ile kullan (2-4 hafta kuyruk). |
| GitHub | Evet, public veri. | Anonim: **60 istek/saat/IP**; token: **5.000 istek/saat**. Search/secondary limitler ayrıca geçerli. | Birincil kaynak. |
| Hacker News | Evet, public salt-okuma JSON API. | Resmî repo: **şu an rate limit yok**. | Birincil kaynak. Nazik cache/polling uygula. |
| Product Hunt | Teknik olarak evet, fakat varsayılan ticari kullanım yasak; izin istenmeli. | GraphQL: **6.250 complexity point / 15 dk / app**; diğer v2: **450 istek / 15 dk** | Ticari izin alınmadan kullanma. |
| Stack Exchange | Evet, public read. | Key: **10.000 istek/gün**; IP: **30 istek/sn** üstü engellenir; `backoff` zorunlu. | Birincil kaynak. |
| YouTube | Evet, API key/OAuth ile. | Varsayılan günlük kota: `search.list` **100**, `videos.insert` **100**, diğer çağrılar için toplam **10.000 unit/gün**. | Birincil kaynak; kanal/video listesi üzerinden topla. |
| App Store | Hayır, başkalarının yorumları için açık resmi API yok. | Public Marketing Tools RSS için sayısal limit yayımlanmıyor. Kendi uygulamanın Connect API'si 429 döndürebilir ama sayısal limit yayımlanmıyor. | RSS yalnızca sınırlı fallback; API ile genel yorum tarama yok. |
| npm | Evet, public paket metadata'sı. | Sayısal resmi limit yayımlanmıyor. | Registry sinyali için uygun; pain point için tek başına yeterli değil. |
| PyPI | Evet, public Index/JSON/RSS. | CDN tarafında şu an rate limit yok; kötüye kullanımda XML-RPC sınırlandırılabilir. | Registry sinyali için uygun; cache ve ETag kullan. |
| G2 | API mevcut; ücretsiz ve genel review-crawl yetkisi dokümanda garanti edilmiyor. | Sayısal genel limit yayımlanmıyor. | Token/izin kapsamı doğrulanmadan kaynak sayma. |
| Capterra | Genel amaçlı, ücretsiz review API doğrulanamadı. | Uygulanmaz. | Apify ya da lisanslı veri anlaşması gerekir. |
| Trustpilot | API var fakat Business hesabı/izin kapsamındadır; genel ücretsiz review API değil. | Genel sayısal limit yayımlanmıyor. | Apify veya Business API anlaşması gerekir. |
| Google Play | API ile yalnızca **sahibi olduğun uygulamanın** son yorumları okunur. | **200 GET/saat/app**, **2.000 POST/gün/app** | Pazar-geneli fikir avı için uygun değil. |
| Upwork | Genel, ücretsiz iş ilanı/veri keşif API'si yok. | Uygulanmaz. | Apify/scraping; ToS ve ban riskini kabul et. |
| Indie Hackers | Genel, ücretsiz resmi public API doğrulanamadı. | Uygulanmaz. | Apify/scraping; önce izin/ToS kontrolü. |
| LinkedIn Jobs | Açık job-discovery API yok; Jobs API partner/onaylı entegrasyon içindir. | Partner Jobs API: en fazla **100.000 istek/gün/app**. | Düşük öncelik; doğrudan kaynak yapma. |
| Indeed | Genel, ücretsiz job-search API doğrulanamadı. | Uygulanmaz. | Düşük öncelik; scraping ToS riski yüksek. |
| SaaS/pricing/changelog/feature-request siteleri, startup dizinleri, niş forumlar | Tek bir platform değiller; ortak resmi API yok. | Siteye göre değişir. Firecrawl Free: `/scrape` **10/dk**, `/map` **10/dk**, `/crawl` **1/dk**, `/search` **5/dk**; **1.000 kredi/ay**, 2 eşzamanlı tarayıcı. | Site bazlı izin + Firecrawl fallback. |

## Kaynak bazında notlar ve kanıtlar

### Doğrudan API ile başlanabilecekler

- **Reddit:** [Data API facts](https://redditinc.com/news/apifacts) OAuth'lu istemci için 100, OAuth'suz istemci için 10 istek/dakika sınırını açıklar. Ancak [Data API Terms](https://redditinc.com/policies/data-api-terms) ticari kullanım, izin verilmeyen kullanım ve standart dışı hacim için ayrı anlaşma şartı koyar. Bu proje ticari ürüne dönerse "free" olarak kabul edilmemeli. **Proje kararı:** Data API yerine [reddit-universal-scraper](https://github.com/ksanjeev284/reddit-universal-scraper) (self-hosted, API keysiz public JSON scrape) kullanılacak; Data API kısıtlarından kaçınır ama Reddit [Public Content Policy](https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy) ve ToS yine geçerlidir.
- **GitHub:** [resmî limit dokümanı](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) doğrulanmamış istek için 60/saat/IP, doğrulanmış istek için 5.000/saat verir. REST secondary limit de 900 point/dk'dır; `Retry-After` ve response header'ları izlenmeli.
- **Hacker News:** [resmî Firebase API deposu](https://github.com/HackerNews/API) public/read-only endpointleri ve "currently no rate limit" durumunu belirtir. Limit yok ifadesi garanti değil, anlık durumdur.
- **Product Hunt:** [API dokümanı](https://api.producthunt.com/v2/docs) tokenlı API'yi, [rate-limit başlıkları](https://api.producthunt.com/v2/docs/rate_limits/headers) güncel 15 dakikalık limitleri açıklar. Aynı doküman ticari kullanımı varsayılan olarak yasaklar; business use için Product Hunt ile iletişim gerekir.
- **Stack Exchange:** [throttle dokümanı](https://api.stackexchange.com/docs/throttle) günlük 10.000 kota, 30 istek/sn IP eşiği ve zorunlu `backoff` davranışını tanımlar. İstekler API key ile gitmeli.
- **YouTube:** [başlangıç dokümanı](https://developers.google.com/youtube/v3/getting-started), [quota/compliance rehberi](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits) ve [değişiklik geçmişi](https://developers.google.com/youtube/v3/revision_history) yeni granular kotayı açıklar. `search.list`'i sürekli tarama için kullanmak yerine sabit kanal/video listelerini `commentThreads.list` ile çekmek daha az kota tüketir.

### Registry ve mağaza kaynakları

- **App Store:** Planın "RSS feed" notu teknik olarak public [Apple Marketing Tools RSS](https://rss.marketingtools.apple.com/) erişimine dayanabilir; Apple sayısal rate limit yayımlamaz. Ancak [App Store Connect Customer Reviews API](https://developer.apple.com/documentation/appstoreconnectapi/customer-reviews) yalnızca hesabındaki uygulamaların yorumları içindir ve JWT/hesap yetkisi ister. Bu nedenle "tüm App Store yorumlarını resmi API ile ara" diye bir veri kaynağı yoktur.
- **Google Play:** [Reply to Reviews](https://developers.google.com/android-publisher/reply-to-reviews) yalnızca üretimdeki kendi uygulamanın son haftadaki yazılı yorumlarını verir; GET 200/saat/app, POST 2.000/gün/app limitlidir. Genel pazar taraması olarak sınıflandırılamaz.
- **npm:** [npm registry dokümanı](https://docs.npmjs.com/using-npm/registry.html) public registry'nin varsayılan registry olduğunu belirtir. Public paket okuması ücretsiz/auth'suzdur; npm sayısal public-read limiti yayımlamaz. Paket açıklaması ve indirme metadata'sı sinyaldir, kullanıcı şikâyeti değildir.
- **PyPI:** [API dokümanı](https://docs.pypi.org/api/) public Index, JSON ve RSS endpointlerini tanımlar. [JSON API notları](https://docs.pypi.org/api/json/) CDN cache nedeniyle şu an edge rate-limit olmadığını, ama XML-RPC'nin hizmet sağlığı için sınırlanabileceğini belirtir. ETag, cache ve ayırt edici User-Agent kullan.

### API yerine aracı veya anlaşma gerektirenler

- **G2:** [Developer Portal](https://documentation.g2.com/docs/developer-portal) token ve endpoint-permission modelini doğrular; yayınlanmış genel ücretsiz kota ya da bütün public review'lara açık erişim sözü vermez. Token oluşturmak, gerekli dataset izninin verildiği anlamına gelmez.
- **Capterra:** Resmî, genel amaçlı ve ücretsiz review-veri API'si bulunamadı. Affiliate/partner entegrasyonlarını review corpus API'si gibi varsayma.
- **Trustpilot:** Business API erişimi hesap/izin bağlıdır; genel ücretsiz public-review API olarak kullanılmamalı. Resmî teknik erişim için [Developer Portal](https://developers.trustpilot.com/) üzerinden Business kapsamı doğrulanmalı.
- **Upwork ve Indie Hackers:** Bu araştırmada genel ücretsiz ve resmî public-read API doğrulanamadı. Planın Apify yaklaşımı teknik fallback'tir, platformların API'si değildir.
- **LinkedIn Jobs:** [erişim modeli](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access) açık izinlerin sınırlı olduğunu, çoğu programın onay istediğini söyler. [Jobs API overview](https://learn.microsoft.com/en-us/linkedin/talent/job-postings/api/overview) API'nin yetkili üçüncü tarafların iş **yayınlaması** için olduğunu; [sync API](https://learn.microsoft.com/en-us/linkedin/talent/job-postings/api/sync-job-postings) partner limiti olarak 100.000 istek/gün/app yayınlar. Bu, genel ilan arama API'si değildir.
- **Indeed:** Resmî dokümanlarda genel ücretsiz job-search corpus API'si doğrulanamadı. Indeed'in mevcut entegrasyonları başvuru/işveren akışlarına yöneliktir; bunu kaynak API sayma.

### Toplayıcı katmanı

- **Apify:** Bir kaynak API'si değil, scraper/actor çalıştırma platformudur. [Fiyatlandırma](https://apify.com/pricing) Free plan için aylık **$5 kullanım kredisi** yayınlar; actor maliyeti ve dolayısıyla kaç kayıt çıkaracağı actor'a göre değişir. Evrensel tek bir "X istek/dk" limiti yoktur. G2, Capterra, Trustpilot, Google Play, Upwork ve Indie Hackers satırlarındaki "Apify" bunun için fallback'tir.
- **Firecrawl:** Bir kaynak API'si değil, web alma katmanıdır. [Free plan](https://www.firecrawl.dev/pricing) 1.000 kredi/ay verir; [rate-limit tablosu](https://docs.firecrawl.dev/rate-limits) Free için yukarıdaki endpoint limitleri ve 2 concurrent browser sınırını verir. Hedef sitenin robots/ToS hükümleri yine geçerlidir.

## Uygulama sırası

1. İlk sürümde GitHub, Hacker News, Stack Exchange, YouTube, npm ve PyPI ile başla.
2. Reddit'i reddit-universal-scraper (self-hosted) ile topla; Data API'yi ticari izin netleşmeden kullanma. Product Hunt'ı ancak ticari kullanım izni/uygun sözleşme netleşirse etkinleştir.
3. App Store/Google Play'i yalnızca sahip olunan uygulama analitiği için tut; pazar-geneli observation kaynağı yapma.
4. Apify/Firecrawl adaptörlerini "resmî API" olarak etiketleme; kaynak bazında ToS, robots ve maliyet kaydı tut. reddit-universal-scraper'ı da "resmî API" sayma — ToS riski kendi klasmanında yönetilir.

## Açık kalanlar

G2, Trustpilot ve partner API'lerinde erişilebilir endpointler hesap sözleşmesine göre değişir. Hesap/partner başvurusu onaylandığında ilgili portalın canlı quota header'ları ile yeniden doğrulanmalıdır; bu raporda yayınlanmamış limit "sınırsız" sayılmamıştır.
