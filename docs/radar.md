# GitHub radar — #78

`pnpm radar` Markdown yazar. Önce `db/schema.sql` mevcut DB'ye de uygulanır; `DATABASE_URL` ve isteğe bağlı `GITHUB_TOKEN` süreç ortamından verilir. Radar `.env` yüklemez. PostgreSQL erişimi zorunludur; başarılı çıktı ancak snapshot transaction'ı tamamlanınca yazılır.

## Aday havuzu

Çalışan liste: `src/radar/github.ts` içindeki `candidatePool`.

| Ürün türü | Trend kaynakları | Gelir kaynakları | Lisans notu |
| --- | --- | --- | --- |
| Geliştirici aracı | GitHub Search, GitHub stargazers/history | Yok (bu dilimde aranmaz) | Kişisel kullanım; her repo lisansı ayrıca incelenir, kod ve marka kopyalanmaz. |

`topic:developer-tools archived:false fork:false` sorgusunun güncellenme sırasındaki ilk 30 reposu keşif örneklemidir; ürün niteliği elle incelenir. Bu liste tüm GitHub'ın en hızlı 20 ürünü değildir. Örneklem içinde son iki tamamlanmış haftanın yıldız artış oranıyla ilk 20 seçilir; yeterli veri yoksa 20'den az olabilir. Negatif oranlar korunur. Önceki hafta sıfırsa oran tanımsızdır ve aday sıralamaya girmez; snapshot yine saklanır. Eşit oranlar repo adıyla sıralanır. JSON çıktısı eklenmedi (isteğe bağlı).

Son dört tamamlanmış UTC haftası kullanılır (Pazar başlangıcı); devam eden hafta karşılaştırılmaz. Eksik hafta sıfıra çevrilmez: dört haftası tamamlanmayan repo uyarıyla dışlanır. Search eksik sonuç döndürürse, history biçimi bozuksa veya HTTP/rate-limit hatası varsa koşu başarısız olur; kısmi liste yayımlanmaz. Yeniden deneme kullanıcıya bırakılır.

Her koşu kaynak, sorgu/havuz, örneklem sınırı, zaman, tohum (rastgelelik yok: 0), commit hash ve durumunu `stage_runs` içine yazar. DB bağlantısı kurulamazsa manifest yazılamaz ve komut başarısız olur. `metric_snapshots`: `entity_type=github_repo`, `entity_id=repo URL`, `metric=weekly_new_stars`, `captured_at=hafta başlangıcı`. Tekrarlanan koşular ayrı snapshot kayıtları bırakır; haftalık değerler toplanmamalıdır.

Ad ve açıklama repo sahibinin beyanıdır (**ikincil**); haftalık yıldızlardan hesaplanan ivme **doğrulandı** olarak sunulur. Gelir kanıtı “yok” **doğrulanmadı (aranmadı)** yer tutucudur; bu alandaki repo URL'si kontrol edilecek adayın referansıdır, gelir kanıtı değildir.

## TR durumu (Apple TR, #83)

Her kart için Apple TR kataloğunda (`iTunes Search`, `country=tr`, `entity=software`, en fazla 5 sonuç) muadil aranır. Sorgular deterministiktir: repo adı (tire/nokta boşluğa çevrilir) ve açıklamadaki anlamlı ilk beş kelime; en fazla iki sorgu denenir ve hepsi kartta yazılır. Bir sonuç, sorgudaki tüm anlamlı kelimeler uygulama adında geçtiğinde “bulundu” sayılır (isim ve URL kartta). Bu bir aday eşleşmesidir, aynı ürün kanıtı değildir; **ikincil** etiketlenir. İstekler aynı katalog örneğinde en az 1 saniye arayla atılır; iTunes'ın gerçek dakika sınırı doğrulanmadı.

- **bulundu:** Apple TR'de adı eşleşen aday uygulama var; isim ve URL taşır. **İkincil** (aday eşleşme, kullanıcı doğrulamalı); aynı ürün kanıtı değildir.
- **bulunamadı:** Denenen sorgularda sonuç yok. “Yok” iddiası değildir; yalnız bu sorgular ve katalog içindir.
- **belirsiz:** Katalog ulaşılamaz, yanıt bozuk ya da sorgu üretilemez; komut hata vermez.

Liste sonunda **TR boşluğu görünümü** aynı adayları sıralar: `bulunamadı` önde, sonra `belirsiz`, sonra `bulundu`. Son hüküm kullanıcıdadır. TR araması `stage_runs.parameters.trCatalog` alanına katalog adı olarak yazılır.

**Doğrulandı (2026-11-21):** tokensız gerçek isteklerde [GitHub Search](https://api.github.com/search/repositories?q=topic%3Adeveloper-tools+archived%3Afalse+fork%3Afalse&sort=updated&order=desc&per_page=30) HTTP 200 (`total_count=93559`, `incomplete_results=false`); [vscode history](https://api.github.com/repos/microsoft/vscode/stargazers/history?per_page=5) HTTP 200, beş haftalık nesne. **Doğrulandı (doküman):** [GitHub REST referansı](https://docs.github.com/en/rest/activity/starring#get-repository-star-history) history alanlarını ve uç noktayı tanımlar. Bunlar DB uçtan uca doğrulaması değildir.

**Doğrulandı (2026-11-21):** [Apple iTunes Search](https://itunes.apple.com/search?term=github&country=tr&entity=software&limit=5) HTTP 200, `resultCount=5`; ilk sonuç `GitHub` (`https://apps.apple.com/tr/app/github/id1477376905`). `term=zzzqqqnonexistenttool` HTTP 200, `resultCount=0`. `term=vscode` HTTP 200, `resultCount=5` ama ilk sonuç `Claude by Anthropic`; bu yüzden sonuç sayısı tek başına “bulundu” sayılmaz, ad eşleşmesi aranır.

**Doğrulanmadı:** DB bağlantısı, şema uygulaması ve gerçek `pnpm radar` çıktısının PostgreSQL'e yazılması bu makinede doğrulanamadı (3060'ta koşulacak). 3060'ta şemayı uygula, `pnpm radar` çalıştır, son `stage_runs` manifestini ve repo başına dört `metric_snapshots` kaydını karşılaştır. Gelir araması ve diğer kaynaklar #78 kapsamı dışındadır.
