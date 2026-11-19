# StartupHunt

Küresel olarak yükselen ürünleri, gelir kanıtı ve Türkiye boşluğuyla listeleyen, kişisel kullanımlı tek bağlamlı trend radarı. Listeyi okuyup ürün yapıp yapmayacağına kullanıcı karar verir.

## Language

**Candidate (aday ürün)**:
Yükselen ya da gelir kanıtı olan, listeye giren tek bir ürün.
_Avoid_: Fırsat, fikir, trend

**Momentum (ivme)**:
Bir ürüne gösterilen ilginin dönemden döneme artış hızı; mutlak popülerlik değildir.
_Avoid_: Popülerlik, trend, Rising

**Revenue evidence (gelir kanıtı)**:
Bir adayın para kazandığını gösteren, kaynağı ve kanıt etiketiyle (doğrulandı, ikincil, doğrulanmadı) tutulan bulgu; bulgu yoksa "yok" diye kaydedilir.
_Avoid_: Gelir, MRR

**TR gap (TR boşluğu)**:
Küresel bir adayın Türkiye'de muadilinin bulunamadığı durum; "yok" iddiası değildir ve son hükmü kullanıcı verir.
_Avoid_: TR'de yok, boşluk

**Candidate pool (aday havuzu)**:
Radarın baktığı ürün türlerinin ve kaynaklarının açıkça listelenen, zamanla genişleyen kümesi; sabit değildir.
_Avoid_: Kapsam, korpus

### Legacy: dondurulmuş fırsat motoru hattı

Aşağıdaki terimler 29 Ekim öncesi topluluk metni hattını anlatır; kod donduruldu, silinmedi.

**Observation**:
Tek bir kaynaktan gelen, değiştirilemez ham metin kaydı.
_Avoid_: Post, item, kayıt

**Pattern**:
Kümelemenin ürettiği kalıcı konu kimliği; fırsat değildir ve tek başına yüzeye çıkmaz.
_Avoid_: Cluster, topic, tema

**Opportunity (fırsat)**:
İsimlendirilmiş bir aktörün belirli bir işinde gözlenmiş bir problemi, workaround'u veya harcamayı kanıtla birleştiren aday.
_Avoid_: Idea, insight, fikir

**Evidence (kanıt)**:
Bir fırsatı destekleyen; alıntı, kaynak bağlantısı ve tarih taşıyan observation türevi.
_Avoid_: Sinyal, veri noktası

**Signal**:
Kapıyı geçemeyen adayın, düşme gerekçesi ve bağımsız kaynak sayısıyla birlikte arşivde kalan hâli.
_Avoid_: Noise, çöp, red

**Independent source (bağımsız kaynak)**:
Farklı thread, farklı yazar ve farklı metinle temsil edilen kaynak; aynı thread'in yorumları veya aynı yazarın tekrarı tek kaynak sayılır.
_Avoid_: Kaynak sayısı, URL sayısı

**Known profile (bilinen profil)**:
Kullanıcının yerel dokümanlarından türetilen, kartın kullanıcı için ne kadar yeni olduğunu tahmin eden prior.
_Avoid_: Kişisel model, ilgi profili

**Likely new / uncertain / likely known**:
Kartın bilinen profile göre yenilik tahmini; sıralamayı etkiler, kartı elemez.
_Avoid_: Skor, relevance

**Digest**:
Bir haftanın nitelikli fırsat kartlarından oluşan, kotasız okuma kuyruğu; boş olabilir.
_Avoid_: Rapor, feed, bülten

**Feedback event**:
Kullanıcının bir karta verdiği `open`, `investigate`, `drop` veya `knew` kaydı; kanıtı silmez.
_Avoid_: Etiket, oy, rating

**review_status / BU**:
İnsanın pattern için verdiği inceleme durumu ve "bakmaya değer" onayı; otomasyon bu alanı yazamaz.
_Avoid_: Otomatik onay, skor

**Rising**:
Önceki döneme göre patlama gösteren topluluk metni sinyali; kademeden bağımsız bir tetikleyicidir, filtre değildir. Ürün ivmesi için bu terim değil Momentum kullanılır.
_Avoid_: Trend, popüler
