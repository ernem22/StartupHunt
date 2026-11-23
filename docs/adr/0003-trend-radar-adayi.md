# Trend radar: aday ürün, gelir kanıtı ve TR boşluğu

## Status

accepted

## Context

29 Ekim'de hedef "fırsat motoru"ndan "fast follower trend radar"a döndü; amaç hızlı ürün çıkarmak, ağır analiz değil. Eski hat topluluk metninden, isimlendirilmiş aktör ve alıntıyla fırsat çıkarıyordu (ADR 0001, 0002). Yeni hat ürün düzeyinde çalışır ve bu kuralları uygulamaz. Radar tek kullanıcılıdır ve ticari yüzü yoktur; ürünleri kullanıcı kendisi yapar.

## Decision

Radar küresel olarak yükselen **aday ürünleri** (`GLOSSARY.md`) listeler. Her satır ivme, gelir kanıtı ve TR durumunu, kaynak URL, tarih ve kanıt etiketiyle (doğrulandı, ikincil, doğrulanmadı) taşır. Listeye bakıp ürün yapıp yapmayacağına kullanıcı karar verir; sistem skor ya da geri bildirim ölçüsü üretmez.

- **Kalite = veri ve yöntem doğruluğu.** Her kaynak için önce gerçek istek testi; listeden örnek elle kontrol.
- **Gelir kanıtı çok kaynaklı çapraz kontroldür**, ürün türüne göre kaynak eklenir. Kanıt yoksa "yok" yazılır.
- **TR boşluğu "yok" iddiası değildir.** Çıktı: bulundu, bulunamadı (denenen sorgular ve kataloglarla) ya da belirsiz. Aramada Apple TR ve Play TR katalogları kullanılır (web araması kanalı M3'te seçilir; bkz. `docs/plan-trend-idea-stream.md`); son hüküm kullanıcıdadır. TR boşluğu aynı aday havuzunda ayrı bir görünümdür.
- **Aday havuzu açık bir listedir** (ürün türü, trend kaynakları, gelir kaynakları, lisans notu). Alan tek türle sınırlı değildir; geliştirici aracı ve yapay zekâ yalnızca ilk kaynak setidir (plan M1 yeni kaynak ekler).
- Şikâyet, "alternative to X" ve fiyat itirazı çıkarıcı dilim 2'dir.
- Eski kümeleme/review/fırsat motoru kodu ve ADR 0001-0002 M0'da silindi (bkz. ADR 0004).

## Considered Options

| Seçenek | Durum |
| --- | --- |
| Gelir odaklı ana yön ("para nerede akıyor", TrustMRR kalibrasyon seti) | Park edildi. Gelir yalnızca aday doğrulayıcıdır. TrustMRR yazılı izin gelmeden LLM'e verilmez. |
| BusinessIdeasDB | Reddedildi: paralı. |

## Consequences

- Eski fırsat kapısı ve digest bu hatta uygulanmaz; terimleri `GLOSSARY.md` "Legacy" bölümünde durur.
- Kişisel kullanım şartı: çok kullanıcı, faturalama ve dışa açık arayüz kapsam dışıdır. Ticari kullanıma geçilirse kaynak lisansları (ör. Product Hunt, Cloudflare Radar) yeniden değerlendirilir.
- Yeni bir ürün türü ya da kaynak eklemek aday havuzu listesini ve kaynak lisans notunu günceller.
- Reddit yalnız arşivdir (Arctic Shift); canlı sinyal değildir.
