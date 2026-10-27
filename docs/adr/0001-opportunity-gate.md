# Fırsat kapısı ve kotasız digest

## Status

accepted

## Context

Kümeleme "ne konuşuluyor" sorusunu cevaplıyordu; istenen "neye bakmaya değer". Aynı thread'in iki yorumu veya aynı yazarın tekrarı sahte bir tekrar sinyali üretiyor, tek kaynaklı adaylar ise ya gürültüye karışıyor ya da kullanıcıyı yanıltıyordu.

## Decision

Bir aday ancak şu koşulların tümüyle opportunity olur: isimlendirilmiş aktör, spesifik iş/problem, gözlenmiş workaround veya harcama, verbatim quote + kaynak URL + tarih, somut sonraki adım ve en az iki bağımsız kaynak. Tek kaynak yalnızca `nextStepMinutes <= 15` olan somut bir sonraki adımla geçebilir.

Bağımsızlık; thread (`metadata.thread_url`, yoksa `parent_story_id`, `video_id`, `source_url`), yazar ve yakın metin (token Jaccard >= 0.9) ilişkilerinin birleşimiyle hesaplanır. Aynı thread'in yorumları ve aynı yazarın tekrarı tek kaynak sayılır.

Kapıyı geçemeyen adaylar silinmez: `opportunity_signals` içinde gerekçe, bağımsız kaynak sayısı ve çıkarım taslağıyla saklanır; digest'te hiçbir koşulda görünmez. Digest kotasızdır: en fazla 10 kart, 0 kart geçerlidir; C/rising/D ile doldurulmaz. Karşı argümanı daha güçlü olan aday düşer. `review_status`/BU yalnızca insan tarafından yazılır.

## Consequences

- Tek bir güçlü thread "fırsat" gibi görünemez; gerçek tekrar farklı yazar/thread ister.
- Reddedilen adaylar kaybolmaz; gerekçeleri sonradan denetlenebilir.
- Kullanıcı boş bir hafta görmeyi kabul eder; sistem kart üretmek için eşiği düşürmez.
- Yeni bir kanıt alanı eklemek kapı, şema ve testleri birlikte değiştirir.
