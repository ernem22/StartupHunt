# StartupHunt

Topluluk metninden kişisel kullanım için araştırmaya değer fırsatlar çıkaran tek bağlamlı motor.

## Language

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
Önceki döneme göre patlama gösteren sinyal; kademeden bağımsız bir tetikleyicidir, filtre değildir.
_Avoid_: Trend, popüler
