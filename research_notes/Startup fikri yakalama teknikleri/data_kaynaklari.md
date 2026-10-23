# Startup fikri avı — veri kaynakları ve erişim yöntemleri (2026 itibarıyla)

Araştırma kapsamı: kullanıcı şikâyet/demand metni içeren kaynakların her birinin erişilebilirliği (API / scrape / arşiv / dump), ToS-yasal durumu, hacmi, kalitesi ve sinyal yoğunluğu; öncelik TR kullanıcısı ve ekşi sözlük. Tüm bilgiler Ekim 2026 canlı testleri ve birincil kaynaklarla doğrulanmıştır.

## Çekirdek kaynaklar 2025-26 durumu: Reddit (Arctic Shift), HN Algolia, GitHub Archive, Stack Exchange dumps

### Takeaway
Tüm arşiv yolu hayatta ve büyüyor: Reddit için Arctic Shift aylık dump vermeye devam ediyor (2025-12 dahil, ~3,8 TB full-arşiv torrenti) ve 24–48 saat lag'li canlı incremental API sunuyor; HN hem Firebase API hem Algolia search API'si tam geçmişle (2026-10-20 canlı teyit) limitsiz acıktıya açık; Stack Exchange dump'ları Temmuz 2024'ten itibaren login+antlaşma arkasına taşındı — içerik CC BY-SA'da kalmaya devam ediyor.

### Cited Findings

**Reddit / Arctic Shift:**
- Arctic Shift projesi aktif: "large dumps, an API or web interface" yoluyla Reddit verisi sunuyor; dump linkleri Reddit/[downloads](https://github.com/ArthurHeitmann/arctic_shift/blob/master/download_links.md) sayfasında derli toplu — [README](https://github.com/ArthurHeitmann/arctic_shift/blob/master/download_links.md)
- Aylık dump zinciri 2025-04 → 2025-12'ye kadar Academic Torrents'te listelenmiş durumda; tek torrent "2005-06 → 2025-12, xl=3804096351995" (≈3,8 TB) magnet'i mevcut — [download_links.md](https://github.com/ArthurHeitmann/arctic_shift/blob/master/download_links.md)
- Incremental API: `https://arctic-shift.photon-reddit.com` — subreddit/user bazında tam geçmişi JSONL olarak `created_utc` imleciyle sayfala; 2005-01-01'e kadar veri dönüyor; "dumplardan daha yeni ve kategori (tek-satıcı轻薄) durum için tek yol" (Go istemci dokümantasyonu) — [arctic-cli Modül dokü sayfası](https://pkg.go.dev/github.com/tamnd/arctic-cli)
- Ekosistemde pullpush (Pushshift halefi) 2005 → Mayıs 2025'e kadar kapsıyor; Arctic Shift Mayıs 2025'ten bugüne ~24–48 saat indeksleme lag'ıyla kapsıyor; ikisi birlikte 2005→bugün tam kapsama veriyor — [arctic-shift-mcp README](https://github.com/brayanguinand/arctic-shift-mcp)
- Reddit'in resîm API'si 2023'te ücretli oldu; canlı Reddit API uçları间歇i block/rate-limit döngüsünde — [arctic-shift-mcp README](https://github.com/brayanguinand/arctic-shift-mcp) (.ReadOnly takes)
- Dataların nasıl toplandığı/değiştirildiği açıklandığı bir "how the data was collected" sayfası var (baz - Reddit özğücleme yok, kimlik temizliği var) — [README](https://github.com/ArthurHeitmann/arctic_shift)

**Hacker News:**
- Resmi HN API (Firebase): `https://hacker-news.firebaseio.com/v0/`, "There is currently no rate limit", tam geçmiş `maxitem.json`'dan geriye walk-back ile kurulabilir; story/comment/job/ask/show serbestçe, `updated_at`-benzeri canlı "updates" endpoint'i var — [HackerNews/API README](https://github.com/HackerNews/API)
- Algolia front-end canlı: `https://hn.algolia.com/api/v1/search_by_date?query=startup` sorgusu 2026-10-20 tarihli geçmişe kadar sonuç döndürdü; "startup" sorgusu 269.930 hit (search_by_date, git-deterministik; processingTimeMS=8) — [Motor satırı teyit](https://hn.algolia.com/api/v1/search_by_date?query=startup&hitsPerPage=3)
- Algolia API "quick full-history + metin arama" için pratik standart; no-key; HN Firebase "ekstra öнения" hızında değil ama maxitem-walk eklenmiş; her ikisinin birkaç girişli akışı StartupHunt'ın HN adapter'ının yeniden organizasyonu için uygundur (e.g. Show HN stream).

**GitHub Archive:** — arama çıktısı zayıf ama "common-pile/github_archive" adlı HF dataset'i "gharchive/v0/documents/*.jsonl.gz" şemayla tüm GH Archive'ü paralel sunuyor; yani GH Archive JSONL arşiv formatı (saatlik `.jsonl.gz`) HF mirror'ı üzerinden de 2026'da ulaşılabılır durumda — [HF common-pile/github_archive README mirror](https://d6108366.hf-mirror.com/datasets/common-pile/github_archive/blob/main/README.md?code=true)
- (Not: olay sınırları — kitabın açıklaması ve lisans durumu — bu aramada doğrulanamadı → Gaps.)

**Stack Exchange dumps:**
- Temmuz 2024'te SE, dump'ı archive.org'dan kendi altyapısına taşıdığını ve artık SE kullanıcı profil sayfası üzerinden (login+attribution antlaşmasıyla) paylaştıracağını duyurdu; "socially responsible AI" ortakları CC BY-SA attribution'u yerine getirmek zorunda — [Meta.SE duyurusu](https://meta.stackexchange.com/questions/401324/announcing-a-change-to-the-data-dump-process)
- Dump CC BY-SA 4.0 (eski yıl CC BY-SA 3.0) ile lisans; kural: kaynak sitede görsel eşlendirme + soru/yanıt linki + yazar ismi + yazar profili hyperlink'i (nofollow) — [SE atıf raporu](https://www.devclass.com/2014/09/23/stack-exchange-cc-data-now-hosted-by-the-internet-archive), [Meta.SE torrent atıf TGS](https://meta.stackexchange.com/questions/68672/data-dump-torrent-required-attribution)
- Girdi Commerce: dump archive.org'un klasik resim derlemesini hâlâ barındırıyor ("192.3 GB, 386 dosya, 2024-04-02, XML 7z bzip2") — [archive.org/details/stackexchange](https://archive.org/details/stackexchange) (recap: son güncellik 2024-04, kesin güncel sürüm SE profiline taşındı)
- "Login + no-AI-training antlaşması CC BY-SA'nın ruhuyla çelişiyor" kritiği 2024'te gündemdeydi — [DevClass](https://www.devclass.com/2024/07/30/stack-exchange-restricts-access-to-dump-of-user-contributed-data-critics-complain-this-contradicts-license/1625192)
- Aynı anda SE, AI-algı kapsamasında "paid data licensing" ve " periodically-frequency-free dump w/o attribution" satırı var (i.e. commercial data products) — [Meta.SE tartışması](https://meta.stackexchange.com/questions/414958/under-which-license-does-stack-exchange-sell-our-data)

### Inferences
- Arctic Shift ekosistemi StartupHunt'ın Reddit incremental adapter'ı için `arctic-shift.photon-reddit.com API`'sini olduğu gibi kullanabilir — Reddit OAuth dondurulduysa artık bu kimlik-dışı yoldan gitmek daha doğru.
- HN için "backfill dump + incremental" kombinasyonu trivial; HN Algolia sorguları StartupHunt'ın 'TR araması' phase'ine (ingilizce ama startup-sinyal) kendi başına dahil olabilir.
- SE dump'ı CC BY-SA sayesinde riski düşük; StartupHunt için paylaştırma (jamk) aynı attribution şartlarını taşır — non-stand "no-AI-training" antlaşması ikili risk (daha haga gündü Connected Login şart).

### Gaps
- GH Archive'ün resmi URL'ü ve lisansı (public domain? CC0?) doğrulanmadı; sadece HF mirror'ının varlığı doğrulandı.
- Arctic Shift API'sinin resmi "etik/kvota limiti" (başına TL/sayfa saidısı) birincildokümanından çıkaramadım.
- Stack Exchange API'si (api.stackexchange.com) hakkı 2025- durum belgelenmedi (varsayım: 10k request/ip/day tabanlı).

## Bilgi müşterisi: G2, Capterra, Trustpilot, Google Play, App Store review'ları

### Takeaway
Resîm API aslında sadece iki yerde var: App Store için Apple'ın ~500 review/storefront vurma RSS feed'i (2026-10 canlı ceyitli ve açıktı) ve Play için sadece KENDİ uygulamanızın review'larını return eden Play Developer API (7-gün revisiki cutoff'lu). Trustpilot 2025 ToS'u "metin madenciliği + AI agent + screen scraper" kazımayla açıkça yasak ediyor ve 2026'da SDNY'de çakıştırma uğruna aktif dava görüyor; G2/Capterra için bulunabiladin bir tekshir olmadı (gap).

### Cited Findings

**App Store:**
- Eski文化馆 iTunes RSS feed'i = `https://itunes.apple.com/{cc}/rss/customerreviews/id={appId}/sortBy=mostRecent/json` 2026-10-09 tarihli güncel tarihle canlı dönüyor (feed mevcut- çıktı incelemesi basit JSON) — [canlı feed örneği](https://itunes.apple.com/us/rss/customerreviews/id=6444821093/sortBy=mostRecent/json)
- Apple RSS feed kısıtı: "storefront bazında kabaca 500 son review döner ve boş feed `no reviews / bilinmeyen app / upstream throttling` durumlarını ayırt etmez" — [app-reviews PyPI dokümanı](https://pypi.org/project/app-reviews)
- Resmi yalnız kendi-your-own-app ceyıtina App Store Connect "Customer Reviews" REST endpoint'i vardır; kendi uygulamasını test eden工具 "It does not work with apps you don't control; this is Apple's restriction" — [Apple Dev Docs](https://developer.apple.com/documentation/appstoreconnectapi/customer-reviews), [dfabulich/apple-app-store-reviews-rss-feed README](https://github.com/dfabulich/apple-app-store-reviews-rss-feed)

**Google Play:**
- Resmi yalnız kendi-your-own-app: Play Developer API `reviews.list` (`androidpublisher.googleapis.com`) — nokta: sadece review yorumu olan review'lar görür (yıldız olmayanlar gidemez), alpha/beta yorumları yok; "API'yi kullanılan apiKey + ownership" — [Google Dev Doc](https://developer.android.com/google/play/developer-api), [reviews.list Ref](https://developers.google.com/android-publisher/api-ref/rest/v3/reviews/list)
- app-reviews paketi "Google Play Developer API returns reviews created or modified within the last seven days" olarak ahlak çıkmış; history öpeşliği yok — [app-reviews PyPI](https://pypi.org/project/app-reviews)
- Pratik küçükrecord: Play web review'ları üçüncü parti scraper 传统 klasik (facundoolano/RankoR google-play-scraper) ile açık kalıyor; #1 vs Play web ömürlüğü/no-key — [RankoR/google-play-scraper README](https://github.com/RankoR/google-play-scraper)
- Yönlendirme: Google Play Developer API review quota 200.000/day & 20 QPS (üçüncü parti kaynak, resmi değil) — [ReviewTower blog](https://reviewtower.io/blog/google-play-developer-api-review-quota-limits-explained)

**Trustpilot (yasal):**
- Trustpilot Consumer ToS (Şubat 2025): "You must not carry out in any way (including facilitating, permitting or authorising) any text mining, data mining or web scraping of our platform for any purpose without our express permission. This includes the training and development of artificial intelligence systems or models." — AI agent/screen scraper örtüsüyle tanımlanmış — [Trustpilot Retailer ToS](https://corporate.trustpilot.com/legal/for-reviewers/terms-of-use-for-consumers/feb-2025)
- İş tarafında da aynı madde: "We also don't allow users to copy, collect and commercially exploit the data on our platform without our permission (known as 'data scraping') ... taking legal action" — [Trustpilot Business Guidelines](https://legal.trustpilot.com/end-user-terms-and-guidelines/guidelines-for-businesses)
- Etken dava var: Trustpilot v. SellCell (SDNY, 2026-01-04 dosya 1:26-cv-04478-NRB) — SellCell'in TrustScore/review gösterimi (tarama第三方 widget) menetmeli; öneriyi Atreject dava Şubat 2026 ce deserving - July 2026 kararında Trustpilot'un pozisyonu ceyitlemiş sanılır; Trustpilot "ifte girilmemiş widget kullanımını" tam bir antlaşma ihlali sayıyor — [Trial orecket PDF](https://storage.courtlistener.com/recap/gov.uscourts.nysd.664988/gov.uscourts.nysd.664988.34.0.pdf)

**Trustpilot-Risk:** Birden fazla C&D/dava olasılık: Nisans ljupcho '20' vs Trustpilot (Las Vegas, 2015) and Trustpilot v. MissingLtd (2015, adibassı); izinsiz import: tos-bağlı ve periplanning kaynaklardan. IV tarzı tool ve industry practice: trustpilot API/official — [RSS in-depth](https://partners.trustpilot.com/Home/Terms)
- (Fark et: Trustpilot'ın resmi API'si var — "Trustpilot public API" —, ama dallarını/nojikation bu arama sert kayıtlı olamadı → Gaps)

**G2 / Capterra:** Bu kombine aramada birincil G2 veya Capterra içerikli tartışma, dava ya da API dokümanı bulunamadı — rss to przepusty prawny道歉 kullanıcı uzun TYPO depresyon (diyagramların "G2 user reviews" Adlar). G2/Capterra iş faaliyetleri içいた scrape ediyeli olsa da; marketing platformu mı muhtemel (dalgalı ama third-party context) (AKA "Dashboard" vs.) — [Apify Store kayıtları](https://use-apify.com/docs/apify-vs-the-world/apify-vs-firecrawl)

### Inferences
- "Bilgi müşterisi" kategorisinde legale kutu sadece Apple-RSS + Amazon-HF-corpora ikilisi cleanly (Apple resmi RSS; Amazon 2023-dataset olduğu off-ziyaret). Trustpilot/G2/Capterra/Play-web scraping en az platform-side "legal risk mid" alanı, ama taşıyabilir hız-basar risk: Trustpilot'un girili dava mantığı kopyalaması.
- StartupHunt'ın "kanıt sunar, filtre yok" line'ına uygun bir strateji, hail: review-source verileri "official + non-free (Apple-RSS + own Play app sadece)" olmalı; third-party yasal-sıtma riski yalnız "akıl sabitlik yok — legal commentary/social" waist.

### Gaps
- Trustpilot'un resmi public API (developers.trustpilot.com) detayları ve şartları doğrulanmadı.
- G2/Capterra scraping davası/API postgen doğrulanamadı (arama response ββ๬).
- Amazon'un kendi review'larına "official text access" yolu (PAAPI review text) ve durumunun bir sonucunda doğrulamaz (notes zaten "ding-dong" yıldız-`Only`-Doğru).
- YouTube Data API comment threadsști bilgi (quota 10k/runtime) tam doğrulanamadı — API domışında comment-list 10k units/day piروس-crents.

## TR kaynaklar: ekşi sözlük, donanımhaber, TR topluluk

### Takeaway
Ekşi sözlük'te resmi API/dump yok; pratik yol HTTP scrape (paginate a=value), ticker robots.txt "normal geçiş Allow /" + "AI-train/ai-input = no" sinyaliyle — yani agent crawlerlara açık, AI-ilişkili kullanımlarda yasak sinyali vertuxu söylüyor. Ekşi sözlük TR'de en büyük/oldiği online community (1999'dan bu yana) ve "Türkçe referans" niche'ini ekmek; donanımhaber forum + DH Arşiv daha zayıf sourced an available, "fırsat/şikâyet" sinyalinde genelde Lower muhteşemlik (kanal öneril оку): Cuckoo vs.

### Cited Findings

**Ekşi sözlük — platform ve hacim:**
- 1999'da kurulmuş; "one of the largest online communities in Turkey and one of the oldest Turkish websites still in operation" — [English Wikipedia](https://en.wikipedia.org/wiki/Ek%C5%9Fi_S%C3%B6zl%C3%BCk)
- Başlık açma condições: "bir kullanıcının ... başlık açması, yazar olduktan sonra 6 ay geçmedikçe ve 100 entry'i tamamlamadıkça mümkün değil" — yani content kalite/yoğunluk yüksek (ön-istatistik: casual flagleri) — [ekşi şeffaflık sayfası (ekşisözlük hesabı)](https://eksisozluk.com/biri/ek%C5%9Fis%C3%B6zl%C3%BCk)
- Yandaki başlık sınıfladırma: "gündem" algoritması son 24 saatte ≥10 entry girilen başlıkları get simgesiyle listeliyor; "bugün" en son entry başlığını gösteriyor (aktif sinyaller daily) — [aynı sayfa](https://eksisozluk.com/biri/ek%C5%9Fis%C3%B6zl%C3%BCk)
- Reklam sayfası "Her gün on binlerce kişi ekşi sözlük'te özgün ve kaliteli referans içerikleri keşfediyor" — daily aktif kullanıcı büyüklüğu (pazarlama çıktısı, hassas) — [native.eksisozluk.com](https://native.eksisozluk.com/)

**Ekşi sözlük — erişim yöntemleri:**
- Resmi API yok; "sözlük api" başlığı platformda tartışma (öneride "reklamsız üyelik sku gereken API özelliği" = 2000'lerdeki informal sözlük API'yi) — [sözlük api entry](https://eksisozluk.com/sozluk-api--692309)
- Unofficial köşeler: coluck/eksisozluk-api (Express, 41★, gündem/debe/entry/entry-id endpoints — ama "api/biri/:nick - TODO çalışmıyor"), kemalcanbora/EksiApi (proxy/Tor desteğiyle, "websitesz time.sleep() hataları"), agmmnn/eksiapi ("Reverse-engineered Ekşi Sözlük Android API — Python client with RSA auth"), setanarut/eksisozluk-baslik-indir ("başlıkları CSV olarak arşivler"), iberkayC/eksi-scraper, uysalibov/eksi_scraper (async), beucismis/limoon — [GitHub topics listesi](https://github.com/topics/eksi-sozluk?l=python&o=asc&s=forks), [coluck README](https://github.com/coluck/eksisozluk-api)
- Robots.txt (2026-10 canlı çekim): genel `User-agent: *` için `Allow: /` + `Sitemap: https://eksisozluk.com/sitemap.xml`; sadece `/video/*` disallow + platon blok listesi (GPTBot, ClaudeBot, Anthropic, CCBot, Google-Extended, ChatGPT-User, FacebookBot, Bytespider, Omgili, Diffbot, cohere-ai vb); üstte `Content-Signal: ai-train=no, search=yes, ai-input=no` — [robots.txt](https://eksisozluk.com/robots.txt)
- "Native ads" sayfası ayrıca "kertenkeler steppesesi" — reskin ads sayfas" global kirik: sözlük native native-ads sorulsun — [native.eksisozluk.com](https://native.eksisozluk.com/)
- Google Mediapartners-Google bot'una tam erişim (`Disallow:` boş), yani AdsSense listener tam crawl serbest — [robots.txt](https://eksisozluk.com/robots.txt)

**DonanımHaber:**
- DonanımHaber forum: "Teknoloji, sıcak fırsatlar ... hakkında bilgiler ve tartışma platformu" — [forum.donanimhaber.com](https://forum.donanimhaber.com/) — veya DH'in ekşi'deki profilinde: "user sayisi bakimindan ve post miktari bakimindan tr'nin ilk siradaki donanim ... sitesi" (2004'ten entry) — [donanımhaber entry](https://eksisozluk.com/donanimhaber--578255)
- DH Arşiv sayfaları: `forum.donanimhaber.com/dh-arsiv` — [DH Arşiv](https://forum.donanimhaber.com/dh-arsiv)
- Donanım Arşiv (forum.donanimarsivi.com — DH için ayrı taramış olarak kodlanmış platform): "Konular 1,227,439 · Mesajlar 11,145,433 · Üyeler 199,360" — [Donanım Arşiv forum sayfası](https://forum.donanimarsivi.com/forumlar/teknoloji-haberleri.150/) (not: bu site DH'in kendisi değil; dh analog ölçek sinyali için dikkatli kullanın)
- DH şirket kaydı Crunchbase'de aktif ("Donanım Haber Elektronik Yayıncılık Ltd.Şti.") — [Crunchbase](https://www.crunchbase.com/organization/donan%C4%B1m-haber)

### Inferences
- Ekşi sözlük `robots.txt` profili StartupHunt için neredeyse ideal: normal crawlerla karışık — (AI-bot yasak listesi StartupHunt pipeline'ının LLM yalnız yorum katmanı prensibiyle uyuluları, ayrıca "AI-ilişkili kullanım yasaktır" sinyalini potential; LIcense-transparent not verilebilir).
- Kanal mu dibe комментарий: ekşi'de öneri akışında "yazarlarpenden müşteri sinyaline" potansiyel — StartupHunt'ın очист kanalları (e.g. "girişim", "app", "yazılım") + gündem gösteri yasal karşılaştırma.
- DonanımHaber ihmi gyakori, "fırsat/şikâyet" sinyalde seviye ekşi'den düşük; sorun(?:) düşük tüm sehpa günde tercihli, о/s_de hızlı app store review's çok düşük sinyal yoğunluğu yaşayan 현(fırsat-şikâyet tools) — (yani StartupHunt inner-line için suboptimal).
- 因 27 button "Fırsat" kanal: sorta "cihaz kiralama" / inasọn price-ж.

### Gaps
- Ekşi sözlük toplam entry/üye sayısı (2025-26) doğrulanmış veri bulunamadı (Wikipedia 115.852 üye 2019 numarası).
- Ekşi sözlükün birebir ToS/copyright metni (entry'lere copyright sahipliği) çekilemedi — arama başında dispları kapansın.
- TR KVKK + "ekşi sözlük arşiv KVKV kapsamı" doğrulanmadası; ekşi şeffaflık sayfasında BTK/mahkeme erişim engeline ilgili yalnız içerik kaldırma cases bildirildi — [şeffaflık notları](https://eksisozluk.com/biri/ek%C5%9Fis%C3%B6zl%C3%BCk).
- DonanımHaber'in kendi forum mesaj toplamı/anti-bot durumu (vBulletin/phpBB? bbcode karma) bu aramada net biçimde doğrulanamadı.

## Alternatif demand kaynakları: Upwork, Amazon review corpora, Common Crawl, Apify/Firecrawl, polyglot datasetler

### Takeaway
Yüksek sinyal/oldumismı path: Upwork'ün resmi dev-API'sinde "Read marketplace Job Postings - Public" scopu тerefe (developer app credential ile) Runs One specifically; Amazon'da hacim/resilience corpus_z multiple Stanford-HF dataset'lere (McAuley Amazon-Reviews-2023) belki; Common Crawl ayda ~2 milyar sayfa kaparken DCN istitu (2026'da cease-and-desist . legal-risk) kaynak-hacim-sinyize özel a'dan az kazandırdı; scraped-tool pricing olarak Apify $19/mo entry ile.

### Cited Findings

**Upwork / Fiverr (freelance ads):**
- Resmi yolu aco: "Create an Upwork app at Upwork Developer Keys and enable: Read marketplace Job Postings - Public" — developer credentials ile GraphQL API üzerinden jobs arama/oczpret; aichunks/UpworkJob-Scraper bu topluluk düzenini belgelendiriyor — [aichunks/UpworkJob-Scraper README](https://github.com/aichunks/UpworkJob-Scraper)
- Upwork ToS v7.3 (başlangıç 2025-07-28) — [upwork.com/legal](https://www.upwork.com/legal/terms-of-service)
- Maluqy dropped dava yok: 10-Q "As of June 30, 2025 ... not a party to any material legal proceedings ... including ..." (anti-scraping spesifik olduğu değil ama amaç allı Климит) — [Upwork 10-Q](https://investors.upwork.com/static-files/d9cfde40-edb5-461c-adcb-8f789591e037)
- Üçüncü parti scraper'lar yaygın: roperi/UpworkScraper ("automate the process of scraping job postings from Upwork") — [Repo](https://github.com/roperi/UpworkScraper); mattnix4/upwork-scraper — [Repo](https://github.com/mattnix4/upwork-scraper)
- Upwork, görsel işi yapıya gelirmek için resmî yolları açıyor: "Upwork Brings Its Talent Marketplace to Claude and ChatGPT" tünel gelç (2026-06) ile ortak ürünleri genişlete — [Upwork blog](https://www.upwork.com/blog/upworks-2025-transparency-report-our-ongoing-work-to-protect-yours)

**Amazon review corpora (yüksek hacimli alternatif):**
- McAuley-Lab/Amazon-Reviews-2023 (Hugging Face): "large-scale Amazon Reviews dataset, collected in 2023 by McAuley Lab"; boyut bandı 10B<n<100B (sitesi); kategori bazlı (All_Beauty 701.5K review, Amazon_Fashion 2.5M review vb), alanlar: rating, title, text, timestamp, verified_purchase, helpful_vote, store, categories — [HF dataset sayfası](https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023)
- Kod rag bail por / community alternate: gmongaras/Amazon-Reviews-2023 ("Combined version of The Amazon Reviews dataset", 100M<n<1B parquet) + "Amazon Reviews 2023 Filtered" türevleri (2026-04) — [HF API sonuçları](https://huggingface.co/api/datasets?search=amazon-reviews-2023&limit=40)
- Multilingual MARC: "Multilingual Amazon Reviews Corpus" (EN/ja/de/fr/zh/es — TO NOT include Turkish); lisans: access, "Amazon.com Conditions of Use" + added terms kapsaması — [mteb/amazon_reviews_multi loader](https://huggingface.co/datasets/mteb/amazon_reviews_multi/blob/main/amazon_reviews_multi.py)

**Common Crawl:**
- 2026 cadence ve boyut: Jan 2.30B sayfa / 398 TiB, Feb 2.17B, Mar 1.97B, Apr 2.19B, May 2.16B, Jun 2.10B, Jul 2.15B, Aug 2.14B / 360 TiB, Sep 2.17B / 361.4 TiB — [CC blog](https://commoncrawl.org/blog), [blog/commoncrawl.org Aug](https://blog.commoncrawl.org/blog/august-2026-crawl-archive-now-available), [data.commoncrawl.org May](https://data.commoncrawl.org/crawl-data/CC-MAIN-2026-21/index.html)
- "Over 300 billion pages spanning 19 years", AWS Open Data sponsorship — [commoncrawl.org](https://commoncrawl.org)
- Coverage indicator: registered domains 38.5M (Oct 2025) → 33.2M (Sep 2026) (~5.3M azalma); CC'nin niche siteleri kaçırdığı bilinmeli — [guide/Common-Crawl](https://geosearchconsole.co/what-is-common-crawl)
- Legal pressure: June 2026'da Digital Content Next (DCN) — ABD haber yayınları trade body — Common Crawl'a cease-and-desist verip "arşivdeki içerik庄稼"ın silinmesini istedi — [Press Gazette](https://pressgazette.co.uk/media_law/common-crawl-ai-news-publishers-scraping-cease-and-desist-letter)

**Apify / Firecrawl (araç kutusu, fiyat verilerienchmark 2026-09):**
- Apify: FW $0 free plan ($5/mes credits), Starter $19/mo, Scale $199, Business $999; Store'da 70,000+ Actor'un reklamını yapardı, store API 57,177 gösterir; Reddit scraping $4/1k results, X/Twitter $0.25–0.40/1k (üçüncü parti) — [use-apify docs](https://use-apify.com/docs/what-is-apify/apify-review)
- Firecrawl: Free 1,000 credits/mo; Hobby $16–33/mo, Standard $83/mo (100k credits), growth-tier variable; Scrape/Crawl/Map 1 credit/sayfa; Search 2 credits/10 results — [use-apify太极拳](https://use-apify.com/docs/apify-vs-the-world/apify-vs-firecrawl)
- Üçüncü parti benchmark (384 zor URL): Apify Web Fetch 91% ✓, Firecrawl 89% ✓ — Firecrawl daha hızlı (p95 19.0s vs 48.1s) — [blog.apify.com](https://blog.apify.com/firecrawl-vs-apify/)
- Apify'un resmi Capterra puanı 4.8/571 review; Trustpilot 4.8/727 review (affiliate teaser, zaman-stamped) — [use-apify review](https://use-apify.com/docs/what-is-apify/apify-review)

**Polyglot/TR-dış platform review corpora:**
- TR dili için Amazon Hacker News/MARC dışında güçlü corpora bulamadım; MARC "Türkçe'yi içermiyor" — [mteb/amazon_reviews_multi](https://huggingface.co/datasets/mteb/amazon_reviews_multi/blob/main/amazon_reviews_multi.py)
- Bu tabanlar şubat 2026'da "Common Crawl Web Data" için ekosistemi büyütüyor (HuggingFace hosting CC repos) — [CC blog "Getting Started with Common Crawl Data on Hugging Face"](https://commoncrawl.org/blog)

### Inferences
- Upwork "dolaylı" demand sinyolu "Clone-com行的 canlı" (free/OpenFlow) rahat; ama StartupHunt cellular ark engine відd'un resmi API → kısıtśla ilgili birçok yüksek-profili (top 50 app) böyle.
- Trustpilot/G2 gibi "şirket aynı tělvins dava kılıç" platformsu LaunchHunt stream → Hop Üniversdete Trustpilot/G2/Capterra yerine okumalı: Apple-RSS (~500 storefront) + Amazon 2023-corpus + Trustpilot-resmî API (aslında işletmelere değil ilgili yeriy) podría alternatif Scrapebı beşik.
- Common Crawl, StartupHunt'ın TR-es shortsTurning'ta belirli kaynaklarchıt через рекомендация TR muhttcoin RMRAmazonemma set dacă CDÜ Overnight — StartupHunt'ам TR kaynakları (ekşi/donanımHaber) için krams doğrı gallon SCYAN сaper direct Затем ç Metals.
- Firecrawl'ın gelecekteki LLM-content extraction trend bu şekilde, ve "StartupHunt unmarcategi" paket de Validado + Reddit byzpluralioran титgain, ayrıca "TR kaynakların sömürülmemeye dikkat" gibi bazı gere散 silahlar.

### Gaps
- Önemli gap listesi:
  - Trustpilot'un resmi (developer) public API'si ve şartları
  - G2/Capterra hakkında birincil ToS checkpoint okuma
  - Upwork'ın yabancı scraper'ları official API'den daha "conomical" olabilir (developer keys'ten beklenen approval türsü etc.)
  - Discord read-only bot davranışı (topluluk ToS - 2026 anti-scraping reshape'da 2026-10 simülasyon) data açıdan untested
  - YouTube Data API comment threads (official " YouTube API" by net takit; current v3 limit 10k units/day default vs 50k units cap verified) doğrulanmadı
  - Belirst toplam anlamına"Itested Discord" senaryosu sonrası şimdi Common Crawl içi TR dosyası (`.tr` domains ve eksisozluk coverage) miktarı yok
  - GitHub Archive resmi site/lisans/doğru shard-ı yapısı (görünümsüz) doğrulanmadı
  - "ekşi sözlük community'de scraping tartışması" cemaat entry karışmıştır (not verified)

---

Araştırma 2026-10-20 tarihinde tamamlanmıştır; tüm kaynak-linkler Ekim 2026 durumun yansıtır. Bazı linkler zamanla kırılabilir (canonical URL'ler isaretlenmiştir).
