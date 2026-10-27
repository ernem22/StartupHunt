# Coding Standards

Review'da judgement-call için okunur; mekanik kontroller `pnpm check` ile CI ve pre-commit'te koşar.

1. **Türetilmiş alan tek kaynakta.** Aynı bilgiyi iki kolonda veya iki çıktı alanında tekrar etme; türetilmiş değeri kaynağından üret. Gerekçe: iki kopya sessizce birbirinden ayrışır.
2. **Testler dış davranışı doğrular.** Testler `test/`, fixture'lar `test/fixtures/` altında; iç fonksiyon veya SQL detayı yerine CLI/digest çıktısını doğrula. Gerekçe: iç yapı değişince davranış testleri ayakta kalır.
3. **Tüketicisiz alan yok.** Bir kolon/alan ancak onu okuyan tüketici aynı PR'da geliyorsa eklenir; gelecek ticket için boş alan bırakma. Gerekçe: kullanılmayan alan şema ve zihinsel yükü büyütür.
4. **Kanıt sessizce silinmez.** Kapıyı geçemeyen aday `signal` olarak gerekçesiyle arşivlenir; yalnızca digest'ten gizlenir. Gerekçe: sonradan denetim ve geri dönüş mümkün kalmalı.
5. **Otomasyon onay yazamaz.** LLM ve kurallı katman `review_status`/BU yazmaz; bu alanlar yalnızca insan kararıdır. Gerekçe: çıkarım hatası insan onayına dönüşmemeli.
6. **Veri yolu replayable olmalı.** Aynı girdi ve parametreler aynı çıktıyı vermeli; rastgelelik tohumlanmalı ve manifestte kaydedilmeli. Gerekçe: iki haftanın digest'i ancak böyle karşılaştırılır.
7. **Sıralama açıklanabilir olmalı.** Skor/ağırlık yerine kanıt ve bilinen-profil prior'ı kullan; her kart sıralama gerekçesini taşısın. Gerekçe: kullanıcı neden bu kartı gördüğünü sorgulayabilmeli.
