# Sonuç kanıtı, taban oranları ve karşı örnekler

> Devil's-advocate denetimi. İncelenen rapor: `reports/Startup fikri yakalama teknikleri.md`. Tarih: 2026-10-21.
> Bu not raporu yeniden yazmaz; raporun örtük sonuç iddialarını veriyle test eder.
> Etiketler: **ÖLÇÜM** = birinci/ikinci el veri setinden hesaplanmış; **ÖZ-BEYAN** = katılımcı/founder beyanı; **TAHMİN** = türetilmiş veya ikincil; **KANIT YOK** = konuya dair sistematik veri bulunamadı.

## Bottom line

- **Taban oran acımasız.** Gelir üreten indie SaaS'lerde medyan **$145/ay**; yalnızca **%23,6** $1k MRR'ye, **%6,1** $10k'ya ulaşıyor (BigIdeasDB/TrustMRR, n=3.787, 3 Tem 2026, öz-beyan). MicroConf 2024'te (n=469, en az $1 gelir şartı) katılımcıların **%28'i** $1k MRR altında. Yani raporun $18–23k/ay vakası **~top %2–4**, $300 MRR vakası ise **$1k eşiğinin altında**. İkisi de "tipik başarı" değil.
- **Raporun andığı gelir vakaları yöntemin değil, seçilimin kanıtı; payda yok.** n=3: GummySearch (kârlıydı ama kapandı), SaasNiche ($300 MRR), BigIdeasDB ($18–23k/ay, kendi beyanı; ayrıca bu kategoriyi satıyor). Üçü de kendi hikâyesini anlatan, seçilmiş vakalar; GummySearch'ün kapanışı bile "kârlıydı" çerçevesinde anlatılıyor. "Reddit acı noktası" ürünlerinin ölüm oranına dair sistematik kohort verisi de yok. En yakın vekiller: Product Hunt'ta 2023–2025 top launch'ların **%24,4'ü hard-dead** (n=2.291, Tem 2026); 2013–2024'teki 102.582 ürünün **%22,6'sı defunct** (Oca 2025). Bunlar zaten "launch etmiş ve görünür olmuş" ürünler; gerçek ölüm oranı daha yüksek.
- **Akademik omurga sinyal çıkarımını doğruluyor, sonucu değil.** Timoshenko & Hauser 2019, UGC-tabanlı VOC'nin görüşme-tabanlı VOC ile *eşdeğer ihtiyaç tespiti* ürettiğini gösteriyor; SFT-LLM'in "profesyonel analist düzeyi" iddiası da kodlama/çıkarım kalitesiyle ilgili. Hiçbiri "bu ihtiyaçlara yatırım yapan daha çok kazanır" demiyor.
- **Müşteri keşfi kanıtı pozitif ama zayıf ve korelasyonel.** Welter 2021 (n=120) müşteriyle konuşma, preorder toplama ve geri bildirime göre pivot etmenin performansla ilişkili olduğunu buluyor; nedensellik yok, kesitsel veri. En güçlü sinyal **preorder** — yani raporun "ask" aşaması; metin madenciliği aşaması değil.
- **Fikir kalitesi kanıtı koşullu ve tam da raporun alanında zayıf.** Scott, Shu & Lubynsky (n=652) fikir özetlerinin Ar-Ge-yoğun sektörlerde ticarileşmeyi öngördüğünü, **enterprise software ve consumer web'de öngörmediğini** buluyor. Bu hem "iyi fikir madenciliği kazanır" hem de "fikir önemsiz, icra önemli" tezinin aleyhine.
- **Başarısızlık verisi talep-önce tezini destekliyor ama kanıtlamıyor.** CB Insights 2026 (431 shutdown, 385 kodlanmış): **%43 poor PMF**, **%70 sermaye tükendi** (son neden), %29 zamanlama, %19 birim ekonomisi. Ünlü "%42 no market need" ise 2014/2019 öz-beyan post-mortem'lerinden ve yalnız VC-backed şirketleri kapsıyor.
- **Karşı örnekler net:** Shopify (kendi mağazası için yazdığı yazılım), Slack (başarısız oyunun iç aracı), YouTube/Instagram (pivot) — hepsi kurucuya yakın acı, iç araç veya domain uzmanlığı; yabancıların şikâyetini madencilik değil. New Coke (~190 bin tadım testi) ve Microsoft Kin (2 yıl araştırma, 48 gün) ise araştırmanın başarıyı garanti etmediğini gösteriyor.
- **AI fikir araçları ve ask ekonomisi tarafında kanıt yok, maliyet var.** IdeaBrowser/GummySearch tarzı araçların kullanıcılarının daha başarılı ürün çıkardığına dair tek bir akran-denetime veya büyük-N çalışma bulunamadı. Cold email'de reply **%1,5–3,43**, pozitif reply **%0,6**, booked demo **%0,35** (2025–26 platform verileri); raporun kendi vakası 400 DM → 150 geri bildirim → iki haftada **6 site ziyareti**. Pilot→paid oranları yalnızca vendor iddiası; LOI ise en zayıf halka (Powa: 1.200 "kayıt"ın çoğu bağlayıcı olmayan LOI, $220M, administrasyon).

---

## Kanıt

### 1. Taban oranlar: $1k ve $10k MRR ne kadar nadir?

#### Takeaway
Gelir üreten indie SaaS'lerde $1k MRR yaklaşık 1/4, $10k MRR yaklaşık 1/16 olasılık. Bu oranlar bile iyimser: payda yalnızca "zaten gelir üreten" ürünler. Raporun $18–23k/ay vakası üst uçta; $300 MRR vakası ise başarı değil, küçük bir yan gelir.

#### Cited Findings
- 8.000+ takip edilen startup'tan 3.787'si sıfır olmayan MRR bildiriyor; medyan **$145/ay**, ortalama **$4.298/ay** (aşırı sağa çarpık). Eşikler: **%23,6 ≥ $1k**, **%6,1 ≥ $10k**, **%1,2 ≥ $50k**, **%0,58 ≥ $100k** — BigIdeasDB/TrustMRR, 3 Tem 2026, öz-beyan, yalnız gelir üretenler — [BigIdeasDB](https://bigideasdb.com/state-of-indie-saas-revenue-2026).
- Aynı 8.000+ evrenin tamamı payda alınınca $10k üstü oran **%2,9'un altına** düşüyor; yalnız gelir üretenlere bakınca **%6,1**'e çıkıyor. Payda seçimi sonucu iki katından fazla değiştiriyor — [Steal What Works, 29 Ağu 2026](https://stealwhatworks.com/blogs/news/solo-projects-over-10k-per-month) (ikincil analiz, TAHMİN).
- MicroConf 2024: **469** bağımsız SaaS founder'ı; **%28'i $1k MRR altında** ve bu "anketin en büyük grubu"; **%65'i 1–10 ödeyen müşteriye** sahip; %30 aylık %1–4 büyüyor, ~%30 düz veya küçülüyor — [MicroConf $0–10K ARR](https://microconf.com/founders/0-10k-arr); [MicroConf State of Indie SaaS](https://microconf.com/state-of-indie-saas).
- MicroConf anketine katılım şartı **"en az $1 tekrarlayan gelir"**; yani $0'daki denemeler evrende yok — [HN duyurusu, 8 Oca 2024](https://news.ycombinator.com/item?id=38914049). Bu, %28'in bile hayatta kalanları gösterdiği anlamına gelir.
- Geniş prior: ABD'de işyeri (establishment) 5 yıllık hayatta kalma oranı 1994–2021 ortalaması **%49,2** — [SBA FAQ 2024](https://advocacy.sba.gov/wp-content/uploads/2024/12/Frequently-Asked-Questions-About-Small-Business_2024-508.pdf). 1. yıl hayatta kalma, bölgeye göre ~**%75–85** — [BLS TED, 4 Mar 2024](https://www.bls.gov/opub/ted/2024/1-year-survival-rates-for-new-business-establishments-by-year-and-location.htm).
- Raporun vakaları: SaasNiche ilk ay **~$300 MRR + 420 signup** — [MRR Story](https://mrrstory.com/stories/this-founder-turned-reddit-complaints-into-a-300-mrr-saas-in-30-days); BigIdeasDB **$18–23k/ay**, kendi beyanı, bağımsız ödeme kanıtı yok — [IndieNiche](https://indieniche.substack.com/p/meet-the-15-year-old-founder-turning); GummySearch kapanışta **~$35K MRR / 135–140 bin kullanıcı** — [Startup Obituary](https://startupobituary.com/p/gummysearch).

#### Inferences
- $300, ölçülen dağılımda medyan ($145) ile 75. persentil ($894) arasında; **$1k eşiğinin altında**. MicroConf paydasında ise "en büyük grubun" içinde. Bunu "doğrulama" saymak, ölçeği yanlış okumaktır (persentil konumu TAHMİN; eşik altı ÖLÇÜM).
- $18–23k/ay, 95. persentil ($13.205) ile 99. persentil ($58.404) arasında; yani **~top %2–4** (TAHMİN). Bu bir "tipik çıktı" değil, kuyruk.
- GummySearch'ün kapanış matematiği: ~$35K / ~137.500 kullanıcı ≈ **kullanıcı başına $0,25/ay**. İlk dönemde 10.000+ kullanıcıya karşı 400 ödeyen ≈ **%4 free→paid**; yani geniş kullanıcı tabanına rağmen ödeyen oranı düşük. Kategori lideri bir "fikir araştırma" aracının bile ARPU'su çok düşük. Founder'ın kendi fiyat teorisi de bunu doğruluyor: "araştırma ihtiyacı düzenli aylık değil, dönemsel" — [Indie Hackers](https://www.indiehackers.com/post/bootstrap-saas-to-100k-audience-research-tool-for-reddit-b1a07a4897). Bu, raporun önerdiği aracın abonelik iş modeline doğrudan aykırı bir kanıt.
- Tüm bu oranlar **koşullu**: "ürün çıkarmış ve gelir üretmiş" evren. Gerçek taban oran (deneyen herkes) daha düşük.

#### Gaps
- $0 gelirli ve ölü indie SaaS'leri içeren kamuya açık bir payda yok; gerçek taban oran bilinmiyor.
- BigIdeasDB hem veri sağlayıcı hem idea-mining ürünü satıyor: çıkar çatışması var. Rakamlar MicroConf ile kabaca uyumlu ama bağımsız değil.
- MicroConf örneklem sayısı kaynaklar arasında çelişiyor: sayfalarda **469**, bir podcast sayfasında **"700 startups"** — [MicroConf On Air](https://microconf.com/on-air-episodes/7-surprising-saas-trends-every-founder-must-know-in-2024). Hangisinin nitelikli yanıt olduğu doğrulanamadı.
- Baremetrics/ChartMogul açık verileri $1k/$10k eşik bazlı bir dağılım yayınlamıyor; Stripe Atlas'ın da kamuya açık bir MRR dağılımı bulunamadı. Bu yüzden taban oran için en yakın iki kaynak MicroConf ve BigIdeasDB/TrustMRR oldu; ikisi de aynı yönde ama farklı büyüklükte sonuç veriyor.

---

### 2. Hayatta kalma ve seçilim yanlılığı: kaç benzer ürün öldü?

#### Takeaway
Rapor beş ürünü anlatıyor; aynı yöntemle deneyip ölenlerin sayısı bilinmiyor ve **bu sayı hiçbir yerde sistematik olarak tutulmuyor**. Bu boşluk, raporun "yöntem işe yarıyor" çıkarımını test edilemez kılıyor.

#### Cited Findings
- Product Hunt'ta 2013–2024 arasında öne çıkan **102.582** ürünün **%22,6'sı** (23.184) Ocak 2025 itibarıyla artık çevrimiçi değil; 2013–2015 kohortlarında ölüm %40'ın üzerinde — [Ricky Spears, 2 Oca 2025](https://www.rickyspears.com/scraper/producthunt-cemetery/). Not: "site açık" ≠ "işletme başarılı"; canlı bir landing page zombi olabilir.
- 2023–Nisan 2025 arasında günlük liderlik tablosuna giren **2.291** üründen 2.066'sı kesin hüküm verilebilmiş; **%24,4'ü hard-dead**, **%28,9'u** bağımsız ürün olarak yok (satın alınmış veya sessizce kapanmış), Tem 2026 — [RightAIChoice](https://rightaichoice.com/state-of-ai-tools/graveyard). Günün ilk 5'ine girenlerde ölüm %9, diğerlerinde %25,9: launch başarısı bir miktar koruma sağlıyor ama garanti değil.
- Tek bir anonim Reddit analizi: Ocak–Haziran 2024'te 100+ upvote alan **500** Product Hunt launch'ından **487'si (%97,4)** 6–8 ay sonra $1k MRR altında; %84,6'sı launch ayından beri güncellenmemiş — [r/SaaS, 2024](https://www.reddit.com/r/SaaS/comments/1mnc3nu/i_analyzed_500_product_hunt_saas_launches_487_are/). **Sistematik değil; anonim, tek yazarlı, yöntemi kısmen beyan edilmiş.**
- Raporun kendi kaynakları, tam da bu pipeline'ın başarısızlık modlarını sayıyor: "novelty hunting", öz-teyit ("by the fourth thread you already know what you are hoping to see"), "threads sample who was annoyed enough to type, not who would pay", komünite seçilme yanlılığı — [Boris, Indie Hackers 2026](https://www.indiehackers.com/post/four-ways-mining-reddit-for-startup-ideas-went-wrong-for-me-and-one-disclosure-307e18f861). Rapor bunları alıntılıyor ama pipeline'ı değiştirmiyor.
- Reddit-DM doğrulamasının trafiğe dönüşmediği belgeli vaka: **400 DM → 150 geri bildirim → iki haftada 6 site ziyaretçisi** — [Wilson Wilson, Indie Hackers 2021](https://www.indiehackers.com/post/how-i-validated-my-idea-with-reddit-57209ffc2c).

#### Inferences
- Raporun örneklemi **kolayda örneklem (convenience sample)**: hayatta kalan, basın görmüş, hikâyesini anlatmış 5 ürün. Bu örneklemden P(başarı | acı madenciliği) hesaplanamaz; hesaplanırsa 5/5 gibi saçma bir sonuç çıkar.
- Seçilim üç katmanda çalışıyor: (a) hangi ürünler launch ediliyor, (b) hangileri hayatta kalıyor, (c) hangileri hikâye olarak anlatılıyor. Rapor üçüncü katmanın içinden konuşuyor.
- Product Hunt verisi bile iyimser: oradaki ürünler "featured" olmuş, yani zaten bir miktar görünürlük/traksiyon elde etmiş. Buna rağmen top launch'ların ~1/4'ü 1–2 yıl içinde ölü.
- "Kaç benzer ürün öldü?" sorusunun cevapsızlığı, raporun en büyük epistemik borcu. Bu veri yoksa "yöntem işe yarıyor" iddiası ancak anekdot seviyesinde kalır.

#### Gaps
- "Reddit pain-point" ürünlerine özgü bir shutdown listesi, kohort takibi veya mezar taşı veritabanı yok. Aramalar yalnızca tekil post-mortem'ler (GummySearch, Powa) ve genel "failed SaaS" listeleri döndürüyor.
- Product Hunt analizleri de tam kapsam değil; örneklem "liderlik tablosuna giren" ürünlerle sınırlı.
- Ölen ürünlerin founder'ları nadiren yazıyor; yazsa da "fikir kötüydü" demek yerine "pazar zamanlaması" gibi dışsal nedenleri tercih ediyor (bkz. §5).

---

### 3. Müşteri keşfi/validasyon başarıyı öngörüyor mu?

#### Takeaway
Evet, ama zayıf ve korelasyonel: müşteriyle konuşmak ve özellikle **preorder toplamak** performansla ilişkili. Hayır, "metinden acı madenciliği" bu kanıtın kapsamında değil. Kanıtın en güçlü olduğu yer, raporun "ask" dediği pahalı aşama.

#### Cited Findings
- **Welter vd. 2021**, ABD'de **120** girişimci, hiyerarşik regresyon, hem öznel hem nesnel performans: "talking to customers, collecting preorders and pivoting based on customer feedback are lean startup activities correlated with performance"; iş planı yazmak da tek başına ilişkili. Yazarlar bunu "ilk nicel karşılaştırma" olarak sunuyor; kesitsel, nedensellik iddiası yok — [Emerald](https://www.emerald.com/neje/article-pdf/24/1/21/2033557/neje-08-2020-0031.pdf); [özet](https://digitalcommons.sacredheart.edu/neje/vol24/iss1/2).
- **Leatherbee & Katila 2020** (Strategic Entrepreneurship Journal), NSF I-Corps saha çalışması: hipotez-temelli müşteri görüşmeleri ("probing") fikir yakınsamasını sağlıyor; yönteme daha fazla angaje olan takımlar 18 ay sonra daha yüksek performans gösteriyor (post hoc). Sınır koşulu: MBA eğitimli takımlar yönteme direniyor — [Wiley](https://sms.onlinelibrary.wiley.com/doi/10.1002/sej.1373); [PDF](https://web.stanford.edu/~rkatila/new/pdf/KatilaLeanStartup2020.pdf).
- **Camuffo vd. 2020**, ön-kayıtlı RCT, **250** erken aşama girişimci: "bilimsel yaklaşım" eğitimi pivot davranışını değiştiriyor. Erişilen metinde gelir/hayatta kalma etki büyüklüğünü doğrulayamadım — [Arizona Eller PDF](https://eller.arizona.edu/sites/default/files/Small%20changes%20with%20big%20impact-%20experimental%20evidence%20of%20a%20scientific%20approach%20to%20the%20decision-making%20of%20entrepreneurial%20firms.pdf).
- **Assenova 2024** (Strategic Management Journal): **8.580** startup, **408** hızlandırıcı, 176 ülke, 2013–2019; hızlandırılanlar, seçilip hızlandırılmayanlara göre ortalama daha iyi performans gösteriyor (+%3,4 VC bulma olasılığı, ilk yıl $1,8M daha fazla). Bu müşteri keşfi değil, yapılandırılmış destek; dolaylı kanıt — [Wharton özeti](https://qa-knowledge.wharton.upenn.edu/article/do-accelerators-improve-startup-success-rates); [Wiley](https://sms.onlinelibrary.wiley.com/doi/10.1002/smj.3581).
- **Hızlandırıcı meta-analizi**: **21** birincil çalışma, **68** etki büyüklüğü; katılımın istatistiksel olarak anlamlı pozitif etkisi var, ama etki program tasarımına göre heterojen — [Springer, 2025](https://link.springer.com/article/10.1007/s10961-025-10218-6).
- **Startup Genome 2011**, 650+ web startup'ı: "most successful startups pivot at least once"; 1–2 kez pivot edenler 2,5x daha fazla yatırım, 3,6x daha iyi kullanıcı büyümesi ve %52 daha az erken ölçekleme gösteriyor (0 veya >2 pivota göre). Gözlemsel, 2011, öz-seçilimli — [Startup Genome PDF](https://cdn.startupgenome.com/sites/62c58b4d00b3f50043b92724/content_entry62c58c4b00b3f50043b92770/62c59def61a37b0042c28e59/files/Startup_Genome_-_Why_Startups_Succeed.pdf).
- Karşı taraf: LOI "çok zayıf validasyon" — [HN tartışması, 2011](https://news.ycombinator.com/item?id=3063958) (görüş, veri değil). Daha güçlü belge: Powa Technologies, 1.200 müşteri "kaydı"nın çoğu bağlayıcı olmayan LOI çıktı; şirket $220M yatırıma rağmen Şubat 2016'da administrasyona girdi ve "pre-revenue" idi — [Business Insider](https://www.businessinsider.com/powa-technologies-most-1200-powatag-deals-were-letters-of-intent-2016-2); [BBC](https://www.bbc.com/news/technology-35860814); [Guardian](https://www.theguardian.com/business/2016/apr/18/dan-wagner-powa-technologies).
- "Validation theater" eleştirisi pratik literatürde yaygın: "If people won't pre-pay a nominal amount, the demand signal is much weaker than it appears"; gerçek sinyal "someone pays in advance for something that doesn't exist yet" — [Fonda, 23 Tem 2026](https://www.fonda.co/blog/startup-idea-validation-mistakes) (vendor blog, görüş).

#### Inferences
- Kanıt zinciri şöyle: **metin madenciliği ≈ görüşme** (TH2019, ihtiyaç tespiti düzeyinde); **görüşme ↔ performans** (Welter, zayıf korelasyon); dolayısıyla **metin madenciliği ↔ performans** çıkarımı *test edilmemiş* ve zincirin ikinci halkası zayıf. Bu, raporun akademik omurgasının en büyük mantıksal sıçraması.
- En güçlü ölçülmüş sinyal **preorder**; yani ürünü satmaya çalışmak. Bu, raporun kendi caveat'ını ("ödeme kanıtını yalnız ask üretir") destekliyor — ama pipeline'ın *ön* yarısını değil, *arka* yarısını.
- Pozitif kanıtların hepsi gözlemsel: müşteriyle konuşan founder'lar sistematik olarak farklı (daha disiplinli, daha fazla kaynak, daha iyi ağ) olabilir. Seçilim etkisi ayrıştırılmamış.
- LOI, commitment ladder'da "güçlü" katmanda gösteriliyor; Powa vakası LOI'nin en fazla "orta" sinyal olduğunu, hatta kalabalık bir pipeline'da gürültü olduğunu gösteriyor.

#### Gaps
- İndie SaaS'ta müşteri keşfinin gelir/hayatta kalma üzerindeki nedensel etkisini ölçen RCT yok.
- "Acı madenciliği"ni diğer validasyon aktivitelerinden izole eden tek bir çalışma yok.
- Leatherbee & Katila'nın örneklem büyüklüğü erişilen metinden net değil; etki büyüklüğü doğrulanamadı.

---

### 4. Fikir mi, icra mı? Fikir kalitesi ölçülebilir mi?

#### Takeaway
Ne "fikir önemsiz" ne de "fikir her şey". Fikir kalitesi bazı bağlamlarda öngörücü, ama **tam da yazılım/enterprise SaaS bağlamında değil**. Bu, metinden "iyi fikir" sıralamaya çalışan bir aracın en zayıf noktası.

#### Cited Findings
- **Scott, Shu & Lubynsky**, MIT Venture Mentoring Service, **652** girişim: deneyimli mentorların yalnızca kısa fikir özetlerine bakarak verdikleri puanlar, Ar-Ge-yoğun sektörlerde (life sciences) ticarileşmeyi ve ciddi fon toplamayı anlamlı biçimde öngörüyor; **"this pattern does not hold for ventures in non-R&D-intensive sectors such as enterprise software"** — [HBS Working Paper 16-013, 2016](https://www.hbs.edu/ris/Publication%20Files/16-013_41f3750a-9d54-49be-a8f4-51a6489d514e.pdf).
- **Kornish & Ulrich**, "The Importance of the Raw Idea in Innovation: Testing the Sow's Ear Hypothesis": piyasa-öncesi fikir kalitesi ölçümleri, incelenen bağlamda nihai iş değerini öngörüyor; yazarlar "idea quality does, in fact, predict outcomes" diyor. Tek bağlam, dış geçerlilik sınırlı — [Berkeley PDF, 2013](https://funginstitute.berkeley.edu/wp-content/uploads/2013/08/KornishUlrich-ImportanceIdea-Aug20131.pdf).
- **Gius 2025** (Strategy Science), **67** girişim yarışması: jürilerin bir fikir üzerinde *anlaşmazlığı* başarıyı öngörüyor, özellikle özgün önermelerde. Yorum: değer, "herkesin hemfikir olduğu" fikirlerde değil, kutuplaşan fikirlerde — [RePEc](https://ideas.repec.org/a/inm/orstsc/v10y2025i2p93-108.html).
- **Startup Genome 2011**: başarılı startup'ların çoğu en az bir kez pivot ediyor; 1–2 pivot en iyi bant. Gözlemsel; "pivot" tanımı geniş — [Startup Genome](https://startupgenome.com/insights/what-the-fortune-1000-can-learn-from-the-startup-genome-project).
- Ünlü pivotlar: Slack (başarısız oyun Glitch'in iç iletişim aracı), YouTube (dating sitesi), Instagram (Burbn check-in uygulaması) — [CB Insights, 2018](https://www.cbinsights.com/research/startup-pivot-success-stories/); [TechCrunch Slack origin, 2019](https://techcrunch.com/2019/05/30/the-slack-origin-story/).
- CB Insights 2026: PMF başarısızlıklarının **üçte ikisi** erken aşama; ama **20 Series B+** şirket de PMF'yi ana neden olarak gösteriyor — [CB Insights, 5 Mar 2026](https://www.cbinsights.com/research/report/Startup-failure-reasons-top).

#### Inferences
- "Fikir önemsiz" iddiası veriyle desteklenmiyor: fikir kalitesi bazı bağlamlarda öngörücü. "Fikir her şey" de desteklenmiyor: pivot oranları ve PMF başarısızlıkları icranın/öğrenmenin belirleyici olduğunu gösteriyor.
- Kritik nokta: **önsel fikir değerlendirmesi, yazılımda sonucu öngörmüyor** (Scott vd.). Dolayısıyla "metinden fikir kalitesi çıkarıp sıralama" iddiası, akademik olarak en zayıf olduğu alanda en iddialı.
- Gius bulgusu, "tekrar eden, çok kişinin dile getirdiği acı = iyi fikir" varsayımına doğrudan meydan okuyor. Tekrar/oybirliği, kalabalık ve konvansiyonel bir fikri işaret ediyor olabilir; kutuplaşan/özgün fikirler daha iyi performans gösteriyor.
- Pivot verisi nedensel değil: pivot, başarısızlığa verilen bir tepki de olabilir (ters nedensellik). "Pivot eden kazanır" okuması yanıltıcı.

#### Gaps
- YC/unicorn'ların kaçının ilk fikrini değiştirdiğine dair yüzde yok; Startup Genome 2011 geniş ama eski ve öz-seçilimli.
- Başarılı ve başarısız startup'ların pivot oranlarını aynı kohortta karşılaştıran güncel bir veri seti bulunamadı.
- Kornish & Ulrich'in bağlamı (hangi ürün kategorisi, kaç fikir) tam doğrulanamadı; tek bağlam olduğu için genellenemez.

---

### 5. Başarısızlık nedenleri: "no market need" gerçekten kanıt mı?

#### Takeaway
Talep/PMF, başarısızlığın en büyük *kendi kendine bildirilen* nedenlerinden biri. Ama bu veri öz-beyan, geriye dönük, yalnız VC-backed ve hayatta kalanların anlatısıyla şekillenmiş. Talep-önce tezini destekler; onu kanıtlamaz.

#### Cited Findings
- **CB Insights, 5 Mart 2026**: 2023'ten beri kapanan **431** VC-backed startup; **385**'inde neden kodu var. **%70 "ran out of capital"** (neredeyse her zaman *son* neden), **%43 poor product-market fit**, **%29 bad timing**, **%19 unsustainable unit economics**. Çoklu neden mümkün, toplam %100'ü aşıyor — [CB Insights](https://www.cbinsights.com/research/report/Startup-failure-reasons-top).
- Eski sürümler: **2019** raporu 101 post-mortem'de "no market need" **%42**; **2021** raporu 111 post-mortem'de **%35**. Sık alıntılanan "%42" 2014/2019 verisine dayanıyor — [CB Insights 2019 PDF](https://www.cbinsights.com/reports/The-20-Reasons-Startups-Fail.pdf); [2021 PDF](https://www.cbinsights.com/reports/CB-Insights_Top-Reasons-Startups-Fail.pdf).
- Örneklem yalnız **VC-backed** şirketler; indie/bootstrapped SaaS yok. Post-mortem yazan founder'lar, sessizce kapananların hayatta kalan anlatıcıları.
- "Ran out of capital" bir semptom; CB Insights'in kendisi de bunu "final cause of death, not the root problem" diye çerçeveliyor — [CB Insights](https://www.cbinsights.com/research/report/Startup-failure-reasons-top).

#### Inferences
- %43 PMF, talep-önce tezinin *yönünü* destekliyor. Ama %70 sermaye ve %29 zamanlama, başarısızlığın çok nedenselli olduğunu ve "talep yoktu" etiketinin çoğu zaman daha karmaşık bir hikâyenin öz-beyan özeti olduğunu gösteriyor.
- "No market need" geriye dönük bir atıf: founder için en az utanç verici, en çok anlatılabilir neden. "Yanlış fiyatlama", "yanlış ekip", "kötü satış" gibi nedenler daha az dile getiriliyor olabilir.
- Bu veri, "hangi fikir bulma yöntemi daha iyi" sorusuna hiç değinmiyor. Talep başarısızlığın nedeni ise, talep *sinyalini* bulmak ile talep *yaratmak* aynı şey değil.

#### Gaps
- İndie/bootstrapped SaaS'a özgü, kapanan ürünleri kapsayan bir başarısızlık veri seti yok.
- Post-mortem yazmayan founder'ların nedenleri sistematik olarak eksik; bu, dağılımı bilinmeyen yönde çarpıtıyor.

---

### 6. Karşı örnekler: şikâyet madenciliğinden gelmeyen başarılar ve araştırmaya rağmen ölenler

#### Takeaway
En iyi belgelenmiş başarıların çoğu **kurucunun kendi acısından, kendi iç aracından veya domain uzmanlığından** doğmuş; yabancıların şikâyet korpusunu madencilikten değil. Bu, raporun "workaround" sezgisini kısmen destekler, ama "ölçekli şikâyet madenciliği" uygulamasını değil.

#### Cited Findings
- **Shopify**: Tobi Lütke 2004'te Snowdevil adlı snowboard mağazasını açtı; mevcut e-ticaret yazılımları hantal olduğu için kendi yazılımını yazdı. Diğer satıcılar yazılımı lisanslamak istedi; Shopify 2006'da doğdu — [Shopify blog](https://www.shopify.com/blog/earliest-businesses); [NPR, 2019](https://www.npr.org/2019/08/02/747660923/shopify-tobias-l-tke).
- **Slack**: Tiny Speck'in oyunu Glitch 2011–2012'de tutmadı; ekip, uzak ofisler arasında iletişim için geliştirdiği iç aracı ürüne çevirdi. Slack 2013/2014'te launch oldu — [TechCrunch, 2019](https://techcrunch.com/2019/05/30/the-slack-origin-story/).
- **YouTube** (dating sitesi) ve **Instagram** (Burbn check-in) pivotları — [CB Insights, 2018](https://www.cbinsights.com/research/startup-pivot-success-stories/).
- **New Coke**: ~**190.000** kör tadım testi (bazı kaynaklar ~200.000), 23 Nisan 1985 launch, 11 Temmuz 1985'te Classic geri döndü (79 gün). Araştırma "yudum tercihini" ölçtü; "eski ürünün yerine geçerse ne hissedersiniz" sorusunu sormadı — [History.com](https://www.history.com/articles/why-coca-cola-new-coke-flopped); [Coca-Cola Company](https://www.coca-colacompany.com/about-us/history/new-coke-the-most-memorable-marketing-blunder-ever).
- **Microsoft Kin**: 2 yıl geliştirme, genç segment üzerine araştırma; satışa çıktıktan **48 gün** sonra durduruldu — [NYT, 30 Haz 2010](https://www.nytimes.com/2010/07/01/technology/01phone.html); [CRN, 2010](https://www.crn.com/news/applications-os/225702127/5-lessons-microsoft-learned-from-kin).
- **Quibi**: ters vaka — tek bir abone yokken **$1,75 milyar** topladı; hedefin çok altında ~500 bin aboneye ulaştı; 6 ayda kapandı. Sermaye, validasyonun yerine geçti — [PitchBook, 2020](https://pitchbook.com/news/articles/vc-backed-quibi-flop-historically-large-fast); [Business Insider, 2020](https://www.businessinsider.com/how-quibi-went-from-raising-1-billion-to-shutting-down-2020-10).

#### Inferences
- Shopify ve Slack, raporun "workaround" ve "lead user" sezgisiyle *uyumlu*: ikisi de gerçek, kurucunun bizzat yaşadığı bir acıdan doğdu. Ama ikisi de **birinci elden** acı; raporun pipeline'ı ise **başkalarının** metninden çıkarılan ikinci el acı. Bu ikisi aynı şey değil.
- New Coke ve Kin, "araştırma yapıldı" ile "doğru değişken ölçüldü" arasındaki farkı gösteriyor. Raporun "workaround var mı, sayı var mı, tekrar var mı" testleri de yanlış değişkeni ölçme riski taşıyor: bir acının sık dile getirilmesi, o acının para ödenerek çözüleceğini göstermiyor.
- Quibi, "çok sermaye + az validasyon"un ölümünü gösteriyor; bu raporun tezini destekleyen bir vakadır, karşı örnek değil. Karşı örnek olarak kullanılmamalı.
- Bu vakaların hepsi ünlü/seçilmiş; taban oran olarak kullanılamaz. Sadece "mümkün" örnekleri.

#### Gaps
- Ağır müşteri araştırması yapıp ölen bir *startup* için birincil veriyle belgelenmiş vaka bulunamadı; New Coke ve Kin büyük şirket vakaları, startup değil.
- "Şikâyet madenciliğiyle bulunmuş ve ölmüş" ürünlerin sistematik listesi yok (bkz. §2).

---

### 7. AI fikir araçları: herhangi bir etkinlik kanıtı var mı?

#### Takeaway
**KANIT YOK.** IdeaBrowser/GummySearch tarzı araçların kullanıcılarının daha başarılı ürün çıkardığına dair akran-denetime, büyük-N anket veya bağımsız denetim bulunamadı. Bulunan tek şey vendor sayfaları, affiliate "best of" listeleri ve ürün incelemeleri.

#### Cited Findings
- IdeaBrowser'ın kendi FAQ'u: "all revenue estimates, opportunity scores, and market analysis are illustrative examples for educational purposes only" ve "never rely solely on our analysis" — [IdeaBrowser FAQ](https://www.ideabrowser.com/frequently-asked-questions). Yani ürünün kendisi öngörücü geçerlilik iddia etmiyor.
- Bağımsız ürün testi (preuve.ai, 4 Eki 2026): günün fikri 9/10 skor almış ama "bir markanın ödeyeceğini gösteren bir rakam yok" — [preuve.ai](https://preuve.ai/blog/best-saas-idea-finder-tools-2026). Bu bir ürün incelemesi; sonuç çalışması değil.
- AI destekli fikir üretiminin *yaratıcılık* üzerine nedensel kanıtı: **Doshi & Hauser 2024** (Science Advances), ön-kayıtlı deney, **293** yazar ve **600** değerlendirici; GPT-4 fikirleri hikâyeleri daha yaratıcı/iyi yazılmış/zevkli kılıyor, özellikle daha az yaratıcı yazarlarda; ama üretilen içerik **birbirine daha çok benziyor** — bireysel yaratıcılık ↑, kolektif çeşitlilik ↓ — [Science Advances](https://www.science.org/doi/10.1126/sciadv.adn5290).
- LLM'in startup *değerlendirme* performansı görev-bağımlı: 171 arşiv pitch'i üzerinde ön-kayıtlı deneyler; LLM yatırım değerlendirmesi ve hayatta kalma tahmini, şirketin dijital ayak izine maruz kalmaya göre değişiyor — [Entrepreneurship Theory and Practice, 2026](https://journals.sagepub.com/doi/full/10.1177/10422587261430320). Bu, fikir *üretme* aracı değil; değerlendirme bile koşullu.
- Akademik literatür taraması: AI-driven startup *prediction* alanında "ad-hoc prediction"dan ilkeli değerlendirmeye geçiş çağrısı; yöntemsel zayıflıklar ve veri sızıntısı riskleri — [arXiv 2508.05491](https://arxiv.org/pdf/2508.05491).

#### Inferences
- Kategorinin kendi vendor'ları bile nedensel etkinlik iddia etmiyor; "9/10 skor" gibi metrikler ödeme kanıtı değil.
- Doshi & Hauser'ın kolektif çeşitlilik bulgusu, AI fikir araçlarının yaygınlaşmasının *rekabeti artırıcı* bir etkisi olabileceğini düşündürüyor: herkes aynı araçla aynı fikir uzayına bakarsa, farklılaşma azalır. Bu bir startup sonucu ölçümü değil; mekanizma uyarısı.
- "Araç kullananlar daha başarılı" iddiası için gereken minimum kanıt (kullanıcı kohortu + kullanmayan kontrol + gelir/hayatta kalma) hiçbir yerde yok.

#### Gaps
- IdeaBrowser, GummySearch, BigIdeasDB kullanıcılarının ürün sonuçlarını izleyen hiçbir bağımsız kohort çalışması yok.
- "AI startup idea generator"ların akademik değerlendirmesi, fikir *kalitesi* (uzman puanı) düzeyinde bile yok; yalnızca yaratıcılık ve değerlendirme literatürü var.
- Vendor'ların kendi kullanıcı verileri kamuya açık değil; seçilim etkisi ölçülemiyor.

---

### 8. Ask ekonomisi: metin kanıtı ödemeye ne kadar uzağa taşınabilir?

#### Takeaway
Raporun caveat'ı doğru: **"metin kanıtı üretir; ödeme kanıtını yalnız temas (ask) üretir."** Ama ask aşaması operasyonel olarak pahalı ve dönüşümü düşük. Pipeline'ın çıktısı (metin hipotezleri), bu maliyeti karşılayacak hacmi üretmek zorunda; rapor bu maliyeti bütçelemiyor.

#### Cited Findings
- Cold email, platform-geneli: **%3,43** ortalama reply (Instantly, milyarlarca etkileşim, 1 Oca–18 Ara 2025); **%1,5** medyan campaign reply (Woodpecker, **56.614** kampanya); **%5,8** (Belkins, **16,5 milyon** email, 2024; 2023'te %6,8) — [Instantly 2026](https://instantly.ai/cold-email-benchmark-report-2026); [RevenueFlow derlemesi](https://www.revenueflow.com/blog/b2b-cold-email-benchmarks-2026).
- Daha ayrıştırılmış: **%2,1** medyan reply, **%0,6** pozitif reply, **%0,35** booked demo (GROU, **47** B2B müşterisi, 2024–2026) — [GROU](https://grouglobal.com/blog/cold-email-benchmarks).
- Reddit DM: **%26,6** reply (5.756 konuşma, Haz 2026) ve **%29,7** (2.269 konuşma, Eyl 2026); "not interested" de reply sayılıyor; vendor birinci-el veri — [OneUp Today](https://oneup.today/reddit-dm-benchmarks). Zamanlama etkisi: 6 saat içinde %51, bir hafta sonra %14 (1.107 DM, tek kohort) — [LeadsRover](https://leadsrover.io/blog/reddit-outreach-speed-beats-copy).
- Raporun kendi vakası: **400 DM → 150 geri bildirim (%37,5) → iki haftada 6 site ziyareti** (DM'lerin %1,5'i; geri bildirim verenlerin %4'ü) — [Wilson, Indie Hackers 2021](https://www.indiehackers.com/post/how-i-validated-my-idea-with-reddit-57209ffc2c).
- Pilot→paid: yapılandırılmış ücretli pilotlarda **%60–70**, ücretsiz/gevşek pilotlarda **%23** (vendor iddiası, 18 aylık takip; bağımsız kaynak yok) — [Rework, 2025](https://resources.rework.com/fr/libraries/deal-closing/pilot-programs). Gartner'a atıfla "enterprise yazılım alımlarının %78'i POC/pilot ile başlıyor" — [Monetizely, 2025](https://www.getmonetizely.com/articles/how-to-structure-enterprise-pilot-program-pricing-effective-proof-of-concept-strategies) (ikincil, doğrulanamadı).
- LOI: Powa'da 1.200 müşteri "kaydı"nın çoğu bağlayıcı olmayan LOI; $220M yatırım, Şubat 2016 administrasyon, "basically pre-revenue" — [Business Insider](https://www.businessinsider.com/powa-technologies-most-1200-powatag-deals-were-letters-of-intent-2016-2); [BBC](https://www.bbc.com/news/technology-35860814).

#### Inferences
- Aritmetik (TAHMİN): %0,35 booked-demo ve %30 demo→pilot varsayımıyla **10 pilot için ~9.500 email** gerekir. %0,6 pozitif reply ve %20 pozitif→pilot varsayımıyla **~8.300 email**. Bu, "birkaç yüz DM" ölçeğinde değil.
- Reddit DM'in reply oranı yüksek görünüyor ama bu **reply**, ödeme değil. Raporun kendi vakasında reply'ların yalnızca %4'ü siteye geldi; ödeme hiç yok.
- Pilot→paid oranları için bağımsız, akran-denetime bir benchmark bulunamadı. Vendor'ların %60–70 iddiası, "iyi yapılandırılmış, ücretli, önceden ticari şartları belirlenmiş" pilotlar için; bu, pipeline'ın ürettiği erken hipotezlerin çok ötesinde bir satış olgunluğu gerektirir.
- LOI, "commitment ladder"da güçlü sinyal olarak sunuluyor; kanıt en fazla "orta" diyor. Powa, LOI'yi gelir gibi sunmanın bedelini $220M ile ödedi.
- Sonuç: darboğaz metin madenciliği değil, **ask'in kendisi**. Rapor bunu kabul ediyor ama mimariyi buna göre bütçelemiyor (kaç DM, kaç email, kaç saat satış, hangi ICP, hangi fiyat).

#### Gaps
- İndie SaaS için bağımsız pilot→paid, demo→paid ve cold-outreach→paid ölçümü yok.
- Reddit DM verileri vendor birinci-el; "reply" tanımı ve örneklem seçimi bağımsız doğrulanamadı.
- "Ask" maliyetinin (saat/DM/email başına) parasal analizi hiçbir kaynakta yok.

---

## Verdict tablosu

Rapor açıkça "bu yöntem daha çok kazandırır" demiyor; ama başarı vakalarını ve "kanıt standardı"nı bu yönde kullanıyor. Aşağıdaki iddialar bu kullanımdan çıkarılmıştır.

| # | Raporun örtük sonuç iddiası | Verdict | Gerekçe |
|---|---|---|---|
| 1 | Topluluk metnindeki talep sinyali, ödeme davranışının güvenilir bir öncü göstergesidir | **DESTEKLENMİYOR** | Bu pipeline'ın metin sinyalini ödemeye bağlayan bir çalışma yok. Raporun kendi caveat'ı ("only an ask") bunu kabul ediyor; kendi vakasında 400 DM → 6 site ziyareti. |
| 2 | Bu sinyali sistematik çıkaran pipeline, diğer fikir kaynaklarından daha iyi startup sonucu üretir | **KANIT YOK** | Kohort, kontrol grubu veya sonuç takibi yok. Raporun andığı birkaç vaka anekdot; payda yok. |
| 3 | Raporun başarı vakaları (SaasNiche $300 MRR; BigIdeasDB $18–23k/ay) yöntemin tipik çıktısını temsil eder | **DESTEKLENMİYOR** | n=3, öz-beyan; biri (GummySearch) kapandı. $300 < $1k eşiği; $18–23k ~top %2–4. Hiçbiri "tipik" değil. |
| 4 | Workaround/harcama/sayı/tekrar, dile getirilen istekten daha güçlü bir sinyaldir | **DOĞRULANDI** (sinyal hiyerarşisi olarak) | Mom Test, von Hippel lead-user, commitment ladder; en güçlü ölçülmüş sinyal preorder. Ama "sinyal gücü" ≠ "sonuç öngörüsü". |
| 5 | Müşteri keşfi/validasyon performansı artırır | **DOĞRULANDI** (gözlemsel) | Welter 2021 (n=120) ve Leatherbee & Katila 2020 pozitif ama gözlemsel; nedensel RCT yok. En güçlü kanıt ask/preorder aşamasında. |
| 6 | Fikir kalitesi önemsizdir, icra önemlidir | **DESTEKLENMİYOR** | Kornish & Ulrich fikir kalitesinin öngörücü olduğunu buluyor; Scott vd. bunun sektöre bağlı olduğunu, yazılımda geçerli olmadığını gösteriyor. |
| 7 | CB Insights başarısızlık verisi talep-önce tezini kanıtlar | **DESTEKLENMİYOR** | %43 PMF yönü destekliyor; ama öz-beyan, geriye dönük, yalnız VC-backed, %70 sermaye son nedeni. Nedensel kanıt değil. |
| 8 | AI fikir araçlarını kullananlar daha başarılı ürün çıkarır | **KANIT YOK** | Akran-denetime/büyük-N çalışma yok. Vendor'lar kendi öngörücülüğünü reddediyor. Doshi & Hauser kolektif çeşitliliğin azaldığını gösteriyor. |
| 9 | Metin → ask → ödeme hattı operasyonel olarak uygulanabilir | **DESTEKLENMİYOR** | Cold email %0,35 demo; 10 pilot için ~8–10 bin email (TAHMİN). Pilot→paid yalnız vendor iddiası; LOI en zayıf halka (Powa). |

**Ne doğrulandı:** Raporun **"metin kanıtı üretir; ödeme kanıtını yalnız temas (ask) üretir"** caveat'ı doğru ve önemli. Workaround/harcama/sayı/tekrar hiyerarşisi, sinyal *kalitesi* açısından literatürle uyumlu. Platform/lisans riski analizi (GummySearch vakası) sağlam. Kanıt-permalink ve insan onayı ilkesi, veri kalitesi açısından makul.

**Ne doğrulanmadı:** Bu sinyal hiyerarşisinin *startup sonucu* üzerinde diğer fikir kaynaklarından daha iyi olduğu. Rapor, "iyi sinyal çıkarımı" ile "iyi sonuç" arasındaki köprüyü kurmuyor; akademik kaynakları da bu köprüyü kurmuyor.

---

## Gaps (rapor yazarı için kritik boşluklar)

1. **Payda yok.** "Acı madenciliğiyle ürün çıkaran kaç kişi denedi, kaçı öldü?" sorusuna cevap veren tek bir veri seti yok. Bu, raporun sonuç iddiasını test edilemez kılıyor. Bu boşluk, "kanıt yok" demek için yeterli ve önemli bir bulgudur.
2. **Kontrol grubu yok.** Aynı dönemde farklı fikir kaynağı kullanan (founder ağı, domain uzmanlığı, teknoloji push, rastgele) ürünlerle karşılaştırma yok. Nedensel iddia için minimum tasarım: kaynak tipine göre kohort + 12–24 ay gelir/hayatta kalma takibi.
3. **Ödeme sonucu yok.** Çoğu çalışma niyet, reply, signup veya LOI ölçüyor; ödeme ölçen çalışma neredeyse yok. Raporun kendi "ask" ilkesi doğru ama bu ilkeyi uygulayan bir kohort çalışması yok.
4. **İndie SaaS'a özgü başarısızlık verisi yok.** CB Insights VC-backed; MicroConf hayatta kalan; BigIdeasDB gelir üreten. Üçü de $0/ölü evreni dışlıyor.
5. **AI araç etkinliği yok.** Ne vendor bağımsız denetimi, ne akademik değerlendirme, ne kullanıcı kohortu var. "KANIT YOK" burada nihai cevap.
6. **Maliyet modeli yok.** Ask aşamasının email/DM/saat maliyeti ve dönüşümü ölçülmemiş; raporun önerdiği pipeline'ın birim ekonomisi hesaplanamıyor.
7. **Fikir kalitesi ölçümü bağlama duyarlı.** Scott vd. yazılımda önsel fikir değerlendirmesinin işlemediğini gösteriyor; bu, "metinden fikir sıralama" iddiasının en kırılgan noktası ve rapor bu literatürü hiç tartışmıyor.
