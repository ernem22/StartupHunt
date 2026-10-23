# Akademik NLP/LLM ve atıf denetimi — "Startup fikri yakalama teknikleri" raporu

**Denetim türü:** devil's-advocate, yalnızca kanıtla çürütme
**Erişim tarihi (tüm URL'ler):** 21.10.2026
**Yöntem notu:** Her iddia için önce birincil kaynak (yayıncı sayfası, arXiv/ACL PDF'i, resmî fiyatlandırma sayfası) okundu. PDF metinleri `pypdf` ile çıkarıldı; doğrudan alıntılar İngilizce bırakıldı. Raporun bağladığı URL ile iddianın kaynağı uyuşmuyorsa bu ayrıca işaretlendi.

---

## Verdict tablosu

| # | Raporun iddiası | Verdict | Kısa gerekçe |
|---|---|---|---|
| 1 | Timoshenko & Hauser 2019, Marketing Science; CNN ön-filtre + 3 insan analist; UGC-VOC, interview-VOC ile eşdeğer | **DOĞRULANDI** (tasarım) / **KISMEN** ("eşdeğer") | Makale "at least as valuable, likely more valuable" diyor; "eşdeğer" altında kalıyor. Tasarım: tek kategori (oral care), 115.099 review, 12.000 cümle, 3 analist. |
| 2 | "If only 40% ... raises it to 80%" alıntısı | **KISMEN** | Alıntı birebir var ama **hipotetik** ("suppose that only 40%..."). Ampirik: %52 informative; ML kazancı %15–22; MIT özeti "20% fewer sentences". "Katlarıyla büyütür" abartı. |
| 3 | TH2019 "500+ atıf" | **KISMEN** | Semantic Scholar 451; DOI sayfası 992 gösteriyor. Veritabanına göre değişiyor; "500+" tek başına doğrulanamıyor. |
| 4 | TH2019 "hidden opportunities": yüksek öneme göre filtrelemek en değerli fırsatları eler | **KISMEN** | Kavram ve %72 kaçırma sayısı gerçek; ama "en değerli" ölçülmüş değil ve "her sistem" aşırı genelleme. |
| 5 | arXiv 2503.01870: "SFT LLM performs at least as well as professional analysts" | **DOĞRULANDI** (alıntı) | Cümle birebir abstract'ta. Görev: CN abstraction; metrik: 3 boyutlu kör profesyonel değerlendirme + kapsam; model: Vicuna-13B SFT; örnek: wood stain 103 CN / 1.000 cümle / 150 cümle × 3 değerlendirici. |
| 6 | "2026'da fine-tuned LLM ... ulaştı" çerçevesi | **KISMEN** | v1 **25 Şubat 2025**'te aynı sonucu veriyor; v2 8 Nisan 2026 sadece revizyon. Başarı 2025'e ait. |
| 7 | Soyutlama seviyesi: çok genel = actionable değil; çok spesifik = yaratıcılığı kısıtlar | **DOĞRULANDI** | Makalede birebir: "too-specific CNs ... limit creativity and fail to generalize"; foundational LLM'in "Easy to see coverage" çıktısı yetersiz spesifiklik örneği. |
| 8 | AR-Miner (ACM 2014) informative review seçimi | **DOĞRULANDI** | ICSE 2014, 4 Android app, review'ların %35,1'i informative, hit-rate 0,70. Birim çoğunlukla **review**, cümle değil. |
| 9 | AR-Miner "780+ atıf" | **KISMEN** | Semantic Scholar 554, OpenAlex 398, ACM DOI 527. 780+ doğrulanamadı. |
| 10 | TopicImpact (arXiv 2507.13392) LLM opinion-unit çıkarımı + clustering | **DOĞRULANDI** | Opinion unit = label + excerpt + 1–10 sentiment; GPT-4 ile çıkarım (recall %85,3 / precision %87,4); BERTopic ile kümeleme; daha coherent/interpretable topic. |
| 11 | TopicImpact "gürültüyü azaltır" | **KISMEN** | Makale "noise reduction" ölçmüyor; coherence/interpretability ölçüyor. Bu raporun çıkarımı. |
| 12 | NIST/ACL 2025: okunabilir ama aşırı genel; document-assignment hallucination; insan denetimi düzeltir | **DOĞRULANDI** | Abstract + Table 2'de birebir "Document assignment hallucinations" ve "overly generic topics". |
| 13 | LLM-ITL (ACL 2025): global yapı istatistiksel modelde kalmalı | **DOĞRULANDI** | ACL 2025 long 70; birebir: "As LLMs are asked to focus on a document individually, they may be unable to cover global topics across all the documents". |
| 14 | ACL Findings 2026 survey: sabit kategori "well-suited", tüm-korpus keşfi "partial"; maliyet tablosu | **DOĞRULANDI** (tablo) / **KISMEN** ("üç rol") | Table 1: TC = Well-suited, TD = Partial, TM = Somewhat. Survey üç grup (Classical/LLM-Assisted/LLM-Centric) veriyor; "üç onaylanmış rol" raporun sentezi. |
| 15 | AAAI 2026 student abstract: GPT-4o ~%12, Claude 3.5 ~%16, LLaMA-4 ~%21; %65 → %75 → %80 precision | **DOĞRULANDI** | Birebir. Örnek yalnız ~200 citation (~50/model); "preliminary". |
| 16 | arXiv 2603.03299: 69.557 citation; %11,4–56,8 | **DOĞRULANDI** | 69.557 üretilen, 40.529 doğrulanan; %11,4 (GPT-5-mini) – %56,8 (haiku-4.5). |
| 17 | 2603.03299 "CrossRef/OpenAlex/Semantic Scholar waterfall öneriyor" | **KISMEN** | Makale "three-source resolution pipeline" diyor; "waterfall" kelimesi geçmiyor. |
| 18 | CiteCheck (2605.27700): insan %69,7, LLM %4,2–18,5 | **YANLIŞ** | Bu sayılar **CiteME** (arXiv 2407.12861) sonucu; CiteCheck'te yok. CiteCheck kendi sonucu: **88,7 macro-F1 / %88,9 accuracy**. |
| 19 | EACL Findings 2026: LLM-judge %79,18 vs tri-stage %87,74 | **DOĞRULANDI** | 79.18 = otomatik GPT-3.5-Turbo judge; 87.74 = fact-level tri-stage pipeline. |
| 20 | GPT-5-nano $0,05/$0,40; batch %50; cache $0,005 | **DOĞRULANDI** | Resmî fiyat sayfası: $0.05 / $0.40; batch $0.025 / $0.20; cache $0.005. |
| 21 | "272K context" | **KISMEN** | 272K, "short context" eşiği (≤272K input); toplam context değil. |
| 22 | Gemini 2.5 Flash-Lite $0,10/$0,40 | **DOĞRULANDI** (fiyat) / **KISMEN** (güncellik) | Fiyat doğru; ancak Google Cloud doc modeli **20 Ekim 2026'da emekliye ayırdı**; yeni projeler için 3.5 Flash-Lite / 3.8 Flash öneriliyor. |
| 23 | Structured Outputs "100% schema adherence"; gpt-4-0613 <%40 | **DOĞRULANDI** | OpenAI: "scores a perfect 100%"; gpt-4-0613 "less than 40%". Caveat: strict=true + constrained decoding; refusal/max_tokens istisnaları var. |
| 24 | 1M doküman × (500 in + 200 out) ≈ $50–65 batch | **DOĞRULANDI** | GPT-5-nano batch: $25 + $40 = $52,50. Gemini batch: $25 + $40 = $65. |
| 25 | Lokal 8B: SOTA %18,4; Gemma %41,2; Mixtral-8x7B %42,6 | **DOĞRULANDI** (sayılar) / **KISMEN** (yorum) | TRIVIA+ test split: 18.4 / 41.2 / 42.6. Ama Mixtral-8x7B 8B sınıfı değil (~47B total); ve bu "sinyal kesme yetkisi" testi değil. |
| 26 | **Eksik kanıt:** Doshi & Hauser 2024 | **DOĞRULANDI** (eklendi) | N=293; novelty +%8,1, usefulness +%9,0; benzerlik +%8,9 (range); düşük yaratıcılıkta novelty +%10,7; kolektif çeşitlilik düşüyor. |
| 27 | **Eksik kanıt:** Si et al. 2024 | **DOĞRULANDI** (eklendi) | 119 insan / 109 AI **review** (49'ar fikir); novelty 4,84 → 5,64 (p<0,01); feasibility 6,61 → 6,34 (anlamsız); ölçeklenince fikir çeşitliliği düşük. |
| 28 | **Eksik kanıt:** LLM-mined pain point → gerçek satın alma | **KAYNAK BULUNAMADI** | Doğrudan çalışma yok. En yakın: Ludwig et al. 2026 (LLM duygu → rating → purchase), Boughanmi et al. 2025 (LLM attribute → rating, R²=.73), Wacoal vaka (elle çıkarılan pain point → satış, n=2). |

---

## Kanıt defteri

### 1) Timoshenko & Hauser 2019 — tasarım ve "eşdeğerlik"

**Künye:** "Identifying Customer Needs from User-Generated Content" — Timoshenko & Hauser; Marketing Science 38(1):1–20, 30.01.2019; DOI 10.1287/mksc.2018.1123.

**Verdict: DOĞRULANDI (tasarım) / KISMEN ("eşdeğer" ve "500+ atıf")**

Kaynak: <https://pubsonline.informs.org/doi/10.1287/mksc.2018.1123> · çalışma metni: <https://mitsloan.mit.edu/shared/ods/documents?PublicationDocumentID=5084>

Tam alıntı (abstract):
> "We show that (1) UGC is at least as valuable as a source of customer needs for product development, likely more valuable, compared with conventional methods, and (2) machine-learning methods improve efficiency of identifying customer needs from UGC (unique customer needs per unit of professional services cost)."

Tasarım (çalışma metninden):
> "From the 115,099 oral-care reviews on Amazon spanning the period from 1996 to 2014, we randomly sampled 12,000 sentences split into an initial set of 8,000 sentences and a second set of 4,000 sentences... the sentences were reviewed by a group of three experienced analysts..."

> "From the 8,000 sentences, analysts identified 74 of the 86 tertiary experiential-interview-based customer needs, but also identified an additional 8 needs." ... "With 12,000 sentences, that brings the total to 83 of the 86 experiential-interview-based customer needs and 91 of the 94 total needs (97%)."

**Ölçülen:** Tek ürün kategorisi (oral care); 8.000 cümlede 82 ihtiyaç (74 örtüşen + 8 yeni) vs interview 86; 12.000'de 91 vs 86. Priorizasyon: 197 tüketici (PureSpectrum paneli), importance 0–100 ve performance 0–10. Maliyet: interview maliyetinin %40–55'i; genel kazanç %46–52. Makalede ayrıca üç **uygulama** var (kitchen appliances, skin treatment, prepared foods) ama bunlar kontrollü UGC-vs-interview karşılaştırması değil; bu yüzden "kaç ürün" sorusunun kontrollü cevabı **1 kategori**dir.
**Raporun çıkarımı:** "eşdeğer sonuç üretiyor ama çok daha ucuz." Bu, makalenin kendi ifadesinden **daha zayıf**: makale "likely more valuable" diyor. "Eşdeğer" yanlış değil, ama kanıtı olduğundan küçük gösteriyor.
**Ayrıca:** Raporun linki **Haziran 2018 working paper**'a gidiyor; dergi sürümü Marketing Science 38(1):1–20 (2019). 40%→80% alıntısı bu working paper'da var; dergi sürümünde birebir korunduğunu doğrulamadım.

**Atıf sayısı:** Semantic Scholar Graph API (21.10.2026): **451**. DOI sayfası: **992**. Raporun "500+" ifadesi veritabanına bağlı; S2'de yanlış, DOI/Google Scholar tarafında muhtemelen doğru. Sayı yerine "yüksek atıflı" demek daha güvenli.

### 2) TH2019 "40% → 80%" alıntısı

**Verdict: KISMEN — alıntı gerçek, ama hipotetik; ampirik dayanak farklı.**

Tam alıntı:
> "For example, suppose that only 40% of the sentences are informative in the corpus, but after machine learning screening, 80% are informative. If analysts are limited in the number of sentences they can review (professional services costs constraint), they can identify customer needs much more efficiently by focusing on a sample of prescreened sentences rich in informative content than on randomly selected sentences."

**Ölçülen ampirik değerler:**
> "the three human coders determined that 52% of the 8,000 sentences contained at least one customer need and 9.2% of the sentences contained two or more customer needs."

> "In our initial test, machine learning efficiency gains are 15-22%... Overall gains of analyzing UGC with our approach over the traditional interview-based VOC are 46-52%."

MIT Sloan/Kellogg özeti: "prescreening ... allowed the analysts to find the same number of customer needs in about 20 percent fewer sentences."

**Raporun çıkarımı:** "ön-süzme, insan incelemesinin kapasitesini katlarıyla büyütür." **"Katlarıyla" desteklenmiyor**; ölçülen kazanç %15–22 (veya aynı ihtiyaç için %20 daha az cümle). 40%→80% bir tasarım örneği, bulgu değil. Raporun "Makale şu mimari kararı doğrudan verir" ifadesi kısmen dürüst ("suppose"), ama okur bunu ampirik sonuç sanabilir.

### 3) TH2019 "hidden opportunities"

**Verdict: KISMEN — kavram doğru, "en değerli" ve "her sistem" aşırı.**

Tam alıntılar:
> "Focusing on highly important customer needs is tempting, but we cannot ignore low-importance customer needs. In new product development, identifying hidden opportunities for innovation often leads to successful new products. ... Thus, we define low-importance–low-performance customer needs as hidden opportunities."

> "if we were to focus only on customer needs with frequency above the median of 7.9 mentions, we would miss 29% of the high-importance customer needs, 44% of the high-performance customer needs, and 72% of the hidden opportunities."

> "High-importance-low-performance customer needs are almost perfectly identified by both data sources."

> "By this criterion, the UGC-unique customer needs identify 20% of the hidden opportunities and the interview-unique needs identify 8% of the hidden opportunities."

**Ölçülen:** Hidden opportunity = düşük önem + düşük performans. Frekans filtresi hidden'ların %72'sini kaçırıyor. UGC, hidden'ların %92'sini yakalıyor (makalenin iddiası).
**Raporun çıkarımı:** "yüksek öneme göre filtreleyen her sistem en değerli fırsatları eler." Makale **frekans** filtresini test ediyor, "her sistem"i değil; ayrıca hidden'ları "en değerli" diye sıralamıyor, "successful new products'a yol açabilir" diyor. Yön doğru, mutlaklık fazla.

### 4) arXiv 2503.01870 — SFT LLM vs profesyonel analist

**Künye:** "Transforming the Voice of the Customer: Large Language Models for Identifying Customer Needs" — Timoshenko, Mao & Hauser; arXiv:2503.01870; v1 25.02.2025, v2 08.04.2026. Dergi/konferans yayını doğrulanamadı (preprint).

**Verdict: DOĞRULANDI (cümle) / KISMEN (2026 çerçevesi)**

Kaynak: <https://arxiv.org/abs/2503.01870> · PDF v2: <https://arxiv.org/pdf/2503.01870v2>

Tam alıntı (abstract):
> "Across various product and service categories, we demonstrate that supervised fine-tuned (SFT) LLMs perform at least as well as professional analysts and substantially better than foundational LLMs."

Tasarım:
- Görev: online review'lardan **customer need (CN) abstraction** — "jobs to be done" cümlesi üretme; classification değil.
- Model: **Vicuna 13B** foundational; aynı modelin SFT edilmiş hali. ("Foundational Model: Vicuna 13B")
- Eğitim: "The ten professional VOC studies provided 1,549 CN-verbatim pairs" + 11.975 uninformative cümle.
- Ana örnek: wood stain; "a professional VOC study that identified 103" CN; 1.000 informative cümle; 150 review cümlesi; **3 profesyonel değerlendirici**; her cümle için 3 CN (analist, base LLM, SFT LLM), kör ve rastgele sıralı.
- Metrik: üç boyutta "Yes" yüzdesi — "Is Customer Need", "Sufficient Detail", "Follows from the Source".

Tam alıntı (ölçüm):
> "Each of the three professional evaluators evaluated 150 randomly-chosen sentences from online reviews. For each review sentence, a professional evaluator was given the text of the online review and three CN statements..."

> "In Study 1, the professional evaluators agreed with the original professional analysts about 80% of the time on 'Is Customer Need' and 'Sufficient Detail.'"

Kapsam:
> "The SFT LLM identified CNs from 100% of the primary groups and 100% of the secondary CN groups. The professional analysts identified CNs from seven (87.5%) of the primary groups and 24 (80%) of the secondary groups."

> "the 154 winnowed SFT-LLM-identified CNs account for 84.6% of the final affinitized tertiary CNs while the 103 winnowed analyst-identified CNs account for 48.7%. (The percentages add to more than 100% because of overlap.)"

**"On par" ne demek:** Profesyonel değerlendiricilerin "bu bir CN mi / yeterince spesifik mi / kaynaktan geliyor mu" yüzdesinde analistten geri kalmamak; ayrıca daha geniş kapsam (primary/secondary %100). **Ürün başarısı, satış veya ödeme davranışı ölçülmüyor.**

**Tarih çerçevesi:** v1 25.02.2025, başlığı "Can Large Language Models Extract Customer Needs as well as Professional Analysts?" ve abstract'ı aynı sonucu veriyor ("The SFT LLM performs as well or better than professional analysts"). v2 08.04.2026 sadece revizyon. Raporun "2026'da ... ulaştı" ifadesi, başarıyı bir yıl geciktiriyor. **KISMEN.**

**Kritik ama raporun atladığı maliyet:** SFT, 10 profesyonel VOC çalışmasından **1.549 etiketli CN-verbatim çifti** gerektiriyor. Bu, StartupHunt'ın sahip olmadığı tescilli etiketli veri. Rapor "fine-tuned LLM hattı"nı önerirken bu veri bağımlılığını yazmıyor. Ayrıca makale bir yerde SFT modelin reasoning sorusunda base modelden kötü olduğunu da gösteriyor (Table 3); "her konuda analist düzeyi" değil.

### 5) Soyutlama seviyesi

**Verdict: DOĞRULANDI**

Tam alıntılar:
> "Conversely, too-specific CNs, such as 'able to dry in 20 minutes at 70% humidity' limit creativity and fail to generalize."

> "Without fine-tuning, the foundational LLM (Vicuna 13B) abstracted a CN 'Easy to see coverage.' While this statement correctly summarizes the topic of the online review, the statement lacks the specificity required to guide innovation."

Raporun "genel soyutlamalar ('ease of use') actionable değil, aşırı spesifik çıktılar kreatifliği kısıtlar" paraphrase'i doğru. **Ölçülen:** profesyonel değerlendirici "Sufficient Detail" skorları; **çıkarım:** tasarım kararı. Rapor bunu tasarım kararı olarak sunuyor, doğru.

### 6) AR-Miner (ICSE 2014)

**Künye:** "AR-miner: mining informative reviews for developers from mobile app marketplace" — Chen, Lin, Hoi, Xiao & Zhang; ICSE 2014, pp. 767–778; DOI 10.1145/2568225.2568263.

**Verdict: DOĞRULANDI (içerik) / KISMEN (atıf sayısı ve "cümle" birimi)**

Kaynak: <https://dl.acm.org/doi/10.1145/2568225.2568263> · açık PDF: <https://ink.library.smu.edu.sg/sis_research/2323/>

Tam alıntı:
> "we found that only 35.1% of app reviews contain information that can directly help developers improve their apps."

> "We select 4 Android apps from Google Play, i.e., SwiftKey Keyboard ..., Facebook ..., Temple Run 2 ..., and Tap Fish ..."

> "AR-Miner (LDA) achieves 0.70 in terms of Hit-rate"

**Ölçülen:** 4 app; review'ların %35,1'i informative; Hit-rate 0,70, NDCG@10 0,552. **Birim:** makale "informative reviews" diyor; dataset sentence-level'a çevrilmiş olsa da seçim/sıralama review düzeyinde. Raporun "informative inceleme cümlelerini seçip sıralar" ifadesi küçük bir birim kayması; içerik yanlış değil.
**Atıf:** Semantic Scholar **554**, OpenAlex **398**, ACM DOI sayfası **527**. Raporun "780+" değeri bu üç kaynakta yok. **KISMEN.**

### 7) TopicImpact (arXiv 2507.13392)

**Künye:** "TopicImpact: Improving Customer Feedback Analysis with Opinion Units for Topic Modeling and Star-Rating Prediction" — Häglund & Björklund; arXiv:2507.13392, 16.07.2025 (preprint).

**Verdict: DOĞRULANDI (çekirdek) / KISMEN ("gürültü azaltma")**

Kaynak: <https://arxiv.org/abs/2507.13392>

Tam alıntı:
> "We improve the extraction of insights from customer reviews by restructuring the topic modelling pipeline to operate on opinion units - distinct statements that include relevant text excerpts and associated sentiment scores."

> "By clustering these opinion units instead of entire reviews, TopicImpact generates more coherent and interpretable topic clusters."

> "With respect to classification, which is the appropriate approach when dealing with static and clearly defined categories. However, classification fails to capture emerging themes and niche customer concerns."

> "LLMs can accurately extract opinion units using few-shot learning, with GPT-4 achieving a recall of 85.3% and precision of 87.4%"

**Ölçülen:** 5.000 review/dataset (subsample), ortalama 5,65 opinion unit/review; GPT-4 çıkarımı; BERTopic clustering; 3 insan değerlendirici ile cluster precision; star-rating regression. **"Gürültü azaltma" ölçülmüyor**; coherence/interpretability ve rating prediction ölçülüyor. Raporun "gürültüyü azaltıp topic kalitesini yükseltir" ifadesi ikinci kısmı doğru, ilk kısmı çıkarım.

### 8) NIST / ACL 2025 — traditional vs LLM topic models

**Künye:** "From Traditional Topic Models to LLM Topic Models: Can Large Language Models Replace Traditional Topic Models?" — Li, Calvo Bartolome, Hoyle, Stephens, Xu, Dima, Boyd-Graber & Fung; ACL 2025 Long; DOI 10.18653/v1/2025.acl-long.375; NIST publication 01.08.2025.

**Verdict: DOĞRULANDI**

Kaynak: <https://nist.gov/publications/traditional-topic-models-llm-topic-models-can-large-language-models-replace-traditional> · DOI: <https://doi.org/10.18653/v1/2025.acl-long.375>

Tam alıntı:
> "While LLM-based methods generate more human-readable topics and show higher average win probabilities than traditional models for data exploration, they produce overly generic topics for domain-specific datasets that do not easily allow users to learn much about the documents. Adding human supervision to LLM-based topic models improves data exploration by addressing hallucination and genericity but requires more human efforts."

Table 2'de açık madde:
> "Overly generic topics" / "Document assignment hallucinations" / "Expensive computation"

Raporun "belge-atandırmada halüsinasyon yapabiliyor" ifadesi birebir karşılığını buluyor. **DOĞRULANDI.**

### 9) LLM-ITL (ACL 2025)

**Künye:** "Neural Topic Modeling with Large Language Models in the Loop" — Yang, Zhao, Xu, Qi, Lu, Phung & Du; ACL 2025 Long 70, pp. 1377–1401; arXiv:2411.08534.

**Verdict: DOĞRULANDI**

Kaynak: <https://aclanthology.org/2025.acl-long.70/> (ACL 2025 Long, pp. 1377–1401)

Tam alıntı:
> "As LLMs are asked to focus on a document individually, they may be unable to cover global topics across all the documents in the corpus (Doi et al., 2024), which is critical in topic modeling."

> "In LLM-ITL, global topics and document representations are learned through the NTM. Meanwhile, an LLM refines these topics using an Optimal Transport (OT)-based alignment objective..."

Raporun "tekil belge odaklı LLM prompting tüm korpusun global topic yapısını kapsamaz; global yapı istatistiksel modelde kalmalı" paraphrase'i birebir. **DOĞRULANDI.** Tek nüans: LLM-ITL LLM'i tamamen dışlamıyor; topic refinement'ta kullanıyor. Raporun "istatistiksel modelde kalmalı" ifadesi "global yapı" için doğru.

### 10) ACL Findings 2026 survey (2026.findings-acl.326)

**Künye:** "Towards Modern Topic Models: A Survey of Taxonomies and Paradigm Shifts from Algorithm-Centric to LLM-Centered Topic Analysis" — Xu, Yang, Li, Tian, Chu, Song, Li, Tan & Zhou; Findings of ACL 2026, pp. 6536–6561.

**Verdict: DOĞRULANDI (well-suited/partial) / KISMEN ("üç rol")**

Kaynak: <https://aclanthology.org/2026.findings-acl.326/> (Findings ACL 2026, pp. 6536–6561)

Table 1:
> "TC | Single doc, predefined topics | Topic label | ... | Well-suited"
> "TD | Doc. collection | Topic set | ... | Partial"
> "TM | Doc. collection | Topic list + assignment | ... | Somewhat"

Tam alıntı (abstract):
> "We review recent TM developments and categorize existing methods into three groups: Classical Algorithm-Centric, LLM-Assisted, and LLM-Centric."

LLM-Assisted alt taksonomisi (gövde):
> "3.1 Data Preprocessing ... LLMs facilitate corpus preprocessing via summarization, expansion, rewriting/cleaning, and label generation"
> "LLM-derived Embeddings" / "Post-hoc Refinement"

**Raporun "LLM'e üç onaylanmış rol" sentezi:** Survey'in kendi ifadesi "üç rol" değil, üç **yöntem grubu** ve LLM-Assisted içinde üç alt rol (preprocessing, embeddings, post-hoc refinement). Raporun "kümeleme-öncesi ön-işleme, kümeleme-sonrası etiket/özet, insan denetiminde extraction" listesi bu taksonomiyi yaklaşık yansıtıyor; "üç onaylanmış rol" diye sunması hafif bir çerçeveleme. **KISMEN.**

Maliyet tablosu: survey'de niteliksel "Cost & latency" kolonu var (Low–medium / Medium–high); dolar tablosu yok. Raporun "maliyet tablosu çıkarır" ifadesi niteliksel tablo için doğru.

### 11) Atıf halüsinasyonu kümesi

#### 11a) AAAI 2026 student abstract (42257)

**Künye:** "Detecting Citation Hallucinations in Large Language Model Outputs (Student Abstract)" — Misra & Udandarao; AAAI-26, 40(48):41325–41327; DOI 10.1609/aaai.v40i48.42257; 14.03.2026.

**Verdict: DOĞRULANDI**

Kaynak: <https://doi.org/10.1609/aaai.v40i48.42257> · PDF: <https://ojs.aaai.org/index.php/AAAI/article/download/42257/46218>

Tam alıntı:
> "Hallucination Rates. GPT-4o (∼12%), Claude 3.5 Sonnet (∼16%), and LLaMA-4 Maverick (∼21%)."
> "Exact Lookup. Detected ∼65% of hallucinations..."
> "Fuzzy Retrieval. Increased recall to ∼75%..."
> "LLM-Assisted Verification. Combined with retrieval, achieved ∼80% precision in detecting hallucinated citations"

**Ölçülen:** pilot ~200 citation (~50/model); "preliminary experiments"; iki annotator. Raporun tüm sayıları doğru. Ancak "tespit pipeline'ı ... %80 precision veriyor" cümlesi bu küçük pilot için; genellenebilir bir üretim ölçümü değil. Rapor bunu genel bir standart gibi kullanıyor; nüans eksik.

#### 11b) arXiv 2603.03299

**Künye:** "How LLMs Cite and Why It Matters: A Cross-Model Audit of Reference Fabrication in AI-Assisted Academic Writing and Methods to Detect Phantom Citations" — MZ Naser; arXiv:2603.03299, 07.02.2026 (preprint).

**Verdict: DOĞRULANDI (sayılar) / KISMEN ("waterfall")**

Kaynak: <https://arxiv.org/abs/2603.03299>

Tam alıntı:
> "...generating 69,557 citation instances verified against three scholarly databases (namely, CrossRef, OpenAlex, and Semantic Scholar). Our results show that the observed hallucination rates span a fivefold range (between 11.4% and 56.8%)..."

> "Across the ten models, hallucination rates range from 11.4% (GPT-5-mini) to 56.8% (haiku-4.5), a fivefold variation."

**Ölçülen:** 10 ticari model, 4 alan, 69.557 citation, 40.529 doğrulanan. Raporun sayıları doğru.
**"Waterfall":** Makale "three-source resolution pipeline" diyor; "waterfall" kelimesi geçmiyor. Raporun "waterfall öneriyor" ifadesi mecazi; KISMEN.

#### 11c) arXiv 2605.27700 (CiteCheck) — **YANLIŞ ATIF**

**Künye:** "CiteCheck: Retrieval-Grounded Detection of LLM Citation Hallucinations in Scientific Text" — Khajavi, Sadeghi, Adhikari & Tessier; arXiv:2605.27700; v1 26.05.2026, v2 03.10.2026 (preprint).

**Verdict: YANLIŞ**

Kaynak: <https://arxiv.org/abs/2605.27700>

Makalenin kendi sonucu:
> "On the held-out test set, CiteCheck achieves 88.7 macro-F1 and 88.9% accuracy, outperforming GPT, Claude, and Gemini baselines, including web-search and few-shot variants."

PDF'te "69.7", "%4,2" veya "%18,5" **yüzde olarak geçmiyor** (4.2 yalnızca bir bölüm numarası olarak var). Bu sayılar **CiteME**'ye ait:
> "CiteME use reveals a large gap between frontier LMs and human performance, with LMs achieving only 4.2-18.5% accuracy and humans 69.7%." — <https://arxiv.org/abs/2407.12861>

**Raporun cümlesi:** "CiteCheck, insanların %69,7 doğruluğuna karşılık LLM'lerin %4,2–18,5'te kaldığını gösteriyor (arXiv 2605.27700)." Bu, iki ayrı hatayı birleştiriyor: (a) sayılar CiteCheck'in değil CiteME'nin; (b) CiteCheck'in kendi sonucu tam tersine **yüksek** doğruluk (88,9%), yani "LLM'ler citation doğrulamada insanın çok altında" sonucu CiteCheck için geçerli değil. Raporun kendi "atıf hijyeni" standardına göre bu, düzeltilmesi gereken bir atıf hatası.

#### 11d) EACL Findings 2026 (2026.findings-eacl.206)

**Künye:** "KGHaluBench: A Knowledge Graph-Based Hallucination Benchmark for Evaluating the Breadth and Depth of LLM Knowledge" — Robertson, Liang & Gani; Findings of EACL 2026, pp. 3975–3989.

**Verdict: DOĞRULANDI**

Kaynak: <https://aclanthology.org/2026.findings-eacl.206/>

Tam alıntı:
> "...our tri-stage fact verification pipeline achieved 87.74% alignment with human judgment, which was 8.56% higher than the automated judge at 79.18%."

> "...coarse entity-level and fine-grained fact-level filters to assess the factuality of the LLM's output, achieving 79.19% and 87.74% agreement with human judgment, respectively."

**Ölçülen:** 25 LLM, 10 assessment × 150 soru; insan doğrulama çalışması. Raporun "%79,18 vs %87,74" sayıları doğru; küçük nüans: 79.18 otomatik judge, 79.19 entity-level filter. **DOĞRULANDI.**

### 12) Maliyet ve fiyatlandırma

**Verdict: DOĞRULANDI (fiyatlar, batch, aritmetik) / KISMEN (272K, Gemini güncelliği)**

Kaynaklar: <https://platform.openai.com/docs/pricing> · <https://openai.com/index/introducing-structured-outputs-in-the-api/> · <https://ai.google.dev/gemini-api/docs/pricing> · <https://developers.googleblog.com/gemini-25-flash-lite-is-now-stable-and-generally-available/>

Tam alıntılar:
> "gpt-5-nano | $0.05 | $0.40 | $0.005" (standard)
> "gpt-5-nano | $0.025 | $0.20 | $0.0025" (batch)

> "Short context: ≤272K input tokens. Long context: >272K input tokens."

Gemini:
> "priced at $0.10 / 1M input tokens and $0.40 output tokens" — Google Developers Blog, 22.07.2025.

Structured Outputs:
> "our new model `gpt-4o-2024-08-06` with Structured Outputs scores a perfect 100%. In comparison, `gpt-4-0613` scores less than 40%."

**Aritmetik:**
- 1M × 500 input = 500M token × $0.05/1M = **$25**
- 1M × 200 output = 200M token × $0.40/1M = **$80**
- Toplam **$105**; batch %50 → **$52,50**
- Gemini batch (%50 indirim varsayımıyla): 500M × $0.05 = $25; 200M × $0.20 = $40 → **$65**
Raporun "$50–65 batch" aralığı **doğru**.

**272K:** Bu, "short context" eşiği; GPT-5-nano'nun toplam context window'u değil. Raporun "272K context" ifadesi teknik olarak imprecise; **KISMEN.**

**Gemini güncelliği (önemli):** Google Cloud doc: "Important: This model is being retired on October 20th, 2026." Gemini API doc: "we are limiting access to the 2.5 models to users who have actively used them in the past... For any new projects, use our latest models: 3.5 Flash-Lite or 3.8 Flash." Yani fiyat doğru ama **21.10.2026 itibarıyla yeni proje için pratik bir seçenek değil**. Raporun maliyet örneği, önerdiği modelin EOL tarihini atlıyor.

**Structured Outputs caveat:** %100, OpenAI'nin kendi "complex JSON schema following" eval'inde ve `strict: true` + constrained decoding ile. Model refusal, `max_tokens` veya durma koşulunda şemayı bozabilir; ayrıca değerlerin semantik doğruluğunu garanti etmez. Raporun "100% şema uyumu" iddiası doğru ama "deterministik veri" garantisi gibi okunmamalı.

### 13) Lokal 8B halüsinasyon oranları (ACL 2026 long 680)

**Künye:** "Rethinking Evaluation for LLM Hallucination Detection: A Desiderata, A New RAG-based Benchmark, New Insights" — Chen, Padmanabhan, Giyahchi, Wong & Akoglu; ACL 2026 Long 680, pp. 14912–14931.

**Verdict: DOĞRULANDI (sayılar) / KISMEN ("8B sınıfı" ve yorum)**

Kaynak: <https://aclanthology.org/2026.acl-long.680/>

Tam alıntı (Table 10, "Hallucination rate by generating LLM in the TRIVIA+ test split"):
> "SOTA 1,006 18.4% [16.1%, 20.9%]
> Gemma 532 41.2% [37.1%, 45.4%]
> Mixtral-8x7B 1,686 42.6% [40.3%, 45.0%]"

Bağlam:
> "TRIVIA+ contains generations from three less-represented but popular LLMs: A commercially available SOTA LLM, Gemma-7b, and Mixtral 8x7b."

**Ölçülen:** TRIVIA+ test split'inde üretim modellerinin halüsinasyon oranı; N'ler farklı (1.006 / 532 / 1.686). Raporun sayıları ve "2–2,5×" oranı doğru (41,2/18,4 = 2,24; 42,6/18,4 = 2,32).
**KISMEN:** (a) Mixtral-8x7B, "8B sınıfı" değil — 8×7B MoE, ~47B total / ~13B active. (b) Bu tablo "sinyal kesme yetkisi" testi değil; makale halüsinasyon **tespit** benchmark'ı. Raporun "sinyal kesme yetkisine uygun değil" sonucu makul bir mühendislik çıkarımı, ama makalenin ölçtüğü şey değil. (c) "SOTA" ticari modelin adı raporda yok; makale de jenerik "SOTA" diyor.

### 14) Raporun kaçırdığı kanıt — LLM fikir üretimi

#### 14a) Doshi & Hauser 2024, Science Advances

**Künye:** "Generative AI enhances individual creativity but reduces the collective diversity of novel content" — Doshi & Hauser; Science Advances 10(28):eadn5290; 12.07.2024; DOI 10.1126/sciadv.adn5290.

**Verdict: DOĞRULANDI (eklendi)**

Kaynak: <https://www.science.org/doi/10.1126/sciadv.adn5290>

Tam alıntı:
> "We find that access to generative AI ideas causes stories to be evaluated as more creative, better written, and more enjoyable, especially among less creative writers. However, generative AI–enabled stories are more similar to each other than stories by humans alone."

Etki büyüklükleri:
- N = 293 yazar; 3 koşul (human-only, 1 AI idea, 5 AI ideas).
- Novelty: 1 fikir **+%5,4** (b=0,207, p=0,021); 5 fikir **+%8,1** (b=0,311, p<0,001).
- Usefulness: 1 fikir **+%3,7** (p=0,039); 5 fikir **+%9,0** (p<0,001).
- Düşük yaratıcılıklı yazarlarda novelty: 1 fikir +%6,3; 5 fikir **+%10,7**; usefulness +%5,5 / +%11,5.
- Kolektif benzerlik: b=0,718 (p=0,003), insan-only aralığının **%8,9'u**; 1 fikirde b=0,871, **%10,7**.
- Yazarların %88,4'ü AI'dan en az bir kez fikir aldı.

**Rapor için anlamı:** LLM destekli fikir üretimi bireysel novelty'yi artırıyor ama çıktıları birbirine benzeştiriyor. StartupHunt'ın LLM'i "opinion-unit extraction" için kullanması bu çalışmanın doğrudan konusu değil; ancak LLM'in kümeleme öncesi yapıyı belirlemesi, farklı koşumlarda benzer topic'lere yakınsama riski taşır. Bu, raporun "LLM yalnız yorum katmanı" ilkesiyle gerilim yaratır: preprocessing, veri yolunun içine girer.

#### 14b) Si, Yang & Hashimoto 2024 (ICLR 2025)

**Künye:** "Can LLMs Generate Novel Research Ideas? A Large-Scale Human Study with 100+ NLP Researchers" — Si, Yang & Hashimoto; ICLR 2025; arXiv:2409.04109, 06.09.2024.

**Verdict: DOĞRULANDI (eklendi)**

Kaynak: <https://arxiv.org/abs/2409.04109>

Tam alıntı:
> "...we find LLM-generated ideas are judged as more novel (p < 0.05) than human expert ideas while being judged slightly weaker on feasibility."

Sayılar (Table 7; buradaki n **review** sayısıdır, fikir sayısı değil — Table 8'de her koşulda 49 fikir var):
- Human ideas n=119 review, novelty **4,84** (SD 1,79); AI ideas n=109 review, novelty **5,64** (SD 1,76), p<0,01.
- Feasibility: human **6,61** vs AI **6,34**, p=1,00 (anlamlı değil).
- Overall: 4,68 vs 4,85, p=1,00 (anlamlı değil).
- Fikir düzeyinde (Table 8): 49 insan / 49 AI fikir; novelty 4,86 → 5,62, p=0,03.
- "they lack idea diversity when we scale up idea generation" — ölçeklenince çeşitlilik düşüyor.
- "they cannot currently serve as reliable evaluators" — LLM self-evaluation güvenilmez.

**Rapor için anlamı:** LLM fikir üretiminde novelty üstünlüğü var, feasibility ve diversity'de yok. Raporun LLM'i "fikir üretici" değil "ön-işlemeci" olarak konumlaması bu bulguyla çelişmiyor; ama "LLM'i hattın içine koy" önerisinin diversity maliyeti bu iki çalışmada ölçülmüş durumda.

#### 14c) LLM-mined pain point → gerçek satın alma

**Verdict: KAYNAK BULUNAMADI (doğrudan); en yakın kanıtlar aşağıda.**

- **Ludwig et al. 2026, arXiv 2602.15312** — "Extracting Consumer Insight from Text: A Large Language Model Approach to Emotion and Evaluation Measurement"; LLM (LX) ile çıkarılan duygular, ürün rating'lerini ve rating üzerinden **gerçek clickstream satın almalarını** öngörüyor. 16 duygunun 12'si rating üzerinden dolaylı; "discontent" doğrudan negatif (b=-0,01789, p=0,0001); rating→purchase b=0,00472, p=0,0005. <https://arxiv.org/abs/2602.15312>
- **Boughanmi, Jedidi & Jedidi 2025, arXiv 2510.16551** — "From Reviews to Actionable Insights: An LLM-Based Approach for Attribute and Feature Extraction"; LLM ile Yelp attribute/feature çıkarımı; rating tahmini R²=0,73/0,71; simülasyonla "1–2% revenue gain" iddiası. Gerçek satın alma değil, rating ve simülasyon. <https://arxiv.org/abs/2510.16551>
- **Wacoal vaka çalışması (IAIAI Letters)** — elle okunan review'lardan çıkarılan pain point'ler → redesign → bra top **%198 YoY satış**, shapewear **%118 YoY**, "hem rides up" %27→%8, rating 3,2→4,4. **LLM ile değil, insan okumasıyla**; n=2 vaka; yazarlar nedensellik iddia etmiyor, konfoundları kabul ediyor. <https://iaiai.org/letters/index.php/lbds/article/download/505/416/1834>
- **Painsight (arXiv 2306.02043)** — "Painsight: An Extendable Opinion Mining Framework for Detecting Pain Points Based on Online Customer Reviews"; unsupervised pain point extraction; insan değerlendirmesi var, satın alma yok. <https://arxiv.org/abs/2306.02043>

**Sonuç:** "LLM-mined pain point'lerin gerçek satın alma davranışını öngördüğü" doğrudan bir çalışma bulunamadı. Raporun "bu ölçüm literatürde yok" iddiası bu dar anlamda **doğru**; ama "LLM çıktısı satın almayı öngörür" diye bir kanıt da yok. En yakın kanıt, LLM'in çıkardığı **duygu**nun rating üzerinden satın alma ile ilişkili olduğu (Ludwig) ve **insan**ün çıkardığı pain point'in satışla ilişkili olduğu (Wacoal) vaka düzeyinde.

---

## Çıkarımlar

1. **Raporun akademik omurgası büyük ölçüde sağlam.** TH2019, 2503.01870, AR-Miner, TopicImpact, NIST, LLM-ITL, ACL 2026 survey, AAAI 42257, 2603.03299, EACL 206 — hepsi gerçek; ana sayılar ve alıntılar birebir. Sorun "uydurma kaynak" değil, **aşırı yorum ve iki yanlış atıf**.

2. **En ciddi hata CiteCheck atfı.** %69,7 / %4,2–18,5 sayıları CiteME'ye ait; CiteCheck'in kendi sonucu %88,9 accuracy. Rapor, "atıf halüsinasyonu"nu denetleyen bir raporda, tam da o hata sınıfını yapıyor. Bu, raporun genel tezini çürütmez ama güvenilirliğini zedeler; düzeltilmesi zorunlu.

3. **"2026'da analist düzeyine ulaştı" çerçevesi yanıltıcı.** Sonuç Şubat 2025'te zaten var; v2 sadece revizyon. Raporun "2019 → 2026" yayı, gerçekte "2019 → 2025".

4. **"Eşdeğer" ve "katlarıyla" ifadeleri kanıtı olduğundan zayıf/fazla gösteriyor.** TH2019 "likely more valuable" diyor; screening kazancı %15–22, "katlarıyla" değil. Hidden opportunities kavramı doğru ama "en değerli" ve "her sistem" ölçülmemiş.

5. **SFT hattının veri bağımlılığı raporun en büyük uygulama boşluğu.** 1.549 etiketli CN-verbatim çifti, 10 tescilli VOC çalışması. StartupHunt'ın elinde bu yok; "fine-tuned LLM" önerisi, etiketsiz veriyle "prompt + LLM" önerisine dönüşür ve o zaman 2503.01870'in kanıtı (SFT) değil, "Base LLM yetersiz" bulgusu geçerli olur. Rapor bu ayrımı yapmıyor.

6. **Fiyatlar doğru, ama Gemini 2.5 Flash-Lite 20.10.2026'da emekliye ayrıldı.** Raporun maliyet örneği, önerdiği modelin ömrünü bir gün kaçırıyor. GPT-5-nano hâlâ geçerli; batch aritmetiği doğru.

7. **LLM fikir üretimi kanıtı, raporun önerisini destekler ama sınırlar.** Doshi & Hauser ve Si et al., LLM'in novelty'yi artırdığını ama diversity'yi azalttığını/feasibility'yi garanti etmediğini gösteriyor. StartupHunt LLM'i "fikir üretici" değil "ön-işlemeci/etiketleyici" olarak tuttuğu sürece bu risk sınırlı; ama preprocessing kümeleme girdisini değiştirdiği için "yalnız yorum katmanı" ilkesi savunulabilir değil. Raporun 1. önerisi, bu ilkeyi fiilen değiştiriyor.

8. **"Pain point → ödeme" kanıtı gerçekten yok.** Raporun bu boşluğu kabul etmesi doğru; ama LLM-mined pain point'lerin satın almayı öngördüğüne dair en ufak bir korelasyonel kanıt da yok. En yakın kanıt, LLM duygu çıkarımının rating üzerinden satın alma ile ilişkisi (Ludwig) ve insan pain-point okumasının satışla ilişkisi (Wacoal, n=2). Bu, "ask" aşamasının zorunluluğunu güçlendirir.

9. **Atıf sayıları veritabanına göre değişiyor.** TH2019: S2 451 / DOI 992; AR-Miner: S2 554 / OpenAlex 398 / ACM 527. Raporun "500+" ve "780+" sayıları tek kaynakla doğrulanamıyor; sayı vermek yerine "yüksek atıflı" demek veya erişim tarihli kaynak belirtmek daha doğru.

---

## Boşluklar

- **TH2019'un dergi sürümü ile working paper arasındaki fark:** 40%→80% alıntısını Haziran 2018 working paper'da doğruladım; Marketing Science 38(1) sürümünde birebir aynı olup olmadığını kontrol etmedim (ücretli/erişim kısıtlı). Alıntının kaynağı çalışma metni olarak belirtilmeli.
- **2503.01870'in hakem değerlendirmesi:** arXiv preprint; hangi dergide/konferansta yayımlandığı doğrulanamadı. Rapor "arXiv 2026" diyor, bu doğru; ancak "peer-reviewed" iması yok.
- **"SOTA" modelin kimliği:** ACL 2026 long 680'de jenerik "SOTA" deniyor; rapordaki "SOTA üretici model" ifadesi bu yüzden belirsiz.
- **LLM-mined pain point → purchase:** Doğrudan çalışma bulunamadı. Wacoal vakası insan okuması; Ludwig duygu (pain point değil); Boughanmi rating (purchase değil). Bu, raporun "literatürde yok" iddiasını destekler ama "LLM pain point satın almayı öngörür" yönünde bir kanıt olmadığını da netleştirir.
- **ACL 2026 survey'in "üç rol" iddiası:** Survey'in kendi metninde "üç onaylanmış rol" ifadesi yok; bu raporun sentezi. Daha güvenli ifade: "survey, LLM-Assisted TM'yi preprocessing / embeddings / post-hoc refinement olarak üçe ayırıyor."
- **"MIT özetine göre" atfı:** %100 primary/secondary sayısını doğrudan makalede doğruladım; MIT Sloan özetinin bu cümleyi birebir içerip içermediğini kontrol etmedim. Sayı doğru, atıf kaynağı belirsiz.
- **Gemini 2.5 Flash-Lite'ın tam EOL durumu:** Google Cloud doc "retired October 20th, 2026" diyor; Gemini API doc hâlâ fiyat listeliyor ama yeni projeler için erişimi sınırlıyor. İki doküman arasında tam tutarlılık yok; raporda "hâlâ geçerli" denmemeli.
