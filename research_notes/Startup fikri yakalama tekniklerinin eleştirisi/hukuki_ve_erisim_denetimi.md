# Hukuki ve erişim denetimi — "Arşiv yolları hayatta; review platformları hukuken kapalı"

Denetlenen metin: `reports/Startup fikri yakalama teknikleri.md`, "Arşiv yolları hayatta; review platformları hukuken kapalı" ve "StartupHunt mimarisinde yeniden tasarlanacak beş nokta" (madde 5).
Mod: şeytanın avukatı. Metin yeniden yazılmadı; yalnız iddialar birincil kaynakla sınandı.
Tüm kaynaklara erişim tarihi: **21 Ekim 2026** (aksi belirtilmedikçe).
Bu not hukuki görüş değildir; metin ne diyor / mahkeme ne dedi / ne test edilmedi ayrımı korunarak risk tarif edilir.

## 1. Verdict tablosu

| # | Rapordaki iddia | Verdict | Tek cümlelik gerekçe |
|---|---|---|---|
| 1 | Arctic Shift aylık dump zinciri + incremental API ile "arşiv yolu hayatta" | **KISMEN** | Teknik olarak çalışıyor (21 Eki 2026'da canlı), ama dayanıklılık iddiası yanlış: Reddit public API'si Mart 2027'de kapanıyor ve Arctic Shift'in ingest'i ona bağlı. |
| 2 | Reddit dump'larını ticari üründe kullanmak Reddit şartlarına uygundur (ima) | **YANLIŞ / HUKUKEN RİSKLİ** | Reddit User Agreement ticari exploit'i ve yazılı izin olmadan veri toplamayı açıkça yasaklıyor; dump'lar için verilmiş bir lisans yok. |
| 3 | Reddit v. Anthropic (2025) davası | **DOĞRULANDI** | Dava gerçek; N.D. Cal.'den SF Superior Court'a remanded; Eylül 2026'da sözleşme/UCL iddiaları büyük ölçüde ayakta kaldı. |
| 4 | Reddit v. Perplexity (2025/2026) davası | **KISMEN** | Dava gerçek ve aktif, ama caption yanlış: `Reddit, Inc. v. SerpApi LLC et al.`, 1:25-cv-08736 (S.D.N.Y.). Perplexity davalılardan biri. |
| 5 | Pushshift Reddit tarafından kapatıldı | **DOĞRULANDI** | 1 Mayıs 2023'te Data API Terms ihlali gerekçesiyle erişimi kesildi; bugün yalnız onaylı moderatörlere açık. |
| 6 | Arctic Shift'in proje olarak bir hukuki pozisyonu/lisansı var | **KAYNAK BULUNAMADI** | Repo'da LICENSE dosyası yok, ToS yok; README yalnız "removal requests" ve bağış bağlantısı veriyor. |
| 7 | SE dump'ı CC BY-SA; "atıf zincirinin çıktıda taşınması" uyumu tamamlar | **YANLIŞ (kısmen)** | Atıf = BY ayağı. ShareAlike ayağı, uyarlamanın aynı lisansla paylaşılmasını gerektirir; atıf tek başına SA'yı karşılamaz. |
| 8 | Temmuz 2024'te SE dump'ı archive.org'dan kendi altyapısına taşındı | **KISMEN** | Rapordaki Meta.SE duyurusu makul; bu turda birincil sayfa açılmadı, bağımsız doğrulanmadı. |
| 9 | ekşi robots.txt: `Allow: /`, AI bot blokları, `Content-Signal: ai-train=no, ai-input=no, search=yes` | **DOĞRULANDI** | 21 Eki 2026 canlı çekimde birebir bu içerikte. |
| 10 | Bu robots.txt profili "normal crawler erişimini onaylar" → ticari kullanım serbest | **YANLIŞ** | robots.txt lisans değil; ekşi'nin kullanıcı sözleşmesinde üçüncü kişiye ticari kullanım izni yok, telif yazarda. |
| 11 | FSEK'te TDM istisnası var (veya DSM Art. 4 Türkiye'de geçerli) | **DOĞRULANDI (istisna YOK)** | Akademik kaynak: "FSEK'te TDM'ye özgü açık bir sınırlamaya yer verilmemiştir." |
| 12 | KVKK, nick + entry saklamaya uygulanır | **DOĞRULANDI** | ekşi'nin kendi gizlilik politikası nick/entry'yi KVKK kapsamında işlenen kişisel veri olarak listeliyor. |
| 13 | ekşi scraper'lara dava açtı / hukuken engelledi | **KAYNAK BULUNAMADI** | Yalnız teknik bot blokları bulundu; dava veya ihtarname kaydı bulunamadı. |
| 14 | Trustpilot Consumer ToS (Şubat 2025) alıntısı | **DOĞRULANDI** | Cümle birebir; hem Şubat 2025 hem Ekim 2026 sürümünde var. |
| 15 | Trustpilot Business Guidelines alıntısı ("copy, collect and commercially exploit") | **DOĞRULANDI** | Birebir; "taking legal action" ifadesi de metinde. |
| 16 | "Trustpilot v. SellCell davası SDNY'de açıldı, 1:26-cv-04478-NRB" | **YANLIŞ** | Dava `GlobalGuru Tech, LLC d/b/a SellLocked.com v. Trustpilot, Inc.`; SellCell taraf değil. |
| 17 | "Yaptırım riski teorik değil" | **DOĞRULANDI (gerekçe düzeltilmeli)** | Trustpilot ihtarname gönderdi, SellCell içeriği kaldırdı; mahkeme ihtarnameyi haklı buldu. Ama bu bir scraping hükmü değil. |
| 18 | App Store Connect / Play `reviews.list` yalnız kendi uygulamanız için | **KISMEN** | Doküman URL'leri doğru; bu turda sayfa içerikleri tam doğrulanamadı (JS-render/erişim). |
| 19 | iTunes RSS storefront başına ~500 review | **KAYNAK BULUNAMADI** | Yalnız üçüncü taraf PyPI paket sayfasına dayanıyor; birincil Apple dokümanı bulunamadı. |
| 20 | HN Firebase API "There is currently no rate limit" | **DOĞRULANDI** | README'de birebir bu cümle var. |
| 21 | HN / Algolia API'lerinin ticari kullanım şartları | **KAYNAK BULUNAMADI** | HN API için veri lisansı/ToS yok; Algolia'nın public HN endpoint'i için ayrı yayımlanmış ToS yok. |
| 22 | EU DSM Art. 4 TDM istisnası Reddit/ekşi içeriğine ticari kullanımda uygulanır | **KISMEN** | AB içinde, hukuka uygun erişimde ve opt-out yoksa uygulanır; sözleşmeyi (ToS) bertaraf etmez, çıktının umuma iletilmesini kapsamaz. |
| 23 | `Content-Signal` hukuken bağlayıcı | **KISMEN** | Metin kendini "access condition" ve Art. 4 rezervi ilan ediyor; standart kuruluşça onaylanmadı, mahkeme testi yok. |
| 24 | hiQ v. LinkedIn: robots.txt/CFAA ekseni | **DOĞRULANDI** | CFAA'da public scraping lehine; sözleşme + trespass'ta aleyhine; 500.000 $ + kalıcı yasak + veri silme. |
| 25 | Erişim planı dayanıklı (tek gerçek savunma: arşiv + çok kaynak) | **YANLIŞ** | Tek maintainer, SLA yok, 9-10 Eki 2026 kesintisi, ID değişimiyle %90-95 tamlık, Mart 2027 API kapanışı. |

---

## 2. Reddit: arşiv "hayatta" ama ticari kullanım izni yok

### 2.1 Metin ne diyor

Reddit User Agreement (1 Temmuz 2026 sürümü, erişim 21 Eki 2026) iki ayrı yasak koyuyor:

> "Access, search, or collect data from the Services by any means (automated or otherwise) except as permitted in these Terms or in a separate agreement with Reddit (we conditionally grant permission to crawl the Services in accordance with the parameters set forth in our robots.txt file, but scraping the Services without Reddit's prior written consent is prohibited)"
> — <https://www.redditinc.com/policies/user-agreement>

> "license, sell, transfer, assign, distribute, host, or otherwise commercially exploit the Services or Content"
> — aynı belge

Data API Terms (erişim 21 Eki 2026):

> "If you are interested in using the Data APIs for commercial purposes, research in excess of rate limits, or for any use that is not expressly permitted under the Data API Terms, then you will need to enter into a separate agreement with Reddit."
> — <https://redditinc.com/policies/data-api-terms>

Public Content Policy (Updated October 06, 2026; erişim 21 Eki 2026):

> "you can use Reddit content for non-commercial uses, such as learning and community, but talk to us if you have commercial purposes in mind."
> "we do not believe that third parties have a right to misuse public content just because it's public."
> — <https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy>

**Kritik ayrım:** Bu üç belge *doğrudan Reddit'e erişimi* düzenliyor. Üçüncü taraf dump'ını kullanan bir ürün Reddit'in "Services"ına erişmiyor olabilir; bu durumda sözleşme zinciri (privity) tartışmalı hale gelir. Yani "dump kullanmak UA'yı ihlal eder" iddiası **otomatik değil**; ama "dump kullanmak güvenli" iddiası da dayanaksız — çünkü dump'ın kendisi için Reddit'in verdiği bir lisans yok ve Public Content Policy ticari kullanımı lisans rejimine bağlıyor.

### 2.2 Mahkeme ne dedi

**Reddit, Inc. v. Anthropic PBC**
- Önce `3:25-cv-05643` (N.D. Cal., Judge Trina L. Thompson), 3 Temmuz 2025'te removal.
- 30 Mart 2026: dava **remanded** → San Francisco Superior Court, `CGC-25-625892`. Federal dava "Civil Case Terminated."
- 17-18 Eylül 2026: Judge Harold E. Kahn demurrer'ı büyük ölçüde reddetti. Ayakta kalanlar: **breach of contract, interference with contract, California UCL**. Düşenler: unjust enrichment, trespass to chattels (düzeltme hakkı verildi).
- Mahkeme, Reddit UA'sının "unenforceable browsewrap" olduğu savunmasını reddetti.
- Kaynaklar: <https://www.courtlistener.com/docket/70704683/reddit-inc-v-anthropic-pbc/>; <https://news.bloomberglaw.com/ip-law/anthropic-loses-bid-to-dismiss-reddit-ai-scraping-privacy-suit>; <https://ppc.land/anthropic-loses-bid-to-keep-reddits-5-scraping-claims-in-federal-court/>

**Reddit, Inc. v. SerpApi LLC et al.** (raporun "Reddit v. Perplexity" dediği dava)
- `1:25-cv-08736` (S.D.N.Y., Judge Paul A. Engelmayer), 22 Ekim 2025.
- Davalılar: Perplexity AI, SerpApi, Oxylabs UAB, AWMProxy.
- 31 Temmuz 2026: MTD büyük ölçüde reddedildi. Ayakta: DMCA §1201(a)(1)(A) (her iki davalı), §1201(a)(2) (SerpApi), NY civil conspiracy. Düşen: §1201(b) SerpApi, unjust enrichment/unfair competition.
- Dava **aktif**; Ekim 2026'da hâlâ discovery ve avukat çatışması tartışılıyor.
- Kaynaklar: <https://www.courtlistener.com/docket/71720563/reddit-inc-v-serpapi-llc/>; <https://www.reuters.com/legal/litigation/perplexity-ai-loses-bid-toss-reddit-lawsuit-over-data-scraping-2026-07-31/>

**Bu ne anlama geliyor / ne anlama gelmiyor:**
- Anlamı: Reddit'in **sözleşme temelli** saldırısı ayakta; "public veri = serbest" savunması bu davalarda işlemedi. Fair use savunması da devre dışı, çünkü iddialar telif değil sözleşme/trespass.
- Anlamı değil: Bu davalar **doğrudan erişen** scraper'lara karşı. Hiç Reddit'e erişmemiş, dump üzerinden çalışan bir ürünün sorumluluğu **test edilmedi**. Bu, raporun en büyük hukuki boşluğu.
- İkincil risk: Reddit tarafı kullanıcı silme taleplerini ("deletion requests") sözleşme iddiasının merkezine koydu. Arşiv tabanlı ürün tanımı gereği silinmiş içeriği tutar → aynı teoriyle hedeflenebilir.

### 2.3 Arctic Shift'in hukuki pozisyonu

- README yalnız şunu diyor: "Making Reddit data accessible to researchers, moderators and everyone else." Lisans dosyası yok, kullanım şartı yok.
- Tek hukuki mekanizma: **removal request formu** ("Removal requests and generic support requests can be submitted here"). Yani proje, hukuki bir izin değil, **gönüllü silme** mekanizması sunuyor.
- Kaynak: <https://github.com/ArthurHeitmann/arctic_shift>

**Değerlendirme:** "Arşiv yolu hayatta" cümlesi teknik bir olgu olarak doğru; hukuki bir güvenlik iddiası olarak **kanıtsız**. Projenin kendisi bile bir lisans iddia etmiyor.

### 2.4 Pushshift

Reddit, 1 Mayıs 2023'te Pushshift'in Data API erişimini kesti:

> "Pushshift is in violation of our Data API Terms and has been unresponsive despite multiple outreach attempts... we are turning off Pushshift's access to Reddit's Data API, starting today."
> — <https://www.reddit.com/r/modnews/comments/134tjpe/reddit_data_api_update_changes_to_pushshift_access/>

Pushshift bugün yalnız onaylı moderatörlere açık; halka açık dump'ları kaldırıldı. Bu, "platform tek taraflı olarak arşivi kapatabilir" önermesinin **gerçekleşmiş** örneği.

---

## 3. Stack Exchange: atıf ≠ share-alike

### 3.1 Lisans yapısı (DOĞRULANDI)

> "all publicly accessible user contributions are licensed under Creative Commons Attribution-ShareAlike license as follows: Content contributed before 2011-04-08 (UTC) is distributed under the terms of CC BY-SA 2.5. Content contributed from 2011-04-08 up to but not including 2018-05-02 (UTC) is distributed under the terms of CC BY-SA 3.0. Content contributed on or after 2018-05-02 (UTC) is distributed under the terms of CC BY-SA 4.0."
> — <https://meta.stackexchange.com/help/licensing>

### 3.2 ToS: dump dışı indirme ticari kullanımda yasak (DOĞRULANDI)

> "Any other downloading, copying, or storing of any public Network Content (other than Subscriber Content or content made available via the Stack Overflow API) for other than personal, noncommercial use is expressly prohibited without prior written permission from Stack Overflow..."
> — Public Network Terms of Service, last updated 13 Kasım 2025, <https://stackoverflow.com/legal/terms-of-service/public>

> "From time to time, Stack Overflow may make available compilations of all the Subscriber Content on the public Network (the 'Creative Commons Data Dump'). The Creative Commons Data Dump is licensed under the CC BY-SA license."
> — aynı belge

**Sonuç:** Rapordaki "dump yolu meşru yol" önermesi **doğru**. Ama bu, "atıf zinciri uyumu tamamlar" sonucunu desteklemiyor.

### 3.3 Share-alike yanlış okuması (YANLIŞ)

Creative Commons'un kendi tanımı:

> "ShareAlike (SA), which requires adaptations of the material be released under the same license."
> — <https://creativecommons.org/faq/>

Buradan çıkan üç ayrı yükümlülük:
1. **BY:** atıf (yazar, kaynak linki, lisans linki, değişiklik belirtme).
2. **SA:** *Adapted Material* üretildiyse, o materyal BY-SA ile lisanslanmalı.
3. **"Mere aggregation" istisnası:** Ayrı ve bağımsız eserlerin bir araya getirilmesi tek başına uyarlama sayılmaz.

Raporun "attribution chain in output" formülü yalnız (1)'i karşılıyor. StartupHunt'ın fiili işi — cümle çıkarma, normalize etme, embedding, kümeleme, LLM ile özetleme — (2)'yi tetikleme ihtimali yüksek. Yani:
- Ham alıntıyı birebir gösterip linkini vermek → BY yeterli olabilir.
- Cümleyi kırpıp yeniden yazmak / başka dillere çevirmek / küme etiketi üretmek → **uyarlama**; bu çıktının BY-SA ile lisanslanması gerekebilir.
- Tüm ürünün BY-SA olması gerekmez; **uyarlanan kısım** gerekir. Ama "hangi kısım uyarlama" sınırı belirsiz ve test edilmemiş.

**Not:** CC FAQ'nin "If CC SA-licensed content is included in a database, does the entire database have to be licensed under an SA license?" maddesi bu turda okunamadı (sayfa 92 KB'ta kesildi) — **Gap**. Bu, raporun en çok ihtiyaç duyduğu cevap.

### 3.4 2024 dump taşınması (KISMEN)

Rapor Meta.SE duyurusuna (`/questions/401324/...`) dayanıyor. Bu turda bu sayfa açılmadı; iddia makul ama bağımsız doğrulanmadı. **Gap.**

---

## 4. ekşi sözlük: robots.txt izin değil, telif yazarda

### 4.1 robots.txt (DOĞRULANDI, birebir)

21 Ekim 2026 canlı çekim, <https://eksisozluk.com/robots.txt>:

```
User-agent: *
Sitemap: https://eksisozluk.com/sitemap.xml
Allow: /
Disallow: /video/*
Content-Signal: ai-train=no, search=yes, ai-input=no

User-agent: Mediapartners-Google
Disallow:

User-agent: Microsoft URL Control
Disallow: /

User-agent: grapeshot
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Omgilibot
Disallow: /

User-agent: Omgili
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: ImagesiftBot
Disallow: /

User-agent: cohere-ai
Disallow: /
```

Raporun tarifi **birebir doğru**. Ancak raporun çıkardığı sonuç ("normal crawler erişimini onaylarken...") fazla ileri gidiyor: `Allow: /` bir **teknik erişim tercihi**, lisans değil.

### 4.2 robots.txt'in hukuki ağırlığı

Cloudflare'nin kendi dokümanı:

> "`robots.txt` compliance is voluntary. The file expresses your preferences, but it does not prevent crawlers from accessing your content at a technical level. Some crawler operators may disregard your `robots.txt` directives..."
> — <https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/>

Content Signals sitesi:

> "Courts and regulators may conclude that robots.txt files do not impose enforceable legal obligations."
> — <https://contentsignals.org/>

Yani: robots.txt **ne izin verir ne yasaklar**; en fazla sözleşmesel bir "access condition" iddiasının parçası olur. Bu iddia da **test edilmemiş**.

### 4.3 ekşi'nin sözleşmesi ve telif (KRİTİK)

ekşi sözlük Kullanıcı Sözleşmesi (26.01.2016 güncellemesi), <https://eksisozluk.com/eksi-sozluk-kullanici-sozlesmesi--2602660>:

> "ekşi sözlük'te oluşturduğunuz/yayınladığınız içeriklerin telif hakları size aittir. bu nedenle ekşi sözlük'te yayınlandığınız içeriğinizi (entrylerinizi) ticari maksatla dahi dilediğiniz şekilde derleyip, kullanabilirsiniz."

Bu cümle **yazara** kendi entry'sini ticari kullanma hakkı veriyor — üçüncü tarafa vermiyor. Devamında yazar, ekşi'ye mali haklarını lisanslıyor. Üçüncü kişi için hiçbir kullanım izni yok.

Sonuç: ekşi içeriğini ticari üründe kullanmak için ya (a) binlerce yazardan izin, ya (b) bir yasal istisna gerekir. **Türkiye'de (b) yok.**

### 4.4 FSEK'te TDM istisnası yok (DOĞRULANDI)

> "FSEK'te TDM'ye özgü açık bir sınırlamaya yer verilmemiştir."
> — Serkan Dalkıran, "Telif Hukuku Kapsamında Metin ve Veri Madenciliğine İlişkin Mukayeseli Bir Analiz ve Türk Hukuku İçin Model Önerisi", <https://dergipark.org.tr/tr/download/article-file/5626014>

Aynı kaynak: Aralık 2025'te TBMM'ye sunulan "Dijital Telif Hakları Kanun Teklifi" TDM istisnası **öngörmüyor**; ABD tarzı "adil kullanım" getirmeye çalışıyor. Yani:
- FSEK m. 21 (işleme) ve m. 22 (çoğaltma) izin gerektirir.
- FSEK m. 35 (atıf) yalnız açıklama/eştiri/tanıtım amaçlı alıntıya izin verir; ticari madencilik bunun dışında.
- Tazminat FSEK m. 68 uyarınca **üç katına** kadar artırılabilir.

**Bu, raporun TR ayağındaki en büyük hukuki açıktır.** Raporda FSEK hiç anılmıyor; "robots.txt uyumu" hukuki güvence gibi sunuluyor.

### 4.5 KVKK (DOĞRULANDI — uygulanır)

ekşi'nin gizlilik politikası, <https://eksisozluk.com/legal/privacypolicy>:

> "ekşi'deki hesabınızı kullanırken doğrudan paylaştığınız nick, kullanıcı adı, eposta adresi, cinsiyet, doğum tarihi, entry, entry altı yorumu, mesaj... verileriniz saklanmaktadır."
> "...nick'iniz, entry'leriniz... herkes tarafından görüntülenebilir."
> "...6698 sayılı kişisel verilerin korunması kanunu ('kvkk') çerçevesindeki yükümlülüklerimizi..."

Yani ekşi'nin kendisi nick + entry'yi **kişisel veri** olarak işliyor ve KVKK m. 5 hukuki sebeplerine dayandırıyor. StartupHunt bu veriyi kopyalayıp sakladığında:
- Kendi veri sorumlusu yükümlülükleri doğar (aydınlatma, saklama süresi, silme).
- "Alenileşmiş veri" otomatik hukuki sebep değil; KVKK m. 5/2-f (meşru menfaat) dengelmesi gerekir.
- Sunucular Türkiye dışındaysa KVKK m. 9 yurt dışı aktarım rejimi devreye girer.

Rapor "KVKK"yı hiç anmıyor. Bu, TR kanalı için **operasyonel** bir eksiklik (silme talebi akışı, saklama süresi, aydınlatma).

### 4.6 ekşi dava açtı mı? (KAYNAK BULUNAMADI)

- Teknik engelleme var (AI bot blokları, `Content-Signal`).
- ekşi'nin bir scraper'a karşı açtığı dava, gönderdiği ihtarname veya kazandığı hüküm için **kaynak bulunamadı**.
- Bu, riskin yok olduğu anlamına gelmez; sadece **uygulama sicili boş** demektir.

---

## 5. Trustpilot: alıntılar doğru, dava caption'ı yanlış

### 5.1 Consumer ToS (DOĞRULANDI)

> "You must not carry out in any way (including facilitating, permitting or authorising) any text mining, data mining or web scraping of our platform for any purpose without our express permission. This includes the training and development of artificial intelligence systems or models."
> — Terms of Use for Consumers, Şubat 2025 sürümü, <https://corporate.trustpilot.com/legal/for-reviewers/terms-of-use-for-consumers/feb-2025>

Ekim 2026 sürümünde de aynen duruyor; üstelik "you" tanımına otomatik erişimi ekliyor:

> "...the person or entity browsing, searching, writing a review, or otherwise using or accessing, whether directly or indirectly (including, for example, through use of automated technologies such as AI agents or screen scrapers), our platform."
> — <https://corporate.trustpilot.com/legal/for-reviewers/terms-of-use-for-consumers/oct-2026>

Aynı maddede: "You must not access, search or collect content from our platform by any means (automated or otherwise) except as provided on our platform or specifically approved by us."

### 5.2 Business Guidelines (DOĞRULANDI)

> "We also don't allow users to copy, collect and commercially exploit the data on our platform without our permission (known as 'data scraping'). If you misuse our platform, data or brand, we will take action - this can include blocking access to or suspending features in your Trustpilot business account, terminating any agreement you have with us, placing a Consumer Warning on your profile and hiding your TrustScore and taking legal action."
> — <https://legal.trustpilot.com/for-reviewers/guidelines-for-businesses> (ve Haziran/Eylül 2026 sürümleri)

### 5.3 Dava: caption yanlış (YANLIŞ)

Rapor: "**Trustpilot v. SellCell** davası SDNY'de açıldı (docket 1:26-cv-04478-NRB)".

Gerçek:
- Caption: **`GlobalGuru Tech, LLC d/b/a SellLocked.com v. Trustpilot, Inc.`**, `1:26-cv-04478 (NRB)`, S.D.N.Y.
- Filed: 28 Mayıs 2026. Judge: Naomi Reice Buchwald.
- **Davacı** Trustpilot değil; Trustpilot'a karşı TrustScore'unu SellCell.com'da gösteremeyen bir Trustpilot müşterisi.
- SellCell.com **taraf değil**; mahkeme kararında "nonparty" olarak geçiyor.
- 23 Temmuz 2026: **preliminary injunction REDDEDİLDİ** (ECF 34).

Kararın ilgili kısımları:

> "There is no dispute that SellCell did not have the authority to use 'a widget that it had built itself'... no plan, paid or unpaid, authorizes a Trustpilot customer to use a third-party widget."
> "Trustpilot was entitled to send a cease and desist letter to protect its intellectual property rights."
> "it would be unreasonable to require Trustpilot to waive its objection to the unauthorized display of Trustscores and customer reviews and provide its service for free."
> — <https://app.midpage.ai/document/globalguru-tech-llc-v-trustpilot--b5011e65-01ce-4c05-958f-ed1d1c43da7b> (ECF 34 tam metin)

**Doğru okuma:**
- Raporun "yaptırım riski teorik değil" sonucu **maddeten doğru**: Trustpilot 27 Kasım 2025'te ihtarname gönderdi, SellCell 10 Şubat 2026'da içeriği kaldırdı, mahkeme ihtarnameyi hukuka uygun buldu.
- Ama bu bir **marka/widget sözleşmesi** uyuşmazlığı. Ne scraping yasağının geçerliliğine, ne ToS'un data mining'e uygulanmasına dair bir hüküm değil. Raporun "dava dosyasında belgeli" ifadesi, Trustpilot'un **opposition brief**'ine işaret ediyor; bu bir mahkeme hükmü değil, taraf argümanı.
- Ayrıca dava **dismissed/settled değil**; PI reddedildi, dava açık. Yani "aktif" demek doğru, ama "Trustpilot'un açtığı dava" demek yanlış.

---

## 6. Apple / Google

**Raporun iddiası:** App Store Connect "Customer Reviews" yalnız kendi uygulamanız için; Play `reviews.list` yalnız sahibi olduğunuz app için ve 7 günlük pencere; iTunes RSS storefront başına ~500 review.

**Denetim:**
- Apple dokümanı (`developer.apple.com/documentation/appstoreconnectapi/customer-reviews`) mevcut ama JS ile render ediliyor; bu turda yalnız sayfa başlığı alınabildi. → **KISMEN**.
- Play `reviews.list` referansı raporda doğru URL ile verilmiş; bu turda açılmadı. → **KISMEN**.
- **~500 review limiti** yalnız `app-reviews` PyPI paketinin dokümantasyonuna dayanıyor; Apple'ın birincil dokümanında böyle bir sayı bulunamadı. → **KAYNAK BULUNAMADI**.

**Önemli:** Bu üçü raporun *en az* riskli iddiaları. Own-app kısıtı doğruysa, üçüncü taraf review madenciliği zaten resmî yoldan kapalı — raporun "kapalı" sonucu ayakta. Sayısal limit hatalı olsa bile karar değişmez.

---

## 7. AB / UK / ABD: istisna var, ama dar

### 7.1 DSM Art. 4 (DOĞRULANDI — kapsamı dar)

> "This (mandatory) exception or limitation allows any user to reproduce works and other protected subject matter, as well as to extract the contents of databases, in order to perform text and data mining for any purposes. Only those materials that are lawfully accessible and for which rights holders have not expressly prevented mining to be undertaken can be mined under this provision. Copies created in the course of text and data mining may be retained only for as long as they are necessary for the purposes."
> — <https://www.copyrightexceptions.eu/exceptions/dsm4/>

Dört sınır:
1. **Coğrafi:** AB hukuku; Türkiye'de uygulanmaz.
2. **Hukuka uygun erişim:** ToS'u ihlal ederek elde edilen veri "lawfully accessible" değildir → istisna düşer.
3. **Opt-out:** machine-readable rezerv varsa istisna yok.
4. **Kapsam:** çoğaltma/çıkarma. **Çıktının umuma iletilmesi** istisna kapsamında değil.

**Reddit/ekşi'ye uygulanabilir mi?** Reddit AB'de opt-out'a benzer bir mekanizma yayımlamıyor (robots.txt'te AI bloğu var mı, bu turda kontrol edilmedi — **Gap**). ekşi'de `ai-train=no` var → AB'de bile istisna kapanır. Türkiye'de zaten istisna yok.

### 7.2 Content-Signal'ın statüsü (KISMEN)

- Cloudflare Eylül 2025'te yayımladı; metin kendini "As a condition of accessing this website, you agree to abide by the following content signals" olarak konumluyor ve "ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS RESERVATIONS OF RIGHTS UNDER ARTICLE 4..." diyor.
- IPTC: "While it has not been ratified by a standards body, it is a simple and effective proposal" — <https://iptc.org/std/guidelines/data-mining-opt-out/IPTC-Generative-AI-Opt-Out-Best-Practices.pdf>
- Cloudflare kendi de diyor: "robots.txt compliance is voluntary."
- **Yani:** sözleşmesel iddia + AB hukukunda opt-out beyanı. ABD'de browsewrap olarak bağlayıcılığı **test edilmedi**; Türkiye'de dayanağı **yok** (Art. 4 yok).

### 7.3 hiQ v. LinkedIn (DOĞRULANDI — en öğretici vaka)

- 9th Cir., 18 Nisan 2022: public scraping **CFAA "without authorization" sayılmaz**; ön ihtiyat kararı onandı. <https://cdn.ca9.uscourts.gov/datastore/opinions/2022/04/18/17-16783.pdf>
- Ama Kasım 2022'de district court: LinkedIn User Agreement "unambiguously and enforceably prohibits unauthorized scraping"; trespass to chattels ve misappropriation da kabul.
- Aralık 2022 consent judgment: **500.000 $**, kalıcı yasak, tüm veri/kod silme; yasak "using the LinkedIn platform to develop a commercial service without the express written permission of LinkedIn" ifadesini içeriyor.
- Kaynak: <https://infobytes.orrick.com/wp-content/uploads/pdf/Buckley%20InfoBytes%20-%20hiQ%20Labs%2C%20Inc.%20v.%20LinkedIn%20Corp.%20-%20Stipulation%20and%20%5BProposed%5D%20Consent%20Judgment%20and%20Permanent%20Injunction%202022.12.06.pdf>

**Ders:** CFAA/robots.txt ekseni scraping lehine; **sözleşme + trespass** ekseni platform lehine. Rapor "robots.txt uyumu"na güveniyorsa yanlış eksene bakıyor. gerçek risk sözleşmede.

**Ayrıca:** consent judgment bir mahkeme hükmü değil, tarafların anlaşması; emsal teşkil etmez. Ama pratikte platformların oynadığı oyunu gösteriyor: önce ihtarname, sonra dava, sonra veri silme.

---

## 8. Hacker News

### 8.1 "No rate limit" (DOĞRULANDI)

> "There is currently no rate limit."
> — <https://github.com/HackerNews/API>

`maxitem.json` walk-back yöntemi de README'de tarif ediliyor ("You can walk backward from here to discover all items").

### 8.2 Ticari kullanım şartları (KAYNAK BULUNAMADI)

- HN API repo'su **MIT lisanslı** — ama bu lisans doküman/örnek kodu kapsar, **veriyi** kapsamaz.
- HN içeriğinin telifi yazarlarda; YC'nin veri için verdiği açık bir ticari lisans bulunamadı.
- `api@ycombinator.com` iletişim adresi var; "bugs" için. Ticari kullanım izni metni yok.

### 8.3 Algolia HN Search (KAYNAK BULUNAMADI)

- `hn.algolia.com/api` dokümanı yalnız teknik parametreleri listeliyor; ToS yok.
- Algolia'nın genel ToS'u **abonelik hizmetini** düzenliyor; public HN endpoint'i için ayrı bir yayımlanmış şart bulunamadı. (Free Services maddesi: "MAY BE SUSPENDED, TERMINATED, MODIFIED, OR DISCONTINUED... AT ANY TIME" — uygulanıp uygulanmayacağı belirsiz.)
- Kaynak: <https://www.algolia.com/policies/terms>; <https://hn.algolia.com/api>

**Değerlendirme:** HN, lisans zinciri en zayıf ama uygulama riski en düşük kaynak. "Resmî API" olması ticari kullanım izni anlamına gelmiyor.

---

## 9. Dayanıklılık: raporun atladığı tek noktalar

### 9.1 Reddit public API Mart 2027'de kapanıyor (EN KRİTİK)

Reddit, r/redditdev'de 30 Eylül 2026:

> "Starting January 12, 2027, we'll begin removing API access for apps and users that haven't registered or engaged with us. Remaining public API access will end in March 2027."
> — <https://www.reddit.com/r/redditdev/comments/1wubcvf/moving_data_api_apps_to_the_developer_platform/>

Ek tarihler: 31 Ekim 2026 yeni erişim başvuruları kapanıyor; 13 Kasım 2026 RSS bitiyor; 12 Ocak 2027 kayıtsız uygulamalar kesiliyor.

**Neden önemli:** Arctic Shift'in incremental API'si Reddit'in public API'sinden besleniyor. Reddit kapanınca:
- Arctic Shift'in **canlı ingest'i** durur veya lisanslı bir yola geçmek zorunda.
- Dump zinciri de yeni veri üretemez → arşiv **donar**.
- Raporun "2005'ten bugüne tam kapsama" iddiası Mart 2027'de "2005 → Mart 2027" olur.

Bu, raporun "arşiv + çok kaynak = tek gerçek savunma" sonucunu **çürütmüyor**, ama "arşiv yolu hayatta" ifadesini **zaman sınırlı** hale getiriyor. Rapor bunu yazmıyor.

### 9.2 Arctic Shift: tek maintainer, SLA yok

- API dokümanı: "**No uptime or performance guarantees :)**" — <https://github.com/ArthurHeitmann/arctic_shift/tree/master/api>
- "Rate limits can change at any time."
- "Remember, this is a free service, so be considerate."
- GitHub katkı dağılımı: ArthurHeitmann 70, stas00 6, HenryBlackie 1 → **fiilen tek kişi**.
- Status sayfası var ama SLA/taahhüt yok: <https://status.arctic-shift.photon-reddit.com/>

### 9.3 Gerçekleşmiş kesintiler

- **9-10 Ekim 2026:** Arctic Shift down. Maintainer (GitHub, 10 Ekim): "It's back now. Was a temporary issue." Topluluk (r/redditdev) bunu "son" sandı.
- **28 Eylül 2026:** Kesinti bir üçüncü taraf ürünün Reddit kontrollerini tamamen düşürdü; fallback arşiv eklendi. <https://subnetradar.com/subnet-news/13/2026-09-28>
- **Eylül 2026 comment ID değişimi:** Reddit yeni comment ID'lerinin artık monoton artmadığını duyurdu. Maintainer (issue 53): "I have ways to work around this change. It is not as fast or efficient as simple commnet id scans, but it works"; tamlık "90%+ complete, ideally 95%".
- Kaynak (derleme, ikincil ama tarihli): <https://chatterapi.com/blog/pushshift-vs-pullpush-vs-arctic-shift> (14 Eki 2026)

### 9.4 Dump zinciri ve "tam kapsama"

- Aylık dump'lar Academic Torrents'ta; Eylül 2026 dump'ı 11 Ekim 2026'da yayımlandı.
- **Birleşik 2005-2025 torrent sayfası üstü çizili**, yerine yalnız magnet link var (chatterapi, 14 Eki 2026). → Raporun "tek torrent 2005-06 → 2025-12, ≈3,8 TB magnet mevcut" iddiası **KISMEN**: magnet var, sayfa bakımda.
- **3,8 TB rakamı** bu turda doğrulanamadı → **Gap**.
- PullPush: "Browser users; scripts got HTTP 429"; dump yok. → Raporun "Pullpush (2005 → Mayıs 2025) + Arctic Shift = tam kapsama" denklemi **kırılgan**.

### 9.5 Yedeklilik

- Raporda yedek arşiv, snapshot, checksum, SLA, çoğaltma planı **yok**.
- Tek gerçek yedek: kendi çektiğiniz dump'ların yerel kopyası. Bu, "arşiv" ile "arşivin kaynağı" arasındaki farkı karıştırıyor: dump indirildiyse geçmiş korunur; indirilmediyse kaynak kapanınca veri de gider.

---

## 10. "Metin ne diyor / mahkeme ne dedi / ne test edilmedi"

| Konu | Metin ne diyor | Mahkeme ne dedi | Test edilmemiş |
|---|---|---|---|
| Reddit UA ticari yasak | "commercially exploit... prohibited"; yazılı izin olmadan scraping yasak | Anthropic: UA browsewrap olarak bağlayıcı; sözleşme iddiaları ayakta (Eyl 2026) | Dump kullanan, Reddit'e hiç erişmemiş üçüncü taraf |
| Reddit Public Content Policy | Ticari kullanım için "talk to us" | — | Politikanın sözleşmesel bağlayıcılığı |
| SE CC BY-SA | BY + SA; dump lisanslı | — | Hangi çıktı "Adapted Material"; DB'nin tamamı SA mı |
| ekşi robots.txt | `Allow: /`, `ai-train=no` | — | robots.txt'in sözleşme/izin etkisi (TR'de emsal yok) |
| ekşi telif | Telif yazarda; üçüncü tarafa lisans yok | — | Ticari madenciliğin FSEK m.35 kapsamına girip girmediği |
| Trustpilot ToS | Text/data mining yasak | GlobalGuru: ihtarname haklı; üçüncü taraf widget yetkisiz | ToS'un data mining'e uygulanması; zarar miktarı |
| Content-Signal | "condition of accessing"; Art. 4 rezervi | — | ABD/TR'de bağlayıcılık |
| hiQ | UA scraping'i yasaklar | CFAA'da scraping lehine; sözleşmede aleyhine; 500K $ + injunction | Consent judgment emsal değil; "gates up/down" ölçütü belirsiz |
| HN API | "no rate limit" | — | Ticari kullanım lisansı yok |

---

## 11. Risk matrisi (kaynak × hukuki dayanak × pratik arıza modu)

| Kaynak | Hukuki dayanak | İhlal iddiasının en güçlü olduğu eksen | Pratik arıza modu | Raporun atfı |
|---|---|---|---|---|
| **Reddit (dump)** | Reddit UA §"collect data"/"commercially exploit"; Public Content Policy; Data API Terms | Sözleşme (privity tartışmalı) + silme taleplerine uymama | API Mart 2027 kapanışı → ingest durur; dump donar; Reddit lisans görüşmesi zorunlu | "Arşiv yolu hayatta" — **fazla iyimser** |
| **Reddit (Arctic Shift API)** | Aynı + projenin lisanssız olması | Doğrudan erişim yok; ama ToS zinciri hâlâ iddia edilebilir | Tek maintainer; 9-10 Eki 2026 kesintisi; ID değişimiyle %90-95 tamlık; rate limit değişebilir | "incremental API çalışıyor" — **doğru ama süreli** |
| **Pullpush** | Belirsiz; Pushshift halefi | Pushshift emsali (Reddit kesti) | Script'lere 429; dump yok; güvenilmez | "tam kapsama" ortağı — **kırılgan** |
| **Stack Exchange** | CC BY-SA 4.0 (dump); ToS dump dışı ticari indirmeyi yasaklar | SA ayağı: uyarlamanın lisanslanması | Dump erişimi login/atıf anlaşmasına bağlı; format değişebilir | "atıf zinciri yeter" — **eksik** |
| **ekşi sözlük** | FSEK m.21/22 (izin gerekir); m.35 dar; KVKK; robots.txt lisans değil | Telif (yazarlar) + KVKK (nick+içerik) | AI bot blokları; teknik erişim zorlaşabilir; silme talebi akışı yok | "robots.txt uyumlu" — **yanlış güvence** |
| **Trustpilot** | Consumer ToS + Business Guidelines (açık yasak) | Sözleşme + marka | İhtarname → içerik kaldırma (SellCell'de gerçekleşti); hesap kapatma | "kapalı" — **doğru**, gerekçe düzeltilmeli |
| **Apple (own-app)** | App Store Connect şartları | Sözleşme | Üçüncü taraf review'a resmî yol yok | "kapalı" — **doğru** |
| **Google Play (own-app)** | Developer API şartları | Sözleşme | `reviews.list` yalnız kendi app; 7 gün | "kapalı" — **doğru** |
| **Hacker News** | Lisans yok (repo MIT ≠ veri lisansı) | Telif (yazarlar) + platform kuralı | API değişebilir; "no rate limit" garantisi değil | "no rate limit" — **doğru, izin değil** |
| **Algolia HN** | Yayımlanmış ToS yok | Belirsiz | Public endpoint kapanabilir | "canlı teyitli" — **doğru, hukuki değil** |

---

## 12. Rapora yönelik en sert üç itiraz

1. **"Arşiv yolu hayatta" cümlesi, hukuki bir sonuç değil teknik bir gözlem.** Reddit'in kendi metni ticari kullanımı lisans rejimine bağlıyor; Arctic Shift'in lisansı yok; dump'ın hukuki statüsü test edilmedi. Rapor, "erişilebilir" ile "kullanılabilir" arasındaki farkı kapatmıyor.

2. **"Atıf zinciri CC BY-SA uyumunu tamamlar" cümlesi hukuken yanlış.** Atıf BY'yi karşılar; SA, uyarlamanın aynı lisansla paylaşılmasını gerektirir. StartupHunt'ın çıktısı (özet, küme etiketi, çeviri) muhtemelen uyarlamadır. Bu, ürünün lisans mimarisini etkiler — sadece "kaynak göster" meselesi değil.

3. **"Yaptırım riski teorik değil" doğru, ama gösterilen dava yanlış.** `1:26-cv-04478` Trustpilot'un açtığı bir dava değil; Trustpilot'a karşı açılan ve Trustpilot'un kazandığı bir ihtarname uyuşmazlığı. Doğru emsal daha güçlü: Trustpilot ihtarname gönderdi, içerik kaldırıldı, mahkeme ihtarnameyi haklı buldu. Yanlış caption, doğru sonucu zayıflatıyor.

---

## 13. Gaps (bu turda kapanmayanlar)

1. **Arctic Shift 3,8 TB / 2005-06 → 2025-12 tek torrent** rakamı doğrulanamadı; birleşik torrent sayfası üstü çizili, yalnız magnet var.
2. **Apple ~500 review limiti** birincil kaynaktan doğrulanamadı (yalnız PyPI).
3. **Google Play 7 günlük pencere** birincil dokümandan doğrulanamadı.
4. **SE dump 2024 taşınması** Meta.SE duyurusundan bağımsız doğrulanamadı.
5. **CC FAQ "SA içeren veritabanının tamamı SA mı?"** maddesi okunamadı (sayfa kesildi) — raporun en kritik hukuki sorusu.
6. **Reddit robots.txt'inde AI opt-out var mı** kontrol edilmedi; DSM Art. 4 analizi buna bağlı.
7. **ekşi'ye karşı açılmış dava/ihtarname** kaydı bulunamadı (yokluğu kanıt değil).
8. **Türkiye'de TDM/veri madenciliği emsali** (Yargıtay/BAM kararı) bulunamadı; FSEK yorumu doktrinde.
9. **Reddit lisans ücreti/şartları** kamuya açık değil; "lisans alınabilir" varsayımı doğrulanamadı.

---

## 14. Kullanılan birincil kaynaklar (özet)

- Reddit User Agreement (1 Tem 2026) — <https://www.redditinc.com/policies/user-agreement>
- Reddit Data API Terms — <https://redditinc.com/policies/data-api-terms>
- Reddit Public Content Policy (6 Eki 2026) — <https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy>
- Reddit r/redditdev API kapanış takvimi (30 Eyl 2026) — <https://www.reddit.com/r/redditdev/comments/1wubcvf/moving_data_api_apps_to_the_developer_platform/>
- Reddit r/modnews Pushshift kesintisi (1 May 2023) — <https://www.reddit.com/r/modnews/comments/134tjpe/reddit_data_api_update_changes_to_pushshift_access/>
- CourtListener: Reddit v. Anthropic `3:25-cv-05643` — <https://www.courtlistener.com/docket/70704683/reddit-inc-v-anthropic-pbc/>
- CourtListener: Reddit v. SerpApi `1:25-cv-08736` — <https://www.courtlistener.com/docket/71720563/reddit-inc-v-serpapi-llc/>
- Arctic Shift repo + API dokümanı — <https://github.com/ArthurHeitmann/arctic_shift> · <https://github.com/ArthurHeitmann/arctic_shift/tree/master/api>
- Arctic Shift status — <https://status.arctic-shift.photon-reddit.com/>
- Stack Exchange licensing — <https://meta.stackexchange.com/help/licensing>
- Stack Overflow Public Network ToS (13 Kas 2025) — <https://stackoverflow.com/legal/terms-of-service/public>
- CC FAQ — <https://creativecommons.org/faq/>
- ekşi robots.txt — <https://eksisozluk.com/robots.txt>
- ekşi Kullanıcı Sözleşmesi — <https://eksisozluk.com/eksi-sozluk-kullanici-sozlesmesi--2602660>
- ekşi Gizlilik Politikası — <https://eksisozluk.com/legal/privacypolicy>
- Dalkıran, FSEK/TDM — <https://dergipark.org.tr/tr/download/article-file/5626014>
- Trustpilot Consumer ToS (Şub 2025 / Eki 2026) — <https://corporate.trustpilot.com/legal/for-reviewers/terms-of-use-for-consumers/feb-2025>
- Trustpilot Business Guidelines — <https://legal.trustpilot.com/for-reviewers/guidelines-for-businesses>
- GlobalGuru v. Trustpilot, ECF 34 (23 Tem 2026) — <https://app.midpage.ai/document/globalguru-tech-llc-v-trustpilot--b5011e65-01ce-4c05-958f-ed1d1c43da7b>
- Cloudflare robots.txt docs — <https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/>
- Content Signals — <https://contentsignals.org/>
- DSM Art. 4 — <https://www.copyrightexceptions.eu/exceptions/dsm4/>
- hiQ 9th Cir. 2022 — <https://cdn.ca9.uscourts.gov/datastore/opinions/2022/04/18/17-16783.pdf>
- hiQ consent judgment — <https://infobytes.orrick.com/wp-content/uploads/pdf/Buckley%20InfoBytes%20-%20hiQ%20Labs%2C%20Inc.%20v.%20LinkedIn%20Corp.%20-%20Stipulation%20and%20%5BProposed%5D%20Consent%20Judgment%20and%20Permanent%20Injunction%202022.12.06.pdf>
- HN API — <https://github.com/HackerNews/API>
- Algolia ToS — <https://www.algolia.com/policies/terms>
