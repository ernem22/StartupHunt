# Startup fikri tespiti / topluluk metni madenciliği: ürünleştirilmiş uygulamalar (2026 itibarıyla)

Bu not, topluluk metninden startup fikri ve demand sinyali yakalama alanında ürünleştirilmiş uygulamaları derler: hangi araç hangi kaynağı ve pipeline'ı kullanıyor, ticari sonucu ne oldu, hangileri kapandı ve neden. Fiyat ve sayılar kaynağındaki değeriyle aktarılmıştır; üçüncü taraf karşılaştırmalar Ekim 2026 okumalarıdır. Rakip firmaların karşılaştırma blogları gibi taraflı kaynaklar açıkça işaretlenmiştir.

## K1: Kaynak bazında hangi araç, hangi veri kaynağını ve hangi pipeline'ı kullanıyor?

### Takeaway
Reddit madenciliği 2022-2025 döneminin en yoğun kategorisi oldu; GummySearch'ün 30.11.2025 kapanışıyla pazar tek-işli araçlara bölündü. App Store ve Amazon review madenciliği kurumsal analytics tarafında kanıtlanmıştır. GitHub issue madenciliği ise 2026'da çoğunlukla açık kaynak projeler olarak yeni doğuyor. Tüm kategorilerin ortak kader belirleyicisi platform ve API riski.

### Cited Findings

#### Reddit madenciliği (fikir ve demand tarafı)

- GummySearch pipeline'ı: kullanıcı "audience" (subreddit grubu) tanımlar. 130.000 aktif topluluk arasında keşif yapılır; büyüme metrikleri gösterilir. Post'lar otomatik temalara ayrılır: Pain Points, Solution Requests, Money Talk, Advice Requests, Seeking Alternatives, Hot Discussions. Keyword takibi ve eşleşme durumunda alert fonksiyonu vardır. "Ask" fonksiyonu sorguya yanıt olarak, her iddianın altında kaynak Reddit postu linki bulunan LLM özetleri üretir. — [Ürün sayfası](https://gummysearch.com/product/) ve [validation rehberi](https://gummysearch.com/how-to/validate-your-idea/)
- GummySearch fiyat tasarımı: abonelik 29/59/199 dolar/ay; ayrıca 1 dolarlık trial, 10 dolarlık "day pass", indirimli yıllık plan ve LTD. Founder'ın açıklaması: araştırma ihtiyacı düzenli aylık değil dönemsel; LTD bu yüzden 2 ayda 50 bin dolar sattı. — [Indie Hackers gönderisi](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897) ve [Starter Story röportajı](https://www.starterstory.com/stories/gummysearch)
- Ticari sonuç, ilk 2 yıl: 10.000'den fazla kullanıcı, 400 ödeyen müşteri, yaklaşık 100.000 dolar kümülatif gelir, MRR yaklaşık 3K dolar (Ağustos 2023). Gelirin önemli bir kısmı tek seferlik (LTD, day pass) satışlardan geliyordu. — [Indie Hackers](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897)
- Kapanış anındaki büyüklük: yaklaşık 135-140 bin kullanıcı (kaynaklar 135K ve 140K arasında farklılık gösteriyor), Failory'nin raporladığına göre 35K dolar MRR, yaklaşık 4 yıl solo işletme, kapanış anında hala kârlı. Neden: Reddit Data API ticari lisans anlaşmazlığı. Reddit'in 2023 API fiyat değişikliğinden sağ çıkan GummySearch, büyüdükten sonra resmi ticari lisans talebiyle karşılaştı; anlaşma sağlanamadı. Fed, lisanssız "her gün önünde sınır bekleyerek" çalışmayı kabul etmedi. — [Small-start vakası](https://small-start.com/en/cases/global-gummysearch-reddit-closure/) ve [Startup Obituary](https://startupobituary.com/p/gummysearch)
- Kapanış takvimi: 6 Kasım 2025 duyuru; 30 Kasım 2025'te yeni kayıtlar kapandı, mevcut müşteriler fatura dönemine kadar erişti; LTD sahipleri 30 Kasım 2026'ya kadar erişim; 1 Aralık 2026'da tam kapanış ve veri silme. — [Startup Obituary](https://startupobituary.com/p/gummysearch) ve [Panegains](https://panegains.com/blog/best-gummysearch-alternatives-2026)
- Kapanış sonrası pazar bölündü; üç farklı işe ayrıldı: (1) pain-point tarama: IdeaFast (19/40 veya 49/100 dolar, tek seferlik), PainOnSocial (19-49 dolar/ay), PainPointMap (rakip alan analizi ekli tarama); (2) keyword alert: F5Bot (ücretsiz; Reddit, HN, Lobsters) ve Syften (29.95 dolar+); (3) Reddit'ten müşteri/lead avı: Subreddit Signals, RedReach, Clearbox, RedShip. — [IdeaFast'in 14 araç karşılaştırması (Ekim 2026 okuması)](https://www.ideafast.pro/reddit-research)
- PainOnSocial pipeline (kendi ifşası): Perplexity API ile Reddit araması + OpenAI ile yapılandırma; pain noktaları 0-100 arası skorlanır (sıklık + yoğunluk); her pain noktası için 10-25 kanıt parçası (permalink + upvote sayısı); 800'den fazla hazır topluluk veritabanı. — [PainOnSocial blogu](https://painonsocial.com/blog/gummysearch-alternatives-reddit-market-research) ve [Trend Seeker karşılaştırması](https://trend-seeker.app/blog/gummysearch-alternative)
- GripeFind: Reddit Data API bağımlılığını kaldırdığını pazarlar ("Reddit tarafından kapatılamaz"): Brave Search web index'i üzerinden Reddit, HN ve forum yüzeyi; sorgu başına 12 hedefli arama; Claude sonucu 5 boyutta skorlar (demand, competition, passive potential, feasibility, monetization clarity); yüksek skorlu fırsatlar pipeline özelliğinde takip edilir. — [GripeFind blogu](https://gripefind.com/blog/gummysearch-alternatives)
- Panegains: Reddit + Hacker News + açık web üzerinde sürekli beslenen multi-source pain feed; tam feed ücretsiz; 29/49 dolar katmanlar watch özellikleri ekler; "tek kaynak platform riski"ne karşı konumlanıyor. — [Panegains](https://panegains.com/blog/best-gummysearch-alternatives-2026)
- Reddily: Reddit thread'lerine "tek tıkla" derin analiz; 25 thread'e kadar batch analiz; Chrome eklentisi; abonelik yok, analiz başına kredi (2.99 dolar/10 kredi); Google Gemini kullanıyor; Reddit API'ye hala doğrudan bağlı (GummySearch ile aynı risk). — [Reddily blogu](https://reddily.io/blog/gummysearch-alternatives)
- BigIdeasDB: Reddit + G2 + Capterra + App Store + Upwork üzerinden derlenmiş statik şikayet veritabanı (yaklaşık 238.000 şikayet); tek seferlik fiyat; detaylar K2 ve K4'te. — [Panegains](https://panegains.com/blog/best-gummysearch-alternatives-2026)
- Trend Seeker: 50.000'den fazla post üzerinde arama; ücretsiz katman + yaklaşık 9.99 dolar/ay; Reddit-only (GummySearch ile aynı tek kaynak riski). — [Trend Seeker](https://trend-seeker.app/blog/gummysearch-alternative)

#### G2 / Capterra / Trustpilot madenciliği

- G2 kaynaklı madencilik örneği: Viable, G2 yorumlarını Zapier üzerinden otomatik besleyebilen kurumsal bir çözüm sunar. — [Viable docs](https://www.askviable.com/docs)
- BigIdeasDB'nin kaynak gerekçesi: "G2 review'ları, kullanıcıların zaten parasını ödedikleri araçlarla ilgili şikayetler; Upwork ilanları, müşterilerin paraya değer verdiği sorunlar; App Store review'ları acımasız dürüst kullanıcı geri bildirimi." — [wearefounders BigIdeasDB vakası](https://www.wearefounders.uk/how-a-15-year-old-built-an-18k-startup-from-reddit-complaints/) ve [IndieNiche röportajı](https://indieniche.substack.com/p/meet-the-15-year-old-founder-turning)
- Trustpilot'a özel bir fikir-madenciliği ürünü doğrulanamadı; Trustpilot app-store'un birçok analitikte (ör. AppFollow) bir kaynak olarak entegre ediliyor.

#### App Store / Google Play review analytics firmaları

- Appbot: 2015'ten beri çalışan; ~yarım milyar kayıtla eğitilmiş kendi proprietary AI'ı; %93+ doğrulukta sentiment iddiası; hazır Topics kategorileri (Bugs, UI, Performance, Onboarding, Pricing) + custom topic'ler; kelime/cümle analizi; duygu analizi (memnun-kızgın; passive-assertive); iOS'ta sürüm, ülke ve dil düzeyinde karşılaştırma; public review'lar üzerinden rakip analizi (SDK gerektirmez); Slack, Teams, Zendesk entegrasyonları; API ve Tableau connector; pazarlama iddiaları: "Fortune 100 şirketlerinin %25+'i, top charting geliştiricilerin %35'i, ekip başına haftada 6 saat tasarruf". — [Appbot ana sayfası](https://appbot.co/), [Appbot analiz docs](https://support.appbot.co/help-docs/how-can-appbot-help-with-app-review-insights/), [Appbot features](https://appbot.co/features/)
- AppFollow: Semantic Analysis (ücretli add-on): ML modelleri review'ları otomatik 4 ana kategoride sınıflandırır (Bugs, User Feedback, Monetization, Report a Concern); bir review birden fazla tag alabilir; Sentiment Score, demografik analiz, AI Summary + iki dönem karşılaştırma, sürüm/ülke ayrımı; rakip Benchmark raporu; kaynaklar: Google Play, App Store, Mac App Store, Microsoft Store, Samsung Galaxy Store, Huawei AppGallery, Trustpilot, Steam; MCP üzerinden Claude'a bağlanabilirlik; "haftada ~50 saat tasarruf" iddiası; müşteri örnekleri: Toca Boca (ayda 75.000 review), Amanotes, Roku. — [AppFollow Semantic Analysis](https://support.appfollow.io/hc/en-us/articles/360020979818-Semantic-Analysis), [AI özellikler](https://support.appfollow.io/hc/en-us/articles/51090218755473-AppFollow-AI-Features-Overview), [ana sayfa](https://appfollow.io/), [product teams](https://appfollow.io/product-teams)

#### Amazon review madenciliği

- VOC AI (Shulex): 2022'deki Amazon veri-işaretlemesinden önce toplanmış 2 milyar+ review arşivi; geçmiş yakalanan metin çıkarımı; semantik kümeleme ("tutamak kırıldı" ile "düşük kaliteli malzeme" tek küme); aynı kategorideki üst 10-20 ASIN için ortak cohort analizi; 18+ aylık geçmiş trendi izleme; Pro 99 dolar/mo, Team 299 dolar/mo. Not: "2 milyar review" ve "semantik moat" anlatımı VOC AI'ın kendi rakip karşılaştırma blogu; bağımsız doğrulama yok. — [VOC AI vs Helium 10 (taraflı)](https://www.voc.ai/blog/voc-ai-vs-helium-10), [Shulex VOC AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-btdjgniyjohhm), [VOC Open API](https://openapi.shulex.com/)
- Helium 10 Review Insights: genel bir suite içinde ASIN-bazlı gerçek zamanlı analiz; son 2025'te "Listing Review Insights" olarak yeniden adlandırıldı; Diamond planda kilitli (279/359 dolar/ay); r/FulfillmentByAmazon'da özelliğin "degrade edilmiş" olduğu yönünde kullanıcı şikayetleri; Helium 10'ın artık Amazon'un resmi Customer Feedback API'sini kullandığı sadece VOC AI'ın kendi blogu üzerinden aktarılmıştır (taraflı kaynak; doğrulanamadı). — [VOC AI karşılaştırma blogu (taraflı)](https://www.voc.ai/blog/helium-10-review-insights-alternatives)
- Amazon'un resmi araçları: Product Opportunity Explorer içindeki "Customer Review Insights" ve "Customer Feedback API". — [VOC AI'ın Ağustos 2026 karşılaştırma blogu (taraflı)](https://www.voc.ai/blog/amazon-review-analytics-comparison-alternatives)
- ReviewMeta: tema analizi değil, review autentiklik (sahte review) taraması yapıyor. — [VOC AI blogu sınıflandırması (taraflı)](https://www.voc.ai/blog/amazon-review-analytics-comparison-alternatives)

#### GitHub issue madenciliği

- ghscout (açık kaynak): "Her fikir aracı Reddit'i tarıyor; kimse GitHub issue'ları tarıyor" bölümünde bulunduğunu kademesi; tek repo veya cross-repo tarama; skor modeli (relatif, her tarama içinde): Demand 35 ağırlık (toplam 👍 reaksiyonlar), Frequency 30 (aynı sorunu ayrı issue'da), Frustration 20 (negatif reaksiyonlar + frustrasyon kelimeleri + yaş), Market 15 (repo stars, cross-repo'da), Gap 15 (hala açık issue oranı); çıktı: kanıt olarak issue linkleri; "program.md" dosyası ile AI agent'lara BUILD/SKIP/WATCH kararı veriyor. — [ghscout repo](https://github.com/lucianfialho/ghscout)
- gh-issue-to-demand-signal (açık kaynak Claude skill dosyası): rakip reposunun open GitHub issues'unu API'den çeker; PR'lar + bot issue'ları + sıfır reaksiyonlu issue'lar LLM'e göndermeden önce lokal filtreleme; "+1" reaksiyonlar "en temiz alıcı sinyali" olarak tanımlanıyor; kriter: >= 10 reaksiyon + >= 180 gün yaş + roadmap etiketi yok; 6 talep kategorisi (feature_gap, bug_pattern, ux_complaint, performance, integration_missing, docs_missing); issue başlıkları verbatim, paraphrase yasak. — [opendirectory skill](https://github.com/varnan-tech/opendirectory/blob/main/skills/gh-issue-to-demand-signal/SKILL.md)
- DemandRadar (açık kaynak; Kova adlı otonom AI agent tarafından kendi ihtiyacına yapıldı): HN (Algolia API) + GitHub (REST) + Reddit (public JSON) kaynaklarından doğrulama; OPENAI_API_KEY durumunda gpt-4o-mini her post'tan problem/audience/frustrasyon (1-5 skala) bilgisini çıkarıyor (~0.10 dolar/tarama); anahtar yoksa heuristik keyword pattern kullanılıyor; benzer sinyaller cluster'lanıyor; skor = signal sayısı x ortalama frustrasyon. — [DemandRadar](https://github.com/KovaAgent/demandradar)
- Opportunity-Mining-Agent (açık kaynak): kanıt-first akışı: GitHub issues → production pain → commercial gap → opportunity kartı (kanıt URL'leriyle) → validation planı; build/validate/watch/reject kararları; "GitHub kanıtı pain'i kanıtlar; ödemeyi kanıtlamaz; ödeme gerçek kulanıcıyla doğrulanmalıyı." — [Opportunity-Mining-Agent](https://github.com/whitesungun876/Opportunity-Mining-Agent)
- Turn Signal ve UseFeed: GitHub issues/pull requests → public roadmap; "madencilik" değil, yayın tarafı. — [Turn Signal](https://turn-signal.co/) ve [UseFeed](https://getusefeed.com/)

### Inferences

- Alanın en büyük öğrenimi platform riski: Amazon 2022'de veri erişimini kısıtladı, Reddit 2023'te fiyatlandırmayı değiştirdi ve 2025'te ticari lisans istedi. Tek kaynağa bağlı ürünler aynı yapısal riski taşır; multi-source + resmi API'ler (HN Algolia, GitHub REST, Reddit public JSON, G2/Zapier) gibi dayanıklı mimariler görülüyor. StartupHunt'un "scraper/proxy yok, arşiv + resmi API + insan cursor" ilkesi bu pazarın ölüm vakalarıyla teyit edilmiştir.
- Kanıt linkleme (permalink, upvote sayısı, verbatim alıntı) 2026 pazarında standart yapım haline geldi: SaasNiche "no hallucinations" özelliği, gh-issue-to-demand-signal paraphrase'ı yasaklıyor, ghscout her skoru issue linkiyle destekliyor. Kanıtsız LLM çıktısı savunulamaz konumdur.
- GitHub kaynaklı madencilik 2026'da hala ticari SaaS değil; açık kaynak projeler aşamasında. StartupHunt'ın çoklu kaynak vizyonu (Reddit + arşiv + resmi API'ler) alanı farklılaştırıcı olarak görünmesini sağlıyor: 2026 pazarında Reddit-only ürünler platform riski taşıyor.
- Amazon tarafında 2026'da üçüncü taraf araçların resmi Amazon API'ye kayışı görülüyor; ham scraping dönemi kapandı.

### Gaps

- Trustpilot'a özel "madencilik ürünü" bulunamadı; AppFollow'un Trustpilot stack içinde (bir kaynak) entegre olduğu tipinde görüldü ancak dönüşümleri doğrulanamadı.
- "2 milyar review" rakamı ve semantik "moat" anlatımı VOC AI'ın kendi rakip karşılaştırma blogundan; bağımsız doğrulama yok.
- Helium 10'un "Amazon Customer Feedback API" kullanımı sadece rakip (VOC AI) blogu üzerinden; Helium 10'un kendi docs'ta doğrulanamadı.
- Appbot iddiaları (%93 doğruluk, Fortune 100 %25+; ekip başına haftada 6 saat) kendi sayfasından, bağımsız doğrulama yok.
- YouTube ve TikTok yorum madenciliğine özel bir fikir-keşif ürünü bulunmadı; Exploding Topics kaynak listesi sosyal platformları içerir fakat detay açık değil.
- Reddit Data API ticari lisans fiyatı hakkında tam sayı kamu kaynaklarında yok; Small-start "not provided" raporlamaktadır.

## K2: "Startup idea finder" ürünleri (IdeaBrowser, Exploding Topics vs.) — metodoloji, itibar; hangisi gerçek demand signal?

### Takeaway
Pazar üç tip: (1) editoryal kürasyon (IdeaBrowser), (2) arama/sosyal trend ML listesi (Exploding Topics; Semrush bünyesinde), (3) şikayet/kanıt tabanlı madencilik (GummySearch mirası; PainOnSocial, BigIdeasDB vs.). Bağımsız analistlere göre gerçek demand (ödeyecek müşteri kanıtı) hiçbiri üretmiyor; IdeaBrowser kendi skorlarını "educational and based on assumptions" olarak etiketliyor.

### Cited Findings

#### IdeaBrowser (Greg Isenberg / Late Checkout, 2025)

- Kurulum: Greg Isenberg yıllardır her gün fikir paylaşan (newsletter + podcast); "I don't know what to build" sorusuna yanıt; Late Checkout'un incubation/investment sürecinin ürünleşmesi. Ücretsiz günlük fikir "Idea of the Day" + ücretli planlar. — [About sayfası](https://www.ideabrowser.com/about)
- Ürün modülleri: (1) Idea of the Day (tam market research + founder fit + keyword analizi); (2) Idea Database (sayı çelişkili: About 2.000+, ana sayfa listesi 1.942, FAQ 800+, plan tablosu "1.000+" — preuve.ai Ekim 2026 okuması); (3) Trends ve Market Insights (12 aylık keyword hacmi, Reddit ve Facebook gruplarından community signals, pain-point ve solution-gap listeleri); (4) Research Agent (herhangi bir fikre yaklaşık 30 dakikada tam rapor; sonuç BUILD/PIVOT/PASS kararı); (5) Founder Fit ve Roast; (6) Claude, Cursor, Codex, ChatGPT, Gemini, Grok için MCP connector'lar ("AI cofounder"); (7) her ay 7 günlük Accelerator. Marka konumu: "research that can say no" (ChatGPT gibi evetleyen araçlara karşı). — [Features](https://www.ideabrowser.com/features), [About](https://www.ideabrowser.com/about), [FAQ](https://www.ideabrowser.com/frequently-asked-questions), [Market Insights](https://www.ideabrowser.com/market-insights), [Custom Trends](https://www.ideabrowser.com/launch-week/custom-trends), [Agents](https://www.ideabrowser.com/agents), [ana sayfa (1.942 idea)](https://www.ideabrowser.com/)
- Founder'ın kendi pipeline açık paragrafi (blog): IdeaBrowser "FB grupları, subreddits ve Google Trends tarayarak" fikirleri üretiyor; ayrıca blogda 20 maddelik alternatif yöntem listesi: site:reddit.com "is there a tool that" araması, düşük puanlı ama yüksek hacimli shop review'ları (2 yıldızlı review'ların metni), Discord/Slack toplulukları, Upwork/Fiverr iş akışları, LinkedIn iş ilanı başlıkları vs. — [Greg Isenberg blogu](https://www.gregisenberg.com/blog/find-winning-startup-ideas-from-ai-and-data)
- Fiyat: Starter 499 dolar/yıl, Pro 1.499 dolar/yıl, Empire 2.999 dolar/yıl; hepsi yıllık (aylık plan yok; FAQ'da "$499'u aylık sandım" şikayeti cevaplanıyor). — [FAQ](https://www.ideabrowser.com/frequently-asked-questions) ve [preuve.ai fiyat tablosu (Ekim 2026)](https://preuve.ai/blog/best-saas-idea-finder-tools-2026)
- İtibar: IdeaBrowser kendi FAQ'ında "all revenue estimates, opportunity scores, and market analysis are illustrative examples for educational purposes only" ve "never rely solely on our analysis" yazıyor. preuve.ai bunu pazarın geneli için şu değerlendirmeye bağlar: "hiçbir plan, sizin spesifik versiyonunuz için ödeme talebini kanıtlamıyor". — [IdeaBrowser FAQ](https://www.ideabrowser.com/frequently-asked-questions) ve [preuve.ai](https://preuve.ai/blog/best-saas-idea-finder-tools-2026)
- Üçüncü taraf testi (preuve.ai, 4 Ekim 2026): o günün ücretsiz fikrinde skor 9/10 ama "bir markanın ödeyeceğini gösteren bir rakam yok"; keyword hacmi fikir konusundan daha geniş bir konuyu ölçüyor; "still open" sütununun nasıl hesaplandığı belirsiz. r/SaaS'te 2025 tarihli bir yorum: "bazı fikirlerin mantığı yok" (ücretli idea platformları hakkında genel uyarı); r/indiehackers'ta bir kullanıcı Pro planına gerek duymadan fikirleri Claude Code'a yapıştırdığını yazıyor. — [preuve.ai](https://preuve.ai/blog/best-saas-idea-finder-tools-2026) ve [r/indiehackers](https://www.reddit.com/r/indiehackers/comments/1lwk23x/idea_browser/)
- Vendor başarılı vakalar (kendi sayfası; self-reported): Notara yaklaşık 100K dolar gelir; easyflip ilk 24 saatte 489.86 dolar; "7 günde 15.000 dolara satıldı" (Josh Pigford). — [Success Stories](https://www.ideabrowser.com/success-stories)
- Techbible sınıflandırması: 2025 kuruluşu (Greg Isenberg), "Mixed Reviews" etiketi. — [Techbible](https://www.techbible.ai/tool/ideabrowser)

#### Exploding Topics (Semrush bünyesinde)

- Metodoloji (kendi sayfası): milyonlarca yapı-olmayan veri noktası her gün; kaynaklar: arama motorları, sosyal medya, forumlar, haber/blog'lar, e-ticaret siteleri (Amazon), podcast; yakın zamanda GitHub ve Kickstarter eklendi. Proprietary ML modelleri: tarihsel büyüme patternleri + ani spike tespiti; insan analistler en yüksek skorlu trendleri aktarıyor: fadleri filtreliyor (film, dizi, celebrity) ve iş-değeri (marka adı, ürün kelime, sektör terimi) olmayanları çıkarıyor; Google arama hacminde "compounding growth" gösteren kelimeler kabul ediliyor. 1.1M+ trend, macro/micro kategorizasyon. — [Methodology](https://explodingtopics.com/methodology), [How to use ET](https://explodingtopics.com/blog/how-to-use-et), [Trend analysis blogu](https://explodingtopics.com/blog/trend-analysis-software)
- Semrush entegrasyonu: ürün, Semrush'un resmi knowledge base'inde kendi ürünü olarak dokümante ediliyor (Semrush bünyesinde). — [Semrush KB](https://www.semrush.com/kb/1490-exploding-topics)
- Key Indicators: Growth (Exploding/Regular/Peaked), Speed (Exponential/Constant/Stationary), Seasonality, Volatility, Sentiment (trendin çevrimiçi duygu tonu), Forecast (12 ay ML öngörü). — [Semrush KB](https://www.semrush.com/kb/1490-exploding-topics)
- API'de kanal kırılımı: channelBreakdown (facebook, linkedin, pinterest, reddit, tiktok, twitter, youtube; 0-1 normalize edilmiş); trend başına 12 aylık arama hacmi geçmişi. — [ET API docs](https://api.explodingtopics.com/docs.md)
- Fiyat: Entrepreneur plan 39 dolar/ay (yıllık ödemeli). — [preuve.ai](https://preuve.ai/blog/best-saas-idea-finder-tools-2026)

#### Pazar sınıflandırması (üçüncü taraf)

- preuve.ai sınıflandırması (Ekim 2026): IdeaBrowser = "bitmiş/yazılmış fikirler" (499+ dolar/yıl); BigIdeasDB = review/app-store şikayetleri (99 dolar tek sefer); Exploding Topics = search trends (39 dolar/ay); PainOnSocial = Reddit ağrıları (19 dolar/ay); Starter Story ve Indie Hackers = ücretsiz (zaten kazanan işler listesi). Ortak sonuç: "hiçbir giriş planı sizin versiyonunuz için talebi kontrol etmiyor". — [preuve.ai](https://preuve.ai/blog/best-saas-idea-finder-tools-2026)
- Panegains post-GummySearch ayrımı: IdeaBrowser "küratör fikir ürünü — ham monitor değil"; BigIdeasDB "statik DB, monitor değil"; RedShip "en yakın like-for-like" ama GummySearch'ü bitiren aynı tek-kaynak platform riskini taşıyor. — [Panegains](https://panegains.com/blog/best-gummysearch-alternatives-2026)

### Inferences

- Demand signal üretimi üç seviyeye ayrılıyor: (1) ham şikayet metni (Reddit, G2, Amazon) — kanıt-linkli pain taraması; "demand"e en yakın ama yine ödeme kanıtı değil; (2) arama/sosyal trend (Exploding Topics) — genel ilgi dalgası; şikayet değil; (3) editoryal kürasyon (IdeaBrowser) — demand kanıtı zayıf; ciro ve skor tahminleri varsayım tabanlı.
- Pipeline şeffaflığı iki model: Exploding Topics metodoloji sayfası yayınlar (veri + ML + insan analist katmanı); IdeaBrowser ve Exploding Topics metodolojileri kismen ifşa (Greg blogu + ürün sayfaları) ve "assumption" uyarıları ile geliyor; StartupHunt'ın "%100 deterministik, sistem kanıt gösterir" hedefini bu pazarda tam olarak yapan yok.
- Verdict sistemi (BUILD/PIVOT/PASS, BUILD/SKIP/WATCH) 2025-2026'da ortak UI dili haline geliyor; StartupHunt'ın "insan onayı = BU" yapısı pazar diline uygun.
- Kanıt bağlama: pain-based ürünlerin kanıt permalinkleri ile IdeaBrowser'ın "assumption" içeren skoru arasındaki fark, pazarın en önemli güven ayrıştırıcısı olarak görünüyor.

### Gaps

- IdeaBrowser kullanıcı ve gelir sayıları kamuya açık değil; success stories vendor self-report.
- IdeaBrowser'ın kesin teknik pipeline açıklaması yok: keyword verisi hangi API'den; community signals nasıl toplanıyor (kendi scraper mi, 3. parti API mi) — bilinmiyor.
- Exploding Topics'ın Semrush'a satış tarihi ve koşulları bu turda doğrulanamadı; Semrush KB'deki ürünle entegrasyon tek göstergesi.
- IdeaBrowser ve Exploding Topics için bağımsız bir "trend/doğru karar isabet" ölçümü bulunamadı.
- Exploding Topics fiyatı yalnızca preuve.ai üzerinden doğrulandı; kendi sayfasındaki güncel fiyattan doğrulanmadı.

## K3: Kurumsal firmalar da aynı işi yapıyor mu? (Viable, Thematic, Chattermill: teknik detaylar)

### Takeaway
Kurumsal CX/feedback analytics pazarı teknik olarak benzer işi (metin analizi + tema çıkarımı + skor) daha olgun pipeline'la yapıyor, ama hedefi fikir üretimi değil: mevcut ürüne gelen müşteri geri bildirimini analiz etmek. Teknik hatlar dört kamp: kural-bazlı taxonomy (Medallia, Qualtrics geleneksel), proprietary NLP + insan kontrolü (Thematic), LLM özet katmanı (Viable, Interpret, Kraftful), supervised ML + hibrit LLM (Chattermill, Medallia Athena). Fiyat kurumsal seviyede (yaklaşık 25K dolar/yıl bandı); insan kontrol katmanı hiçbir kampta tamamen yok olmuyor.

### Cited Findings

#### Viable

- Biz kurulum: Rahul Vohra (Superhuman) ile birlikte, 4-soruluk PMF anketinin Slack'te otomatik sentezlenen hali ürünleştirildi: very disappointed oranı + ana fayda + geliştirme önerisi + benzerini kullanan başka kim. — [Viable: How it works](https://www.askviable.com/blog/how-viable-works)
- Pipeline (4 bileşen): (1) Ingest & pre-tagging: her veri otomatik tema + duygu + sentiment etiketi; (2) Storage; (3) Soruya özel veri seti: ilgili veriyi çek, GPT-3'e gönder; (4) Answer generation. — [Viable: How it works](https://www.askviable.com/blog/how-viable-works) ve [OpenAI case study](https://openai.com/index/viable/)
- Biz içerik & bulgu: 2021'de NLP'den GPT-3'e geçiş; OpenAI case study: en büyük müşteri örneklerinde yaklaşık 1.000 saat/yıl efor tasarrufu. — [Viable: How it works](https://www.askviable.com/blog/how-viable-works) ve [OpenAI case study](https://openai.com/index/viable/)
- Bugünkü teklif: fine-tuned GPT-4 pipeline'ları; kaynaklar: Zendesk, Intercom, Gong, App Store, Google Play + Zapier üzerinden G2 yorumları; minimum 500 data point şart; SOC 2 Type 2. — [OpenAI case study](https://openai.com/index/viable/), [Viable: generative analysis](https://www.askviable.com/generative-analysis), [Viable docs](https://www.askviable.com/docs)

#### Chattermill

- Lyra AI: hibrit pipeline: aspect-based sentiment (ABSA) + phrasal analiz + clustering + supervised modeller + LLM; 99+ dil; PII redaction; anomaly detection. — [Chattermill: Platform overview](https://chattermill.com/platform/platform-overview)
- Metrik bağlama: NPS, CSAT, CES skorları tema/agent boyutunda kırılır. — [Chattermill: Platform overview](https://chattermill.com/platform/platform-overview)
- Entegrasyonlar: 65-100+ kaynak (Trustpilot, App Store, G2, Zendesk, Intercom, SurveyMonkey vs.). — [Chattermill platform sayfası](https://chattermill.com/platform/platform-overview)
- MCP server: Lyra bilgi tabanını MCP üzerinden Claude vb. araçlara bağlama özelliği. — [Chattermill](https://chattermill.com/)
- Yorum tabanı: G2/Capterra'da 354 doğrulanmış review. — [chattermill.com](https://chattermill.com/)
- Not: Chattermill'in kendi blogundaki "Chattermill vs Thematic" karşılaştırması vendor blogu; iki firma birbirinin teknik detayını kendi blogunda aktarıyor; taraflı kaynak. — [chattermill.com/blog/chattermill-vs-thematic](https://chattermill.com/blog/chattermill-vs-thematic) ve [getthematic.com/competitors/chattermill](https://getthematic.com/competitors/chattermill)

#### Thematic

- Pipeline: bottom-up unsupervised tema keşfi (kural-bazlı taxonomy yok); her temanın altında kalan metinlere (verbatim) kadar traceability; kullanıcı teması ekle/sil/birleştir tam kontrol; insan doğrulama katmanı zorunlu. — [getthematic.com/product](https://getthematic.com/product)
- Thematic Answers: LLM tabanlı soru-cevap; cevaplar temalara ve yerinde kanıt metinlerinin kaynağına linkli. — [getthematic.com/product](https://getthematic.com/product)
- Dil: 13 dil. — [getthematic.com/product](https://getthematic.com/product)
- Fiyat: G2'deki rakip karşılaştırma tablosundan yaklaşık 25.000 dolar/yıl; resmi fiyat listesi yok. — [getthematic.com/competitors/chattermill blogu üzerinden aktarılan G2 verisi; taraflı](https://getthematic.com/competitors/chattermill)
- Müşteriler: LinkedIn, DoorDash, EA, Semrush, Woolworths. — [getthematic.com/product](https://getthematic.com/product)

### Inferences

- Kurumsal araçlar aynı teknik çekirdeği kullanıyor ama müşteri tipi farklı: CX ekipleri (NPS/CSAT/CES izleme) hedef; "hedef kitle hangi startup fikrine para verir" sorusu kurumsal araçların case'i değil.
- Thematic'in "beyaz kutu + insan kontrol" yaklaşımı StartupHunt'un insan-onay (BU) ilkesiyle uyumlu; Viable tarzı LLM wrapper'a göre daha uzun vadeli güven yapıda.
- Dört-kamp sınıflandırmasına göre StartupHunt'ın BERTopic (unsupervised) + insan review hattı, Thematic ve Chattermill'in kampına denk geliyor; Viable tarzı saf LLM özet yaklaşımına göre daha çok kanıt-izlenebilir.

### Gaps

- Viable'ın güncel (fine-tuned GPT-4) pipeline detayı kendi docs'larında sınırlı; tam ayrıntı doğrulanamadı.
- Thematic fiyatı sadece G2 tablosundan; resmi fiyat listesi yok (tipik kurumsal model).
- Chattermill ML mimarisinin teknik detayı çoğunlukla satış materyali ve vendor karşılaştırma bloglarından; bağımsız teknik doküman yok.

## K4: Indie hacker vakaları — bu pazarda kim ne kadar gelir yaptı, hangi taktik çalışıyor?

### Takeaway
Büyük indie başarıları iki tip: (1) kaynağın kendisini madencilik aracı haline getirmek (GummySearch: 4 yılda ~35K dolar MRR zirvesi; SaasNiche: ilk ay ~300 dolar MRR; BigIdeasDB: uzun tek-seferlik satışlarla 18K-23K dolar/ay bandı); (2) aracı değil, çıktıyı satmak (Builder Brief: madencilik sonucu $4.99'luk brief). Ortak taktik, Reddit'te kendisinin müşterisi olan kitleyi Reddit'te pazarlamak.

### Cited Findings

#### GummySearch özeti — ayrıntı K1'de

- İlk 2 yıl: 10.000+ kullanıcı, 400 ödeyen, ~100K dolar kümülatif gelir (Ağu 2023: ~3K MRR). Kapanışta (Kas 2025): ~135-140K kullanıcı, ~35K dolar MRR (Failory'nin aktarımlar; taraflı), 4 yıl solo, kapanış anında hala kârlı. Kapanış nedeni: Reddit ticari API lisans anlaşmazlığı. — [Indie Hackers](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897), [Starter Story](https://www.starterstory.com/stories/gummysearch), [Small-start vakası](https://small-start.com/en/cases/global-gummysearch-reddit-closure/), [Startup Obituary](https://startupobituary.com/p/gummysearch)

#### SaasNiche (Mohamed Nagm, Mısır)

- 30 günlük challenge: Reddit şikayetlerinden pain point madenciliği yapan SaaS ürünü; ilk ay ~300 dolar MRR + 420+ signup; 2.500+ pain point veritabanı; 0-100 skor (intensity + frequency + willingness-to-pay); her pain için kaynak postun permalink'i; "no hallucinations" özelliği (her iddia gerçek post linkiyle); pazarlamayı Reddit post'larıyla (r/SaaS vb.) yapıyor. — [MRR Story vakası](https://mrrstory.com/stories/this-founder-turned-reddit-complaints-into-a-300-mrr-saas-in-30-days)

#### BigIdeasDB (Om Patel; 15 yaşında)

- Kaynaklar: Reddit + G2 + Capterra + App Store + Upwork; kendi hesabıyla 150.000+ review analiz edip ~238K pain-point veritabanı; devam: 18K dolar (Tem 2025) → 23K dolar (Eyl 2025) aylık gelir bandı; 7K+ signup; tek seferlik fiyat (99-349 dolar); pazarlama taktiği: SEO + Reddit (kendi ürününü Reddit post'larında pain-madencilik fikri olarak pazarlama). — [IndieNiche röportajı](https://indieniche.substack.com/p/meet-the-15-year-old-founder-turning) ve [wearefounders vakası](https://www.wearefounders.uk/how-a-15-year-old-built-an-18k-startup-from-reddit-complaints/)

#### TrakDdit (alanxturingx)

- Reddit takip aracı (keyword alert tarzı; F5Bot kıyaslamalı). İlk ödeyen müşteri, bir rakip ürünün kullanıcılarının sürekli şikayet ettiği konudan geldi: alanxturingx, rakip şikayetlerini takip edip DM göndererek ilk müşterisini aldı. — [Indie Hackers gönderisi](https://www.indiehackers.com/post/after-years-of-failed-projects)

#### Builder Brief (Lovamelin pivatı)

- Önceki ürün FollowUp: 4 ayda toplam 18 dolar gelir; kâr etmeden kapandı; post-mortem dersi: "fikri doğruladım, artefaktı değil". Pivot: Builder Brief: Reddit/HN/Indie Hackers/newsletter tarayıp günlük 4.99 dolarlık brief satmak; 30+ gün sonra ilk ödeyen müşteri (13 Haziran 2026). Dağıtım: r/SaaS + r/EntrepreneurRideAlong postları.

#### Diğer vakalar

- Reddit DM otomasyon aracı (anonim, Şubat 2026): 3 haftada 100 signup; sonra kapanıp kaynak kodu sattı. — [r/micro_saas gönderisi](https://www.reddit.com/r/micro_saas/)
- social listening tabanlı bir validasyon metodolojisi paylaşan kişi (Aralık 2025). — [r/SaaS gönderisi](https://www.reddit.com/r/SaaS/)

### Inferences

- Kaynağın kendisini paraya çevirme patterni iki seviyede görülüyor: aracı satmak (GummySearch 135-140K kullanıcı; SaasNiche 2.500+ pain point DB) ve madencilik çıktısını satmak (BigIdeasDB statik DB tek seferlik; Builder Brief günlük brief).
- Reddit'te yap, Reddit'te sat: her üç başarılı vakada (GummySearch, BigIdeasDB, SaasNiche) pazarlama kanalı, maddenin kaynağı olan platformun kendisi (r/SaaS, r/Entrepreneur vb.).
- Fiyat modeli ikiye ayrılıyor: abonelik (GummySearch 29-199 dolar; PainOnSocial 19-49 dolar) ve tek seferlik (IdeaFast, BigIdeasDB). GummySearch founder'ının gerekçesi: araştırma ihtiyacı düzenli aylık değil dönemsel; bu yüzden LTD ve day pass.
- "Fikri değil artefaktı doğruladım" post-mortem dersi (FollowUp → Builder Brief), StartupHunt'ın "sistem kanıt gösterir, insan karar verir" ilkesiyle uyumlu.

### Gaps

- GummySearch gelir verisi (35K dolar MRR) Failory/small-start üzerinden ikincil aktarım; Failory'nin orijinal makalesine bu turda 429 hatası nedeniyle erişilemedi.
- SaasNiche gözlemi ilk 30 gün bandı; sonraki gelir trendi bilinmiyor (MRR Story güncellemesi sınırlı).
- BigIdeasDB gelir rakamları (18K → 23K dolar/ay) kendi pazarlama postları + röportajlarına dayalı; bağımsız ödeme kanıtı yok.
- Reddit DM aracı ve diğer anonim vakalar tek bir Reddit kullanıcısının postuna dayalı; doğrulama zayıf.

## K5: Kapananlar / başarısızlar — neden öldüler?

### Takeaway
Kapanışların numara 1 nedeni platform riski: tek kaynağa doğrudan bağımlılık (GummySearch, Reddit DM aracı; Reddily hâlâ risk altında). Numara 2 kategori: gelir gelmeden ilgi çöküşü (FollowUp; ders: fikri değil artefaktı doğrulamışım). Platform riski Reddit ekosistemi dışında da görülüyor: Leadverse, GMass, Tweet Hunter örnekleri.

### Cited Findings

- GummySearch: ~4 yıl, ~135-140K kullanıcı, 35K dolar MRR, kârlı; Reddit Data API ticari lisans anlaşmazlığı nedeniyle 30 Kas 2025'te yeni kayıt kapandı, 1 Aralık 2026'da tam kapanış ve veri silme. Gerekçe: founder, Reddit'in resmî ticari lisansı olmadan çalışmayı reddetti. — [Small-start vakası](https://small-start.com/en/cases/global-gummysearch-reddit-closure/) ve [Startup Obituary](https://startupobituary.com/p/gummysearch)
- Small-start'ın sıraladığı benzer platform-risk ölümleri: Leadverse (Google Maps scraping; platform kısıtı), GMass (Gmail platformuna kurulu), Tweet Hunter (Twitter/X API ve reklam kısıtları). Ortak desen: kaynak sahibi kuralları değiştirdiğinde ürün üzerindeki hakimiyet kaybediliyor. — [Small-start vakası](https://small-start.com/en/cases/global-gummysearch-reddit-closure/)
- Reddit DM otomasyon aracı (Şubat 2026): 3 haftada 100 signup; sonra kapatıp kaynak kodu sattı; gerekçe: devam maliyeti + Reddit DM spam / tos riski. — [r/micro_saas](https://www.reddit.com/r/micro_saas/)
- FollowUp (Lovamelin): 4 ay / 18 dolar; kapanış post-mortem ana dersi: "fikri doğruladım dedim ama aslında artefaktı doğrulamışım"; dağıtım planı eksikti. Sonuç: aynı madencilik fikri Builder Brief olarak pivot ile devam etti. — [Indie Hackers gönderisi](https://www.indiehackers.com/post/after-years-of-failed-projects)
- Bu alanda GummySearch dışında doğrulanmış büyük kapanış vakası bulunamadı; kapanış analizi esas olarak GummySearch vakasını temel alıyor.

### Inferences

- Platform riski başlıca ölüm nedeni (tek kaynaklı ürünlerde): Reddit, Gmail, Google Maps, Twitter/X API'si — kaynak sahibi kuralları değiştirdiğinde ürün yaşamı biter.
- Kâr eden bir ürün bile kapanıyor (GummySearch); ölümcül risk gelir değil, kaynak erişiminin sürekliliği.
- Founder'ın lisanssız çalışmayı reddetmesi, StartupHunt'un "scraper/proxy yok" ilkesini şirket-etik düzeyinde teyit ediyor.
- "Arşiv + resmi API + multi-source" mimarisi (StartupHunt planı), pazarın kanıtlı en zorlu riskine (platform erişimi) doğrudan cevap olarak okunabilir.

### Gaps

- GummySearch dışında başarılı indie kapanış vakaları (pain-madenciliği kategorisinde) görünmüyor; kategori çok genç.
- Small-start'ın Leadverse/GMass/TweetHunter ölümleri tek vaka yazısı üzerinden aktarıldı; tek tek ayrıntı bu turda doğrulanamadı.
- "Reddit DM spam riski" gerekçesi anonim post; doğrulanamaz.

## Sonuç

Bu pazarın 2026 çıktısı StartupHunt için iki ana ders: (1) mimari: multi-source + resmi API + arşiv + insan cursor, platform riskine karşı tek kanıtlı model; (2) kanıt tanımı: permalink + upvote + verbatim alıntı; LLM skorları asla kanıt değil (IdeaBrowser bu yüzden kendi FAQ'ında "assumption" uyarısı veriyor); verdict dilleri (BUILD/SKIP/WATCH; BUILD/PIVOT/PASS) pazarın ortak UI diline girmiş; StartupHunt'ın insan onayı (BU) bu dille uyumlu. En büyük teknik farklılaştırıcı: GitHub madenciliği (2026'da hâlâ ticari SaaS yok) ve multi-source kapsamı.
