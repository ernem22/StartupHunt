# Startup fikri keşfinde kullanılan teknik ve metodolojiler (topluluk metni / demand-mining bağlamı)

Araştırma tarihi: 2026-10-20. Tüm bulgular somut kaynaklara dayanır; spekülasyonlar "Inferences", boşluklar "Gaps" altında.

## KQ1 — Topluluk metinlerinde doğrulanmış "unmet demand" işaretleri nelerdir? Hangileri en yüksek sinyal?

### Takeaway
Pratisyen ve akademik kaynakların ortak hiyerarşisi: (1) geçmişte harcanan para/zaman (ödemeye/çabaya kanıt), (2) geçici çözüm (workaround/duct-tape) varlığı, (3) bağımsız kaynaklarda tekrar (recurrence). "I wish..."/iltifat tarzı ifadeler neredeyse sıfır sinyal.

### Cited Findings
+ The Mom Test (Rob Fitzpatrick, 2013; 2026'da hâlâ temel referans): doğrulama iltifat saymak değil, geçmiş davranış saymaktır. Güçlü sinyaller: kişinin birden fazla uygulamayı birleştirerek workaround kurması, soruna gerçek zaman/para harcaması — [Iterators: The Mom Test](https://www.iteratorshq.com/blog/the-mom-test-why-its-on-every-founders-bookshelf); [RoadmapOne, 2026](https://roadmap.one/blog/posts/blog44-6-mom-test)
+ Fitzpatrick'in commitment ladder: zayıf (takvim zamanı, waitlist) → orta (tanıştırmalar, fiyat soruları) → güçlü (LOI, peşinat, gerçek iş yapmayı kabul) → en güçlü ("şimdi para vermeye çalışıyorlar"); iltifatlar "shiny, distracting, and worthless" — [mom-test SKILL](https://github.com/guia-matthieu/clawfu-skills/blob/main/skills/validation/mom-test/SKILL.md)
+ Workaround audit: 10 görüşmede tek bir manuel geçici çözüm bile yoksa problem henüz inşa edilebilir değil. "Excel tablosu, fiziksel defter, üç uygulamanın hacky kombinasyonu" altın damarı: "A workaround is the single strongest indicator that a problem is real" — [startupready.ai](https://startupready.ai/startup-readiness/startup-customer-validation)
+ Topluluk metni hiyerarşisi (HN/alternatif/review siteleri okuyan bir Discovery aracının 2026 rehberi): bir şikâyetin değerini üç şey yükseltir, hiçbiri ifade gücü değildir: (1) workaround'u isimlendirmesi — "a spreadsheet, a script or a manual process... the cheapest available proxy for spending money"; (2) birbirini tanımayan insanlarca farklı kelimelerle, aylar boyunca tekrar etmesi (recurrence > novelty); (3) bir sayı içermesi — "a number is the beginning of a price" — [WhittleOS: Startup Ideas from Reddit](https://whittleos.com/guides/startup-ideas-from-reddit)
+ Pratikte kullanılan arama kalıpları: "I wish there was an app for", "alternative to [tool]", "biggest problem with [industry]", "I'd pay for something that does X"; metodun adımları: çoklu kullanıcı tekrarı + workaround tespiti — [Evan Yang, Indie Hackers, 2024](https://www.indiehackers.com/post/how-i-use-reddit-to-find-ideas-and-you-can-too-eeb1458853)
+ Sales Safari (Amy Hoy/Alex Hillman, 30x500; etnografi temelli): "watering hole"larda 30-50 saat gözlem; gözlem kategorileri: Jobs, pain points, beliefs, questions, complaints, products used, struggles; dikkat kelimeleri: "easier", "faster", "less", "more", "relief", "finally" — [solvingproduct.com](https://solvingproduct.com/sales-safari); [Sales Safari 101](https://shop.stackingthebricks.com/sales-safari-101)
+ Hoy'den metodun "obvious" çıktısı: "Sales Safari leads you to stuff that's obvious, but it wouldn't have been obvious if you hadn't done the research in the first place!" — ama yöntem çok zaman ve emek ister ("very time and labour intensive"); manuel olmaktan otomatik filtreye geçiş sürecin asıl problemidir — [MAA1 toolkit, 2021](https://maa1.medium.com/my-product-management-toolkit-45-sales-safari-9132c5a920eb)
+ UGC'den ihtiyaç çıkarımının en prestijli akademik referansı: Timoshenko & Hauser, Marketing Science 2019 (500+ atıf): CNN ile "informative" cümleleri süzer → insan analist ihtiyacı formüle eder; UGC-tabanlı VOC, interview VOC ile eşdeğer ama çok daha ucuz — [MIT Sloan çalışması](https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=5084)
+ Kritik sınıf "hidden opportunities": insanlar, mevcut hiçbir ürünün çözmediği ihtiyaçları düşük önem ve düşük performans olarak puanlar (ölçek bozulur); yüksek öneme göre filtreleme yapan bir sistem en değerli fırsatları eler — [Timoshenko & Hauser 2019](https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=5084)
+ Lead-user teorisi (von Hippel, Management Science 1986): bilimsel enstrüman ticari yeniliklerinin %82'sini kullanıcı firmalar geliştirmiş; kendi sorununu kendisi çözmeye çalışan kullanıcı (workaround'u geliştiren) hem talebin öncüsü (lead) hem de en güvenilir alıcıdır — [von Hippel 1986](https://evhippel.mit.edu/wp-content/uploads/2013/08/lead-users-paper-1986.pdf); [Urban & von Hippel 1988](https://web.mit.edu/evhippel/OldFiles/www/papers/Lead%20Users%20Eric%20von%20Hippel%20and%20Glen%20Urban%20-%201988.pdf)
+ LLM dönemi: fine-tuned LLM'ler profesyonel analist düzeyinde ihtiyaç çıkarımı yapabiliyor ("SFT LLM ... on par with professional analysts") — small teams için VOC/amaçlı metin madenciliği artık ölçeklenebilir — [Timoshenko, Mao & Hauser, arXiv Jan 2026](https://arxiv.org/pdf/2503.01870v2)
+ App inceleme raporu: 136.000 inceleme / 7.758 app (Haz 2026): %52.2 1-yıldız, %67 1-2 yıldız; "1-yıldız review describing a crash on every launch is a revealed, expensive problem, not a stated preference" — [BigIdeasDB, June 2026](https://bigideasdb.com/state-of-mobile-app-pain-points-2026)
+ Stitch-workflow sinyali ("build vs buy" bağlamı): erken aşama şirketlerin iş akışlarının çoğu "stitch" (Zapier/Make/n8n + Retool/Airtable ile yapıştırılmış SaaS'lar) şeklindedir — bu yapıştırılmış, kırılgan yapılar ciddi bir ürüne oy vermiş olmanın kanıtıdır: insanlar sorunu zaten birden fazla ürünle elle çözmeyi seçmiştir — [Pixel Breeders, 2026](https://news.pixelbreeders.com/en/2026/05/28/build-vs-buy-non-technical-founder)

### Inferences
+ "I wish" gibi duygusal istek ifadeleri zayıf sinyal; "geçmişte para/zaman harcama" ve "manuel workaround" ifadeleri güçlü sinyaldir; StartupHunt veri yolunda bu iki sınıf ayrı etiketle ve deterministik kurallarla ayrıştırılmalıdır.
+ Hidden-need kümesi özel işlem gerektiriyor — yalnızca "yüksek öneme" göre filtreleme en değerli fırsatları sistemli olarak eler.

### Gaps
+ "I wish" vs "I'd pay" ifadelerinin 12-ay ödeme dönüşümünü ölçen kontrol deneği literatürde bulunamadı.
+ Genel topluluk metni (Reddit/HN) üzerinde self-selection yanlılığının doğrudan ölçümü bulunamadı; TH2019, bu yanlılığın kendi verisinde belirgin olmadığını not eder ama genelleyen bir sonuç sunar.


## KQ2 — Hangi şirketler / indie hacker projeleri topluluk metni madenciliği ile bulundu?

### Takeaway
Doğrulanmış vakalar: Indie Hackers (HN gözleminden doğdu), GummySearch (~140k kullanıcı), egghead.io içerikleri, GagCartoons (gözlem-tabanlı ama kapanmış). Aynı post-mortem'ler metodun sınırını da belgelir: metin okuma fikri verir, ödeme istemi (ask) doğrular.

### Cited Findings
+ Indie Hackers kendisi: Courtland Allen, "I searched through conversations developers were having on Hacker News, I could see how much they valued transparent stories from other developers starting profitable side projects" — manuel HN gözleminden doğdu, ürünün çekirdek değeri bu gözlemdi — [Indie Hackers, alexhillman yorumu, 2020](https://www.indiehackers.com/post/does-sales-safari-work-on-an-audience-of-developers-45fdf72d48)
+ GummySearch: kurucusu Fed, Hive Index ürününü pazarlarken Reddit'te topluluk aramayı manuel yapıyor, sonra otomatikleştirdi — "This marketing tactic was so effective for me, but was manual, so I wanted to productize it" — kendi iş akışındaki tekrar eden sürtünme ürün oldu; ürün 140.000 kullanıcıya ulaştı — [Indie Hackers: GummySearch milestones](https://www.indiehackers.com/product/gummysearch)
+ GummySearch kapanış dersi (2025-2026): Reddit'in API politikasındaki ticari-lisans değişikliği nedeniyle yeni kayıt almayı bıraktı ve tamamen kapanıyor (30.11.2025 / 01.12.2026); tek metin kaynağına bağlanan araç platform-politika riskine maruz kaldı — hız işlevleri (audience research, keyword alerting) ayrı araçlarla yeniden inşa ediliyor — [dev.to: GummySearch Alternatives 2026](https://dev.to/appierun/gummysearch-alternatives-in-2026-tools-for-finding-reddit-leads-after-the-shutdown-582c)
+ Sales Safari öğrenci vaka: "One of our most successful students is Joel Hooks from egghead, which also encourages their instructors to use Sales Safari to come up with new course topics" — metot birden fazla (indie) firmada ve içerik üretiminde yineleyici olarak doğrulanıyor; yazarı yaklaşık 10 yıldır geliştirici kitlelerine öğretiyor — [Indie Hackers yorumu](https://www.indiehackers.com/post/does-sales-safari-work-on-an-audience-of-developers-45fdf72d48)
+ Greg Kogan'ın kategori görüşü: yeni kategori yaratmak yerine yerleşik kategoride konumlanmak (No New Categories) — son teknoloji IPO'larının çoğunluğu yerleşik kategoride konumlandı; bu, "insanların zaten konuştuğu talep/ihtiyaç kelimelerinden madencilikle başla" diyen demand-mining stratejisini konumlandırma tarafında teyit eder — [Practica: No New Categories](https://practicahq.com/authors/greg-kogan); [gkogan.co](https://www.gkogan.co/)
+ Reddit-DM doğrulama vaka: Skrive kurucusu, "how I validated my idea with Reddit" yazısında ~400 kişiye DM attı ve ~150 kişiden geribildirim topladı; ancak iki hafta sonunda Reddit kaynaklı trafiğin yalnızca 6 ziyaretçi olduğunu gördü — DM kanalı geribildirim sağlar fakat dağıtım sinyali değildir — [Wilson Wilson, Indie Hackers, 2021](https://www.indiehackers.com/post/how-i-validated-my-idea-with-reddit-57209ffc2c)
+ Başarısız post-mortem (misyonu: "nobody writes down where the method fails"): Reddit madenciliğinin kurucuya pahalıya gelen 4 hata kaydı (KQ4'te ayrıntılı) — [Boris, Indie Hackers, Eyl 2026](https://www.indiehackers.com/post/four-ways-mining-reddit-for-startup-ideas-went-wrong-for-me-and-one-disclosure-307e18f861)
+ GagCartoons (Greg Kogan, 2014): eski endüstrinin gözlemlenen sorunlarından (New Yorker'a kabul zorluğu + İngiliz lisans sitesinin çağdışı altyapısı) hem şikâyet hem pazar boşluğu çıkarılıp ürün kuruldu, ancak 2017'de kapatıldı — gözlem-temelli fırsatın başarıyı garanti etmediğinin belgeli örneği — [gkogan.co: GagCartoons](https://www.gkogan.co/creating-new-business-model-cartoonists)

### Inferences
+ Vaka örüntüsü ortak: kurucu zaten topluluğun parçası, gözlem çıktısı "recurrence" göstergesi ile birleştirilir, ilk ürün genelde kurucunun kendi iş akışındaki tekrar eden manuel işin otomatikleştirilmesinden doğar.
+ "Tek-platform metin kaynağı" riski gerçek: StartupHunt'un çok kaynaklı yaklaşımı (arşiv + artımlı + HN/SE/YT) platform-politika riskine karşı doğru mimari cevaptır.

### Gaps
+ GummySearch kullanıcılarının "hangi sinyal tipi hangi ürüne dönüştü" kırılım verisi yok (140k kullanıcı verisinden kamuya açık kırılım yayınlanmamış).


## KQ3 — Farklı işaret türlerinin ağırlıklandırılması hakkında kanıt var mı? (uygulama + veri)

### Takeaway
Çarpışan sinyal türlerini nicel olarak sıralayan bağımsız bir ampirik tablo literatürde yok; ancak implisit hiyerarşi hem pratisyen rehberler hem akademik VOC çalışmaları arasında mutabık: harcama/workaround kanıtı > tekrar (bağımsız kaynak) > hacim > duygusal ifade. Ağırlıklandırmanın ölçeklenebilir uygulaması "LLM filtrele + insan değerlendir".

### Cited Findings
+ Commitment ladder uygulaması (Fitzpatrick'den): sinyallerin tanımlı katmanları (zayıf → güçlü) ve her katman için kanıt kategorisi — kurucu doğrulama araçlarında standart şablon haline geldi; iltifat saymak yerine taahhüt sayma önerilir — [mom-test SKILL](https://github.com/guia-matthieu/clawfu-skills/blob/main/skills/validation/mom-test/SKILL.md); [Kill My Startup, 2026](https://killmystartup.org/blog/customer-interviews-mom-test)
+ WhittleOS beş adımlı uygulama: (i) şikâyeti cümle + link olarak saklama; (ii) bağımsız kaynak tekrarı; (iii) workaround okuma; (iv) cevapları bağımsız saymama ("do not count replies as independent evidence"); (v) tekrar kanıtlanınca alıcıyı sorma — metodun yayınlanmış gerçek bir Discovery koşusu üzerinde uygulandığı belgelenmiş — [WhittleOS, 2026](https://whittleos.com/guides/startup-ideas-from-reddit)
+ Timoshenko & Hauser 2019 uygulama mimarisi: ML sınıflayıcı ön-süzgeç ("It helps ... eliminate non-informative content. If only 40% of sentences are informative but the screening raises it to 80%, analysts can review far more efficiently") + insan analist (3 kişi, Griffin & Hauser yöntemi) — yani ağırlıklandırmanın ölçeklenebilir formu "makine-ön + insan-arka" hibrit yapı — [MIT Sloan çalışması](https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=5084)
+ Bu hibrit yapı 2025-2026'da LLM'e taşındı: supervised fine-tuning ile LLM, profesyonel insan analistle aynı düzeyde ihtiyaç formulasyonu yapabiliyor; fakat "generic CNs ('ease of use') actionable değil, overly specific CNs de creativity'yi kısıtlar" — çıktı soyutlama seviyesi belirlenmiş — [Timoshenko, Mao & Hauser, arXiv Jan 2026](https://arxiv.org/pdf/2503.01870v2)
+ "Hidden opportunity" ağırlıklandırması: TH2019, düşük önem + düşük performans kümesindeki ihtiyaçları inovasyon fırsatı olarak işaretler ve yüksekönem hedeflemeye karşı uyarır: "Focusing on highly important customer needs is tempting, but we cannot ignore low-importance customer needs" — [TH2019](https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=5084)
+ Lead-user ağırlıklandırmasının endüstri doğrulaması: 3M'de lead-user (pyramiding) metoduyla ortaya çıkan major new product line sayısı, 3M'in geleneksel yöntemiyle ürettiği tarihi ortalamayla benzer — yani "yaratıcı kullanıcı" işareti, bir şirket ölçeğinde bile ölçülebilir ağırlık taşıyor — [von Hippel, Democratizing Innovation, Ch10, 2005](https://web.mit.edu/evhippel/www/books/DI/Chapter10.pdf)
+ Lead-user konseptinin doğrulama testi: Urban & von Hippel (1988) — lead-user özellikli konsept, normal müşteri konseptlerine karşı "consistently preferred at even twice the price (p < 0.01)" — işaretin konsept-doğrulama testlerinde ölçülebilir avantajı — [Urban & von Hippel 1988](https://web.mit.edu/evhippel/OldFiles/www/papers/Lead%20Users%20Eric%20von%20Hippel%20and%20Glen%20Urban%20-%201988.pdf)

### Inferences
+ Ağırlıklandırma literatürde "kural kümesi" olarak sabitlenmemiş; StartupHunt'ın mimarisi (sınıflandırıcı + insan incelemesi hibriti) bu grubun standart uygulama kalıbıyla uyumlu.
+ "Recurrence + bağımsız kaynak + sayı + alıcı kimliği" (WhittleOS 4'lü test) StartupHunt'un inceleme akışında ölçülebilir; bu ağırlıklandırma pilot aşamasında kendi verisi üzerinde ampirik kalibre edilebilir — literatürdeki bu boşluğu StartupHunt pilotunun kendisi doldurabilir.

### Gaps
+ "Sinyal türü → nihai başarı" ilişkisini ölçen kontrol deneyi bulunamadı; sinyal türlerini ampirik olarak kıyaslayan deneysel çalışma bulunamadı.


## KQ4 — Sinyal keşfi yöntemlerinin başarısız şekilleri nelerdir?

### Takeaway
Belgelenmiş başarısız şekilleri 4 ana grup: (1) örnekleme yanlılığı (şikâyet eden öfkeli azınlık örneği, memnun sessiz çoğunluk), (2) öz-teyit yanlılığı (okuyanın kendini teyidi), (3) komünite seçilme yanlılığı (segment ≠ pazar), (4) "okuma sorunu çözmez": ödeme istemi (ask) yalnızca gerçek temasla ölçülür.

### Cited Findings
+ Bağımsız post-mortem (Ağustos-Eylül 2026; yazanın amacı "nobody writes down where the method fails"): (1) "novelty hunting" — özgün şikâyetler tek kişinin tuhaf düzeyine aittir, değerli olan can sıkıcı ve tekrar eden şikâyetlerdir; (2) bulguların "cümle + link" olarak yazılmaması — "by the fourth thread you already know what you are hoping to see, and you see it" — öz-teyit tuzağı; (3) şikâyet hacmi ≠ talep — "Threads sample who was annoyed enough to type, not who would pay"; (4) komünite seçilme yanlılığı — "A community selects its members... That is a real segment. It is not the market" — [Boris, Indie Hackers, 2026](https://www.indiehackers.com/post/four-ways-mining-reddit-for-startup-ideas-went-wrong-for-me-and-one-disclosure-307e18f861); uzun sürüm — [WhittleOS guide](https://whittleos.com/guides/startup-ideas-from-reddit)
+ Aynı kaynakta okuma yönteminin sınırları: "Manual reading does not scale, and it self-confirms" — metin okuma ölçeklendiğinde bile öz-teyit riski sürer; ayrıca link, sanılandan az kanıt sağlar: "a link buys less than it looks like" — sayfanın okunduğunu kanıtlar, bağımsız yeniden-üretilmeyi garanti etmez — [WhittleOS](https://whittleos.com/guides/startup-ideas-from-reddit)
+ Pratisyen madencilik rehberi standart uyarıları: "Public voice skews toward the angry and the vocal; vendor communities skew loyal; app stores over-represent update anger" — her kaynağın bilinen bir eğilimi (skew) var; çıktı her zaman "hypothesis to validate, never a verdict" — [voice-of-customer-miner SKILL](https://github.com/deanpeters/Product-Manager-Skills/blob/main/skills/voice-of-customer-miner/SKILL.md)
+ Metin-doğrulama katı sınırı: "Complaining is free; paying is not. The distance between 'this is infuriating' and 'I would pay monthly' is where most idea lists quietly die. Nothing you read can close that distance — only an ask can" — talep istemi için metin yeterli değildir; pilot/peşin ödeme gibi gerçek istemler gerekir — [WhittleOS](https://whittleos.com/guides/startup-ideas-from-reddit)
+ İnceleme verisi uyarısı: 136.000 incelemeye dayanan 2026 raporu ilginç bir veri kümesi sunar, ancak rapor ticari bir ürünün (BigIdeasDB) tanıtım içeriğidir ve analiz LLM-temelli; rakamlar bağımsız teyit edilmemiş kabul edilmelidir — [BigIdeasDB](https://bigideasdb.com/state-of-mobile-app-pain-points-2026)
+ Akademik app-review madenciliği: AR-Miner (ACM 2014, 780+ atıf) "informative" inceleme cümlelerini geliştiriciler için seçip sıralar; devam çalışmaları (ör. "Mining Novel Customer Needs from Online Product Review", 2024-2026) bu görevin bugün LLM/hibrit yöntemlerle yapıldığını gösterir — bu cümleler ürün önerisi değil, girdi (hypothesis) olarak işlenir — [AR-Miner, ACM](https://dl.acm.org/doi/10.1145/2568225.2568263); [Huang 2026, IJPR](https://www.tandfonline.com/doi/full/10.1080/00207543.2026.2625971)

### Inferences
+ Başarısız şekillerinin StartupHunt karşılıkları: öfkeli azınlık örneklemesi → "junk=archived" + insan incelemesi; komünite seçilme yanlılığı → çok kaynaklı (HN/SE/YT/Reddit) çapraz doğrulama; öz-teyit → insan ("BU") onayı merkezde; ödeme sorusu → metin yalnızca kanıt sunar, karar insanda.
+ Ticari raporlarda çıkar çatışması (kendi ürününü tanıtan veri) yaygın: akademik teyit (Timoshenko/Hauser, von Hippel, AR-Miner) + birden fazla bağımsız pratisyen kaynağı hedeflenmeli — metin sinyalleri kesin kanıt yerine hipotez olarak kodlanmalı.

### Gaps
+ "Survivorship bias" (metin madenciliğinden doğan ürünlerin başarısızlığı/devamı) hakkında nicel bir ölçüm bulunamadı; mevcut vaka analizlerinin tamamı "başarılı öykü" yanlılığı taşıyor (tek istisna yukarıdaki post-mortem).
+ UGC madenciliği ve geleneksel interview VOC'un "kaç tane yanlış pozitif" ürettiğine dair kıyaslama deneği bulunamadı.
