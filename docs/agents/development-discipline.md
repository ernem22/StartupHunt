# Geliştirme disiplini

Kaynak: ADR 0003. Radar kişisel ve tek kullanıcılıdır.

## Tek soru ve ölüm kriteri

- **Soru:** Aday havuzu için tek komutla, ivme + gelir kanıtı + TR durumu taşıyan ve her iddiası kaynağıyla doğrulanabilen bir liste üretebiliyor muyum?
- **Ölüm kriteri:** 3 hafta sonunda listeden rastgele 10 kartın iddiaları kaynağında elle kontrol edilir. 8'in altı doğruysa kaynak ya da yöntem değişir. Eşik veriye bakınca değiştirilmez.

## Dilim kuralları

1. Dilim 3-5 gün sürer. Süre dolunca "ne öğrendim" notu yazılır: devam, daralt, yöntemi değiştir ya da durdur.
2. Dilim 1'de en fazla 4 kaynak: HN Algolia, GitHub Search, `stargazers/history`, Hugging Face `trendingScore`. Yeni kaynak, dilim çıktısı güvenilir bulunmadan eklenmez.
3. İvme basit başlar: haftadan haftaya artış oranı. Gürültülü çıkarsa log dönüşümü, median/MAD ve ≥3 ardışık hafta kalıcılığı sonra eklenir.
4. Spec en fazla bir sayfa ve yalnızca sıradaki dilim için. Önceki dilim çıktı vermeden yeni dış rapor ya da denetim başlamaz.
5. Dilim yarım bırakılmaz: ya biter ya da ticket'a not düşülüp dal silinir.

## Kaynak ve kanıt

- **Kaynak aileleri ayrıdır.** HN, Product Hunt ve X aynı ilgiyi üç kez ölçebilir (aday üretici). GitHub, npm, Wikipedia ve Firefox AMO doğrulayıcıdır. İki kaynak yalnızca farklı ailelerdense bağımsız sayılır.
- **Her dış iddia kanıt etiketi taşır:** doğrulandı, ikincil, doğrulanmadı. Doğrulanmamış iddia karara girmez.
- **Gerçek istek testi.** Dış kaynak "çalışıyor" demeden önce gerçek isteği denenir; DB, embed ve SearXNG doğrulaması 3060'ta yapılır, koşulmayan iş PR'da "doğrulanamadı" yazılır.
- **Aday havuzu listesi.** Her satır: ürün türü, trend kaynakları, gelir kaynakları, lisans notu.
- **Lisans.** Radar kişisel olduğu sürece Product Hunt ve Cloudflare Radar sorun değildir; ticari kullanıma geçilirse yeniden değerlendirilir. Kazıma yok; marka, logo ve kod kopyalanmaz. TrustMRR verisi yazılı izin gelmeden LLM'e verilmez.

## Değişiklik nasıl kararlaştırılır

| Tür | Örnek | Karar | Kayıt |
| --- | --- | --- | --- |
| Küçük: tek ticket, geri alınabilir | adapter düzeltmesi, eşik | Hemen uygula | Commit + kısa LOG satırı |
| Orta: dilim kapsamını etkiler | kaynak ekle/çıkar | Bir akşam bekle | Ticket notu + PR açıklaması |
| Büyük: hedef, mimari, ADR | yönü değiştirmek | En az bir gün bekle, karşı argümanı yaz | ADR + spec; açık ticket'lar `needs-triage`'a döner |

**Değişiklik notu** dört cümledir: ne oldu, neyi öğrendim, hangi yolu seçtim, ne kaybediyorum. Yön değişikliği bu not olmadan `ready-for-agent` almaz.

## Sürüm ve tekrarlanabilirlik

- Her koşu kaynak, parametre, tohum ve commit hash'ini `stage_runs` tablosuna yazar. Ham gözlemler değiştirilemez.
- Python bağımlılıkları kilit dosyasıyla sabitlenir.
- "Update branch" sonrası `git diff` bakılır; dal yerelde rebase edilir.
- LOG girişi PR başına bir tane, en fazla 8 satır.
- SemVer `0.x`; etiket yalnızca dışarı gösterilen sürümlerde: `v0.2.0` = dilim 1 listesi.

## Kırmızı bayraklar

Biri 3 gün sürerse dur: LOG'da "sonraki adım" aynı kalıyor; çalışan çıktı yokken yeni araştırma notu; tek kaynak için bile ivme çıktısı yokken kaynak sayısı artıyor; `pnpm check` kırmızı ve ilgisiz işle uğraşılıyor.
