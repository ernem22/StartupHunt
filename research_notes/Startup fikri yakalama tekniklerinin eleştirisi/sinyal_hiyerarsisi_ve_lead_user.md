# Sinyal hiyerarşisi ve lead-user kanıt tabanı — şeytanın avukatı denetimi

Denetlenen rapor: `reports/Startup fikri yakalama teknikleri.md`
Erişim tarihi (tüm URL'ler): **21.10.2026**
Yöntem: her iddia için önce raporun cümlesi birebir alındı, sonra birincil kaynak (jenerik sayfa / DOI / yazar PDF'i) arandı. Kaynak bulunamadığında uydurulmadı; "Gaps" bölümüne yazıldı.

---

## HÜKÜM TABLOSU

| # | İddia (kısaltılmış) | Hüküm | Tek cümlelik gerekçe |
|---|---|---|---|
| 1 | "ölçü birimi söylenen değil, yapılmışıdır"; "I wish..." ≈ sıfır sinyal | **KISMEN** (heuristic olarak makul, ampirik iddia olarak **YANLIŞ**) | Niyet–davranış korelasyonu r≈0,53 (422 çalışma); "sıfır" iddiasını destekleyen tek bir çalışma yok; tersine, beyan edilen ihtiyaçlardan VOC çıkarımı interview VOC ile eşdeğer sonuç veriyor. |
| 2 | Commitment ladder (waitlist → LOI/peşinat) | **KISMEN** | İlkenin çekirdeği (time/reputation/money) Fitzpatrick'in kitabında var; ama raporun 4 kademeli merdiveni ve dönüşüm oranları **hiçbir hakemli kaynakta doğrulanmadı**; atıf yapılan GitHub dosyası otomatik üretilmiş bir AI-skill dosyası. |
| 3 | Workaround = en güçlü sinyal / "harcanan paranın en ucuz vekili" | **KISMEN → fazla iddialı** | Workaround "sorun birine gerçekten maliyet yüklüyor"u kanıtlar; "ödemeye razı"yı kanıtlamaz. Kullanıcı inovasyonlarının yalnızca ~%1–2'si ticarileşiyor/benimseniyor. |
| 4 | von Hippel 1986: "ticari yeniliklerin %82'si kullanıcı firmalarca" | **YANLIŞ** | %82, 1986 makalesinde **hiç geçmiyor**; 1976 çalışmasında ise "major improvement" kategorisinin (36/44) oranı; bilimsel enstrümanlarla ve 111 yenilikle sınırlı. |
| 5 | Urban & von Hippel 1988: "twice the price (p < 0.01)" | **DOĞRULANDI** (ölçüm beyan, satın alma değil) | Cümle kaynakta birebir var; t>4,4, p<%1. Ama ölçülen şey *stated preference / probability of purchase*; gerçek satın alma değil. Örneklem sayısı kaynaklar arasında 136/138/173 olarak çelişiyor. |
| 6 | 3M: "tarihi ortalama ile benzer sayıda major product line" | **YANLIŞ** | Gerçek sonuç 5/5 LU projesi vs 1/42 LU-dışı; tahmini 5. yıl satışı 146M$ vs 18M$ (**8×**). "Benzer" olan şey ürün hattı *sayısı* değil, hatların *profili*. |
| 7 | Sales Safari: 30–50 saat + "easier/faster/less..." | **DOĞRULANDI (betimleme); ampirik destek YOK** | İfadeler kaynakta birebir var; kaynak bir kitap alıntısı, hakemli değil; yöntemin etkinliğine dair kontrollü çalışma yok. |
| 8 | The Mom Test = "doğrulama literatürünün temel referansı" | **YANLIŞ** | Kendi yayımladığı pratik kitap (2013, Robfitz Ltd, 123 s.); hakemli değil; Mom-Test tarzı görüşmelerin sonucu iyileştirdiğine dair kontrollü kanıt yok. |

**Kaynak katmanı özeti:** Sinyal hiyerarşisini kuran paragraflardaki (rapor §1–§2) ~13 atfın **~10'u katman 5–6** (practitioner blog / SEO / anonim forum / AI-skill dosyası). Hiyerarşinin operasyonel üç testi (workaround / recurrence / sayı) **tek bir WhittleOS sayfasına**, commitment merdiveni **tek bir GitHub SKILL.md dosyasına** dayanıyor. Rapordaki "bağımsız doğrulama" görüntüsü büyük ölçüde tek yazarın (Boris Binyaminov) iki metnine dayanıyor.

---

## 1. "Söylenen değil, yapılmış" ve "I wish ≈ sıfır sinyal"

### Raporun cümlesi
> "**topluluk metninde startup fikri sinyalinin ölçü birimi söylenen değil, yapılmışıdır** … 'I wish...' tarzı duygusal istek cümleleri ise neredeyse sıfır sinyal"

### Takeaway
İkinci yarı ampirik bir iddia gibi yazılmış ama ampirik değil: hiçbir kaynak "I wish" cümlelerinin öngörü değerini ölçmüyor. Literatür "beyan şişirir ama sıfır değildir" diyor. "Sıfır" ifadesi korunamaz; "indirim uygulanması gereken gürültülü bir sinyal" savunulabilir.

### Cited Findings
- Niyet–davranış ilişkisi **büyük** ve pozitif: Sheeran (2002), 10 meta-analizin meta-analizi, **422 çalışma**, örneklem-ağırlıklı ortalama **r+ = 0,53**; niyetler davranıştaki varyansın **%28**'ini açıklıyor — [Sheeran 2002, DOI](https://doi.org/10.1080/14792772143000003); bağımsız özet: [The Intention–Behavior Gap (UNC)](https://cdr.lib.unc.edu/downloads/9w032f333?locale=en)
- Aynı kaynak: niyet edenlerin **%54'ü** harekete geçmiyor; ama niyet etmeyenlerin yalnızca **%3'ü** geçiyor. Yani "hiç niyet yok" ile "niyet var, icraat yok" aynı şey değil — [PMC 9386038](https://pmc.ncbi.nlm.nih.gov/articles/PMC9386038/)
- Deneysel kanıt da sıfır değil: niyette orta-büyük değişim (d=0,66) davranışta küçük-orta değişim (d=0,36) üretiyor — [Webb & Sheeran 2006, PubMed](https://pubmed.ncbi.nlm.nih.gov/16536643)
- Satın alma niyeti satışı öngörüyor, ama ürün tipine göre zayıflıyor: **yeni ürünlerde mevcut ürünlerden daha zayıf**, uzun ufukta daha zayıf — [Morwitz, Steckel & Gupta 2007, DOI](https://doi.org/10.1016/j.ijforecast.2007.05.015)
- Beyan edilen WTP sistematik olarak **şişiyor**, ama yok olmuyor: 28 çalışma / 83 gözlem, hipotetik/gerçek WTP medyan oranı **1,35** (yaygın inanışın aksine 2–3× değil) — [Murphy et al. 2005, DOI](https://doi.org/10.1007/s10640-004-3332-z)
- Conjoint (beyan temelli tercih ölçümü) tahmin geçerliliği olan bir yöntem: 34 makale / 134 etki büyüklüğü / N=12.980; sadece teşvik hizalaması bile isabet oranını **%12** artırıyor — [Schramm 2025, Marketing Letters](https://doi.org/10.1007/s11002-025-09764-8)
- Rapordaki karşı kanıtın kendisi: UGC'den çıkarılan VOC, görüşme VOC'u ile **eşdeğer** sonuç üretiyor (Timoshenko & Hauser 2019) — yani "söylenen" metin, doğru işlendiğinde değerli. Rapor bunu §3'te kabul ediyor, §1'de "sıfır" diyor: **kendi içinde çelişki**.

### Inferences
- Doğru formülasyon: *Beyan, davranışın gürültülü ve yukarı yanlı bir vekilidir; sıfır değerli değildir.* "Neredeyse sıfır" ifadesi, ölçülmüş r=0,53 ile bağdaşmıyor.
- "I wish" özelinde elimizde hiçbir ölçüm yok. Bu bir **practitioner heuristic**'tir (Fitzpatrick'in "compliments/fluff" ayrımına dayanır), ampirik bulgu değil.
- Rapordaki "yapılmışı" vurgusu yine de savunulabilir: davranışsal kanıt (harcama, kurulum, geçmiş eylem) beyandan daha güçlü bir vekildir. Sorun kanıtın yokluğu değil, **abartılı ölçüsü**.

### Gaps
- "I wish..." ifadesini içeren topluluk postlarının sonraki ürün benimsemesiyle ilişkisini ölçen tek bir çalışma bulunamadı. Bu iddia literatürde **boşluk**; rapor bunu keşif olarak sunmalıydı, yasa olarak değil.
- Kano modelinin ampirik geçerliliği bu turda ayrıca doğrulanmadı (kapsam dışı bırakıldı).

---

## 2. Commitment ladder ve dönüşüm oranları

### Raporun cümlesi
> "Fitzpatrick'in commitment ladder'ı sinyalleri tanımlı katmanlara ayırır: zayıf (takvim zamanı, waitlist) → orta (tanıştırmalar, fiyat sorusu) → güçlü (LOI, peşinat, gerçek iş yapmayı kabul) → en güçlü ('şimdi para vermeye çalışıyorlar')"

### Takeaway
Merdivenin **fikri** kitapta var; **kademeleri** kitapta yok. Rapor, bir AI-skill dosyasının ürettiği 4 kademeli listeyi Fitzpatrick'e atfediyor. Merdivenin sıralamasını veya kademeler arası dönüşüm oranlarını doğrulayan hakemli çalışma yok.

### Cited Findings
- Kitabın kendi formülasyonu bir *gradyan*, 4 kademeli taksonomi değil: "The more time (or reputation, risk and cash) interviewees are giving up, the more seriously you can take their kind words." — kitap alıntısı, [Goodreads](https://www.goodreads.com/author/quotes/19494457.Rob_Fitzpatrick); ayrıca [SuperSummary](https://www.supersummary.com/the-mom-test/summary)
- Kitapta "commitment" üç para birimidir: **time, reputation, money** — [hellopm özeti](https://hellopm.co/book-summary-the-mom-test-by-rob-fitzpatrick)
- Raporun atfettiği GitHub dosyası **var ve iddia edilen merdiveni birebir içeriyor**: "Commitment Escalation Ladder / WEAK … MEDIUM … STRONG … STRONGEST" — [SKILL.md](https://github.com/guia-matthieu/clawfu-skills/blob/main/skills/validation/mom-test/SKILL.md)
- Ama aynı dosya bir **AI-agent skill tanımı**: "What Claude Does vs What You Decide", `author: ClawFu`, `created: 2026-01-25`, `estimated_value: $1,500`. Üstelik şablon hatası taşıyor: "What This Skill Does Well — Structuring **audio production** workflows". Yani metin, Mom Test'in değil bir prompt şablonunun ürünü.
- Waitlist → ücretli dönüşüm için **hakemli tek bir oran bulunamadı**. Bulunanlar: Lenny Rachitsky anketine atıfla **%5–25**, 1 ay içinde erişimde ~%20, 3 aydan uzun beklemede <%10 — [Waitlister](https://waitlister.me/growth-hub/guides/saas-product-launch-waitlist); [acquisition-saas](https://www.acquisition-saas.com/en/resources/saas-waitlist). Hepsi katman 5–6.
- Aynı kaynaklarda rakamlar tutarsız: "5% normaldir", "8–12% iyi", "~20%", "6+ ay eski kayıtlarda %0" (Rows.com anekdotu). Bu tutarsızlık, standardın olmadığını gösteriyor.
- Deneme→ücretli için de yalnızca practitioner benchmark var: kartsız deneme %8–12, kartlı deneme %20–40 — [Omniconvert](https://www.omniconvert.com/blog/cro-for-saas/)

### Inferences
- Merdiven **yön olarak** makul (bedeli artan taahhüt daha bilgilendirici), ama **eşik/oran olarak** doğrulanmamış. "LOI → ödeme" dönüşümünü ölçen bir çalışma bulunamadı; LOI'nin hukuken bağlayıcı olmaması bu boşluğu büyütüyor.
- Raporun cümlesi iki ayrı hata içeriyor: (a) atıf yanlış kişiye (Fitzpatrick yerine skill dosyası), (b) merdiven "ampirik olarak test edilmiş" gibi sunuluyor.
- Doğru kullanım: merdiven bir **görüşme planlama aracı** olarak kullanılabilir; "waitlist zayıftır" bir ölçüm değil, bir tasarım tercihidir.

### Gaps
- LOI → imzalı sözleşme → ilk ödeme dönüşüm oranları için hakemli/endüstriyel bir benchmark bulunamadı. (B2B SaaS "POC-to-paid" oranları da yalnızca satıcı bloglarında.)
- Peşinatın taahhüdü artırdığına dair davranışsal iktisat literatürü (sunk cost / escalation of commitment) bu turda taranmadı; bu bir *çıkarım*, ölçüm değil.

---

## 3. Workaround = en güçlü sinyal mi?

### Raporun cümlesi
> "**bir workaround'un isimlendirilmesi** ('a spreadsheet, a script or a manual process... the cheapest available proxy for spending money')"

### Takeaway
Alıntı gerçek. Ama "harcanan emek → ödeme isteği" sıçraması kanıtsız. Kullanıcı inovasyonlarının ticarileşme taban oranı **%1–2**; yani workaround'ların ezici çoğunluğu ürüne dönüşmüyor. Workaround, *sorunun gerçek olduğunun* kanıtı; *pazarın olduğunun* değil.

### Cited Findings
- Alıntı birebir doğrulandı: "It names a workaround. Somebody already built a spreadsheet, a script or a manual process. That is a person who has spent effort, which is the cheapest available proxy for spending money." — [WhittleOS](https://whittleos.com/guides/startup-ideas-from-reddit)
- Aynı sayfa, iddianın sınırını kendi koyuyor: "A loud thread is not demand"; "Threads are a complaint sample, not a market sample"; "Complaining is free; paying is not… only an ask can [close that distance]."
- Aynı sayfanın yazarı Reddit'i **kaynak olarak kullanmıyor**: "Reddit is not among them, and we do not source it." Yani rapor, Reddit madenciliği için, Reddit madenciliği yapmayan bir rehberi otorite gösteriyor.
- Kullanıcı inovasyonlarının ticarileşmesi (taban oran): Birleşik Krallık temsili örnekleminde kullanıcı inovasyonlarının **~%2'si** başka kullanıcılarca benimsenmiş veya üreticilerce ticari olarak üretilmiş — [NESTA 2010](https://media.nesta.org.uk/documents/measuring_user_innovation_in_the_uk.pdf)
- ABD örnekleminde: inovasyon sahiplerinin **%1'i** ticarileştirmiş veya ticarileştirmeyi planlıyor; yeni iş kurmayı planlayan **yok** — [NCSES/NSF](https://ncses.nsf.gov/pubs/ncses22201/table/5)
- Hanehalkı inovatörlerinin yalnızca **%4'ü** ticari saikle hareket ediyor; yayılım çabası genelde <%30 (free revealing), diğer yollar <%10 — [von Hippel, de Jong & Rademaker (UAE), s.18](https://evhippel.mit.edu/wp-content/uploads/2019/01/uae-final-report-as-pub-copy.pdf); [de Jong & von Hippel 2023 üzerinden OUP 2025](https://academic.oup.com/spp/article/52/4/613/8078658)
- İnovasyonun üçüncü tarafça ticarileştirildiğine **inanma** oranı %23 — ama bu bir algı, gerçekleşmiş ticarileşme değil — [NBER w25259](https://www.nber.org/system/files/working_papers/w25259/w25259.pdf)
- von Hippel'in kendi uyarısı: kullanıcı, **kendi** faydası için yenilik yapar ve "typically does not consider whether other users have similar needs" — [Sources of Innovation](https://www.mit.edu/evhippel/www-old/books/sources/SofI.pdf)

### Inferences
- Workaround "sorunun maliyeti"ni gösterir; "o maliyeti size ödeme"yi göstermez. İkisi arasındaki boşluk tam olarak raporun kendi alıntıladığı "complaining is free; paying is not" cümlesidir.
- Taban oranı %1–2 olan bir olayı "en güçlü sinyal" ilan etmek, Bayes açısından sorunlu: workaround gözlemi likelihood ratio'yu yükseltir ama posterior'u tek başına yükseğe taşımaz.
- Daha savunulabilir iddia: *Workaround, sorunun gerçekliği için güçlü; ödeme isteği için zayıf-orta bir sinyaldir.*

### Gaps
- "Workaround gözleyen girişimlerin ürün çıkarma/ödeme alma oranı"nı ölçen doğrudan bir çalışma yok. Bu, raporun "literatür boşluğu" dediği şeyin bir örneği; ama boşluk, iddiayı **desteklemiyor**.

---

## 4. von Hippel 1986 ve %82 istatistiği

### Raporun cümlesi
> "von Hippel'in Management Science 1986 çalışması, bilimsel enstrüman alanındaki ticari yeniliklerin **%82'sini** kullanıcı firmaların geliştirdiğini gösterir"

### Takeaway
Üç ayrı hata: (a) %82 **1986 makalesinde geçmiyor**, (b) doğru kaynak 1976 *Research Policy* makalesi, (c) oran "ticari yeniliklerin tamamı" değil, bilimsel enstrümanlardaki **"major improvement"** alt kümesi. Ayrıca %82 evrensel bir oran değil; aynı yazarın 1994 çalışması ticari önemi yüksek yeniliklerde üreticilerin baskın olduğunu gösteriyor.

### Cited Findings
- 1986 makalesinin tam metninde "82" dizisi **yok**; metin yalnızca "users have developed most of the commercially successful product innovations" der ve Tablo 2'ye atıf yapar (tablo PDF'te görsel olarak eksik) — [von Hippel 1986 PDF](https://evhippel.mit.edu/wp-content/uploads/2013/08/lead-users-paper-1986.pdf) (yerel metin çıkarımı, 18 s.)
- %82'nin doğru kaynağı 1976: 1988 makalesi bunu açıkça 1976/1977'ye atfeder: "users were found to be the actual developers of **82% of all commercialized scientific instruments studied** and 63% of all semiconductor… (von Hippel, 1976, 1977)" — [Urban & von Hippel 1988 PDF, s.1](https://web.mit.edu/evhippel/OldFiles/www/papers/Lead%20Users%20Eric%20von%20Hippel%20and%20Glen%20Urban%20-%201988.pdf)
- 1976 örneklemi: **111 bilimsel enstrüman yeniliği**, dört sınıf — gas chromatograph, NMR spectrometer, UV absorption spectrophotometer, transmission electron microscope; ABD — [Research Policy abstract](https://www.sciencedirect.com/science/article/pii/0048733376900287); sınıf listesi: [Bristol University Press, Observing Dark Innovation](https://bristoluniversitypressdigital.com/monochap-oa/book/9781529231212/ch002.xml)
- 1976 makalesinin kendi özeti "%82" değil "**approximately 80%**" diyor ve kapsamı daraltıyor: "innovations judged by users to offer them a **significant increment in functional utility**" — [von Hippel yayın listesi / abstract](https://web.mit.edu/evhippel/www-old/papers/evh-01.htm)
- Gerçek tablo (Sources of Innovation, Table 2-3): **major improvement 44** yeniliğin **%82'si** (36/44); **minor improvement 63** yeniliğin %70'i (32/46 bilinen); **toplam 111**, kaynağı bilinen 94 üzerinden **%77** kullanıcı. First-of-type satırında 4 yenilik ve 4'ü de kullanıcı görünüyor (PDF metin çıkarımı bozuk: "10(% 4 0 0 4"; %100 okuması makul ama kesin değil) — [SofI PDF](https://www.mit.edu/evhippel/www-old/books/sources/SofI.pdf)
- Yani %82 = 36/44, "major improvement" hücresi. "Ticari yeniliklerin %82'si" ifadesi bu tablodan çıkmaz.
- Karşı kanıt, aynı literatürden: "innovations with **high scientific importance** tend to be developed by instrument users, while innovations having **high commercial importance** tend to be developed by instrument manufacturers" — [Riggs & von Hippel 1994 abstract](https://web.mit.edu/evhippel/www-old/papers/evh-01.htm)
- Metodolojik eleştiri (hakemli): vaka sonuçlarının dış geçerliliği "doubtful and difficult to establish"; lead-user okulu "overstates their role within the innovation process by underestimating the amount of innovation resources (money, time, risk) other actors spend"; "innovation" kavramı 1389 kez geçmesine rağmen tanımlanmıyor — [Prometheus 2013, "Users as innovators? Exploring the limitations of user-driven innovation"](https://www.scienceopen.com/hosted-document?doi=10.1080%2F08109028.2013.818790)
- Sistematik eleştiri kaynağı: Bogers, Afuah & Bastian (2010), *Journal of Management* — [DOI](https://doi.org/10.1177/0149206309353944)

### Inferences
- Raporun cümlesi **kaynak sadakati açısından yanlış**: 1986 makalesi bu sayıyı içermiyor; 1976 makalesi ise "major improvement" diyor, "tüm ticari yenilikler" demiyor.
- Daha da önemlisi: %82, "kullanıcı = en güvenilir alıcı" sonucunu **desteklemiyor**. Kullanıcı yenilikçi olabilir ama bu, o kullanıcının *sizin ürününüzü satın alacağı* anlamına gelmez; nitekim Riggs & von Hippel ticari önemi yüksek yeniliklerde üreticilerin baskın olduğunu buluyor.
- Raporun "kendi sorununu çözmeye çalışan kullanıcı … en güvenilir alıcıdır" cümlesi, kaynakta olmayan bir sıçrama.

### Gaps
- 1986 makalesinin Tablo 2'si PDF'te görsel olduğu için hangi çalışmaları listelediği doğrulanamadı (muhtemelen 1976/1977/1963 Knight).
- 1976 çalışmasının örneklem seçim prosedürü (nasıl "commercialized" sayıldı, kaç vaka elendi) tam metin olmadan doğrulanamadı; bu, bilinen retrospektif-seçim eleştirisinin merkezinde.

---

## 5. Urban & von Hippel 1988: "twice the price (p < 0.01)"

### Raporun cümlesi
> "lead-user özellikli konsept, normal müşteri konseptlerine karşı 'consistently preferred at even twice the price (p < 0.01)' (Urban & von Hippel 1988)"

### Takeaway
Cümle kaynakta **birebir** var ve p<0,01 doğru. Ama ölçülen şey satın alma değil, **beyan edilen tercih ve beyan edilen satın alma olasılığı**. Ayrıca örneklem büyüklüğü von Hippel'in kendi metinleri arasında çelişiyor.

### Cited Findings
- Birebir: "The preference for the lead user group concept was significantly higher than other alternatives at all price levels (t greater than 4.4 in all paired comparisons; significant at the 1 percent level) and this concept was preferred to the best available concept even when the price was twice as high." — [Urban & von Hippel 1988 PDF, s.13](https://web.mit.edu/evhippel/OldFiles/www/papers/Lead%20Users%20Eric%20von%20Hippel%20and%20Glen%20Urban%20-%201988.pdf)
- Tasarım: PC-CAD (printed circuit board design) alanı; telefonla tarama; "In 1985 we contacted approximately **178** respondents… **136** screening questionnaires were returned (76.4%)" — aynı PDF, s.8
- Konsept testi: dört sistem (kişinin mevcut sistemi, en iyi ticari sistem, lead-user konsepti, "specialized user system"), 17 attribute; **%78,6** ilk tercih; ortalama satın alma olasılığı **%51,7**; fiyat seviyeleri **$100k / $150k / $200k** — aynı PDF, Tablo 2 ve s.12–13
- Ölçümün doğası: "Average **Probability of Purchase**" — yani niyet ölçeği; gerçek sipariş/ödeme takibi yok. Yazarlar da bunu "probability measures" olarak adlandırıyor.
- Örneklem çelişkisi: Democratizing Innovation Ch2 "a sample of **138**" der ve "(p < 0.01)" ifadesini tekrarlar — [DI Ch2](https://web.mit.edu/evhippel/www/books/DI/Chapter2.pdf); Ch10 ise "a sample of **173** target-market users" der — [DI Ch10, s.142](https://web.mit.edu/evhippel/www/books/DI/Chapter10.pdf). Orijinal makale 136 diyor.
- Fiyat duyarlılığı güçlü: lead-user konseptinin satın alma olasılığı $150k'da %51,7; $100k'da %63,0; $200k'da %37,7 — yani "twice the price" tercihi, fiyatın önemsiz olduğu anlamına gelmiyor.

### Inferences
- Raporun alıntısı **dürüst**; sorun alıntıda değil, ondan çıkarılan sonuçta. "Tercih edildi" ≠ "satın alındı".
- 1988 çalışması, lead-user **konseptlerinin** cazibesini gösteren güçlü bir ilk test; ama örneklem tek bir endüstri (PC-CAD), tek bir ülke (ABD), ve beyan temelli.
- Örneklem sayısındaki 136/138/173 tutarsızlığı, ikincil literatürün birincil kaynağı nasıl kaydırdığının iyi bir örneği; rapor hangisini kullandığını belirtmiyor.

### Gaps
- Lead-user konseptini kullanan ürünün gerçek pazar performansı (satış) hiçbir kaynakta raporlanmıyor; dolayısıyla "twice the price" tercihinin gerçek gelire dönüşüp dönüşmediği bilinmiyor.

---

## 6. 3M / Lilien et al. 2002 ve "pyramiding"

### Raporun cümlesi
> "3M'de lead-user (pyramiding) metodu, geleneksel yöntemin tarihi ortalamasıyla **benzer sayıda** major new product line üretmiştir"

### Takeaway
Bu cümle kaynağı **yanlış okuyor**. Kaynağın başlıca sonucu "benzer sayı" değil, **ezici üstünlük**: 5/5 lead-user projesi major yeni ürün hattı üretti; 42 LU-dışı projeden yalnızca 1'i. "Benzer" olan şey, üretilen hatların *sayısı* değil, *profili* (novelty, share, family potential).

### Cited Findings
- Örneklem: 5 bölüm, **7 lead-user projesi**, bunlardan **5'i** fonlanmış; aynı bölümlerde **42** geleneksel "find a need and fill it" projesi — [DI Ch10, s.136–137](https://web.mit.edu/evhippel/www/books/DI/Chapter10.pdf)
- Sonuç: "all **five** of the funded 3M lead user projects created the basis for major new product lines… In contrast, **41 of 42** funded product concepts generated by non-LU methods were improvements or extensions of existing product lines (χ² test, p < 0.005)" — aynı, s.139
- Satış: "projected annual sales in year 5 … by a factor of **8** — an average of **$146 million** versus an average of **$18 million**" (forecast error için %25 deflate edilmiş) — aynı, s.138–139
- Pazar payı: 5. yıl **%68 vs %33** (p=0.01) — aynı, Table 10.1
- "Benzer" iddiasının gerçek kaynağı Table 10.3: LU ürün hatları ile 3M'in **1950–2000 arası geçmiş** major ürün hatları *profil* olarak karşılaştırılıyor: novelty 9,6 vs 8,0 (p=0,21); tahmini satış **$146M vs $62M** (p=0,04); share %68 vs %61 (p=0,76) — aynı, s.141–143
- Metodolojik sınır (yazarın kendi ifadesi): "the firm did not offer a controlled experimental setting"; "naturally occurring differences"; random assignment yok — aynı, s.137
- Tüm satış rakamları **forecast**; 3M'in tarihsel tahmin hatası +%30 ile −%13 arasında, bu yüzden %25 deflate uygulanmış — aynı, s.139

### Inferences
- Raporun cümlesi iki şekilde yanlış: (a) sayı "benzer" değil, 5/5 vs 1/42; (b) "tarihi ortalama" ile karşılaştırma, *sayı* için değil *özellik profili* için yapılmış.
- Doğru cümle: "3M'de LU projeleri 5/5 major ürün hattı üretti; LU-dışı 42 projeden yalnızca 1'i; tahmini 5. yıl satışı 8 katı."
- Yine de abartmamak gerek: bu bir **doğal deney**, RCT değil; sonuçlar **tahmin**, gerçekleşen satış değil; tek firma (3M), tek dönem.

### Gaps
- 3M'in gerçekleşen (forecast değil) satış verileri kamuya açık değil; dolayısıyla 8× farkın ne kadarının gerçekleştiği bilinmiyor.
- Lilien et al. 2002'nin bağımsız replikasyonu bu turda bulunamadı.

---

## 7. Sales Safari: 30–50 saat ve dikkat kelimeleri

### Raporun cümlesi
> "Amy Hoy/Alex Hillman'ın Sales Safari metodu 'watering hole'larda **30–50 saat sistematik gözlem** önerir … dikkat kelimeleri 'easier, faster, less, more, relief, finally'dir"

### Takeaway
Betimleme **doğru** — ifadeler kaynakta birebir var. Ama kaynak hakemli değil, bir kitap alıntısı; yöntemin sonuçları iyileştirdiğine dair kontrollü bir kanıt yok. Ayrıca yöntem, raporun aynı sayfada savunduğu Mom Test görüşmeleriyle **metodolojik olarak çelişiyor**.

### Cited Findings
- Birebir: "Amy and Alex recommend spending as much as **30 to 50 hours** listening for the nouns… keeping an eye out for words like '**easier**', '**faster**', '**less**', '**more**', '**relief**', '**finally**', etc." — [solvingproduct.com/sales-safari](https://solvingproduct.com/sales-safari)
- Kaynak kimliği: yazı, Étienne Garbugli'nin *Solving Product* kitabından alıntı; Hoy/Hillman'ın 30×500 eğitimini anlatıyor — aynı sayfa. Hakemli değil, birincil yöntem sahibinin metni de değil (ikinci el özet).
- Yöntemin gerekçesi açıkça **görüşme karşıtı**: "it's better to observe conversations than to ask questions, because getting great data from interviews often means: trusting prospects to accurately identify their own pain points; believing that they remember what they do…" — aynı sayfa
- Raporun "very time and labour intensive" alıntısı, çektiğim solvingproduct sayfasında **bulunamadı**; muhtemelen ikinci kaynaktan (Sales Safari 101) geliyor. Bu, raporun iki farklı kaynağı tek kaynakmış gibi birleştirdiği bir örnek — doğrulanamadı.

### Inferences
- Bu, katman 5 bir practitioner yöntemi; "30–50 saat" bir **tasarım kuralı**, ölçülmüş bir eşik değil. Neden 30–50, neden 10 değil, kaynakta gerekçelendirilmiyor.
- Raporun iç tutarsızlığı: Sales Safari "sorma, gözle" derken, The Mom Test "iyi sor" diyor. İkisi aynı hiyerarşinin basamakları gibi sunuluyor; oysa veri toplama felsefeleri zıt.
- Dikkat kelimeleri listesi, doğrudan pazarlama/SEO sezgisidir; "relief" ve "finally" gibi kelimelerin öngörü değeri ölçülmemiş.

### Gaps
- Sales Safari ile yapılan araştırmaların ürün başarısına etkisini ölçen hiçbir karşılaştırmalı çalışma bulunamadı.

---

## 8. The Mom Test "doğrulama literatürünün temel referansı" mı?

### Raporun cümlesi
> "Doğrulama literatürünün temel referansı The Mom Test'in tezi hâlâ aynı"

### Takeaway
The Mom Test **hakemli değil**: yazarın kendi yayımladığı, 123 sayfalık bir pratik kitap (2013). Alıntılanan cümle gerçek, ama "literatürün temel referansı" ifadesi kategori hatası. Mom-Test tarzı görüşmelerin sonucu iyileştirdiğine dair kontrollü bir kanıt yok.

### Cited Findings
- Künye: *The Mom Test*, Rob Fitzpatrick, 2013, **123 s.**, yayıncı **Rob Fitzpatrick**, satıcı Draft2Digital — yani self-published — [Apple Books](https://books.apple.com/us/book/the-mom-test-how-to-talk-to-customers-learn-if-your/id1450865735)
- Yazarın kendi ifadesi: "my first book, The Mom Test (2013)… It's sold **250k copies** and is taught at unis like Harvard, MIT, and Oxford" — bu bir **self-report**, bağımsız doğrulanmadı — [robfitz.com](https://robfitz.com/c/who-what-and-why/tldr)
- Alıntı gerçek: "Compliments are the fool's gold of customer learning: shiny, distracting, and worthless." — kitap alıntısı, [Goodreads](https://www.goodreads.com/author/quotes/19494457.Rob_Fitzpatrick)
- Ama raporun bu alıntı için gösterdiği kaynaklar blog ve SEO sayfası: [Iterators](https://www.iteratorshq.com/blog/the-mom-test-why-its-on-every-founders-bookshelf); [RoadmapOne, 2026](https://roadmap.one/blog/posts/blog44-6-mom-test). İkisi de birincil metin değil.
- Kitabın yaklaşımı, akademik davranışsal kanıtla **uyumlu** ama ondan türetilmemiş: geçmiş davranışı sormak, hipotetik sorulardan daha az yanlı. Hipotetik bias'ın varlığı ölçülmüş (medyan 1,35×) — [Murphy et al. 2005](https://doi.org/10.1007/s10640-004-3332-z); "implementation intentions" literatürü niyeti eyleme çevirmenin koşullarını ölçüyor (d=0,65) — [Gollwitzer & Sheeran 2006, özet](https://cancercontrol.cancer.gov/sites/default/files/2020-06/goal_intent_attain.pdf)
- Mom Test'in kendisine dair kontrollü/RCT bir değerlendirme bulunamadı.

### Inferences
- "Temel referans" iddiası, popülerlik ile bilimsel statüyü karıştırıyor. Kitap **pedagojik** olarak etkili olabilir (250k kopya, üniversite müfredatı); bu, **ampirik olarak doğrulanmış** olduğu anlamına gelmez.
- Raporun cümlesi savunulabilir hale getirilmek istenirse: "pratikte en yaygın kullanılan doğrulama çerçevesi" denmeli; "literatürün temel referansı" denmemeli.
- Kitabın commitment doktrini (time/reputation/money) ile raporun 4 kademeli merdiveni aynı şey değil; rapor ikisini birleştiriyor.

### Gaps
- Mom Test yöntemini kullanan ekiplerle kullanmayanları karşılaştıran hiçbir kontrollü çalışma (RCT, quasi-experiment) bulunamadı. Bu, "kanıt yok" demektir; "etkisiz" demek değildir.

---

## Kaynak-katmanı asimetrisi (nicel)

Raporun kendi atıf etiketlerine ve URL'lerine göre sınıflandırma:

| Katman | Tanım | Sinyal/lead-user bölümündeki atıflar |
|---|---|---|
| 1 | Hakemli dergi / akademik kitap | von Hippel 1986; Urban & von Hippel 1988; DI Ch10; Timoshenko & Hauser 2019 |
| 2 | Preprint | Timoshenko/Mao/Hauser arXiv |
| 3 | Resmî doküman | — (bu bölümde yok) |
| 4 | Kurumsal araştırma raporu | — (bu bölümde yok) |
| 5 | Practitioner blog / kitap alıntısı | Iterators; WhittleOS; solvingproduct; Sales Safari 101; Pixel Breeders |
| 6 | SEO içerik / anonim forum / AI-skill dosyası | RoadmapOne; GitHub `mom-test/SKILL.md`; Evan Yang (Indie Hackers); Boris (Indie Hackers); `voice-of-customer-miner/SKILL.md` |

**Sonuç:** §1–§2'deki ~13 atfın **~10'u katman 5–6 (%77)**. Merkez tez cümlesinin iki ayağından biri (Workaround/tekrar/sayı üçlüsü) **tek bir katman-5 sayfaya**, diğeri (commitment merdiveni) **tek bir katman-6 dosyaya** dayanıyor.

**Ek bulgu — görünürdeki bağımsız doğrulama tek kaynağa iniyor:**
- WhittleOS'un yazarı **Boris Binyaminov**; raporda ayrı bir "bağımsız post-mortem" gibi sunulan Indie Hackers yazısının yazarı da "**Boris**". İkisi aynı kişi/argüman ise, rapor tek bir practitioner'ın iki metnini iki bağımsız kaynak gibi kullanmış oluyor. (Kimlik eşleşmesi yüksek olasılıklı ama bu turda kesin doğrulanmadı — bkz. Gaps.)
- WhittleOS sayfası kendi Reddit madenciliği yapmadığını açıkça söylüyor ("Reddit is not among them, and we do not source it"). Yani Reddit sinyal hiyerarşisinin ana operasyonel kaynağı, Reddit'i hiç kullanmamış bir yazardan geliyor.

**Metodolojik asimetri:** Rapor, akademik kaynakları (von Hippel, Urban, Lilien) **sayı ve kesinlik iddiası** için; practitioner kaynakları ise **normatif reçete** için kullanıyor. Ama akademik kaynaklar okunduğunda tam tersi bir tablo çıkıyor: akademik literatür "kullanıcı yeniliği gerçek ama ticarileşmesi nadir ve bağlama bağlı" derken, practitioner katman "workaround gördüysen ödeme sinyali var" diyor. Rapor ikisini aynı hiyerarşide birleştirirken aradaki bu gerilimi gizliyor.

---

## Genel değerlendirme (rapor yazarı için)

1. **Tezin yönü savunulabilir, ölçüsü değil.** "Davranış > beyan" literatürle uyumlu; "beyan ≈ sıfır" uyumlu değil. Öneri: "beyan gürültülü ve yukarı yanlı; davranış daha güçlü bir vekil" formülasyonu.
2. **İki sayı hatası düzeltilmeli:** %82 (1986 değil 1976; "major improvement", bilimsel enstrüman) ve 3M ("benzer sayı" değil, 5/5 vs 1/42, 8× tahmini satış).
3. **İki atıf değiştirilmeli:** commitment merdiveni için GitHub SKILL.md değil, kitabın kendi "time/reputation/money" gradyanı; "I wish ≈ sıfır" için ampirik kaynak yoksa "practitioner heuristic" etiketi.
4. **Raporun en güçlü yanı** aslında burada: kendi alıntıladığı "Complaining is free; paying is not… only an ask can" cümlesi, tam da bu bölümün sınırını doğru çiziyor. Bu cümle merkez tez yapılırsa, hem kanıtla hem kaynakla uyumlu olur.

---

## Gaps (genel)

- "I wish" postlarının öngörü değeri: tek bir ampirik çalışma yok.
- LOI → ödeme ve peşinat → ödeme dönüşüm oranları: hakemli/endüstriyel benchmark yok.
- 3M gerçekleşen satışları: kamuya açık değil.
- Lilien et al. 2002 bağımsız replikasyonu: bulunamadı.
- Mom Test / Sales Safari etkinliği: kontrollü çalışma yok.
- WhittleOS yazarı ile Indie Hackers "Boris" yazarının aynı kişi olduğu: isim ve argüman örtüşüyor, ancak kesin kimlik doğrulaması yapılmadı.
- von Hippel 1986 Tablo 2'si PDF'te görsel; içeriği doğrulanamadı.
